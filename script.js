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

// --- Expenses toggle: hardwired, capture-phase, independent of other code ---
(() => {
  const BTN_ID = 'quote-mob-expenses-btn';
  const PANEL_ID = 'quote-mob-expenses-container';

  // Prove we actually wired (check for this line in console after reload)
  console.log('[expenses] capture handler wired');

  const resolve = () => {
    const btn = document.getElementById(BTN_ID);
    const panel = document.getElementById(PANEL_ID);
    return btn && panel ? { btn, panel } : null;
  };

  // Initialize labels/state once DOM is ready enough
  document.addEventListener('DOMContentLoaded', () => {
    const refs = resolve();
    if (!refs) return;
    const { btn, panel } = refs;
    const OPEN_LABEL  = btn.dataset.labelOpen   || 'Hide Aircraft Expenses';
    const CLOSE_LABEL = btn.dataset.labelClosed || 'Show Aircraft Expenses';
    const startsOpen = panel.classList.contains('is-open') && !panel.hasAttribute('hidden');
    btn.setAttribute('aria-expanded', String(startsOpen));
    btn.textContent = startsOpen ? OPEN_LABEL : CLOSE_LABEL;
  });

  // Capture-phase delegate so nothing can swallow or reverse the click
  document.addEventListener('click', (e) => {
    const hit = e.target.closest?.(`#${BTN_ID}`);
    if (!hit) return;

    // Own the event
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();

    const refs = resolve();
    if (!refs) return;
    const { btn, panel } = refs;

    const OPEN_LABEL  = btn.dataset.labelOpen   || 'Hide Aircraft Expenses';
    const CLOSE_LABEL = btn.dataset.labelClosed || 'Show Aircraft Expenses';

    // Toggle open/closed
    const next = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(next));
    btn.textContent = next ? OPEN_LABEL : CLOSE_LABEL;

    panel.classList.toggle('is-open', next);
    panel.toggleAttribute('hidden', !next);

    // If some CSS still forces it hidden, override just for open state
    if (next && getComputedStyle(panel).display === 'none') {
      panel.style.setProperty('display', 'block', 'important');
    }
    if (!next) {
      panel.style.removeProperty('display');
    }
  }, true);
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






//MOB ABOUT MODAL ZOOM
// MOB ABOUT MODAL ZOOM
document.addEventListener("DOMContentLoaded", function () {
  const modalOverlay = document.getElementById("mob-about-zoom-overlay");
  const modalImg     = document.getElementById("mob-about-zoom-img");
  const modalCaption = document.getElementById("mob-about-zoom-caption");

  // If this page has no modal skeleton, bail out silently.
  if (!modalOverlay || !modalImg || !modalCaption) return;

  // NEW — panel, bg, close buttons, opener tracking
  const panel      = modalOverlay.querySelector(".mob-about-zoom-content") || modalOverlay; // NEW
  const overlayBg  = modalOverlay.querySelector(".mob-about-zoom-overlay-bg");              // NEW
  const closeBtns  = modalOverlay.querySelectorAll("[data-modal-close], .mob-about-zoom-close"); // NEW
  let lastFocus    = null;                                                                  // NEW

  // NEW — helpers for focus trap
  const isVisible = el => !!el && el.offsetParent !== null && getComputedStyle(el).visibility !== "hidden"; // NEW
  const getTabbables = (root) => {                                                         // NEW
    const SEL = [
      "a[href]","area[href]","button:not([disabled])","input:not([disabled])",
      "select:not([disabled])","textarea:not([disabled])","[tabindex]:not([tabindex='-1'])"
    ].join(",");
    return Array.from(root.querySelectorAll(SEL)).filter(isVisible);
  };

  // Open on thumbnail click (uses best available src)
  document.querySelectorAll(".mob-about-thumb, [data-modal-open='mob-about-zoom']").forEach(function (thumb) { // CHANGED
    // NEW — make triggers keyboardable
    if (!thumb.hasAttribute("role")) thumb.setAttribute("role", "button");               // NEW
    if (!thumb.hasAttribute("tabindex")) thumb.tabIndex = 0;                             // NEW

    const open = () => {                                                                  // NEW
      lastFocus = thumb;                                                                  // NEW

      // Prefer explicit zoom src, then currentSrc/src
      const fullSrc =
        thumb.getAttribute("data-zoom-src") ||
        thumb.getAttribute("data-full") ||
        thumb.currentSrc || thumb.src;                                                   // NEW

      // Prevent browser from selecting a tiny srcset for the zoom
      modalImg.removeAttribute("srcset");                                                // NEW
      modalImg.removeAttribute("sizes");                                                 // NEW
      modalImg.src = fullSrc;                                                            // CHANGED

      // Better caption discovery: nearest caption > data-caption > alt
      const nearbyCapEl =
        thumb.closest(".img-wrap")?.querySelector(".mob-about-img-caption") ||
        thumb.nextElementSibling;                                                        // NEW
      modalCaption.textContent =
        (nearbyCapEl?.textContent?.trim()) ||
        thumb.getAttribute("data-caption") ||
        thumb.getAttribute("alt") || "";                                                // CHANGED

      // Show overlay (keep your display toggle, add semantic + body lock)
      modalOverlay.style.display = "flex";                                               // (yours)
      modalOverlay.classList.add("is-open");                                             // NEW
      modalOverlay.removeAttribute("hidden");                                            // NEW
      document.body.classList.add("body--modal-open");                                   // NEW

      // Focus panel for screen readers / keyboard
      if (!panel.hasAttribute("tabindex")) panel.setAttribute("tabindex", "-1");         // NEW
      panel.focus();                                                                     // NEW
    };

    thumb.addEventListener("click", function (e) { e.preventDefault(); open(); });        // CHANGED
    // NEW — keyboard activation
    thumb.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });

  // NEW — unified close routine
  function closeOverlay() {                                                               // NEW
    modalOverlay.classList.remove("is-open");
    modalOverlay.setAttribute("hidden", "");
    modalOverlay.style.display = "none"; // keep original mechanism in sync
    document.body.classList.remove("body--modal-open");
    modalImg.removeAttribute("src");
    modalCaption.textContent = "";
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    lastFocus = null;
  }

  // Close when clicking the dim background (your original logic kept; routed to unified close)
  modalOverlay.addEventListener("click", function (e) {
    if (e.target === e.currentTarget) {
      closeOverlay();                                                                     // CHANGED
    }
  });

  // NEW — also close if clicking overlay inner bg or any explicit close control
  if (overlayBg) {
    overlayBg.addEventListener("click", function (e) { e.preventDefault(); closeOverlay(); }); // NEW
  }
  closeBtns.forEach(btn => btn.addEventListener("click", (e) => { e.preventDefault(); closeOverlay(); })); // NEW

  // NEW — Esc to close + focus trap
  document.addEventListener("keydown", function (e) {                                     // NEW
    // If overlay isn't open, ignore
    const open = !modalOverlay.hasAttribute("hidden") || modalOverlay.style.display === "flex";
    if (!open) return;

    if (e.key === "Escape") { e.preventDefault(); closeOverlay(); return; }

    if (e.key === "Tab") {
      const tabs = getTabbables(panel);
      if (tabs.length === 0) { e.preventDefault(); panel.focus(); return; }
      const first = tabs[0], last = tabs[tabs.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
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
  const BTN_ID = 'quote-mob-expenses-btn';
  const PANEL_ID = 'quote-mob-expenses-container';

  const btn = document.getElementById(BTN_ID);
  const panel = document.getElementById(PANEL_ID);
  if (!btn || !panel) return;

  const LABEL_OPEN   = btn.dataset.labelOpen   || 'Hide Aircraft Expenses';
  const LABEL_CLOSED = btn.dataset.labelClosed || 'Show Aircraft Expenses';

  // Ensure a known starting state
  const startsOpen = panel.classList.contains('is-open') && !panel.hasAttribute('hidden');
  btn.setAttribute('aria-expanded', String(startsOpen));
  btn.textContent = startsOpen ? LABEL_OPEN : LABEL_CLOSED;

  // Capture-phase, specific to this ID; prevents other listeners from reversing it
  document.addEventListener('click', function onCapture(e){
    const hit = e.target.closest(`#${BTN_ID}`);
    if (!hit) return;

    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();

    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    const next = !isOpen;

    // 1) Button state + label
    btn.setAttribute('aria-expanded', String(next));
    btn.textContent = next ? LABEL_OPEN : LABEL_CLOSED;

    // 2) Panel state — class AND [hidden] kept in sync
    panel.classList.toggle('is-open', next);
    panel.toggleAttribute('hidden', !next);

    // 3) Last-resort: defeat any lingering hide if present
    if (next && getComputedStyle(panel).display === 'none') {
      panel.style.setProperty('display', 'block', 'important');
    }
    if (!next) {
      panel.style.removeProperty('display');
    }
  }, true);
});







// --- Dispatch toggle: hardwired, capture-phase (mirrors Expenses) ---
(() => {
  const BTN_ID = 'quote-mob-dispatch-btn';
  const PANEL_ID = 'quote-mob-dispatch-content';

  console.log('[dispatch] capture handler wired');

  const resolve = () => {
    const btn = document.getElementById(BTN_ID);
    const panel = document.getElementById(PANEL_ID);
    return btn && panel ? { btn, panel } : null;
  };

  // Initialize labels/state on load
  document.addEventListener('DOMContentLoaded', () => {
    const refs = resolve();
    if (!refs) return;
    const { btn, panel } = refs;
    const OPEN_LABEL  = btn.dataset.labelOpen   || 'Hide Dispatch Details';
    const CLOSE_LABEL = btn.dataset.labelClosed || 'Show Dispatch Details';
    const startsOpen = panel.classList.contains('is-open') && !panel.hasAttribute('hidden');
    btn.setAttribute('aria-expanded', String(startsOpen));
    btn.textContent = startsOpen ? OPEN_LABEL : CLOSE_LABEL;
  });

  // Capture-phase delegate so no other handler cancels or reverses it
  document.addEventListener('click', (e) => {
    const hit = e.target.closest?.(`#${BTN_ID}`);
    if (!hit) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();

    const refs = resolve();
    if (!refs) return;
    const { btn, panel } = refs;

    const OPEN_LABEL  = btn.dataset.labelOpen   || 'Hide Dispatch Details';
    const CLOSE_LABEL = btn.dataset.labelClosed || 'Show Dispatch Details';

    const next = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(next));
    btn.textContent = next ? OPEN_LABEL : CLOSE_LABEL;

    panel.classList.toggle('is-open', next);
    panel.toggleAttribute('hidden', !next);

    // Last-resort CSS override if something still forces it hidden
    if (next && getComputedStyle(panel).display === 'none') {
      panel.style.setProperty('display', 'block', 'important');
    }
    if (!next) {
      panel.style.removeProperty('display');
    }
  }, true);
})();




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

// DESK-HEADER SCRIPT — ROBUST BUILD
// 01–00 policy (desktop ≥1401px); ES5-safe; singleton; late-start; versioned fetch;
// timeout; grow-only; dedupe; live height CSS var; robust aria-current; bfcache; observer; custom events.
(function () {
  if (window.__ADS_DESK_HEADER_INIT__) return;
  window.__ADS_DESK_HEADER_INIT__ = true;

  // ---------- config & state ----------
  var DESK_MIN = 1401; // 01–00: desktop min
  var mql = window.matchMedia('(min-width:' + DESK_MIN + 'px)');
  var loaded = false;  // prevents duplicate fetches

  // ---------- helpers ----------
  // Emit custom events with detail (document + window)
  function emit(name, detail) {
    try {
      var ev;
      if (typeof window.CustomEvent === 'function') {
        ev = new CustomEvent(name, { bubbles: true, cancelable: false, detail: detail });
      } else {
        ev = document.createEvent('CustomEvent');
        ev.initCustomEvent(name, true, false, detail);
      }
      document.dispatchEvent(ev);
      try { window.dispatchEvent(ev); } catch (_) {}
    } catch (_) {}
  }

  function getAdsVer() {
    var m = document.querySelector('meta[name="ads-ver"]');
    return (m && m.content) ? m.content : ''; // e.g., "?v=20250826-1623xx"
  }

  // Fetch with timeout (no Promise.finally; works w/o AbortController)
  function fetchWithTimeout(url, ms) {
    var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var signal = controller ? controller.signal : undefined;
    var tid = setTimeout(function () {
      try { if (controller && typeof controller.abort === 'function') controller.abort(); } catch (e) {}
    }, ms);
    var opts = signal ? { signal: signal } : {};
    return fetch(url, opts).then(function (res) {
      clearTimeout(tid);
      return res;
    }, function (err) {
      clearTimeout(tid);
      throw err;
    });
  }

  function haveHeader() {
    return !!document.querySelector('[data-ads-desk-header]');
  }

  function dedupeHeaders() {
    var nodes = document.querySelectorAll('[data-ads-desk-header]');
    if (nodes.length > 1) {
      for (var i = 1; i < nodes.length; i++) {
        var n = nodes[i];
        if (n && n.parentNode) n.parentNode.removeChild(n);
      }
    }
  }

  // Path normalizer for aria-current
  function normalizePath(p) {
    if (!p) p = '/';
    try { p = new URL(p, location.origin).pathname; } catch (e) {}
    p = p.split('#')[0].split('?')[0];
    p = p.toLowerCase();
    if (/^\/(?:index(?:\.html?|\/)?)?$/.test(p)) p = '/'; // treat index as root
    if (p.charAt(0) !== '/') p = '/' + p;
    if (p.length > 1 && p.slice(-1) === '/') p = p.slice(0, -1);
    return p;
  }
  function isHomeLink(href, norm, text) {
    if (norm === '/') return true;
    if (!href || href === '#' || href === './') return true;
    var h = String(href).toLowerCase();
    if (h === '/' || h === '/index' || h === '/index.html' || h === '/index.htm') return true;
    if (/^\/#/.test(h) || /^\#/.test(h)) return true; // "/#top" or "#top"
    if (text && /^home$/i.test(String(text).trim())) return true;
    return false;
  }
  function markActiveLink() {
    try {
      var headerRoot = document.querySelector('[data-ads-desk-header]');
      if (!headerRoot) return;

      var current = normalizePath(location.pathname);
      var links = headerRoot.querySelectorAll('a[href]');
      var matches = 0, firstLink = null, homeCand = null;

      for (var i = 0; i < links.length; i++) {
        var a = links[i];
        if (!firstLink) firstLink = a;

        var raw = a.getAttribute('href') || '';
        var linkPath;
        try { linkPath = new URL(raw, location.origin).pathname; } catch (e) { linkPath = raw; }
        var norm = normalizePath(linkPath);

        if (isHomeLink(raw, norm, a.textContent)) homeCand = homeCand || a;

        if (norm === current) {
          a.setAttribute('aria-current', 'page');
          matches++;
        } else {
          a.removeAttribute('aria-current');
        }
      }

      if (matches === 0 && current === '/') {
        if (homeCand) homeCand.setAttribute('aria-current', 'page');
        else if (firstLink) firstLink.setAttribute('aria-current', 'page');
      }
    } catch (e) {}
  }

  // ---------- core ----------
  function insertHeader(html) {
    var ph = document.getElementById('desk-header-placeholder');

    if (ph) {
      ph.insertAdjacentHTML('afterend', html);
      var root = ph.nextElementSibling;
      if (root && root.setAttribute) root.setAttribute('data-ads-desk-header', '');
      if (ph.remove) ph.remove(); else if (ph.parentNode) ph.parentNode.removeChild(ph);
    } else {
      document.body.insertAdjacentHTML('afterbegin', html);
      var first = document.body.firstElementChild;
      if (first && first.setAttribute) first.setAttribute('data-ads-desk-header', '');
    }

    // ensure single instance
    dedupeHeaders();

    // header element (after dedupe)
    var hdr = document.querySelector('[data-ads-desk-header]');

    // flag on <html> for CSS/diagnostics
    try {
      var htmlEl = document.documentElement;
      if (htmlEl && !htmlEl.classList.contains('has-desk-header')) {
        htmlEl.classList.add('has-desk-header');
      }
    } catch (e) {}

    // expose live height + broadcast height changes
    try {
      var htmlEl2 = document.documentElement;

      function applyHeaderHeight() {
        if (!hdr || !htmlEl2) return;
        const h = 155; // ← your fixed height
        htmlEl2.style.setProperty('--desk-header-h', h + 'px');
        emit('ads:desk-header:height', { height: h });
      }

      // initial measure
      applyHeaderHeight();

      // keep updated
      if (typeof ResizeObserver !== 'undefined') {
        var ro = new ResizeObserver(function () { applyHeaderHeight(); });
        if (hdr) ro.observe(hdr);
      } else {
        window.addEventListener('resize', applyHeaderHeight);
      }
    } catch (e2) {}

    // mark active nav link now that header exists
    markActiveLink();

    // fire the mounted event AFTER insertion + first paint (ensures non-0 height)
    try {
      if (hdr) {
        var sendMounted = function () {
          var hNow = hdr.getBoundingClientRect ? Math.round(hdr.getBoundingClientRect().height || 0) : (hdr.offsetHeight || 0);
          emit('ads:desk-header:mounted', { el: hdr, height: hNow });
        };
        if (window.requestAnimationFrame) { requestAnimationFrame(sendMounted); }
        else { setTimeout(sendMounted, 0); }
      }
    } catch (e4) {}
  }

  function mountHeader() {
    if (loaded || haveHeader() || !mql.matches) return;
    loaded = true; // lock before fetch to avoid races

    var ver = getAdsVer();                   // e.g., "?v=20250826-162301"
    var headerUrl = '/desk-header.html' + (ver ? ver : '');

    fetchWithTimeout(headerUrl, 4000).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    }).then(function (html) {
      insertHeader(html);
    }).catch(function (err) {
      loaded = false; // allow retry later if it truly failed
      try { console.warn('desk-header load skipped:', (err && err.message) ? err.message : err); } catch (e) {}
    });
  }

  function syncToViewport() {
    if (mql.matches) {
      mountHeader();
    } else {
      // grow-only; CSS guardrail hides on mobile. No unmount.
    }
  }

  function start() {
    // initial check + listener for crossing up into desktop
    syncToViewport();
    function handleChange(e) { if (e.matches) mountHeader(); }
    if (mql.addEventListener) { mql.addEventListener('change', handleChange); }
    else if (mql.addListener) { mql.addListener(handleChange); } // legacy Safari

    // bfcache restore + late runs to avoid timing issues
    window.addEventListener('pageshow', function () {
      markActiveLink();
      if (mql.matches && !haveHeader()) mountHeader();
    });
    setTimeout(markActiveLink, 0);
    setTimeout(markActiveLink, 120);

    try {
      var mo = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var rec = muts[i];
          if (rec.type === 'childList' && rec.addedNodes && rec.addedNodes.length) {
            markActiveLink();
            break;
          }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  // Run now if DOM is already loaded; otherwise wait for DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
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

document.addEventListener("DOMContentLoaded", () => {
  const burger = document.getElementById("hamburger-icon"); // this is your BUTTON
  const menu   = document.getElementById("mobileMenu");
  if (!burger || !menu) return;

  // Guard so we don't double-bind if this file runs twice
  if (window.__adsBurgerToggleBound) return;
  window.__adsBurgerToggleBound = true;

  burger.addEventListener("click", () => {
    const open = !menu.classList.contains("show");
    menu.classList.toggle("show", open);
    // optional (your ARIA observer also does this):
    burger.setAttribute("aria-expanded", String(open));
  });
});

//ARIA SYNC
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[aria-controls]');
    if (!btn) return;
    const id = btn.getAttribute('aria-controls');
    const panel = document.getElementById(id);
    if (!panel) return;

    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    panel.hidden = expanded; // show when expanded === false -> now true
  });
});



document.addEventListener('DOMContentLoaded', () => {
  if (window.__ADS_MENU_V2) return;
  window.__ADS_MENU_V2 = true;

  const body = document.body;
  let hamburger = document.getElementById('hamburger-icon');
  const menu = document.getElementById('mobileMenu');
  if (!hamburger || !menu) return;

  // wipe old listeners on the trigger by cloning it
  const clone = hamburger.cloneNode(true);
  hamburger.parentNode.replaceChild(clone, hamburger);
  hamburger = clone;

  // ensure an internal close button exists (idempotent)
  let closeBtn = menu.querySelector('#mobileMenuClose');
  if (!closeBtn) {
    closeBtn = document.createElement('button');
    closeBtn.id = 'mobileMenuClose';
    closeBtn.type = 'button';
    closeBtn.className = 'mobile-menu-close';
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.textContent = '✕';
    menu.prepend(closeBtn);
  }

  const getFocusables = () =>
    Array.from(menu.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter(el => el.offsetWidth + el.offsetHeight > 0);

  const firstFocusable = () => getFocusables()[0] || closeBtn;
  const isOpen = () => !menu.hidden || menu.classList.contains('show');

  const syncState = (open, silent = false) => {
    hamburger.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    menu.classList.toggle('show', open);        // legacy class support
    body.classList.toggle('no-scroll', open);   // CSS: .no-scroll { overflow: hidden; }

    if (silent) return; // don't move focus on init
    if (open) {
      setTimeout(() => firstFocusable()?.focus({ preventScroll: true }), 0);
    } else {
      hamburger.focus({ preventScroll: true });
    }
  };

  // toggle handlers
  hamburger.addEventListener('click', (e) => {
    e.preventDefault();
    syncState(!isOpen());
  });

  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (isOpen()) syncState(false);
  });

  // click on backdrop (empty wrapper area) closes
  menu.addEventListener('click', (e) => {
    if (e.target === menu && isOpen()) syncState(false);
  });

  // keyboard: ESC and basic focus trap
  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      syncState(false);
      return;
    }
    if (e.key === 'Tab') {
      const f = getFocusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // legacy watcher: if some old code toggles .show, keep ARIA in sync
  new MutationObserver(() => {
    const legacyOpen = menu.classList.contains('show');
    if (legacyOpen !== isOpen()) syncState(legacyOpen, true);
  }).observe(menu, { attributes: true, attributeFilter: ['class'] });

  // start closed without focusing the trigger
  syncState(false, true);
});

document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.getElementById('mobileMenu');
  if (!wrap) return;

  const scrub = () => {
    wrap.removeAttribute('role');
    wrap.removeAttribute('aria-label');
    wrap.removeAttribute('aria-labelledby');
  };

  scrub(); // clear now
  new MutationObserver((muts) => {
    for (const m of muts) {
      if (['role','aria-label','aria-labelledby'].includes(m.attributeName)) {
        // keep it off
        scrub();
      }
    }
  }).observe(wrap, { attributes: true, attributeFilter: ['role','aria-label','aria-labelledby'] });
});


