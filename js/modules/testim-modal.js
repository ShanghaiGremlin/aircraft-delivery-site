/**
 * TESTIM MODAL — CANONICAL STATE MACHINE (final form)
 *
 * Baseline DOM truth
 * - .verbose is VISIBLE in DOM when modal is not open (no “persisted collapse”).
 * - Collapsed preview is ONLY a temporary display mode during an open session.
 *
 * OPEN (trigger: .testim-bubble)
 * 1) Unhide modal (remove `is-hidden`, remove `hidden`, remove `aria-hidden`).
 * 2) Hide `.close-float` baseline (it appears only after EXPAND).
 * 3) Set `modal.dataset.resizeCount = "0"`.
 * 4) Run checkHeight():
 *    - Measure natural content height with `.verbose` visible:
 *      - cardHeight = Math.max(card.scrollHeight, card.getBoundingClientRect().height)
 *    - Include margins + fixed header in the comparison:
 *      - effectiveCardHeight = cardHeight + marginTop + marginBottom + 90 /* header px 
 *    - viewportAvail = min(window.innerHeight, document.documentElement.clientHeight) - 10
 *    - If effectiveCardHeight <= viewportAvail:
 *        → no expand UI; keep verbose visible; aria-expanded="false"
 *      Else:
 *        → hide `.verbose` (collapsed preview)
 *           show `.blockquote-expand`
 *           set aria-expanded="false"
 *
 * EXPAND (trigger: .blockquote-expand)
 * - One-way action (no toggle):
 *   - Show `.verbose` (remove `.is-hidden`)
 *   - Hide expand button (element.hidden = true)
 *   - Show `.close-float`
 *   - Set aria-expanded="true"
 *
 * CLOSE (any of)
 * - Buttons: [data-close-modal], .testim-modal-close, .close-float
 * - Overlay click: click outside `.testim` while a modal is open
 * - ESC key (global keydown)
 * Actions:
 *   - Restore `.verbose` visible (remove `.is-hidden`)
 *   - Hide modal (add `.is-hidden`)
 *   - Remove modal tabindex
 *   - If window.allowPageScroll exists → allowPageScroll(true)
 *   - Restore focus to previous trigger (if tracked)
 *
 * RESIZE (global)
 * - First resize per open session only:
 *   - If modal.dataset.resizeCount === "0":
 *       → set to "1", re-run checkHeight(modal)
 *   - Subsequent resizes during the same open are ignored
 *
 * Accessibility
 * - Focus enters the first focusable inside the modal on open; falls back to modal with tabindex=-1.
 * - ESC closes globally when a `.testim-modal:not(.is-hidden)` is present.
 * - Expand button wires aria-controls to `.verbose` (ensureVerboseA11y).
 * - Focus returns to the opener on close (selector key via class/id + [data-modal-target]).
 *
 * Notes / Non-goals
 * - No per-modal ESC arm/disarm — global ESC is intentional since only one modal is open at a time.
 * - `.close-float` is baseline-hidden on open and always shown after EXPAND.
 * - All “collapse” is ephemeral; DOM never persists a collapsed `.verbose` state across closes.
 *
 * Maintenance tips
 * - If header height changes, update the fixed 90px in checkHeight composition.
 * - Keep one delegated document click handler; add new cases inside it in order: OPEN → EXPAND → CLOSE → overlay close.
 * - Avoid introducing new toggles; preserve one-way EXPAND semantics.
 */



