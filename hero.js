const words = [
  "OUALID",
  "ARCHITECT",
  "DESIGNER",
  "3D ARTIST"
];

const container = document.getElementById("hero-letters");
let wordIndex = 0;

function getLeft(index) {
  return `${index * 10}%`;
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
    {
      rotationX: -90
    },
    {
      rotationX: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: "power3.out"
    }
  );
}

function hideWord(next) {
  gsap.to(".letter", {
    rotationX: 90,
    duration: 0.6,
    stagger: 0.06,
    ease: "power3.in",
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
