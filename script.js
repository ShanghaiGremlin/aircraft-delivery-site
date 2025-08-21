// --- diagnostics buffer (place at TOP of script.js) ---
(() => {
  const MAX = 50;
  const buf = [];
  const orig = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };

  function record(level, args) {
    try {
      const msg = args.map(a =>
        typeof a === "string" ? a :
        a instanceof Error ? (a.stack || a.message) :
        JSON.stringify(a)
      ).join(" ");
      buf.push(`[${level}] ${msg}`);
      if (buf.length > MAX) buf.shift();
    } catch {
      buf.push(`[${level}] [unserializable]`);
      if (buf.length > MAX) buf.shift();
    }
  }

  ["log","info","warn","error"].forEach(level => {
    console[level] = (...args) => {
      record(level, args);
      orig[level].apply(console, args);
    };
  });

  window.__diagLogs = buf;
  window.__lastError = null;

  window.addEventListener("error", (e) => {
    window.__lastError = `${e.message} at ${e.filename}:${e.lineno}:${e.colno}`;
  });

  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason && (e.reason.stack || e.reason.message || String(e.reason));
    window.__lastError = `unhandledrejection: ${reason}`;
  });
})();





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


// phone-wiggle.js
document.addEventListener("DOMContentLoaded", () => {
  const phoneIcon = document.getElementById("phoneIcon");
  if (!phoneIcon) return;

  // Optional: fix mojibake if it ever sneaks in (does NOT change good content)
  if (phoneIcon.textContent && phoneIcon.textContent.includes("ðŸ“ž")) {
    phoneIcon.textContent = "\u{1F4DE}"; // 📞
  }

  // Respect user's motion preference
  const motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let wiggleCount = 0;
  const maxCycles = 3;
  const intervalMs = 8000;

  const restartWiggle = () => {
    if (!motionOK) return;
    // Only toggle the name; keep your duration/easing/iteration from CSS
    phoneIcon.style.animationName = "none";
    // Force reflow to reset the animation
    void phoneIcon.offsetWidth;
    phoneIcon.style.animationName = "";
  };

  // Kick the cycle every 8s, up to 3 times (like your original)
  const timer = setInterval(() => {
    if (!document.body.contains(phoneIcon) || wiggleCount >= maxCycles) {
      clearInterval(timer);
      return;
    }
    restartWiggle();
    wiggleCount++;
  }, intervalMs);
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
  document.querySelectorAll('.quote-accordion-toggle').forEach((toggle) => {
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



document.addEventListener('DOMContentLoaded', () => {
  const HEADER_OFFSET = 165;

  const btn = document.getElementById('quote-mob-form-toggle-btn');
  const section = document.getElementById('quote-form-section'); 

  if (!btn || !section) return;

  btn.addEventListener('click', () => {
    const isOpen = section.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(isOpen));
    btn.textContent = isOpen ? 'Hide Form' : 'Click to view Quote Request Form';

    if (isOpen) {
      requestAnimationFrame(() => {
        const top = section.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        window.scrollTo({ top: Math.min(top, maxTop), behavior: 'smooth' });
      });
    }
  });
});



document.addEventListener('DOMContentLoaded', () => {
  const HEADER_OFFSET = 165;

const btn = document.getElementById('quote-mob-extra-row-btn');
  const sec = document.getElementById('quote-mob-extra-rows');
  if (!btn || !sec) return;

  btn.addEventListener('click', () => {
    const isOpen = sec.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(isOpen));
    btn.textContent = isOpen ? 'Hide Pay Scenarios' : 'Show More Pay Scenarios';

    if (isOpen) {
      requestAnimationFrame(() => {
        const top = sec.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        window.scrollTo({ top: Math.min(top, maxTop), behavior: 'smooth' });
      });
    }
  });
});




document.addEventListener('DOMContentLoaded', () => {
  const HEADER_OFFSET = 165;

  const btn = document.getElementById('quote-mob-expenses-btn');
  const container = document.getElementById('quote-mob-expenses-container');
  if (!btn || !container) return;

  btn.addEventListener('click', () => {
    const isOpen = container.classList.toggle('is-open'); // <-- matches CSS
    btn.setAttribute('aria-expanded', String(isOpen));
    btn.textContent = isOpen ? 'Hide Expense Details' : 'Show Aircraft Expenses';

    if (isOpen) {
      requestAnimationFrame(() => {
        const top = btn.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        window.scrollTo({ top: Math.min(top, maxTop), behavior: 'smooth' });
      });
    }
  });
});



document.addEventListener('DOMContentLoaded', () => {
  const HEADER_OFFSET = 165;

  const btn = document.getElementById('quote-mob-dispatch-btn');
  const sec = document.getElementById('quote-mob-dispatch-content');
  if (!btn || !sec) return;

  btn.addEventListener('click', () => {
    const isOpen = sec.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(isOpen));
    btn.textContent = isOpen ? 'Hide Dispatch Services' : 'Show Dispatch Services';

    if (isOpen) {
      requestAnimationFrame(() => {
        const top = btn.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        window.scrollTo({ top: Math.min(top, maxTop), behavior: 'smooth' });
      });
    }
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

  //function openMenu() {
    //if (menu.classList.contains("show")) return;
    //menu.classList.add("show");
    //hamburger.setAttribute("aria-expanded", "true");
    //freezePage();
 // }
function closeMenu() {
  if (!menu.classList.contains("show")) return;
  menu.classList.remove("show");
  if (hamburger) hamburger.setAttribute("aria-expanded", "false");
  if (typeof burgerSrc !== "undefined" && burgerSrc) {
    hamburger.setAttribute("src", burgerSrc);
  }
  // no body style manipulation here; scroll lock is handled elsewhere
}


  //function toggleMenu() {
    //if (menu.classList.contains("show")) closeMenu();
    //else openMenu();
  //}

  // Wire both controls:
 // hamburger.addEventListener("click", toggleMenu); 
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

document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("mobileMenu");
  if (!menu) return;

  let savedScrollY = 0;

  const syncScrollLock = () => {
    const isOpen = menu.classList.contains("show");
    if (isOpen) {
      // remember where the user was when the menu opened
      savedScrollY = window.scrollY || window.pageYOffset;
      document.documentElement.classList.add("menu-open");
    } else {
      document.documentElement.classList.remove("menu-open");
      // put the user back exactly where they were
      window.scrollTo(0, savedScrollY);
    }
  };

  // Initial sync
  syncScrollLock();

  // Keep in sync whenever the menu's classes change
  const obs = new MutationObserver(syncScrollLock);
  obs.observe(menu, { attributes: true, attributeFilter: ["class"] });
});

// update ARIA //
document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("mobileMenu");
  const hbImg = document.getElementById("hamburger-icon");
  if (!menu || !hbImg) return;

  // Use the real activator if one exists; else fall back to the image
  const activator = hbImg.closest("button, [role='button'], a[href]") || hbImg;

  // Remove any stale label on the img to avoid confusion when querying
  if (hbImg !== activator) {
    hbImg.removeAttribute("aria-label");
  }

  const updateAria = () => {
    const isOpen = menu.classList.contains("show");
    activator.setAttribute("aria-expanded", isOpen ? "true" : "false");
    activator.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  };

  updateAria();
  new MutationObserver(updateAria).observe(menu, { attributes: true, attributeFilter: ["class"] });
});






document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("mobileMenu");
  const hamburger = document.getElementById("hamburger-icon");
  if (!menu || !hamburger) return;

  if (!window.__adsEscBound) {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("show")) {
        if (typeof hamburger.click === "function") {
          hamburger.click();       // reuse your existing close path
        } else {
          menu.classList.remove("show"); // fallback; observer will sync aria/scroll-lock
        }
      }
    });
    window.__adsEscBound = true;
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("mobileMenu");
  const hamburger = document.getElementById("hamburger-icon");
  if (!menu || !hamburger) return;

  const returnFocusIfClosed = () => {
    if (menu.classList.contains("show")) return;

    // Prefer a naturally focusable ancestor (button/anchor) if the icon itself isn't
    let focusEl = hamburger.closest('button, a[href], [tabindex]') || hamburger;

    // If not naturally focusable, give it a temporary tabindex
    const isNaturallyFocusable = focusEl.matches(
      'button, a[href], input, select, textarea, [tabindex]'
    );
    let addedTabindex = false;
    if (!isNaturallyFocusable) {
      focusEl.setAttribute("tabindex", "-1");
      addedTabindex = true;
    }

    // Return focus without scrolling the page
    try {
      focusEl.focus({ preventScroll: true });
    } catch (e) {
      // Fallback for older browsers
      focusEl.focus();
    }

    // Clean up the temporary tabindex after focus leaves
    if (addedTabindex) {
      const cleanup = () => {
        focusEl.removeAttribute("tabindex");
        focusEl.removeEventListener("blur", cleanup);
      };
      focusEl.addEventListener("blur", cleanup, { once: true });
    }
  };

  // Observe menu open/close
  new MutationObserver(returnFocusIfClosed).observe(menu, {
    attributes: true,
    attributeFilter: ["class"],
  });

  // Also run once at load in case it's already closed
  returnFocusIfClosed();
});



