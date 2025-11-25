import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const proto = readFileSync("past-deliveries-ALL.html", "utf8");
const dom = new JSDOM(proto);
const doc = dom.window.document;

// helper to show code points of suspicious text
function codes(s) {
  return [...s].map(ch => "U+" + ch.codePointAt(0).toString(16).toUpperCase().padStart(4,"0")).join(" ");
}

let count = 0;

// check ALL data-col holders (both descendants and direct cells)
const nodes = doc.querySelectorAll('[data-col], [data-col] *[data-col]'); // broad
for (const el of nodes) {
  const col = el.getAttribute("data-col");
  const keyHost = el.closest("[data-key]");
  const key = keyHost?.getAttribute("data-key") ?? "(no-key)";
  const raw = el.textContent ?? "";
  const trimmed = raw.trim();

  if (trimmed !== "") {
    // report first 50 to keep output sane
    if (count < 50) {
      console.log(
        `[NON-EMPTY] key=${key} col=${col} | text=${JSON.stringify(raw)} | codes=${codes(raw)}`
      );
    }
    count++;
  }
}

console.log(`\nTotal non-empty data-col nodes found: ${count}`);
