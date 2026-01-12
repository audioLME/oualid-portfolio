const words = [
  "OUALID",
  "ARCHITECT",
  "DESIGNER",
  "3D ARTIST"
];

const container = document.getElementById("hero-letters");
let wordIndex = 0;

// horizontal spacing
function getLeft(index) {
  return `${index * 11}%`;
}

function showWord(word) {
  container.innerHTML = "";

  const letters = word.split("");

  letters.forEach((char, i) => {
    const el = document.createElement("div");
    el.className = "letter";
    el.textContent = char === " " ? "\u00A0" : char;
    el.style.left = getLeft(i);
    container.appendChild(el);
  });

  gsap.fromTo(
    ".letter",
    { y: 160, opacity: 0 },
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
    y: -160,
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

// START
cycle();
