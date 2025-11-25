'use strict';

let _bound = false;

export function initMenu() {
  if (_bound) return;
  _bound = true;

  // -------------------- Config --------------------
  const FADE_MS = 1000;                // match your CSS fade duration
  const DESKTOP_MQ = '(min-width: 751px)';

  // -------------------- Elements ------------------
  const btn       = document.getElementById('burger');
  const overlay   = document.getElementById('menu-overlay');
  const panel     = document.getElementById('menu-panel');
  const backdrop  = document.querySelector('.menu-panel-backdrop');
  const closeBtns = Array.from(document.querySelectorAll('[data-menu-close], .mob-menupanel-float'));

  if (!btn || !overlay || !panel) {
    console.warn('Menu toggle: button or menu not found.');
    return;
  }

  // -------------------- Helpers -------------------
  const isOpen = () => btn.getAttribute('aria-expanded') === 'true';

  const firstFocusable = (root) => root.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const preventScroll = (e) => {
    // Allow inside the menu panel, block everywhere else
    if (!panel.contains(e.target)) e.preventDefault();
  };

  const lockScroll = (on) => {
    if (on) {
      document.body.classList.add('scroll-lock');
      document.documentElement.classList.add('scroll-lock');
      window.addEventListener('touchmove', preventScroll, { passive: false });
      window.addEventListener('wheel', preventScroll, { passive: false });
    } else {
      document.body.classList.remove('scroll-lock');
      document.documentElement.classList.remove('scroll-lock');
      window.removeEventListener('touchmove', preventScroll, { passive: false });
      window.removeEventListener('wheel', preventScroll, { passive: false });
    }
  };

  const openMenu = () => {
    btn.setAttribute('aria-expanded', 'true');

    // Ensure starting hidden state (for safe transition)
    overlay.classList.add('is-hidden');
    overlay.setAttribute('aria-hidden', 'true');
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('inert', '');

    // Force paint of hidden state
    void overlay.offsetWidth;

    // Flip visible + interactive
    overlay.classList.remove('is-hidden');
    overlay.removeAttribute('aria-hidden');
    panel.removeAttribute('inert');
    panel.setAttribute('aria-hidden', 'false');

    lockScroll(true);

    const target = firstFocusable(panel) || panel;
    target.focus({ preventScroll: true });

    startWidth = window.innerWidth;
  };

  const closeMenu = () => {
    btn.setAttribute('aria-expanded', 'false');
    overlay.classList.add('is-hidden');

    setTimeout(() => {
      overlay.setAttribute('aria-hidden', 'true');
      panel.setAttribute('aria-hidden', 'true');
      panel.setAttribute('inert', '');
      lockScroll(false);
      btn.focus({ preventScroll: true });
    }, FADE_MS);
  };

  const toggleMenu = () => (isOpen() ? closeMenu() : openMenu());

  // -------------------- Wiring --------------------
  btn.addEventListener('click', toggleMenu);

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      if (isOpen()) closeMenu();
    });
  }

  closeBtns.forEach(el =>
    el?.addEventListener('click', () => {
      if (isOpen()) closeMenu();
    })
  );

  document.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape' && isOpen()) closeMenu();
  });

  // Any width change closes
  let startWidth = window.innerWidth;
  let resizeTimer;

  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (isOpen() && window.innerWidth !== startWidth) closeMenu();
      startWidth = window.innerWidth;
    }, 150);
  };

  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  window.addEventListener('pageshow', () => { startWidth = window.innerWidth; });

  // Close on breakpoint crossing (intent-aware)
  const mq = window.matchMedia(DESKTOP_MQ);
  mq.addEventListener('change', (e) => {
    if (e.matches && isOpen()) closeMenu();
  });
}
