
export function initArmview() {
  const words = document.querySelector(".dotwords");
  if (!words) return;

  const p1  = document.getElementById("p1");
  const p10 = document.getElementById("p10");
  if (!p1 || !p10) return;

  const p1Flipped  = p1.classList.contains("flipped");
  const p10Flipped = p10.classList.contains("flipped");

  if (p10Flipped) {
    words.classList.remove("armed");
    return;
  }

  if (p1Flipped) {
    words.classList.add("armed");
    return;
  }

  words.classList.remove("armed");
}

// ------------------------------------------------------------
// POPBACK for VIEW ESTIMATES button
// ------------------------------------------------------------
export function initPopback() {
  const inputs = document.querySelectorAll(
    'input[name="button-view-estimates"]'
  );
  if (!inputs.length) return;

  inputs.forEach((input) => {
    input.addEventListener("change", (e) => {
      if (!e.target.checked) return;

      setTimeout(() => {
        input.checked = false;
        input.classList.add("not-checked");
      }, 3000);
    });
  });
}
