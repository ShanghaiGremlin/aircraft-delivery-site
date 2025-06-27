document.addEventListener('DOMContentLoaded', function () {
  initSlideshow('#desktop-slideshow');
  initSlideshow('#mobile-slideshow');

  function initSlideshow(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const slides = container.querySelectorAll('.slide');
    if (slides.length === 0) return;

    let index = 0;

    function showSlide(i) {
      slides.forEach((slide, j) => {
        slide.style.display = j === i ? 'block' : 'none';
      });
    }

    function changeSlide(n) {
      index = (index + n + slides.length) % slides.length;
      showSlide(index);
    }

    // Initialize slideshow
    showSlide(index);

    // Optional: autoplay
    // setInterval(() => changeSlide(1), 5000);

    // Hook up buttons inside this container
    const prevBtn = container.querySelector('.prev');
    const nextBtn = container.querySelector('.next');
    if (prevBtn) prevBtn.addEventListener('click', () => changeSlide(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => changeSlide(1));
  }
});









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

  // === Testimonial Modal Trigger ===
  document.querySelectorAll('.testimonial-thumb').forEach(img => {
    img.addEventListener('click', function () {
      const fullImageUrl = this.getAttribute('data-full');
      if (fullImageUrl) {
        openModal(`<img src="${fullImageUrl}" style="width: 100%; height: auto;" alt="Full Testimonial Image">`);
      }
    });
  });

  // === Form Submission with Redirect ===
  const quoteForm = document.getElementById('quoteForm');

  if (quoteForm) {
    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const formData = new FormData(quoteForm);

      fetch('https://formspree.io/f/mnnvozvg', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          window.location.href = "/thank-you";
        } else {
          alert("Submission failed. Please try again.");
        }
      })
      .catch(error => {
        console.error(error);
        alert("There was a network error.");
      });
    });
  }



document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", function () {
      mobileMenu.classList.toggle("show");
    });
  } else {
    console.warn("Missing .hamburger or #mobileMenu element");
  }
});

window.addEventListener('pageshow', function (event) {
  const mobileMenu = document.querySelector('.mobile-menu');
  const hamburger = document.querySelector('.hamburger');

  if (mobileMenu && mobileMenu.classList.contains('show')) {
    mobileMenu.classList.remove('show');
  }

  if (hamburger && hamburger.classList.contains('open')) {
    hamburger.classList.remove('open');
  }
});


