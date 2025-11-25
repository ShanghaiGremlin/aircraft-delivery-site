
'use strict';

export function initImageModal() {
  if (window.__IMG_MODAL_INIT__) return;
  window.__IMG_MODAL_INIT__ = true;

  const THUMB_SELECTOR = '.modal-thumb';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  ready(() => {
    document.addEventListener('click', (e) => {
      const thumb = e.target.closest(THUMB_SELECTOR);
      if (!thumb) return;

      e.preventDefault();

      // Get the ID of the target modal
      const modalId = thumb.dataset.modalTarget;
      if (!modalId) {
        console.warn('[image-modal] missing data-modal-target on trigger');
        return;
      }

      const modal = document.getElementById(modalId);
      if (!modal) {
        console.warn('[image-modal] modal not found:', modalId);
        return;
      }

      // Unhide and mark as active
      modal.hidden = false;
      modal.classList.remove('is-hidden');
      modal.setAttribute('aria-hidden', 'false');
      modal.focus();

      // reveal the main figure inside the modal
const fig = modal.querySelector('figure.modalfig');
if (fig) {
  fig.classList.remove('is-hidden');
}

      const body = document.body;
  body.style.overflowY = 'hidden';
  body.style.height = '100%';






    });

// --- close logic (bound once globally) ---
document.addEventListener('click', (e) => {
  const modal = e.target.closest('.img-modal');
  if (!modal) return;

  // Close if clicking backdrop or any [data-close-modal] / .img-modal-close
  if (
    e.target.classList.contains('img-modal') ||
    e.target.classList.contains('img-modal-close') ||
    e.target.hasAttribute('data-close-modal')
  ) {
    e.preventDefault();

    const fig = modal.querySelector('figure.modalfig');
    if (fig) fig.classList.add('is-hidden');

    modal.setAttribute('aria-hidden', 'true');
    modal.classList.add('is-hidden');
    modal.hidden = true;

    // use document.body here (no reliance on inner-scope 'body')
    document.body.style.overflowY = 'auto';
    document.body.style.height = 'auto';

    console.log('[image-modal] closed:', modal.id);
  }
});    
// optional: close on Esc (bound once)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const openModal = document.querySelector('.img-modal:not([hidden])');
    if (openModal) {
      const fig = openModal.querySelector('figure.modalfig');
      if (fig) fig.classList.add('is-hidden');
      openModal.setAttribute('aria-hidden', 'true');
      openModal.classList.add('is-hidden');
      openModal.hidden = true;
      console.log('[image-modal] closed via Esc:', openModal.id);
    }
  }
});
  });
};
