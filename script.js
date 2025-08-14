function injectSharedRatingsContent(modalBodyId) {
  const content = document.getElementById("pilot-dir-shared-pilot-ratings-content");
  const target = document.getElementById(modalBodyId);
  if (content && target && !target.dataset.injected) {
    target.insertAdjacentHTML("beforeend", content.innerHTML);
    target.dataset.injected = "true";
  }
}

// Desktop modal logic
const deskRatingsBtn = document.getElementById("pilot-ratings-btn");
const deskModal = document.getElementById("desk-pilot-ratings-modal");
const deskModalBody = document.getElementById("desk-pilot-ratings-modal-body");
const deskModalClose = document.querySelector(".desk-modal-close");

if (deskRatingsBtn && deskModal && deskModalBody && deskModalClose) {
  deskRatingsBtn.addEventListener("click", () => {
    injectSharedRatingsContent("desk-pilot-ratings-modal-body");
    deskModal.style.display = "flex";
  });

  deskModalClose.addEventListener("click", () => {
    deskModal.style.display = "none";
  });
}

// Mobile modal logic
const waitForMobRatingsBtn = setInterval(() => {
  const mobBtn = document.getElementById("pilotRatingsBtn");
  const mobModal = document.getElementById("mob-pilot-ratings-modal");
  const mobModalBody = document.getElementById("mob-pilot-ratings-modal-body");
  const mobModalClose = document.getElementById("mob-pilot-ratings-close");

  if (mobBtn && mobModal && mobModalBody && mobModalClose) {
    mobBtn.addEventListener("click", () => {
      injectSharedRatingsContent("mob-pilot-ratings-modal-body");
      mobModal.style.display = "flex";
    });

    mobModalClose.addEventListener("click", () => {
      mobModal.style.display = "none";
    });

    clearInterval(waitForMobRatingsBtn);
  }
}, 100);






  // === SERVICES SLIDESHOW ===
  const desktopSlides = document.querySelectorAll("#desk-services-slideshow .services-slide");
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
}}


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
  ;

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

//document.addEventListener("DOMContentLoaded", function () {
//  const zoomBlocks = document.querySelectorAll(".img-wrap");

//  zoomBlocks.forEach(function (wrap) {
//    wrap.addEventListener("click", function () {
//      const isActive = wrap.classList.contains("active");

      // Deactivate all other zooms and demote any promoted wrapper
  //    document.querySelectorAll(".img-wrap.active").forEach(function (el) {
  //      el.classList.remove("active");
  //      const promoteWrapper = el.closest(".zoom-wrapper");
  //      if (promoteWrapper) promoteWrapper.classList.remove("promote");
    //  });

  //    if (!isActive) {
        // Activate this one
 //       wrap.classList.add("active");

        // Promote its wrapper
  //      const zoomWrapper = wrap.closest(".zoom-wrapper");
  //      if (zoomWrapper) zoomWrapper.classList.add("promote");

        // Allow content to bleed outside viewport
 //       document.documentElement.style.overflow = "visible";
  //      document.body.style.overflow = "visible";
      //} else {
        // Remove zoom + promotion
        //wrap.classList.remove("active");
        //const zoomWrapper = wrap.closest(".zoom-wrapper");
        //if (zoomWrapper) zoomWrapper.classList.remove("promote");

//        document.documentElement.style.overflow = "";
  //      document.body.style.overflow = "";
    //  }
   // });
 // });
//});








//document.addEventListener("DOMContentLoaded", function () {
// const modal = document.getElementById("desk-past-deliv-modal");
//const modalImg = document.getElementById("desk-past-deliv-img");
//const modalClose = document.getElementById("desk-past-deliv-close");

//if (modal && modalImg && modalClose) {
//  const thumbnails = document.querySelectorAll("img[data-full]");

  //thumbnails.forEach(function (img) {
   // img.addEventListener("click", function () {
    //  const fullSrc = this.getAttribute("data-full");
    //  modalImg.src = fullSrc;
   //   modal.style.display = "flex";
  //  });
 // });

 //modal.addEventListener("click", function (e) {
   // if (e.target === modal) {
     // modal.style.display = "none";
     // modalImg.src = "";
  //  }
 // });
//}
//})

// Global state to manage scroll behavior
//let lastOpenedBtn = null;
//let lastOpenedY = null;
//let lastOpenedScrollY = null;



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

