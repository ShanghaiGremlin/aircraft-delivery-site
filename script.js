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
// === SERVICES SLIDESHOW (fade + preload next) ===
const desktopSlides = document.querySelectorAll("#services-slideshow .services-slide");
let desktopIndex = 0;
let desktopCycles = 0;
const desktopMaxCycles = 3;
let desktopInterval;
let desktopPaused = false;

function showDesktopSlide(index) {
  desktopSlides.forEach((slide, i) => {
    slide.classList.toggle("is-active", i === index);
  });
}

/* Preload & decode the next slide’s image so it’s ready to fade in */
function preloadNextDesktopImage(nextIndex) {
  const nextSlide = desktopSlides[nextIndex];
  if (!nextSlide) return;

  const img = nextSlide.querySelector("img");
  if (!img) return;

  try {
    // Nudge the browser to fetch & decode now
    img.loading = "eager";
    if ("fetchPriority" in img) img.fetchPriority = "high";
    if (img.decode) {
      img.decode().catch(() => {}); // ignore decode errors; browser will still render
    }
  } catch (e) {
    // safe to ignore
  }
}

function scheduleNextDesktopSlide() {
  if (desktopPaused) return;

  const delay = (desktopIndex === 1) ? 15000 : 5000; // keep your longer dwell on slide 2
  const nextIndex = (desktopIndex + 1) % desktopSlides.length;

  // Warm the next image during the wait window
  preloadNextDesktopImage(nextIndex);

  desktopInterval = setTimeout(() => {
    desktopIndex = nextIndex;
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

// boot
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

  const slideshowContainer = document.getElementById("services-slideshow");
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



// ORPHAN??
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

  // Stop any auto-play CSS animation at load; JS will trigger later
phoneIcon.style.animationName = "none";

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
// Delay first wiggle by 3s, then keep 8s cadence for 3 total runs
setTimeout(() => {
  if (!document.body.contains(phoneIcon)) return;

  restartWiggle();   // ~3s after load
  wiggleCount++;

  const timer = setInterval(() => {
    if (!document.body.contains(phoneIcon) || wiggleCount >= maxCycles) {
      clearInterval(timer);
      return;
    }
    restartWiggle(); // ~11s, ~19s
    wiggleCount++;
  }, intervalMs);
}, 3000);
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



//MOB ABOUT MODAL ZOOM
document.addEventListener("DOMContentLoaded", function () {
  const modalOverlay = document.getElementById("mob-about-zoom-overlay");
  const modalImg     = document.getElementById("mob-about-zoom-img");
  const modalCaption = document.getElementById("mob-about-zoom-caption");

  // If this page has no modal skeleton, bail out silently.
  if (!modalOverlay || !modalImg || !modalCaption) return;

  // Open on thumbnail click (uses srcset candidate if present)
  document.querySelectorAll(".mob-about-thumb").forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      modalImg.src = thumb.currentSrc || thumb.src;
      modalCaption.textContent =
        (thumb.nextElementSibling?.textContent?.trim()) ||
        thumb.getAttribute("alt") ||
        "";
      modalOverlay.style.display = "flex";
    });
  });

  // Close when clicking the dim background
  modalOverlay.addEventListener("click", function (e) {
    if (e.target === e.currentTarget) {
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
        //console.log("⏹️ Mobile slider stopped after 1 full cycle");
      }
    }
  }, 10000);
}


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

