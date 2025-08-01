// === ALL-IN-ONE SCRIPT: FIXED IMAGE ZOOM + SLIDESHOW + MODALS ===

document.addEventListener("DOMContentLoaded", function () {

if (window.location.pathname === "/pilot-directory") {
  const pilotRatingsBtn = document.getElementById("pilot-ratings-btn");
  const customModal = document.getElementById("custom-modal");
  const modalClose = document.getElementById("custom-modal-close");

  if (pilotRatingsBtn && customModal && modalClose) {
    pilotRatingsBtn.addEventListener("click", function () {
      customModal.style.display = "flex";
    });

    // Close on close button
    modalClose.addEventListener("click", function () {
      customModal.style.display = "none";
    });

    // Close by clicking outside modal content
    customModal.addEventListener("click", function (e) {
      if (e.target === customModal) {
        customModal.style.display = "none";
      }
    });
  }
}

  // === SERVICES SLIDESHOW ===
  const desktopSlides = document.querySelectorAll("#desk-services-slideshow .slide");
  let desktopIndex = 0;
  let desktopCycles = 0;
  const desktopMaxCycles = 3;
  let desktopInterval;
  let desktopPaused = false;


  function showDesktopSlide(index) {
    desktopSlides.forEach((slide, i) => {
      slide.style.display = i === index ? "block" : "none";
    });
  }

  function scheduleNextDesktopSlide() {
     if (desktopPaused) return;
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

    const slideshowContainer = document.getElementById("desk-services-slideshow");
if (slideshowContainer) {
  slideshowContainer.addEventListener("mouseenter", () => {
    desktopPaused = true;
    clearTimeout(desktopInterval);
  });
  slideshowContainer.addEventListener("mouseleave", () => {
    desktopPaused = false;
    scheduleNextDesktopSlide();
  });
}

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

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.style.display = "none";
      modalImg.src = "";
    }
  });
}
})

// Global state to manage scroll behavior
let lastOpenedBtn = null;
let lastOpenedY = null;
let lastOpenedScrollY = null;

document.addEventListener("DOMContentLoaded", function () {
  const toggles = document.querySelectorAll(".desk-quote-accordion-toggle");

  toggles.forEach(toggle => {
    toggle.addEventListener("click", function () {
      const panel = document.getElementById(this.getAttribute("aria-controls"));
      const isOpen = this.getAttribute("aria-expanded") === "true";

      // Close all panels
      document.querySelectorAll(".desk-quote-accordion-panel").forEach(p => {
        p.hidden = true;
      });
      toggles.forEach(t => t.setAttribute("aria-expanded", "false"));

      // Toggle this one
      if (!isOpen) {
        this.setAttribute("aria-expanded", "true");
        panel.hidden = false;

        // Store scroll state for possible snap-back
        lastOpenedBtn = this;
        lastOpenedY = this.getBoundingClientRect().top + window.pageYOffset - 225;
        lastOpenedScrollY = window.pageYOffset;

        // Scroll to newly opened accordion
        window.scrollTo({ top: lastOpenedY, behavior: "smooth" });

      } else {
        // Manual close
        this.setAttribute("aria-expanded", "false");
        panel.hidden = true;

        const currentScrollY = window.pageYOffset;
        const scrollDelta = Math.abs(currentScrollY - lastOpenedScrollY);
        const userScrolledSinceOpen = scrollDelta > 100;

        console.log("DEBUG: currentScrollY =", currentScrollY);
        console.log("DEBUG: lastOpenedScrollY =", lastOpenedScrollY);
        console.log("DEBUG: scrollDelta =", scrollDelta);
        console.log("DEBUG: same button?", lastOpenedBtn === this);
        console.log("DEBUG: userScrolledSinceOpen =", userScrolledSinceOpen);

        if (lastOpenedBtn === this && !userScrolledSinceOpen) {
          console.log(">> Snap-back triggered");
          window.scrollTo({ top: lastOpenedY, behavior: "smooth" });
        } else {
          console.log(">> Snap-back canceled");
        }

        // Clear stored state
        lastOpenedBtn = null;
        lastOpenedY = null;
        lastOpenedScrollY = null;
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const phoneIcon = document.getElementById("phoneIcon");
  let wiggleCount = 0;
  const maxCycles = 3;

  if (phoneIcon) {
    const interval = setInterval(() => {
      if (wiggleCount >= maxCycles) {
        clearInterval(interval); // stop after 3 cycles
        return;
      }

      // Restart the animation
      phoneIcon.style.animation = "none";
      phoneIcon.offsetHeight; // force reflow
      phoneIcon.style.animation = ""; // reapply defined animation

      wiggleCount++;
    }, 8000); // every 8 seconds
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const shimmerTarget = document.getElementById("shimmerTarget");
  let shimmerCount = 0;
  const maxShimmers = 3;

  if (shimmerTarget) {
    const shimmerInterval = setInterval(() => {
      // Reset the class if already applied
      shimmerTarget.classList.remove("subtle-background-shimmer");
      void shimmerTarget.offsetWidth; // Force reflow to restart animation

      // Apply shimmer effect
      shimmerTarget.classList.add("subtle-background-shimmer");

      shimmerCount++;
      if (shimmerCount >= maxShimmers) {
        clearInterval(shimmerInterval);
      }
    }, 10000); // run every 10 seconds
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const slides = document.querySelectorAll(".desk-past-deliv-slider-slide");
  let currentIndex = 0;
  const total = slides.length;
  const intervalTime = 10000;
  let sliderInterval;
  let advanceCount = 0;
  const maxAdvances = total * 2;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      const img = slide.querySelector(".desk-past-deliv-slider-thumb");
      if (i === index) {
        slide.classList.add("active");
        img.classList.add("fade-image");
      } else {
        slide.classList.remove("active");
        setTimeout(() => {
          img.classList.remove("fade-image");
        }, 2000); // match image fade duration
      }
    });
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % total;
    showSlide(currentIndex);
    advanceCount++;
    if (advanceCount >= maxAdvances) {
      clearInterval(sliderInterval);
    }
  }

  function startSlider() {
    sliderInterval = setInterval(nextSlide, intervalTime);
  }

  showSlide(currentIndex);
  startSlider();
});
