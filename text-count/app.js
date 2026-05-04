(() => {
  // --- i18n 헬퍼 ---
  function t(key, params) {
    if (typeof I18n !== 'undefined') return I18n.t(key, params);
    return key;
  }

  // --- 분석 로직 ---
  function analyzeText(text) {
    const charsWithSpaces = text.length;
    const charsWithoutSpaces = text.replace(/\s/g, '').length;
    const words = text.split(/\s+/).filter(function (w) { return w.length > 0; }).length;
    const lines = text.length === 0 ? 0 : text.split('\n').length;
    // 문장 수: . ? ! 와 … (말줄임표는 1개로 카운트)
    const sentences = (text.match(/[.?!]|\u2026/g) || []).length;
    const bytes = new TextEncoder().encode(text).length;

    return {
      charsWithSpaces: charsWithSpaces,
      charsWithoutSpaces: charsWithoutSpaces,
      words: words,
      lines: lines,
      sentences: sentences,
      bytes: bytes,
    };
  }

  // --- 디바운스 ---
  function debounce(fn, delay) {
    let timer = null;
    return function () {
      const context = this;
      const args = arguments;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  // --- DOM 참조 ---
  const textarea = document.getElementById('text-input');
  const copyBtn = document.getElementById('copy-btn');
  const clearBtn = document.getElementById('clear-btn');

  const statEls = {
    charsWithSpaces: document.getElementById('stat-chars'),
    charsWithoutSpaces: document.getElementById('stat-chars-no-space'),
    words: document.getElementById('stat-words'),
    lines: document.getElementById('stat-lines'),
    sentences: document.getElementById('stat-sentences'),
    bytes: document.getElementById('stat-bytes'),
  };

  // --- 현재 분석 결과 캐시 ---
  let currentStats = {
    charsWithSpaces: 0,
    charsWithoutSpaces: 0,
    words: 0,
    lines: 0,
    sentences: 0,
    bytes: 0,
  };

  // --- 통계 업데이트 ---
  function updateStats() {
    const text = textarea.value;
    currentStats = analyzeText(text);
    renderStats();
  }

  // --- 통계 렌더링 ---
  function renderStats() {
    statEls.charsWithSpaces.textContent = currentStats.charsWithSpaces.toLocaleString();
    statEls.charsWithoutSpaces.textContent = currentStats.charsWithoutSpaces.toLocaleString();
    statEls.words.textContent = currentStats.words.toLocaleString();
    statEls.lines.textContent = currentStats.lines.toLocaleString();
    statEls.sentences.textContent = currentStats.sentences.toLocaleString();
    statEls.bytes.textContent = currentStats.bytes.toLocaleString();
  }

  // --- 디바운스된 입력 핸들러 ---
  const debouncedUpdate = debounce(updateStats, 200);
  textarea.addEventListener('input', debouncedUpdate);

  // --- 복사 버튼 ---
  copyBtn.addEventListener('click', function () {
    const text = textarea.value;
    if (!text) return;

    var copyLabel = copyBtn.querySelector('[data-i18n="copyBtn"]');
    navigator.clipboard.writeText(text).then(function () {
      if (copyLabel) {
        copyLabel.textContent = t('copiedBtn');
      }
      copyBtn.disabled = true;
      setTimeout(function () {
        if (copyLabel) {
          copyLabel.textContent = t('copyBtn');
        }
        copyBtn.disabled = false;
      }, 1500);
    });
  });

  // --- 초기화 버튼 ---
  clearBtn.addEventListener('click', function () {
    textarea.value = '';
    currentStats = {
      charsWithSpaces: 0,
      charsWithoutSpaces: 0,
      words: 0,
      lines: 0,
      sentences: 0,
      bytes: 0,
    };
    renderStats();
    textarea.focus();
  });

  // --- 전역 노출 (언어 변경 시 재렌더링용) ---
  window._renderStats = renderStats;

  // --- 초기화 ---
  renderStats();
})();
