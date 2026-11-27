// Renders the portfolio grid, a single project page and the contact page
// from data/projects.json. Re-renders when the language changes.
(function () {
  'use strict';

  const page = document.body.dataset.page;
  const root = document.getElementById('page-root');
  if (!root) return;

  const t = k => I18N.t(k);
  const pick = o => I18N.pick(o);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ARROW = '<svg class="flip-x" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg>';
  const BACK = '<svg class="flip-x" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg>';

  let data = null;
  let firstRender = true;

  // Image inside a frame; if the photo cannot load, the grid placeholder shows instead
  function frame(src, alt, extraClass, eager) {
    return `<div class="frame ${extraClass || ''}">
      <img src="${esc(src)}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
      <span class="frame-label">${esc(alt)}</span>
    </div>`;
  }

  function wireFrames() {
    root.querySelectorAll('.frame img').forEach(img => {
      const done = () => img.classList.add('loaded');
      const fail = () => img.closest('.frame').classList.add('failed');
      if (img.complete) { img.naturalWidth ? done() : fail(); }
      else {
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', fail, { once: true });
      }
    });
  }

  const pad = n => String(n).padStart(2, '0');

  /* ---------- portfolio ---------- */
  function renderPortfolio() {
    const list = data.projects;
    document.title = `${t('nav.portfolio').charAt(0)}${t('nav.portfolio').slice(1).toLowerCase()} — Oualid Meghlaoui`;
    root.innerHTML = `
      <header class="page-head reveal">
        <span class="eyebrow">${pad(list.length)} ${esc(t('portfolio.count'))}</span>
        <h1 class="page-title">${esc(t('portfolio.title'))}</h1>
        <p class="page-intro">${esc(t('portfolio.intro'))}</p>
      </header>
      <div class="cards">
        ${list.map((p, i) => `
          <a class="card reveal" href="project.html?id=${encodeURIComponent(p.id)}">
            ${frame(p.cover, pick(p.title), '', i < 3)}
            <div class="card-meta">
              <span class="card-index">${pad(i + 1)}</span>
              <span class="card-sub">${esc(pick(p.type))} · ${esc(p.year)}</span>
            </div>
            <h2 class="card-title">${esc(pick(p.title))}</h2>
            <p class="card-sub">${esc(pick(p.summary))}</p>
            <span class="card-cta">${esc(t('portfolio.view'))} ${ARROW}</span>
          </a>`).join('')}
      </div>`;
  }

  /* ---------- single project ---------- */
  let lightboxItems = [];

  function renderProject() {
    const id = new URLSearchParams(location.search).get('id');
    const list = data.projects;
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) {
      document.title = 'Oualid Meghlaoui';
      root.innerHTML = `
        <a class="back-link reveal" href="portfolio.html">${BACK} ${esc(t('project.back'))}</a>
        <h1 class="page-title reveal">404</h1>
        <p class="page-intro reveal">${esc(t('project.notFound'))}</p>`;
      return;
    }
    const p = list[idx];
    const next = list[(idx + 1) % list.length];
    const title = pick(p.title);
    document.title = `${title} — Oualid Meghlaoui`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', pick(p.summary));

    lightboxItems = [];
    const sections = (p.sections || []).map((s, si) => `
      <section class="room reveal">
        <div class="room-text">
          <h2>${pad(si + 1)}</h2>
          <h3>${esc(pick(s.title))}</h3>
          <p>${esc(pick(s.text))}</p>
        </div>
        <div class="gallery">
          ${(s.images || []).map(img => {
            const n = lightboxItems.push({ src: img.src, caption: pick(img.caption) || pick(s.title) }) - 1;
            const cap = pick(img.caption);
            return `<figure>
              <button type="button" data-lb="${n}" aria-label="${esc(cap || pick(s.title))}">${frame(img.src, cap || pick(s.title))}</button>
              ${cap ? `<figcaption>${esc(cap)}</figcaption>` : ''}
            </figure>`;
          }).join('')}
        </div>
      </section>`).join('');

    const usesUnsplash = JSON.stringify(p).includes('images.unsplash.com');

    root.innerHTML = `
      <a class="back-link reveal" href="portfolio.html">${BACK} ${esc(t('project.back'))}</a>
      <header class="reveal">
        <span class="eyebrow">${pad(idx + 1)} / ${pad(list.length)}</span>
        <h1 class="page-title">${esc(title)}</h1>
        <p class="page-intro">${esc(pick(p.summary))}</p>
        <dl class="facts">
          <div><dt>${esc(t('project.type'))}</dt><dd>${esc(pick(p.type))}</dd></div>
          <div><dt>${esc(t('project.year'))}</dt><dd>${esc(p.year)}</dd></div>
          <div><dt>${esc(t('project.area'))}</dt><dd dir="ltr">${esc(p.area)}</dd></div>
          <div><dt>${esc(t('project.status'))}</dt><dd>${esc(pick(p.status))}</dd></div>
        </dl>
      </header>
      ${frame(p.cover, title, 'project-cover reveal', true)}
      <div class="project-lead reveal">
        <h2>${esc(t('project.about'))}</h2>
        <p>${esc(pick(p.description))}</p>
      </div>
      ${sections}
      ${list.length > 1 ? `
      <a class="next-project reveal" href="project.html?id=${encodeURIComponent(next.id)}">
        <span class="eyebrow">${esc(t('project.next'))}</span>
        <strong>${esc(pick(next.title))} ${ARROW.replace('width="18" height="18"', 'width="48" height="48"')}</strong>
      </a>` : ''}
      ${usesUnsplash ? `<p class="credit">${esc(t('project.credit'))}</p>` : ''}`;

    root.querySelectorAll('[data-lb]').forEach(b =>
      b.addEventListener('click', () => openLightbox(+b.dataset.lb)));
  }

  /* ---------- lightbox ---------- */
  let lb = null;
  let lbIndex = 0;
  let lastFocus = null;

  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = `
      <img alt="">
      <p></p>
      <button type="button" class="lb-close">✕</button>
      <button type="button" class="lb-prev">‹</button>
      <button type="button" class="lb-next">›</button>`;
    document.body.appendChild(lb);
    lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
    lb.querySelector('.lb-prev').addEventListener('click', () => showLb(lbIndex - 1));
    lb.querySelector('.lb-next').addEventListener('click', () => showLb(lbIndex + 1));
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
      if (e.key === 'ArrowRight') showLb(lbIndex + 1);
    });
    // swipe on phones
    let sx = null;
    lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  function showLb(i) {
    const n = lightboxItems.length;
    lbIndex = (i + n) % n;
    const item = lightboxItems[lbIndex];
    const img = lb.querySelector('img');
    img.src = item.src.replace('w=1600', 'w=2400');
    img.alt = item.caption;
    lb.querySelector('p').textContent = `${pad(lbIndex + 1)} / ${pad(n)}  —  ${item.caption}`;
  }

  function openLightbox(i) {
    if (!lb) buildLightbox();
    lb.querySelector('.lb-close').setAttribute('aria-label', t('project.close'));
    lb.querySelector('.lb-prev').setAttribute('aria-label', t('project.prev'));
    lb.querySelector('.lb-next').setAttribute('aria-label', t('project.nextImg'));
    lastFocus = document.activeElement;
    showLb(i);
    lb.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    lb.querySelector('.lb-close').focus();
  }

  function closeLightbox() {
    lb.classList.remove('open');
    document.documentElement.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  /* ---------- contact ---------- */
  function renderContact() {
    const c = data.contact || {};
    document.title = `${t('contact.title')} — Oualid Meghlaoui`;
    root.innerHTML = `
      <header class="page-head reveal">
        <span class="eyebrow">${esc(t('nav.contact'))}</span>
        <h1 class="page-title">${esc(t('contact.title'))}</h1>
        <p class="page-intro">${esc(t('contact.intro'))}</p>
      </header>
      <div class="contact-grid">
        <section class="panel reveal">
          <h2>${esc(t('contact.email'))}</h2>
          <a class="email-big" href="mailto:${esc(c.email)}">${esc(c.email)}</a>
          <div class="btn-row">
            <a class="btn" href="mailto:${esc(c.email)}">${esc(t('contact.write'))} ${ARROW}</a>
            <button class="btn" type="button" id="copy-email">${esc(t('contact.copy'))}</button>
          </div>
        </section>
        <section class="panel reveal">
          <h2>${esc(t('contact.follow'))}</h2>
          <ul class="socials">
            ${(c.socials || []).map(s => `
              <li><a href="${esc(s.url)}" target="_blank" rel="noopener">
                <span>${esc(s.name)}</span><small>${esc(s.handle || '')}</small>
              </a></li>`).join('')}
          </ul>
        </section>
      </div>`;

    const copy = document.getElementById('copy-email');
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(c.email);
        copy.textContent = t('contact.copied');
        setTimeout(() => { copy.textContent = t('contact.copy'); }, 1800);
      } catch (e) {
        location.href = `mailto:${c.email}`;
      }
    });
  }

  function render() {
    if (page === 'portfolio') renderPortfolio();
    else if (page === 'project') renderProject();
    else if (page === 'contact') renderContact();
    wireFrames();

    const items = root.querySelectorAll('.reveal');
    if (firstRender && !reduceMotion && typeof gsap !== 'undefined') {
      gsap.fromTo(items, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power2.out', delay: 0.5 });
    } else {
      items.forEach(el => { el.style.opacity = 1; });
    }
    firstRender = false;
  }

  fetch('data/projects.json', { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(json => { data = json; render(); })
    .catch(() => {
      root.innerHTML = '<p class="page-intro">Could not load data/projects.json.</p>';
    });

  window.addEventListener('langchange', () => { if (data) render(); });
})();