const zoomOverlay = document.getElementById("mob-past-deliv-modal");
const zoomImg = document.getElementById("mob-past-deliv-img");
const zoomCaption = document.getElementById("mob-past-deliv-caption");

if (zoomOverlay && zoomImg && zoomCaption) {
  zoomOverlay.addEventListener("click", function (e) {
    zoomOverlay.style.display = "none";
    zoomImg.removeAttribute("src");
    zoomImg.removeAttribute("srcset");
    zoomCaption.textContent = "";
  });

  const thumbs = document.querySelectorAll("img[data-full]");
  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", function () {
      zoomImg.src = thumb.getAttribute("data-full");
      zoomImg.srcset = thumb.getAttribute("data-srcset") || "";
      zoomImg.setAttribute("sizes", "100vw");
      const captionText = thumb.nextElementSibling?.textContent || "";
      zoomCaption.textContent = captionText;
      zoomOverlay.style.display = "flex";
    });
  });
}







document.addEventListener("DOMContentLoaded", function () {
    const modalOverlay = document.getElementById("mob-about-zoom-overlay");
    const modalImg = document.getElementById("mob-about-zoom-img");
    const modalCaption = document.getElementById("mob-about-zoom-caption");

    // Check if modal elements exist
    if (!modalOverlay || !modalImg || !modalCaption) {
        console.log("Modal elements are missing.");
        return;
    }

    // Add click event listener to each thumbnail to open the modal
    document.querySelectorAll(".mob-about-thumb").forEach(function (thumb) {
        thumb.addEventListener("click", function () {
            console.log("Modal clicked!"); // Log to verify click event
            modalImg.src = thumb.src;
            modalCaption.textContent = thumb.nextElementSibling?.textContent || "";
            modalOverlay.style.display = "flex";
        });
    });

    // Add click event listener to the overlay to close the modal when clicked
    modalOverlay.addEventListener("click", function (e) {
        // Check if the click is on the overlay itself (not the content)
        if (e.target === modalOverlay) {
            console.log("Overlay clicked, closing modal");
            modalOverlay.style.display = "none";
            modalImg.removeAttribute("src");
            modalCaption.textContent = "";
        }
    });
});




// ✅ MOBILE SLIDESHOW for /past-deliveries with 1 cycle limit
const mobSlides = document.querySelectorAll(".mob-past-deliv-slider-slide");
let mobCurrent = 0;
let mobCycles = 0;
const mobMaxCycles = 1;
const mobTotalSlides = mobSlides.length;

if (mobTotalSlides > 1) {
  const slideInterval = setInterval(() => {
    mobSlides[mobCurrent].classList.remove("active");
    mobCurrent = (mobCurrent + 1) % mobTotalSlides;
    mobSlides[mobCurrent].classList.add("active");

    // If we've completed a full loop, count it
    if (mobCurrent === 0) {
      mobCycles++;
      if (mobCycles >= mobMaxCycles) {
        clearInterval(slideInterval);
        console.log("⏹️ Mobile slider stopped after 1 full cycle");
      }
    }
  }, 10000);
}

// Accordion toggle logic – multiple allowed open, with scroll on open
//const allAccordionToggles = document.querySelectorAll('.desk-quote-accordion-toggle');


//allAccordionToggles.forEach((toggle) => {
 // toggle.addEventListener('click', () => {
   // const expanded = toggle.getAttribute('aria-expanded') === 'true';
  //  toggle.setAttribute('aria-expanded', String(!expanded));

//    const panel = toggle.nextElementSibling;
  //  if (!expanded) {
    //  panel.style.display = 'block';

      // Scroll behavior
 //     const offset = window.innerWidth <= 768 ? 100 : 60; // Mobile vs Desktop offset
   //   const panelTop = panel.getBoundingClientRect().top + window.scrollY - offset;
 //     window.scrollTo({ top: panelTop, behavior: 'smooth' });
 //   } else {
   //   panel.style.display = 'none';
//    }
//  });
// });