document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("mobileMenu");
  const hb = document.getElementById("hamburger-icon");
  if (!menu || !hb) return;

  // 1) If the hamburger isn't inside a real button/anchor, give it keyboard activation
  const buttonAncestor = hb.closest("button, a[href]");
  if (!buttonAncestor) {
    hb.setAttribute("role", "button");
    if (!hb.hasAttribute("tabindex")) hb.setAttribute("tabindex", "0");
    if (!hb.hasAttribute("aria-label")) hb.setAttribute("aria-label", "Menu");

    hb.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();       // prevent page scroll on Space
        hb.click();               // reuse your existing click handler
      }
    });
  }

  // 2) Focus return: when menu closes, move focus to the actual activator
  const getActivator = () => buttonAncestor || hb;

  const returnFocusIfClosed = () => {
    if (menu.classList.contains("show")) return;
    const target = getActivator();

    // Ensure target is focusable, then focus without scrolling the page
    if (!target.matches("button, a[href], input, select, textarea, [tabindex]")) {
      target.setAttribute("tabindex", "-1");
      target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
    }
    try { target.focus({ preventScroll: true }); } catch { target.focus(); }
  };

  new MutationObserver(returnFocusIfClosed).observe(menu, {
    attributes: true,
    attributeFilter: ["class"],
  });
});


