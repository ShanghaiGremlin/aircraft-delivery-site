# Changelog
All notable changes to this project will be documented in this file.
This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and uses [SemVer](https://semver.org/).

## [header-static-v1] - 2025-09-05
### Added
- Static header on all pages; `.desk-header` (role="banner"), `.desk-nav` (aria-label="Primary"), skip link first.
- Banded `--header-h` and canonical `#main` offset (+ safe-area).
### Removed
- JS header injection, layout-manipulation, and old spacer CSS.
### Changed
- `aria-current="page"` set statically per page.

## header-static-v1 — Static Desktop Header
- Replaced JS-injected header with static header on every page
- Added banded `--header-h` and canonical `#main` offset (+ safe-area)
- Standardized header markup: `.desk-header` (role="banner"), `.desk-nav` (aria-label="Primary"), skip link first
- `aria-current="page"` set statically per page (no runtime JS)
- Removed injector code, placeholders, and obsolete header CSS
- Anchors & scroll respect fixed header (`:target`, `[id]`, `html{scroll-padding-top}`)