// DESK-HEADER SCRIPT — SAFE ES5 BUILD (01–00 policy; grow-only; singleton; timeout; dedupe)
(function () {
  if (window.__ADS_DESK_HEADER_INIT__) return;
  window.__ADS_DESK_HEADER_INIT__ = true;

  document.addEventListener('DOMContentLoaded', function () {
    var DESK_MIN = 1401;
    var mql = window.matchMedia('(min-width: ' + DESK_MIN + 'px)');
    var loaded = false;

    // Read deploy/version for cache-busting
    function getAdsVer() {
      var m = document.querySelector('meta[name="ads-ver"]');
      return (m && m.content) ? m.content : '';
    }

    // fetch timeout utility (ES5 safe)
    function fetchWithTimeout(url, ms) {
      var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
      var signal = controller ? controller.signal : undefined;
      var timeoutId = setTimeout(function () {
        try { if (controller && typeof controller.abort === 'function') controller.abort(); } catch (e) {}
      }, ms);
      var opts = signal ? { signal: signal } : {};
      return fetch(url, opts).then(function (res) {
        clearTimeout(timeoutId);
        return res;
      }, function (err) {
        clearTimeout(timeoutId);
        throw err;
      });
    }

    function haveMountedHeader() {
      return !!document.querySelector('[data-ads-desk-header]');
    }

    // Ensure only one injected header exists
    function dedupeHeaders() {
      var nodes = document.querySelectorAll('[data-ads-desk-header]');
      if (nodes.length > 1) {
        for (var i = 1; i < nodes.length; i++) {
          var n = nodes[i];
          if (n && n.parentNode) n.parentNode.removeChild(n);
        }
      }
    }

    function insertHeader(html) {
      var target = document.getElementById('desk-header-placeholder');

      if (target) {
        target.insertAdjacentHTML('afterend', html);
        var root = target.nextElementSibling;
        if (root && root.setAttribute) root.setAttribute('data-ads-desk-header', '');
        if (target.remove) { target.remove(); } else if (target.parentNode) { target.parentNode.removeChild(target); }
      } else {
        document.body.insertAdjacentHTML('afterbegin', html);
        var first = document.body.firstElementChild;
        if (first && first.setAttribute) first.setAttribute('data-ads-desk-header', '');
      }

      dedupeHeaders();

      // Flag on <html> for CSS/diagnostics
      try {
        var htmlEl = document.documentElement;
        if (htmlEl && !htmlEl.classList.contains('has-desk-header')) {
          htmlEl.classList.add('has-desk-header');
        }
      } catch (e) {}

      // Expose header height to CSS var --desk-header-h
      try {
        var headerEl = document.querySelector('[data-ads-desk-header]');
        var htmlEl2 = document.documentElement;
        function applyHeaderHeight() {
          if (!headerEl || !htmlEl2) return;
          var h = headerEl.offsetHeight || 0;
          htmlEl2.style.setProperty('--desk-header-h', h + 'px');
        }
        applyHeaderHeight();
        if (typeof ResizeObserver !== 'undefined') {
          var ro = new ResizeObserver(function () { applyHeaderHeight(); });
          ro.observe(headerEl);
        } else {
          window.addEventListener('resize', applyHeaderHeight);
        }
      } catch (e2) {}
    }

    function mountHeader() {
      if (loaded || haveMountedHeader() || !mql.matches) return;
      loaded = true; // lock before fetch to avoid races

      var ver = getAdsVer();
      var headerUrl = '/desk-header.html' + (ver ? ver : '');

      fetchWithTimeout(headerUrl, 4000)
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then(function (html) { insertHeader(html); })
        .catch(function (err) {
          loaded = false; // allow retry later if it truly failed
          try { console.warn('desk-header load skipped:', (err && err.message) ? err.message : err); } catch (e) {}
        });
    }

    // Grow-only model; unmount disabled
    /*
    function unmountHeader() {
      var node = document.querySelector('[data-ads-desk-header]');
      if (node && node.parentNode) node.parentNode.removeChild(node);
      loaded = false;
    }
    */

    function syncToViewport() {
      if (mql.matches) {
        mountHeader();
      } else {
        // grow-only; CSS guardrail hides on mobile widths
        // unmountHeader();
      }
    }

    syncToViewport();

    function handleChange(e) {
      if (e.matches) mountHeader(); // only when crossing up into desktop
    }
    if (mql.addEventListener) { mql.addEventListener('change', handleChange); }
    else if (mql.addListener) { mql.addListener(handleChange); } // legacy Safari
  });
})();







