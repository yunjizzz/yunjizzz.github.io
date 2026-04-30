(() => {
  const MAX_TOTAL_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

  const state = {
    files: [],
    results: [],
    totalSize: 0,
    ffmpeg: null,
    processing: false,
  };

  // --- DOM references ---
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const fileList = document.getElementById('file-list');
  const fileListSection = document.getElementById('file-list-section');
  const fileListTotal = document.getElementById('file-list-total');
  const capacityValue = document.getElementById('capacity-value');
  const capacityFill = document.getElementById('capacity-fill');
  const compressBtn = document.getElementById('compress-btn');
  const resultsSection = document.getElementById('results-section');
  const resultsList = document.getElementById('results-list');
  const downloadAllBtn = document.getElementById('download-all-btn');
  const processingOverlay = document.getElementById('processing-overlay');
  const processingSub = document.getElementById('processing-sub');
  const processingFill = document.getElementById('processing-fill');
  const processingFileName = document.getElementById('processing-file-name');

  // --- Helpers ---
  function formatSize(bytes) {
    if (bytes >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function calculateReduction(original, compressed) {
    const pct = ((original - compressed) / original) * 100;
    return pct.toFixed(1);
  }

  // --- Capacity UI ---
  function updateCapacityUI() {
    const mb = state.totalSize / (1024 * 1024);
    const maxMb = MAX_TOTAL_SIZE / (1024 * 1024);
    capacityValue.textContent = `${mb.toFixed(0)} MB / ${maxMb.toLocaleString()} MB (2GB)`;
    const pct = Math.min((state.totalSize / MAX_TOTAL_SIZE) * 100, 100);
    capacityFill.style.width = pct + '%';

    if (state.totalSize >= MAX_TOTAL_SIZE) {
      dropzone.classList.add('disabled');
    } else {
      dropzone.classList.remove('disabled');
    }
  }

  // --- File list UI ---
  function renderFileList() {
    fileList.innerHTML = '';
    if (state.files.length === 0) {
      fileListSection.style.display = 'none';
      compressBtn.disabled = true;
      return;
    }

    fileListSection.style.display = '';
    fileListTotal.textContent = `${state.files.length}개 · ${formatSize(state.totalSize)}`;
    compressBtn.disabled = false;

    state.files.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'file-item';
      item.dataset.index = index;
      item.setAttribute('role', 'listitem');
      item.innerHTML = `
        <div class="file-info">
          <span class="file-name">${file.name}</span>
          <span class="file-size">${formatSize(file.size)}</span>
        </div>
        <button class="file-remove" data-index="${index}" aria-label="${file.name} 제거">&times;</button>
      `;
      fileList.appendChild(item);
    });
  }

  // --- Add files ---
  function addFiles(fileArray) {
    const allowed = ['.mp4', '.webm', '.mov', '.avi'];
    let added = false;

    for (const file of fileArray) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowed.includes(ext)) continue;

      if (state.totalSize + file.size > MAX_TOTAL_SIZE) {
        alert(`용량 한도(2GB)를 초과하여 "${file.name}"을(를) 추가할 수 없습니다.`);
        continue;
      }

      state.files.push(file);
      state.totalSize += file.size;
      added = true;
    }

    if (added) {
      // Reset results when new files are added
      state.results = [];
      resultsSection.style.display = 'none';
      resultsList.innerHTML = '';

      renderFileList();
      updateCapacityUI();
    }
  }

  // --- Remove file ---
  function removeFile(index) {
    const file = state.files[index];
    if (!file) return;

    state.totalSize -= file.size;
    state.files.splice(index, 1);

    // Reset results when files change
    state.results = [];
    resultsSection.style.display = 'none';
    resultsList.innerHTML = '';

    renderFileList();
    updateCapacityUI();
  }

  // --- Drag & drop ---
  dropzone.addEventListener('click', () => {
    if (dropzone.classList.contains('disabled')) return;
    fileInput.click();
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (dropzone.classList.contains('disabled')) return;
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (dropzone.classList.contains('disabled')) return;
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      addFiles(Array.from(fileInput.files));
      fileInput.value = '';
    }
  });

  // --- File remove delegation ---
  fileList.addEventListener('click', (e) => {
    const btn = e.target.closest('.file-remove');
    if (!btn) return;
    const index = parseInt(btn.dataset.index, 10);
    removeFile(index);
  });

  // --- FFmpeg init ---
  async function loadFFmpeg() {
    if (state.ffmpeg) return state.ffmpeg;

    const { FFmpeg } = FFmpegWASM;
    const ff = new FFmpeg();
    ff.on('log', ({ message }) => {
      console.log('[ffmpeg]', message);
    });

    processingSub.textContent = 'FFmpeg 로딩 중...';
    processingFileName.textContent = '';

    await ff.load({
      coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
    });

    state.ffmpeg = ff;
    return ff;
  }

  // --- Compress ---
  async function compressFiles() {
    if (state.processing || state.files.length === 0) return;

    state.processing = true;
    processingOverlay.style.display = 'flex';
    compressBtn.disabled = true;
    state.results = [];

    try {
      const ff = await loadFFmpeg();
      const total = state.files.length;

      for (let i = 0; i < total; i++) {
        const file = state.files[i];
        processingSub.textContent = `압축 중... (${i + 1}/${total})`;
        processingFileName.textContent = file.name;
        processingFill.style.width = ((i / total) * 100) + '%';

        try {
          const inputName = 'input_' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const outputName = 'output_' + Date.now() + '.mp4';

          const { fetchFile } = FFmpegUtil;
          await ff.writeFile(inputName, await fetchFile(file));

          await ff.exec([
            '-i', inputName,
            '-vcodec', 'libx264',
            '-crf', '28',
            '-preset', 'fast',
            '-acodec', 'aac',
            '-b:a', '128k',
            '-movflags', '+faststart',
            outputName,
          ]);

          const data = await ff.readFile(outputName);
          const compressedBlob = new Blob([data.buffer], { type: 'video/mp4' });

          state.results.push({
            name: file.name.replace(/\.[^.]+$/, '') + '_compressed.mp4',
            originalSize: file.size,
            compressedBlob,
            compressedSize: compressedBlob.size,
          });

          // Cleanup virtual FS
          try { await ff.deleteFile(inputName); } catch (_) {}
          try { await ff.deleteFile(outputName); } catch (_) {}
        } catch (err) {
          console.error('압축 실패:', file.name, err);
          state.results.push({
            name: file.name,
            error: err.message || '압축 중 오류가 발생했습니다.',
            originalSize: file.size,
          });
        }
      }

      renderResults();
    } catch (err) {
      console.error('FFmpeg 오류:', err);
      alert('FFmpeg 초기화 중 오류가 발생했습니다: ' + (err.message || err));
    } finally {
      state.processing = false;
      processingOverlay.style.display = 'none';
      processingFill.style.width = '0%';
      compressBtn.disabled = state.files.length === 0;
    }
  }

  // --- Results UI ---
  function renderResults() {
    resultsList.innerHTML = '';

    state.results.forEach((result, index) => {
      const item = document.createElement('div');
      item.className = 'result-item';

      if (result.error) {
        item.innerHTML = `
          <div class="result-info">
            <span class="result-name">${result.name}</span>
            <div class="size-comparison">
              <span class="reduction bad">오류: ${result.error}</span>
            </div>
          </div>
        `;
      } else {
        const reductionPct = parseFloat(calculateReduction(result.originalSize, result.compressedSize));
        let reductionClass = 'good';
        if (reductionPct < 0) reductionClass = 'bad';
        else if (reductionPct < 10) reductionClass = 'moderate';

        const compressedRatio = (result.compressedSize / result.originalSize) * 100;
        const barCompressedWidth = Math.min(compressedRatio, 100).toFixed(1);

        item.innerHTML = `
          <div class="result-info">
            <span class="result-name">${result.name}</span>
            <div class="size-comparison">
              <span class="original-size">원본: ${formatSize(result.originalSize)}</span>
              <span class="arrow">→</span>
              <span class="compressed-size">압축: ${formatSize(result.compressedSize)}</span>
              <span class="reduction ${reductionClass}">${reductionPct >= 0 ? reductionPct : Math.abs(reductionPct)}% ${reductionPct >= 0 ? '감소' : '증가'}</span>
            </div>
            <div class="comparison-bar">
              <div class="bar-original" style="width: 100%"></div>
              <div class="bar-compressed" style="width: ${barCompressedWidth}%"></div>
            </div>
          </div>
          <button class="download-btn" data-index="${index}">다운로드</button>
        `;
      }

      resultsList.appendChild(item);
    });

    resultsSection.style.display = '';
    downloadAllBtn.style.display = state.results.filter(r => !r.error).length > 1 ? '' : 'none';
  }

  // --- Download ---
  function downloadResult(index) {
    const result = state.results[index];
    if (!result || result.error) return;

    const url = URL.createObjectURL(result.compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  function downloadAll() {
    const validResults = state.results.filter((r) => !r.error);
    if (validResults.length === 0) return;

    if (validResults.length === 1) {
      const idx = state.results.indexOf(validResults[0]);
      downloadResult(idx);
      return;
    }

    // Download each sequentially with small delay to avoid browser blocking
    validResults.forEach((result, i) => {
      const idx = state.results.indexOf(result);
      setTimeout(() => downloadResult(idx), i * 300);
    });
  }

  // --- Event listeners ---
  compressBtn.addEventListener('click', compressFiles);

  resultsList.addEventListener('click', (e) => {
    const btn = e.target.closest('.download-btn');
    if (!btn) return;
    const index = parseInt(btn.dataset.index, 10);
    downloadResult(index);
  });

  downloadAllBtn.addEventListener('click', downloadAll);

  // --- Init ---
  updateCapacityUI();
  renderFileList();
})();
