// ===== HERO MOTION EDITOR WITH GROUND PLANE =====

// load GSAP Draggable
const draggableScript = document.createElement("script");
draggableScript.src = "https://unpkg.com/gsap@3/dist/Draggable.min.js";
document.head.appendChild(draggableScript);

draggableScript.onload = () => init();

function init() {
  const LETTER_SCALE = 0.38;
  const START_Y = -500;
  const PADDING = 8;
  const FRAME_DURATION = 0.8;

  // 🔒 GROUND POSITION (tweak this)
  const GROUND_Y = window.innerHeight * 0.68;

  const letters = [
    document.querySelector(".o"),
    document.querySelector(".u"),
    document.querySelector(".a"),
    document.querySelector(".l"),
    document.querySelector(".i"),
    document.querySelector(".d")
  ];

  let frames = [];
  window.framesData = frames;

  document.addEventListener("contextmenu", e => e.preventDefault());

  // ---------- GROUND LINE ----------
  const ground = document.createElement("div");
  ground.style.cssText = `
    position:fixed;
    left:0;
    right:0;
    top:${GROUND_Y}px;
    height:1px;
    background:rgba(0,0,0,0.2);
    z-index:9998;
    pointer-events:none;
  `;
  document.body.appendChild(ground);

  // ---------- INITIAL SETUP ----------
  gsap.set(letters, {
    scale: LETTER_SCALE,
    y: START_Y,
    x: 0,
    rotate: 0,
    opacity: 1,
    cursor: "grab",
    transformOrigin: "50% 100%"
  });

  // ---------- UI BAR ----------
  const bar = document.createElement("div");
  bar.style.cssText = `
    position:fixed;
    left:0;
    right:0;
    bottom:0;
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
        border:1px solid #333;
        padding:6px 10px;
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
    save.style.cssText = `
      background:#fff;
      color:#000;
      padding:6px 12px;
      cursor:pointer;
    `;
    save.onclick = saveFrame;
    bar.appendChild(save);

    const play = document.createElement("button");
    play.textContent = "PLAY (P)";
    play.style.cssText = `
      background:#0f0;
      color:#000;
      padding:6px 12px;
      cursor:pointer;
    `;
    play.onclick = playTimeline;
    bar.appendChild(play);
  }

  // ---------- COLLISIONS ----------
  function rectsOverlap(r1, r2) {
    return !(
      r1.right < r2.left + PADDING ||
      r1.left > r2.right - PADDING ||
      r1.bottom < r2.top + PADDING ||
      r1.top > r2.bottom - PADDING
    );
  }

  function resolveCollisions(active) {
    const a = active.getBoundingClientRect();

    // 🔒 FLOOR CONSTRAINT
    if (a.bottom > GROUND_Y) {
      gsap.set(active, {
        y: `-=${a.bottom - GROUND_Y}`
      });
    }

    letters.forEach(other => {
      if (other === active) return;
      const b = other.getBoundingClientRect();

      if (rectsOverlap(a, b)) {
        const dx = (a.left + a.width / 2) - (b.left + b.width / 2);
        const dy = (a.top + a.height / 2) - (b.top + b.height / 2);

        if (Math.abs(dx) > Math.abs(dy)) {
          gsap.set(active, {
            x: `+=${dx > 0 ? PADDING : -PADDING}`
          });
        } else {
          gsap.set(active, {
            y: `+=${dy > 0 ? PADDING : -PADDING}`
          });
        }
      }
    });
  }

  // ---------- DRAG + ROTATE ----------
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

  // ---------- FRAMES ----------
  function saveFrame() {
    const frame = letters.map(l => ({
      x: Math.round(gsap.getProperty(l, "x")),
      y: Math.round(gsap.getProperty(l, "y")),
      r: Math.round(gsap.getProperty(l, "rotate"))
    }));
    frames.push(frame);
    renderBar();
    console.log(`FRAME ${frames.length} SAVED`, frame);
  }

  function applyFrame(i) {
    frames[i].forEach((state, idx) => {
      gsap.set(letters[idx], {
        x: state.x,
        y: state.y,
        rotate: state.r
      });
    });
  }

  function playTimeline() {
    if (!frames.length) return;

    gsap.set(letters, { x: 0, y: START_Y, rotate: 0 });

    const tl = gsap.timeline();
    frames.forEach((frame, f) => {
      frame.forEach((state, i) => {
        tl.to(
          letters[i],
          {
            x: state.x,
            y: state.y,
            rotate: state.r,
            duration: FRAME_DURATION,
            ease: "power3.inOut"
          },
          f * FRAME_DURATION
        );
      });
    });
  }

  // ---------- KEYS ----------
  window.addEventListener("keydown", e => {
    if (e.key.toLowerCase() === "t") saveFrame();
    if (e.key.toLowerCase() === "p") playTimeline();
  });

  renderBar();

  console.log(
    "%cGROUND ACTIVE | DRAG = MOVE | RIGHT DRAG = ROTATE | T = SAVE | P = PLAY",
    "font-weight:bold;"
  );
}
