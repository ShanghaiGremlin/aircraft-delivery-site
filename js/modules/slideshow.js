export function initSlideshow() {
// =======================
// CONFIG knobs
// =======================
const SLIDE_COUNT    = 5;
const SLIDE_DURATION = 8000;
const REPEAT_COUNT   = 3;     // set Infinity for endless loop

// =======================
// state
// =======================
const wrap   = document.getElementById('services-slideshow');
  if (!wrap) { console.warn('[slideshow] abort: #services-slideshow not found at init'); return; }
  const slides = Array.from(wrap.children);


let index      = 0;
let cyclesDone = 0;
let allowNav   = false;
let isStopped  = false;
let timer      = null;

// =======================
// viewport gate
// =======================
const isDesktop = () => window.matchMedia('(min-width: 1400px)').matches;

// =======================
// init view
// =======================
slides.forEach((el, i) => el.classList.toggle('is-faded', i !== 0));

// =======================
// helpers
// =======================
function show(i){
  slides.forEach((el,k)=> el.classList.toggle('is-faded', k !== i));
}

function stopShow(){
  isStopped = true;
  if (timer){ clearInterval(timer); timer = null; }
}

function startAuto(){
  if (!timer && !isStopped){
    timer = setInterval(goNext, SLIDE_DURATION);
  }
}

function pauseAuto(){
  if (timer){ clearInterval(timer); timer = null; }
}

// =======================
// navigation
// =======================
function goNext(){
  if (isStopped) return;

  let next = index + 1;

  if (next >= SLIDE_COUNT){
    next = 0;
    cyclesDone += 1;

    if (cyclesDone >= REPEAT_COUNT){
      stopShow();
      return;
    }
  }

  index = next;
  show(index);
}

function goPrev(){
  if (isStopped) return;
  index = (index - 1 + SLIDE_COUNT) % SLIDE_COUNT;
  show(index);
}

// =======================
// autoplay begin
// =======================
startAuto();


// =======================
// mouse enter / leave (desktop only)
// =======================
wrap.addEventListener('mouseenter', () => {
  if (!isDesktop()) return;

  allowNav = true;
  document.body.style.overflowY = 'hidden';

  // reset to last pass (one cycle remaining)
  cyclesDone = Math.max(REPEAT_COUNT - 1, 0);

  pauseAuto();
}, { passive:true });

wrap.addEventListener('mouseleave', () => {
  if (!isDesktop()) return;

  allowNav = false;
  document.body.style.overflowY = 'auto';
  startAuto(); // resume
}, { passive:true });


// =======================
// wheel nav (desktop only)
// =======================
document.addEventListener('wheel', (e) => {
  if (!isDesktop()) return;
  if (!allowNav) return;
  if (e.deltaY > 0) goNext();
  else              goPrev();
}, { passive:true });


// =======================
// swipe nav (desktop only; mouse pointers only)
// =======================
let swipeX = null;
const SWIPE_TRIGGER = 60;

wrap.addEventListener('pointerdown', (e) => {
  if (!isDesktop()) return;
  if (!allowNav) return;
  if (e.pointerType !== 'mouse') return;

  swipeX = e.clientX;
  wrap.style.cursor = 'grabbing';
}, { passive:true });

wrap.addEventListener('pointerup', (e) => {
  if (!isDesktop()) return;
  if (!allowNav) return;
  if (e.pointerType !== 'mouse') return;
  if (swipeX === null) return;

  wrap.style.cursor = 'grab';

  const diff = e.clientX - swipeX;
  swipeX = null;

  if (Math.abs(diff) < SWIPE_TRIGGER) return;

  if (diff < 0) goNext();
  else          goPrev();
}, { passive:true });


// =======================
// keyboard (desktop only)
// =======================
document.addEventListener('keydown', (e) => {
  if (!isDesktop()) return;
  if (!allowNav) return;

  if (e.key === 'ArrowRight') goNext();
  if (e.key === 'ArrowLeft')  goPrev();
});


// =======================
// respond to viewport changes
// =======================
window.addEventListener('resize', () => {
  // Update cursor affordance
  wrap.style.cursor = isDesktop() ? 'grab' : 'auto';

  // If we just dropped below desktop, kill any interactive state
  if (!isDesktop()) {
    allowNav = false;
    document.body.style.overflowY = 'auto';
    swipeX = null;
  }
}, { passive:true });
}
