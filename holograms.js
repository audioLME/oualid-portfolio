// Holograms: wireframe 3D shapes that get drawn line by line inside the room,
// hold while slowly rotating, then un-draw from the tail (same idea as the
// roaming lines on the home page, but in 3D).
//
// They use the exact same camera as the CSS room in profile.html:
// perspective 1400px, vanishing point at 50% / 38% of the viewport.
(function () {
  'use strict';

  const CAMERA = 1400;
  const ORIGIN_Y = 0.38;
  const INK = '238,233,228';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const easeInOut = t => -(Math.cos(Math.PI * t) - 1) / 2;

  /* ---------- shape library (each returns an array of 3D polylines) ---------- */

  const PHI = (1 + Math.sqrt(5)) / 2;

  function edgesByLength(verts, len) {
    const out = [];
    for (let i = 0; i < verts.length; i++) {
      for (let j = i + 1; j < verts.length; j++) {
        const d = Math.hypot(
          verts[i][0] - verts[j][0],
          verts[i][1] - verts[j][1],
          verts[i][2] - verts[j][2]
        );
        if (Math.abs(d - len) < len * 0.02) out.push([i, j]);
      }
    }
    return out;
  }

  // Chain edges into continuous strokes so the "pen" travels along the shape
  function trail(verts, edges) {
    const left = edges.map(e => e.slice());
    const paths = [];
    let path = null;
    let cur = -1;
    while (left.length) {
      const candidates = [];
      if (cur >= 0) {
        left.forEach((e, i) => { if (e[0] === cur || e[1] === cur) candidates.push(i); });
      }
      if (!candidates.length) {
        if (path) paths.push(path);
        const e = left.splice(Math.floor(Math.random() * left.length), 1)[0];
        path = [verts[e[0]], verts[e[1]]];
        cur = e[1];
        continue;
      }
      const e = left.splice(pick(candidates), 1)[0];
      const next = e[0] === cur ? e[1] : e[0];
      path.push(verts[next]);
      cur = next;
    }
    if (path) paths.push(path);
    return paths;
  }

  function polyhedron(verts, len) {
    return trail(verts, edgesByLength(verts, len));
  }

  function ring(radius, y, n = 36, wobble) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([Math.cos(a) * radius, y + (wobble ? wobble(a) : 0), Math.sin(a) * radius]);
    }
    return pts;
  }

  function prism(n, top, bottom, rx = 1, rz = 1) {
    const t = [], b = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      t.push([Math.cos(a) * rx, top, Math.sin(a) * rz]);
      b.push([Math.cos(a) * rx, bottom, Math.sin(a) * rz]);
    }
    const verts = t.concat(b);
    const edges = [];
    for (let i = 0; i < n; i++) {
      edges.push([i, (i + 1) % n]);
      edges.push([n + i, n + ((i + 1) % n)]);
      edges.push([i, n + i]);
    }
    return trail(verts, edges);
  }

  const SHAPES = {
    cube() {
      const v = [];
      for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) v.push([x, y, z]);
      return polyhedron(v, 2);
    },
    tetrahedron() {
      return polyhedron([[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]], 2 * Math.SQRT2);
    },
    octahedron() {
      return polyhedron([[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], Math.SQRT2);
    },
    icosahedron() {
      const v = [];
      for (const a of [-1, 1]) for (const b of [-PHI, PHI]) {
        v.push([0, a, b], [a, b, 0], [b, 0, a]);
      }
      return polyhedron(v, 2);
    },
    dodecahedron() {
      const v = [];
      for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) v.push([x, y, z]);
      for (const a of [-1, 1]) for (const b of [-1, 1]) {
        v.push([0, a / PHI, b * PHI], [a / PHI, b * PHI, 0], [a * PHI, 0, b / PHI]);
      }
      return polyhedron(v, 2 / PHI);
    },
    pyramid() {
      const v = [[-1, 0.7, -1], [1, 0.7, -1], [1, 0.7, 1], [-1, 0.7, 1], [0, -1, 0]];
      const e = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 4], [2, 4], [3, 4]];
      return trail(v, e);
    },
    triPrism() { return prism(3, -0.8, 0.8, 1, 1); },
    hexPrism() { return prism(6, -0.8, 0.8, 1, 1); },
    house() {
      // pentagonal "house" profile extruded: an architect's little nod
      const prof = [[-1, 0.9], [1, 0.9], [1, -0.15], [0, -1], [-1, -0.15]];
      const z = 0.85;
      const v = prof.map(p => [p[0], p[1], -z]).concat(prof.map(p => [p[0], p[1], z]));
      const e = [];
      for (let i = 0; i < 5; i++) {
        e.push([i, (i + 1) % 5]);
        e.push([5 + i, 5 + ((i + 1) % 5)]);
        e.push([i, 5 + i]);
      }
      return trail(v, e);
    },
    cylinder() {
      const paths = [ring(1, -0.9, 40), ring(1, 0.9, 40)];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        paths.push([[Math.cos(a), -0.9, Math.sin(a)], [Math.cos(a), 0.9, Math.sin(a)]]);
      }
      return paths;
    },
    torus() {
      const R = 0.72, r = 0.3, paths = [];
      for (let i = 0; i < 14; i++) {
        const u = (i / 14) * Math.PI * 2;
        const pts = [];
        for (let j = 0; j <= 20; j++) {
          const v = (j / 20) * Math.PI * 2;
          const rr = R + r * Math.cos(v);
          pts.push([rr * Math.cos(u), r * Math.sin(v), rr * Math.sin(u)]);
        }
        paths.push(pts);
      }
      paths.push(ring(R + r, 0, 48), ring(R - r, 0, 48));
      return paths;
    },
    helix() {
      const pts = [];
      const turns = 3.2, n = 120;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const a = t * turns * Math.PI * 2;
        pts.push([Math.cos(a) * 0.8, -1 + t * 2, Math.sin(a) * 0.8]);
      }
      return [pts, [[0, -1, 0], [0, 1, 0]], ring(0.8, 1, 40)];
    }
  };
  const SHAPE_NAMES = Object.keys(SHAPES);

  function buildShape(name) {
    const paths = SHAPES[name]();
    let maxR = 0;
    paths.forEach(p => p.forEach(pt => { maxR = Math.max(maxR, Math.hypot(pt[0], pt[1], pt[2])); }));
    const k = 1 / maxR;
    const norm = paths.map(p => p.map(pt => [pt[0] * k, pt[1] * k, pt[2] * k]));

    // cumulative lengths so drawing progress is uniform in speed
    const cum = [];
    const starts = [];
    let total = 0;
    norm.forEach(p => {
      starts.push(total);
      const c = [0];
      for (let i = 1; i < p.length; i++) {
        c.push(c[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1], p[i][2] - p[i - 1][2]));
      }
      cum.push(c);
      total += c[c.length - 1];
    });
    return { name, paths: norm, cum, starts, total };
  }

  /* ---------- canvas + camera ---------- */

  let cvs, ctx, vw = 0, vh = 0, dpr = 1;
  let raf = 0, running = false, nextSpawn = 0;
  let holos = [];
  const recent = [];

  function resizeCanvas() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cvs.width = Math.round(vw * dpr);
    cvs.height = Math.round(vh * dpr);
    cvs.style.width = vw + 'px';
    cvs.style.height = vh + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Same camera as the room (3Dshapes.js). World origin = vanishing point.
  function project(x, y, z) {
    if (window.Room3D) return Room3D.project(x, y, z);
    const den = CAMERA - z;
    if (den < 120) return null;
    const s = CAMERA / den;
    return [vw / 2 + x * s, vh * ORIGIN_Y + y * s, s];
  }

  /* ---------- hologram lifecycle ---------- */

  function spawn(forceName) {
    const m = window.roomMetrics;
    if (!m) return null;

    let name = forceName;
    if (!name) {
      const pool = SHAPE_NAMES.filter(n => !recent.includes(n));
      name = pick(pool);
    }
    recent.push(name);
    if (recent.length > 4) recent.shift();

    const base = clamp(Math.min(vw, vh) * 0.085, 44, 100);
    const r = base * rand(0.85, 1.35);

    // alternate sides so they don't pile up, and keep the middle clearer for content
    const left = holos.filter(h => h.cx < 0).length;
    const right = holos.length - left;
    const side = left === right ? (Math.random() < 0.5 ? -1 : 1) : (left < right ? -1 : 1);
    const xMax = Math.max(r, m.W / 2 - r * 1.8);
    const cx = side * clamp(rand(0.14, 0.34) * vw, r, xMax);
    const zNear = m.zF !== undefined ? m.zF * 0.35 : 120;
    const zFar = m.zB !== undefined ? m.zB * 0.45 : -m.D / 2 * 0.55;
    const cz = rand(zFar, zNear);
    const floorY = m.floorY !== undefined ? m.floorY : m.H / 2;
    const cy = floorY - m.H * rand(0.30, 0.46);

    const shape = buildShape(name);
    const h = {
      shape, cx, cy, cz, r, floorY,
      spin: rand(0.22, 0.5) * (Math.random() < 0.5 ? -1 : 1),
      phase: rand(0, Math.PI * 2),
      tilt: rand(0.25, 0.5),
      tiltWobble: rand(0.1, 0.25),
      bobAmp: r * 0.06,
      born: performance.now(),
      tStart: 0.45,
      tDraw: rand(2.4, 3.6),
      tHold: rand(3.5, 6.5),
      tErase: rand(1.8, 2.6),
      nextGlitch: performance.now() + rand(1500, 4000),
      glitchUntil: 0,
      glitchDx: 0
    };
    h.tEraseStart = h.tStart + h.tDraw + h.tHold;
    h.life = h.tEraseStart + h.tErase + 0.3;
    holos.push(h);
    return h;
  }

  function transformPoints(h, t, now) {
    const a = h.phase + h.spin * t;
    const ca = Math.cos(a), sa = Math.sin(a);
    const tl = h.tilt + Math.sin(t * 0.6) * h.tiltWobble;
    const ct = Math.cos(tl), st = Math.sin(tl);
    const bob = Math.sin(t * 1.1 + h.phase) * h.bobAmp;
    return h.shape.paths.map(path => path.map(p => {
      const x1 = p[0] * ca + p[2] * sa;
      const z1 = -p[0] * sa + p[2] * ca;
      const y2 = p[1] * ct - z1 * st;
      const z2 = p[1] * st + z1 * ct;
      return [h.cx + x1 * h.r, h.cy + y2 * h.r + bob, h.cz + z2 * h.r];
    }));
  }

  function lerp3(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }

  // 3D points of path i that are visible between local lengths s..e
  function visibleSlice(wp, cum, s, e) {
    const pts = [];
    for (let i = 0; i < cum.length - 1; i++) {
      const a = cum[i], b = cum[i + 1];
      if (b <= s || a >= e) continue;
      const L = b - a || 1;
      const t0 = Math.max(0, (s - a) / L);
      const t1 = Math.min(1, (e - a) / L);
      if (!pts.length) pts.push(lerp3(wp[i], wp[i + 1], t0));
      pts.push(lerp3(wp[i], wp[i + 1], t1));
    }
    return pts;
  }

  function drawFloorRing(h, alpha) {
    if (alpha <= 0.01) return;
    const rings = [[h.r * 1.5, 0.30], [h.r * 0.95, 0.16]];
    ctx.save();
    ctx.shadowBlur = 0;
    rings.forEach(([rad, k]) => {
      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= 56; i++) {
        const ang = (i / 56) * Math.PI * 2;
        const p = project(h.cx + Math.cos(ang) * rad, h.floorY, h.cz + Math.sin(ang) * rad);
        if (!p) continue;
        if (!started) { ctx.moveTo(p[0], p[1]); started = true; } else ctx.lineTo(p[0], p[1]);
      }
      ctx.strokeStyle = `rgba(${INK},${alpha * k})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    // faint projector beam from the floor ring up to the shape
    const a = project(h.cx, h.floorY, h.cz);
    const b = project(h.cx, h.cy + h.r * 0.9, h.cz);
    if (a && b) {
      ctx.setLineDash([2, 7]);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.strokeStyle = `rgba(${INK},${alpha * 0.18})`;
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  function drawHolo(h, now) {
    const t = (now - h.born) / 1000;

    const u = easeInOut(clamp((t - h.tStart) / h.tDraw, 0, 1));
    const e = easeInOut(clamp((t - h.tEraseStart) / h.tErase, 0, 1));
    const ringIn = clamp(t / 0.6, 0, 1);
    const ringOut = 1 - clamp((t - h.tEraseStart - h.tErase * 0.5) / (h.tErase * 0.6), 0, 1);
    drawFloorRing(h, ringIn * ringOut);

    if (!reduceMotion && now >= h.nextGlitch) {
      h.glitchUntil = now + rand(60, 140);
      h.glitchDx = rand(-5, 5);
      h.nextGlitch = now + rand(2500, 6000);
    }
    const glitching = now < h.glitchUntil;

    const wp = transformPoints(h, t, now);
    const total = h.shape.total;
    const drawnLen = u * total;
    const erasedLen = e * total;

    let alpha = 0.85 * (0.94 + 0.06 * Math.sin(t * 23 + h.phase));
    if (glitching) alpha *= 0.4;

    ctx.save();
    if (glitching) ctx.translate(h.glitchDx, 0);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(${INK},${alpha})`;
    ctx.shadowColor = `rgba(${INK},0.55)`;
    ctx.shadowBlur = 8;

    const sAvg = project(h.cx, h.cy, h.cz);
    ctx.lineWidth = clamp(1.3 * (sAvg ? sAvg[2] : 1), 0.9, 2.2);

    ctx.beginPath();
    let headPoint = null;
    const nodes = [];
    h.shape.paths.forEach((path, i) => {
      const cum = h.shape.cum[i];
      const start = h.shape.starts[i];
      const len = cum[cum.length - 1];
      const s = clamp(erasedLen - start, 0, len);
      const en = clamp(drawnLen - start, 0, len);
      if (en <= s) return;

      const slice = visibleSlice(wp[i], cum, s, en);
      let first = true;
      slice.forEach(p => {
        const q = project(p[0], p[1], p[2]);
        if (!q) { first = true; return; }
        if (first) { ctx.moveTo(q[0], q[1]); first = false; } else ctx.lineTo(q[0], q[1]);
      });

      if (u < 1 && drawnLen >= start && drawnLen <= start + len && slice.length) {
        headPoint = slice[slice.length - 1];
      }

      // small vertex nodes on simple (polyhedral) paths
      if (path.length <= 12) {
        path.forEach((_, k) => {
          if (cum[k] >= s - 1e-6 && cum[k] <= en + 1e-6) nodes.push(wp[i][k]);
        });
      }
    });
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(${INK},${alpha * 0.9})`;
    nodes.forEach(p => {
      const q = project(p[0], p[1], p[2]);
      if (!q) return;
      ctx.beginPath();
      ctx.arc(q[0], q[1], 1.6 * q[2], 0, Math.PI * 2);
      ctx.fill();
    });

    if (headPoint) {
      const q = project(headPoint[0], headPoint[1], headPoint[2]);
      if (q) {
        ctx.shadowColor = `rgba(${INK},0.9)`;
        ctx.shadowBlur = 16;
        ctx.fillStyle = `rgba(${INK},1)`;
        ctx.beginPath();
        ctx.arc(q[0], q[1], 2.6 * q[2], 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    return t < h.life;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    ctx.clearRect(0, 0, vw, vh);

    const maxHolos = vw < 700 ? 1 : 3;
    if (holos.length < maxHolos && now >= nextSpawn) {
      spawn();
      nextSpawn = now + rand(1200, 2600);
    }
    holos = holos.filter(h => drawHolo(h, now));
  }

  /* ---------- public API ---------- */

  function init() {
    // Note: runs even with "reduce motion" on (slow, no glitches); turning it
    // off entirely is why the shapes never showed on some computers.
    if (running) return;
    running = true;

    cvs = document.createElement('canvas');
    cvs.id = 'hologram-canvas';
    cvs.setAttribute('aria-hidden', 'true');
    cvs.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:1;';
    document.body.appendChild(cvs);
    ctx = cvs.getContext('2d');
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('roomrebuilt', () => {
      holos = [];
      nextSpawn = performance.now() + 600;
    });

    nextSpawn = performance.now();
    raf = requestAnimationFrame(frame);
  }

  window.initHolograms = init;
  window.hologramDebug = {
    spawn,
    shapes: SHAPE_NAMES,
    project,
    get holos() { return holos; }
  };
})();
