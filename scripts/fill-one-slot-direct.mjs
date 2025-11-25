// /scripts/fill-one-slot-direct.mjs
'use strict';

import fs from 'fs/promises';
import path from 'path';

const FILE_HTML = './past-deliveries-ALL.html';
const FILE_JSON = './data/past-deliveries.json';

const KEY  = '52';
const COL  = 'fig_1_srcset';
const ATTR = 'srcset';

(async () => {
  try {
    const [htmlRaw, jsonRaw] = await Promise.all([
      fs.readFile(FILE_HTML, 'utf8'),
      fs.readFile(FILE_JSON, 'utf8'),
    ]);

    const records = JSON.parse(jsonRaw);
    const rec = records.find(r => String(r.key) === KEY);
    if (!rec) throw new Error(`Record ${KEY} not found`);
    const newVal = (rec[COL] ?? '').trim();
    if (!newVal) throw new Error(`Empty field ${COL}`);

    // --- find start of this record and the target img tag
    const keyPos = htmlRaw.indexOf(`data-key="${KEY}"`);
    if (keyPos === -1) throw new Error(`data-key="${KEY}" not found`);
    const imgPos = htmlRaw.indexOf('data-col-1="fig_1_srcset"', keyPos);
    if (imgPos === -1) throw new Error(`data-col-1="fig_1_srcset" not found after key ${KEY}`);
    const tagStart = htmlRaw.lastIndexOf('<img', imgPos);
    const tagEnd = htmlRaw.indexOf('>', imgPos);
    if (tagStart === -1 || tagEnd === -1) throw new Error('img tag boundaries not found');
    const imgTag = htmlRaw.slice(tagStart, tagEnd + 1);

    // --- replace or add srcset
    const srcsetRe = /\bsrcset\s*=\s*(["'])(.*?)\1/i;
    const newTag = srcsetRe.test(imgTag)
      ? imgTag.replace(srcsetRe, `srcset="${newVal}"`)
      : imgTag.replace(/>$/, ` srcset="${newVal}">`);

    // --- splice directly
    const newHtml = htmlRaw.slice(0, tagStart) + newTag + htmlRaw.slice(tagEnd + 1);

    await fs.writeFile(FILE_HTML, newHtml, 'utf8');
    console.log(`[FILL OK] key=${KEY} col=${COL} → ${ATTR}="${newVal}"`);
    console.log('Updated:', path.resolve(FILE_HTML));
  } catch (e) {
    console.error('[FILL ERROR]', e.message);
    process.exitCode = 1;
  }
})();
