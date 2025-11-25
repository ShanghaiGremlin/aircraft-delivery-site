// js/modules/quote-modal.js

export function initQuoteModal() {

  const estimateInputs = document.querySelectorAll(
    'input[name="button-view-estimates"]'
  );

  // ------------------------------------------------------------
  // INTENTIONAL CLICK ONLY (works through <label>)
  // ------------------------------------------------------------
  estimateInputs.forEach((input) => {
    input.addEventListener("click", (e) => {
      // Only real user interaction
      if (!e.isTrusted) return;
      if (!input.checked) return;

      waitForFlipToFinish(() => {
        openModalForCurrentLocation();
      });
    });
  });

function isMobileView() {
  return window.innerWidth < 1200;
}

function createQuoteModalInstance(modalNumber) {
  const isDesktop = window.innerWidth >= 1200;

  const templateId = isDesktop
    ? `tmpl-quote-modal-desktop-${modalNumber}`
    : `tmpl-quote-modal-mobile-${modalNumber}`;

  // --- CLEANUP: remove ALL previously injected runtime modals/cards ---
  document.querySelectorAll('.quote-modal-backdrop[id^="quote-modal-"]').forEach(el => el.remove());
  document.querySelectorAll('.quote800-pdf-btn[id^="quote-modal-"]').forEach(el => el.remove());
  // -------------------------------------------------------------------

  const template = document.getElementById(templateId);
  if (!template) {
    console.error("Template not found:", templateId);
    return null;
  }

  const clone = template.content.firstElementChild.cloneNode(true);

  // Assign runtime ID
  clone.id = isDesktop
    ? `quote-modal-${modalNumber}`
    : `quote-modal-${modalNumber}-mobile`;

  // ======================================================
  // DESKTOP: append to body
  // ======================================================
  if (isDesktop) {
    document.body.appendChild(clone);
  }

  // ======================================================
  // MOBILE: append to <main>
  // ======================================================
  else {
    const main = document.querySelector("main");
    (main || document.body).appendChild(clone);

    const pdfBtn = clone.querySelector("button");
    if (pdfBtn) {
pdfBtn.addEventListener("click", () => {

  const link = clone.getAttribute("data-link");
  if (link) openPDF(link);
});

    
    }
  }

  return clone;
}







  // ------------------------------------------------------------
  // OPEN MODAL FOR CURRENT LOCATION
  // ------------------------------------------------------------
  function openModalForCurrentLocation() {
    const current = window.flipbook.currentLocation;
    const modalId = `quote-modal-${current}`;

    console.log("[modal] opening:", modalId);

let modal = document.getElementById(modalId);

// If modal doesn’t exist yet, create it from the correct template
if (!modal) {
  modal = createQuoteModalInstance(current);
  if (!modal) {
    console.warn("[modal] FAILED TO CREATE:", modalId);
    return;
  }
}

    modal.classList.remove("is-hidden");
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    modal.focus();

    // Lock body scroll
    document.body.style.overflowY = "hidden";
    document.body.style.height = "100%";
  }


  // ------------------------------------------------------------
  // CLOSE MODAL (CLICK on close button)
  // ------------------------------------------------------------
  document.addEventListener("click", (e) => {
    const closeBtn = e.target.closest(".close-modal");
    if (!closeBtn) return;

    const modal = closeBtn.closest(".quote-modal-backdrop");
    if (!modal) return;

    closeModal(modal);
  });


  // ------------------------------------------------------------
  // CLOSE MODAL (ESC KEY)
  // ------------------------------------------------------------
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;

    const modal = document.querySelector(
      ".quote-modal-backdrop:not(.is-hidden)"
    );
    if (!modal) return;

    closeModal(modal);
  });


  // ------------------------------------------------------------
  // CLOSE MODAL HELPER
  // ------------------------------------------------------------
  function closeModal(modal) {
    modal.classList.add("is-hidden");
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");

    // Unlock scroll
    document.body.style.overflowY = "auto";
    document.body.style.height  = "auto";

    console.log("[modal] closed:", modal.id);
  }


function openPDF(link) {
  window.open(link, "_blank", "noopener");
}



// ------------------------------------------------------------
// WAIT FOR FLIPBOOK SETTLE
// ------------------------------------------------------------
function waitForFlipToFinish(callback) {
  const fb = window.flipbook;

  // Safety fallback
  if (!fb || typeof fb.isFlipping === "undefined") {
    setTimeout(callback, 300);
    return;
  }

  // Poll until flipbook reports it's done flipping
  const check = () => {
    if (!fb.isFlipping) {
      callback();
    } else {
      requestAnimationFrame(check);
    }
  };

  check();
}


}