document.addEventListener("DOMContentLoaded", () => {
  // ===========================
  // Helpers (shared)
  // ===========================
  const isVisible = el => !!el && el.offsetParent !== null && getComputedStyle(el).visibility !== "hidden";
  const getTabbables = root => {
    const SEL = [
      "a[href]","area[href]","button:not([disabled])","input:not([disabled])",
      "select:not([disabled])","textarea:not([disabled])","[tabindex]:not([tabindex='-1'])"
    ].join(",");
    return Array.from(root.querySelectorAll(SEL)).filter(isVisible);
  };
  const isOpen = (el) => {
    if (!el) return false;
    if (!el.hasAttribute("hidden")) return true;
    const disp = (el.style && el.style.display) || "";
    return disp && disp !== "none";
  };

  // Global active modal state for this block only
  let ACTIVE = { modal: null, panel: null, lastFocus: null };

  function onOpen(modal) {
    ACTIVE.modal = modal;
    ACTIVE.panel = modal.querySelector('[tabindex="-1"]') || modal;
    document.body.classList.add("body--modal-open");
    if (!ACTIVE.panel.hasAttribute("tabindex")) ACTIVE.panel.setAttribute("tabindex", "-1");
    ACTIVE.panel.focus({ preventScroll: false });
  }

  function onClose(modal) {
    document.body.classList.remove("body--modal-open");
    if (ACTIVE.lastFocus && document.contains(ACTIVE.lastFocus)) ACTIVE.lastFocus.focus();
    ACTIVE = { modal: null, panel: null, lastFocus: null };
  }

  // One keydown handler for both modals (focus trap + Esc)
  document.addEventListener("keydown", (e) => {
    const modal = ACTIVE.modal;
    if (!modal || !isOpen(modal)) return;

    if (e.key === "Escape") {
      e.preventDefault();
      // Prefer an explicit closer if present
      const btn = modal.querySelector("[data-modal-close], .close, .mob-past-deliv-close, .desk-past-deliv-close");
      if (btn) btn.click();
      else {
        modal.setAttribute("hidden", "");
        modal.style.display = "none";
      }
      return;
    }

    if (e.key === "Tab") {
      const panel = ACTIVE.panel || modal;
      const tabs = getTabbables(panel);
      if (!tabs.length) { e.preventDefault(); panel.focus(); return; }
      const first = tabs[0], last = tabs[tabs.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // ===========================
  // A) MOBILE past-deliveries modal (zoom with population)
  // ===========================
  (function setupMobPastDeliv() {
    const overlay = document.querySelector('[data-modal="mob-past-deliv"]') ||
                    document.getElementById("mob-past-deliv-modal");
    const zoomImg     = document.getElementById("mob-past-deliv-img");
    const zoomCaption = document.getElementById("mob-past-deliv-caption");
    if (!overlay || !zoomImg || !zoomCaption) return;

    const panel     = overlay.querySelector('[tabindex="-1"]') || overlay;
    const overlayBg = overlay.querySelector(".mob-past-deliv-overlay-bg");
    const closeBtns = overlay.querySelectorAll("[data-modal-close], .mob-past-deliv-close");

    function openFrom(trigger) {
      ACTIVE.lastFocus = trigger;

      // Choose best image source
      const fullSrc    = trigger.getAttribute("data-zoom-src") || trigger.getAttribute("data-full") || trigger.currentSrc || trigger.src;
      const fullSrcset = trigger.getAttribute("data-srcset") || "";

      zoomImg.removeAttribute("sizes");
      zoomImg.src = fullSrc || "";
      if (fullSrcset) zoomImg.srcset = fullSrcset; else zoomImg.removeAttribute("srcset");
      zoomImg.setAttribute("sizes", "100vw");

      // Caption: nearest caption → data-caption → alt → next sibling text
      const capEl = trigger.closest(".mob-past-deliv-zoom-inner")?.querySelector(".mob-past-deliv-caption")
                 || trigger.closest(".mob-past-deliv-img-wrap")?.querySelector(".mob-past-deliv-caption")
                 || trigger.nextElementSibling;
      zoomCaption.textContent = (capEl?.textContent?.trim()) || trigger.getAttribute("data-caption") || trigger.alt || "";

      // Show (compatible with your CSS)
      overlay.style.display = "flex";
      overlay.classList.add("is-open");
      overlay.removeAttribute("hidden");

      onOpen(overlay);
    }

    function closeMob() {
      overlay.classList.remove("is-open");
      overlay.setAttribute("hidden", "");
      overlay.style.display = "none";

      zoomImg.removeAttribute("src");
      zoomImg.removeAttribute("srcset");
      zoomCaption.textContent = "";

      onClose(overlay);
    }

    // Wire triggers (prefer hard-coded data attribute)
    const triggers = document.querySelectorAll('[data-modal-open="mob-past-deliv"], img.mob-past-deliv-img[data-full]');
    triggers.forEach((el) => {
      // Only add role/tabindex if the trigger is an IMG not inside a link
      if (el.tagName === "IMG" && !el.closest("a")) {
        if (!el.hasAttribute("role")) el.setAttribute("role", "button");
        if (!el.hasAttribute("tabindex")) el.tabIndex = 0;
      }
      el.addEventListener("click", (e) => { e.preventDefault(); openFrom(el); });
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openFrom(el); }
      });
    });

    // Click backdrop or explicit close controls
    overlay.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeMob();
    });
    if (overlayBg) overlayBg.addEventListener("click", (e) => { e.preventDefault(); closeMob(); });
    closeBtns.forEach(btn => btn.addEventListener("click", (e) => { e.preventDefault(); closeMob(); }));
  })();

  // ===========================
  // B) DESKTOP past-deliveries modal (enhancer only)
  // ===========================
  (function enhanceDeskPastDeliv() {
    const modal = document.querySelector('[data-modal="desk-past-deliv"]') ||
                  document.getElementById("desk-past-deliv-modal");
    if (!modal) return;

    // Ensure minimal ARIA/focus target
    if (!modal.hasAttribute("role")) modal.setAttribute("role", "dialog");
    if (!modal.hasAttribute("aria-modal")) modal.setAttribute("aria-modal", "true");
    const panel = modal.querySelector('[tabindex="-1"]') || modal;
    if (!panel.hasAttribute("tabindex")) panel.setAttribute("tabindex", "-1");

    // Track opener (any element explicitly marked to open desktop modal)
    document.addEventListener("click", (e) => {
      const opener = e.target.closest('[data-modal-open="desk-past-deliv"]');
      if (opener) ACTIVE.lastFocus = opener;
    }, true);

    // Close on backdrop/close buttons (non-invasive; runs alongside your existing logic)
    modal.addEventListener("click", (e) => {
      const hitClose = e.target.closest("[data-modal-close], .desk-past-deliv-close");
      if (hitClose || e.target === e.currentTarget) {
        onClose(modal);
      }
    });

    // Observe open/close (hidden/style/class) and apply side-effects
    const mo = new MutationObserver(() => {
      const openNow = isOpen(modal);
      if (openNow && ACTIVE.modal !== modal) onOpen(modal);
      if (!openNow && ACTIVE.modal === modal) onClose(modal);
    });
    mo.observe(modal, { attributes: true, attributeFilter: ["hidden", "style", "class"] });
  })();
});




