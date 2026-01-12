// ===== HERO FAKE-PHYSICS PILE (v2 – scale fixed) =====

// ===== TWEAKABLES =====
const LETTER_SCALE = 0.75;      // 🔽 MAIN FIX: reduce overall letter size
const GRAVITY_DISTANCE = 520;   // how far letters fall
const BASE_Y = 100;             // ground level
const STACK_OFFSET = 50;        // vertical stacking offset
const ROTATION_RANGE = 12;      // max rotation in degrees

// grab letters in order
const letters = [
  document.querySelector(".o"),
  document.querySelector(".u"),
  document.querySelector(".a"),
  document.querySelector(".l"),
  document.querySelector(".i"),
  document.querySelector(".d")
];

// initial state: high above, invisible, scaled down
gsap.set(letters, {
  y: -GRAVITY_DISTANCE,
  opacity: 0,
  scale: LETTER_SCALE,
  rotate: () => gsap.utils.random(-ROTATION_RANGE, ROTATION_RANGE),
  transformOrigin: "50% 100%"
});

const tl = gsap.timeline({
  defaults: { ease: "none" }
});

let currentStackY = BASE_Y;

// helper: fake gravity fall
function dropLetter(el, index) {
  const mass = 1 + index * 0.15;
  const rotation = gsap.utils.random(-ROTATION_RANGE, ROTATION_RANGE);

  tl.to(el, {
    opacity: 1,
    duration: 0.15
  }, "-=0.1");

  // accelerated fall
  tl.to(el, {
    y: currentStackY,
    rotate: rotation,
    duration: 0.85 * mass,
    ease: "power4.in"
  });

  // impact compression
  tl.to(el, {
    y: currentStackY + 16,
    duration: 0.14,
    ease: "power2.out"
  });

  // settle
  tl.to(el, {
    y: currentStackY,
    duration: 0.32,
    ease: "power3.out"
  });

  currentStackY -= STACK_OFFSET;
}

// subtle page settle
tl.from("body", {
  y: -36,
  duration: 0.75,
  ease: "power2.out"
});

// causal pile sequence
letters.forEach((letter, i) => {
  tl.add(() => dropLetter(letter, i), i === 0 ? "+=0.1" : "+=0.05");
});

// freeze
tl.add(() => {
  gsap.set(letters, { clearProps: "willChange" });
});
