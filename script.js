// === SLIDESHOW LOGIC ===
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

// === DOMContentLoaded Initialization ===
document.addEventListener('DOMContentLoaded', function () {

  // Initialize slideshow
  if (slides.length > 0) {
    showSlide(currentSlide);
    setNextSlideTimer();
  }

  // === Modal Logic ===
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

  // Close modal on ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal();
    }
  });

  // Close modal on click
  const modalElement = document.getElementById("custom-modal");
  if (modalElement) {
    modalElement.addEventListener("click", function () {
      closeModal();
    });
  }

  // === Accordion Logic ===
  document.querySelectorAll('.accordion-header').forEach(button => {
    button.addEventListener('click', () => {
      const content = button.nextElementSibling;
      const isOpen = content.style.maxHeight;

      // Close other sections
      document.querySelectorAll('.accordion-content').forEach(c => {
        c.style.maxHeight = null;
        c.previousElementSibling.classList.remove('active');
      });

      if (!isOpen) {
        content.style.maxHeight = content.scrollHeight + "px";
        button.classList.add('active');
      } else {
        content.style.maxHeight = null;
        button.classList.remove('active');
      }
    });
  });

  // === Testimonial Image Modal Logic ===
  document.querySelectorAll('.testimonial-thumb').forEach(img => {
    img.addEventListener('click', function () {
      const fullImage = img.getAttribute('data-full');
      if (fullImage) {
        openModal(`<img src="${fullImage}" style="width:100%; height:auto;">`);
      }
    });
  });
});