// === Blog & Testimonial → DESKTOP past-deliveries modal (works with your markup) ===
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("desk-past-deliv-modal");
  const bigImg  = document.getElementById("desk-past-deliv-img");
  if (!overlay || !bigImg) return;

  // Prefer the content panel for focus
  const content  = overlay.querySelector(".desk-past-deliv-content") || overlay;
  const panel    = content; // focus target
  if (!panel.hasAttribute("tabindex")) panel.setAttribute("tabindex", "-1");

  // Caption: create one if it doesn't exist
  let capEl = document.getElementById("desk-past-deliv-caption");
  if (!capEl) {
    capEl = document.createElement("div");
    capEl.id = "desk-past-deliv-caption";
    capEl.className = "desk-past-deliv-caption";
    bigImg.after(capEl);
  }

  // ARIA defaults (no class changes)
  if (!overlay.hasAttribute("role")) overlay.setAttribute("role", "dialog");
  if (!overlay.hasAttribute("aria-modal")) overlay.setAttribute("aria-modal", "true");

  const closeX = document.getElementById("desk-past-deliv-close");
  const closeBtns = [closeX, ...overlay.querySelectorAll("[data-modal-close], .desk-past-deliv-close, .close")].filter(Boolean);

  let lastFocus = null;

  function resolveCaption(trigger) {
    // aria-describedby can list multiple IDs
    const ids = (trigger.getAttribute("aria-describedby") || "").trim().split(/\s+/).filter(Boolean);
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el && el.textContent.trim()) return el.textContent.trim();
    }
    const nearby =
      trigger.closest(".desk-past-deliv-zoom-inner")?.querySelector(".desk-past-deliv-caption") ||
      trigger.closest(".mob-past-deliv-zoom-inner")?.querySelector(".mob-past-deliv-caption") ||
      trigger.nextElementSibling;
    return (nearby?.textContent?.trim()) || trigger.getAttribute("data-caption") || trigger.alt || "";
  }

  function openFrom(trigger) {
    lastFocus = trigger;

    const fullSrc    = trigger.getAttribute("data-zoom-src") || trigger.getAttribute("data-full") || trigger.currentSrc || trigger.src;
    const fullSrcset = trigger.getAttribute("data-srcset") || "";

    bigImg.removeAttribute("sizes");
    bigImg.src = fullSrc || "";
    if (fullSrcset) bigImg.srcset = fullSrcset; else bigImg.removeAttribute("srcset");
    bigImg.setAttribute("sizes", "100vw");

    capEl.textContent = resolveCaption(trigger);

    overlay.style.display = "flex";
    overlay.classList.add("is-open");
    overlay.removeAttribute("hidden");
    document.body.classList.add("body--modal-open");

    panel.focus({ preventScroll: false });

    // One-time close wiring
    if (!overlay.__desk_bind) {
      // Click backdrop to close (clicking empty overlay area)
      overlay.addEventListener("click", (e) => { if (e.target === e.currentTarget) closeModal(); });
      // Close buttons (includes #desk-past-deliv-close)
      closeBtns.forEach(btn => btn.addEventListener("click", (e) => { e.preventDefault(); closeModal(); }));
      // Esc + simple focus trap
      document.addEventListener("keydown", onKeydown);
      overlay.__desk_bind = true;
    }
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("hidden", "");
    overlay.style.display = "none";
    document.body.classList.remove("body--modal-open");

    bigImg.removeAttribute("src");
    bigImg.removeAttribute("srcset");
    capEl.textContent = "";

    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    lastFocus = null;
  }

  function onKeydown(e) {
    const open = !overlay.hasAttribute("hidden") || overlay.style.display === "flex";
    if (!open) return;

    if (e.key === "Escape") { e.preventDefault(); closeModal(); return; }

    if (e.key === "Tab") {
      const isVisible = el => !!el && el.offsetParent !== null && getComputedStyle(el).visibility !== "hidden";
      const tabs = Array.from(panel.querySelectorAll(
        "a[href],area[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])"
      )).filter(isVisible);
      if (!tabs.length) { e.preventDefault(); panel.focus(); return; }
      const first = tabs[0], last = tabs[tabs.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  // Bind Blog + Testimonial triggers (no class renames)
  const TRIGGERS = ".testimonial-thumb, [data-modal-open='desk-past-deliv']";
  document.querySelectorAll(TRIGGERS).forEach(trigger => {
    if (trigger.tagName === "IMG" && !trigger.closest("a")) {
      if (!trigger.hasAttribute("role")) trigger.setAttribute("role", "button");
      if (!trigger.hasAttribute("tabindex")) trigger.tabIndex = 0;
    }
    trigger.addEventListener("click", (e) => { e.preventDefault(); openFrom(trigger); });
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openFrom(trigger); }
    });
  });
});




