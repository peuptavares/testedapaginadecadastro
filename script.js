/* ============ CONFIGURAÇÃO — troque aqui ============ */
const META_PIXEL_ID = 'SEU_PIXEL_ID_AQUI';
const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX';
const WEBHOOK_URL = 'https://script.google.com/macros/s/SEU_DEPLOYMENT_ID/exec';
const WHATSAPP_GROUP_LINK = 'https://chat.whatsapp.com/SEU_LINK_DE_GRUPO';
const COMMERCIAL_LINK = 'https://wa.me/5500000000000?text=Ol%C3%A1%2C%20vim%20do%20playbook%20da%20MIDAS';
/* ===================================================== */

(function initMetaPixel() {
  if (!META_PIXEL_ID || META_PIXEL_ID.indexOf('SEU_PIXEL_ID') === 0) return;
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', META_PIXEL_ID);
  fbq('track', 'PageView');
})();

(function initGA4() {
  if (!GA4_MEASUREMENT_ID || GA4_MEASUREMENT_ID.indexOf('G-XXXX') === 0) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_MEASUREMENT_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA4_MEASUREMENT_ID);
})();

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term: params.get('utm_term') || '',
    fbclid: params.get('fbclid') || '',
    gclid: params.get('gclid') || ''
  };
}

function maskWhatsapp(value) {
  let digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length > 10) {
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim().replace(/-$/, '');
  }
  if (digits.length > 6) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim().replace(/-$/, '');
  }
  if (digits.length > 2) {
    return digits.replace(/(\d{2})(\d{0,5})/, '($1) $2').trim();
  }
  if (digits.length > 0) {
    return digits.replace(/(\d{0,2})/, '($1');
  }
  return '';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setFieldError(field, hasError) {
  field.closest('.field').classList.toggle('has-error', hasError);
}

/* ============ PÁGINA DE CADASTRO ============ */
function initLeadForm() {
  const form = document.getElementById('leadForm');
  if (!form) return;

  const whatsappInput = document.getElementById('whatsapp');
  const submitBtn = document.getElementById('submitBtn');
  const feedback = document.getElementById('formFeedback');

  const qp = getQueryParams();
  Object.keys(qp).forEach(key => {
    const hidden = document.getElementById(key);
    if (hidden) hidden.value = qp[key];
  });

  whatsappInput.addEventListener('input', () => {
    whatsappInput.value = maskWhatsapp(whatsappInput.value);
  });

  function showFeedback(message) {
    feedback.textContent = message;
    feedback.classList.add('show');
  }

  function hideFeedback() {
    feedback.classList.remove('show');
  }

  function validate() {
    let valid = true;

    const nome = document.getElementById('nome');
    if (!nome.value.trim()) { setFieldError(nome, true); valid = false; }
    else setFieldError(nome, false);

    const whatsappDigits = whatsappInput.value.replace(/\D/g, '');
    if (whatsappDigits.length !== 11) { setFieldError(whatsappInput, true); valid = false; }
    else setFieldError(whatsappInput, false);

    const email = document.getElementById('email');
    if (!isValidEmail(email.value.trim())) { setFieldError(email, true); valid = false; }
    else setFieldError(email, false);

    return valid;
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    hideFeedback();

    if (!validate()) {
      showFeedback('Verifique os campos destacados antes de enviar.');
      return;
    }

    const nome = document.getElementById('nome').value.trim();
    const qualificado = 'nao';
    document.getElementById('qualificado').value = qualificado;

    const payload = {
      nome: nome,
      whatsapp: whatsappInput.value.trim(),
      email: document.getElementById('email').value.trim(),
      qualificado: qualificado,
      utm_source: document.getElementById('utm_source').value,
      utm_medium: document.getElementById('utm_medium').value,
      utm_campaign: document.getElementById('utm_campaign').value,
      utm_content: document.getElementById('utm_content').value,
      utm_term: document.getElementById('utm_term').value,
      fbclid: document.getElementById('fbclid').value,
      gclid: document.getElementById('gclid').value,
      data_hora: new Date().toISOString(),
      url_origem: window.location.href
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (!response.ok) throw new Error('Falha no envio');

      if (window.fbq) {
        fbq('track', 'Lead', { qualificado: qualificado });
      }
      if (window.gtag) {
        gtag('event', 'generate_lead', { qualificado: qualificado });
      }

      const firstName = encodeURIComponent(nome);
      window.location.href = 'obrigado.html?nome=' + firstName + '&q=' + qualificado;
    })
    .catch(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Quero Receber o Playbook';
      showFeedback('Não foi possível enviar seu cadastro agora. Verifique sua conexão e tente novamente.');
    });
  });
}

/* ============ PÁGINA DE OBRIGADO ============ */
function initThanksPage() {
  const title = document.getElementById('thanksTitle');
  if (!title) return;

  const params = new URLSearchParams(window.location.search);
  const nome = params.get('nome');
  const qualificado = params.get('q');

  title.textContent = (nome ? nome + ', seu' : 'Seu') + ' playbook está a caminho.';

  const whatsappLink = document.getElementById('whatsappGroupLink');
  if (whatsappLink) whatsappLink.href = WHATSAPP_GROUP_LINK;

  if (qualificado === 'sim') {
    const block = document.getElementById('qualifiedBlock');
    const commercialLink = document.getElementById('commercialLink');
    if (commercialLink) commercialLink.href = COMMERCIAL_LINK;
    if (block) block.hidden = false;

    if (window.fbq) {
      fbq('trackCustom', 'LeadQualificado');
    }
    if (window.gtag) {
      gtag('event', 'lead_qualificado');
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  initLeadForm();
  initThanksPage();
});
