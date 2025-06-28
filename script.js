document.addEventListener('DOMContentLoaded', function () {
  // === DESKTOP SLIDESHOW ===
  const desktopSlides = document.querySelectorAll('#desktop-slideshow .slide');
  let desktopIndex = 0;
  let desktopCycles = 0;
  const desktopMaxCycles = 3;

  function showDesktopSlide(index) {
    desktopSlides.forEach((slide, i) => {
      slide.style.display = i === index ? 'block' : 'none';
    });
  }

  function changeDesktopSlide(n) {
    desktopIndex = (desktopIndex + n + desktopSlides.length) % desktopSlides.length;
    showDesktopSlide(desktopIndex);
  }

  if (desktopSlides.length > 0) {
    showDesktopSlide(desktopIndex);
    window.changeSlide = changeDesktopSlide;

    const desktopInterval = setInterval(() => {
      desktopIndex = (desktopIndex + 1) % desktopSlides.length;
      showDesktopSlide(desktopIndex);

      if (desktopIndex === 0) {
        desktopCycles++;
        if (desktopCycles >= desktopMaxCycles) {
          clearInterval(desktopInterval); // stop autoplay, buttons still work
        }
      }
    }, 5000);
  }

  // === MOBILE SLIDESHOW ===
  const mobileSlides = document.querySelectorAll('#mobile-slideshow .slide');
  let mobileIndex = 0;
  let mobileCycles = 0;
  const mobileMaxCycles = 3;

  function showMobileSlide(index) {
    mobileSlides.forEach((slide, i) => {
      slide.style.display = i === index ? 'block' : 'none';
    });
  }

  function changeMobileSlide(n) {
    mobileIndex = (mobileIndex + n + mobileSlides.length) % mobileSlides.length;
    showMobileSlide(mobileIndex);
  }

  if (mobileSlides.length > 0) {
    showMobileSlide(mobileIndex);
    window.changeSlide = changeMobileSlide;

    const mobileInterval = setInterval(() => {
      mobileIndex = (mobileIndex + 1) % mobileSlides.length;
      showMobileSlide(mobileIndex);

      if (mobileIndex === 0) {
        mobileCycles++;
        if (mobileCycles >= mobileMaxCycles) {
          clearInterval(mobileInterval); // stop autoplay, buttons still work
        }
      }
    }, 8000);
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

  document.addEventListener("DOMContentLoaded", function () {
  const desktopForm = document.getElementById("quote-form-desktop");
  const mobileForm = document.getElementById("quote-form-mobile");

  function isVisible(elem) {
    return elem && elem.offsetParent !== null;
  }

  function handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // You can replace this with your real submission logic
    console.log("Form submitted:", Object.fromEntries(formData.entries()));

    // Optionally show a confirmation message
    alert("Your quote request has been submitted!");
  }

  if (isVisible(desktopForm)) {
    desktopForm.addEventListener("submit", handleSubmit);
  }

  if (isVisible(mobileForm)) {
    mobileForm.addEventListener("submit", handleSubmit);
  }
});



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


