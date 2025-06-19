let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
let slideTimer = null;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.style.display = i === index ? 'block' : 'none';
  });
}

function changeSlide(direction = 1) {
  currentSlide = (currentSlide + direction + slides.length) % slides.length;
  showSlide(currentSlide);
  setNextSlideTimer(); // Restart timer on manual nav or autoplay
}

function setNextSlideTimer() {
  if (slideTimer) clearTimeout(slideTimer);

  let interval = 10000; // Default 10 seconds

  // Set custom time for Slide #2 (index 1)
  if (currentSlide === 1) {
    interval = 15000; // 15 seconds
  }

  slideTimer = setTimeout(() => changeSlide(1), interval);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  showSlide(currentSlide);
  setNextSlideTimer();
});
