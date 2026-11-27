// Shared behaviour for every page: header clock, version badge, active nav
// link, and the background grid highlight / click-to-flip cell.
(function () {
  'use strict';

  const t = k => (window.I18N ? I18N.t(k) : k);
  const locale = () => (window.I18N ? I18N.locale : 'en-US');

  /* ---------- header clock ---------- */
  const HOURGLASS = `<svg class="hourglass" width="12" height="15" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <polygon points="0,0 16,0 8,10" fill="currentColor"/>
  <polygon points="8,10 0,20 16,20" fill="currentColor"/>
</svg>`;

  function updateTime() {
    const el = document.getElementById('time-display');
    if (!el) return;
    const now = new Date();
    const opts = { timeZone: 'Africa/Algiers' };
    const time = now.toLocaleString(locale(), { ...opts, hour: 'numeric', minute: '2-digit' });
    const date = now.toLocaleString(locale(), { ...opts, month: 'short', day: 'numeric', year: 'numeric' });
    const sp = '   ';
    el.innerHTML = `<span>${t('time.place')}</span>${sp}${HOURGLASS}${sp}<span dir="auto">${time}</span>${sp}<span dir="auto">${date}</span>`;
  }

  /* ---------- version badge ---------- */
  async function updateVersion() {
    const el = document.getElementById('version-indicator');
    if (!el) return;
    try {
      const response = await fetch('/api/deployments');
      if (!response.ok) throw new Error('deployments API ' + response.status);
      const data = await response.json();
      if (data.version) { el.textContent = data.version; return; }
    } catch (e) { /* fall back to GitHub */ }

    try {
      const response = await fetch('https://api.github.com/repos/audioLME/oualid-portfolio/commits?per_page=1');
      if (!response.ok) throw new Error('GitHub ' + response.status);
      const link = response.headers.get('Link');
      let count = 1;
      const m = link && link.match(/page=(\d+)>; rel="last"/);
      if (m) count = parseInt(m[1], 10);
      el.textContent = `v0.${Math.floor(count / 100)}.${String(count % 100).padStart(2, '0')}`;
    } catch (e) { /* keep the default label */ }
  }

  /* ---------- active nav link ---------- */
  function markActiveNav() {
    const page = document.body.dataset.page;
    document.querySelectorAll('.nav a').forEach(a => {
      if (a.dataset.page && a.dataset.page === page) a.setAttribute('aria-current', 'page');
    });
  }

  /* ---------- logo letters flip loop ---------- */
  function startLogoFlip() {
    if (typeof gsap === 'undefined') return;
    gsap.timeline({ repeat: -1 })
      .to('.logo span', { rotationY: 180, duration: 0.5, stagger: 0.1 }, 0)
      .to('.logo span', { rotationY: 0, duration: 0.5, stagger: 0.1 }, 0.5)
      .to({}, { duration: 4 }, 1);
  }

  /* ---------- grid highlight + click/tap flip ---------- */
  function initGridHighlight() {
    const highlight = document.getElementById('bg-highlight');
    if (!highlight || typeof gsap === 'undefined') return;
    let timer;
    let flipping = false;
    const gridSize = () => (window.innerWidth <= 768 ? 50 : 80);
    const place = (x, y) => {
      const g = gridSize();
      highlight.style.setProperty('--hx', `${Math.floor(x / g) * g}px`);
      highlight.style.setProperty('--hy', `${Math.floor(y / g) * g}px`);
    };
    // Clicks on links, buttons, images and text should not flip a cell
    const isInteractive = target =>
      target.closest && target.closest('a, button, input, textarea, select, label, img, .lightbox, .no-flip');

    window.addEventListener('mousemove', e => {
      place(e.clientX, e.clientY);
      if (!flipping) highlight.style.opacity = '1';
      clearTimeout(timer);
      timer = setTimeout(() => { if (!flipping) highlight.style.opacity = '0'; }, 1000);
    });
    document.addEventListener('mouseleave', () => {
      clearTimeout(timer);
      if (!flipping) highlight.style.opacity = '0';
    });

    let lastTouch = null;
    document.addEventListener('touchstart', e => {
      const p = e.touches[0];
      lastTouch = { x: p.clientX, y: p.clientY, moved: false };
    }, { passive: true });
    document.addEventListener('touchmove', () => { if (lastTouch) lastTouch.moved = true; }, { passive: true });

    function flip(e) {
      if (flipping || isInteractive(e.target)) return;
      let x, y;
      if (e.type === 'touchend') {
        if (!lastTouch || lastTouch.moved) return; // a scroll, not a tap
        x = lastTouch.x; y = lastTouch.y;
      } else {
        x = e.clientX; y = e.clientY;
      }
      flipping = true;
      place(x, y);
      highlight.style.opacity = '1';
      gsap.timeline()
        .to(highlight, {
          rotationY: 180, duration: 0.35, ease: 'power2.in',
          backgroundColor: 'rgba(17, 17, 17, 0.9)', borderColor: 'rgba(0, 0, 0, 0.9)',
          boxShadow: '0 0 14px rgba(0,0,0,0.4)'
        })
        .to(highlight, {
          rotationY: 0, duration: 0.35, ease: 'power2.out',
          backgroundColor: 'rgba(0, 0, 0, 0)', borderColor: 'rgba(0, 0, 0, 0.06)',
          boxShadow: '0 0 14px rgba(0,0,0,0.16)',
          onComplete: () => { flipping = false; }
        });
    }
    window.addEventListener('click', flip);
    document.addEventListener('touchend', flip);
  }

  /* ---------- page transitions ---------- */
  // The animations are part of the design, so they also play when the
  // computer asks for reduced motion (Windows turns this on often).
  const reduce = () => false;
  const CUT_ANGLE = 17 * Math.PI / 180; // tilt of the scissor cut from vertical
  let leaving = false;

  // Home page: a line cuts the screen at an angle, then the two halves slide
  // apart (left and right) and reveal the dark page underneath.
  function cutTo(href) {
    if (leaving) return;
    if (reduce() || typeof gsap === 'undefined') { location.href = href; return; }
    leaving = true;

    const vw = window.innerWidth, vh = window.innerHeight;
    const off = Math.tan(CUT_ANGLE) * vh / 2;
    const xTop = vw / 2 + off, xBot = vw / 2 - off;

    const layer = document.createElement('div');
    layer.className = 'cut-layer';
    const under = document.createElement('div');
    under.className = 'cut-under';
    layer.appendChild(under);

    // two copies of the current screen, each clipped to one side of the cut
    const snapshot = () => {
      const wrap = document.createElement('div');
      Array.from(document.body.children).forEach(el => {
        if (el.tagName === 'SCRIPT' || el === layer) return;
        wrap.appendChild(el.cloneNode(true));
      });
      return wrap;
    };
    const left = document.createElement('div');
    const right = document.createElement('div');
    left.className = right.className = 'cut-half';
    left.style.clipPath = `polygon(0 0, ${xTop}px 0, ${xBot}px ${vh}px, 0 ${vh}px)`;
    right.style.clipPath = `polygon(${xTop}px 0, ${vw}px 0, ${vw}px ${vh}px, ${xBot}px ${vh}px)`;
    left.appendChild(snapshot());
    right.appendChild(snapshot());
    layer.appendChild(left);
    layer.appendChild(right);

    // the scissor line
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'cut-line');
    svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
    const ln = document.createElementNS(svgNS, 'line');
    ln.setAttribute('x1', xTop); ln.setAttribute('y1', -10);
    ln.setAttribute('x2', xBot); ln.setAttribute('y2', vh + 10);
    const len = Math.hypot(xTop - xBot, vh + 20);
    ln.setAttribute('stroke-dasharray', len);
    ln.setAttribute('stroke-dashoffset', len);
    svg.appendChild(ln);
    layer.appendChild(svg);
    document.body.appendChild(layer);

    // halves move away from the cut, perpendicular to it
    const d = vw * 0.75 + off;
    const nx = Math.cos(CUT_ANGLE) * d, ny = Math.sin(CUT_ANGLE) * d;
    gsap.timeline({ onComplete: () => { location.href = href; } })
      .to(ln, { attr: { 'stroke-dashoffset': 0 }, duration: 0.35, ease: 'power2.in' })
      .to(svg, { opacity: 0, duration: 0.15 }, '+=0.05')
      .to(left, { x: -nx, y: -ny, rotation: -2, duration: 0.75, ease: 'power3.inOut' }, '<')
      .to(right, { x: nx, y: ny, rotation: 2, duration: 0.75, ease: 'power3.inOut' }, '<');
  }

  // Dark pages: content fades out, the next page rebuilds the room.
  function fadeTo(href) {
    if (leaving) return;
    if (reduce() || typeof gsap === 'undefined') { location.href = href; return; }
    leaving = true;
    gsap.to('.page, .about-page, .site-footer, #room-canvas, #hologram-canvas', {
      opacity: 0, duration: 0.4, ease: 'power1.in',
      onComplete: () => { location.href = href; }
    });
  }

  function goTo(href) {
    if (document.documentElement.classList.contains('theme-dark')) fadeTo(href);
    else cutTo(href);
  }

  function initNavTransitions() {
    document.querySelectorAll('.nav a, [data-wipe]').forEach(a => {
      a.addEventListener('click', e => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        e.stopPropagation(); // no grid-cell flip
        if (a.getAttribute('aria-current') === 'page') return;
        goTo(a.href);
      });
    });
    // Coming back with the browser's Back button: undo a finished transition
    window.addEventListener('pageshow', e => {
      if (!e.persisted) return;
      leaving = false;
      document.querySelectorAll('.cut-layer').forEach(el => el.remove());
      document.querySelectorAll('.page, .about-page, .site-footer, #room-canvas, #hologram-canvas')
        .forEach(el => { el.style.opacity = ''; });
    });
  }

  /* ---------- dark pages: room builds, then header/text, then shapes ---------- */
  function darkEntry() {
    if (window.Room3D) Room3D.init();
    const startHolos = () => { if (typeof initHolograms === 'function') initHolograms(); };
    if (typeof gsap === 'undefined' || reduce()) {
      document.querySelectorAll('.about-content').forEach(el => { el.style.opacity = 1; });
      startHolos();
      return;
    }
    const tl = gsap.timeline()
      .fromTo('.site-header', { yPercent: -100 }, { yPercent: 0, duration: 0.8, ease: 'power2.out' }, 1.2)
      .call(startLogoFlip, null, 1.6)
      .call(startHolos, null, 2.0);
    if (document.querySelector('.about-content')) {
      tl.fromTo('.about-content', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 1.4);
    }
  }

  window.Site = { updateTime, updateVersion, startLogoFlip, initGridHighlight, cutTo, fadeTo, goTo, darkEntry };
  initNavTransitions();

  markActiveNav();
  updateTime();
  setInterval(updateTime, 60000);
  updateVersion();
  window.addEventListener('langchange', updateTime);
  const footerYear = document.getElementById('footer-year');
  if (footerYear) footerYear.textContent = new Date().getFullYear();
})();
