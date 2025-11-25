// scripts/fill-ALL.mjs
'use strict';

/* -------------------------------------------------------
   Shared helpers
------------------------------------------------------- */

// querySelectorAll that also includes the root if it matches
function qsaInclRoot(root, sel) {
  const nodes = Array.from(root.querySelectorAll(sel));
  if (root.matches && root.matches(sel)) nodes.unshift(root);
  return nodes;
}

// Apply generic data-attr-N + data-col-N pairs within a scope
// Policy: only set real attribute when current is empty; remove if CSV empty
function applyAttrPairsInScope(scope, row) {
  const attrNodes = qsaInclRoot(
    scope,
    '[data-attr-1],[data-attr-2],[data-attr-3],[data-attr-4],[data-attr-5]'
  );

  for (const el of attrNodes) {
    // Walk all attributes, pick those like data-attr-N
    for (const { name, value: attrName } of el.attributes) {
      const m = name.match(/^data-attr-(\d+)$/);
      if (!m) continue;

      const n = m[1]; // "1".."5"
      const colName = el.getAttribute(`data-col-${n}`);
      if (!colName) continue;

      const csvVal = row[colName];
      const current = el.getAttribute(attrName);

      // If CSV has a non-empty value, set real attr only if currently empty
      if (csvVal != null && String(csvVal).trim() !== '') {
        if (!current || current.trim() === '') {
          el.setAttribute(attrName, String(csvVal));
        }
      } else {
        // CSV empty → remove real attribute (avoid attr="")
        if (current !== null) el.removeAttribute(attrName);
      }
    }
  }
}

/* -------------------------------------------------------
   TABLE
------------------------------------------------------- */

export function fillTable(doc, row) {
  // Wrapper-agnostic: match any TRs for this key
  const trs = doc.querySelectorAll(`tr[data-key="${row.key}"]`);
  if (!trs.length) return;

  for (const tr of trs) {
    // text fills (only if currently empty)
    const slots = tr.querySelectorAll('[data-col]');
    for (const el of slots) {
      const col = el.dataset.col;
      const val = row[col];
      if (el.textContent.trim() !== '') continue;
      el.textContent = val ?? '';
    }

    // attribute pairs (generic)
    applyAttrPairsInScope(tr, row);
  }
}

/* -------------------------------------------------------
   MOBILE
------------------------------------------------------- */

export function fillMobile(doc, row) {
  const mob = doc.querySelector(`.past-mob-folder[data-key="${row.key}"]`);
  if (!mob) return;

  // text fills (only if currently empty)
  const slots = mob.querySelectorAll('[data-col]');
  for (const el of slots) {
    const col = el.dataset.col;
    const val = row[col];
    if (el.textContent.trim() !== '') continue;
    el.textContent = val ?? '';
  }

  // attribute pairs (generic)
  applyAttrPairsInScope(mob, row);
}

/* -------------------------------------------------------
   MODALS
------------------------------------------------------- */

export function fillModal(doc, row) {
  // Iterate EACH [data-key="N"] container separately (prevents cross-key stomping)
  const roots = doc.querySelectorAll(`[data-key="${row.key}"]`);
  for (const root of roots) {
    // text fills (scoped to this root only; only if empty)
    const textNodes = qsaInclRoot(root, '[data-col]');
    for (const el of textNodes) {
      const col = el.dataset.col;
      const val = row[col];
      if (el.textContent.trim() !== '') continue;
      el.textContent = val ?? '';
    }

    // attribute pairs (generic)
    applyAttrPairsInScope(root, row);
  }
}

/* -------------------------------------------------------
   ORCHESTRATION
------------------------------------------------------- */

export function fillOne(doc, row) {
  fillTable(doc, row);
  fillMobile(doc, row);
  fillModal(doc, row);
}

export function fillAll(doc, rows) {
  for (const row of rows) fillOne(doc, row);
}
