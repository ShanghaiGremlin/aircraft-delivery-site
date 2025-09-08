## Fixed Header Pattern (Static, No JS)

**What we use**
- `<header class="desk-header" role="banner">` identical on every page.
- Primary nav: `<nav class="desk-nav" aria-label="Primary">…</nav>`
- Current page marked statically with `aria-current="page"` on the matching link.
- Page content wrapper: `<main id="main" tabindex="-1">…</main>`

**CSS invariants**
- Header is fixed: `.desk-header { position: fixed; top: 0; left: 0; right: 0; width: 100%; z-index: 1000; }`
- Offset applied to `#main` only:
  ```css
  /* keep this LAST in style.css */
  #main {
    padding-top: calc(var(--header-h) + env(safe-area-inset-top, 0px));
    padding-block-start: calc(var(--header-h) + env(safe-area-inset-top, 0px));
  }
  :target { scroll-margin-top: calc(var(--header-h) + env(safe-area-inset-top, 0px)); }
