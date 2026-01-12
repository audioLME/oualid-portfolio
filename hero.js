// ===== HERO MOTION EDITOR — FINAL STABLE VERSION =====

// Load GSAP Draggable
const draggableScript = document.createElement("script");
draggableScript.src = "https://unpkg.com/gsap@3/dist/Draggable.min.js";
document.head.appendChild(draggableScript);

draggableScript.onload = () => init();

function init() {
  /* ================= CONFIG ================= */
  const LETTER_SCALE = 0.38;     // 🔒 LOCKED
  const START_Y = -600;
  const PADDING = 8;

  const GRAVITY_TIME = 0.9;
  const X_LAG = 0.18;
  const ROT_LAG = 0.28;
  const IMPACT = 14;

  // Ground calculated ONCE (resize-safe)
  const GROUND_Y = window.innerHeight * 0.68;

  /* ================= ELEMENTS ================= */
  const letters = [
    document.querySelector(".o"),
    document.querySelector(".u"),
    document.querySelector(".a"),
    document.querySelector(".l"),
    document.querySelector(".i"),
    document.querySelector(".d")
  ];

  let frames = [];
  window.framesData = frames; // exportable

  document.addEventListener("contextmenu", e => e.preventDefault());

  /* ================= GROUND LINE ================= */
  const ground = document.createElement("div");
  ground.style.cssText = `
    position:fixed;
    left:0;
    right:0;
    top:${GROUND_Y}px;
    height:1px;
    background:rgba(0,0,0,0.25);
    z-index:9998;
    pointer-events:none;
  `;
  document.body.appendChild(ground);

  /* ================= INITIAL STATE ================= */
  gsap.set(letters, {
    scale: LETTER_SCALE,
    x: 0,
    y: START_Y,
    rotate: 0,
    cursor: "grab",
    transformOrigin: "50% 100%"
  });

  /* ================= COLLISION HELPERS ================= */
  function rectsOverlap(r1, r2) {
    return !(
      r1.right < r2.left + PADDING ||
      r1.left > r2.right - PADDING ||
      r1.bottom < r2.top + PADDING ||
      r1.top > r2.bottom - PADDING
    );
  }

  function clampToGround(el) {
    const rect = el.getBoundingClientRect();
    if (rect.bottom > GROUND_Y) {
      const delta = rect.bottom - GROUND_Y;
      gsap.set(el, { y: `-=${delta}` });
    }
  }

  function resolveCollisions(active) {
    clampToGround(active);

    const a = active.getBoundingClientRect();
    letters.forEach(other => {
      if (other === active) return;
      const b = other.getBoundingClientRect();

      if (rectsOverlap(a, b)) {
        const dx = (a.left + a.width / 2) - (b.left + b.width / 2);
        const dy = (a.top + a.height / 2) - (b.top + b.height / 2);

        if (Math.abs(dx) > Math.abs(dy)) {
          gsap.set(active, { x: `+=${dx > 0 ? PADDING : -PADDING}` });
        } else {
          gsap.set(active, { y: `+=${dy > 0 ? PADDING : -PADDING}` });
        }
      }
    });

    clampToGround(active);
  }

  /* ================= DRAG + ROTATE ================= */
  letters.forEach(letter => {
    let rotating = false;
    let startX = 0;
    let startRot = 0;

    Draggable.create(letter, {
      type: "x,y",
      inertia: false,

      onPress(e) {
        if (e.button === 2) {
          rotating = true;
          startX = e.clientX;
          startRot = gsap.getProperty(letter, "rotate");
          letter.style.cursor = "ew-resize";
        } else {
          rotating = false;
          letter.style.cursor = "grabbing";
        }
      },

      onDrag(e) {
        if (rotating) {
          gsap.set(letter, {
            rotate: startRot + (e.clientX - startX) * 0.3
          });
        } else {
          resolveCollisions(letter);
        }
      },

      onRelease() {
        rotating = false;
        letter.style.cursor = "grab";
      }
    });
  });

  /* ================= FRAME UI ================= */
  const bar = document.createElement("div");
  bar.style.cssText = `
    position:fixed;
    left:0; right:0; bottom:0;
    height:64px;
    background:#111;
    display:flex;
    align-items:center;
    gap:8px;
    padding:8px;
    z-index:9999;
    font-family:monospace;
  `;
  document.body.appendChild(bar);

  function renderBar() {
    bar.innerHTML = "";

    frames.forEach((_, i) => {
      const btn = document.createElement("button");
      btn.textContent = `F${i + 1}`;
      btn.style.cssText = `
        background:#222;
        color:#fff;
        padding:6px 10px;
        border:1px solid #333;
        cursor:pointer;
      `;
      btn.onclick = () => applyFrame(i);
      bar.appendChild(btn);
    });

    const spacer = document.createElement("div");
    spacer.style.flex = "1";
    bar.appendChild(spacer);

    const save = document.createElement("button");
    save.textContent = "+ FRAME (T)";
    save.style.cssText = `background:#fff;color:#000;padding:6px 12px;`;
    save.onclick = saveFrame;
    bar.appendChild(save);

    const play = document.createElement("button");
    play.textContent = "PLAY (P)";
    play.style.cssText = `background:#0f0;color:#000;padding:6px 12px;`;
    play.onclick = playTimeline;
    bar.appendChild(play);
  }

  /* ================= FRAME LOGIC ================= */
  function saveFrame() {
    const frame = letters.map(l => {
      clampToGround(l);
      return {
        x: Math.round(gsap.getProperty(l, "x")),
        y: Math.round(gsap.getProperty(l, "y")),
        r: Math.round(gsap.getProperty(l, "rotate"))
      };
    });

    frames.push(frame);
    renderBar();
    console.log(`FRAME ${frames.length} SAVED`, frame);
  }

  function applyFrame(i) {
    frames[i].forEach((s, idx) => {
      gsap.set(letters[idx], s);
    });
  }

  /* ================= GRAVITY PLAYBACK ================= */
  function playTimeline() {
    if (!frames.length) return;

    gsap.set(letters, { x: 0, y: START_Y, rotate: 0 });

    const tl = gsap.timeline();

    frames.forEach((frame, f) => {
      frame.forEach((s, i) => {
        const mass = 1 + i * 0.12;

        // Y fall (gravity)
        tl.to(letters[i], {
          y: s.y,
          duration: GRAVITY_TIME * mass,
          ease: "power4.in"
        }, f);

        // impact
        tl.to(letters[i], {
          y: s.y + IMPACT,
          duration: 0.12
        }, ">");

        tl.to(letters[i], {
          y: s.y,
          duration: 0.22,
          ease: "power3.out"
        });

        // X friction
        tl.to(letters[i], {
          x: s.x,
          duration: GRAVITY_TIME * 0.6,
          ease: "power2.out"
        }, f + X_LAG);

        // rotation settle
        tl.to(letters[i], {
          rotate: s.r,
          duration: GRAVITY_TIME * 0.5,
          ease: "power2.out"
        }, f + ROT_LAG);
      });
    });
  }

  /* ================= KEYS ================= */
  window.addEventListener("keydown", e => {
    if (e.key.toLowerCase() === "t") saveFrame();
    if (e.key.toLowerCase() === "p") playTimeline();
  });

  renderBar();

  console.log(
    "%cHERO EDITOR READY — SCALE 0.38, GROUND CLAMPED, GRAVITY OK",
    "font-weight:bold;"
  );
}
