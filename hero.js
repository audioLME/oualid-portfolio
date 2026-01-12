// ===== HERO ANIMATION — PRODUCTION BUILD =====

document.addEventListener("DOMContentLoaded", () => {
  /* ================= CONFIG ================= */
  const LETTER_SCALE = 0.38; // 🔒 locked
  const START_Y = -600;

  const GRAVITY_TIME = 0.9;
  const X_LAG = 0.18;
  const ROT_LAG = 0.28;
  const IMPACT = 14;

  // ground calculated once
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

  /* ================= FINAL FRAMES ================= */
  // Order: O U A L I D
  const FRAMES = [
    [
      { x: -70,  y: -781, r: 21 },
      { x: -174, y: -518, r: 4 },
      { x: -40,  y: -827, r: -27 },
      { x: -186, y: -541, r: 2 },
      { x: 41,   y: -540, r: 32 },
      { x: -215, y: -679, r: 2 }
    ],
    [
      { x: -27,  y: -706, r: -24 },
      { x: -246, y: -494, r: 4 },
      { x: -218, y: -649, r: 38 },
      { x: -154, y: -542, r: -44 },
      { x: -82,  y: -490, r: -6 },
      { x: -43,  y: -580, r: -53 }
    ]
  ];

  /* ================= GROUND LINE ================= */
  const ground = document.createElement("div");
  ground.style.cssText = `
    position:fixed;
    left:0;
    right:0;
    top:${GROUND_Y}px;
    height:1px;
    background:rgba(0,0,0,0.25);
    z-index:5;
    pointer-events:none;
  `;
  document.body.appendChild(ground);

  /* ================= INITIAL STATE ================= */
  gsap.set(letters, {
    scale: LETTER_SCALE,
    x: 0,
    y: START_Y,
    rotate: 0,
    transformOrigin: "50% 100%"
  });

  /* ================= GRAVITY TIMELINE ================= */
  const tl = gsap.timeline({ delay: 0.3 });

  FRAMES.forEach((frame, f) => {
    frame.forEach((state, i) => {
      const mass = 1 + i * 0.12;

      // Y — gravity
      tl.to(
        letters[i],
        {
          y: state.y,
          duration: GRAVITY_TIME * mass,
          ease: "power4.in"
        },
        f
      );

      // impact
      tl.to(
        letters[i],
        {
          y: state.y + IMPACT,
          duration: 0.12
        },
        ">"
      );

      tl.to(
        letters[i],
        {
          y: state.y,
          duration: 0.22,
          ease: "power3.out"
        }
      );

      // X — friction
      tl.to(
        letters[i],
        {
          x: state.x,
          duration: GRAVITY_TIME * 0.6,
          ease: "power2.out"
        },
        f + X_LAG
      );

      // rotation — settle
      tl.to(
        letters[i],
        {
          rotate: state.r,
          duration: GRAVITY_TIME * 0.5,
          ease: "power2.out"
        },
        f + ROT_LAG
      );
    });
  });

  console.log(
    "%cHERO PRODUCTION ANIMATION READY",
    "font-weight:bold;"
  );
});
