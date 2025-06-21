let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
let slideTimer = null;
let loopCount = 0;
const maxLoops = 3;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.style.display = i === index ? 'block' : 'none';
  });
}

function changeSlide(direction = 1) {
  const previousSlide = currentSlide;
  currentSlide = (currentSlide + direction + slides.length) % slides.length;

  // Check if we've completed a full loop
  if (currentSlide === 0 && previousSlide === slides.length - 1) {
    loopCount++;
    if (loopCount >= maxLoops) return; // Stop autoplay
  }

  showSlide(currentSlide);
  setNextSlideTimer();
}

function setNextSlideTimer() {
  if (slideTimer) clearTimeout(slideTimer);

  let interval = 10000;
  if (currentSlide === 1) interval = 15000; // Custom interval for one slide

  slideTimer = setTimeout(() => changeSlide(1), interval);
}

document.addEventListener('DOMContentLoaded', () => {
  showSlide(currentSlide);
  setNextSlideTimer();
});



document.addEventListener("DOMContentLoaded", function () {
  window.openModal = function (content) {
    const modal = document.getElementById("custom-modal");
    const body = document.getElementById("modal-body");

    if (!modal || !body) {
      console.error("Modal elements not found in DOM");
      return;
    }

    body.innerHTML = content;
    modal.style.display = "flex";
  };

  window.closeModal = function () {
    const modal = document.getElementById("custom-modal");
    if (modal) modal.style.display = "none";
  };
});