document.addEventListener("DOMContentLoaded", function () {
  const joinPage = document.querySelector(".join-page");
  if (joinPage) {
    joinPage.querySelectorAll(".join-accordion-toggle").forEach((btn) => {
      btn.addEventListener("click", function () {
        const wrapper = btn.closest(".join-wayaligner");
        const panel = wrapper?.nextElementSibling;

        if (!panel) {
          console.warn("⚠️ Panel not found for join-page accordion.");
          return;
        }

        const isOpen = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!isOpen));
        panel.style.display = isOpen ? "none" : "block";
      });
    });
  }

  // All other global accordions (outside join-page)
  document.querySelectorAll('.desk-quote-accordion-toggle').forEach((toggle) => {
    // Skip if toggle is inside join-page (already handled above)
    if (toggle.closest(".join-page")) return;

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));

      const panel = toggle.nextElementSibling;
      if (!panel) {
        console.warn("⚠️ Panel not found for global accordion.");
        return;
      }

if (!expanded) {
  panel.style.display = 'block';

  // Scroll down only until the toggle sits at headerOffset from the top
  requestAnimationFrame(() => {
    const headerOffset = 165; // fixed header height
    const targetTop =
      toggle.getBoundingClientRect().top + window.scrollY - headerOffset;

    // Clamp to the document bottom
    const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const clamped = Math.min(targetTop, maxTop);

    // Only scroll if we'd move DOWN (avoid upward nudges)
    if (clamped > window.scrollY + 1) {
      window.scrollTo({ top: clamped, behavior: 'smooth' });
    }
  });
} else {
  panel.style.display = 'none';
}

    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const HEADER_OFFSET = 165; // fixed header height (adjust if needed)

  document.querySelectorAll(".mob-quote-toggle-btn").forEach((btn) => {
    const formContainer = btn.closest(".mob-quote-form-wrap")?.querySelector(".mob-quote-form-container");
    if (!formContainer) return;

    btn.addEventListener("click", function () {
      const isCollapsed = formContainer.classList.toggle("mob-quote-collapsed");

      // text + aria
      btn.textContent = isCollapsed ? "Click to view Quote Request Form" : "Hide Form";
      btn.setAttribute("aria-expanded", String(!isCollapsed));

      // On expand: scroll DOWN only until the toggle sits at HEADER_OFFSET
      if (!isCollapsed) {
        requestAnimationFrame(() => {
          const targetTop = btn.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

          // Clamp to document bottom
          const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
          const clamped = Math.min(targetTop, maxTop);

          // Only move if we'd scroll down
          if (clamped > window.scrollY + 1) {
            window.scrollTo({ top: clamped, behavior: "smooth" });
          }
        });
      }
    });
  });
});