document.addEventListener('DOMContentLoaded', () => {
  // Guard (set AFTER we successfully attach)
  window.ADS = window.ADS || {};
  if (window.ADS._joinAccordions) return;

  const SELECTOR_ITEM   = '.join-accordion-item';
  const SELECTOR_TOGGLE = '.join-accordion-toggle';
  const SELECTOR_PANEL  = '.join-accordion-panel';

  const getItem  = (el) => el?.closest(SELECTOR_ITEM) || null;
  const getPanel = (btn) => {
    if (!btn) return null;
    const item = getItem(btn);
    // Prefer sibling panel to survive duplicate IDs
    const sib = item?.querySelector(SELECTOR_PANEL);
    if (sib) return sib;
    const id = btn.getAttribute('aria-controls');
    return id ? document.getElementById(id) : null;
  };

  const closeItem = (item) => {
    const btn   = item.querySelector(SELECTOR_TOGGLE);
    const panel = getPanel(btn);
    if (!btn || !panel) return;
    btn.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
    item.classList.remove('is-open');
  };

  const openItem = (item) => {
    const btn   = item.querySelector(SELECTOR_TOGGLE);
    const panel = getPanel(btn);
    if (!btn || !panel) return;
    btn.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    item.classList.add('is-open');
  };

const handler = (e) => {
  const btn = e.target.closest(SELECTOR_TOGGLE);

  if (btn) {
    const item = getItem(btn);
    if (!item) return;

    // NEW: if this item is already open, close it (re-click closes)
    if (item.classList.contains('is-open')) {
      closeItem(item);
    } else {
      // otherwise close others, then open this one
      document.querySelectorAll(`${SELECTOR_ITEM}.is-open`).forEach(closeItem);
      openItem(item);
    }

    e.stopImmediatePropagation(); // prevent other code from re-toggling
    e.preventDefault();
    return;
  }

  // Non-toggle click: close any open items
  const anyOpen = document.querySelector(`${SELECTOR_ITEM}.is-open`);
  if (anyOpen) {
    document.querySelectorAll(`${SELECTOR_ITEM}.is-open`).forEach(closeItem);
    if (e.target.closest(SELECTOR_ITEM)) e.stopImmediatePropagation();
  }
};
});