// SERVICES-MOB-TOOLTIP 
document.addEventListener('DOMContentLoaded', () => {
  const parents = Array.from(document.querySelectorAll('.mob-tooltip-parent'));
  if (!parents.length) return;

  let open = null;

  function openTip(p) {
    if (open && open !== p) closeTip(open);
    p.classList.add('active');
    p.setAttribute('aria-expanded', 'true');
    open = p;

    // Keep the box within the viewport width
    const box = p.querySelector('.mob-tooltip-box');
    if (!box) return;
    box.style.maxWidth = Math.min(window.innerWidth - 32, 240) + 'px';
  }

  function closeTip(p) {
    p.classList.remove('active');
    p.setAttribute('aria-expanded', 'false');
    if (open === p) open = null;
  }

  parents.forEach(p => {
    // Accessibility & mobile ergonomics
    p.setAttribute('role', 'button');
    p.setAttribute('tabindex', '0');
    p.setAttribute('aria-haspopup', 'true');
    p.setAttribute('aria-expanded', 'false');

    p.addEventListener('click', (e) => {
      e.stopPropagation();
      if (p.classList.contains('active')) closeTip(p);
      else openTip(p);
    });

    p.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        p.click();
      }
    });
  });

  // Close when tapping anywhere else, or on resize/scroll
  document.addEventListener('click', () => { if (open) closeTip(open); });
  window.addEventListener('resize', () => { if (open) closeTip(open); });
  // capture-phase scroll so any scrolling ancestor will close it
  window.addEventListener('scroll', () => { if (open) closeTip(open); }, true);
});


// TESTIMONIALS BOX FLASHY
document.addEventListener('DOMContentLoaded', () => {
  const runFlash = () => {
    const hash = decodeURIComponent(location.hash || '').replace('#','');
    if (!hash) return;
    const el = document.getElementById(hash);
    if (!el) return;

    // Remove from any previously highlighted node
    document.querySelectorAll('.anchor-flash').forEach(n => n.classList.remove('anchor-flash'));

    // Restartable animation trick
    void el.offsetWidth; // force reflow so the animation can replay
    el.classList.add('anchor-flash');

    // Clean up after it finishes so it can be triggered again later
    el.addEventListener('animationend', () => {
      el.classList.remove('anchor-flash');
    }, { once: true });
  };

  // Initial load with #hash (cross-page navigation)
  runFlash();

  // In-page jumps or subsequent navigations
  window.addEventListener('hashchange', runFlash, { passive: true });
});

// TESTIMONIALS FREEZE BUTTONS
document.addEventListener('DOMContentLoaded', () => {
  // Only affects pages that actually include the bar
  const bar = document.querySelector('.mob-testim-freeze');
  if (!bar) return;

  const setBarHeight = () => {
    const h = Math.ceil(bar.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--mob-testim-freeze-h', h + 'px');
  };

  // Initial measure
  setBarHeight();

  // Recompute if fonts load later (text wrap can change height)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setBarHeight).catch(() => {});
  }

  // Recompute on resize / orientation changes
  window.addEventListener('resize', setBarHeight, { passive: true });
  window.addEventListener('orientationchange', setBarHeight);

  // Recompute if the bar’s size changes (e.g., button text wraps)
  const ro = new ResizeObserver(setBarHeight);
  ro.observe(bar);
});



// quote-top-badge shimmer: run at 5s, 13s, 21s post-load
document.addEventListener('DOMContentLoaded', () => {
  const badge =
    document.getElementById('quote-top-badge') ||
    document.querySelector('.quote-top-badge');
  if (!badge) return;

  // Respect reduced motion
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!motionOK) return;

  const SHIMMER_MS = 900;                   // keep in sync with CSS
  const STARTS = [5000, 13000, 21000];      // ms after load

  const runShimmer = () => {
    if (!document.body.contains(badge)) return;
    // retriggerable animation: remove → reflow → add
    badge.classList.remove('is-shimmering');
    void badge.offsetWidth;                 // force reflow
    badge.classList.add('is-shimmering');

    // cleanup after the pass so it can be retriggered
    setTimeout(() => {
      badge.classList.remove('is-shimmering');
    }, SHIMMER_MS + 30);
  };

  // Schedule the three passes
STARTS.forEach(delay => setTimeout(runShimmer, delay));
});



