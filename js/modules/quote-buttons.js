// js/modules/quote-buttons.js

// --- AUDIO: preload click sound ---
const buttonClickSound = new Audio('/assets/audio/click.mp3');
buttonClickSound.preload = 'auto';

export function initQuoteButtons() {

  document.addEventListener("change", (e) => {
    const radio = e.target;

    if (radio.type !== "radio") return;

    if (
      radio.name !== "button-group-size" &&
      radio.name !== "button-group-length"
    ) {
      return;
    }

    console.log(
      `%c[radio-change] name="${radio.name}" value="${radio.value}" checked=${radio.checked}`,
      "color: orange; font-weight: bold;"
    );

    const selectedSizeEl = document.querySelector(
      'input[name="button-group-size"]:checked'
    );
    const selectedLengthEl = document.querySelector(
      'input[name="button-group-length"]:checked'
    );

    if (!selectedSizeEl || !selectedLengthEl) {
      console.log("[radio-read] one or both groups not selected yet");
      return;
    }

    const selectedSize = Number(selectedSizeEl.value);
    const selectedLength = Number(selectedLengthEl.value);

    if (Number.isNaN(selectedSize) || Number.isNaN(selectedLength)) {
      console.log("[radio-read] one or both values are NaN");
      return;
    }

    const targetCase = buttonselectCases(selectedSize, selectedLength);

    if (!targetCase && targetCase !== 0) return;

    goToCase(targetCase);
  });

  // SOUND: play only when a button becomes checked
document.addEventListener('change', (e) => {
  if (!e.isTrusted) return;                    // only real user events
  if (!(e.target instanceof HTMLInputElement)) return;
  if (e.target.type !== 'radio') return;
  if (!e.target.name.startsWith('button-')) return;

  // Transition check: only fire if it *just* became checked
  if (e.target.checked) {
    buttonClickSound.currentTime = 0;          // rewind for rapid clicks
    buttonClickSound.play().catch(() => {});
  }
}, { capture: false });


  function buttonselectCases(size, length) {
    const lookup = {
      "0-3": 2,
      "0-4": 3,
      "0-5": 4,
      "1-3": 5,
      "1-4": 6,
      "1-5": 7,
      "2-3": 8,
      "2-4": 9,
      "2-5": 10
    };

    return lookup[`${size}-${length}`] ?? null;
  }

  // ------------------------------------------------------------
  // MOVE FLIPBOOK
  // ------------------------------------------------------------
  let isFlipping = false;

  function goToCase(targetCase) {
    if (isFlipping) return;

    const current = window.flipbook.currentLocation;
    const diff = targetCase - current;

    if (diff === 0) return;

    const steps = Math.abs(diff);
    const goingForward = diff > 0;

    isFlipping = true;

    carryoutRepeat(diff, () => {
      if (goingForward) window.flipbook.programmaticNext();
      else window.flipbook.programmaticPrev();
    });
  }

  // ------------------------------------------------------------
  // REPEATER
  // ------------------------------------------------------------
  function carryoutRepeat(length, callback, delayMs = 300) {
    if (length === 0) {
      isFlipping = false;
      return;
    }

    function stepDown() {
      const nextLength = length - 1;

      callback();
      length = nextLength;

      if (nextLength === 0) {
        isFlipping = false;
        return;
      }

      setTimeout(stepDown, delayMs);
    }

    function stepUp() {
      const nextLength = length + 1;

      callback();
      length = nextLength;

      if (nextLength === 0) {
        isFlipping = false;
        return;
      }

      setTimeout(stepUp, delayMs);
    }

    if (length > 0) stepDown();
    else stepUp();
  }
}
