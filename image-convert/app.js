(() => {
  // --- i18n 헬퍼 ---
  function t(key, params) {
    if (typeof I18n !== 'undefined') return I18n.t(key, params);
    return key;
  }

  // --- 품질 프리셋 상수 ---
  const QUALITY_PRESETS = {
    high:     { quality: 0.85 },
    balanced: { quality: 0.70 },
    small:    { quality: 0.60 },
  };
  const AUTO_OPTIMIZE_STEP = 0.1;
  const AUTO_OPTIMIZE_MIN = 0.5;

  // --- 상태 관리 ---
  const state = {
    files: [],
    // result 타입: { name, originalSize, blob, blobUrl, size, error,
    //   originalUrl, convertedUrl, originalQuality, finalQuality, wasAutoOptimized }
    results: [],
    processing: false,
  };

  // --- DOM 참조 ---
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const fileList = document.getElementById('file-list');
  const fileListSection = document.getElementById('file-list-section');
  const fileListTotal = document.getElementById('file-list-total');
  const formatSelect = document.getElementById('format-select');
  const qualityNote = document.getElementById('quality-note');
  const convertBtn = document.getElementById('convert-btn');
  const processingOverlay = document.getElementById('processing-overlay');
  const processingSub = document.getElementById('processing-sub');
  const processingFill = document.getElementById('processing-fill');
  const processingFileName = document.getElementById('processing-file-name');
  const resultsSection = document.getElementById('results-section');
  const resultsList = document.getElementById('results-list');
  const downloadAllBtn = document.getElementById('download-all-btn');
  const webpWarning = document.getElementById('webp-warning');

  // --- WebP 지원 체크 ---
  function checkWebpSupport() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  const webpSupported = checkWebpSupport();
  if (!webpSupported) {
    webpWarning.style.display = 'block';
  }

  // --- 유틸 함수 ---
  function formatSize(bytes) {
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    return (bytes / 1024).toFixed(1) + ' KB';
  }

  function calculateReduction(original, converted) {
    return (((original - converted) / original) * 100).toFixed(1);
  }

  function getBaseName(filename) {
    return filename.replace(/\.[^.]+$/, '');
  }

  function getExtension(format) {
    if (format === 'jpeg') return 'jpg';
    return format;
  }

  // --- 선택된 프리셋 quality 값 반환 ---
  function getSelectedQuality() {
    const checked = document.querySelector('input[name="quality"]:checked');
    const presetKey = checked ? checked.value : 'balanced';
    return QUALITY_PRESETS[presetKey].quality;
  }

  // --- 포맷 변경 시 PNG 안내 표시 ---
  formatSelect.addEventListener('change', function () {
    qualityNote.style.display = this.value === 'png' ? 'block' : 'none';
  });
  qualityNote.style.display = formatSelect.value === 'png' ? 'block' : 'none';

  // --- 파일 추가 ---
  function addFiles(fileArray) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    let added = false;

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      if (!allowed.includes(file.type)) continue;
      const objectUrl = URL.createObjectURL(file);
      state.files.push({ file, objectUrl });
      added = true;
    }

    if (added) {
      clearResults();
      renderFileList();
    }
  }

  // --- 파일 제거 ---
  function removeFile(index) {
    const item = state.files[index];
    if (!item) return;
    URL.revokeObjectURL(item.objectUrl);
    state.files.splice(index, 1);
    clearResults();
    renderFileList();
  }

  // --- 결과 초기화 ---
  function clearResults() {
    state.results.forEach(function (r) {
      if (r.blobUrl) URL.revokeObjectURL(r.blobUrl);
      if (r.convertedUrl) URL.revokeObjectURL(r.convertedUrl);
    });
    state.results = [];
    resultsSection.style.display = 'none';
    resultsSection.classList.remove('active');
    resultsList.innerHTML = '';
  }

  // --- 파일 목록 렌더링 ---
  function renderFileList() {
    fileList.innerHTML = '';

    if (state.files.length === 0) {
      fileListSection.style.display = 'none';
      convertBtn.disabled = true;
      return;
    }

    fileListSection.style.display = '';
    const totalSize = state.files.reduce(function (sum, f) { return sum + f.file.size; }, 0);
    const unit = t('fileCountUnit');
    fileListTotal.textContent = state.files.length + (unit ? unit : '') + ' · ' + formatSize(totalSize);
    convertBtn.disabled = false;

    state.files.forEach(function (item, index) {
      const el = document.createElement('div');
      el.className = 'file-item';
      el.setAttribute('role', 'listitem');
      el.innerHTML =
        '<img class="file-item-thumb" src="' + item.objectUrl + '" alt="' + t('previewLabel', { name: item.file.name }) + '" />' +
        '<div class="file-item-info">' +
          '<div class="file-item-name">' + item.file.name + '</div>' +
          '<div class="file-item-size">' + formatSize(item.file.size) + '</div>' +
        '</div>' +
        '<button class="file-item-remove" data-index="' + index + '" aria-label="' + t('removeLabel', { name: item.file.name }) + '">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<line x1="18" y1="6" x2="6" y2="18"></line>' +
            '<line x1="6" y1="6" x2="18" y2="18"></line>' +
          '</svg>' +
        '</button>';
      fileList.appendChild(el);
    });
  }

  // --- 드래그 앤 드롭 ---
  dropzone.addEventListener('click', function () { fileInput.click(); });

  dropzone.addEventListener('dragover', function (e) {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', function () {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', function (e) {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  });

  fileInput.addEventListener('change', function () {
    if (fileInput.files.length > 0) {
      addFiles(Array.from(fileInput.files));
      fileInput.value = '';
    }
  });

  fileList.addEventListener('click', function (e) {
    const btn = e.target.closest('.file-item-remove');
    if (!btn) return;
    removeFile(parseInt(btn.dataset.index, 10));
  });

  // --- Canvas 기반 이미지 변환 (단일 quality) ---
  function convertImage(file, format, quality) {
    return new Promise(function (resolve, reject) {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');

        // PNG → JPG 변환 시 투명 배경을 흰색으로 처리
        if (format === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(objectUrl);

        const mimeType = 'image/' + format;
        // PNG는 무손실이므로 quality 무시
        const q = format === 'png' ? undefined : quality;

        canvas.toBlob(function (blob) {
          if (!blob) {
            reject(new Error(t('errorConvertFail')));
            return;
          }
          resolve(blob);
        }, mimeType, q);
      };

      img.onerror = function () {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(t('errorLoadFail')));
      };

      img.src = objectUrl;
    });
  }

  // --- 자동 최적화 변환: 원본보다 크면 quality를 낮춰 재시도 ---
  async function convertWithAutoOptimize(file, format, startQuality) {
    const originalSize = file.size;
    let bestBlob = null;
    let bestSize = Infinity;
    let finalQuality = startQuality;
    let wasAutoOptimized = false;

    // PNG는 무손실이므로 자동 ���적화 불필요
    if (format === 'png') {
      const blob = await convertImage(file, format, startQuality);
      return {
        blob: blob,
        originalQuality: startQuality,
        finalQuality: startQuality,
        wasAutoOptimized: false,
      };
    }

    // 첫 변환 시도
    let currentQuality = startQuality;
    const blob = await convertImage(file, format, currentQuality);

    if (blob.size <= originalSize) {
      // 원본보다 작으면 바로 반환
      return {
        blob: blob,
        originalQuality: startQuality,
        finalQuality: currentQuality,
        wasAutoOptimized: false,
      };
    }

    // 원본보다 큰 경우: 가장 작은 결과를 추적하며 재시도
    bestBlob = blob;
    bestSize = blob.size;
    finalQuality = currentQuality;

    while (currentQuality - AUTO_OPTIMIZE_STEP >= AUTO_OPTIMIZE_MIN - 0.001) {
      currentQuality = Math.round((currentQuality - AUTO_OPTIMIZE_STEP) * 100) / 100;
      const retryBlob = await convertImage(file, format, currentQuality);

      if (retryBlob.size < bestSize) {
        bestBlob = retryBlob;
        bestSize = retryBlob.size;
        finalQuality = currentQuality;
      }

      // 원본보다 작아지면 더 이상 재시도 불필요
      if (retryBlob.size <= originalSize) break;
    }

    wasAutoOptimized = finalQuality !== startQuality;

    return {
      blob: bestBlob,
      originalQuality: startQuality,
      finalQuality: finalQuality,
      wasAutoOptimized: wasAutoOptimized,
    };
  }

  // --- 전체 변환 실행 ---
  async function convertAll() {
    if (state.processing || state.files.length === 0) return;

    const format = formatSelect.value;
    const quality = getSelectedQuality();

    if (format === 'webp' && !webpSupported) {
      alert(t('webpAlert'));
      return;
    }

    state.processing = true;
    processingOverlay.style.display = 'flex';
    convertBtn.disabled = true;
    clearResults();

    const total = state.files.length;
    const ext = getExtension(format);

    for (let i = 0; i < total; i++) {
      const item = state.files[i];
      processingSub.textContent = t('processingProgress', { current: i + 1, total: total });
      processingFileName.textContent = item.file.name;
      processingFill.style.width = ((i / total) * 100) + '%';

      try {
        const result = await convertWithAutoOptimize(item.file, format, quality);
        const blobUrl = URL.createObjectURL(result.blob);
        const convertedName = getBaseName(item.file.name) + '_converted.' + ext;

        state.results.push({
          name: convertedName,
          originalSize: item.file.size,
          blob: result.blob,
          blobUrl: blobUrl,
          size: result.blob.size,
          originalUrl: item.objectUrl,
          convertedUrl: blobUrl,
          originalQuality: result.originalQuality,
          finalQuality: result.finalQuality,
          wasAutoOptimized: result.wasAutoOptimized,
        });
      } catch (err) {
        console.error('변환 실패:', item.file.name, err);
        state.results.push({
          name: item.file.name,
          error: err.message || t('errorConvert'),
          originalSize: item.file.size,
          originalUrl: item.objectUrl,
        });
      }

      processingFill.style.width = (((i + 1) / total) * 100) + '%';
    }

    renderResults();

    state.processing = false;
    processingOverlay.style.display = 'none';
    processingFill.style.width = '0%';
    convertBtn.disabled = state.files.length === 0;
  }

  // --- 결과 렌더링 ---
  function renderResults() {
    resultsList.innerHTML = '';

    if (state.results.length === 0) {
      resultsSection.style.display = 'none';
      resultsSection.classList.remove('active');
      return;
    }

    state.results.forEach(function (result, index) {
      const item = document.createElement('div');
      item.className = 'result-item';

      if (result.error) {
        item.innerHTML =
          '<div class="result-item-top">' +
            '<div class="result-item-info">' +
              '<div class="result-item-name">' + result.name + '</div>' +
              '<div class="error-text">' + t('errorPrefix') + ': ' + result.error + '</div>' +
            '</div>' +
          '</div>';
      } else {
        const reductionPct = parseFloat(calculateReduction(result.originalSize, result.size));
        let badgeClass = 'good';
        if (reductionPct < 0) badgeClass = 'poor';
        else if (reductionPct < 10) badgeClass = 'ok';

        const compressedRatio = (result.size / result.originalSize) * 100;
        const barWidth = Math.min(compressedRatio, 100).toFixed(1);

        // 자동 최적화 안내 문구
        let autoOptimizeHtml = '';
        if (result.wasAutoOptimized) {
          autoOptimizeHtml =
            '<div class="auto-optimize-notice">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' +
              '</svg>' +
              t('autoOptimizeNotice', {
                original: Math.round(result.originalQuality * 100),
                final: Math.round(result.finalQuality * 100),
              }) +
            '</div>';
        }

        item.innerHTML =
          '<div class="result-item-top">' +
            '<div class="result-preview-wrap">' +
              '<img class="result-preview" src="' + result.originalUrl + '" alt="' + t('altOriginal') + '" />' +
              '<span class="result-preview-arrow">\u2192</span>' +
              '<img class="result-preview" src="' + result.convertedUrl + '" alt="' + t('altConverted') + '" />' +
            '</div>' +
            '<div class="result-item-info">' +
              '<div class="result-item-name">' + result.name + '</div>' +
              '<div class="size-comparison">' +
                '<span class="size-original">' + formatSize(result.originalSize) + '</span>' +
                '<span class="size-arrow">\u2192</span>' +
                '<span class="size-compressed">' + formatSize(result.size) + '</span>' +
                '<span class="size-badge ' + badgeClass + '">' +
                  (reductionPct >= 0 ? reductionPct + '% ' + t('sizeDecrease') : Math.abs(reductionPct) + '% ' + t('sizeIncrease')) +
                '</span>' +
              '</div>' +
              autoOptimizeHtml +
            '</div>' +
            '<button class="download-btn" data-index="' + index + '">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
                '<polyline points="7 10 12 15 17 10"/>' +
                '<line x1="12" y1="15" x2="12" y2="3"/>' +
              '</svg>' +
              t('download') +
            '</button>' +
          '</div>' +
          '<div class="size-bar-wrap">' +
            '<div class="size-bar-row">' +
              '<span class="size-bar-label">' + t('sizeOriginal') + '</span>' +
              '<div class="size-bar-track"><div class="size-bar-fill original" style="width:100%"></div></div>' +
              '<span class="size-bar-value">' + formatSize(result.originalSize) + '</span>' +
            '</div>' +
            '<div class="size-bar-row">' +
              '<span class="size-bar-label">' + t('sizeConverted') + '</span>' +
              '<div class="size-bar-track"><div class="size-bar-fill compressed" style="width:' + barWidth + '%"></div></div>' +
              '<span class="size-bar-value">' + formatSize(result.size) + '</span>' +
            '</div>' +
          '</div>';
      }

      resultsList.appendChild(item);
    });

    resultsSection.classList.add('active');
    resultsSection.style.display = '';

    const validCount = state.results.filter(function (r) { return !r.error; }).length;
    downloadAllBtn.style.display = validCount > 1 ? '' : 'none';
  }

  // --- 개별 다운로드 ---
  function downloadResult(index) {
    const result = state.results[index];
    if (!result || result.error) return;

    const a = document.createElement('a');
    a.href = result.blobUrl;
    a.download = result.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // --- ZIP 다운로드 ---
  async function downloadAllZip() {
    const validResults = state.results.filter(function (r) { return !r.error; });
    if (validResults.length === 0) return;

    if (validResults.length === 1) {
      const idx = state.results.indexOf(validResults[0]);
      downloadResult(idx);
      return;
    }

    const zip = new JSZip();
    validResults.forEach(function (result) {
      zip.file(result.name, result.blob);
    });

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted_images.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
    } catch (err) {
      console.error('ZIP 생성 실패:', err);
      alert(t('zipError'));
    }
  }

  // --- 이벤트 바인딩 ---
  convertBtn.addEventListener('click', convertAll);

  resultsList.addEventListener('click', function (e) {
    const btn = e.target.closest('.download-btn');
    if (!btn) return;
    downloadResult(parseInt(btn.dataset.index, 10));
  });

  downloadAllBtn.addEventListener('click', downloadAllZip);

  // --- 전역 노출 (언어 변경 시 재렌더링용) ---
  window._renderFileList = renderFileList;
  window._renderResults = renderResults;

  // --- 초기�� ---
  renderFileList();
})();