document.addEventListener("DOMContentLoaded", () => {
  if (window.__adsFocusOnOpenBound) return; // guard against duplicates
  window.__adsFocusOnOpenBound = true;

  const menu = document.getElementById("mobileMenu");
  if (!menu) return;

  const focusIntoMenu = () => {
    // First focusable thing inside the menu
// Prefer the first real nav link; exclude obvious Close controls
const target =
  // common containers for nav links
  menu.querySelector('nav a[href], .menu-links a[href], .menu a[href], ul li a[href]') ||
  // any link that isn't labeled like a close button
  menu.querySelector('a[href]:not([aria-label*="close" i]):not([data-close]):not([data-role="close"])') ||
  // fall back to any non-close button
  menu.querySelector('button:not([aria-label*="close" i]):not([data-close]):not([data-role="close"])') ||
  // final fallback: the menu itself
  menu;


    let addedTabindex = false;
    if (target === menu && !menu.hasAttribute("tabindex")) {
      menu.setAttribute("tabindex", "-1");
      addedTabindex = true;
    }

    try {
      target.focus({ preventScroll: true });
    } catch {
      target.focus();
    }

    if (addedTabindex) {
      const cleanup = () => {
        menu.removeAttribute("tabindex");
        menu.removeEventListener("blur", cleanup);
      };
      menu.addEventListener("blur", cleanup, { once: true });
    }
  };

  const onClassChange = () => {
    if (menu.classList.contains("show")) {
      // Defer so layout/paint finishes before we move focus
      setTimeout(focusIntoMenu, 0);
    }
  };

  new MutationObserver(onClassChange).observe(menu, {
    attributes: true,
    attributeFilter: ["class"],
  });
});


document.addEventListener("DOMContentLoaded", () => {
  if (window.__adsAriaControlsBound) return;
  window.__adsAriaControlsBound = true;

  const hb = document.getElementById("hamburger-icon");
  if (hb && !hb.hasAttribute("aria-controls")) {
    hb.setAttribute("aria-controls", "mobileMenu");
  }
});


