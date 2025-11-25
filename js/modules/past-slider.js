// /js/modules/past-slider.js
// Past Deliveries slider — site-specific, idempotent, no internal DOMContentLoaded.
// Assumes main.js (router) calls initPastSlider() on the /past-deliveries page.

'use strict';

let _bound = false;         // idempotency guard
let slides = [];
let idx = 0;
let cycles = 0;
let timer = null;
let running = false;
let rootRegion = null;

const CONFIG = {
  intervalMs: 8000,          // 8 seconds
  maxCycles: 1,              // 1 = run through once, stop on last slide
  slideSel: '.past-slider-grid', // ONE element per slide (adjust if needed)
  containerSel: '.past-slider',  // outer container
  activeClass: 'active',
  regionLabel: 'Past deliveries highlights',
};

const mqReduced = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : null;

function $all(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function setHidden(el, hidden) {
  // Keep layout decisions CSS-driven; just a11y here.
  el.setAttribute('aria-hidden', hidden ? 'true' : 'false');
  try { el.inert = !!hidden; } catch {}
}

function clearTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

function setActive(nextIdx) {
  if (!slides.length) return;
  if (nextIdx === idx) return;

  const prev = slides[idx];
  const next = slides[nextIdx];

  prev.classList.remove(CONFIG.activeClass);
  setHidden(prev, true);

  next.classList.add(CONFIG.activeClass);
  setHidden(next, false);

  idx = nextIdx;
}

function scheduleNext() {
  clearTimer();

  const onLastSlide = idx === slides.length - 1;
  const atFinalCycle = cycles >= (CONFIG.maxCycles - 1);

  // Stop if no movement possible or we've finished the configured cycles.
  if (slides.length <= 1 || (onLastSlide && atFinalCycle)) {
    running = false;
    return;
  }

  timer = window.setTimeout(() => {
    let nextIdx = idx + 1;

    // Wrap handling + cycle accounting
    if (nextIdx >= slides.length) {
      cycles += 1;
      if (cycles >= CONFIG.maxCycles) {
        // Stay on last slide and stop
        running = false;
        return;
      }
      nextIdx = 0;
    }

    setActive(nextIdx);
    scheduleNext();
  }, CONFIG.intervalMs);
}

function initOnce() {
  if (slides.length) return; // already initialized

  // Collect slides
  slides = $all(CONFIG.slideSel);
  if (!slides.length) return;

  // Best-effort region labeling for SR users
  rootRegion =
    slides[0].closest('[data-slider-region]') ||
    slides[0].closest(CONFIG.containerSel)?.parentElement ||
    slides[0].parentElement;

  if (rootRegion) {
    rootRegion.setAttribute('role', 'region');
    rootRegion.setAttribute('aria-roledescription', 'carousel');
    if (!rootRegion.getAttribute('aria-label')) {
      rootRegion.setAttribute('aria-label', CONFIG.regionLabel);
    }
  }

  // Initialize per-slide roles and visibility; detect initial active
  slides.forEach((el, i) => {
    el.setAttribute('role', 'group');
    el.setAttribute('aria-roledescription', 'slide');
    el.setAttribute('aria-label', `Slide ${i + 1} of ${slides.length}`);

    if (el.classList.contains(CONFIG.activeClass)) {
      idx = i;
      setHidden(el, false);
    } else {
      setHidden(el, true);
    }
  });

  // Ensure exactly one active
  slides.forEach((s, i) => s.classList.toggle(CONFIG.activeClass, i === idx));
}

function start() {
  initOnce();
  if (!slides.length) return;

  // Respect reduced motion: show the first active and do nothing.
  if (mqReduced && mqReduced.matches) {
    running = false;
    return;
  }

  if (running) return;
  running = true;
  scheduleNext();
}

function stop() {
  running = false;
  clearTimer();
}

function goTo(targetIndex) {
  initOnce();
  if (!slides.length) return;
  const clamped = Math.max(0, Math.min(slides.length - 1, targetIndex | 0));
  setActive(clamped);
  if (running) scheduleNext();
}

function getState() {
  return { index: idx, total: slides.length, cycles, running };
}

// Pause/resume on tab visibility
document.addEventListener('visibilitychange', () => {
  if (!slides.length) return;
  if (document.hidden) {
    clearTimer();
  } else if (running) {
    scheduleNext();
  }
});

// Public API for debug/controls
if (typeof window !== 'undefined') {
  window.PAST_SLIDER = { start, stop, goTo, getState };
}

export function initPastSlider() {
  if (_bound) return;
  _bound = true;

  // all DOM queries happen inside initOnce(); no extra gates here
  start(); // start immediately; respects reduced motion + maxCycles
}
