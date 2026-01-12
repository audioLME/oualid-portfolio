// initial state
gsap.set("#hero-letters .letter", {
  y: 260,
  opacity: 0,
  rotate: () => gsap.utils.random(-8, 8)
});

const tl = gsap.timeline({
  defaults: {
    duration: 1.1,
    ease: "power3.out"
  }
});

// subtle page settle
tl.from("body", {
  y: -40,
  duration: 0.8,
  ease: "power2.out"
});

// fake physics pile-up
tl.to(".o", { y: 120, opacity: 1, rotate: -6 }, "-=0.2");
tl.to(".u", { y: 160, opacity: 1, rotate: 8 }, "-=0.7");
tl.to(".a", { y: 140, opacity: 1, rotate: -12 }, "-=0.7");
tl.to(".l", { y: 180, opacity: 1, rotate: 4 }, "-=0.7");
tl.to(".i", { y: 130, opacity: 1, rotate: -2 }, "-=0.7");
tl.to(".d", { y: 160, opacity: 1, rotate: 10 }, "-=0.7");

// freeze
tl.add(() => {
  gsap.set("#hero-letters .letter", { clearProps: "willChange" });
});
