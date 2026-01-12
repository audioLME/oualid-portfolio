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
  const containerWidth = container.getBoundingClientRect().width;
  const els = subtitleContainer.querySelectorAll('.subtitle-letter');
  if (els.length === 0) return;
  
  const oualidEls = container.querySelectorAll('.letter');
  let oualidTotalWidth = 0;
  if (oualidEls.length > 0) {
    const oualidWidths = Array.from(oualidEls).map(el => el.getBoundingClientRect().width);
    const oualidGap = Math.min(10, Math.max(0, (containerWidth - oualidWidths.reduce((a, b) => a + b, 0)) / (oualidWidths.length - 1)));
    oualidTotalWidth = oualidWidths.reduce((a, b) => a + b, 0) + (oualidWidths.length - 1) * oualidGap;
  }
  
  const widths = Array.from(els).map(el => el.getBoundingClientRect().width);
  const sumWidths = widths.reduce((a, b) => a + b, 0);
  const gap = oualidTotalWidth > 0 
    ? (oualidTotalWidth - sumWidths) / (widths.length - 1)
    : Math.min(8, Math.max(0, (containerWidth - sumWidths) / (widths.length - 1)));
  
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
  
  // Type in letter by letter (typewriter effect)
  gsap.fromTo(
    ".subtitle-letter",
    { opacity: 0 },
    {
      opacity: 1,
      duration: 0.3,
      stagger: 0.1,
      ease: "none"
    }
  );
}

function hideSubtitle(next) {
  gsap.to(".subtitle-letter", {
    y: 50,
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

function animateHeroText() {
  const heroHeading = document.getElementById('hero-heading');
  if (!heroHeading) return;
  
  // Store the original text structure
  const lines = [
    "I wander through ideas until one refuses to let me go, when curiosity becomes obsession, depth follows — and so does my best work."
  ];
  
  heroHeading.innerHTML = '';
  
  lines.forEach((line, lineIdx) => {
    const lineSpan = document.createElement('div');
    lineSpan.style.display = 'block';
    
    // Split by words first to keep them together
    const words = line.split(' ');
    
    words.forEach((word) => {
      const wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.marginRight = '0.3em';
      
      // Then split word into letters
      word.split('').forEach((char) => {
        const letterSpan = document.createElement('span');
        letterSpan.className = 'hero-letter';
        letterSpan.textContent = char;
        letterSpan.style.display = 'inline-block';
        letterSpan.style.clipPath = 'inset(0 100% 0 0)';
        wordSpan.appendChild(letterSpan);
      });
      
      lineSpan.appendChild(wordSpan);
    });
    
    heroHeading.appendChild(lineSpan);
    if (lineIdx < lines.length - 1) {
      heroHeading.appendChild(document.createElement('br'));
    }
  });
  
  // Animate all hero letters to expand (reveal effect like drawing)
  gsap.to('.hero-letter', {
    clipPath: 'inset(0 0% 0 0)',
    duration: 0.2,
    stagger: 0.06,
    ease: 'power1.out'
  });
}

// Recalculate positions on window resize
window.addEventListener('resize', () => {
  positionLetters();
  positionSubtitle();
});
