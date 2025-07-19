// === ALL-IN-ONE SCRIPT: FIXED IMAGE ZOOM + SLIDESHOW + MODALS ===

document.addEventListener("DOMContentLoaded", function () {

  // === PILOT RATINGS MODAL ===
    if (window.location.pathname === "/pilot-directory") {
  const pilotRatingsBtn = document.getElementById("pilot-ratings-btn");
  const customModal = document.getElementById("custom-modal");
  const modalClose = document.getElementById("custom-modal-close");

  if (pilotRatingsBtn && customModal && modalClose) {
    pilotRatingsBtn.addEventListener("click", function () {
      customModal.style.display = "flex";
    });

    modalClose.addEventListener("click", function () {
      customModal.style.display = "none";
    });
  }
    }
  // === DESKTOP SLIDESHOW ===
  const desktopSlides = document.querySelectorAll("#desktop-slideshow .slide");
  let desktopIndex = 0;
  let desktopCycles = 0;
  const desktopMaxCycles = 3;
  let desktopInterval;

  function showDesktopSlide(index) {
    desktopSlides.forEach((slide, i) => {
      slide.style.display = i === index ? "block" : "none";
    });
  }

  function scheduleNextDesktopSlide() {
    const delay = (desktopIndex === 1) ? 15000 : 5000;
    desktopInterval = setTimeout(() => {
      desktopIndex = (desktopIndex + 1) % desktopSlides.length;
      showDesktopSlide(desktopIndex);
      if (desktopIndex === 0) {
        desktopCycles++;
        if (desktopCycles >= desktopMaxCycles) return;
      }
      scheduleNextDesktopSlide();
    }, delay);
  }

  function changeDesktopSlide(n) {
    clearTimeout(desktopInterval);
    desktopIndex = (desktopIndex + n + desktopSlides.length) % desktopSlides.length;
    showDesktopSlide(desktopIndex);
    scheduleNextDesktopSlide();
  }

  if (desktopSlides.length > 0) {
    showDesktopSlide(desktopIndex);
    scheduleNextDesktopSlide();
    const prevBtn = document.getElementById("prevSlide");
    const nextBtn = document.getElementById("nextSlide");
    if (prevBtn && nextBtn) {
      prevBtn.addEventListener("click", () => changeDesktopSlide(-1));
      nextBtn.addEventListener("click", () => changeDesktopSlide(1));
    }
    window.changeSlide = changeDesktopSlide;
  }

  // === MOBILE SLIDESHOW ===
  const mobileSlides = document.querySelectorAll("#mobile-slideshow .slide");
  let mobileIndex = 0;
  let mobileCycles = 0;
  const mobileMaxCycles = 3;

  function showMobileSlide(index) {
    mobileSlides.forEach((slide, i) => {
      slide.style.display = i === index ? "block" : "none";
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
        if (mobileCycles >= mobileMaxCycles) clearInterval(mobileInterval);
      }
    }, 8000);
  }

  // === MOBILE ACCORDION ===
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      header.classList.toggle('open');
      const content = header.nextElementSibling;
      if (content && content.classList.contains('accordion-content')) {
        const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';
        content.style.maxHeight = isOpen ? '0px' : content.scrollHeight + 'px';
        if (!isOpen) {
          setTimeout(() => {
            const headerOffset = header.getBoundingClientRect().top + window.scrollY;
            const scrollOffset = 100;
            window.scrollTo({ top: headerOffset - scrollOffset, behavior: 'smooth' });
          }, 150);
        }
      }
    });
  });

  // === IMAGE TAP-ZOOM (MOBILE) ===
  document.querySelectorAll(".img-wrap").forEach(function (wrap) {
    const img = wrap.querySelector(".thumbnail");
    if (!img) return;

    img.addEventListener("click", function (e) {
      e.stopPropagation();
      const alreadyActive = wrap.classList.contains("active");

      document.querySelectorAll(".img-wrap.active").forEach(el => el.classList.remove("active"));
      if (!alreadyActive) {
        wrap.classList.add("active");
        document.body.style.overflow = "hidden";
      } else {
        wrap.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  });

  document.addEventListener("click", function (e) {
    const zoomed = document.querySelector(".img-wrap.active");
    if (zoomed && !zoomed.contains(e.target)) {
      zoomed.classList.remove("active");
      document.body.style.overflow = "";
    }
  });

  // === MOBILE PAST DELIVERIES THUMBNAIL TOGGLE ===
  document.querySelectorAll(".mob-past-deliv-thumb").forEach(img => {
    img.addEventListener("click", function () {
      const textRow = this.closest("tr").nextElementSibling;
      if (textRow && textRow.classList.contains("mob-past-deliv-text-row")) {
        textRow.classList.toggle("open");
      }
    });
  });

  // === RESTORE SCROLL POSITION ===
  if (window.location.pathname === "/past-deliveries") {
    const savedScroll = localStorage.getItem("scrollPosition");
    if (savedScroll !== null) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll, 10));
        localStorage.removeItem("scrollPosition");
      }, 100);
    }
  }

  // === SAVE SCROLL POSITION ON LINK CLICK ===
  document.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", function () {
      localStorage.setItem("scrollPosition", window.scrollY);
    });
  });

  // === MOBILE MENU HAMBURGER TOGGLE ===
  const hamburger = document.getElementById("hamburger-icon");
  const mobileMenu = document.getElementById("mobileMenu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      mobileMenu.classList.toggle("show");
      hamburger.src = mobileMenu.classList.contains("show")
        ? "/assets/mobile/mobile-close-menu.svg"
        : "/assets/mobile/burger.png";
    });
  } // <-- closes the hamburger && mobileMenu if-block
    });

