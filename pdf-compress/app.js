/* PDF 용량 줄이기 (KB 맞추기) — 모든 처리는 브라우저 안에서. 각 페이지를 이미지로 만들어 JPEG로 압축한 뒤 PDF로 다시 묶는다. */
(function () {
  'use strict';

  var KB = 1000;                  // 1KB = 1,000바이트 (접수처 기준이 1,000이든 1,024든 넘지 않도록)
  var MAX_PAGES = 60;             // 브라우저 메모리를 지키기 위한 한도
  var PIXEL_BUDGET = 50e6;        // 한 파일의 모든 페이지를 합친 최대 렌더링 픽셀
  var PR = window.PR || { t: {} };
  var T = PR.t;
  function tr(k, v) {
    var s = T[k] || k;
    if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]);
    return s;
  }
  var $ = function (id) { return document.getElementById(id); };
  var el = {
    drop: $('dropzone'), input: $('file-input'), msg: $('msg'), listSec: $('file-list-section'), list: $('file-list'), total: $('file-list-total'),
    kbCustom: $('kb-custom'), kbCustomWrap: $('kb-custom-wrap'), summary: $('summary'), btn: $('convert-btn'), label: $('convert-label'),
    overlay: $('processing-overlay'), fill: $('processing-fill'), pname: $('processing-file-name'), ptitle: $('processing-title'),
    resSec: $('results-section'), resList: $('results-list'), zip: $('download-all-btn'), dzTitle: $('dz-title')
  };
  var files = [];     // {id, file}
  var results = [];
  var seq = 0, busy = false;

  function radio(n) { var r = document.querySelector('input[name="' + n + '"]:checked'); return r ? r.value : ''; }
  function setRadio(n, v) { var r = document.querySelector('input[name="' + n + '"][value="' + v + '"]'); if (r) { r.checked = true; return true; } return false; }
  function fmtSize(b) { return b >= 1e6 ? (b / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'MB' : Math.max(1, Math.round(b / KB)) + 'KB'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function showMsg(t) { el.msg.textContent = t || ''; el.msg.style.display = t ? 'block' : 'none'; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function target() {
    var v = radio('kb');
    if (v === 'custom') { var n = parseFloat(el.kbCustom.value); return n > 0 ? Math.round(n * KB) : 0; }
    return (parseInt(v, 10) || 0) * KB;
  }

  /* ---------- 목록 ---------- */
  function addFiles(list) {
    showMsg('');
    var bad = 0;
    Array.prototype.forEach.call(list, function (f) {
      if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) files.push({ id: ++seq, file: f }); else bad++;
    });
    if (bad) showMsg(tr('msg_bad', { n: bad }));
    renderList(); updateBtn();
  }
  function renderList() {
    el.listSec.style.display = files.length ? '' : 'none';
    el.drop.classList.toggle('compact', files.length > 0);
    el.dzTitle.textContent = files.length ? tr('dz_more') : tr('dz_title');
    el.list.innerHTML = '';
    files.forEach(function (it) {
      var row = document.createElement('div');
      row.className = 'file-item'; row.setAttribute('role', 'listitem');
      row.innerHTML = '<div class="pdf-ico" aria-hidden="true">PDF</div><div class="file-item-info"><div class="file-item-name"></div><div class="file-item-size"></div></div>' +
        '<button type="button" class="file-item-remove" aria-label="' + esc(tr('remove')) + '">✕</button>';
      row.querySelector('.file-item-name').textContent = it.file.name;
      row.querySelector('.file-item-size').textContent = fmtSize(it.file.size);
      row.querySelector('button').addEventListener('click', function () {
        files = files.filter(function (x) { return x.id !== it.id; }); renderList(); updateBtn();
      });
      el.list.appendChild(row);
    });
    var sum = files.reduce(function (a, b) { return a + b.file.size; }, 0);
    el.total.textContent = files.length ? tr('list_total', { n: files.length, size: fmtSize(sum) }) : '';
  }
  function updateBtn() {
    el.btn.disabled = busy || !files.length || !target();
    el.label.textContent = !files.length ? tr('btn_empty') : (!target() ? tr('btn_need_kb') : (files.length > 1 ? tr('btn_many', { n: files.length }) : tr('btn_one')));
  }
  function updateSummary() {
    var t = target();
    el.summary.innerHTML = '<b>' + esc(tr('sum_label')) + '</b><span></span><span></span>';
    var sp = el.summary.querySelectorAll('span');
    sp[0].textContent = t ? tr('sum_kb', { kb: fmtSize(t) }) : tr('sum_kb_none');
    sp[1].textContent = radio('color') === 'gray' ? tr('sum_gray') : tr('sum_color');
  }

  /* ---------- PDF → 페이지 이미지 ---------- */
  function mk(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
  function toBlob(c, q) { return new Promise(function (r) { c.toBlob(r, 'image/jpeg', q); }); }

  async function renderPages(file, gray, onPage) {
    var buf = await file.arrayBuffer();
    var pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    if (pdf.numPages > MAX_PAGES) { var e = new Error('pages'); e.code = 'pages'; e.n = pdf.numPages; throw e; }
    var sizes = [], areaAt1 = 0, i;
    for (i = 1; i <= pdf.numPages; i++) {
      var pg = await pdf.getPage(i), vp = pg.getViewport({ scale: 1 });
      sizes.push({ w: vp.width, h: vp.height }); areaAt1 += vp.width * vp.height;
    }
    var s0 = Math.min(2, Math.sqrt(PIXEL_BUDGET / areaAt1));   // 기준 해상도 (약 144dpi, 페이지가 많으면 낮춤)
    var pages = [];
    for (i = 1; i <= pdf.numPages; i++) {
      var page = await pdf.getPage(i), vp2 = page.getViewport({ scale: s0 });
      var c = mk(vp2.width, vp2.height), ctx = c.getContext('2d', { willReadFrequently: gray });
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: ctx, viewport: vp2 }).promise;
      if (gray) {
        var d = ctx.getImageData(0, 0, c.width, c.height), px = d.data;
        for (var k = 0; k < px.length; k += 4) { var g = (px[k] * 0.299 + px[k + 1] * 0.587 + px[k + 2] * 0.114) | 0; px[k] = px[k + 1] = px[k + 2] = g; }
        ctx.putImageData(d, 0, 0);
      }
      pages.push({ canvas: c, wpt: sizes[i - 1].w, hpt: sizes[i - 1].h });
      onPage(i, pdf.numPages);
      await sleep(0);
    }
    pdf.destroy();
    return pages;
  }

  function scaled(canvas, f) {   // 크게 줄일 때는 반씩 줄여 계단 현상을 막음
    var w = Math.max(1, Math.round(canvas.width * f)), h = Math.max(1, Math.round(canvas.height * f)), src = canvas;
    while (src.width / 2 >= w && src.height / 2 >= h) {
      var t = mk(Math.max(w, src.width / 2), Math.max(h, src.height / 2)), tc = t.getContext('2d');
      tc.imageSmoothingQuality = 'high'; tc.drawImage(src, 0, 0, t.width, t.height); src = t;
    }
    if (src.width === w && src.height === h) return src;
    var o = mk(w, h), oc = o.getContext('2d'); oc.imageSmoothingQuality = 'high'; oc.drawImage(src, 0, 0, w, h);
    return o;
  }
  async function encodeAll(pages, f, q) {
    var out = [], total = 0;
    for (var i = 0; i < pages.length; i++) {
      var blob = await toBlob(scaled(pages[i].canvas, f), q), u8 = new Uint8Array(await blob.arrayBuffer());
      out.push(u8); total += u8.length;
    }
    return { jpgs: out, size: total + 1200 * pages.length + 3000 };    // PDF 구조 몫을 더해 추정
  }
  async function buildPdf(pages, jpgs) {
    var doc = await PDFLib.PDFDocument.create();
    for (var i = 0; i < pages.length; i++) {
      var img = await doc.embedJpg(jpgs[i]), pg = doc.addPage([pages[i].wpt, pages[i].hpt]);
      pg.drawImage(img, { x: 0, y: 0, width: pages[i].wpt, height: pages[i].hpt });
    }
    doc.setProducer('Haebom'); doc.setCreator('Haebom');
    return new Blob([await doc.save({ useObjectStreams: true })], { type: 'application/pdf' });
  }

  // 목표 용량 이하가 되는 가장 높은 화질을 찾음: 화질을 이분 탐색하고, 부족하면 해상도를 줄임
  async function fit(pages, tgt, onStep) {
    var Q_MIN = 0.4, f = 1, best = null;
    for (var step = 0; step < 9; step++) {
      onStep(step);
      var hi = await encodeAll(pages, f, 0.85);
      if (hi.size <= tgt) { var ok = hi, a = 0.85, b = 0.95; for (var i = 0; i < 3; i++) { var m = (a + b) / 2, r = await encodeAll(pages, f, m); if (r.size <= tgt) { ok = r; a = m; } else b = m; } return { r: ok, f: f, met: true }; }
      var lo = await encodeAll(pages, f, Q_MIN);
      if (!best || lo.size < best.r.size) best = { r: lo, f: f, met: false };
      if (lo.size <= tgt) {
        var a2 = Q_MIN, b2 = 0.85, ok2 = lo;
        for (var j = 0; j < 5; j++) { var m2 = (a2 + b2) / 2, r2 = await encodeAll(pages, f, m2); if (r2.size <= tgt) { ok2 = r2; a2 = m2; } else b2 = m2; }
        return { r: ok2, f: f, met: true };
      }
      if (pages[0].canvas.width * f < 260) break;
      f *= Math.max(0.5, Math.sqrt(tgt / lo.size)) * 0.95;
    }
    return best;
  }

  async function compressOne(it, tgt, gray, ui) {
    var file = it.file;
    if (file.size <= tgt) return { blob: file, met: true, kept: true, pages: 0 };
    ui.stage(tr('st_read'));
    var pages = await renderPages(file, gray, function (i, n) { ui.stage(tr('st_page', { i: i, n: n })); });
    ui.stage(tr('st_fit'));
    var res = await fit(pages, tgt, function () { ui.stage(tr('st_fit')); });
    var pdf = await buildPdf(pages, res.r.jpgs);
    // 추정과 실제가 다를 수 있어, 넘으면 화질을 조금씩 낮춰 다시 묶음
    var guard = 0, f = res.f;
    while (pdf.size > tgt && guard < 4) {
      guard++; f *= 0.92;
      var again = await encodeAll(pages, f, 0.6);
      pdf = await buildPdf(pages, again.jpgs);
    }
    var thumb = scaled(pages[0].canvas, Math.min(1, 96 / pages[0].canvas.width)).toDataURL('image/jpeg', 0.7);
    return { blob: pdf, met: pdf.size <= tgt, kept: false, pages: pages.length, thumb: thumb };
  }

  async function run() {
    if (busy || !files.length) return;
    var tgt = target(); if (!tgt) return;
    var gray = radio('color') === 'gray';
    busy = true; updateBtn();
    results.forEach(function (r) { r.url && URL.revokeObjectURL(r.url); });
    results = []; el.resList.innerHTML = '';
    el.overlay.classList.add('active'); el.fill.style.width = '0%';
    var errMsg = '';
    for (var i = 0; i < files.length; i++) {
      var it = files[i];
      el.ptitle.textContent = tr('processing');
      var ui = { stage: function (t) { el.pname.textContent = it.file.name + ' (' + (i + 1) + '/' + files.length + ') · ' + t; } };
      ui.stage(tr('st_read'));
      await sleep(30);
      try {
        var r = await compressOne(it, tgt, gray, ui);
        results.push({ name: r.kept ? it.file.name : it.file.name.replace(/\.pdf$/i, '') + '_' + fmtSize(tgt) + '.pdf', blob: r.blob, orig: it.file.size, met: r.met, kept: r.kept, pages: r.pages, thumb: r.thumb, target: tgt, url: URL.createObjectURL(r.blob) });
      } catch (e) {
        errMsg = (e && e.code === 'pages') ? tr('err_pages', { name: it.file.name, max: MAX_PAGES, n: e.n }) : tr('err_open', { name: it.file.name });
      }
      el.fill.style.width = Math.round(((i + 1) / files.length) * 100) + '%';
    }
    el.overlay.classList.remove('active');
    busy = false; updateBtn(); showMsg(errMsg); renderResults();
  }

  function renderResults() {
    if (!results.length) { el.resSec.classList.remove('active'); return; }
    el.resSec.classList.add('active'); el.resList.innerHTML = '';
    results.forEach(function (r) {
      var pct = Math.round((1 - r.blob.size / r.orig) * 100), d = document.createElement('div');
      d.className = 'result-item'; d.setAttribute('role', 'listitem');
      var status = r.kept ? '<div class="result-status ok">' + esc(tr('kept')) + '</div>'
        : r.met ? '<div class="result-status ok">' + esc(tr('ok_target', { kb: fmtSize(r.target) })) + '</div>'
          : '<div class="result-status warn">' + esc(tr('warn_res', { kb: fmtSize(r.target) })) + '</div>';
      d.innerHTML = '<div class="result-item-top"><div class="result-preview-wrap">' + (r.thumb ? '<img class="result-preview" alt="">' : '<div class="pdf-ico big" aria-hidden="true">PDF</div>') + '</div>' +
        '<div class="result-item-info"><div class="result-item-name"></div>' +
        '<div class="size-comparison"><span class="size-original">' + fmtSize(r.orig) + '</span><span class="size-arrow">→</span><span class="size-compressed">' + fmtSize(r.blob.size) + '</span>' +
        (pct > 0 && !r.kept ? '<span class="size-badge good">-' + pct + '%</span>' : '') + '</div>' +
        '<div class="bar"><i style="width:' + Math.max(3, Math.min(100, Math.round(r.blob.size / r.orig * 100))) + '%"></i></div>' +
        (r.pages ? '<div class="result-dims">' + esc(tr('pages', { n: r.pages })) + '</div>' : '') + status + '</div>' +
        '<a class="download-btn" download>' + esc(tr('save')) + '</a></div>';
      if (r.thumb) d.querySelector('.result-preview').src = r.thumb;
      d.querySelector('.result-item-name').textContent = r.name;
      var a = d.querySelector('a'); a.href = r.url; a.download = r.name;
      el.resList.appendChild(d);
    });
    el.zip.style.display = results.length > 1 && window.JSZip ? '' : 'none';
    el.resSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  el.zip.addEventListener('click', async function () {
    var z = new JSZip(), used = {};
    results.forEach(function (r) { var n = r.name; if (used[n]) n = (used[n]++) + '_' + n; else used[n] = 1; z.file(n, r.blob); });
    var blob = await z.generateAsync({ type: 'blob' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = tr('zip_name'); document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  });

  /* ---------- 옵션·업로드 ---------- */
  function sync() { el.kbCustomWrap.hidden = radio('kb') !== 'custom'; updateSummary(); updateBtn(); }
  document.querySelectorAll('input[type=radio]').forEach(function (r) { r.addEventListener('change', sync); });
  el.kbCustom.addEventListener('input', sync);
  el.drop.addEventListener('click', function () { el.input.click(); });
  el.drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.input.click(); } });
  el.input.addEventListener('change', function () { addFiles(el.input.files); el.input.value = ''; });
  ['dragenter', 'dragover'].forEach(function (ev) { el.drop.addEventListener(ev, function (e) { e.preventDefault(); el.drop.classList.add('dragover'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { el.drop.addEventListener(ev, function (e) { e.preventDefault(); el.drop.classList.remove('dragover'); }); });
  el.drop.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files.length) addFiles(e.dataTransfer.files); });
  el.btn.addEventListener('click', run);

  (function init() {
    if (window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = PR.worker;
    var d = document.body.dataset, q = new URLSearchParams(location.search), kb = q.get('kb') || d.kb;
    if (kb) { if (!setRadio('kb', kb)) { setRadio('kb', 'custom'); el.kbCustom.value = kb; } }
    sync(); renderList();
  })();
})();
