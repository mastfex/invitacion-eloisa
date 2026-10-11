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

  // Google Forms: el formulario queda embebido solo con un enlace público de Google.
  // Un enlace corto forms.gle se ofrece como botón, pues no es embebible directamente.
  const settings = window.ELOISA_CONFIG || {};
  const fullGoogleForm = (value) => {
    try {
      const u = new URL(value);
      return u.protocol === 'https:' &&
        u.hostname === 'docs.google.com' &&
        /^\/forms\/d\/(?:e\/)?[^/]+\/viewform\/?$/.test(u.pathname);
    } catch { return false; }
  };
  const shortGoogleForm = (value) => {
    try {
      const u = new URL(value);
      return u.protocol === 'https:' && u.hostname === 'forms.gle' &&
        /^\/[A-Za-z0-9_-]+\/?$/.test(u.pathname);
    } catch { return false; }
  };

  const providedPublic = String(settings.GOOGLE_FORM_PUBLIC_URL || '').trim();
  const providedEmbed = String(settings.GOOGLE_FORM_EMBED_URL || '').trim();
  const acceptedPublic = fullGoogleForm(providedPublic) || shortGoogleForm(providedPublic);
  const acceptedEmbed = fullGoogleForm(providedEmbed);
  const formUrl = acceptedPublic ? providedPublic : (acceptedEmbed ? providedEmbed : '');
  const empty = document.querySelector('#form-loading');
  if (fullGoogleForm(formUrl)) {
    const embed = new URL(formUrl);
    embed.searchParams.set('embedded', 'true');
    const wrapper = document.querySelector('#form-container');
    const iframe = document.querySelector('#google-form');
    const openLink = document.querySelector('#form-external');
    iframe.src = embed.toString();
    openLink.href = formUrl;
    wrapper.hidden = false;
    empty.hidden = true;
  } else if (shortGoogleForm(formUrl)) {
    empty.querySelector('h3').textContent = '¡Confirma tu asistencia!';
    empty.querySelector('p').textContent =
      'Toca el botón para completar el formulario de Eloísa en Google Forms.';
    const link = document.createElement('a');
    link.className = 'button button-primary';
    link.textContent = 'Abrir formulario de asistencia ↗';
    link.href = formUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.marginTop = '22px';
    empty.append(link);
  }
})();
