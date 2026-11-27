// 3D room grid, drawn on a canvas.
//
// The room is defined in screen proportions, not in fixed pixels, so it looks
// the same on a phone, a laptop or a 4K screen, and at any browser zoom:
//   - the front edge of the room sits just outside the screen
//   - the back wall always covers the same share of the screen
//   - the grid is snapped to whole cells so lines meet exactly at the corners
// Lines are drawn at the screen's real pixel density, so they stay sharp.
//
// The same camera is used by holograms.js through window.Room3D.project().
(function () {
  'use strict';

  const INK = '238,233,228';
  const ORIGIN_Y = 0.38;     // vanishing point height (share of the screen)
  const FRONT_SCALE = 1.32;  // front edge of the room: 132% of the screen
  const BACK_SCALE = 0.46;   // back wall: 46% of the screen
  const PUSH = 0.35;         // intro: how far back the room starts (share of depth)

  let cvs, ctx, vw = 0, vh = 0, dpr = 1;
  let m = null;              // room metrics
  let push = 0;              // 0 = room in place, 1 = pushed back (intro start)
  let planeAlpha = [1, 1, 1, 1, 1];  // floor, ceiling, left, right, back
  let planeShift = [0, 0, 0, 0];     // intro: floor/ceiling/left/right offset (0..1)
  let offX = 0, offY = 0;            // screen offset applied while drawing a plane
  let lastW = 0, lastH = 0;

  function metrics() {
    const cam = 1.1 * Math.max(vw, vh);
    const ox = vw / 2;
    const oy = vh * ORIGIN_Y;
    const zF = cam * (1 - 1 / FRONT_SCALE);
    const zB = cam * (1 - 1 / BACK_SCALE);
    const halfW = vw * 0.5;
    const ceilY = -oy * 0.9;
    const floorY = (vh - oy) * 0.9;

    const target = Math.max(48, Math.min(110, Math.min(vw, vh) / 8));
    const nx = Math.max(4, Math.round((halfW * 2) / target / 2) * 2);
    const ny = Math.max(3, Math.round((floorY - ceilY) / target));
    // fewer depth rows: perspective already squeezes them toward the back
    const nz = Math.max(4, Math.round((zF - zB) / target / 2));

    return {
      cam, ox, oy, zF, zB, halfW, ceilY, floorY, nx, ny, nz,
      // kept for holograms.js
      W: halfW * 2, H: floorY - ceilY, D: zF - zB
    };
  }

  // world: x right, y down, z toward the viewer; origin on the vanishing point
  function project(x, y, z) {
    if (!m) return null;
    const zz = z - push * PUSH * m.D;
    const den = m.cam - zz;
    if (den < 60) return null;
    const s = m.cam / den;
    return [m.ox + x * s + offX, m.oy + y * s + offY, s];
  }

  // brightness by depth: nearer lines are brighter
  function depthFade(z) {
    const t = (z - m.zB) / (m.zF - m.zB);
    return 0.25 + 0.75 * Math.max(0, Math.min(1, t));
  }

  function line(a, b, alpha) {
    const p = project(a[0], a[1], a[2]);
    const q = project(b[0], b[1], b[2]);
    if (!p || !q || alpha <= 0.002) return;
    ctx.strokeStyle = `rgba(${INK},${alpha})`;
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    ctx.lineTo(q[0], q[1]);
    ctx.stroke();
  }

  // a line running into the depth, fading toward the back
  function depthLine(x, y, alpha) {
    const p = project(x, y, m.zF);
    const q = project(x, y, m.zB);
    if (!p || !q || alpha <= 0.002) return;
    const g = ctx.createLinearGradient(p[0], p[1], q[0], q[1]);
    g.addColorStop(0, `rgba(${INK},${alpha})`);
    g.addColorStop(1, `rgba(${INK},${alpha * 0.25})`);
    ctx.strokeStyle = g;
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    ctx.lineTo(q[0], q[1]);
    ctx.stroke();
  }

  function draw() {
    if (!ctx || !m) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, vw, vh);
    ctx.lineWidth = 1;

    const { halfW, ceilY, floorY, zF, zB, nx, ny, nz } = m;
    const xs = i => -halfW + (i / nx) * halfW * 2;
    const ys = j => ceilY + (j / ny) * (floorY - ceilY);
    const zs = k => zB + (k / nz) * (zF - zB);
    const [aFloor, aCeil, aLeft, aRight, aBack] = planeAlpha;

    // floor (slides up from below) and ceiling (slides down from above)
    [[floorY, aFloor, 0.16, planeShift[0] * vh * 0.6],
     [ceilY, aCeil, 0.12, -planeShift[1] * vh * 0.6]].forEach(([y, a, base, dy]) => {
      if (a <= 0) return;
      offX = 0; offY = dy;
      for (let i = 1; i < nx; i++) depthLine(xs(i), y, base * a);
      for (let k = 1; k <= nz; k++) {
        const z = zs(k);
        line([-halfW, y, z], [halfW, y, z], base * a * depthFade(z));
      }
      depthLine(-halfW, y, 0.22 * a);
      depthLine(halfW, y, 0.22 * a);
    });

    // side walls (slide in from the left and right edges)
    [[-halfW, aLeft, -planeShift[2] * vw * 0.6], [halfW, aRight, planeShift[3] * vw * 0.6]].forEach(([x, a, dx]) => {
      if (a <= 0) return;
      offX = dx; offY = 0;
      const base = 0.09;
      for (let j = 1; j < ny; j++) depthLine(x, ys(j), base * a);
      for (let k = 1; k <= nz; k++) {
        const z = zs(k);
        line([x, ceilY, z], [x, floorY, z], base * a * depthFade(z));
      }
    });
    offX = 0; offY = 0;

    // back wall (fades in last)
    if (aBack > 0) {
      const base = 0.07 * aBack;
      for (let i = 1; i < nx; i++) line([xs(i), ceilY, zB], [xs(i), floorY, zB], base);
      for (let j = 1; j < ny; j++) line([-halfW, ys(j), zB], [halfW, ys(j), zB], base);
      const e = 0.13 * aBack;
      line([-halfW, ceilY, zB], [halfW, ceilY, zB], e);
      line([-halfW, floorY, zB], [halfW, floorY, zB], e);
      line([-halfW, ceilY, zB], [-halfW, floorY, zB], e);
      line([halfW, ceilY, zB], [halfW, floorY, zB], e);
    }
  }

  function resize() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    cvs.width = Math.round(vw * dpr);
    cvs.height = Math.round(vh * dpr);
    cvs.style.width = vw + 'px';
    cvs.style.height = vh + 'px';
    m = metrics();
    window.roomMetrics = m;
    draw();
  }

  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const prog = (t, start, dur) => Math.max(0, Math.min(1, (t - start) / dur));

  // The room assembles: side walls slide in first; before they land the
  // floor rises from the bottom, then the ceiling drops from the top; the
  // back wall fades in last.
  function intro() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { push = 0; planeAlpha = [1, 1, 1, 1, 1]; planeShift = [0, 0, 0, 0]; draw(); return; }
    const plan = {          // [start, duration] in seconds
      left: [0, 1.1], right: [0, 1.1],
      floor: [0.3, 0.9], ceil: [0.5, 0.9],
      back: [1.0, 0.6]
    };
    const end = 1.6;
    const start = performance.now();
    const step = now => {
      const t = (now - start) / 1000;
      const pF = easeOut(prog(t, ...plan.floor));
      const pC = easeOut(prog(t, ...plan.ceil));
      const pL = easeOut(prog(t, ...plan.left));
      const pR = easeOut(prog(t, ...plan.right));
      planeShift = [1 - pF, 1 - pC, 1 - pL, 1 - pR];
      planeAlpha = [
        Math.min(1, pF * 1.6), Math.min(1, pC * 1.6),
        Math.min(1, pL * 1.6), Math.min(1, pR * 1.6),
        easeOut(prog(t, ...plan.back))
      ];
      push = 0;
      draw();
      if (t < end) requestAnimationFrame(step);
    };
    planeAlpha = [0, 0, 0, 0, 0];
    planeShift = [1, 1, 1, 1];
    draw();
    requestAnimationFrame(step);
  }

  function init(opts = {}) {
    if (cvs) return;
    cvs = document.createElement('canvas');
    cvs.id = 'room-canvas';
    cvs.setAttribute('aria-hidden', 'true');
    cvs.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:0;';
    document.body.prepend(cvs);
    ctx = cvs.getContext('2d');
    resize();
    lastW = vw; lastH = vh;

    let pending = false;
    window.addEventListener('resize', () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        resize();
        // tell the holograms to restart only on real layout changes,
        // not when a phone's address bar slides in and out
        if (vw !== lastW || Math.abs(vh - lastH) > 150) {
          lastW = vw; lastH = vh;
          window.dispatchEvent(new Event('roomrebuilt'));
        }
      });
    });

    if (opts.intro !== false) intro();
  }

  window.Room3D = { init, intro, project, redraw: draw, get metrics() { return m; } };
  // old name, still used by older markup
  window.init3DRoomGrid = () => init({ intro: false });
})();
