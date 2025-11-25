'use strict';

export function initCfiAnimation() {
 // document.addEventListener('DOMContentLoaded', () => {
    const STARTPAUSE = 300;
    const PAUSE_1S = 1000;
    const PAUSE_2S = 2000;
    const PAUSE_8S = 8000;
    const FADE_MS  = 500;

    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    function fadeIn(el, duration = FADE_MS) {
      el.hidden = false;
      el.style.transition = `opacity ${duration}ms ease-in-out`;
      el.style.opacity = 0;
      requestAnimationFrame(() => { el.style.opacity = 1; });
      return wait(duration);
    }

    function fadeOut(el, duration = FADE_MS) {
      el.style.transition = `opacity ${duration}ms ease-in-out`;
      el.style.opacity = 0;
      return wait(duration).then(() => { el.hidden = true; });
    }

    function makeFrameLink(el, hash = '#cfi-explanation') {
      let resolve;
      const activated = new Promise(r => (resolve = r));
      el.style.pointerEvents = 'auto';
      el.style.cursor = 'pointer';
      el.setAttribute('role', 'link');
      el.setAttribute('aria-label', 'Learn more about this CFI animation');
      if (!el.hasAttribute('tabindex')) el.tabIndex = 0;

      const onClick = (e) => { e.preventDefault(); resolve('activated'); };
      const onKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); resolve('activated'); }
      };
      el.addEventListener('click', onClick);
      el.addEventListener('keydown', onKeyDown);

      function cleanup() {
        el.style.pointerEvents = 'none';
        el.style.cursor = '';
        el.removeAttribute('role');
        el.removeAttribute('aria-label');
        el.removeAttribute('tabindex');
        el.removeEventListener('click', onClick);
        el.removeEventListener('keydown', onKeyDown);
      }

      function navigate() {
        const id = hash.replace('#', '');
        const target = document.getElementById(id);
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          target.focus({ preventScroll: true });
        } else {
          window.location.hash = hash;
        }
      }

      return { activated, cleanup, navigate };
    }

    function cut(outEl, inEl) {
      outEl.style.transition = 'none';
      inEl.style.transition = 'none';
      outEl.hidden = true;
      outEl.style.opacity = 0;
      inEl.hidden = false;
      inEl.style.opacity = 1;
      return Promise.resolve();
    }

    document.querySelectorAll('.cfi-wrap').forEach((wrap) => {
      const trigger = wrap.querySelector('.cfi-trigger');
      const frames = Array.from(wrap.querySelectorAll('.cfi-frame'))
        .sort((a, b) => (+a.dataset.frame) - (+b.dataset.frame));

      if (!trigger || frames.length < 3) return;

      let running = false;

      function resetLocal() {
        trigger.hidden = false;
        trigger.style.opacity = 1;
        trigger.style.transition = 'none';
        frames.forEach(f => {
          f.hidden = true;
          f.style.opacity = 0;
          f.style.transition = 'none';
        });
      }

      async function playSequence() {
        if (running) return;
        running = true;
        resetLocal();

        await wait(STARTPAUSE);
        await fadeOut(trigger, FADE_MS);
        await fadeIn(frames[0], FADE_MS);
        await wait(PAUSE_1S);
        await fadeOut(frames[0], FADE_MS);
        await fadeIn(frames[1], FADE_MS);
        await wait(PAUSE_2S);
        await fadeOut(frames[1], FADE_MS);
        await fadeIn(frames[2], FADE_MS);
        await wait(PAUSE_2S);
        await fadeOut(frames[2], FADE_MS);
        await fadeIn(frames[3], FADE_MS);
        await wait(PAUSE_2S);
        await fadeOut(frames[3], FADE_MS);
        await fadeIn(frames[4], FADE_MS);
        await wait(PAUSE_1S);
        await fadeOut(frames[4], FADE_MS);
        await fadeIn(frames[5], FADE_MS);
        await wait(PAUSE_1S);

        await cut(frames[5], frames[6]);
        const last = frames[frames.length - 1];
        const { activated, cleanup, navigate } = makeFrameLink(last, '#cfi-explanation');
        const result = await Promise.race([activated, wait(PAUSE_8S)]);
        cleanup();
        if (result === 'activated') navigate();
        await fadeOut(last, FADE_MS);
        resetLocal();
        running = false;
      }

      trigger.addEventListener('click', playSequence);
    });
 // });
}
