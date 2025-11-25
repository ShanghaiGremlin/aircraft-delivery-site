// aboutDeck.js
export function initAboutDeck() {

// internal state (0..8) — default “historical #1” = chapter 2
let state = 1;

// card node list — 9 items in DOM order (chapter1..chapter9)
const cards = document.querySelectorAll('.about-desk-chapter');
const cap = document.querySelectorAll('.caption-hall figcaption');
const para = document.querySelectorAll('.pees');
const pickbar = document.querySelectorAll('.year-picker');
const track = document.querySelector('.about-desk-track');



const len = pickbar.length;
const start = len - 1;

pickbar.forEach((el, idx) => {
  el.dataset.state = (idx - start + len) % len;
});
// <<< END DROP >>>


// reset / place cards based on current state
function stateControl() {

  // strip all classes from all cards
  for (let i = 0; i < 9; i++) {
    cards[i].classList.remove(
      "center","left-1","left-2","right-1","right-2","is-hidden"
    );
  }

 // apply correct bucket per state
for (let i = 0; i < 9; i++) {
  const caption = cap[i];
  const paragr = para[i]
  const yp = pickbar[(i + start) % pickbar.length];

  // default: captions hidden every tick
  caption?.classList.add('is-faded');
  yp?.classList.remove('bold');
  paragr?.classList.add('is-hidden')
 
  const offset = (i - state + 9) % 9;

  if (offset === 0) {
    cards[i].classList.add('center');
    caption?.classList.remove('is-faded');
    yp?.classList.add('bold');
    paragr?.classList.remove('is-hidden')

  } else if (offset === 1) {
    cards[i].classList.add('right-1');
  } else if (offset === 2) {
    cards[i].classList.add('right-2');
  } else if (offset === 8) {
    cards[i].classList.add('left-1'); // -1
  } else if (offset === 7) {
    cards[i].classList.add('left-2'); // -2
  } else {
    cards[i].classList.add('is-hidden');
    // caption already hidden by default line above
  }
 }

}
// mutation helpers
function goNext() {
  state = (state + 1) % 9;
  stateControl();
}

function goPrev() {
  state = (state + 9 - 1) % 9;
  stateControl();
}

// button wiring

// arrow keys (horizontal)
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') goPrev();
  if (e.key === 'ArrowRight') goNext();
});

// swipe (desktop only)
let swipeX = null;
const SWIPE_TRIGGER = 60; // px

track.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'mouse') return; // desktop only
  swipeX = e.clientX; 
    track.style.cursor = "grabbing"
}, { passive:true });


track.addEventListener('pointerup', (e) => {
  if (e.pointerType !== 'mouse') return;
  if (swipeX === null) return;
track.style.cursor = "grab"
  const diff = e.clientX - swipeX;
  swipeX = null;

  if (Math.abs(diff) < SWIPE_TRIGGER) return;

  if (diff < 0) goNext();
  else          goPrev();
  
}, { passive:true });




// year picker clicks — handles both simple + wheel pickers
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-state]');
  if (!el) return;
  state = parseInt(el.dataset.state, 10);
  stateControl();
});

// ENTER / SPACE activates same data-state elements
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const el = e.target.closest('[data-state]');
  if (!el) return;
  e.preventDefault();
  state = parseInt(el.dataset.state, 10);
  stateControl();
});


let lastWheel = 0;
const WHEEL_LOCK_MS = 140;

document.addEventListener('wheel', (e) => {
  const now = performance.now();
  if (now - lastWheel < WHEEL_LOCK_MS) return;
  lastWheel = now;

  if (e.deltaY > 0) goNext();
  else if (e.deltaY < 0) goPrev();
}, { passive: true });


// initial draw
stateControl();
  }


