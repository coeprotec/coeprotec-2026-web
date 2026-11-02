const menuButton = document.getElementById('menu-button');
const mainNav = document.getElementById('main-nav');

if (menuButton && mainNav) {
  const closeMenu = () => {
    mainNav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú');
  };
  window.toggleMenu = () => {
    const open = mainNav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };
  mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
}

const events = Array.isArray(window.COEPROTEC_EVENTS) ? window.COEPROTEC_EVENTS : [];
const today = new Date();
today.setHours(0, 0, 0, 0);

const upcoming = events
  .filter(item => {
    if (!item || !/^\d{4}-\d{2}-\d{2}$/.test(item.date || '')) return false;
    const date = new Date(`${item.date}T12:00:00`);
    return !Number.isNaN(date.valueOf()) && date >= today && item.title && item.summary;
  })
  .sort((a, b) => a.date.localeCompare(b.date));

// 1. Tarjeta de evento vigente en el Hero principal (index.html)
const heroEventCard = document.getElementById('hero-event-card');
if (heroEventCard) {
  heroEventCard.replaceChildren();

  if (upcoming.length) {
    const next = upcoming[0];
    const date = new Date(`${next.date}T12:00:00`);
    const dateFormatted = new Intl.DateTimeFormat('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);

    const top = document.createElement('div');
    top.className = 'hero-event-top';

    const badge = document.createElement('span');
    badge.className = 'hero-event-badge';
    const dot = document.createElement('span');
    dot.className = 'hero-event-dot';
    dot.setAttribute('aria-hidden', 'true');
    badge.append(
      dot,
      document.createTextNode(
        next.kind === 'aliado'
          ? 'EVENTO ALIADO · ' + (next.participation || 'PARTICIPACIÓN').toUpperCase()
          : 'PRÓXIMO EVENTO COEPROTEC'
      )
    );

    const dateSpan = document.createElement('span');
    dateSpan.className = 'hero-event-date';
    dateSpan.textContent = [dateFormatted, next.time ? `${next.time} h` : ''].filter(Boolean).join(' · ');

    top.append(badge, dateSpan);

    const title = document.createElement('h2');
    title.className = 'hero-event-title';
    title.textContent = next.title;

    const metaList = document.createElement('ul');
    metaList.className = 'hero-event-meta';

    if (next.organizer || next.participation) {
      const liOrg = document.createElement('li');
      const strongOrg = document.createElement('strong');
      strongOrg.textContent = 'Organizador y participación';
      const spanOrg = document.createElement('span');
      spanOrg.textContent = [
        next.organizer ? `Organiza: ${next.organizer}` : '',
        next.participation ? `COEPROTEC: ${next.participation}` : ''
      ]
        .filter(Boolean)
        .join(' · ');
      liOrg.append(strongOrg, spanOrg);
      metaList.append(liOrg);
    }

    if (next.mode || next.venue) {
      const liVenue = document.createElement('li');
      const strongVenue = document.createElement('strong');
      strongVenue.textContent = 'Modalidad y ubicación';
      const spanVenue = document.createElement('span');
      spanVenue.textContent = [next.mode, next.venue].filter(Boolean).join(' · ');
      liVenue.append(strongVenue, spanVenue);
      metaList.append(liVenue);
    }

    const actions = document.createElement('div');
    actions.className = 'hero-event-actions';

    const agendaBtn = document.createElement('a');
    agendaBtn.className = 'button button-gold button-sm';
    agendaBtn.href = 'inscripciones.html';
    agendaBtn.textContent = 'Consultar agenda ↗';
    actions.append(agendaBtn);

    if (next.speakersUrl && /^(?:\.\/)?[a-z0-9/_?=&%.-]+(?:#[a-z0-9_-]+)?$/i.test(next.speakersUrl)) {
      const speakersBtn = document.createElement('a');
      speakersBtn.className = 'button button-outline-light button-sm';
      speakersBtn.href = next.speakersUrl;
      speakersBtn.textContent = 'Ver ponentes y mesas ↗';
      actions.append(speakersBtn);
    }

    heroEventCard.append(top, title, metaList, actions);
  } else {
    // Si el evento ya pasó o no hay eventos futuros, no mostrar un evento vencido como próximo
    const top = document.createElement('div');
    top.className = 'hero-event-top';
    const badge = document.createElement('span');
    badge.className = 'hero-event-badge';
    badge.textContent = 'AGENDA INSTITUCIONAL';
    top.append(badge);

    const title = document.createElement('h2');
    title.className = 'hero-event-title';
    title.textContent = 'Nuevas actividades en preparación';

    const metaList = document.createElement('ul');
    metaList.className = 'hero-event-meta';
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = 'Estamos programando los próximos encuentros académicos y de capacitación profesional de COEPROTEC.';
    li.append(span);
    metaList.append(li);

    const actions = document.createElement('div');
    actions.className = 'hero-event-actions';
    const preregBtn = document.createElement('a');
    preregBtn.className = 'button button-gold button-sm';
    preregBtn.href = '#prerregistro';
    preregBtn.textContent = 'Ir al prerregistro ↓';
    const agendaBtn = document.createElement('a');
    agendaBtn.className = 'button button-outline-light button-sm';
    agendaBtn.href = 'inscripciones.html';
    agendaBtn.textContent = 'Ver agenda ↗';
    actions.append(preregBtn, agendaBtn);

    heroEventCard.append(top, title, metaList, actions);
  }
}

// 2. Panel de Agenda en Portada (index.html)
const homeAgenda = document.getElementById('agenda-home-content');
if (homeAgenda && upcoming.length) {
  const next = upcoming[0];
  const date = new Date(`${next.date}T12:00:00`);
  homeAgenda.replaceChildren();
  const type = document.createElement('span');
  type.className = 'event-type event-type-light';
  type.textContent =
    next.kind === 'aliado'
      ? 'EVENTO ALIADO · PARTICIPACIÓN INSTITUCIONAL'
      : 'EVENTO COEPROTEC';
  const kicker = document.createElement('span');
  kicker.className = 'agenda-next-date';
  kicker.textContent = new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
  const title = document.createElement('h3');
  title.textContent = next.title;
  const summary = document.createElement('p');
  summary.textContent = next.summary;
  const link = document.createElement('a');
  link.className = 'text-link light';
  link.href = 'inscripciones.html';
  link.textContent = 'Ver agenda y detalles ↗';
  homeAgenda.append(type, kicker, title, summary, link);
}

// 3. Lista de Eventos en Agenda (inscripciones.html)
const eventsList = document.getElementById('events-list');
if (eventsList) {
  if (upcoming.length) {
    eventsList.replaceChildren();
    upcoming.forEach(item => {
      const card = document.createElement('article');
      card.className = 'event-card';
      const date = new Date(`${item.date}T12:00:00`);
      const dateText = new Intl.DateTimeFormat('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
      const dateBox = document.createElement('div');
      dateBox.className = 'event-date';
      const day = document.createElement('strong');
      day.textContent = new Intl.DateTimeFormat('es-PE', { day: '2-digit' }).format(date);
      const month = document.createElement('span');
      month.textContent = new Intl.DateTimeFormat('es-PE', { month: 'short' }).format(date).toUpperCase();
      dateBox.append(day, month);

      const content = document.createElement('div');
      content.className = 'event-content';
      const type = document.createElement('span');
      type.className = 'event-type';
      type.textContent =
        item.kind === 'aliado'
          ? 'EVENTO ALIADO · ' + (item.participation || 'PARTICIPACIÓN INSTITUCIONAL').toUpperCase()
          : 'EVENTO COEPROTEC';
      const meta = document.createElement('p');
      meta.className = 'event-meta';
      meta.textContent = [dateText, item.time, item.mode, item.venue].filter(Boolean).join(' · ');
      const title = document.createElement('h3');
      title.textContent = item.title;
      const summary = document.createElement('p');
      summary.textContent = item.summary;
      content.append(type, meta, title, summary);

      if (item.organizer) {
        const org = document.createElement('p');
        org.className = 'event-organizer';
        org.textContent = 'Organiza: ' + item.organizer;
        content.append(org);
      }

      if (item.speakersUrl && /^(?:\.\/)?[a-z0-9/_?=&%.-]+(?:#[a-z0-9_-]+)?$/i.test(item.speakersUrl)) {
        const speakers = document.createElement('a');
        speakers.className = 'text-link event-speakers-link';
        speakers.href = item.speakersUrl;
        speakers.textContent = 'Ver ponentes y mesas del evento ↗';
        content.append(speakers);
      }

      const externalRegistration =
        item.registrationExternal === true && /^https:\/\/forms\.gle\/[A-Za-z0-9]+$/.test(item.detailsUrl || '');
      const internalDetails =
        !item.registrationExternal && /^(?:\.\/)?[a-z0-9/_?=&%.-]+$/i.test(item.detailsUrl || '');

      if (externalRegistration || internalDetails) {
        const link = document.createElement('a');
        link.className = 'text-link';
        link.href = item.detailsUrl;
        if (externalRegistration) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = 'Inscribirse en formulario de EPG UPC ↗';
        } else {
          link.textContent = item.status === 'open' ? 'Ver inscripción y detalles ↗' : 'Ver detalles ↗';
        }
        content.append(link);
      } else {
        const note = document.createElement('span');
        note.className = 'event-status';
        note.textContent = item.status === 'closed' ? 'Inscripción cerrada' : 'Próximamente más detalles';
        content.append(note);
      }

      card.append(dateBox, content);
      eventsList.append(card);
    });
  }
}

// 4. Videoteca 2025: carga optimizada de los 3 videos oficiales de YouTube al pulsar reproducir
document.querySelectorAll('.yt-facade[data-yt-id]').forEach(button => {
  button.addEventListener('click', () => {
    const videoId = button.getAttribute('data-yt-id');
    const start = button.getAttribute('data-yt-start');
    const title = button.getAttribute('data-yt-title') || 'Video del archivo audiovisual COEPROTEC 2025';
    if (!videoId || !/^[A-Za-z0-9_-]{6,20}$/.test(videoId)) return;

    const params = new URLSearchParams({ autoplay: '1', rel: '0' });
    if (start && /^\d+$/.test(start)) params.set('start', start);

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
    iframe.title = title;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;

    const frame = button.closest('.archive-video-frame');
    if (frame) {
      frame.replaceChildren(iframe);
    }
  });
});

// 5. Animaciones discretas al desplazar: respeta prefers-reduced-motion
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const targets = document.querySelectorAll(
    '.service-card,.intro-grid,.section-head,.agenda-panel,.collaboration-grid,.speaker-showcase,.speaker-profile-card,.contact-page-grid,.event-card,.events-empty,.explain-grid,.closing-grid,.historic-speaker,.archive-video,.ally-table,.prereg-card,.edition-video-layout'
  );
  const observer = new IntersectionObserver(
    entries =>
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('motion-in');
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.08 }
  );
  targets.forEach((element, index) => {
    element.classList.add('motion-ready');
    element.style.setProperty('--motion-delay', (index % 4) * 70 + 'ms');
    observer.observe(element);
  });
}
