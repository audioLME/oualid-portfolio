const words = [
  "OUALID",
  "ARCHITECT",
  "DESIGNER",
  "3D ARTIST"
];

const container = document.getElementById("animation-box");
let wordIndex = 0;

function showWord(word) {
  container.innerHTML = "";

  const letters = word.split("");

  letters.forEach((char, i) => {
    const el = document.createElement("div");
    el.className = "letter";
    el.textContent = char === " " ? "\u00A0" : char;
    container.appendChild(el);
  });

  const containerWidth = container.offsetWidth;
  const els = container.querySelectorAll('.letter');
  const widths = Array.from(els).map(el => el.offsetWidth);
  const sumWidths = widths.reduce((a, b) => a + b, 0);
  const gap = Math.max(5, (containerWidth - sumWidths) / (widths.length - 1));
  const totalWidth = sumWidths + (widths.length - 1) * gap;
  const startLeft = Math.max(0, (containerWidth - totalWidth) / 2);
  let currentLeft = startLeft;
  els.forEach((el, i) => {
    el.style.left = `${currentLeft}px`;
    currentLeft += widths[i] + gap;
  });

  gsap.fromTo(
    ".letter",
    { y: 300, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.9,
      stagger: 0.08,
      ease: "power4.out"
    }
  );
}

function hideWord(next) {
  gsap.to(".letter", {
    y: -300,
    opacity: 0,
    duration: 0.7,
    stagger: 0.06,
    ease: "power4.in",
    onComplete: next
  });
}

function cycle() {
  showWord(words[wordIndex]);

  gsap.delayedCall(2, () => {
    hideWord(() => {
      wordIndex = (wordIndex + 1) % words.length;
      cycle();
    });
  });
}

cycle();
