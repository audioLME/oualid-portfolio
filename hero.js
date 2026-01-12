const words = [
  "OUALID",
  "ARCHITECT",
  "DESIGNER",
  "3D ARTIST"
];

const container = document.getElementById("hero-letters");

let wordIndex = 0;

// spacing logic
function getLeft(index) {
  return `${index * 12}%`;
}

function showWord(word) {
  container.innerHTML = "";

  const letters = word.split("");

  letters.forEach((char, i) => {
    const div = document.createElement("div");
    div.className = "letter";
    div.textContent = char === " " ? "\u00A0" : char;
    div.style.left = getLeft(i);
    container.appendChild(div);
  });

  gsap.fromTo(
    ".letter",
    { y: 300, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.08,
      ease: "power4.out"
    }
  );
}

function hideWord(callback) {
  gsap.to(".letter", {
    y: -300,
    opacity: 0,
    duration: 0.6,
    stagger: 0.06,
    ease: "power4.in",
    onComplete: callback
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
