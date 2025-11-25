// scripts/duplicate-past-proto.mjs
// Dumb duplicator: duplicates three gated blocks in proto order, replaces [KEY], no other changes.
// Uses JSON (array of rows) as the data source.

import fs from "fs";

// --- CONFIG (point srcPath to your pre-dupe proto that contains all three gates) ---
const srcPath  = "./past-test.html";               // <-- set to your curated proto (one file with TABLE/MOBILE/MODAL gates)
const jsonPath = "./data/past-deliveries.json";     // <-- your JSON array with objects that include `key`
const ts = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 13);
const outPath  = `./past-deliveries-proto-dup-${ts}.html`;

// --- Gate markers (must match proto literally) ---
const GATES = [
  { name: "TABLE",  start: "<!--TABLE START-->",  end: "<!--TABLE END-->"  },
  { name: "MOBILE", start: "<!--MOBILE START-->", end: "<!--MOBILE END-->" },
  { name: "MODAL",  start: "<!--MODAL START-->",  end: "<!--MODAL END-->"  },
];

// --- helpers ---
function sliceBetween(text, start, end) {
  const i1 = text.indexOf(start);
  if (i1 === -1) throw new Error(`Start gate not found: ${start}`);
  const i2 = text.indexOf(end, i1 + start.length);
  if (i2 === -1) throw new Error(`End gate not found after ${start}: ${end}`);
  if (i2 <= i1) throw new Error(`Gate ordering issue between ${start} and ${end}`);
  return {
    block: text.slice(i1 + start.length, i2),
    startIndex: i1,
    endIndex: i2 + end.length,
  };
}

function duplicateBlock(rawBlock, keysDesc) {
  // Verbatim duplication: only replace [KEY]. No other mutations.
  let out = "";
  for (const k of keysDesc) {
    out += rawBlock.replaceAll("[KEY]", String(k));
  }
  return out;
}

// --- Read inputs ---
const proto = fs.readFileSync(srcPath, "utf8");
const rows  = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
if (!Array.isArray(rows) || !rows.length) throw new Error("JSON did not contain a non-empty array.");

// --- Collect keys, sort DESC numerically (e.g., 52..1) ---
const keys = rows
  .map(r => String(r.key ?? "").trim())
  .filter(k => k !== "")
  .sort((a, b) => Number(b) - Number(a)); // numeric DESC, no padding

if (!keys.length) throw new Error("No valid `key` values found in JSON.");

// --- Find blocks in source *in proto order* and duplicate them ---
const blocksFound = GATES
  .map(g => ({ ...g, ...sliceBetween(proto, g.start, g.end) }))
  .sort((a, b) => a.startIndex - b.startIndex); // preserve proto order

let result = "";
for (const g of blocksFound) {
  result += duplicateBlock(g.block, keys);
}

// --- Write output (gates removed by design) ---
fs.writeFileSync(outPath, result, "utf8");

// --- Report ---
const modalCount = (result.match(/class="img-modal"/g) || []).length;
console.log(`✅ Wrote ${outPath}`);
console.log(`   Blocks duplicated (proto order): ${blocksFound.map(b => b.name).join(" → ")}`);
console.log(`   Keys: ${keys.length} (descending, first=${keys[0]})`);
console.log(`   img-modal count (sanity): ${modalCount}`);
