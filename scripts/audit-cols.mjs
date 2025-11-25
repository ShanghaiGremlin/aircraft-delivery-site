import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

// usage: node scripts/audit-cols.mjs 52
const KEY = process.argv[2];
if (!KEY) {
  console.error("Usage: node scripts/audit-cols.mjs <key>");
  process.exit(1);
}

const html = readFileSync("past-deliveries-ALL.html", "utf8");
const json = JSON.parse(readFileSync("data/past-deliveries.json", "utf8"));
const row  = json.find(r => String(r.key) === String(KEY));
if (!row) {
  console.error(`No JSON row found for key ${KEY}`);
  process.exit(1);
}

const dom = new JSDOM(html);
const doc = dom.window.document;

const rootSel = `[data-key="${KEY}"]`;

// --- collect text slots
const textEls = Array.from(doc.querySelectorAll(`${rootSel} [data-col], ${rootSel}[data-col]`));
const textCols = new Map();
for (const el of textEls) {
  const col = el.dataset.col || "(missing data-col)";
  textCols.set(col, (textCols.get(col) || 0) + 1);
}

// --- collect attribute slots
const attrEls = Array.from(doc.querySelectorAll(
  `${rootSel} [data-attr-1],` +
  `${rootSel} [data-attr-2],` +
  `${rootSel} [data-attr-3],` +
  `${rootSel} [data-attr-4],` +
  `${rootSel} [data-attr-5]`
));
const attrMaps = [];
for (const el of attrEls) {
  const name = el.dataset.attr1 || el.dataset.attr2 || el.dataset.attr3 || el.dataset.attr4 || el.dataset.attr5;
  const col  = el.dataset.col1  || el.dataset.col2  || el.dataset.col3  || el.dataset.col4  || el.dataset.col5;
  attrMaps.push({ name, col, ok: !!(col && (col in row)) });
}

// --- compare against JSON keys
const jsonKeys = new Set(Object.keys(row));
const htmlCols = new Set([...textCols.keys()].filter(k => k !== "(missing data-col)"));
const missingInJSON = [...htmlCols].filter(k => !jsonKeys.has(k));
const unusedJSON    = [...jsonKeys].filter(k => !htmlCols.has(k) && !k.startsWith("fig_") && k !== "key");

// --- output
console.log(`\n[REPORT] key ${KEY}`);
console.log(`Text slots found: ${textEls.length}  | Unique data-col: ${htmlCols.size}\n`);
for (const [col, count] of textCols.entries()) {
  const ok = (col !== "(missing data-col)") && jsonKeys.has(col);
  console.log(`  - ${col}  x${count}  ${ok ? "" : " <-- not in JSON or missing"}`);
}

console.log(`\nAttribute mappings under key ${KEY}: (${attrEls.length} total)`);
for (const m of attrMaps) {
  console.log(`  - ${m.name} ⇐ ${m.col} ${m.ok ? "" : " <-- BAD (missing/unknown col)"}`);
}

console.log("\nHTML uses data-cols not present in JSON:");
console.log(missingInJSON.length ? "  " + missingInJSON.join(", ") : "  (none)");

console.log("\nJSON keys not referenced by any [data-col] in this key (ignoring fig_* and key):");
console.log(unusedJSON.length ? "  " + unusedJSON.join(", ") : "  (none)");

console.log("\nSection counts for sanity:");
const table = doc.querySelectorAll(`#filler-tmp-body tr[data-key="${KEY}"] [data-col]`).length;
const mobile = doc.querySelectorAll(`.past-mob-folder[data-key="${KEY}"] [data-col]`).length;
const modal = doc.querySelectorAll(`.img-modal[data-key="${KEY}"] [data-col]`).length;
console.log(`  table: ${table} | mobile: ${mobile} | modal: ${modal}\n`);