// make the menu a clear navigation landmark for assistive tech.//
document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("mobileMenu");
  if (!menu) return;

  // If it's not a <nav>, give it a navigation role.
  if (menu.tagName !== "NAV" && !menu.hasAttribute("role")) {
    menu.setAttribute("role", "navigation");
  }
  // Give it a readable label if it doesn't have one yet.
  if (!menu.hasAttribute("aria-label") && !menu.hasAttribute("aria-labelledby")) {
    menu.setAttribute("aria-label", "Primary");
  }
});

//ensure both X buttons announce clearly as “Close menu”.//
document.addEventListener("DOMContentLoaded", () => {
  const overlayClose = document.querySelector('#mobileMenu [data-close], #mobileMenu .close, #mobileMenu .overlay-x, #mobileMenu [aria-label*="close" i]');
  const headerClose  = document.querySelector('.header .close, .header [data-close], .header [aria-label*="close" i]');

  if (overlayClose && !overlayClose.hasAttribute('aria-label')) {
    overlayClose.setAttribute('aria-label', 'Close menu');
  }
  if (headerClose && !headerClose.hasAttribute('aria-label')) {
    headerClose.setAttribute('aria-label', 'Close menu');
  }
});


// history handling for Back on Android //
document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("mobileMenu");
  if (!menu) return;

  let originalHash = location.hash;   // includes leading '#', or '' if none
  let armed = false;                  // whether we added a menu state

  // Sync history when the menu opens/closes
  const syncHistory = () => {
    const open = menu.classList.contains("show");

    if (open && !armed) {
      // Remember the page's prior hash and add a "menu-open" entry
      originalHash = location.hash;
      history.pushState({ adsMenu: true }, "", location.pathname + location.search + "#menu-open");
      armed = true;
    } else if (!open && armed) {
      // Restore the original hash without adding another entry
      history.replaceState({}, "", location.pathname + location.search + originalHash);
      armed = false;
    }
  };

  // Close the menu if Back is pressed while it's open
  window.addEventListener("popstate", () => {
    if (menu.classList.contains("show")) {
      menu.classList.remove("show"); // observers you already have will tidy ARIA/scroll
    }
  });

  // Observe menu class changes (whoever toggles it)
  new MutationObserver(syncHistory).observe(menu, { attributes: true, attributeFilter: ["class"] });
  syncHistory(); // initialize
});


//Keep hamburger icon in sync with menu state //
document.addEventListener("DOMContentLoaded", () => {
  if (window.__adsIconSyncBound) return;
  window.__adsIconSyncBound = true;

  const menu = document.getElementById("mobileMenu");
  const hb = document.getElementById("hamburger-icon");
  if (!menu || !hb) return;

  // Original burger icon (fallback to current src)
  const burgerSrc = hb.getAttribute("data-burger-src") || hb.getAttribute("src");

  // Optional open-state icon; set data-x-src=".../close.png" in HTML if you have one
  let xSrc = hb.getAttribute("data-x-src") || hb.dataset.xSrc || "";

  // If menu is open right now and the icon isn't the burger, learn the X src once
  if (menu.classList.contains("show") && hb.getAttribute("src") !== burgerSrc && !xSrc) {
    xSrc = hb.getAttribute("src");
  }

  const syncIcon = () => {
    const isOpen = menu.classList.contains("show");
    if (isOpen) {
      if (xSrc) hb.setAttribute("src", xSrc);
    } else {
      hb.setAttribute("src", burgerSrc);
    }
  };

  // Initial + on changes
  syncIcon();
  new MutationObserver(syncIcon).observe(menu, { attributes: true, attributeFilter: ["class"] });
});

//Don’t leave focus on the trigger at load (only show rings after keyboard)//

