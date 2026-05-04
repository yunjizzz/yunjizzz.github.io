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
      pageTitle: '이미지 변환기 | 해봄',
      metaDescription: '무료 온라인 이미지 변환기. 회원가입 없이 브라우저에서 JPG, PNG, WEBP 이미지를 원하는 포맷으로 변환합니다. 서버 업로드 없이 안전하게.',
      // Header
      backLabel: '해봄',
      backAriaLabel: '해봄 홈으로',
      headerTitle: '이미지 변환기',
      // Privacy banner
      privacyText: '모든 이미지는 브라우저에서 처리되며 서버에 업로드되지 않습니다',
      // Dropzone
      dropzoneTitle: '이미지 파일을 드래그하거나 클릭하여 선택하세요',
      dropzoneSub: 'JPG, PNG, WEBP 이미지를 원하는 포맷으로 변환하세요',
      // Options
      formatLabel: '변환 포맷',
      qualityLabel: '품질',
      qualityHighTitle: '고화질',
      qualityHighDesc: '화질 우선 · 용량 소폭 감소',
      qualityBalancedTitle: '균형',
      qualityBalancedDesc: '화질과 용량의 균형',
      qualitySmallTitle: '용량 최소',
      qualitySmallDesc: '용량 최소화 · 화질 다소 저하',
      qualityNote: 'PNG는 무손실 포맷으로 품질 설정이 적용되지 않습니다',
      autoOptimizeNotice: '용량 최적화를 위해 품질이 자동 조정되었습니다 ({original}% → {final}%)',
      // File list
      fileListTitle: '선택된 이미지',
      fileCountUnit: '개',
      // Convert button
      convertBtn: '변환 시작',
      // Processing
      processingTitle: '변환 중입니다...',
      processingSub: '잠시만 기다려주세요',
      processingProgress: '변환 중... ({current}/{total})',
      // Results
      resultsTitle: '변환 완료',
      zipDownload: 'ZIP 다운로드',
      download: '다운로드',
      // Size badges
      sizeDecrease: '감소',
      sizeIncrease: '증가',
      // Size bar labels
      sizeOriginal: '원본',
      sizeConverted: '변환',
      // Preview alt
      altOriginal: '원본',
      altConverted: '변환됨',
      // Remove button
      removeLabel: '{name} 제거',
      previewLabel: '{name} 미리보기',
      // Error
      errorPrefix: '오류',
      errorConvertFail: '이미지 변환에 실패했습니다.',
      errorLoadFail: '이미지를 로드할 수 없습니다.',
      errorConvert: '변환 중 오류가 발생했습니다.',
      // WebP warning
      webpWarning: '이 브라우저는 WEBP 변환을 지원하지 않습니다. Chrome, Edge, Firefox 등 최신 브라우저를 사용해주세요.',
      webpAlert: '이 브라우저는 WEBP 변환을 지원하지 않습니다. 다른 포맷을 선택하거나 최신 브라우저를 사용해주세요.',
      zipError: 'ZIP 파일 생성에 실패했습니다.',
      // Help
      helpText: 'JPG, PNG, WEBP 이미지를 업로드하면 브라우저에서 직접 포맷을 변환합니다. <strong>PNG에서 JPG로 변환</strong> 시 투명 배경은 흰색으로 처리됩니다. 대용량 이미지는 브라우저가 느려질 수 있으니 <strong>한 번에 20장 이내</strong>를 권장합니다.',
      // Format options
      formatWebp: 'WEBP',
      formatJpg: 'JPG',
      formatPng: 'PNG',
    },
    en: {
      pageTitle: 'Image Converter | Haebom',
      metaDescription: 'Free online image converter. Convert JPG, PNG, WEBP images to any format directly in your browser. No upload, no signup required.',
      backLabel: 'Haebom',
      backAriaLabel: 'Go to Haebom home',
      headerTitle: 'Image Converter',
      privacyText: 'All images are processed in your browser and never uploaded to a server',
      dropzoneTitle: 'Drag & drop images or click to select',
      dropzoneSub: 'Convert JPG, PNG, WEBP images to your desired format',
      formatLabel: 'Output Format',
      qualityLabel: 'Quality',
      qualityHighTitle: 'High Quality',
      qualityHighDesc: 'Best quality · slight size reduction',
      qualityBalancedTitle: 'Balanced',
      qualityBalancedDesc: 'Balance of quality and size',
      qualitySmallTitle: 'Smallest Size',
      qualitySmallDesc: 'Minimize size · some quality loss',
      qualityNote: 'PNG is a lossless format, quality setting does not apply',
      autoOptimizeNotice: 'Quality was auto-adjusted for size optimization ({original}% → {final}%)',
      fileListTitle: 'Selected Images',
      fileCountUnit: '',
      convertBtn: 'Convert',
      processingTitle: 'Converting...',
      processingSub: 'Please wait',
      processingProgress: 'Converting... ({current}/{total})',
      resultsTitle: 'Conversion Complete',
      zipDownload: 'ZIP Download',
      download: 'Download',
      sizeDecrease: 'smaller',
      sizeIncrease: 'larger',
      sizeOriginal: 'Original',
      sizeConverted: 'Converted',
      altOriginal: 'Original',
      altConverted: 'Converted',
      removeLabel: 'Remove {name}',
      previewLabel: '{name} preview',
      errorPrefix: 'Error',
      errorConvertFail: 'Failed to convert the image.',
      errorLoadFail: 'Failed to load the image.',
      errorConvert: 'An error occurred during conversion.',
      webpWarning: 'This browser does not support WEBP conversion. Please use a modern browser like Chrome, Edge, or Firefox.',
      webpAlert: 'This browser does not support WEBP conversion. Please select a different format or use a modern browser.',
      zipError: 'Failed to create ZIP file.',
      helpText: 'Upload JPG, PNG, or WEBP images to convert formats directly in your browser. <strong>Transparent backgrounds become white</strong> when converting PNG to JPG. For best performance, we recommend <strong>up to 20 images at a time</strong>.',
      formatWebp: 'WEBP',
      formatJpg: 'JPG',
      formatPng: 'PNG',
    },
    es: {
      pageTitle: 'Convertidor de Imágenes | Haebom',
      metaDescription: 'Convertidor de imágenes en línea gratuito. Convierte imágenes JPG, PNG, WEBP a cualquier formato directamente en tu navegador. Sin subir archivos, sin registro.',
      backLabel: 'Haebom',
      backAriaLabel: 'Ir a la página principal de Haebom',
      headerTitle: 'Convertidor de Imágenes',
      privacyText: 'Todas las imágenes se procesan en tu navegador y nunca se suben a un servidor',
      dropzoneTitle: 'Arrastra imágenes o haz clic para seleccionar',
      dropzoneSub: 'Convierte imágenes JPG, PNG, WEBP al formato que desees',
      formatLabel: 'Formato de salida',
      qualityLabel: 'Calidad',
      qualityHighTitle: 'Alta calidad',
      qualityHighDesc: 'Mejor calidad · reducción leve de tamaño',
      qualityBalancedTitle: 'Equilibrado',
      qualityBalancedDesc: 'Equilibrio entre calidad y tamaño',
      qualitySmallTitle: 'Tamaño mínimo',
      qualitySmallDesc: 'Minimizar tamaño · algo de pérdida de calidad',
      qualityNote: 'PNG es un formato sin pérdida, el ajuste de calidad no se aplica',
      autoOptimizeNotice: 'La calidad se ajustó automáticamente para optimizar el tamaño ({original}% → {final}%)',
      fileListTitle: 'Imágenes seleccionadas',
      fileCountUnit: '',
      convertBtn: 'Convertir',
      processingTitle: 'Convirtiendo...',
      processingSub: 'Por favor espera',
      processingProgress: 'Convirtiendo... ({current}/{total})',
      resultsTitle: 'Conversión completada',
      zipDownload: 'Descargar ZIP',
      download: 'Descargar',
      sizeDecrease: 'menor',
      sizeIncrease: 'mayor',
      sizeOriginal: 'Original',
      sizeConverted: 'Convertido',
      altOriginal: 'Original',
      altConverted: 'Convertido',
      removeLabel: 'Eliminar {name}',
      previewLabel: 'Vista previa de {name}',
      errorPrefix: 'Error',
      errorConvertFail: 'No se pudo convertir la imagen.',
      errorLoadFail: 'No se pudo cargar la imagen.',
      errorConvert: 'Ocurrió un error durante la conversión.',
      webpWarning: 'Este navegador no admite la conversión a WEBP. Usa un navegador moderno como Chrome, Edge o Firefox.',
      webpAlert: 'Este navegador no admite la conversión a WEBP. Selecciona otro formato o usa un navegador moderno.',
      zipError: 'No se pudo crear el archivo ZIP.',
      helpText: 'Sube imágenes JPG, PNG o WEBP para convertir formatos directamente en tu navegador. <strong>Los fondos transparentes se vuelven blancos</strong> al convertir PNG a JPG. Para un mejor rendimiento, recomendamos <strong>hasta 20 imágenes a la vez</strong>.',
      formatWebp: 'WEBP',
      formatJpg: 'JPG',
      formatPng: 'PNG',
    },
    pt: {
      pageTitle: 'Conversor de Imagens | Haebom',
      metaDescription: 'Conversor de imagens online gratuito. Converta imagens JPG, PNG, WEBP para qualquer formato diretamente no navegador. Sem upload, sem cadastro.',
      backLabel: 'Haebom',
      backAriaLabel: 'Ir para a página inicial do Haebom',
      headerTitle: 'Conversor de Imagens',
      privacyText: 'Todas as imagens são processadas no seu navegador e nunca são enviadas a um servidor',
      dropzoneTitle: 'Arraste imagens ou clique para selecionar',
      dropzoneSub: 'Converta imagens JPG, PNG, WEBP para o formato desejado',
      formatLabel: 'Formato de saída',
      qualityLabel: 'Qualidade',
      qualityHighTitle: 'Alta qualidade',
      qualityHighDesc: 'Melhor qualidade · leve redução de tamanho',
      qualityBalancedTitle: 'Equilibrado',
      qualityBalancedDesc: 'Equilíbrio entre qualidade e tamanho',
      qualitySmallTitle: 'Menor tamanho',
      qualitySmallDesc: 'Minimizar tamanho · alguma perda de qualidade',
      qualityNote: 'PNG é um formato sem perdas, a configuração de qualidade não se aplica',
      autoOptimizeNotice: 'A qualidade foi ajustada automaticamente para otimização de tamanho ({original}% → {final}%)',
      fileListTitle: 'Imagens selecionadas',
      fileCountUnit: '',
      convertBtn: 'Converter',
      processingTitle: 'Convertendo...',
      processingSub: 'Por favor aguarde',
      processingProgress: 'Convertendo... ({current}/{total})',
      resultsTitle: 'Conversão concluída',
      zipDownload: 'Baixar ZIP',
      download: 'Baixar',
      sizeDecrease: 'menor',
      sizeIncrease: 'maior',
      sizeOriginal: 'Original',
      sizeConverted: 'Convertido',
      altOriginal: 'Original',
      altConverted: 'Convertido',
      removeLabel: 'Remover {name}',
      previewLabel: 'Pré-visualização de {name}',
      errorPrefix: 'Erro',
      errorConvertFail: 'Falha ao converter a imagem.',
      errorLoadFail: 'Falha ao carregar a imagem.',
      errorConvert: 'Ocorreu um erro durante a conversão.',
      webpWarning: 'Este navegador não suporta conversão para WEBP. Use um navegador moderno como Chrome, Edge ou Firefox.',
      webpAlert: 'Este navegador não suporta conversão para WEBP. Selecione outro formato ou use um navegador moderno.',
      zipError: 'Falha ao criar o arquivo ZIP.',
      helpText: 'Envie imagens JPG, PNG ou WEBP para converter formatos diretamente no seu navegador. <strong>Fundos transparentes ficam brancos</strong> ao converter PNG para JPG. Para melhor desempenho, recomendamos <strong>até 20 imagens por vez</strong>.',
      formatWebp: 'WEBP',
      formatJpg: 'JPG',
      formatPng: 'PNG',
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
