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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

  window.Site = { updateTime, updateVersion, startLogoFlip, initGridHighlight };

  markActiveNav();
  updateTime();
  setInterval(updateTime, 60000);
  updateVersion();
  window.addEventListener('langchange', updateTime);
  const footerYear = document.getElementById('footer-year');
  if (footerYear) footerYear.textContent = new Date().getFullYear();
})();