document.addEventListener("DOMContentLoaded", () => {
  const img = document.getElementById("hamburger-icon");
  if (!img) return;

  // Prefer the real activator (button/anchor) if it exists
  const activator = img.closest("button, [role='button'], a[href]") || img;

  // Ensure the activator has aria-controls so our CSS targets it
  if (!activator.hasAttribute("aria-controls")) {
    activator.setAttribute("aria-controls", "mobileMenu");
  }

  // Track input modality
  let usedKeyboard = false;
  document.addEventListener("keydown", () => {
    usedKeyboard = true;
    document.documentElement.classList.add("user-keyboard");
  }, true);
  document.addEventListener("pointerdown", () => {
    document.documentElement.classList.remove("user-keyboard");
  }, true);

  // If focus landed on the activator at load (e.g., programmatic focus), and no keyboard yet, blur it.
  if (document.activeElement === activator && !usedKeyboard) {
    if (typeof activator.blur === "function") activator.blur();
  }
});

//put focus on the hamburger and stop the default skip.//
document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("mobileMenu");
  const hbImg = document.getElementById("hamburger-icon");
  if (!menu || !hbImg) return;

  const activator = hbImg.closest("button, [role='button'], a[href]") || hbImg;

  let firstTabHandled = false;

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key !== "Tab" || firstTabHandled) return;

      const active = document.activeElement;
      const noRealFocus =
        active === document.body ||
        active === document.documentElement ||
        !active ||
        active === null;

      // Only “prime” if the menu is closed and there wasn’t a meaningful focus yet
      if (!menu.classList.contains("show") && noRealFocus) {
        e.preventDefault();
        // ensure the activator is focusable, then focus it
        if (!activator.matches("button, a[href], input, select, textarea, [tabindex]")) {
          activator.setAttribute("tabindex", "-1");
          activator.addEventListener("blur", () => activator.removeAttribute("tabindex"), {
            once: true,
          });
        }
        try {
          activator.focus({ preventScroll: true });
        } catch {
          activator.focus();
        }
      }

      firstTabHandled = true; // only intercept once
    },
    true // capture so it runs before page handlers
  );
});

//Android-only outline for .mob-index-headline//
document.addEventListener("DOMContentLoaded", () => {
  if (/Android/i.test(navigator.userAgent)) {
    document.documentElement.classList.add("android");
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('quote-form'); // updated id
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
  if (!submitBtn) return;

  let submitted = false;
  const REENABLE_TIMEOUT_MS = 12000; // safety net for offline/error

  form.addEventListener('submit', (e) => {
    if (submitted) {
      e.preventDefault(); // block double-submit
      return;
    }
    submitted = true;

    // Disable & show progress
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.setAttribute('data-original-text', submitBtn.textContent || submitBtn.value || '');
    if (submitBtn.tagName === 'BUTTON') {
      submitBtn.textContent = 'Submitting…';
    } else {
      submitBtn.value = 'Submitting…';
    }

    // Safety re-enable if we don't navigate away (offline / error)
    setTimeout(() => {
      if (document.getElementById('quote-form')) { // still on the page
        submitted = false;
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        const original = submitBtn.getAttribute('data-original-text') || 'Submit';
        if (submitBtn.tagName === 'BUTTON') {
          submitBtn.textContent = original;
        } else {
          submitBtn.value = original;
        }
      }
    }, REENABLE_TIMEOUT_MS);
  });
});

  // Honeypot spam guard for quote forms
document.addEventListener("DOMContentLoaded", () => {

  const forms = [
    document.getElementById("quote-form")
  ].filter(Boolean);

  forms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      const hp = form.querySelector('input[name="_gotcha"], input[name="company"]');
      if (hp && hp.value.trim() !== "") {
        // Bot likely filled the honeypot — block submission
        e.preventDefault();
        e.stopPropagation();
        // Optional: log quietly for your debugging
        console.warn("Honeypot triggered; form submission blocked.");
      }
    });
  });
});