/* /quote accordions — delegated CAPTURE-phase so other listeners can't block it */
(function () {
  window.ADS = window.ADS || {};
  if (window.ADS._quoteAccordionCapture) return;
  window.ADS._quoteAccordionCapture = true;

  document.addEventListener('click', function (e) {
    var btn = e.target.closest(
      '.quote-accordion-toggle, .quote-accordion [aria-controls], .desk-quote-accordion [aria-controls]'
    );
    if (!btn || btn.closest('.join-page')) return;

    var panelId = btn.getAttribute('aria-controls');
    var panel = panelId ? document.getElementById(panelId) : btn.nextElementSibling;
    if (!panel) return;

    e.preventDefault();

    var nowOpen = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(nowOpen));

    // Reveal/hide regardless of CSS method
    panel.hidden = !nowOpen;
    panel.classList.toggle('is-open', nowOpen);

    if (nowOpen) {
      requestAnimationFrame(function () {
        var headerOffset = 165; // your fixed header height
        var rect = btn.getBoundingClientRect();
        var targetTop = rect.top + window.scrollY - headerOffset;
        var maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        var clamped = Math.min(targetTop, maxTop);
        if (clamped > window.scrollY + 1) {
          window.scrollTo({ top: clamped, behavior: 'smooth' });
        }
      });
    }
  }, { capture: true });
})();






/* /quote — mobile un-hider (mobile-only, single install, capture-phase) */
(function () {
  window.ADS = window.ADS || {};
  if (window.ADS._quoteMobHider) return;
  window.ADS._quoteMobHider = true;

  document.addEventListener('click', function (e) {
    // Only act on phone widths
    if (!window.matchMedia('(max-width: 1000px)').matches) return;

    var btn = e.target.closest('.quote-mob-toggle-btn[aria-controls]');
    if (!btn) return;

    var id = btn.getAttribute('aria-controls');
    var panel = id && document.getElementById(id);
    if (!panel) return;

    e.preventDefault();

    // flip open/closed
    var nowOpen = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(nowOpen));

    // show/hide content (CSS uses .is-open); keep [hidden] in sync
    panel.classList.toggle('is-open', nowOpen);
    if ('hidden' in panel) panel.hidden = !nowOpen;

    // flip the button label
    if (!btn.dataset.closedLabel) {
      btn.dataset.closedLabel = (btn.getAttribute('data-label-closed') || btn.textContent || '').trim();
    }
    var closed = btn.dataset.closedLabel;
    var open = (btn.getAttribute('data-label-open') || '').trim();
    if (!open) open = 'Hide ' + closed.replace(/^\s*(Hide|Show)\s*/i, '').trim();

    btn.textContent = nowOpen ? open : closed;
  }, { capture: true });
})();


/* /join-pilot-roster — desktop accordions (unified, capture-phase) */
(function () {
  window.ADS = window.ADS || {};
  if (window.ADS._joinAccordsUnified) return;
  window.ADS._joinAccordsUnified = true;

  document.addEventListener('click', function (e) {
    // Desktop only
    if (!window.matchMedia('(min-width: 1401px)').matches) return;

    // Only act inside the join page
    var root = e.target.closest('.join-page');
    if (!root) return;

    // 1) Prefer buttons that declare a target via aria-controls
    var btn = e.target.closest('.join-accordion-toggle-reqfaq[aria-controls], .join-accordion-toggle[aria-controls]');
    // 2) Fallback: plain .join-accordion-toggle with no aria-controls
    if (!btn) btn = e.target.closest('.join-accordion-toggle');
    if (!btn || !root.contains(btn)) return;

    e.preventDefault();

    // Find the panel
    var panel = null;
    var id = btn.getAttribute('aria-controls');
    if (id) panel = document.getElementById(id);

    // Index-map fallback for plain toggles
    if (!panel) {
      var toggles = Array.prototype.slice.call(root.querySelectorAll('.join-accordion-toggle'));
      var panels  = Array.prototype.slice.call(root.querySelectorAll('.join-accordion-panel'));
      var i = toggles.indexOf(btn);
      if (i > -1 && panels[i]) panel = panels[i];
    }

// Wrapper-aware fallback: panel is the sibling after .join-wayaligner
if (!panel) {
  var wrap = btn.closest('.join-wayaligner');
  if (wrap && wrap.nextElementSibling && root.contains(wrap.nextElementSibling)) {
    panel = wrap.nextElementSibling;
  }
}
// Final fallback: immediate sibling of the button’s parent
if (!panel && btn.parentElement && btn.parentElement.nextElementSibling && root.contains(btn.parentElement.nextElementSibling)) {
  panel = btn.parentElement.nextElementSibling;
}


    if (!panel) return;

    // Toggle state
    var nowOpen = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(nowOpen));

    // Show/hide regardless of CSS method
    panel.classList.toggle('is-open', nowOpen);
    if ('hidden' in panel) panel.hidden = !nowOpen;

    // If CSS still keeps it hidden, use inline fallback
    if (nowOpen && getComputedStyle(panel).display === 'none') {
      panel.style.display = 'block';
    } else if (!nowOpen) {
      panel.style.removeProperty('display');
    }
  }, { capture: true });
})();