document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".mob-quote-showmore-row").forEach((row) => {
    const btn = row.querySelector(".mob-quote-toggle-btn");
    const table = row.closest("table");
    const hiddenRows = table?.querySelectorAll(".mob-quote-extra-row");

    if (btn && hiddenRows.length > 0) {
      btn.addEventListener("click", function () {
        const isHidden = hiddenRows[0].classList.contains("mob-quote-hidden");

        hiddenRows.forEach((r) =>
          r.classList.toggle("mob-quote-hidden")
        );

        btn.textContent = isHidden
          ? "Hide Extra Pay Scenarios"
          : "Show More Pay Scenarios";
      });
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const HEADER_OFFSET = 165; // fixed header height

  document.querySelectorAll(".mob-quote-expenses-wrapper").forEach((wrapper) => {
    const btn = wrapper.querySelector(".mob-quote-expenses-btn");
    const container = wrapper.querySelector(".mob-quote-expenses-container");

    if (btn && container) {
      btn.addEventListener("click", function () {
        const isCollapsed = container.classList.toggle("mob-quote-collapsed");

        // text + aria
        btn.textContent = isCollapsed ? "Show Aircraft Expenses" : "Hide Expense Details";
        btn.setAttribute("aria-expanded", String(!isCollapsed));

        // On expand: scroll DOWN only until the button sits at HEADER_OFFSET
        if (!isCollapsed) {
          requestAnimationFrame(() => {
            const targetTop = btn.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

            // clamp to document bottom
            const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            const clamped = Math.min(targetTop, maxTop);

            if (clamped > window.scrollY + 1) {
              window.scrollTo({ top: clamped, behavior: "smooth" });
            }
          });
        }
      });
    }
  });
});


document.addEventListener("DOMContentLoaded", function () {
  const HEADER_OFFSET = 165; // fixed header height

  document.querySelectorAll(".mob-quote-admin-wrapper").forEach((wrapper) => {
    const btn = wrapper.querySelector(".mob-quote-admin-btn");
    const container = wrapper.querySelector(".mob-quote-admin-fee-content");
    if (!btn || !container) return;

    btn.addEventListener("click", function () {
      const isCollapsed = container.classList.toggle("mob-quote-collapsed");

      // text + aria
      btn.textContent = isCollapsed
        ? "Show Flight Dispatch Details"
        : "Hide Flight Dispatch Details";
      btn.setAttribute("aria-expanded", String(!isCollapsed));

      // On expand: scroll DOWN only until the button sits at HEADER_OFFSET
      if (!isCollapsed) {
        requestAnimationFrame(() => {
          const targetTop = btn.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

          // clamp to document bottom
          const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
          const clamped = Math.min(targetTop, maxTop);

          if (clamped > window.scrollY + 1) {
            window.scrollTo({ top: clamped, behavior: "smooth" });
          }
        });
      }
    });
  });
});


document.addEventListener("DOMContentLoaded", function () {
  if (window.matchMedia("(max-width: 1400px)").matches) { // mobile breakpoint
    document.querySelectorAll(".desk-pilot-dir-tooltip-parent").forEach(function (parent) {
      const tooltip = parent.querySelector(".desk-pilot-dir-tooltip-box");
      if (!tooltip) return;

      parent.addEventListener("click", function (e) {
        e.stopPropagation(); // prevent clicks bubbling out
        tooltip.style.display = (tooltip.style.display === "block") ? "none" : "block";
      });
    });

    // Hide tooltips if user taps elsewhere
    document.addEventListener("click", function () {
      document.querySelectorAll(".desk-pilot-dir-tooltip-box").forEach(function (box) {
        box.style.display = "none";
      });
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Scope: ONLY the reqfaq accordions
  const groups = document.querySelectorAll(".join-accordion-group-reqfaq");
  if (!groups.length) return;

  groups.forEach((group) => {
    const toggles = group.querySelectorAll(".join-accordion-toggle-reqfaq");

    toggles.forEach((btn) => {
      if (btn.dataset.wired === "true") return; // avoid double-binding
      btn.dataset.wired = "true";

      // Find the associated panel:
      // 1) aria-controls target, else 2) next sibling .join-accordion-panel-reqfaq
      let panel = null;
      const controlsId = btn.getAttribute("aria-controls");
      if (controlsId) {
        try {
          panel = group.querySelector("#" + CSS.escape(controlsId));
        } catch {
          panel = null;
        }
      }
      if (!panel) {
        const next = btn.nextElementSibling;
        if (next && next.classList.contains("join-accordion-panel-reqfaq")) panel = next;
      }
      if (!panel) return;

      // Normalize initial state from aria-expanded
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", expanded ? "true" : "false");
      if ("hidden" in panel) panel.hidden = !expanded;
      else panel.style.display = expanded ? "block" : "none";

      btn.addEventListener("click", (e) => {
        e.stopPropagation();

        const isOpen = btn.getAttribute("aria-expanded") === "true";

        // If this one is open, close ONLY this one and exit.
        if (isOpen) {
          btn.setAttribute("aria-expanded", "false");
          if ("hidden" in panel) panel.hidden = true;
          else panel.style.display = "none";
          return; // do not touch the others
        }

        // Otherwise you're opening this one — close any other open reqfaq accordions in this group.
        group.querySelectorAll('.join-accordion-toggle-reqfaq[aria-expanded="true"]').forEach((openBtn) => {
          if (openBtn === btn) return;
          openBtn.setAttribute("aria-expanded", "false");
          const otherId = openBtn.getAttribute("aria-controls");
          let otherPanel = null;
          if (otherId) {
            try {
              otherPanel = group.querySelector("#" + CSS.escape(otherId));
            } catch {
              otherPanel = null;
            }
          }
          if (!otherPanel) {
            const ns = openBtn.nextElementSibling;
            if (ns && ns.classList.contains("join-accordion-panel-reqfaq")) otherPanel = ns;
          }
          if (otherPanel) {
            if ("hidden" in otherPanel) otherPanel.hidden = true;
            else otherPanel.style.display = "none";
          }
        });

        // Open the clicked one
        btn.setAttribute("aria-expanded", "true");
        if ("hidden" in panel) panel.hidden = false;
        else panel.style.display = "block";
      });
    });
  });
});

// Mobile pay scenarios toggle (table rows)
const HEADER_OFFSET = 165;

document.querySelectorAll('.mob-quote-pay-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const controlRow = btn.closest('tr');
    const table = controlRow ? controlRow.closest('table') : null;
    if (!table) return;

    // All extra rows in this table, excluding the row with the button
    const targets = Array.from(
      table.querySelectorAll('tr.mob-quote-extra-row')
    ).filter((tr) => tr !== controlRow);

    if (!targets.length) {
      console.warn('mob-quote-pay-btn: no .mob-quote-extra-row targets found in this table');
      return;
    }

    // Determine next state: open if all (or any) are currently hidden
    const anyVisible = targets.some((tr) => getComputedStyle(tr).display !== 'none');
    const open = !anyVisible;

    // Toggle visibility with correct table display
    targets.forEach((tr) => {
      tr.style.display = open ? 'table-row' : 'none';
    });

    // Button state/text
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Hide Pay Scenarios' : 'Show More Pay Scenarios';

    // On expand: scroll DOWN to place the button at HEADER_OFFSET from top
    if (open) {
      requestAnimationFrame(() => {
        const targetTop = btn.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const clamped = Math.min(targetTop, maxTop);
        if (clamped > window.scrollY + 1) {
          window.scrollTo({ top: clamped, behavior: 'smooth' });
        }
      });
    }
  });
});

// Tooltips for .mob-past-deliv-tooltip
document.addEventListener('DOMContentLoaded', () => {
  const triggers = Array.from(document.querySelectorAll('.mob-past-deliv-tooltip'));
  let openEl = null;

  function closeCurrent() {
    if (!openEl) return;
    openEl.classList.remove('show-tooltip');
    openEl.setAttribute('aria-expanded', 'false');
    openEl = null;
  }

  triggers.forEach(el => {
    // a11y + focusability
    el.setAttribute('tabindex', el.tabIndex >= 0 ? el.tabIndex : '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-haspopup', 'true');
    el.setAttribute('aria-expanded', 'false');

    const toggle = (evt) => {
      evt.stopPropagation();
      if (openEl === el) {
        closeCurrent();
      } else {
        closeCurrent();
        el.classList.add('show-tooltip');
        el.setAttribute('aria-expanded', 'true');
        openEl = el;
      }
    };

    el.addEventListener('click', toggle);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(e);
      }
    });
  });

  // Close behaviors
  document.addEventListener('click', closeCurrent);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCurrent(); });
  window.addEventListener('scroll', closeCurrent, { passive: true });
  window.addEventListener('resize', closeCurrent);
});



