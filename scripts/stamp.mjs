import { readFileSync, writeFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { fillOne } from "./fill-ALL.mjs";


console.log("[STAMP] boot");

// load
const proto = readFileSync("past-deliveries-proto-dup-2025110304081.html", "utf8");
const json  = JSON.parse(readFileSync("data/past-deliveries.json", "utf8"));

// dom
const dom  = new JSDOM(proto);
const doc  = dom.window.document;

for (const row of json) fillOne(doc, row);


// TEMP sanity check for one record (wrapper-agnostic)
{
  const k = '52';
  const t = doc.querySelectorAll(`tr[data-key="${k}"] [data-col], tr[data-key="${k}"][data-col]`).length;
  const m = doc.querySelectorAll(`.past-mob-folder[data-key="${k}"] [data-col], .past-mob-folder[data-key="${k}"][data-col]`).length;
  const d = doc.querySelectorAll(`.img-modal[data-key="${k}"] [data-col], .img-modal[data-key="${k}"][data-col]`).length;
  console.log(`[CHK] key ${k} counts -> table:${t} mobile:${m} modal:${d}`);
}

// Probe a real text slot (testimonial body) rather than an attribute target
console.log(
  "[PROBE51 blockquote]",
  doc.querySelector('#past-modal-51-t blockquote[data-col="blockquote"]')?.textContent?.slice(0, 120)
);

{
  const el = doc.querySelector('#filler-tmp-body tr[data-key="51"] [data-col="comments"]');
  console.log("[PROBE51 comments]", el?.textContent.slice(0,200));
}

writeFileSync("past-deliveries-STAMPED.html", dom.serialize(), "utf8");
console.log("[STAMP] wrote STAMPED");