document.addEventListener("DOMContentLoaded", () => {
  // Email & phone validation for quote forms
  const FORMS = [
    document.getElementById("form-desktop"),

  ].filter(Boolean);

  // Very permissive phone: digits, spaces, (), +, -, and dots
  const PHONE_OK = /^[\d\s()+\-\.]{7,}$/;

  FORMS.forEach((form) => {
    const email = form.querySelector("#email");
    const emailErr = form.querySelector("#email-error");
    const phone = form.querySelector("#phone");
    const phoneErr = form.querySelector("#phone-error");

    function showError(inputEl, errEl, message) {
      if (!inputEl || !errEl) return;
      errEl.textContent = message;
      errEl.hidden = false;
      inputEl.classList.add("quote-invalid");
      inputEl.setAttribute("aria-invalid", "true");
    }

    function clearError(inputEl, errEl) {
      if (!inputEl || !errEl) return;
      errEl.hidden = true;
      inputEl.classList.remove("quote-invalid");
      inputEl.removeAttribute("aria-invalid");
    }

    // Email: required & must be valid per HTML5
    function validateEmail() {
      if (!email) return true;
      if (email.validity.valueMissing) {
        showError(email, emailErr, "Email is required.");
        return false;
      }
      if (email.validity.typeMismatch) {
        showError(email, emailErr, "Please enter a valid email (e.g., name@example.com).");
        return false;
      }
      clearError(email, emailErr);
      return true;
    }

    // Phone: optional, but if filled must match permissive pattern
    function validatePhone() {
      if (!phone) return true;
      const v = phone.value.trim();
      if (v === "") {
        clearError(phone, phoneErr);
        return true;
      }
      if (!PHONE_OK.test(v)) {
        showError(phone, phoneErr, "Please enter a valid phone number (digits, spaces, () + - allowed).");
        return false;
      }
      clearError(phone, phoneErr);
      return true;
    }

    // Validate on blur & input
    if (email) {
      email.addEventListener("blur", validateEmail);
      email.addEventListener("input", () => {
        if (!emailErr.hidden) validateEmail();
      });
    }
    if (phone) {
      phone.addEventListener("blur", validatePhone);
      phone.addEventListener("input", () => {
        if (!phoneErr.hidden) validatePhone();
      });
    }

    // Gate on submit
    form.addEventListener("submit", (e) => {
      const okEmail = validateEmail();
      const okPhone = validatePhone();
      if (!okEmail || !okPhone) {
        e.preventDefault();
        e.stopPropagation();
        // Focus first invalid field
        if (!okEmail && email) email.focus();
        else if (!okPhone && phone) phone.focus();
      }
    });
  });
});


// SPAM GUARD FOR MINIMUM TIME TO SUBMIT FORM 
document.addEventListener("DOMContentLoaded", () => {
  // Apply to any quote forms (unified page uses quote-* IDs)
  const forms = Array.from(document.querySelectorAll('form[id^="quote-form"]'));
  if (!forms.length) return;

  const MIN_MS = 3000; // require at least 3s from load to submit

  forms.forEach((form) => {
    // Create a timestamp field (JS-only; not visible)
    const ts = document.createElement("input");
    ts.type = "hidden";
    ts.name = "quote_ts";
    ts.value = String(Date.now());
    form.appendChild(ts);

    // Double-submit guard
    let submitting = false;

    form.addEventListener("submit", (e) => {
      // If already submitting, block repeats
      if (submitting) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Time-to-submit check
      const start = Number(ts.value) || 0;
      const elapsed = Date.now() - start;
      if (elapsed < MIN_MS) {
        e.preventDefault();
        e.stopPropagation();

        // Gentle inline note (once)
        let note = form.querySelector(".quote-submit-note");
        if (!note) {
          note = document.createElement("p");
          note.className = "quote-submit-note";
          note.style.margin = "8px 0 0";
          note.style.fontSize = "0.95rem";
          note.style.lineHeight = "1.3";
          note.style.color = "#b00020";
          // Insert near the submit button if possible
          const submit = form.querySelector('button[type="submit"], input[type="submit"]');
          (submit?.parentElement || form).appendChild(note);
        }
        note.textContent = "Please wait a moment and try again.";
        return;
      }

      // Lock after first valid submit
      submitting = true;
      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submitBtn) {
        submitBtn.setAttribute("aria-busy", "true");
        submitBtn.disabled = true;
      }
    });
  });
});

// SUBSTITUTING FOR INLINE ONCLICK
document.addEventListener("DOMContentLoaded", () => {
  const retryBtn = document.getElementById("error-retry-btn");
  if (retryBtn) {
    retryBtn.addEventListener("click", () => location.reload());
  }
});