document.addEventListener('DOMContentLoaded', () => {
  // ===== Guards
  const container = document.getElementById('mob-join-ways');
  if (!container) return;

  // ===== Accordion logic (only one open; toggle closes same)
  const toggles = container.querySelectorAll('.mob-join-accordion-toggle');

  function closeAllExcept(button) {
    toggles.forEach(t => {
      if (t !== button) {
        const panelId = t.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;
        if (!panel) return;
        t.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
      }
    });
  }

  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const panelId = btn.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;

      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
      } else {
        closeAllExcept(btn);
        btn.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    });
  });

  // Optional: close on outside click (toggle-able)
  const CLOSE_ON_OUTSIDE_CLICK = false;
  if (CLOSE_ON_OUTSIDE_CLICK) {
    document.addEventListener('click', (evt) => {
      const inside = container.contains(evt.target);
      if (inside) return;
      toggles.forEach(btn => {
        const panelId = btn.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;
        if (!panel) return;
        btn.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
      });
    });
  }
});
  

document.addEventListener('DOMContentLoaded', () => {
  // ===== Guards
  const container = document.getElementById('mob-join-ways');
  if (!container) return;

  // ===== Accordion logic (only one open; toggle closes same)
  const toggles = container.querySelectorAll('.mob-join-accordion-toggle');

  function closeAllExcept(button) {
    toggles.forEach(t => {
      if (t !== button) {
        const panelId = t.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;
        if (!panel) return;
        t.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
      }
    });
  }

  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const panelId = btn.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;

      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
      } else {
        closeAllExcept(btn);
        btn.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    });
  });

  // Optional: close on outside click (toggle-able)
  const CLOSE_ON_OUTSIDE_CLICK = false;
  if (CLOSE_ON_OUTSIDE_CLICK) {
    document.addEventListener('click', (evt) => {
      const inside = container.contains(evt.target);
      if (inside) return;
      toggles.forEach(btn => {
        const panelId = btn.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;
        if (!panel) return;
        btn.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
     });
    });
  }
});