document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("mobileMenu");
  const hamburger = document.getElementById("hamburger-icon"); // header button
  if (!menu || !hamburger) return;

  // Ensure an internal close button exists (overlay ✕)
  let closeBtn = document.getElementById("mobileMenuClose");
  if (!closeBtn) {
    closeBtn = document.createElement("button");
    closeBtn.id = "mobileMenuClose";
    closeBtn.className = "mobile-menu-close";
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close menu");
    closeBtn.textContent = "✕";
    menu.prepend(closeBtn);
  }

  const html = document.documentElement;
  let lockY = 0;
  const burgerSrc = hamburger.getAttribute("src"); // remember the burger icon

  function freezePage() {
    lockY = window.scrollY || document.documentElement.scrollTop || 0;
    html.classList.add("menu-open");
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }
  function unfreezePage() {
    html.classList.remove("menu-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, lockY);
  }

  function openMenu() {
    if (menu.classList.contains("show")) return;
    menu.classList.add("show");
    hamburger.setAttribute("aria-expanded", "true");
    freezePage();
  }
  function closeMenu() {
    if (!menu.classList.contains("show")) return;
    menu.classList.remove("show");
    hamburger.setAttribute("aria-expanded", "false");
    // restore header icon if some other code changed it
    if (burgerSrc) hamburger.setAttribute("src", burgerSrc);
    unfreezePage();
  }
  function toggleMenu() {
    if (menu.classList.contains("show")) closeMenu();
    else openMenu();
  }

  // Wire both controls:
  hamburger.addEventListener("click", toggleMenu); // header button opens OR closes
  closeBtn.addEventListener("click", closeMenu);   // overlay ✕ closes

  // Close when a menu link is tapped
  menu.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) closeMenu();
  }, true);

  // Safety: don’t leave page locked if app backgrounds
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") closeMenu();
  });
});