// SUBSTITUTING FOR INLINE ONCLICK
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".join-mob-copy-button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (typeof window.copyJoinTemplate === "function") {
        window.copyJoinTemplate(e);
      } else {
        console.warn("copyJoinTemplate() is not defined.");
      }
    });
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const report = document.getElementById("reportLink");
  if (!report) return;

  report.addEventListener("click", async (e) => {
    e.preventDefault();

    // Basics
    const basics = [
      `URL: ${location.href}`,
      `Referrer: ${document.referrer || "(none)"}`,
      `Time: ${new Date().toISOString()}`,
      `User-Agent: ${navigator.userAgent}`,
      `Viewport: ${window.innerWidth}x${window.innerHeight}`,
      `Language: ${navigator.language || "(unknown)"}`
    ];

    // From the diagnostics buffer you added earlier
    const lastErr = window.__lastError || "(none)";
    const logs = (window.__diagLogs || []).slice(-30); // last 30 lines

    const payload = [
      "Please describe what you were doing:",
      "",
      "--- Basics ---",
      ...basics,
      "",
      `Last error: ${lastErr}`,
      "",
      "--- Recent console ---",
      ...logs
    ].join("\n");

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(payload);
      } else {
        // lightweight fallback copy
        const ta = document.createElement("textarea");
        ta.value = payload;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      const old = report.textContent;
      report.textContent = "Details copied—paste into your email";
      setTimeout(() => (report.textContent = old), 4000);
    } catch {
      const subject = encodeURIComponent("Site error report");
      const body = encodeURIComponent(payload);
      location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  });
});

// HANDLES TARGET_BLANK
document.addEventListener("DOMContentLoaded", () => {
  const here = location.hostname;

  document.querySelectorAll('a[target="_blank"]').forEach((a) => {
    try {
      const url = new URL(a.href, location.href);
      const isExternal = url.hostname && url.hostname !== here;

      // Always add noopener (internal or external)
      const rel = (a.getAttribute("rel") || "").split(/\s+/).filter(Boolean);
      if (!rel.includes("noopener")) rel.push("noopener");

      // Add noreferrer only for external links
      if (isExternal && !rel.includes("noreferrer")) rel.push("noreferrer");

      a.setAttribute("rel", rel.join(" "));
    } catch {
      // If URL can't be parsed, still add noopener as a safe default
      const rel = (a.getAttribute("rel") || "").split(/\s+/).filter(Boolean);
      if (!rel.includes("noopener")) rel.push("noopener");
      a.setAttribute("rel", rel.join(" "));
    }
  });
});

// APPENDS AN ADVISORY TO EVERY TARGET-BLANK 
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[target="_blank"]').forEach((a) => {
    if (a.dataset.newtabAnnotated === "1") return; // guard
    a.dataset.newtabAnnotated = "1";

    const cue = document.createElement("span");
    cue.className = "sr-only";
    cue.textContent = " (opens in a new tab)";
    a.appendChild(cue);
  });
});


