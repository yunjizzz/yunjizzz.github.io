/**
 * 공통 푸터 + 제안 모달 (다국어 지원)
 * 모든 페이지에서 <script src="/footer.js"></script>로 로드
 * localStorage 'lang' 키로 언어 감지 (ko/en/es/pt)
 */
(function () {
  var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyluXtiKCNNBoO9GFu2aoV1pu3OpCU2BTlGmbF8MBxn6bE25dwiRLcNerZckrYEUlpT/exec';

  // --- 다국어 번역 ---
  var i18n = {
    ko: {
      footerLogo: '해봄',
      footerHome: '홈',
      footerSuggest: '제안하기',
      footerCopy: '해봄. All rights reserved.',
      modalTitle: '제안하기',
      modalDesc: '해봄에 추가되었으면 하는 기능이나 개선 사항을 알려주세요.',
      modalCatLabel: '카테고리',
      catFeature: '새 기능 제안',
      catImprove: '기존 기능 개선',
      catBug: '버그 제보',
      catOther: '기타',
      modalContentLabel: '내용',
      modalPlaceholder: '어떤 도구가 있으면 좋겠나요?',
      modalSubmit: '보내기',
      modalSubmitting: '보내는 중...',
      modalClose: '닫기',
      successIcon: '💚',
      successTitle: '제안이 전달되었습니다!',
      successSub: '소중한 의견 감사합니다.',
      errorIcon: '😥',
      errorTitle: '전송에 실패했습니다',
      errorSub: '잠시 후 다시 시도해주세요.',
    },
    en: {
      footerLogo: 'Haebom',
      footerHome: 'Home',
      footerSuggest: 'Suggest',
      footerCopy: 'Haebom. All rights reserved.',
      modalTitle: 'Suggest',
      modalDesc: 'Let us know about features or improvements you\'d like to see.',
      modalCatLabel: 'Category',
      catFeature: 'New feature',
      catImprove: 'Improvement',
      catBug: 'Bug report',
      catOther: 'Other',
      modalContentLabel: 'Details',
      modalPlaceholder: 'What tool would you like to see?',
      modalSubmit: 'Submit',
      modalSubmitting: 'Submitting...',
      modalClose: 'Close',
      successIcon: '💚',
      successTitle: 'Your suggestion has been sent!',
      successSub: 'Thank you for your feedback.',
      errorIcon: '😥',
      errorTitle: 'Failed to send',
      errorSub: 'Please try again later.',
    },
    es: {
      footerLogo: 'Haebom',
      footerHome: 'Inicio',
      footerSuggest: 'Sugerir',
      footerCopy: 'Haebom. Todos los derechos reservados.',
      modalTitle: 'Sugerir',
      modalDesc: 'Cuéntanos qué funciones o mejoras te gustaría ver.',
      modalCatLabel: 'Categoría',
      catFeature: 'Nueva función',
      catImprove: 'Mejora',
      catBug: 'Reporte de error',
      catOther: 'Otro',
      modalContentLabel: 'Contenido',
      modalPlaceholder: '¿Qué herramienta te gustaría tener?',
      modalSubmit: 'Enviar',
      modalSubmitting: 'Enviando...',
      modalClose: 'Cerrar',
      successIcon: '💚',
      successTitle: '¡Tu sugerencia ha sido enviada!',
      successSub: 'Gracias por tu opinión.',
      errorIcon: '😥',
      errorTitle: 'Error al enviar',
      errorSub: 'Por favor, inténtalo de nuevo más tarde.',
    },
    pt: {
      footerLogo: 'Haebom',
      footerHome: 'Início',
      footerSuggest: 'Sugerir',
      footerCopy: 'Haebom. Todos os direitos reservados.',
      modalTitle: 'Sugerir',
      modalDesc: 'Conte-nos sobre funcionalidades ou melhorias que gostaria de ver.',
      modalCatLabel: 'Categoria',
      catFeature: 'Nova funcionalidade',
      catImprove: 'Melhoria',
      catBug: 'Relatar bug',
      catOther: 'Outro',
      modalContentLabel: 'Conteúdo',
      modalPlaceholder: 'Que ferramenta gostaria de ter?',
      modalSubmit: 'Enviar',
      modalSubmitting: 'Enviando...',
      modalClose: 'Fechar',
      successIcon: '💚',
      successTitle: 'Sua sugestão foi enviada!',
      successSub: 'Obrigado pelo seu feedback.',
      errorIcon: '😥',
      errorTitle: 'Falha ao enviar',
      errorSub: 'Por favor, tente novamente mais tarde.',
    },
  };

  function getLang() {
    // 현재 페이지의 html lang 속성을 우선 참조 (i18n 시스템이 설정한 값)
    var htmlLang = (document.documentElement.lang || '').split('-')[0].toLowerCase();
    if (htmlLang && i18n[htmlLang]) return htmlLang;
    // fallback: localStorage
    try {
      var stored = localStorage.getItem('lang');
      if (stored && i18n[stored]) return stored;
    } catch (e) {}
    return 'ko';
  }

  function t(key) {
    var lang = getLang();
    return (i18n[lang] && i18n[lang][key]) || i18n.ko[key] || key;
  }

  // --- html lang 변경 감지 → 푸터/모달 재렌더링 ---
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.attributeName === 'lang') renderFooter();
    });
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  function renderFooter() {
    // 푸터 텍스트 갱신
    var logo = document.querySelector('.haebom-footer-logo');
    var homeLink = document.querySelector('.haebom-footer-link[href="/"]');
    var suggestBtn = document.getElementById('haebom-suggest-open');
    var copy = document.querySelector('.haebom-footer-copy');
    if (logo) logo.textContent = t('footerLogo');
    if (homeLink) homeLink.textContent = t('footerHome');
    if (suggestBtn) suggestBtn.textContent = t('footerSuggest');
    if (copy) copy.innerHTML = '&copy; ' + new Date().getFullYear() + ' ' + t('footerCopy');

    // 모달 텍스트 갱신
    var modal = document.getElementById('haebom-suggest-modal');
    if (!modal) return;
    var h3 = modal.querySelector('h3');
    var desc = modal.querySelector('.hm-desc');
    var catLabel = modal.querySelector('label[for="haebom-suggest-cat"]');
    var catSelect = document.getElementById('haebom-suggest-cat');
    var contentLabel = modal.querySelector('label[for="haebom-suggest-text"]');
    var textarea = document.getElementById('haebom-suggest-text');
    var submit = document.getElementById('haebom-suggest-submit');
    var closeBtn = document.getElementById('haebom-suggest-close');

    if (h3) h3.textContent = t('modalTitle');
    if (desc) desc.textContent = t('modalDesc');
    if (catLabel) catLabel.textContent = t('modalCatLabel');
    if (contentLabel) contentLabel.textContent = t('modalContentLabel');
    if (textarea) textarea.placeholder = t('modalPlaceholder');
    if (submit && !submit.disabled) submit.textContent = t('modalSubmit');
    if (closeBtn) closeBtn.setAttribute('aria-label', t('modalClose'));

    if (catSelect) {
      var options = catSelect.options;
      var cats = ['catFeature', 'catImprove', 'catBug', 'catOther'];
      for (var i = 0; i < cats.length && i < options.length; i++) {
        options[i].value = t(cats[i]);
        options[i].textContent = t(cats[i]);
      }
    }
  }

  // --- 전역 노출 (수동 호출용) ---
  window._refreshFooterLang = renderFooter;

  // --- 스타일 삽입 ---
  var style = document.createElement('style');
  style.textContent = [
    '.haebom-footer{border-top:1px solid #d0eadf;padding:24px 24px 32px;text-align:center;background:#f7fdf9;margin-top:40px;}',
    '.haebom-footer-inner{max-width:760px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;}',
    '.haebom-footer-logo{font-size:14px;font-weight:800;color:#10b981;letter-spacing:-0.02em;}',
    '.haebom-footer-links{display:flex;gap:16px;align-items:center;}',
    '.haebom-footer-link{font-size:13px;font-weight:600;color:#607a6e;text-decoration:none;transition:color 200ms ease;cursor:pointer;background:none;border:none;font-family:inherit;padding:0;}',
    '.haebom-footer-link:hover{color:#10b981;}',
    '.haebom-footer-copy{font-size:11px;color:#607a6e;opacity:0.7;}',
    '.haebom-modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:100;align-items:center;justify-content:center;backdrop-filter:blur(4px);}',
    '.haebom-modal-overlay.open{display:flex;}',
    '.haebom-modal{background:#fff;border:1px solid #d0eadf;border-radius:20px;padding:32px;width:90%;max-width:440px;box-shadow:0 16px 48px rgba(0,0,0,0.15);position:relative;animation:haebomModalIn 0.3s ease;}',
    '@keyframes haebomModalIn{from{opacity:0;transform:translateY(20px) scale(0.96);}to{opacity:1;transform:translateY(0) scale(1);}}',
    '.haebom-modal-close{position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;border:none;background:#edf7f2;color:#607a6e;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 200ms ease,color 200ms ease;}',
    '.haebom-modal-close:hover{background:#d0eadf;color:#111c16;}',
    '.haebom-modal h3{font-size:20px;font-weight:800;margin-bottom:4px;color:#10b981;}',
    '.haebom-modal .hm-desc{font-size:13px;color:#607a6e;margin-bottom:20px;}',
    '.haebom-modal label{display:block;font-size:13px;font-weight:600;color:#111c16;margin-bottom:6px;}',
    '.haebom-modal select,.haebom-modal textarea{width:100%;padding:10px 14px;border:1px solid #d0eadf;border-radius:10px;background:#edf7f2;color:#111c16;font-family:inherit;font-size:14px;resize:none;transition:border-color 200ms ease;}',
    '.haebom-modal select:focus,.haebom-modal textarea:focus{outline:none;border-color:#10b981;}',
    '.haebom-modal select{margin-bottom:16px;cursor:pointer;}',
    '.haebom-modal textarea{min-height:120px;margin-bottom:20px;}',
    '.hm-submit{width:100%;padding:12px;border:none;border-radius:12px;background:#10b981;color:#fff;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;transition:opacity 200ms ease,transform 200ms ease;}',
    '.hm-submit:hover{opacity:0.9;transform:translateY(-1px);}',
    '.hm-submit:active{transform:scale(0.98);}',
    '.hm-submit:disabled{opacity:0.5;cursor:not-allowed;transform:none;}',
    '.hm-result{text-align:center;padding:40px 0;}',
    '.hm-result .ri{font-size:48px;margin-bottom:12px;}',
    '.hm-result .rt{font-size:16px;font-weight:600;color:#111c16;}',
    '.hm-result .rs{font-size:13px;color:#607a6e;margin-top:6px;}',
  ].join('\n');
  document.head.appendChild(style);

  // --- 푸터 HTML ---
  var footer = document.createElement('footer');
  footer.className = 'haebom-footer';
  footer.innerHTML =
    '<div class="haebom-footer-inner">' +
      '<span class="haebom-footer-logo">' + t('footerLogo') + '</span>' +
      '<div class="haebom-footer-links">' +
        '<a href="/" class="haebom-footer-link">' + t('footerHome') + '</a>' +
        '<button class="haebom-footer-link" id="haebom-suggest-open">' + t('footerSuggest') + '</button>' +
      '</div>' +
      '<span class="haebom-footer-copy">&copy; ' + new Date().getFullYear() + ' ' + t('footerCopy') + '</span>' +
    '</div>';
  document.body.appendChild(footer);

  // --- 모달 HTML ---
  var overlay = document.createElement('div');
  overlay.className = 'haebom-modal-overlay';
  overlay.id = 'haebom-suggest-modal';
  overlay.innerHTML =
    '<div class="haebom-modal">' +
      '<button class="haebom-modal-close" id="haebom-suggest-close" aria-label="' + t('modalClose') + '">&times;</button>' +
      '<div id="haebom-suggest-form">' +
        '<h3>' + t('modalTitle') + '</h3>' +
        '<p class="hm-desc">' + t('modalDesc') + '</p>' +
        '<label for="haebom-suggest-cat">' + t('modalCatLabel') + '</label>' +
        '<select id="haebom-suggest-cat">' +
          '<option value="' + t('catFeature') + '">' + t('catFeature') + '</option>' +
          '<option value="' + t('catImprove') + '">' + t('catImprove') + '</option>' +
          '<option value="' + t('catBug') + '">' + t('catBug') + '</option>' +
          '<option value="' + t('catOther') + '">' + t('catOther') + '</option>' +
        '</select>' +
        '<label for="haebom-suggest-text">' + t('modalContentLabel') + '</label>' +
        '<textarea id="haebom-suggest-text" placeholder="' + t('modalPlaceholder') + '"></textarea>' +
        '<button class="hm-submit" id="haebom-suggest-submit">' + t('modalSubmit') + '</button>' +
      '</div>' +
      '<div id="haebom-suggest-result" class="hm-result" style="display:none;">' +
        '<div class="ri"></div>' +
        '<div class="rt"></div>' +
        '<div class="rs"></div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  // --- 모달 로직 ---
  var openBtn = document.getElementById('haebom-suggest-open');
  var closeBtn = document.getElementById('haebom-suggest-close');
  var submitBtn = document.getElementById('haebom-suggest-submit');
  var formWrap = document.getElementById('haebom-suggest-form');
  var resultWrap = document.getElementById('haebom-suggest-result');

  function openModal() { overlay.classList.add('open'); }
  function closeModal() {
    overlay.classList.remove('open');
    setTimeout(function () {
      formWrap.style.display = '';
      resultWrap.style.display = 'none';
      document.getElementById('haebom-suggest-text').value = '';
      submitBtn.disabled = false;
      submitBtn.textContent = t('modalSubmit');
    }, 300);
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  // 메인 페이지의 기존 제안 버튼도 연동
  var mainSuggestBtn = document.getElementById('suggest-open');
  if (mainSuggestBtn) {
    mainSuggestBtn.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });
  }

  submitBtn.addEventListener('click', function () {
    var content = document.getElementById('haebom-suggest-text').value.trim();
    if (!content) {
      document.getElementById('haebom-suggest-text').focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = t('modalSubmitting');

    var category = document.getElementById('haebom-suggest-cat').value;
    var page = location.pathname;

    fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: category, content: content, page: page })
    })
    .then(function () {
      formWrap.style.display = 'none';
      resultWrap.style.display = '';
      resultWrap.querySelector('.ri').textContent = t('successIcon');
      resultWrap.querySelector('.rt').textContent = t('successTitle');
      resultWrap.querySelector('.rs').textContent = t('successSub');
    })
    .catch(function () {
      formWrap.style.display = 'none';
      resultWrap.style.display = '';
      resultWrap.querySelector('.ri').textContent = t('errorIcon');
      resultWrap.querySelector('.rt').textContent = t('errorTitle');
      resultWrap.querySelector('.rs').textContent = t('errorSub');
    });
  });
})();
