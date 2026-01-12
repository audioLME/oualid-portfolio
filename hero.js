const words = [
  "OUALID",
  "ARCHITECT",
  "DESIGNER",
  "3D ARTIST"
];

const container = document.getElementById("animation-box");
const subtitleContainer = document.getElementById("subtitle-box");
let wordIndex = 0;
let isPaused = true;

function positionLetters() {
  const containerWidth = container.getBoundingClientRect().width;
  const els = container.querySelectorAll('.letter');
  if (els.length === 0) return;
  
  const widths = Array.from(els).map(el => el.getBoundingClientRect().width);
  const sumWidths = widths.reduce((a, b) => a + b, 0);
  const gap = Math.min(10, Math.max(0, (containerWidth - sumWidths) / (widths.length - 1)));
  const totalWidth = sumWidths + (widths.length - 1) * gap;
  const startLeft = Math.max(0, (containerWidth - totalWidth) / 2);
  let currentLeft = startLeft;
  
  els.forEach((el, i) => {
    el.style.left = `${currentLeft}px`;
    currentLeft += widths[i] + gap;
  });
}

function positionSubtitle() {
  const containerWidth = subtitleContainer.getBoundingClientRect().width;
  const els = subtitleContainer.querySelectorAll('.subtitle-letter');
  if (els.length === 0) return;
  
  const widths = Array.from(els).map(el => el.getBoundingClientRect().width);
  const sumWidths = widths.reduce((a, b) => a + b, 0);
  const gap = Math.min(8, Math.max(0, (containerWidth - sumWidths) / (widths.length - 1)));
  const totalWidth = sumWidths + (widths.length - 1) * gap;
  const startLeft = Math.max(0, (containerWidth - totalWidth) / 2);
  let currentLeft = startLeft;
  
  els.forEach((el, i) => {
    el.style.left = `${currentLeft}px`;
    currentLeft += widths[i] + gap;
  });
}

function showWord(word, animate = true) {
  container.innerHTML = "";

  const letters = word.split("");

  letters.forEach((char, i) => {
    const el = document.createElement("div");
    el.className = "letter";
    el.textContent = char === " " ? "\u00A0" : char;
    container.appendChild(el);
  });

  positionLetters();

  if (animate) {
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

function showSubtitle() {
  subtitleContainer.innerHTML = "";
  const subtitle = "MEGHLAOUI";
  const letters = subtitle.split("");

  letters.forEach((char, i) => {
    const el = document.createElement("div");
    el.className = "subtitle-letter";
    el.textContent = char;
    subtitleContainer.appendChild(el);
  });

  positionSubtitle();
  
  // Type in letter by letter
  gsap.fromTo(
    ".subtitle-letter",
    { y: 50, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.5,
      stagger: 0.08,
      ease: "power2.out"
    }
  );
}

function hideSubtitle(next) {
  gsap.to(".subtitle-letter", {
    y: -50,
    opacity: 0,
    duration: 0.5,
    stagger: 0.04,
    ease: "power2.in",
    onComplete: next
  });
}

function cycle() {
  if (isPaused) return;
  
  showWord(words[wordIndex]);
  
  // Show subtitle only for OUALID
  if (words[wordIndex] === "OUALID") {
    gsap.delayedCall(0.9, showSubtitle);
  }

  gsap.delayedCall(2.5, () => {
    const hideActions = [() => hideWord(() => {
      wordIndex = (wordIndex + 1) % words.length;
      cycle();
    })];
    
    // Hide subtitle if it's OUALID
    if (words[wordIndex] === "OUALID") {
      hideSubtitle(() => {
        hideWord(() => {
          wordIndex = (wordIndex + 1) % words.length;
          cycle();
        });
      });
    } else {
      hideWord(() => {
        wordIndex = (wordIndex + 1) % words.length;
        cycle();
      });
    }
  });
}

function startCycle() {
  isPaused = false;
  
  // Hide OUALID and MEGHLAOUI, then start cycling from ARCHITECT
  hideSubtitle(() => {
    hideWord(() => {
      wordIndex = 1; // Start from ARCHITECT
      cycle();
    });
  });
}

// Initialize with first word but invisible
container.innerHTML = "";
words[0].split("").forEach((char) => {
  const el = document.createElement("div");
  el.className = "letter";
  el.textContent = char === " " ? "\u00A0" : char;
  container.appendChild(el);
});
positionLetters();
gsap.set(".letter", { y: 300, opacity: 0 });

// Recalculate positions on window resize
window.addEventListener('resize', () => {
  positionLetters();
  positionSubtitle();
});