document.addEventListener("DOMContentLoaded", () => {
  // Guard: don't run twice
  if (window.__autoLabelBound) return;
  window.__autoLabelBound = true;

  const hasVisibleText = (el) => ((el.textContent || "").trim().length > 0);
  const hasAriaName = (el) => el.hasAttribute("aria-label") || el.hasAttribute("aria-labelledby");
  const hasImgAlt = (el) => {
    const img = el.querySelector("img[alt]");
    return !!(img && img.getAttribute("alt") && img.getAttribute("alt").trim());
  };
  const svgTitle = (el) => {
    const t = el.querySelector("svg > title");
    return (t && t.textContent && t.textContent.trim()) || "";
  };

  // Heuristic labeling rules, ordered from most specific → generic fallbacks
  function inferLabel(el) {
    const isLink = el.tagName === "A";
    const href = isLink ? (el.getAttribute("href") || "") : "";
    const cls = el.className || "";

    // Known controls by selector patterns (edit/extend if you add more)
    if (el.id === "hamburger-icon" || /(?:^|\s)(hamburger|menu-toggle)(?:\s|$)/i.test(cls)) return "Open menu";
    if (/(?:^|\s)(modal-close|drawer-close|close|icon-close|x-close)(?:\s|$)/i.test(cls)) return "Close";
    if (/(?:^|\s)(slider-prev|carousel-prev|prev|arrow-left)(?:\s|$)/i.test(cls)) return "Previous slide";
    if (/(?:^|\s)(slider-next|carousel-next|next|arrow-right)(?:\s|$)/i.test(cls)) return "Next slide";

    // Links with clear intent
    if (href.startsWith("tel:")) return "Call us";
    if (href.startsWith("mailto:")) return "Email us";

    // Full-size image links (common on /past-deliveries)
    if (/\.(?:avif|webp|png|jpe?g|gif)(?:[?#]|$)/i.test(href)) return "View full-size image";

    // Use <svg><title> if provided
    const title = svgTitle(el);
    if (title) return title;

    // No safe inference → skip (don’t risk a wrong label)
    return "";
  }

  function hidePureIcon(el) {
    // Hide decorative icons from a11y tree
    el.querySelectorAll("svg, img").forEach((icon) => {
      // If the image has alt text, keep it; otherwise hide it
      if (icon.tagName === "IMG") {
        const alt = icon.getAttribute("alt");
        if (alt && alt.trim()) return;
      }
      if (!icon.hasAttribute("aria-hidden")) icon.setAttribute("aria-hidden", "true");
    });
  }

  const candidates = Array.from(document.querySelectorAll('a, button, [role="button"]'));
  candidates.forEach((el) => {
    // Skip if it already has a name via ARIA or visible text or image alt
    if (hasAriaName(el) || hasVisibleText(el) || hasImgAlt(el)) return;

    const label = inferLabel(el);
    if (label) {
      el.setAttribute("aria-label", label);
      hidePureIcon(el);
      el.dataset.autoLabeled = "1";
    }
  });
});


//Helps screen readers and improves Lighthouse a11y (“Links have a discernible name / current page indicated”).
document.addEventListener("DOMContentLoaded", () => {
  const here = (location.pathname.replace(/\/+$/, "") || "/").toLowerCase();

  document.querySelectorAll("nav a[href]").forEach((a) => {
    try {
      const url = new URL(a.getAttribute("href"), location.origin);
      const path = (url.pathname.replace(/\/+$/, "") || "/").toLowerCase();
      if (path === here) a.setAttribute("aria-current", "page");
    } catch {/* ignore bad/malformed hrefs */}
  });
});

// INCREASE LOADIDNG SPEED OF WEB VITALS
document.addEventListener("DOMContentLoaded", () => {
  // Load only on the homepage
  const onHome = location.pathname === "/" || location.pathname.toLowerCase() === "/index";
  if (!onHome || window.__webVitalsLoaded) return;
  window.__webVitalsLoaded = true;

  function loadWV() {
    const s = document.createElement("script");
    s.src = "/assets/js/wv.js"; 
    s.defer = true;
    s.onload = () => {
      if (window.webVitals) {
        // webVitals.getCLS(sendToAnalytics);
        // webVitals.getLCP(sendToAnalytics);
        // webVitals.getINP(sendToAnalytics);
      }
    };
    document.head.appendChild(s);
  }

  if (document.readyState === "complete") {
    (window.requestIdleCallback || ((cb) => setTimeout(cb, 150)))(loadWV);
  } else {
    window.addEventListener("load", () => {
      (window.requestIdleCallback || ((cb) => setTimeout(cb, 150)))(loadWV);
    }, { once: true });
  }
});


// DESK-HEADER SCRIPT
(function () {
  var loaded = false;
  var mql = window.matchMedia('(min-width: 1401px)');

  function loadDeskHeader() {
    if (loaded || !mql.matches) return;
    fetch('/desk-header.html')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (html) {
        var target = document.getElementById('desk-header-placeholder');
        if (!target) return;
        target.outerHTML = html;
        loaded = true;
      })
      .catch(function (err) {
        console.error('desk-header load failed:', err);
      });
  }

  loadDeskHeader();

  if (mql.addEventListener) {
    mql.addEventListener('change', function (e) { if (e.matches) loadDeskHeader(); });
  } else {
    mql.addListener(function (e) { if (e.matches) loadDeskHeader(); });
  }
})();
