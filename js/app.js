'use strict';
(() => {
  const eventStart = Date.parse('2026-10-17T12:00:00-03:00');
  const eventEnd = Date.parse('2026-10-17T16:00:00-03:00');
  const countdown = () => {
    const now = Date.now();
    const remaining = Math.max(0, eventStart - now);
    const d = Math.floor(remaining / 86400000);
    const h = Math.floor((remaining % 86400000) / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    document.querySelector('#days').textContent = String(d);
    document.querySelector('#hours').textContent = String(h).padStart(2, '0');
    document.querySelector('#minutes').textContent = String(m).padStart(2, '0');
    if(now >= eventEnd) document.querySelector('#countdown-note').textContent = '¡Gracias por ser parte de un día tan especial!';
    else if(now >= eventStart) document.querySelector('#countdown-note').textContent = '¡Hoy celebramos la primera vuelta al sol de Eloísa!';
  };
  countdown();
  window.setInterval(countdown, 60000);

  const modal = document.getElementById('card-lightbox');
  const trigger = document.getElementById('open-card');
  const closer = document.getElementById('close-card');
  const closeModal = () => {
    modal.hidden = true; document.body.classList.remove('modal-open');
    trigger.focus();
  };
  trigger.addEventListener('click', () => { modal.hidden = false; document.body.classList.add('modal-open'); closer.focus(); });
  closer.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if(modal.hidden) return;
    if(e.key === 'Escape') closeModal();
    if(e.key === 'Tab') { e.preventDefault(); closer.focus(); }
  });

  const settings = window.ELOISA_CONFIG || {};
  const embedUrl = settings.GOOGLE_FORM_EMBED_URL || '';
  const publicUrl = settings.GOOGLE_FORM_PUBLIC_URL || '';
  const validUrl = (v) => {
    try { const u = new URL(v); return u.protocol === 'https:' && ((u.hostname === 'docs.google.com' && /\/forms\//.test(u.pathname)) || (u.hostname === 'forms.gle' && u.pathname.length > 1)); }
    catch { return false; }
  };
  if (validUrl(embedUrl)) {
    document.querySelector('#form-loading').hidden = true;
    const wrapper = document.querySelector('#form-container');
    wrapper.hidden = false;
    const iframe = document.querySelector('#google-form');
    iframe.src = embedUrl;
    const openLink = document.querySelector('#form-external');
    openLink.href = validUrl(publicUrl) ? publicUrl : embedUrl;
  }
})();