document.addEventListener("DOMContentLoaded", () => {
  // === BODY CLASS FOR MOBILE ===
  if (window.innerWidth <= 768) {
    document.body.classList.add("mobile");
  }

  // === Hide menu on outside click ===
  document.addEventListener("click", (e) => {
    if (
      mobileMenu.classList.contains("show") &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      mobileMenu.classList.remove("show");
      hamburger.src = "/assets/mobile/burger.png";
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const zoomBlocks = document.querySelectorAll(".img-wrap");

  zoomBlocks.forEach(function (wrap) {
    wrap.addEventListener("click", function () {
      const isActive = wrap.classList.contains("active");

      // Deactivate all other zooms and demote any promoted wrapper
      document.querySelectorAll(".img-wrap.active").forEach(function (el) {
        el.classList.remove("active");
        const promoteWrapper = el.closest(".zoom-wrapper");
        if (promoteWrapper) promoteWrapper.classList.remove("promote");
      });

      if (!isActive) {
        // Activate this one
        wrap.classList.add("active");

        // Promote its wrapper
        const zoomWrapper = wrap.closest(".zoom-wrapper");
        if (zoomWrapper) zoomWrapper.classList.add("promote");

        // Allow content to bleed outside viewport
        document.documentElement.style.overflow = "visible";
        document.body.style.overflow = "visible";
      } else {
        // Remove zoom + promotion
        wrap.classList.remove("active");
        const zoomWrapper = wrap.closest(".zoom-wrapper");
        if (zoomWrapper) zoomWrapper.classList.remove("promote");

        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }
    });
  });
});


document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".mob-tooltip").forEach(function (el) {
    el.addEventListener("click", function (e) {
      // Toggle this tooltip
      const isOpen = el.classList.contains("show-tooltip");
      document.querySelectorAll(".mob-tooltip").forEach(t => t.classList.remove("show-tooltip"));
      if (!isOpen) el.classList.add("show-tooltip");
      e.stopPropagation(); // Prevent close-on-body-click from firing immediately
    });
  });

  // Tap anywhere else to close any open tooltip
  document.addEventListener("click", function () {
    document.querySelectorAll(".mob-tooltip").forEach(el => el.classList.remove("show-tooltip"));
  });
});

document.addEventListener("DOMContentLoaded", function () {
 const modal = document.getElementById("desk-past-deliv-modal");
const modalImg = document.getElementById("desk-past-deliv-img");
const modalClose = document.getElementById("desk-past-deliv-close");

if (modal && modalImg && modalClose) {
  const thumbnails = document.querySelectorAll("img[data-full]");

  thumbnails.forEach(function (img) {
    img.addEventListener("click", function () {
      const fullSrc = this.getAttribute("data-full");
      modalImg.src = fullSrc;
      modal.style.display = "flex";
    });
  });

  modalClose.addEventListener("click", function () {
    modal.style.display = "none";
    modalImg.src = "";
  });

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.style.display = "none";
      modalImg.src = "";
    }
  });
}
})
