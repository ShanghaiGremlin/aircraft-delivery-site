import { initAboutDeck } from '../modules/aboutdeck.js';
import { initAboutBrickfade } from '../modules/about-brickfade.js';

initAboutDeck();
initAboutBrickfade();

// about-script.js
// Hint nudge controller: fires a short L-R-L wiggle on hover,
// up to `maxHints` times total (persisted in localStorage).
// Call from main.js:  import { initAboutNudgeHints } from './about-script.js'; initAboutNudgeHints();

export function initAboutNudgeHints({
  containerSelector = '.about-deck',
  trackSelector = '.about-desk-track',
  maxHints = 2,          // 1 = first hover only; 2 or 3 = first/second/third hover
  hintDuration = 500,    // ms; should be >= CSS animation length (450ms above)
  cooldown = 2000,       // ms; prevent rapid re-triggers
  storageKey = 'aboutSwipeHintsShown' 
} = {}) {
  // desktop-only (don’t hint on touch/tablet)
  const allowHints = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!allowHints) return;

  const container = document.querySelector(containerSelector);
  const track = container?.querySelector(trackSelector);
  if (!container || !track) return;

  // how many times we’ve shown the hint across sessions
  let shown = parseInt(localStorage.getItem(storageKey) || '0', 10);
  if (shown >= maxHints) return;

  let cooling = false;

  const fireHint = () => {
    if (cooling) return;
    if (shown >= maxHints) return;

    container.classList.add('is-hinting');

    // remove class after animation window
    window.setTimeout(() => {
      container.classList.remove('is-hinting');
    }, hintDuration);

    // persist count and start cooldown
    shown += 1;
    localStorage.setItem(storageKey, String(shown));
    cooling = true;
    window.setTimeout(() => { cooling = false; }, cooldown);
  };

  // Trigger on first/second/third hover (as configured)
  const onMouseEnter = () => {
    if (shown < maxHints) fireHint();
  };

  container.addEventListener('mouseenter', onMouseEnter, { passive: true });
  
  // Optional: expose a quick reset for testing in console
  // window.resetAboutNudgeHints = () => localStorage.removeItem(storageKey);
  
}

queueMicrotask(() => initAboutNudgeHints());


