let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.style.display = i === index ? 'block' : 'none';
  });
}

function changeSlide(direction = 1) {
  currentSlide = (currentSlide + direction + slides.length) % slides.length;
  showSlide(currentSlide);
}

// Auto-play every 10 seconds
setInterval(() => {
  changeSlide(1);
}, 10000);

// Show first slide on script load
showSlide(currentSlide);
