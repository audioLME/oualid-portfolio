// Words come from i18n.js so they follow the language switch
let words = window.I18N ? I18N.t('hero.words').slice() : ["OUALID", "ARCHITECT", "DESIGNER", "3D ARTIST"];

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
  
  // Use uniform gap to prevent uneven spacing between letters
  const gap = oualidTotalWidth > 0 
    ? Math.max(5, (oualidTotalWidth - sumWidths) / (widths.length - 1))
    : Math.min(8, Math.max(5, (containerWidth - sumWidths) / (widths.length - 1)));
  
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
  // Hide main animation letters
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
    onComplete: () => {
      if (next) next();
    }
  });
}

function cycle() {
  if (isPaused) return;
  
  showWord(words[wordIndex]);
  
  const continueBtn = document.getElementById('continue-arrow');
  
  // Show subtitle only for OUALID
  if (wordIndex === 0) {
    gsap.delayedCall(0.9, showSubtitle);
  }
  
  // Continue button is always visible now, no need to hide/show per word

  gsap.delayedCall(2.5, () => {
    const hideActions = [() => hideWord(() => {
      wordIndex = (wordIndex + 1) % words.length;
      cycle();
    })];
    
    // Hide subtitle if it's OUALID
    if (wordIndex === 0) {
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

let heroTextShown = false;

// Builds the quote under the name. Latin text is revealed letter by letter;
// Arabic is revealed word by word (splitting Arabic letters breaks how they join).
function renderHeroText(animate) {
  const heroHeading = document.getElementById('hero-heading');
  if (!heroHeading) return;
  const rtl = window.I18N && I18N.lang === 'ar';
  const quote = window.I18N ? I18N.t('hero.quote') : heroHeading.textContent;
  const hidden = rtl ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';

  heroHeading.innerHTML = '';
  heroHeading.setAttribute('aria-label', quote);
  const lineSpan = document.createElement('div');
  lineSpan.style.display = 'block';
  lineSpan.setAttribute('aria-hidden', 'true');

  let letterIndex = 0;
  quote.split(' ').forEach((word) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'hero-word-wrap';
    const units = rtl ? [word] : word.split('');
    units.forEach((char) => {
      const letterSpan = document.createElement('span');
      letterSpan.className = 'hero-letter';
      letterSpan.textContent = char;
      letterSpan.style.clipPath = animate ? hidden : 'none';
      letterSpan.style.setProperty('--letter-index', letterIndex++);
      wordSpan.appendChild(letterSpan);
    });
    lineSpan.appendChild(wordSpan);
  });
  heroHeading.appendChild(lineSpan);

  if (animate) {
    gsap.to('.hero-letter', {
      clipPath: 'inset(0 0% 0 0%)',
      duration: rtl ? 0.35 : 0.2,
      stagger: rtl ? 0.12 : 0.06,
      ease: 'power1.out'
    });
  }
}

function animateHeroText() {
  heroTextShown = true;
  renderHeroText(true);
}

// Language switch: swap the words for the next cycle and redraw the quote
window.addEventListener('langchange', () => {
  words = I18N.t('hero.words').slice();
  if (heroTextShown) renderHeroText(false);
});

// Recalculate positions on window resize
window.addEventListener('resize', () => {
  positionLetters();
  positionSubtitle();
});
