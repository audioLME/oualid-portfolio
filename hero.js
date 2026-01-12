const words = [
  "OUALID",
  "ARCHITECT",
  "DESIGNER",
  "3D ARTIST"
];

const container = document.getElementById("hero-letters");
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
  const el = container.querySelector('.letter');
  const fontSize = parseFloat(getComputedStyle(el).fontSize);
  const averageWidth = 0.6 * fontSize;
  const spacing = containerWidth / (letters.length + 1);
  const startCenter = containerWidth / 2 - ((letters.length - 1) * spacing) / 2;

  container.querySelectorAll('.letter').forEach((el, i) => {
    el.style.left = `${startCenter - averageWidth / 2 + i * spacing}px`;
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
