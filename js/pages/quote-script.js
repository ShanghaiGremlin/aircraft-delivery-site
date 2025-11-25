
import { initFlipbook } from '../modules/flipbook.js';
import { initQuoteButtons } from '../modules/quote-buttons.js';
import { initArmview, initPopback } from '../modules/armview.js?v=20251115-3';
import { initQuoteModal } from '../modules/quote-modal.js';
import { initQuoteMobShowform } from '../modules/quote-mob-showform.js';

initFlipbook();
initQuoteButtons();
initArmview();
initQuoteModal();
initPopback();
initQuoteMobShowform();





function initupdateOfficeTime() {
  const officeTimeEl = document.getElementById("quote-callme-office-time");
  const dayWrapEl = document.getElementById("quote-callme-office-daywrap");
  const dayEl = document.getElementById("quote-callme-office-day");

  // Guard clauses so it fails quietly if markup changes
  if (!officeTimeEl || !dayWrapEl || !dayEl) return;

  const officeTZ = "America/Los_Angeles";
  const nowLocal = new Date();

  // Format the current time at the office (LA)
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    timeZone: officeTZ,
    hour: "numeric",
    minute: "2-digit"
  });
  const officeTimeString = timeFormatter.format(nowLocal);
  officeTimeEl.textContent = officeTimeString;

  // Helper: get Y/M/D in a given time zone, ignoring time-of-day
  function getYMDInTZ(date, timeZone) {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    const parts = formatter.formatToParts(date);
    const ymd = {};
    for (const part of parts) {
      if (part.type === "year") ymd.year = Number(part.value);
      if (part.type === "month") ymd.month = Number(part.value) - 1; // JS months 0–11
      if (part.type === "day") ymd.day = Number(part.value);
    }
    return ymd;
  }

  // Build "midnight" dates in each zone so we only compare whole days
  const local = nowLocal;
  const localMidnight = new Date(local.getFullYear(), local.getMonth(), local.getDate());

  const officeYMD = getYMDInTZ(nowLocal, officeTZ);
  const officeMidnight = new Date(officeYMD.year, officeYMD.month, officeYMD.day);

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((officeMidnight - localMidnight) / msPerDay);
  // diffDays < 0 → office is behind local
  // diffDays > 0 → office is ahead of local

  let label = null;
  if (diffDays === 0) label = "today";
  else if (diffDays === -1) label = "yesterday";
  else if (diffDays === 1) label = "tomorrow";

  if (label) {
    dayEl.textContent = label;
    dayWrapEl.style.display = ""; // ensure visible
  } else {
    // If for some reason it's more than 1 day off, hide the wrapper
    dayWrapEl.style.display = "none";
  }
}

initupdateOfficeTime();