// 3D room grid (viewport adaptive)
// - Room dimensions are snapped to whole grid cells so lines on neighbouring
//   planes meet exactly at the corners.
// - Depth is capped so the front edge can never reach the camera
//   (CSS perspective = 1400px), which is what broke the grid on wide screens.
// - Grid is drawn with CSS gradients (5 elements instead of ~200 line divs).
(function () {
  const MAX_DEPTH = 1800;           // front edge stays >= 500px from the camera
  let lastW = 0;
  let lastH = 0;

  function cellSize(vw, vh) {
    const c = Math.round(Math.min(vw, vh) / 9 / 2) * 2; // even integer
    return Math.max(56, Math.min(104, c));
  }

  function makePlane(cls, w, h, transform, cell, lineAlpha, edgeAlpha) {
    const el = document.createElement('div');
    el.className = `grid-plane ${cls}`;
    const line = `rgba(238,233,228,${lineAlpha})`;
    const edge = `rgba(238,233,228,${edgeAlpha})`;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    el.style.margin = `${-h / 2}px 0 0 ${-w / 2}px`;
    el.style.transform = transform;
    el.style.backgroundImage =
      `linear-gradient(to right, ${line} 1px, transparent 1px),` +
      `linear-gradient(to bottom, ${line} 1px, transparent 1px)`;
    el.style.backgroundSize = `${cell}px ${cell}px`;
    el.style.boxShadow = `inset 0 0 0 1px ${edge}`;
    return el;
  }

  function buildRoom(visibleNow) {
    const container = document.getElementById('grid-container');
    if (!container) return;
    container.innerHTML = '';

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    lastW = vw;
    lastH = vh;

    const cell = cellSize(vw, vh);
    const snap = v => Math.max(4, Math.round(v / cell)) * cell;

    const W = snap(vw * 1.25);
    const H = snap(vh * 0.85);
    const D = Math.min(snap(Math.max(vw * 1.25, vh * 1.1)), Math.floor(MAX_DEPTH / cell) * cell);

    window.roomMetrics = { W, H, D, cell };

    const planes = [
      ['floor',          W, D, `translateY(${H / 2}px) rotateX(90deg)`,       0.12, 0.16],
      ['ceiling',        W, D, `translateY(${-H / 2}px) rotateX(-90deg)`,     0.12, 0.16],
      ['wall wall-left', D, H, `translateX(${-W / 2}px) rotateY(90deg)`,      0.06, 0.12],
      ['wall wall-right',D, H, `translateX(${W / 2}px) rotateY(-90deg)`,      0.06, 0.12],
      ['wall wall-back', W, H, `translateZ(${-D / 2}px)`,                     0.04, 0.10]
    ];

    planes.forEach(([cls, w, h, transform, lineA, edgeA]) => {
      const plane = makePlane(cls, w, h, transform, cell, lineA, edgeA);
      if (visibleNow) plane.style.opacity = '1';
      container.appendChild(plane);
    });
  }

  function init() {
    buildRoom(false);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Ignore small height changes (mobile URL bar showing/hiding)
        const widthChanged = window.innerWidth !== lastW;
        const heightJump = Math.abs(window.innerHeight - lastH) > 150;
        if (!widthChanged && !heightJump) return;
        buildRoom(true);
        window.dispatchEvent(new Event('roomrebuilt'));
      }, 200);
    });
  }

  window.init3DRoomGrid = init;
})();
