// === DESKTOP & MOBILE SLIDESHOW ===
document.addEventListener('DOMContentLoaded', function () {
  console.log("DOM fully loaded");

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
          clearInterval(desktopInterval);
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
          clearInterval(mobileInterval);
        }
      }
    }, 8000);
  }

  // === Accordion Scroll + Toggle ===
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const isOpen = content.style.maxHeight;
      header.classList.toggle('active');
      content.style.maxHeight = isOpen ? null : content.scrollHeight + 'px';

      setTimeout(() => {
        const fixedHeaderHeight = 105;
        const elementTop = header.getBoundingClientRect().top + window.scrollY;
        const scrollTarget = elementTop - fixedHeaderHeight;

        window.scrollTo({
          top: scrollTarget,
          behavior: 'smooth'
        });
      }, 200);
    });
  });

  // === MOBILE ABOUT IMAGE MODAL ===
  const imgModal = document.getElementById("imgModal");
  const modalImg = document.getElementById("modalImg");
  const modalCaption = document.getElementById("modalCaption");
  const modalClose = document.getElementById("modalClose");

  if (imgModal && modalImg && modalCaption && modalClose) {
    document.querySelectorAll(".mobile-newspaper-img-left img").forEach(function (img) {
      img.style.cursor = "pointer";
      img.addEventListener("click", function () {
        modalImg.src = this.src;
        const caption = this.closest(".mobile-newspaper-img-left")?.querySelector(".mob-about-img-caption");
        modalCaption.textContent = caption ? caption.textContent : "";
        imgModal.style.display = "flex";
      });
    });

    modalClose.addEventListener("click", function () {
      imgModal.style.display = "none";
    });

    imgModal.addEventListener("click", function (e) {
      if (e.target === imgModal) {
        imgModal.style.display = "none";
      }
    });
  }

  // === Unified Modal ===
  const unifiedModal = document.getElementById("unified-modal");
  const unifiedBody = document.getElementById("unified-modal-body");
  const pilotRatingsBtn = document.getElementById("pilotRatingsBtn");

  if (unifiedModal && unifiedBody && pilotRatingsBtn) {
    pilotRatingsBtn.addEventListener("click", () => {
      unifiedBody.innerHTML = `
        <p><u>Aircraft Delivery Solutions pilot type ratings</u></p> 
        <ul>
          <li><b>BEECHCRAFT:</b> BE300 (King Air 350)</li> 
          <li><b>BOEING:</b> B747-200, B747-400/8, DC-9</li> 
          <li><b>BOMBARDIER:</b> CL-65, DHC-8, LR-JET</li> 
          <li><b>CESSNA:</b> CE-750 (Citation X)</li> 
          <li><b>DASSAULT:</b> FA-20, FA-50 [SIC]</li> 
          <li><b>EMBRAER:</b> EMB-120, EMB-170–195, EMB-550</li> 
          <li><b>FAIRCHILD:</b> SA-227</li> 
          <li><b>GULFSTREAM:</b> IAI-1125 (G100), Gulfstream IV [SIC]</li> 
          <li><b>LOCKHEED:</b> L-300 (C141)</li> 
          <li><b>SIKORSKY:</b> S-70 (UH-60)</li> 
        </ul>`;
      unifiedModal.style.display = "flex";
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        unifiedModal.style.display = "none";
      }
    });

    unifiedModal.addEventListener("click", function (e) {
      if (e.target === unifiedModal) {
        unifiedModal.style.display = "none";
      }
    });
  }

  // === Testimonial Modal Trigger ===
  document.querySelectorAll('.testimonial-thumb').forEach(img => {
    img.addEventListener('click', function () {
      const fullImageUrl = this.getAttribute('data-full');
      if (fullImageUrl) {
        openModal(`<img src="${fullImageUrl}" style="width: 100%; height: auto;" alt="Full Testimonial Image">`);
      }
    });
  });

  // === Quote Form Submission ===
  const desktopForm = document.getElementById("quote-form-desktop");
  const mobileForm = document.getElementById("quote-form-mobile");

  function isVisible(elem) {
    return elem && elem.offsetParent !== null;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    console.log("Form submitted:", Object.fromEntries(formData.entries()));
    alert("Your quote request has been submitted!");
  }

  if (isVisible(desktopForm)) {
    desktopForm.addEventListener("submit", handleSubmit);
  }
  if (isVisible(mobileForm)) {
    mobileForm.addEventListener("submit", handleSubmit);
  }

  // === Hamburger Mobile Menu ===
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", function () {
      mobileMenu.classList.toggle("show");
    });
  }

  window.addEventListener('pageshow', function () {
    if (mobileMenu && mobileMenu.classList.contains('show')) {
      mobileMenu.classList.remove('show');
    }
    if (hamburger && hamburger.classList.contains('open')) {
      hamburger.classList.remove('open');
    }
  });

  // === Tooltip Support (Mobile) ===
  const tooltips = document.querySelectorAll(".tappable-mob-tooltip");
  console.log("Found", tooltips.length, "tooltip(s)");

  tooltips.forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.stopPropagation();
      tooltips.forEach(function (other) {
        other.classList.remove("active");
      });
      this.classList.toggle("active");
      console.log("Tapped tooltip: ", this.textContent);
    });
  });

  document.addEventListener("click", function () {
    tooltips.forEach(function (el) {
      el.classList.remove("active");
    });
  });
});

// === Global Modal Fallbacks ===
function closeModal() {
  const modal = document.getElementById("imgModal");
  if (modal) modal.style.display = "none";
}

function openMobileModal() {
  const modal = document.getElementById('mobile-modal');
  if (modal) modal.style.display = 'flex';
}

function closeMobileModal() {
  const modal = document.getElementById('mobile-modal');
  if (modal) modal.style.display = 'none';
}

function openModal(content) {
  const modal = document.getElementById("custom-modal");
  const body = document.getElementById("modal-body");
  if (modal && body) {
    body.innerHTML = content;
    modal.style.display = "flex";
  }
}