(function () {
  'use strict';

  // ---------- Utilities
  function isFunction(fn) {
    return typeof fn === 'function';
  }

  function focusFirstFocusable(modal) {
    const selectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];
    const first = modal.querySelector(selectors.join(','));
     console.log('first focusable inside modal =', first); 
    if (first) first.focus({ preventScroll: true });
    else modal.setAttribute('tabindex', '-1'), modal.focus({ preventScroll: true });
  }

  function getVerbose(modal) {
    return modal.querySelector('.verbose');
  }

  function getExpandBtn(modal) {
    return modal.querySelector('.blockquote-expand');
  }

  // returns the white card
  function getCard(modal) {
    return modal.querySelector('.testim');
  }

function getCardHeight(modal) {
  const card = getCard(modal);
  if (!card) return 0;

  // measure natural content height (unaffected by internal overflow)
  // scrollHeight captures full content; rect is a fallback
  const contentH = card.scrollHeight || 0;
  const visualH  = card.getBoundingClientRect().height || 0;
  return Math.max(contentH, visualH);
}


  // Ensure .verbose has a unique id and wire aria-controls on the expand button
  function ensureVerboseA11y(modal) {
    const verbose = getVerbose(modal);
    const expandBtn = getExpandBtn(modal);
    if (!verbose || !expandBtn) return;

    if (!verbose.id) {
      // Build a stable, unique ID based on modal id
      const base = modal.id || 'past-modal-x-t';
      verbose.id = base.replace(/^past-modal-/, 'modal-verbose-');
    }
    expandBtn.setAttribute('aria-controls', verbose.id);
  }

  // Decide whether to show the "Read the rest..." button
  // Strategy: if .verbose exists and contains non-empty text, show the button; else hide it.
  // (We avoid fragile height math; your verbose content is already split at build time.)
  function checkHeight(modal) {
    const verbose   = getVerbose(modal);
    const expandBtn = getExpandBtn(modal);
    if (!expandBtn) return;

    // if no verbose span => never collapse / never expand
    if (!verbose) {
      expandBtn.hidden = true;
      return;
    }

    // reset verbose visible before measuring
    verbose.classList.remove('is-hidden');

 const viewportAvail = Math.min(window.innerHeight, document.documentElement.clientHeight) - 10;

const card         = getCard(modal);
const cardHeight   = getCardHeight(modal);

// include card’s top/bottom margins and fixed header
const s            = card ? window.getComputedStyle(card) : null;
const mt           = s ? parseFloat(s.marginTop)    : 0;
const mb           = s ? parseFloat(s.marginBottom) : 0;
const headerH      = 90; // fixed header height in px

const effectiveCardHeight = cardHeight + mt + mb + headerH;


    if (effectiveCardHeight <= viewportAvail) {
      // fits comfortably → no expand UI
      expandBtn.hidden = true;
      expandBtn.setAttribute('aria-expanded', 'false');
    } else {
      // too tall → collapse verbose & show button
      verbose.classList.add('is-hidden');
      expandBtn.hidden = false;
      expandBtn.setAttribute('aria-expanded', 'false');
    }
  }


  function openModalById(id, triggerEl) {
    if (!id) return;
    const modal = document.getElementById(id);
    if (!modal) return;

    // Store the trigger to restore focus later
    if (triggerEl) modal.dataset.prevFocus = getElementFocusKey(triggerEl);

// kill sentinel observer
if (modal._sentinelObserver) {
  modal._sentinelObserver.disconnect();
  delete modal._sentinelObserver;
}


modal.classList.remove('is-hidden');
modal.removeAttribute('hidden');
modal.removeAttribute('aria-hidden');

// SENTINEL VISIBILITY OBSERVER
// note: this runs per-open and is torn down on close

const sentinel = modal.querySelector('.sentinel');
if (sentinel) {
  const floatClose = modal.querySelector('.close-float');

  const io = new IntersectionObserver((entries) => {
    const entry = entries[0];
    const topXVisible = entry.isIntersecting; // sentinel == top-right X proxy

    if (topXVisible) {
      // X in view → hide float
      floatClose?.classList.add('is-hidden');
    } else {
      // X NOT in view → show float (only AFTER expand event has made it eligible)
      // NOTE: this does NOT override .is-hidden baseline on open
      if (!floatClose?.classList.contains('baseline')) {
        floatClose?.classList.remove('is-hidden');
      }
    }
  }, {
    root: null,
    rootMargin: '-90px 0px 0px 0px', // compensate header
    threshold: 0
  });

  io.observe(sentinel);

  // store observer for teardown
  modal._sentinelObserver = io;
}



// baseline hide float close button
// baseline hide float close button
const floatClose = modal.querySelector('.close-float');
if (floatClose) {
  floatClose.classList.add('is-hidden');
  floatClose.classList.add('baseline');  // <— new flag
}

modal.dataset.resizeCount = "0";


modal.setAttribute('tabindex','-1');
modal.focus();


    // A11y wiring (id for verbose and aria-controls for the button)
    ensureVerboseA11y(modal);
    // Decide expander visibility/state
    checkHeight(modal);
    // Focus management

    // Optional scroll lock
    if (isFunction(window.allowPageScroll)) window.allowPageScroll(false);


  }

function closeModal(modal) {
  if (!modal) return;

  // restore verbose baseline visibility
  const verbose = getVerbose(modal);
  if (verbose) verbose.classList.remove('is-hidden');

  // kill sentinel observer
if (modal._sentinelObserver) {
  modal._sentinelObserver.disconnect();
  delete modal._sentinelObserver;
}


  modal.classList.add('is-hidden');

  modal.removeAttribute('tabindex');  // ← critical fix

  if (isFunction(window.allowPageScroll)) window.allowPageScroll(true);
  restorePrevFocus(modal);


  }

  // Lightweight focus restore without keeping a DOM ref (robust across re-renders)
  function getElementFocusKey(el) {
    // Prefer an id if present
    if (el.id) return `#${el.id}`;
    // Otherwise build a simple selector path (class + data-modal-target)
    const parts = [];
    if (el.className) parts.push('.' + String(el.className).trim().split(/\s+/).join('.'));
    const t = el.getAttribute('data-modal-target');
    if (t) parts.push(`[data-modal-target="${CSS.escape(t)}"]`);
    return parts.length ? parts.join('') : '';
  }

  function restorePrevFocus(modal) {
    const key = modal.dataset.prevFocus;
    delete modal.dataset.prevFocus;
    if (!key) return;

    let target = null;
    if (key.startsWith('#')) {
      target = document.getElementById(key.slice(1));
    } else {
      try { target = document.querySelector(key); } catch (_) { /* ignore */ }
    }
    if (target && typeof target.focus === 'function') {
      target.focus({ preventScroll: true });
    }
  }

  // ESC handling per-modal
  function onEscKey(e) {
    if (e.key !== 'Escape') return;
    const openModal = e.currentTarget; // bound with .bind(modal)
    closeModal(openModal);
  }

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const open = document.querySelector('.testim-modal:not(.is-hidden)');
  if (!open) return;
  closeModal(open);
});


  function disarmEscFor(modal) {
    // removeEventListener requires the same reference; simplest is to clone/replace,
    // but we can also just leave it—since the modal is hidden and reused, we keep it.
    // If you prefer strict cleanup, swapNode:
    // const clone = modal.cloneNode(true); modal.parentNode.replaceChild(clone, modal);
  }

  // ---------- Delegated wiring
  document.addEventListener('click', (e) => {


// OPEN
const bubble = e.target.closest('.testim-bubble');
if (bubble) {
  const id = bubble.getAttribute('data-modal-target') || bubble.getAttribute('aria-controls');
  console.log('id=', id)
  console.log('modal found=', document.getElementById(id))
  openModalById(id, bubble);
  return;
}


// ONE-WAY EXPAND
const expand = e.target.closest('.blockquote-expand');
if (expand) {
  const modal = e.target.closest('.testim-modal');
  if (!modal) return;
  const verbose = getVerbose(modal);
  if (!verbose) return;

  // show verbose fully
  verbose.classList.remove('is-hidden');

  // hide the expand button permanently for this open
  expand.hidden = true;
  expand.setAttribute('aria-expanded', 'true');

  // and show close-float
  const floatClose = modal.querySelector('.close-float');
  if (floatClose) floatClose.classList.remove('is-hidden');
floatClose.classList.remove('baseline');

// sentinel observer — per open
const sentinel = modal.querySelector('.sentinel');
if (sentinel) {
  const io = new IntersectionObserver((entries) => {
    const entry = entries[0];
    const topXVisible = entry.isIntersecting;

    const floatClose = modal.querySelector('.close-float');
    if (!floatClose) return;

    if (topXVisible) {
      // top-right X visible → hide float (if eligible)
      floatClose.classList.add('is-hidden');
    } else {
      // top-right X NOT visible → show float (but only if expand has removed baseline)
      if (!floatClose.classList.contains('baseline')) {
        floatClose.classList.remove('is-hidden');
      }
    }
  }, {
    root: modal,
    rootMargin: '-90px 0px 0px 0px', // compensate fixed header
    threshold: 0
  });

  io.observe(sentinel);

  modal._sentinelObserver = io;
}


  return;
}


    // CLOSE buttons (GO BACK / X / any annotated)
    const closer = e.target.closest('[data-close-modal], .testim-modal-close');
    if (closer) {
      const modal = e.target.closest('.testim-modal');
      if (modal) closeModal(modal);
      return;
    }

    // fallback overlay close
    const modal = document.querySelector('.testim-modal:not(.is-hidden)');
    if (modal) {
      if (!e.target.closest('.testim') && !e.target.closest('.testim-bubble')) {
        closeModal(modal);
      }
    }


  });


// focus trap for testimonial modals
// focus trap for testimonial modals
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;

  const open = document.querySelector('.testim-modal:not(.is-hidden)');
  console.log('trap sees open modal =', open);
  if (!open) return;

  const focusables = open.querySelectorAll(
    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  if (!focusables.length) return;

  const first = focusables[0];
  const last  = focusables[focusables.length - 1];

  // SHIFT+TAB on first -> wrap to last
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  }
  // TAB on last -> wrap to first
  else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

// viewport resize re-check (one-time per open)
window.addEventListener('resize', () => {
  const modal = document.querySelector('.testim-modal:not(.is-hidden)');
  if (!modal) return;

  if (modal.dataset.resizeCount === "0") {
    modal.dataset.resizeCount = "1";
    checkHeight(modal);
  }
});



})();
export function initTestimModal () {
  // nothing needed — just a handshake
}

