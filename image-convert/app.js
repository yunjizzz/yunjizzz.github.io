(() => {
  // --- 상태 관리 ---
  const state = {
    files: [],       // { file, objectUrl }
    results: [],     // { name, originalSize, blob, blobUrl, size, error, originalUrl, convertedUrl }
    processing: false,
  };

  // --- DOM 참조 ---
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const fileList = document.getElementById('file-list');
  const fileListSection = document.getElementById('file-list-section');
  const fileListTotal = document.getElementById('file-list-total');
  const formatSelect = document.getElementById('format-select');
  const qualitySlider = document.getElementById('quality-slider');
  const qualityValue = document.getElementById('quality-value');
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

  // 파일 확장자 제거 후 이름만 반환
  function getBaseName(filename) {
    return filename.replace(/\.[^.]+$/, '');
  }

  // MIME 타입에서 확장자 결정
  function getExtension(format) {
    if (format === 'jpeg') return 'jpg';
    return format;
  }

  // --- 품질 슬라이더 & 포맷 연동 ---
  qualitySlider.addEventListener('input', function () {
    qualityValue.textContent = this.value + '%';
  });

  formatSelect.addEventListener('change', function () {
    const isPng = this.value === 'png';
    qualitySlider.disabled = isPng;
    qualityNote.style.display = isPng ? 'block' : 'none';
  });

  // 초기 상태: PNG 안내 숨김
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
      // 새 파일 추가 시 이전 결과 초기화
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
    fileListTotal.textContent = state.files.length + '개 · ' + formatSize(totalSize);
    convertBtn.disabled = false;

    state.files.forEach(function (item, index) {
      const el = document.createElement('div');
      el.className = 'file-item';
      el.setAttribute('role', 'listitem');
      el.innerHTML =
        '<img class="file-item-thumb" src="' + item.objectUrl + '" alt="' + item.file.name + ' 미리보기" />' +
        '<div class="file-item-info">' +
          '<div class="file-item-name">' + item.file.name + '</div>' +
          '<div class="file-item-size">' + formatSize(item.file.size) + '</div>' +
        '</div>' +
        '<button class="file-item-remove" data-index="' + index + '" aria-label="' + item.file.name + ' 제거">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<line x1="18" y1="6" x2="6" y2="18"></line>' +
            '<line x1="6" y1="6" x2="18" y2="18"></line>' +
          '</svg>' +
        '</button>';
      fileList.appendChild(el);
    });
  }

  // --- 드래그 앤 드롭 ---
  dropzone.addEventListener('click', function () {
    fileInput.click();
  });

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

  // --- 파일 제거 이벤트 위임 ---
  fileList.addEventListener('click', function (e) {
    const btn = e.target.closest('.file-item-remove');
    if (!btn) return;
    removeFile(parseInt(btn.dataset.index, 10));
  });

  // --- Canvas 기반 이미지 변환 ---
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
            reject(new Error('이미지 변환에 실패했습니다.'));
            return;
          }
          resolve(blob);
        }, mimeType, q);
      };

      img.onerror = function () {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('이미지를 로드할 수 없습니다.'));
      };

      img.src = objectUrl;
    });
  }

  // --- 전체 변환 실행 ---
  async function convertAll() {
    if (state.processing || state.files.length === 0) return;

    const format = formatSelect.value;
    const quality = parseInt(qualitySlider.value, 10) / 100;

    // WebP 미지원 브라우저에서 WebP 선택 시 경고
    if (format === 'webp' && !webpSupported) {
      alert('이 브라우저는 WEBP 변환을 지원하지 않습니다. 다른 포맷을 선택하거나 최신 브라우저를 사용해주세요.');
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
      processingSub.textContent = '변환 중... (' + (i + 1) + '/' + total + ')';
      processingFileName.textContent = item.file.name;
      processingFill.style.width = ((i / total) * 100) + '%';

      try {
        const blob = await convertImage(item.file, format, quality);
        const blobUrl = URL.createObjectURL(blob);
        const convertedName = getBaseName(item.file.name) + '_converted.' + ext;

        state.results.push({
          name: convertedName,
          originalSize: item.file.size,
          blob: blob,
          blobUrl: blobUrl,
          size: blob.size,
          originalUrl: item.objectUrl,
          convertedUrl: blobUrl,
        });
      } catch (err) {
        console.error('변환 실패:', item.file.name, err);
        state.results.push({
          name: item.file.name,
          error: err.message || '변환 중 오류가 발생했습니다.',
          originalSize: item.file.size,
          originalUrl: item.objectUrl,
        });
      }

      // 진행률 업데이트
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

    state.results.forEach(function (result, index) {
      const item = document.createElement('div');
      item.className = 'result-item';

      if (result.error) {
        // 에러 결과
        item.innerHTML =
          '<div class="result-item-top">' +
            '<div class="result-item-info">' +
              '<div class="result-item-name">' + result.name + '</div>' +
              '<div class="error-text">오류: ' + result.error + '</div>' +
            '</div>' +
          '</div>';
      } else {
        // 성공 결과
        const reductionPct = parseFloat(calculateReduction(result.originalSize, result.size));
        let badgeClass = 'good';
        if (reductionPct < 0) badgeClass = 'poor';
        else if (reductionPct < 10) badgeClass = 'ok';

        const compressedRatio = (result.size / result.originalSize) * 100;
        const barWidth = Math.min(compressedRatio, 100).toFixed(1);

        item.innerHTML =
          '<div class="result-item-top">' +
            '<div class="result-preview-wrap">' +
              '<img class="result-preview" src="' + result.originalUrl + '" alt="원본" />' +
              '<span class="result-preview-arrow">→</span>' +
              '<img class="result-preview" src="' + result.convertedUrl + '" alt="변환됨" />' +
            '</div>' +
            '<div class="result-item-info">' +
              '<div class="result-item-name">' + result.name + '</div>' +
              '<div class="size-comparison">' +
                '<span class="size-original">' + formatSize(result.originalSize) + '</span>' +
                '<span class="size-arrow">→</span>' +
                '<span class="size-compressed">' + formatSize(result.size) + '</span>' +
                '<span class="size-badge ' + badgeClass + '">' +
                  (reductionPct >= 0 ? reductionPct + '% 감소' : Math.abs(reductionPct) + '% 증가') +
                '</span>' +
              '</div>' +
            '</div>' +
            '<button class="download-btn" data-index="' + index + '">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
                '<polyline points="7 10 12 15 17 10"/>' +
                '<line x1="12" y1="15" x2="12" y2="3"/>' +
              '</svg>' +
              '다운로드' +
            '</button>' +
          '</div>' +
          '<div class="size-bar-wrap">' +
            '<div class="size-bar-row">' +
              '<span class="size-bar-label">원본</span>' +
              '<div class="size-bar-track"><div class="size-bar-fill original" style="width:100%"></div></div>' +
              '<span class="size-bar-value">' + formatSize(result.originalSize) + '</span>' +
            '</div>' +
            '<div class="size-bar-row">' +
              '<span class="size-bar-label">변환</span>' +
              '<div class="size-bar-track"><div class="size-bar-fill compressed" style="width:' + barWidth + '%"></div></div>' +
              '<span class="size-bar-value">' + formatSize(result.size) + '</span>' +
            '</div>' +
          '</div>';
      }

      resultsList.appendChild(item);
    });

    resultsSection.classList.add('active');
    resultsSection.style.display = '';

    // 성공 결과가 2개 이상일 때만 ZIP 다운로드 버튼 표시
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

  // --- ZIP 다운로드 (JSZip) ---
  async function downloadAllZip() {
    const validResults = state.results.filter(function (r) { return !r.error; });
    if (validResults.length === 0) return;

    // 1개면 개별 다운로드
    if (validResults.length === 1) {
      const idx = state.results.indexOf(validResults[0]);
      downloadResult(idx);
      return;
    }

    // ZIP 생성
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
      alert('ZIP 파일 생성에 실패했습니다.');
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

  // --- 초기화 ---
  renderFileList();
})();
