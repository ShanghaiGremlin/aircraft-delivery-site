// /scripts/fill-key52-paired.mjs
'use strict';

import fs from 'fs/promises';

const FILE_HTML = 'C:/Users/Public/Documents/Web Design/aircraft-delivery-site/past-deliveries-ALL.html';
const FILE_JSON = 'C:/Users/Public/Documents/Web Design/aircraft-delivery-site/data/past-deliveries.json';
const KEY = '52';

function findEnclosingDiv(html, keyPos) {
  // back up to the '<div' that owns this data-key
  let divStart = html.lastIndexOf('<div', keyPos);
  if (divStart === -1) throw new Error('Owning <div not found before data-key');
  // walk forward to its matching </div> by counting nested divs
  let i = divStart, depth = 0;
  while (i < html.length) {
    const nextOpen  = html.indexOf('<div', i);
    const nextClose = html.indexOf('</div>', i);
    if (nextClose === -1) throw new Error('Unclosed div');
    if (nextOpen !== -1 && nextOpen < nextClose) { depth++; i = nextOpen + 4; }
    else { depth--; i = nextClose + 6; if (depth < 0) return { start: divStart, end: i }; }
  }
  throw new Error('Matching </div> not found');
}

(async () => {
  try {
    const [html, json] = await Promise.all([
      fs.readFile(FILE_HTML, 'utf8'),
      fs.readFile(FILE_JSON, 'utf8'),
    ]);

    const records = JSON.parse(json);
    const rec = records.find(r => String(r.key) === KEY);
    if (!rec) throw new Error(`record ${KEY} not in JSON`);

    // anchor on the exact data-key token (insensitive to spaces/indentation elsewhere)
    const keyPos = html.indexOf(`data-key="${KEY}"`);
    if (keyPos === -1) throw new Error(`data-key="${KEY}" not found`);

    // get the full folder block that *contains* that data-key
    const { start, end } = findEnclosingDiv(html, keyPos);
    let block = html.slice(start, end);

    // replace each paired data-attr-N / data-col-N inside this block
    // works across one-line or multi-line attributes
    const pairRE = /data-attr-(\d+)="([^"]+)"([\s\S]*?)data-col-\1="([^"]+)"/gi;
    let changed = false;
    block = block.replace(pairRE, (m, n, attr, mid, col) => {
      const val = (rec[col] ?? '').toString().trim();
      if (!val) return m; // no data for this col; skip
      // replace attr="...": only inside the same tag (up to first '>')
      const tagEnd = mid.indexOf('>');
      const head = tagEnd === -1 ? mid : mid.slice(0, tagEnd);
      const tail = tagEnd === -1 ? ''  : mid.slice(tagEnd);
      const attrRE = new RegExp(`(${attr}\\s*=\\s*")[^"]*(")`, 'i');
      let newHead;
      if (attrRE.test(head)) {
        newHead = head.replace(attrRE, `$1${val}$2`);
      } else {
        newHead = head.replace(/$/, ` ${attr}="${val}"`);
      }
      changed = true;
      return `data-attr-${n}="${attr}"` + newHead + tail + `data-col-${n}="${col}"`;
    });

    if (!changed) throw new Error('No paired attributes updated');

    const newHtml = html.slice(0, start) + block + html.slice(end);
    await fs.writeFile(FILE_HTML, newHtml, 'utf8');
    console.log(`[FILL OK] data-key=${KEY}: paired attributes written from JSON`);
  } catch (e) {
    console.error('[FILL ERROR]', e.message);
    process.exitCode = 1;
  }
})();
