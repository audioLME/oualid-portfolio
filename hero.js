const words = [
  "OUALID",
  "ARCHITECT",
  "DESIGNER",
  "3D ARTIST"
];

const textEl = document.getElementById("typing-text");

let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

const typingSpeed = 0.08;
const deletingSpeed = 0.05;
const pauseAfterTyping = 1;

function loop() {
  const word = words[wordIndex];

  if (!isDeleting) {
    charIndex++;
    textEl.textContent = word.substring(0, charIndex);

    if (charIndex === word.length) {
      gsap.delayedCall(pauseAfterTyping, () => {
        isDeleting = true;
        loop();
      });
      return;
    }
  } else {
    charIndex--;
    textEl.textContent = word.substring(0, charIndex);

    if (charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
    }
  }

  gsap.delayedCall(isDeleting ? deletingSpeed : typingSpeed, loop);
}

loop();
