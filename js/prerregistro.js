// Prerregistro COEPROTEC: el formulario permanece bloqueado hasta la aprobación legal y QA.
(() => {
  const form = document.getElementById('preregistro-form');
  const status = document.getElementById('preregistro-aviso');
  if (!form || !status) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fieldset = form.querySelector('fieldset');
    if (!fieldset || fieldset.disabled) return;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const token = window.turnstile?.getResponse?.();
    if (!token) {
      status.textContent = 'Completa la verificación de seguridad.';
      return;
    }
    const payload = {
      nombre: String(data.get('nombre') || '').trim(),
      correo: String(data.get('correo') || '').trim(),
      telefono: String(data.get('telefono') || '').trim(),
      interes: String(data.get('interes') || ''),
      consentimiento: data.get('consentimiento') === 'on',
      marketing: data.get('marketing') === 'on',
      turnstileToken: token
    };
    if (!payload.consentimiento) {
      status.textContent = 'Debes aceptar el consentimiento necesario para gestionar tu solicitud.';
      return;
    }
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    status.textContent = 'Validando y enviando tu registro…';
    try {
      const response = await fetch('/api/prerregistro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) throw new Error(result.error || 'No fue posible registrar tu solicitud.');
      status.textContent = 'Tu prerregistro fue recibido correctamente.';
      form.reset();
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : 'No fue posible registrar tu solicitud.';
    } finally {
      window.turnstile?.reset?.();
      button.disabled = false;
    }
  });
})();


// Modal de privacidad: la aceptación del documento no marca automáticamente el consentimiento.
(() => {
  const dialog = document.getElementById('privacy-dialog');
  const body = document.getElementById('privacy-dialog-body');
  if (!dialog || !body) return;
  let loaded = false;
  let lastTrigger = null;
  document.querySelectorAll('[data-open-privacy]').forEach(link => link.addEventListener('click', async event => {
    event.preventDefault();
    event.stopPropagation();
    lastTrigger = link;
    dialog.showModal();
    if (loaded) return;
    try {
      const response = await fetch('privacidad.html', { credentials: 'same-origin' });
      if (!response.ok) throw new Error('No se pudo cargar el documento');
      const documentHTML = new DOMParser().parseFromString(await response.text(), 'text/html');
      const main = documentHTML.querySelector('.privacy-main');
      if (!main) throw new Error('Documento no disponible');
      main.querySelector('a[href*="#prerregistro"]')?.remove();
      main.querySelector('h1')?.remove();
      body.replaceChildren(...Array.from(main.children).map(node => document.importNode(node, true)));
      loaded = true;
    } catch (error) {
      body.textContent = 'No se pudo cargar la información. Puedes consultarla en la página de privacidad.';
      const fallback = document.createElement('a');
      fallback.href = 'privacidad.html';
      fallback.textContent = 'Ver información de privacidad';
      body.append(document.createElement('p'), fallback);
    }
  }));
  dialog.querySelectorAll('[data-close-privacy]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => lastTrigger?.focus());
})();

// Video oficial 2026: reproducción al entrar en pantalla, con audio si el navegador lo permite.
(() => {
  const video = document.getElementById('video-oficial-2026');
  const button = document.getElementById('video-activar-sonido');
  if (!video || !button) return;

  let visible = false;
  let audioRequested = false;
  const updateLabel = () => {
    button.textContent = video.muted ? 'Activar sonido 🔊' : 'Silenciar video 🔇';
  };
  const playWhenVisible = async () => {
    if (!visible) return;
    try {
      if (audioRequested) video.muted = false;
      await video.play();
    } catch (_) {
      video.muted = true;
      video.play().catch(() => {});
    }
    updateLabel();
  };
  button.addEventListener('click', async () => {
    if (!video.muted) {
      audioRequested = false;
      video.muted = true;
      updateLabel();
      return;
    }
    audioRequested = true;
    video.muted = false;
    video.volume = 1;
    await playWhenVisible();
  });
  // La interacción con la página puede permitir audio; nunca se fuerza si el navegador lo bloquea.
  document.addEventListener('pointerdown', event => {
    if (visible && !button.contains(event.target) && !audioRequested) {
      audioRequested = true;
      playWhenVisible();
    }
  }, { passive: true });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) playWhenVisible();
      else video.pause();
    }, { threshold: 0.55 });
    observer.observe(video);
  } else {
    visible = true;
    playWhenVisible();
  }
  video.addEventListener('volumechange', updateLabel);
  updateLabel();
})();
