// FULL FILE: /js/main.js
'use strict';
console.log('[BOOT] main.js module loaded');


// ===== ROUTER BOOTSTRAP =====
window.__ROUTER_AC?.abort();
window.__ROUTER_AC = new AbortController();
const RSIG = { signal: window.__ROUTER_AC.signal };


// ===== SINGLE DOMContentLoaded HANDLER =====
document.addEventListener('DOMContentLoaded', () => {}, RSIG);

import { initMenu } from './modules/menu.js';

  initMenu();

// ===== UTIL: get this script's ?v= so dynamic imports match =====
function getVersionQuery() {
  const thisScript =
    document.currentScript ||
    [...document.scripts].find(s => /\/js\/main\.js(\?|$)/.test(s.src));
  return (thisScript && thisScript.src.includes('?'))
    ? '?' + thisScript.src.split('?')[1]
    : '';
}
const __VER_QS = getVersionQuery();

// ===== ROUTER =====
function startRouter() {
  console.count('[router] start');

  // Normalize path (strip trailing slash(es))
  const path = location.pathname.replace(/\/+$/, '') || '/';

  const route = matchRoute(path);
  if (route) {
    loadOnce(route.key, route.module);
  } else {
    console.log('[router] no route for', path);
  }
}


// ===== ROUTE TABLE =====
// If a module isn't present on disk, the import is safely caught (warns once).
const ROUTES = [
  { key: 'home',            paths: ['/', '/index'],                    module: '/js/pages/index-script.js' },
  { key: 'about',           paths: ['/about'],                          module: '/js/pages/about-script.js' },
  { key: 'services',        paths: ['/services'],                        module: '/js/pages/services-script.js' },
  { key: 'quote',           paths: ['/quote'],                           module: '/js/pages/quote-script.js?v=2' },
  { key: 'join',            paths: ['/join-pilot-roster'],               module: '/js/pages/join-pilot-roster-script.js' },
  { key: 'past',         paths: ['/past', '/past-deliveries'],        module: '/js/pages/past-deliveries-script.js' },
  { key: 'pilotDirectory',  paths: ['/pilot-directory'],                 module: '/js/pages/pilot-directory-script.js' },
  { key: 'testimonials',    paths: ['/testimonials'],                    module: '/js/pages/testimonials-script.js' },
];

// ===== LOADER (once per key) =====
const __PAGE_LOADED = Object.create(null);
function loadOnce(key, modulePath) {
  if (__PAGE_LOADED[key]) return;
  __PAGE_LOADED[key] = true;
  const url = modulePath + __VER_QS;
  console.log('[router] import', url);
  // No await needed; we don't need returned exports synchronously.
  import(url).catch(err => {
    console.warn(`[router] failed to import ${url}`, err);
  });
}

// ===== MATCHER =====
function matchRoute(path) {
  for (const r of ROUTES) {
    if (r.paths.includes(path)) return r;
  }
  return null;
}

startRouter();