/* /join-pilot-roster — mobile accordions (wrapper-aware, capture-phase) */
(function () {
  window.ADS = window.ADS || {};
  if (window.ADS._joinMobileAccords) return;
  window.ADS._joinMobileAccords = true;

  document.addEventListener('click', function (e) {
    if (!window.matchMedia('(max-width: 1000px)').matches) return;

    var root = e.target.closest('.join-page');
    if (!root) return;

    // top “join accordion toggle” buttons
    var btn = e.target.closest('.join-accordion-toggle');
    if (!btn || !root.contains(btn)) return;

    e.preventDefault();

    // Prefer the sibling after the .join-wayaligner wrapper
    var panel = null;
    var wrap = btn.closest('.join-wayaligner');
    if (wrap && wrap.nextElementSibling && root.contains(wrap.nextElementSibling)) {
      panel = wrap.nextElementSibling;
    }

    // Fallback: parent’s next sibling
    if (!panel && btn.parentElement && btn.parentElement.nextElementSibling && root.contains(btn.parentElement.nextElementSibling)) {
      panel = btn.parentElement.nextElementSibling;
    }

    // Final fallback: nth toggle ↔ nth .join-accordion-panel
    if (!panel) {
      var toggles = Array.prototype.slice.call(root.querySelectorAll('.join-accordion-toggle'));
      var panels  = Array.prototype.slice.call(root.querySelectorAll('.join-accordion-panel'));
      var i = toggles.indexOf(btn);
      if (i > -1) panel = panels[i] || null;
    }
    if (!panel) return;

    var nowOpen = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(nowOpen));

    panel.classList.toggle('is-open', nowOpen);
    if ('hidden' in panel) panel.hidden = !nowOpen;
  }, { capture: true });
})();

//ACCESIBLE STATUS FOR FORM
document.addEventListener('DOMContentLoaded', function () {
  if (location.pathname.replace(/\/+$/,'') !== '/quote') return;

  var form = document.querySelector('form[action*="formspree.io"]');
  if (!form) return;

  var statusEl = document.getElementById('quote-status');
  var submitBtn = form.querySelector('[type="submit"]');

  function say(msg) {
    if (!statusEl) return;
    // Clear first so screen readers re-announce even identical text
    statusEl.textContent = '';
    // Minimal delay to ensure DOM mutation is detected by AT
    setTimeout(function(){ statusEl.textContent = msg; }, 10);
  }

  // Announce when the user triggers submit
  form.addEventListener('submit', function () {
    form.setAttribute('aria-busy', 'true');
    say('Sending your request…');
  }, { capture: true });

  // If you navigate away on success, AT won’t read further.
  // But if the page stays (e.g., validation error), announce ready state again.
  window.addEventListener('pageshow', function () {
    form.removeAttribute('aria-busy');
    say('Ready.');
  });
});
