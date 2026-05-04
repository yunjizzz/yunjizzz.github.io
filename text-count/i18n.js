/**
 * i18n - 다국어 지원 모듈
 * 지원 언어: ko (한국어, 기본), en (English), es (Español), pt (Português)
 */
const I18n = (() => {
  const STORAGE_KEY = 'lang';
  const DEFAULT_LANG = 'ko';
  const SUPPORTED = ['ko', 'en', 'es', 'pt'];

  const translations = {
    ko: {
      // SEO
      pageTitle: '글자수 세기 | 해봄',
      metaDescription: '무료 온라인 글자수 세기. 회원가입 없이 브라우저에서 글자수, 단어수, 바이트를 실시간으로 확인합니다. 서버 전송 없이 안전하게.',
      // Header
      backLabel: '해봄',
      backAriaLabel: '해봄 홈으로',
      headerTitle: '글자수 세기',
      // Privacy banner
      privacyText: '모든 텍스트는 브라우저에서 처리되며 서버에 전송되지 않습니다',
      // Textarea
      textareaPlaceholder: '텍스트를 입력하세요...',
      // Buttons
      copyBtn: '복사',
      copiedBtn: '복사됨!',
      clearBtn: '초기화',
      // Stat labels
      statChars: '공백 포함',
      statCharsNoSpace: '공백 제외',
      statWords: '단어 수',
      statLines: '줄 수',
      statSentences: '문장 수',
      statBytes: '바이트',
      // Help
      helpText: '입력한 텍스트의 글자수, 단어수, 문장수 등을 실시간으로 분석합니다. <strong>문장 수</strong>는 마침표(.), 물음표(?), 느낌표(!), 말줄임표(…)를 기준으로 세며, <strong>바이트</strong>는 UTF-8 인코딩 기준입니다.',
    },
    en: {
      pageTitle: 'Character Counter | Haebom',
      metaDescription: 'Free online character counter. Count characters, words, and bytes in real time directly in your browser. No upload, no signup required.',
      backLabel: 'Haebom',
      backAriaLabel: 'Go to Haebom home',
      headerTitle: 'Character Counter',
      privacyText: 'All text is processed in your browser and never sent to a server',
      textareaPlaceholder: 'Enter text here...',
      copyBtn: 'Copy',
      copiedBtn: 'Copied!',
      clearBtn: 'Clear',
      statChars: 'With spaces',
      statCharsNoSpace: 'Without spaces',
      statWords: 'Words',
      statLines: 'Lines',
      statSentences: 'Sentences',
      statBytes: 'Bytes',
      helpText: 'Analyzes character count, word count, sentence count, and more in real time. <strong>Sentences</strong> are counted by periods (.), question marks (?), exclamation marks (!), and ellipses (...). <strong>Bytes</strong> are based on UTF-8 encoding.',
    },
    es: {
      pageTitle: 'Contador de caracteres | Haebom',
      metaDescription: 'Contador de caracteres en línea gratuito. Cuenta caracteres, palabras y bytes en tiempo real directamente en tu navegador. Sin subir archivos, sin registro.',
      backLabel: 'Haebom',
      backAriaLabel: 'Ir a la página principal de Haebom',
      headerTitle: 'Contador de caracteres',
      privacyText: 'Todo el texto se procesa en tu navegador y nunca se envía a un servidor',
      textareaPlaceholder: 'Escribe el texto aquí...',
      copyBtn: 'Copiar',
      copiedBtn: '¡Copiado!',
      clearBtn: 'Limpiar',
      statChars: 'Con espacios',
      statCharsNoSpace: 'Sin espacios',
      statWords: 'Palabras',
      statLines: 'Líneas',
      statSentences: 'Oraciones',
      statBytes: 'Bytes',
      helpText: 'Analiza el conteo de caracteres, palabras, oraciones y más en tiempo real. <strong>Las oraciones</strong> se cuentan por puntos (.), signos de interrogación (?), signos de exclamación (!) y puntos suspensivos (...). <strong>Los bytes</strong> se basan en la codificación UTF-8.',
    },
    pt: {
      pageTitle: 'Contador de caracteres | Haebom',
      metaDescription: 'Contador de caracteres online gratuito. Conte caracteres, palavras e bytes em tempo real diretamente no navegador. Sem upload, sem cadastro.',
      backLabel: 'Haebom',
      backAriaLabel: 'Ir para a página inicial do Haebom',
      headerTitle: 'Contador de caracteres',
      privacyText: 'Todo o texto é processado no seu navegador e nunca é enviado a um servidor',
      textareaPlaceholder: 'Digite o texto aqui...',
      copyBtn: 'Copiar',
      copiedBtn: 'Copiado!',
      clearBtn: 'Limpar',
      statChars: 'Com espaços',
      statCharsNoSpace: 'Sem espaços',
      statWords: 'Palavras',
      statLines: 'Linhas',
      statSentences: 'Frases',
      statBytes: 'Bytes',
      helpText: 'Analisa a contagem de caracteres, palavras, frases e mais em tempo real. <strong>As frases</strong> são contadas por pontos (.), pontos de interrogação (?), pontos de exclamação (!) e reticências (...). <strong>Os bytes</strong> são baseados na codificação UTF-8.',
    },
  };

  let currentLang = DEFAULT_LANG;

  /**
   * 브라우저 언어 감지
   */
  function detectLang() {
    const nav = navigator.language || navigator.userLanguage || '';
    const code = nav.split('-')[0].toLowerCase();
    if (SUPPORTED.includes(code)) return code;
    return DEFAULT_LANG;
  }

  /**
   * 초기 언어 결정: localStorage > 브라우저 감지 > 기본값
   */
  function init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) {
      currentLang = stored;
    } else {
      currentLang = detectLang();
      localStorage.setItem(STORAGE_KEY, currentLang);
    }
    applyTranslation();
    updateLangSelector();
  }

  /**
   * 번역 키 조회
   */
  function t(key, params) {
    const dict = translations[currentLang] || translations[DEFAULT_LANG];
    let text = dict[key] || translations[DEFAULT_LANG][key] || key;
    if (params) {
      Object.keys(params).forEach(function (k) {
        text = text.replace('{' + k + '}', params[k]);
      });
    }
    return text;
  }

  /**
   * 언어 변경
   */
  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    applyTranslation();
    updateLangSelector();
  }

  /**
   * data-i18n 속성 기반 번역 적용
   */
  function applyTranslation() {
    // data-i18n 텍스트 치환
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (el.tagName === 'OPTION') {
        el.textContent = val;
      } else if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });

    // data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });

    // data-i18n-aria
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });

    // SEO 업데이트
    document.title = t('pageTitle');
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t('metaDescription'));

    // html lang 속성
    document.documentElement.lang = currentLang;

    // 앱 재렌더링 (언어 변경 시 통계 라벨 갱신)
    if (typeof window._renderStats === 'function') {
      window._renderStats();
    }
  }

  /**
   * 언어 셀렉터 동기화
   */
  function updateLangSelector() {
    const sel = document.getElementById('lang-select');
    if (sel) sel.value = currentLang;
  }

  /**
   * 현재 언어 코드 반환
   */
  function getLang() {
    return currentLang;
  }

  return { init: init, t: t, setLang: setLang, applyTranslation: applyTranslation, getLang: getLang };
})();