// ===== BEGIN mob-join-ways =====
document.addEventListener('DOMContentLoaded', function () {
  console.log('[mob-join] init');

  var container = document.getElementById('mob-join-ways');
  if (!container) return;

  // --- Accordion
  var toggles = container.querySelectorAll('.join-mob-accordion-toggle');

  function closeAllExcept(button) {
    toggles.forEach(function (t) {
      if (t !== button) {
        var pid = t.getAttribute('aria-controls');
        var pnl = pid ? document.getElementById(pid) : null;
        if (!pnl) return;
        t.setAttribute('aria-expanded', 'false');
        pnl.hidden = true;
      }
    });
  }

  toggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pid = btn.getAttribute('aria-controls');
      var pnl = pid ? document.getElementById(pid) : null;
      if (!pnl) return;

      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        pnl.hidden = true;
      } else {
        closeAllExcept(btn);
        btn.setAttribute('aria-expanded', 'true');
        pnl.hidden = false;
      }
    });
  });
});
// ===== END mob-join-ways =====


// /join-pilot-roster — unified accordions: only-one-open + close-on-any-click
document.addEventListener("DOMContentLoaded", () => {
  window.ADS = window.ADS || {};
  if (window.ADS._joinAccordionsAnyClick) return;
  window.ADS._joinAccordionsAnyClick = true;

  const DEBUG = false;

  // If your mobile uses different class names, add them to these selectors.
  const SELECTOR_ITEM   = ".join-accordion-item";
  const SELECTOR_TOGGLE = ".join-accordion-toggle";
  const OPEN_CLASS      = "is-open";

  const toggles = Array.from(document.querySelectorAll(SELECTOR_TOGGLE));
  if (!toggles.length) {
    if (DEBUG) console.warn("[join] No toggles found for", SELECTOR_TOGGLE);
    return;
  }

  const metas = toggles.map(btn => {
    const panel = getPanel(btn);
    const item  = getItem(btn, panel);
    prep(btn, panel, item);
    return { btn, panel, item };
  });

  // ——— Bind events
  toggles.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation(); // prevents immediate global close on the same click
      const meta = findMeta(btn);
      toggle(meta);
    });

    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const meta = findMeta(btn);
        toggle(meta);
      }
    });
  });

document.addEventListener("click", (e) => {
  // ignore clicks on a toggle (handled elsewhere)
  if (e.target.closest(SELECTOR_TOGGLE)) return;
  // NEW: ignore clicks on action buttons (keep panel open after Copy/Email)
  if (e.target.closest(".join-mob-copy-button, .join-mob-email-button")) return; 
  if (metas.some(isOpen)) metas.forEach(close);
});


  // Escape closes (nice to have)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && metas.some(isOpen)) metas.forEach(close);
  });

  // ——— Helpers
  function getPanel(btn) {
    // 1) aria-controls id
    const id = btn.getAttribute("aria-controls");
    if (id) {
      const el = document.getElementById(id);
      if (el) return el;
    }
    // 2) nextElementSibling fallback if it looks like a panel
    let sib = btn.nextElementSibling;
    while (sib && sib.nodeType === 3) sib = sib.nextElementSibling; // skip text nodes
    if (sib && (sib.matches?.(".join-accordion-panel, [role='region']") || sib.hasAttribute?.("data-accordion-panel"))) {
      return sib;
    }
    if (DEBUG) console.warn("[join] Panel not found for toggle:", btn);
    return null;
  }

  function getItem(btn, panel) {
    return btn.closest(SELECTOR_ITEM) || panel?.closest(SELECTOR_ITEM) || null;
  }

  function prep(btn, panel, item) {
    if (!btn.hasAttribute("aria-expanded")) btn.setAttribute("aria-expanded", "false");
    if (panel) {
      if (!panel.id && btn.id) {
        panel.id = btn.id + "-panel";
        btn.setAttribute("aria-controls", panel.id);
      }
      panel.hidden = true;
      panel.style.display = "none";
    }
    item?.classList.remove(OPEN_CLASS);
  }

  function findMeta(btn) { return metas.find(m => m.btn === btn) || null; }
  function isOpen(meta)  { return meta?.btn.getAttribute("aria-expanded") === "true"; }

  function close(meta) {
    if (!meta) return;
    meta.btn.setAttribute("aria-expanded", "false");
    if (meta.panel) {
      meta.panel.hidden = true;
      meta.panel.style.display = "none";
    }
    meta.item?.classList.remove(OPEN_CLASS);
    if (DEBUG) console.log("[join] close ->", meta.btn.id || meta.panel?.id || meta.item);
  }

  function open(meta) {
    // only one open: close all others first
    metas.forEach(m => { if (m !== meta) close(m); });
    meta.btn.setAttribute("aria-expanded", "true");
    if (meta.panel) {
      meta.panel.hidden = false;
      meta.panel.style.display = "";
    }
    meta.item?.classList.add(OPEN_CLASS);
    if (DEBUG) console.log("[join] open ->", meta.btn.id || meta.panel?.id || meta.item);
  }

  function toggle(meta) { isOpen(meta) ? close(meta) : open(meta); }
});






