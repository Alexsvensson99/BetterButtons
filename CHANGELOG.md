# Changelog

All notable changes to BetterButtons are documented here. The project follows [Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-08-24

### Added

- Publishable, dependency-free CSS package with readable and minified builds.
- Complete visual builder for all 20 themes, 12 styles, 6 sizes, 4 shapes and 10 motion options.
- Loading and full-width builder controls with copy-ready accessible markup.
- Unit-contract, browser, accessibility, responsive and clean-consumer package tests.
- Reviewed cross-platform visual regression baselines for desktop, mobile, theme, builder and forced-colors states.
- Automated WCAG AA contrast checks for every solid, soft and gradient theme surface.
- A 20 kB minified CSS budget to catch accidental package bloat.
- Open-source governance, contribution, security, support and release documentation.
- GitHub issue forms, pull request template, continuous integration and dependency updates.

### Changed

- Renamed the product and package to BetterButtons throughout the user-facing project.
- Improved system theme behavior, keyboard navigation, icon rendering, forced-colors support and reduced-motion handling.

### Fixed

- Generated buttons now include `type="button"` to avoid unintended form submission.
- Circle buttons now generate icon-only content with an accessible name.
- Hardened the local preview server against DNS rebinding, unintended repository-file disclosure, cross-platform path traversal, symlink escapes and malformed-URL crashes.
