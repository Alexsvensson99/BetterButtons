# Changelog

All notable changes to BetterButtons are documented here. The project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- A maintainer-specific commit-identity privacy check that blocks non-noreply author or committer metadata without echoing rejected addresses.
- A canonical HTTPS link to the live visual builder in the public README and package metadata.
- Copyable React, Vue and Svelte integration examples that preserve native button and accessible loading semantics.
- A standalone Arabic RTL example plus a direction control in the visual builder.
- Automated contracts for logical geometry, RTL rendering and expanded forced-colors states.
- Shareable builder configurations stored in a URL fragment, with reset and Copy share link controls. The copied fragment stays local to the URL and includes a custom label only when explicitly copied.
- Semantic builder exports for HTML, React/JSX, Vue and Svelte.
- Public `--bb-focus-ring-color` and `--bb-focus-ring-offset-color` tokens with unchanged default focus styling.
- A dedicated RTL visual regression and a documented manual 2.1 release check for keyboard, zoom, screen reader, direction and real forced-colors or high-contrast coverage when available.

### Changed

- Updated launch, release, contribution and roadmap documentation for the completed 2.0 publication.
- Replaced physical group, split, badge and loading geometry with writing-mode-aware logical properties.
- Mirrored directional shine and slide motion in right-to-left contexts.
- Strengthened control borders, focus treatment, disabled states, badges and loading indicators for increased-contrast and forced-colors preferences.

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