// /join-pilot-roster (MOBILE) — copy/email from non-contiguous <template> bank (class-based)
document.addEventListener("DOMContentLoaded", () => {
  window.ADS = window.ADS || {};
  if (window.ADS._joinMobCopyEmailLoose) return;
  window.ADS._joinMobCopyEmailLoose = true;

  const DEBUG = false;

  // Your selectors (verbatim)
  const SELECTORS = {
    scope: document, // or document.querySelector(".join-page")
    item: ".join-mob-accordion-item",
    copyBtn: ".join-mob-copy-button",
    emailBtn: ".join-mob-email-button",
    copyTarget: ".join-mob-copy-target", // may be a <template> or a wrapper that contains one
    emailBody: ".join-mob-email-body"    // may be a <template> or a wrapper that contains one
  };

  // Optional: shared "tag" class to pair buttons to templates in a global bank.
  // Example: add class "join-tmpl-way1" to the button and to the target <template>.
  const TAG_PREFIX = "join-tmpl-";

  const EMAIL_DEFAULTS = {
    to: "ops@aircraft.delivery",
    subject: "Join Pilot Roster Info",
    cc: "",
    bcc: ""
  };

  ensureButtonTypeAll(SELECTORS.copyBtn);
  ensureButtonTypeAll(SELECTORS.emailBtn);

  SELECTORS.scope.addEventListener("click", (e) => {
    // COPY
    const copyBtn = e.target.closest(SELECTORS.copyBtn);
    if (copyBtn) {
      e.preventDefault();
      e.stopPropagation();
      const src = getTargetEl(copyBtn, SELECTORS.copyTarget, SELECTORS.emailBody);
      if (!src) { if (DEBUG) console.warn("[join] copy target not found"); return; }
      const text = extractPreferredText(src);
      if (DEBUG) console.log("[join] COPY len:", text.length, "preview:", text.slice(0, 120));
copyText(text)
  .then(() => {
    confirmFlash(copyBtn, "Copied!");
    flag(copyBtn, "Copied!");      // keeps your aria feedback
  })
  .catch(() => {
    confirmFlash(copyBtn, "Copy failed");
    flag(copyBtn, "Copy failed");
  });

    }

    // EMAIL
    const emailBtn = e.target.closest(SELECTORS.emailBtn);
    if (emailBtn) {
      e.preventDefault();
      e.stopPropagation();
      const bodyEl = getTargetEl(emailBtn, SELECTORS.emailBody, SELECTORS.copyTarget);
      if (!bodyEl) { if (DEBUG) console.warn("[join] email body target not found"); return; }
      const bodyText = extractPreferredText(bodyEl);
      if (DEBUG) console.log("[join] EMAIL len:", bodyText.length, "preview:", bodyText.slice(0, 120));
      const href = buildMailto({
        to: EMAIL_DEFAULTS.to,
        subject: EMAIL_DEFAULTS.subject,
        cc: EMAIL_DEFAULTS.cc,
        bcc: EMAIL_DEFAULTS.bcc,
        body: bodyText.replace(/\r?\n/g, "\r\n")
      });
      confirmFlash(emailBtn, "Email Program Opening!");
flag(emailBtn, "Email Program Opening!");

      window.location.href = href;
      return;
    }
  }, { capture: true });

  // ------- helpers -------

  // Prefer: (1) tag-match in global bank, (2) inside nearest item, (3) global fallback
  function getTargetEl(btn, primarySel, secondarySel) {
    // (1) tag-match: find a class like "join-tmpl-xxx" on the button
    const tagClass = Array.from(btn.classList).find(c => c.startsWith(TAG_PREFIX));
    if (tagClass) {
      const tagged =
        document.querySelector(`${primarySel}.${tagClass}`) ||
        document.querySelector(`${secondarySel}.${tagClass}`);
      if (tagged) return resolveTemplate(tagged);
    }

    // (2) inside nearest item
    const container = btn.closest(SELECTORS.item);
    if (container) {
      const local =
        container.querySelector(primarySel) ||
        container.querySelector(secondarySel);
      if (local) return resolveTemplate(local);
    }

    // (3) global fallback (first match in the bank)
    const globalEl =
      document.querySelector(primarySel) ||
      document.querySelector(secondarySel);
    return resolveTemplate(globalEl);
  }

  // Accepts either a <template>, an element that contains a <template>, or a plain element.
  function resolveTemplate(el) {
    if (!el) return null;
    const tag = el.tagName ? el.tagName.toLowerCase() : "";
    if (tag === "template") return el; // we'll read el.content below
    const t = el.querySelector ? el.querySelector("template") : null;
    return t || el;
  }

  // Robust extractor for <template> or regular elements.
  function extractPreferredText(nodeOrTemplate) {
    if (!nodeOrTemplate) return "";
    // If it's a <template>, use its .content text
    if (nodeOrTemplate.tagName && nodeOrTemplate.tagName.toLowerCase() === "template") {
      return normalizeText(nodeOrTemplate.content.textContent || "");
    }
    // Prefer visible text when possible
    const visible = (nodeOrTemplate.innerText || "").trim();
    if (visible) return normalizeText(visible);
    // Otherwise fall back to raw text (works for hidden/offscreen)
    const raw = (nodeOrTemplate.textContent || "").trim();
    if (raw) return normalizeText(raw);
    // Last resort: strip tags from innerHTML and normalize block/line breaks
    const html = nodeOrTemplate.innerHTML || "";
    if (!html) return "";
    const lineish = html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6])>\s*/gi, "\n")
      .replace(/<li>/gi, "• ")
      .replace(/<[^>]+>/g, "");
    return normalizeText(decodeEntities(lineish));
  }

  function normalizeText(s) {
    // collapse spaces before newlines; trim; leave \n (mailto builder converts to CRLF)
    return String(s).replace(/[ \t]+\n/g, "\n").trim();
  }

  function decodeEntities(s) {
    const ta = document.createElement("textarea");
    ta.innerHTML = s;
    return ta.value;
  }

  function ensureButtonTypeAll(sel) {
    document.querySelectorAll(sel).forEach(el => {
      if (el.tagName === "BUTTON" && !el.getAttribute("type")) el.setAttribute("type", "button");
    });
  }

  function copyText(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    // Fallback
    return new Promise((resolve, reject) => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        ok ? resolve() : reject();
      } catch (err) {
        document.body.removeChild(ta);
        reject(err);
      }
    });
  }

function confirmFlash(btn, text, ms = 1300) {
  // Lock current width to avoid layout shift while the label changes
  const rect = btn.getBoundingClientRect();
  const prevMinW = btn.style.minWidth;
  if (rect?.width) btn.style.minWidth = Math.ceil(rect.width) + "px";

  // Remember original HTML once
  if (!btn.dataset.originalHtml) btn.dataset.originalHtml = btn.innerHTML;

  // Show confirmation
  btn.innerText = text; // plain text on purpose (no HTML injection)
  btn.classList.add("is-confirming");

  // Restore after a moment
  window.clearTimeout(btn._confirmTimer);
  btn._confirmTimer = window.setTimeout(() => {
    btn.innerHTML = btn.dataset.originalHtml;
    btn.classList.remove("is-confirming");
    // restore min-width
    if (prevMinW) btn.style.minWidth = prevMinW; else btn.style.minWidth = "";
  }, ms);
}

  function buildMailto({ to, subject, cc, bcc, body }) {
    const params = [];
    if (subject) params.push("subject=" + encodeURIComponent(subject));
    if (cc)      params.push("cc=" + encodeURIComponent(cc));
    if (bcc)     params.push("bcc=" + encodeURIComponent(bcc));
    params.push("body=" + encodeURIComponent(String(body || "")));
    return "mailto:" + encodeURIComponent(to || "") + (params.length ? "?" + params.join("&") : "");
  }

  function flag(btn, msg) {
    btn.setAttribute("aria-label", msg);
    btn.dataset.lastStatus = msg;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  window.ADS = window.ADS || {};
  if (window.ADS._modalA11y_auto) return;
  window.ADS._modalA11y_auto = true;

  // 🔧 Update selectors if your modal class names differ
  const MODAL_SELECTORS = ['.mob-past-deliv-img', '.mob-about-thumb', 'thumbnail'];
  const CLOSE_SEL   = '.modal-close, .close, [aria-label="Close"]';
  const OVERLAY_SEL = '.modal-overlay, .overlay';
  const TITLE_SEL   = 'h1, h2, .modal-title, [data-title]';

  let lastOpener = null;
  const remember = (e) => { lastOpner = e.target; }; // typo-safe fallback below
  document.addEventListener('mousedown', e => { lastOpener = e.target; }, true);
  document.addEventListener('keydown',  e => {
    if (e.key === 'Enter' || e.key === ' ') lastOpener = e.target;
  }, true);

  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const getFocusable = (root) => Array.from(root.querySelectorAll(FOCUSABLE))
    .filter(el => el.offsetParent !== null || el === root);

  const isVisible = (el) => {
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && el.offsetParent !== null;
  };

  const applySemantics = (modal) => {
    if (!modal.hasAttribute('role')) modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    if (!modal.hasAttribute('tabindex')) modal.tabIndex = -1;

    if (!modal.hasAttribute('aria-labelledby') && !modal.hasAttribute('aria-label')) {
      const title = modal.querySelector(TITLE_SEL);
      if (title) {
        if (!title.id) title.id = 'm-' + Math.random().toString(36).slice(2,8);
        modal.setAttribute('aria-labelledby', title.id);
      } else {
        modal.setAttribute('aria-label', 'Dialog');
      }
    }
  };

  const lockBody = (on) => document.body.classList[on ? 'add' : 'remove']('no-scroll');

  const onOpen = (modal) => {
    applySemantics(modal);
    modal.setAttribute('aria-hidden', 'false');
    lockBody(true);

    const first = getFocusable(modal)[0] || modal;
    first.focus();

    const keyHandler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        const closer = modal.querySelector(CLOSE_SEL);
        if (closer) closer.click(); else onClose(modal);
      } else if (e.key === 'Tab') {
        const f = getFocusable(modal);
        if (!f.length) { e.preventDefault(); return; }
        const a = document.activeElement, first = f[0], last = f[f.length-1];
        if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
      }
    };
    modal._adsKeyHandler = keyHandler;
    document.addEventListener('keydown', keyHandler, true);
  };

  const onClose = (modal) => {
    modal.setAttribute('aria-hidden', 'true');
    lockBody(false);
    if (modal._adsKeyHandler) document.removeEventListener('keydown', modal._adsKeyHandler, true);
    setTimeout(() => {
      try { (lastOpener && lastOpener.focus) ? lastOpener.focus() : document.body.focus(); } catch {}
    }, 0);
  };

  // Click handlers for overlay + close (no HTML edits needed if you already use these classes)
  document.addEventListener('click', (e) => {
    const overlay = e.target.closest(OVERLAY_SEL);
    if (overlay && overlay === e.target) {
      const modal = MODAL_SELECTORS.map(sel => overlay.closest(sel)).find(Boolean);
      if (modal) {
        const closer = modal.querySelector(CLOSE_SEL);
        if (closer) closer.click(); else onClose(modal);
      }
    }
    const closer = e.target.closest(CLOSE_SEL);
    if (closer) {
      const modal = MODAL_SELECTORS.map(sel => closer.closest(sel)).find(Boolean);
      if (modal) onClose(modal);
    }
  }, true);

  // Observe visibility changes on the modal elements you already have
  const targets = MODAL_SELECTORS.flatMap(sel => Array.from(document.querySelectorAll(sel)));
  const observer = new MutationObserver((mut) => {
    mut.forEach(m => {
      const modal = m.target;
      const now = isVisible(modal);
      const wasHidden = modal.getAttribute('aria-hidden') !== 'false';
      if (now && wasHidden) onOpen(modal);
      else if (!now && !wasHidden) onClose(modal);
    });
  });
  targets.forEach(modal => {
    applySemantics(modal);
    modal.setAttribute('aria-hidden', isVisible(modal) ? 'false' : 'true');
    observer.observe(modal, { attributes: true, attributeFilter: ['class','style','hidden','aria-hidden'] });
  });
});


