'use strict';

// Attach to all .atp-wrap instances on the page (no unique IDs required)
export function initAtpAnimation() {
 // document.addEventListener('DOMContentLoaded', () => {
    const STARTPAUSE = 300;
    const PAUSE_2S = 2000;
    const PAUSE_8S = 8000;
    const FADE_MS  = 500;

    // util: sleep
    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    // util: fade helpers (work on any element with CSS transition on opacity)
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

    document.querySelectorAll('.atp-wrap').forEach((wrap) => {
      const trigger = wrap.querySelector('.atp-trigger');
      const frames = Array.from(wrap.querySelectorAll('.atp-frame'))
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
        await wait(PAUSE_2S);
        await fadeOut(frames[0], FADE_MS);
        await fadeIn(frames[1], FADE_MS);
        await wait(PAUSE_2S);
        await fadeOut(frames[1], FADE_MS);
        await fadeIn(frames[2], FADE_MS);
        await wait(PAUSE_8S);
        await fadeOut(frames[2], FADE_MS);
        resetLocal();
        running = false;
      }

      trigger.addEventListener('click', playSequence);
    });
 // });
}
