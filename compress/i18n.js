/**
 * i18n - 다국어 지원 모듈
 * 지원 언어: ko (한국어, 기본), en (English), es (Espanol), pt (Portugues)
 */
const I18n = (() => {
  const SUPPORTED_LANGS = ['ko', 'en', 'es', 'pt'];
  const DEFAULT_LANG = 'ko';
  const STORAGE_KEY = 'lang';

  const translations = {
    ko: {
      // SEO
      'seo.title': '영상 압축 | 해봄',
      'seo.description': '무료 온라인 영상 압축. 회원가입 없이 브라우저에서 직접 MP4 동영상을 하드웨어 가속으로 압축합니다. 서버 업로드 없이 안전하게, 최대 2GB까지.',

      // Header
      'header.back': '해봄',
      'header.title': '영상 압축',

      // Privacy banner
      'privacy.text': '모든 파일은 브라우저에서 처리되며 서버에 업로드되지 않습니다',

      // Dropzone
      'dropzone.title': '영상 파일을 드래그하거나 클릭하여 선택하세요',
      'dropzone.sub': '또는 파일을 여기에 끌어다 놓으세요',
      'dropzone.disabled': '최대 용량에 도달했습니다',

      // Capacity
      'capacity.label': '등록 용량',

      // File list
      'filelist.title': '선택된 파일',
      'filelist.count': '개',

      // Quality options
      'quality.max.title': '최대 압축',
      'quality.max.desc': '용량 최소화 · 화질 다소 저하',
      'quality.standard.title': '일반 압축',
      'quality.standard.desc': '용량과 화질의 균형',
      'quality.high.title': '고화질 압축',
      'quality.high.desc': '화질 우선 · 용량 소폭 감소',

      // Compress button
      'compress.btn': '압축 시작',

      // Processing
      'processing.title': '압축 중입니다...',
      'processing.sub': '잠시만 기다려주세요',
      'processing.progress': '압축 중... ({current}/{total})',

      // Results
      'results.title': '압축 완료',
      'results.downloadAll': '전체 다운로드',
      'results.download': '다운로드',
      'results.error': '오류',
      'results.decreased': '감소',
      'results.increased': '증가',

      // Size labels
      'size.original': '원본',
      'size.compressed': '압축',

      // Help
      'help.text': 'MP4 영상 파일을 업로드하면 브라우저에서 <strong>하드웨어 가속</strong>으로 직접 압축합니다. <strong>최대 2GB</strong>까지 등록할 수 있으며, 모든 처리는 내 기기에서만 이루어지므로 개인정보가 안전합니다.',

      // Alerts & errors
      'alert.capacityExceeded': '용량 한도(2GB)를 초과하여 "{name}"을(를) 추가할 수 없습니다.',
      'alert.webcodecs': '이 브라우저는 WebCodecs를 지원하지 않습니다. Chrome 94+ 또는 Edge 94+ 브라우저를 사용해주세요.',
      'error.noCodec': '이 브라우저에서 지원하는 비디오 코덱을 찾을 수 없습니다.',
      'error.noVideoTrack': '비디오 트랙을 찾을 수 없습니다.',
      'error.decoderUnsupported': '이 비디오 코덱은 디코딩할 수 없습니다: {codec}',
      'error.encoderError': 'VideoEncoder 오류: {message}',
      'error.decoderError': 'VideoDecoder 오류: {message}',
      'error.fileRead': '파일 읽기 오류: {message}',
      'error.compressFailed': '압축 중 오류가 발생했습니다.',
      'error.remove': '{name} 제거',

      // Aria labels
      'aria.privacyBanner': '개인정보 보호 안내',
      'aria.fileUpload': '파일 업로드',
      'aria.dropzone': '영상 파일을 드래그하거나 클릭하여 선택',
      'aria.fileInput': '영상 파일 선택',
      'aria.supportedFormats': '지원 형식',
      'aria.capacity': '등록 용량',
      'aria.capacityUsage': '용량 사용률',
      'aria.fileList': '선택된 파일 목록',
      'aria.compressProgress': '압축 진행률',
      'aria.compressResults': '압축 결과',
      'aria.downloadAll': '전체 파일 다운로드',
      'aria.help': '도움말',
    },

    en: {
      'seo.title': 'Video Compressor | Haebom',
      'seo.description': 'Free online video compression. Compress MP4 videos directly in your browser with hardware acceleration. No server uploads, safe and secure, up to 2GB.',

      'header.back': 'Haebom',
      'header.title': 'Video Compressor',

      'privacy.text': 'All files are processed in your browser and never uploaded to a server',

      'dropzone.title': 'Drag & drop video files or click to select',
      'dropzone.sub': 'Or drop files here',
      'dropzone.disabled': 'Maximum capacity reached',

      'capacity.label': 'Capacity',

      'filelist.title': 'Selected Files',
      'filelist.count': ' files',

      'quality.max.title': 'Max Compression',
      'quality.max.desc': 'Smallest size · Lower quality',
      'quality.standard.title': 'Standard',
      'quality.standard.desc': 'Balance of size and quality',
      'quality.high.title': 'High Quality',
      'quality.high.desc': 'Quality first · Slight size reduction',

      'compress.btn': 'Start Compression',

      'processing.title': 'Compressing...',
      'processing.sub': 'Please wait',
      'processing.progress': 'Compressing... ({current}/{total})',

      'results.title': 'Compression Complete',
      'results.downloadAll': 'Download All',
      'results.download': 'Download',
      'results.error': 'Error',
      'results.decreased': 'smaller',
      'results.increased': 'larger',

      'size.original': 'Original',
      'size.compressed': 'Compressed',

      'help.text': 'Upload MP4 video files to compress them directly in your browser using <strong>hardware acceleration</strong>. You can add up to <strong>2GB</strong> of files, and all processing happens on your device, keeping your data safe.',

      'alert.capacityExceeded': 'Cannot add "{name}" — it would exceed the 2GB capacity limit.',
      'alert.webcodecs': 'This browser does not support WebCodecs. Please use Chrome 94+ or Edge 94+.',
      'error.noCodec': 'No supported video codec found in this browser.',
      'error.noVideoTrack': 'No video track found.',
      'error.decoderUnsupported': 'This video codec cannot be decoded: {codec}',
      'error.encoderError': 'VideoEncoder error: {message}',
      'error.decoderError': 'VideoDecoder error: {message}',
      'error.fileRead': 'File read error: {message}',
      'error.compressFailed': 'An error occurred during compression.',
      'error.remove': 'Remove {name}',

      'aria.privacyBanner': 'Privacy notice',
      'aria.fileUpload': 'File upload',
      'aria.dropzone': 'Drag or click to select video files',
      'aria.fileInput': 'Select video files',
      'aria.supportedFormats': 'Supported formats',
      'aria.capacity': 'Capacity',
      'aria.capacityUsage': 'Capacity usage',
      'aria.fileList': 'Selected file list',
      'aria.compressProgress': 'Compression progress',
      'aria.compressResults': 'Compression results',
      'aria.downloadAll': 'Download all files',
      'aria.help': 'Help',
    },

    es: {
      'seo.title': 'Compresor de Video | Haebom',
      'seo.description': 'Compresion de video en linea gratuita. Comprime videos MP4 directamente en tu navegador con aceleracion por hardware. Sin subidas al servidor, seguro, hasta 2GB.',

      'header.back': 'Haebom',
      'header.title': 'Compresor de Video',

      'privacy.text': 'Todos los archivos se procesan en tu navegador y nunca se suben a un servidor',

      'dropzone.title': 'Arrastra y suelta videos o haz clic para seleccionar',
      'dropzone.sub': 'O suelta los archivos aqui',
      'dropzone.disabled': 'Capacidad maxima alcanzada',

      'capacity.label': 'Capacidad',

      'filelist.title': 'Archivos seleccionados',
      'filelist.count': ' archivos',

      'quality.max.title': 'Compresion maxima',
      'quality.max.desc': 'Tamano minimo · Menor calidad',
      'quality.standard.title': 'Estandar',
      'quality.standard.desc': 'Equilibrio entre tamano y calidad',
      'quality.high.title': 'Alta calidad',
      'quality.high.desc': 'Calidad primero · Reduccion leve',

      'compress.btn': 'Iniciar compresion',

      'processing.title': 'Comprimiendo...',
      'processing.sub': 'Por favor espera',
      'processing.progress': 'Comprimiendo... ({current}/{total})',

      'results.title': 'Compresion completada',
      'results.downloadAll': 'Descargar todo',
      'results.download': 'Descargar',
      'results.error': 'Error',
      'results.decreased': 'menor',
      'results.increased': 'mayor',

      'size.original': 'Original',
      'size.compressed': 'Comprimido',

      'help.text': 'Sube archivos de video MP4 para comprimirlos directamente en tu navegador con <strong>aceleracion por hardware</strong>. Puedes agregar hasta <strong>2GB</strong> de archivos, y todo el procesamiento ocurre en tu dispositivo, manteniendo tus datos seguros.',

      'alert.capacityExceeded': 'No se puede agregar "{name}" — excederia el limite de 2GB.',
      'alert.webcodecs': 'Este navegador no soporta WebCodecs. Usa Chrome 94+ o Edge 94+.',
      'error.noCodec': 'No se encontro un codec de video compatible en este navegador.',
      'error.noVideoTrack': 'No se encontro una pista de video.',
      'error.decoderUnsupported': 'Este codec de video no puede decodificarse: {codec}',
      'error.encoderError': 'Error de VideoEncoder: {message}',
      'error.decoderError': 'Error de VideoDecoder: {message}',
      'error.fileRead': 'Error al leer archivo: {message}',
      'error.compressFailed': 'Ocurrio un error durante la compresion.',
      'error.remove': 'Eliminar {name}',

      'aria.privacyBanner': 'Aviso de privacidad',
      'aria.fileUpload': 'Subir archivo',
      'aria.dropzone': 'Arrastra o haz clic para seleccionar videos',
      'aria.fileInput': 'Seleccionar videos',
      'aria.supportedFormats': 'Formatos compatibles',
      'aria.capacity': 'Capacidad',
      'aria.capacityUsage': 'Uso de capacidad',
      'aria.fileList': 'Lista de archivos seleccionados',
      'aria.compressProgress': 'Progreso de compresion',
      'aria.compressResults': 'Resultados de compresion',
      'aria.downloadAll': 'Descargar todos los archivos',
      'aria.help': 'Ayuda',
    },

    pt: {
      'seo.title': 'Compressor de Video | Haebom',
      'seo.description': 'Compressao de video online gratuita. Comprima videos MP4 diretamente no navegador com aceleracao por hardware. Sem upload para servidor, seguro, ate 2GB.',

      'header.back': 'Haebom',
      'header.title': 'Compressor de Video',

      'privacy.text': 'Todos os arquivos sao processados no navegador e nunca sao enviados a um servidor',

      'dropzone.title': 'Arraste e solte videos ou clique para selecionar',
      'dropzone.sub': 'Ou solte os arquivos aqui',
      'dropzone.disabled': 'Capacidade maxima atingida',

      'capacity.label': 'Capacidade',

      'filelist.title': 'Arquivos selecionados',
      'filelist.count': ' arquivos',

      'quality.max.title': 'Compressao maxima',
      'quality.max.desc': 'Menor tamanho · Qualidade reduzida',
      'quality.standard.title': 'Padrao',
      'quality.standard.desc': 'Equilibrio entre tamanho e qualidade',
      'quality.high.title': 'Alta qualidade',
      'quality.high.desc': 'Qualidade primeiro · Reducao leve',

      'compress.btn': 'Iniciar compressao',

      'processing.title': 'Comprimindo...',
      'processing.sub': 'Por favor aguarde',
      'processing.progress': 'Comprimindo... ({current}/{total})',

      'results.title': 'Compressao concluida',
      'results.downloadAll': 'Baixar tudo',
      'results.download': 'Baixar',
      'results.error': 'Erro',
      'results.decreased': 'menor',
      'results.increased': 'maior',

      'size.original': 'Original',
      'size.compressed': 'Comprimido',

      'help.text': 'Envie arquivos de video MP4 para comprimi-los diretamente no navegador com <strong>aceleracao por hardware</strong>. Voce pode adicionar ate <strong>2GB</strong> de arquivos, e todo o processamento acontece no seu dispositivo, mantendo seus dados seguros.',

      'alert.capacityExceeded': 'Nao e possivel adicionar "{name}" — excederia o limite de 2GB.',
      'alert.webcodecs': 'Este navegador nao suporta WebCodecs. Use Chrome 94+ ou Edge 94+.',
      'error.noCodec': 'Nenhum codec de video compativel encontrado neste navegador.',
      'error.noVideoTrack': 'Nenhuma faixa de video encontrada.',
      'error.decoderUnsupported': 'Este codec de video nao pode ser decodificado: {codec}',
      'error.encoderError': 'Erro do VideoEncoder: {message}',
      'error.decoderError': 'Erro do VideoDecoder: {message}',
      'error.fileRead': 'Erro ao ler arquivo: {message}',
      'error.compressFailed': 'Ocorreu um erro durante a compressao.',
      'error.remove': 'Remover {name}',

      'aria.privacyBanner': 'Aviso de privacidade',
      'aria.fileUpload': 'Upload de arquivo',
      'aria.dropzone': 'Arraste ou clique para selecionar videos',
      'aria.fileInput': 'Selecionar videos',
      'aria.supportedFormats': 'Formatos suportados',
      'aria.capacity': 'Capacidade',
      'aria.capacityUsage': 'Uso de capacidade',
      'aria.fileList': 'Lista de arquivos selecionados',
      'aria.compressProgress': 'Progresso da compressao',
      'aria.compressResults': 'Resultados da compressao',
      'aria.downloadAll': 'Baixar todos os arquivos',
      'aria.help': 'Ajuda',
    },
  };

  let currentLang = DEFAULT_LANG;

  /**
   * Detect best language from browser settings
   */
  function detectLanguage() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.indexOf(stored) !== -1) {
      return stored;
    }

    var browserLangs = navigator.languages || [navigator.language || navigator.userLanguage || ''];
    for (var i = 0; i < browserLangs.length; i++) {
      var code = browserLangs[i].toLowerCase().split('-')[0];
      if (SUPPORTED_LANGS.indexOf(code) !== -1) {
        return code;
      }
    }

    return DEFAULT_LANG;
  }

  /**
   * Get translation for key with optional parameter substitution
   * t('alert.capacityExceeded', { name: 'video.mp4' })
   */
  function t(key, params) {
    var dict = translations[currentLang] || translations[DEFAULT_LANG];
    var text = dict[key];
    if (text === undefined) {
      // Fallback to Korean
      text = translations[DEFAULT_LANG][key] || key;
    }
    if (params) {
      Object.keys(params).forEach(function (k) {
        text = text.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
      });
    }
    return text;
  }

  /**
   * Apply translations to all elements with data-i18n attribute
   */
  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var text = t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else {
        el.innerHTML = text;
      }
    });

    // Apply aria-label translations
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      el.setAttribute('aria-label', t(key));
    });

    // Update SEO
    document.title = t('seo.title');
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t('seo.description'));

    // Update html lang attribute
    document.documentElement.lang = currentLang;

    // Update lang selector value if exists
    var selector = document.getElementById('lang-select');
    if (selector) selector.value = currentLang;
  }

  /**
   * Set language and apply
   */
  function setLang(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    applyTranslations();
  }

  /**
   * Get current language
   */
  function getLang() {
    return currentLang;
  }

  // Initialize
  currentLang = detectLanguage();

  return {
    t: t,
    setLang: setLang,
    getLang: getLang,
    applyTranslations: applyTranslations,
    SUPPORTED_LANGS: SUPPORTED_LANGS,
  };
})();
