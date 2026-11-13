/* 사진 용량 줄이기 · 증명사진 규격 맞추기 — 모든 처리는 브라우저 안에서 (서버 업로드 없음) */
(function () {
  'use strict';

  // 1KB = 1,000바이트로 계산 (접수처가 1,000 기준이든 1,024 기준이든 넘지 않도록)
  var KB = 1000;
  var PR = window.PR || { t: {}, presets: {}, first: '' };   // 문구·규격은 페이지(언어)별로 주입됨
  var T = PR.t, PRESETS = PR.presets;
  function tr(k, v) {
    var s = T[k] || k;
    if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]);
    return s;
  }

  var $ = function (id) { return document.getElementById(id); };
  var items = [];          // {id,file,bitmap,iw,ih,thumb,zoom,cx,cy}
  var selectedId = null;
  var results = [];
  var seq = 0;
  var busy = false;

  var el = {
    drop: $('dropzone'), input: $('file-input'), msg: $('msg'),
    listSec: $('file-list-section'), list: $('file-list'), total: $('file-list-total'),
    cropCard: $('preview-card'), cropBox: $('crop-box'), cropCanvas: $('crop-canvas'), cardTitle: $('card-title'), cardHint: $('card-hint'),
    guide: $('guide'), guideToggle: $('guide-toggle'), zoom: $('zoom'), cropNote: $('crop-note'), cropOnly: document.querySelectorAll('.crop-only'),
    live: $('live'), liveThumb: $('live-thumb'), liveSize: $('live-size'), liveMeta: $('live-meta'), liveStatus: $('live-status'), liveSave: $('live-save'), liveBar: $('live-bar'),
    kbCustom: $('kb-custom'), kbCustomWrap: $('kb-custom-wrap'),
    panelOrig: $('panel-orig'), panelCrop: $('panel-crop'), maxSide: $('max-side'),
    cw: $('custom-w'), ch: $('custom-h'), customWrap: $('custom-size-wrap'),
    btn: $('convert-btn'), overlay: $('processing-overlay'), fill: $('processing-fill'),
    pname: $('processing-file-name'), resSec: $('results-section'), resList: $('results-list'),
    zipBtn: $('download-all-btn'), summary: $('summary'), convertLabel: $('convert-label'), dzTitle: $('dz-title')
  };

  function radio(name) {
    var r = document.querySelector('input[name="' + name + '"]:checked');
    return r ? r.value : '';
  }
  function setRadio(name, value) {
    var r = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
    if (r) { r.checked = true; return true; }
    return false;
  }
  function fmtSize(b) {
    if (b >= 1e6) return (b / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'MB';
    return Math.max(1, Math.round(b / KB)) + 'KB';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function showMsg(t) { el.msg.textContent = t || ''; el.msg.style.display = t ? 'block' : 'none'; }

  /* ---------- 설정 읽기 ---------- */
  function targetBytes() {
    var v = radio('kb');
    if (v === 'custom') {
      var n = parseFloat(el.kbCustom.value);
      return n > 0 ? Math.round(n * KB) : 0;
    }
    return (parseInt(v, 10) || 0) * KB;
  }
  function cropDims() {
    var p = radio('preset');
    if (p === 'custom') {
      var w = clamp(parseInt(el.cw.value, 10) || 0, 50, 6000);
      var h = clamp(parseInt(el.ch.value, 10) || 0, 50, 6000);
      var f = PRESETS[PR.first];
      return { w: w || f.w, h: h || f.h, tag: (w || f.w) + 'x' + (h || f.h) };
    }
    return PRESETS[p] || PRESETS[PR.first];
  }
  function settings() {
    var mode = radio('mode');
    return {
      target: targetBytes(), mode: mode, fmt: radio('fmt') || 'jpeg',
      maxSide: parseInt(el.maxSide.value, 10) || 0,
      dims: mode === 'crop' ? cropDims() : null
    };
  }

  /* ---------- 파일 불러오기 ---------- */
  function loadBitmap(file) {
    if (window.createImageBitmap) {
      return createImageBitmap(file, { imageOrientation: 'from-image' }).catch(function () {
        return createImageBitmap(file);
      });
    }
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () { res(im); };
      im.onerror = function () { rej(new Error('decode')); };
      im.src = u;
    });
  }
  function thumbOf(bmp) {
    var s = 88 / Math.max(bmp.width, bmp.height), c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(bmp.width * s)); c.height = Math.max(1, Math.round(bmp.height * s));
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.7);
  }
  async function addFiles(fileList) {
    showMsg('');
    var bad = 0;
    var files = Array.prototype.slice.call(fileList);
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      if (!/^image\//.test(f.type) && !/\.(jpe?g|png|webp|gif|bmp|heic|heif|avif)$/i.test(f.name)) { bad++; continue; }
      try {
        var bmp = await loadBitmap(f);
        var it = {
          id: ++seq, file: f, bitmap: bmp, iw: bmp.width || bmp.naturalWidth, ih: bmp.height || bmp.naturalHeight,
          zoom: 1, cx: 0.5, cy: 0.5
        };
        it.thumb = thumbOf(bmp);
        items.push(it);
        if (selectedId === null) selectedId = it.id;
      } catch (e) { bad++; }
    }
    if (bad) showMsg(tr('msg_bad', { n: bad }));
    renderList(); renderCrop(); scheduleLive(); updateBtn();
  }

  function renderList() {
    el.listSec.style.display = items.length ? '' : 'none';
    el.drop.classList.toggle('compact', items.length > 0);
    el.dzTitle.textContent = items.length ? tr('dz_more') : tr('dz_title');
    el.list.innerHTML = '';
    items.forEach(function (it) {
      var row = document.createElement('div');
      row.className = 'file-item' + (it.id === selectedId ? ' selected' : '');
      row.setAttribute('role', 'listitem');
      row.innerHTML = '<img class="file-item-thumb" alt=""><div class="file-item-info"><div class="file-item-name"></div><div class="file-item-size"></div></div>' +
        '<button type="button" class="file-item-remove" aria-label="' + tr('remove') + '">✕</button>';
      row.querySelector('img').src = it.thumb;
      row.querySelector('.file-item-name').textContent = it.file.name;
      row.querySelector('.file-item-size').textContent = fmtSize(it.file.size) + ' · ' + it.iw + '×' + it.ih + 'px';
      row.addEventListener('click', function (e) {
        if (e.target.closest('.file-item-remove')) {
          items = items.filter(function (x) { return x.id !== it.id; });
          if (selectedId === it.id) selectedId = items.length ? items[0].id : null;
          renderList(); renderCrop(); scheduleLive(); updateBtn();
          return;
        }
        selectedId = it.id; renderList(); renderCrop(); scheduleLive();
      });
      el.list.appendChild(row);
    });
    var sum = items.reduce(function (a, b) { return a + b.file.size; }, 0);
    el.total.textContent = items.length ? tr('list_total', { n: items.length, size: fmtSize(sum) }) : '';
  }
  function updateBtn() {
    el.btn.disabled = busy || !items.length;
    el.convertLabel.textContent = !items.length ? tr('btn_empty') : (items.length > 1 ? tr('btn_many', { n: items.length }) : tr('btn_one'));
  }
  function updateSummary() {
    var s = settings(), t = s.target ? tr('sum_kb', { kb: fmtSize(s.target) }) : tr('sum_kb_none');
    var size = s.mode === 'crop' ? tr('sum_crop', { w: s.dims.w, h: s.dims.h }) : (s.maxSide ? tr('sum_max', { n: s.maxSide }) : tr('sum_orig'));
    el.summary.innerHTML = '<b>' + tr('sum_label') + '</b><span></span><span></span><span></span>';
    var sp = el.summary.querySelectorAll('span');
    sp[0].textContent = t; sp[1].textContent = size; sp[2].textContent = s.fmt === 'webp' ? 'WEBP' : 'JPG';
  }

  /* ---------- 미리보기 (자르기 편집 + 실시간 결과) ---------- */
  function selected() { return items.filter(function (x) { return x.id === selectedId; })[0]; }
  function cropRect(it, W, H) {
    var cover = Math.max(W / it.iw, H / it.ih), scale = cover * it.zoom;
    var sw = W / scale, sh = H / scale;
    var sx = clamp(it.cx * it.iw - sw / 2, 0, it.iw - sw);
    var sy = clamp(it.cy * it.ih - sh / 2, 0, it.ih - sh);
    it.cx = (sx + sw / 2) / it.iw; it.cy = (sy + sh / 2) / it.ih;
    return { sx: sx, sy: sy, sw: sw, sh: sh };
  }
  function renderCrop() {
    var crop = radio('mode') === 'crop', it = selected();
    el.cropCard.hidden = !it;
    if (!it) return;
    el.cropOnly.forEach(function (n) { n.hidden = !crop; });
    el.guide.style.display = crop && el.guideToggle.checked ? '' : 'none';
    el.cropBox.style.cursor = crop ? '' : 'default';
    var ctx = el.cropCanvas.getContext('2d');
    if (crop) {
      var d = cropDims(), pw = 360, ph = Math.max(1, Math.round(pw * d.h / d.w));
      el.cropCanvas.width = pw; el.cropCanvas.height = ph;
      var r = cropRect(it, d.w, d.h);
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, pw, ph);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(it.bitmap, r.sx, r.sy, r.sw, r.sh, 0, 0, pw, ph);
      el.zoom.value = it.zoom;
      el.cardTitle.textContent = tr('card_title_crop'); el.cardHint.textContent = tr('card_hint_crop');
      el.cropNote.textContent = tr('crop_note', { w: d.w, h: d.h });
    } else {
      var sc = Math.min(360 / it.iw, 420 / it.ih), w = Math.max(1, Math.round(it.iw * sc)), h = Math.max(1, Math.round(it.ih * sc));
      el.cropCanvas.width = w; el.cropCanvas.height = h;
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(it.bitmap, 0, 0, it.iw, it.ih, 0, 0, w, h);
      el.cardTitle.textContent = tr('card_title_orig'); el.cardHint.textContent = tr('card_hint_orig');
    }
  }
  (function bindCrop() {
    var drag = null;
    el.cropBox.addEventListener('pointerdown', function (e) {
      var it = selected(); if (!it || radio('mode') !== 'crop') return;
      drag = { x: e.clientX, y: e.clientY };
      el.cropBox.classList.add('grabbing');
      el.cropBox.setPointerCapture(e.pointerId);
    });
    el.cropBox.addEventListener('pointermove', function (e) {
      var it = selected(); if (!drag || !it) return;
      var d = cropDims(), rect = el.cropBox.getBoundingClientRect(), r = cropRect(it, d.w, d.h);
      var k = r.sw / rect.width; // 화면 px → 원본 px
      it.cx = (it.cx * it.iw - (e.clientX - drag.x) * k) / it.iw;
      it.cy = (it.cy * it.ih - (e.clientY - drag.y) * k) / it.ih;
      drag.x = e.clientX; drag.y = e.clientY;
      renderCrop(); scheduleLive();
    });
    function end() { drag = null; el.cropBox.classList.remove('grabbing'); scheduleLive(); }
    el.cropBox.addEventListener('pointerup', end);
    el.cropBox.addEventListener('pointercancel', end);
    el.cropBox.addEventListener('wheel', function (e) {
      var it = selected(); if (!it || radio('mode') !== 'crop') return;
      e.preventDefault();
      it.zoom = clamp(it.zoom * Math.exp(-e.deltaY * 0.0015), 1, 4); renderCrop(); scheduleLive();
    }, { passive: false });
    el.zoom.addEventListener('input', function () {
      var it = selected(); if (!it) return;
      it.zoom = parseFloat(el.zoom.value); renderCrop(); scheduleLive();
    });
    el.guideToggle.addEventListener('change', renderCrop);
  })();

  // 설정이나 자르기 위치가 바뀌면 잠깐 기다렸다가(0.25초) 선택한 사진의 결과를 다시 계산해서 보여줌
  var liveTimer = null, liveSeq = 0;
  function scheduleLive() {
    clearTimeout(liveTimer);
    var it = selected();
    if (!it) { el.live.hidden = true; return; }
    el.live.hidden = false; el.live.classList.add('busy');
    el.liveStatus.className = 'live-status'; el.liveStatus.textContent = tr('calc');
    liveTimer = setTimeout(doLive, 250);
  }
  function stateKey(it, s) {
    var base = [s.target, s.mode, s.fmt, s.maxSide, s.dims ? s.dims.w + 'x' + s.dims.h : ''];
    if (s.mode === 'crop') base.push(it.zoom.toFixed(3), it.cx.toFixed(4), it.cy.toFixed(4));
    return base.join('|');
  }
  async function doLive() {
    var it = selected(); if (!it) return;
    var s = settings(), key = stateKey(it, s), my = ++liveSeq;
    if (!(it.live && it.live.key === key)) {
      var res;
      try { res = await compute(it, s); } catch (e) { res = null; }
      if (my !== liveSeq) return;            // 그 사이 설정이 또 바뀌었으면 버림
      if (it.live && it.live.url) URL.revokeObjectURL(it.live.url);
      it.live = res ? { key: key, res: res, url: URL.createObjectURL(res.blob) } : null;
    }
    if (selected() === it) renderLive(it);
  }
  function renderLive(it) {
    el.live.classList.remove('busy');
    if (!it.live) { el.liveStatus.className = 'live-status warn'; el.liveStatus.textContent = tr('fail'); el.liveSave.hidden = true; return; }
    var r = it.live.res, pct = Math.round((1 - r.blob.size / r.orig) * 100);
    el.liveThumb.src = it.live.url;
    el.liveSize.innerHTML = '<s></s> <i>→</i> <b></b>' + (pct > 0 && !r.kept ? ' <em></em>' : '');
    el.liveSize.querySelector('s').textContent = fmtSize(r.orig);
    el.liveSize.querySelector('b').textContent = fmtSize(r.blob.size);
    if (pct > 0 && !r.kept) el.liveSize.querySelector('em').textContent = '-' + pct + '%';
    el.liveMeta.textContent = r.W + '×' + r.H + 'px · ' + (r.blob.type === 'image/webp' ? 'WEBP' : (r.kept ? tr('meta_orig') : 'JPG'));
    el.liveBar.style.width = Math.max(3, Math.min(100, Math.round(r.blob.size / r.orig * 100))) + '%';
    var ok = r.met;
    el.liveStatus.className = 'live-status ' + (ok ? 'ok' : 'warn');
    el.liveStatus.textContent = r.kept ? tr('kept')
      : ok ? (r.target ? tr('ok_target', { kb: fmtSize(r.target) }) : tr('ok_plain')) : tr('warn_live', { kb: fmtSize(r.target) });
    el.liveSave.hidden = false; el.liveSave.href = it.live.url; el.liveSave.download = r.name;
  }

  /* ---------- 그리기·인코딩 ---------- */
  function mk(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function drawScaled(bmp, sx, sy, sw, sh, W, H) {
    var src = bmp, x = sx, y = sy, w = sw, h = sh;
    while (w / 2 >= W && h / 2 >= H) { // 크게 줄일 때는 반씩 줄여 계단 현상을 막음
      var nw = Math.max(W, Math.round(w / 2)), nh = Math.max(H, Math.round(h / 2)), t = mk(nw, nh);
      var tc = t.getContext('2d'); tc.imageSmoothingQuality = 'high';
      tc.drawImage(src, x, y, w, h, 0, 0, nw, nh);
      src = t; x = 0; y = 0; w = nw; h = nh;
    }
    var out = mk(W, H), ctx = out.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); // 투명 배경은 흰색으로
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(src, x, y, w, h, 0, 0, W, H);
    return out;
  }
  function toBlob(c, type, q) { return new Promise(function (r) { c.toBlob(r, type, q); }); }
  function setJpegDpi(blob, dpi) {
    return blob.arrayBuffer().then(function (buf) {
      var b = new Uint8Array(buf);
      if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF && b[3] === 0xE0 && b[6] === 0x4A && b[7] === 0x46) {
        b[13] = 1; b[14] = dpi >> 8; b[15] = dpi & 255; b[16] = dpi >> 8; b[17] = dpi & 255;
        return new Blob([b], { type: 'image/jpeg' });
      }
      return blob;
    }).catch(function () { return blob; });
  }

  // 목표 용량 이하로 맞추기: 품질을 이분 탐색하고, 크기가 자유로우면 필요한 만큼만 해상도를 줄임
  async function encode(it, s) {
    var type = s.fmt === 'webp' ? 'image/webp' : 'image/jpeg';
    var flexible = s.mode === 'orig', target = s.target, baseW, baseH, rectFn;
    if (flexible) {
      var k = s.maxSide ? Math.min(1, s.maxSide / Math.max(it.iw, it.ih)) : 1;
      baseW = Math.max(1, Math.round(it.iw * k)); baseH = Math.max(1, Math.round(it.ih * k));
      rectFn = function () { return { sx: 0, sy: 0, sw: it.iw, sh: it.ih }; };
    } else {
      baseW = s.dims.w; baseH = s.dims.h;
      rectFn = function () { return cropRect(it, baseW, baseH); };
    }
    var rc = rectFn(), f = 1, best = null, qMin = flexible ? 0.6 : 0.05;
    for (var step = 0; step < 12; step++) {
      var W = Math.max(1, Math.round(baseW * f)), H = Math.max(1, Math.round(baseH * f));
      var c = drawScaled(it.bitmap, rc.sx, rc.sy, rc.sw, rc.sh, W, H);
      if (!target) return { blob: await toBlob(c, type, 0.9), W: W, H: H, met: true };
      var hi = await toBlob(c, type, 0.92);
      if (hi.size <= target) return { blob: hi, W: W, H: H, met: true };
      var lo = await toBlob(c, type, qMin);
      if (!best || lo.size < best.blob.size) best = { blob: lo, W: W, H: H, met: false };
      if (lo.size <= target) {
        var a = qMin, b = 0.92, ok = lo;
        for (var i = 0; i < 7; i++) {
          var m = (a + b) / 2, bl = await toBlob(c, type, m);
          if (bl.size <= target) { ok = bl; a = m; } else { b = m; }
        }
        return { blob: ok, W: W, H: H, met: true };
      }
      if (!flexible) return best;           // 규격 크기는 바꿀 수 없으니 품질만으로 한계
      if (W <= 48 || H <= 48) return best;
      f *= Math.max(0.5, Math.sqrt(target / lo.size)) * 0.97;
    }
    return best;
  }

  /* ---------- 변환 (미리보기·일괄 저장 공통) ---------- */
  function baseName(n) { return n.replace(/\.[^.]+$/, ''); }
  async function compute(it, s) {
    var res, kept = false;
    if (s.mode === 'orig' && !s.maxSide && s.target && it.file.size <= s.target) {
      res = { blob: it.file, W: it.iw, H: it.ih, met: true }; kept = true;
    } else {
      res = await encode(it, s);
      if (s.mode === 'orig' && !s.maxSide && res.blob.size >= it.file.size && (!s.target || it.file.size <= s.target)) {
        res = { blob: it.file, W: it.iw, H: it.ih, met: true }; kept = true;
      }
      if (s.mode === 'crop' && s.fmt === 'jpeg') res.blob = await setJpegDpi(res.blob, 300);
    }
    var tag = s.mode === 'crop' ? s.dims.tag : (s.target ? fmtSize(s.target) : tr('tag_resize'));
    var ext = kept ? (it.file.name.match(/\.[^.]+$/) || ['.jpg'])[0] : (res.blob.type === 'image/webp' ? '.webp' : '.jpg');
    return {
      name: kept ? it.file.name : baseName(it.file.name) + '_' + tag + ext, blob: res.blob,
      orig: it.file.size, W: res.W, H: res.H, met: res.met, kept: kept, target: s.target
    };
  }
  async function run() {
    if (busy || !items.length) return;
    var s = settings();
    busy = true; updateBtn();
    results.forEach(function (r) { URL.revokeObjectURL(r.url); });
    results = []; el.resList.innerHTML = '';
    el.overlay.classList.add('active'); el.fill.style.width = '0%';
    for (var i = 0; i < items.length; i++) {
      var it = items[i], r = null;
      el.pname.textContent = it.file.name + ' (' + (i + 1) + '/' + items.length + ')';
      await new Promise(function (res) { setTimeout(res, 30); });
      try {
        r = (it.live && it.live.key === stateKey(it, s)) ? it.live.res : await compute(it, s); // 미리보기로 이미 계산했으면 재사용
      } catch (e) { r = null; }
      if (r) results.push(Object.assign({}, r, { url: URL.createObjectURL(r.blob) }));
      el.fill.style.width = Math.round(((i + 1) / items.length) * 100) + '%';
    }
    el.overlay.classList.remove('active');
    busy = false; updateBtn(); renderResults();
  }

  function renderResults() {
    el.resSec.classList.add('active');
    el.resList.innerHTML = '';
    results.forEach(function (r) {
      var pct = Math.round((1 - r.blob.size / r.orig) * 100);
      var d = document.createElement('div');
      d.className = 'result-item'; d.setAttribute('role', 'listitem');
      var status = r.kept ? '<div class="result-status ok">' + esc(tr('kept')) + '</div>'
        : r.met ? '<div class="result-status ok">' + esc(r.target ? tr('ok_target', { kb: fmtSize(r.target) }) : tr('res_ok_plain')) + '</div>'
          : '<div class="result-status warn">' + esc(tr('warn_res', { kb: fmtSize(r.target) })) + '</div>';
      d.innerHTML = '<div class="result-item-top"><div class="result-preview-wrap"><img class="result-preview" alt=""></div>' +
        '<div class="result-item-info"><div class="result-item-name"></div>' +
        '<div class="size-comparison"><span class="size-original">' + fmtSize(r.orig) + '</span><span class="size-arrow">→</span>' +
        '<span class="size-compressed">' + fmtSize(r.blob.size) + '</span>' +
        (pct > 0 && !r.kept ? '<span class="size-badge good">-' + pct + '%</span>' : '') + '</div>' +
        '<div class="bar"><i style="width:' + Math.max(3, Math.min(100, Math.round(r.blob.size / r.orig * 100))) + '%"></i></div><div class="result-dims">' + r.W + '×' + r.H + 'px</div>' + status + '</div>' +
        '<a class="download-btn" download>' + esc(tr('save')) + '</a></div>';
      d.querySelector('.result-preview').src = r.url;
      d.querySelector('.result-item-name').textContent = r.name;
      var a = d.querySelector('a'); a.href = r.url; a.download = r.name;
      el.resList.appendChild(d);
    });
    el.zipBtn.style.display = results.length > 1 && window.JSZip ? '' : 'none';
    el.resSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  el.zipBtn.addEventListener('click', async function () {
    var z = new JSZip(), used = {};
    results.forEach(function (r) {
      var n = r.name; if (used[n]) n = (used[n]++) + '_' + n; else used[n] = 1;
      z.file(n, r.blob);
    });
    var blob = await z.generateAsync({ type: 'blob' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = tr('zip_name');
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  });

  /* ---------- 옵션 UI ---------- */
  function syncOptions() {
    var crop = radio('mode') === 'crop';
    el.panelOrig.hidden = crop; el.panelCrop.hidden = !crop;
    el.kbCustomWrap.hidden = radio('kb') !== 'custom';
    el.customWrap.hidden = radio('preset') !== 'custom';
    renderList(); renderCrop(); updateSummary(); scheduleLive();
  }
  document.querySelectorAll('input[type=radio]').forEach(function (r) { r.addEventListener('change', syncOptions); });
  [el.cw, el.ch].forEach(function (i) { i.addEventListener('input', function () { renderCrop(); updateSummary(); scheduleLive(); }); });
  el.kbCustom.addEventListener('input', function () { updateSummary(); scheduleLive(); });
  el.maxSide.addEventListener('change', function () { updateSummary(); scheduleLive(); });

  /* ---------- 업로드 ---------- */
  el.drop.addEventListener('click', function () { el.input.click(); });
  el.drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.input.click(); } });
  el.input.addEventListener('change', function () { addFiles(el.input.files); el.input.value = ''; });
  ['dragenter', 'dragover'].forEach(function (ev) {
    el.drop.addEventListener(ev, function (e) { e.preventDefault(); el.drop.classList.add('dragover'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    el.drop.addEventListener(ev, function (e) { e.preventDefault(); el.drop.classList.remove('dragover'); });
  });
  el.drop.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files.length) addFiles(e.dataTransfer.files); });
  el.btn.addEventListener('click', run);

  /* ---------- 초기값 (주소별 랜딩 페이지에서 미리 선택) ---------- */
  (function init() {
    var d = document.body.dataset, q = new URLSearchParams(location.search);
    var kb = q.get('kb') || d.kb;
    if (kb) { if (!setRadio('kb', kb)) { setRadio('kb', 'custom'); el.kbCustom.value = kb; } }
    var mode = q.get('mode') || d.mode;
    if (mode) setRadio('mode', mode);
    var preset = q.get('preset') || d.preset;
    if (preset) setRadio('preset', preset);
    // WEBP 미지원 브라우저(구형 Safari)면 선택지를 막음
    try {
      if (mk(1, 1).toDataURL('image/webp').indexOf('image/webp') !== 5) {
        var w = document.querySelector('input[name="fmt"][value="webp"]'); w.disabled = true;
        w.parentNode.style.opacity = '.4'; setRadio('fmt', 'jpeg');
      }
    } catch (e) { /* 무시 */ }
    syncOptions(); updateBtn();
  })();
})();