document.addEventListener('DOMContentLoaded', () => {
  window.ADS = window.ADS || {};
  if (window.ADS._padSync_v5) return;
  window.ADS._padSync_v5 = true;

  // Update/trim selectors if yours differ
  const CANDIDATES = [
    'header.desk-header',
    'header.mob-header',
    'header.mobile-header',
    '.mobile-header',
    '.site-header'
  ];

  const getHeaders = () =>
    CANDIDATES.flatMap(sel => Array.from(document.querySelectorAll(sel)));

  const cs = (el) => getComputedStyle(el);

  const isRenderable = (el) => {
    const s = cs(el);
    if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  // A header should only pad if it's fixed AND actually overlapping the viewport top
  const shouldPadFor = (el) => {
    if (!isRenderable(el)) return false;
    if (cs(el).position !== 'fixed') return false;
    const r = el.getBoundingClientRect();
    // In view (touching/overlapping the viewport) & near the top edge
    const overlapsViewport = r.bottom > 0 && r.top < window.innerHeight;
    const nearTop = r.top < 100; // allow tiny scroll offsets/transforms
    return overlapsViewport && nearTop;
  };

  const ensurePadAfter = (header) => {
    let pad = header.nextElementSibling;
    if (!(pad && pad.classList && pad.classList.contains('header-pad'))) {
      // Reuse existing pad elsewhere if present
      pad = document.querySelector('.header-pad') || document.createElement('div');
      pad.className = 'header-pad';
      pad.style.width = '100%';
      pad.style.height = '0px';
      header.parentNode.insertBefore(pad, header.nextSibling);
    } else {
      // Make sure it's not styled by external CSS in ways that affect height math
      pad.style.margin = '0';
      pad.style.padding = '0';
      pad.style.border = '0';
      pad.style.boxSizing = 'content-box';
    }
    return pad;
  };

  let active = null;
  let ros = [];

  const pickActiveHeader = () => {
    const all = getHeaders().filter(isRenderable);
    // Prefer fixed, visible, near-top headers; fall back to none
    const fixed = all.filter(shouldPadFor);
    if (fixed.length) {
      // Choose the one closest to the top
      fixed.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
      return fixed[0];
    }
    return null;
  };

  const sync = () => {
    const next = pickActiveHeader();
    if (next !== active) {
      // (Re)attach ResizeObservers on the new active header
      ros.forEach(ro => ro.disconnect && ro.disconnect());
      ros = [];
      active = next;

      if (active && 'ResizeObserver' in window) {
        const ro = new ResizeObserver(() => setPad());
        ro.observe(active);
        ros.push(ro);
      }
    }
    setPad();
  };

  const setPad = () => {
    // Always ensure a pad exists right after whichever header is active (if any)
    const pad = active ? ensurePadAfter(active) : (document.querySelector('.header-pad') || null);
    const height = active ? active.offsetHeight : 0;
    if (pad) pad.style.height = height + 'px';
  };

  // Initial + after webfonts (font swap can change header height)
  sync();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(sync).catch(() => {});
  }

  // Watch global layout changes that could flip headers or sizes
  ['resize', 'orientationchange', 'scroll'].forEach(ev => window.addEventListener(ev, sync, { passive: true }));
  const mo = new MutationObserver(sync);
  mo.observe(document.documentElement, {
    childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style']
  });
});


document.addEventListener('DOMContentLoaded', () => {
  // Guard
  window.ADS = window.ADS || {};
  if (window.ADS._deskHeaderRowFix) return;
  window.ADS._deskHeaderRowFix = true;

  const header = document.querySelector('header.desk-header');
  if (!header) return;

  const left = header.querySelector('.desk-header-left');
  const logo = header.querySelector('img.desk-header-logo');
  const right = header.querySelector('.desk-header-right');

  const isStacked = () => {
    const H  = header.offsetHeight || 0;
    const hL = left?.offsetHeight || 0;
    const hC = logo?.offsetHeight || 0;
    const hR = right?.offsetHeight || 0;
    const tallest = Math.max(hL, hC, hR);
    const sum = hL + hC + hR;

    // Stacked if header is way taller than any child or roughly equals their sum
    return (innerWidth > 1400) && (H >= 220 || H > tallest + 40 || Math.abs(sum - H) <= 8);
  };

  const applyRow = () => {
    // Minimal, non-destructive styles — only when stacked
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    if (left)  left.style.whiteSpace = 'nowrap';
    if (right) right.style.whiteSpace = 'nowrap';

    // Keep the logo from ballooning the row
    if (logo) {
      logo.style.display = 'block';
      logo.style.height = 'auto';
      logo.style.width = 'auto';
      // cap the logo height; adjust the max if your brand lockup needs more
      logo.style.maxHeight = '110px';
    }
  };

  const maybeFix = () => {
    // Clear any previous inline styles in case we crossed breakpoints
    if (innerWidth <= 1400) {
      header.style.removeProperty('display');
      header.style.removeProperty('align-items');
      header.style.removeProperty('justify-content');
      if (left)  left.style.removeProperty('white-space');
      if (right) right.style.removeProperty('white-space');
      if (logo)  logo.style.removeProperty('max-height');
      return;
    }
    if (isStacked()) applyRow();
  };

  // Run now, on resize, and after fonts load (fonts often change header height)
  maybeFix();
  window.addEventListener('resize', maybeFix, { passive: true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(maybeFix).catch(() => {});
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const html = document.documentElement;
  const reveal = () => html.classList.remove('hdr-hide');

  // Wait for the injected header to actually exist
  const waitForHeader = () => new Promise(resolve => {
    const have = () => document.querySelector('header.desk-header');
    const h = have(); if (h) return resolve(h);
    const mo = new MutationObserver(() => { const el = have(); if (el) { mo.disconnect(); resolve(el); }});
    mo.observe(document.documentElement, { childList: true, subtree: true });
  });

  // Consider the header "stable" when its height stops changing between checks
  const waitStableHeight = (el, intervalMs = 80) => new Promise(resolve => {
    let last = el.offsetHeight;
    const tick = () => {
      const cur = el.offsetHeight;
      if (Math.abs(cur - last) <= 1) return resolve();
      last = cur;
      setTimeout(tick, intervalMs);
    };
    setTimeout(tick, intervalMs);
  });

  (async () => {
    const header = await waitForHeader();
    try { await (document.fonts && document.fonts.ready); } catch {}
    await waitStableHeight(header, 80);
    reveal();
  })();

  // Safety: never keep it hidden too long on poor networks
  setTimeout(reveal, 2500);
});
