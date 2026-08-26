# BetterButtons

[![CI](https://github.com/Alexsvensson99/BetterButtons/actions/workflows/ci.yml/badge.svg)](https://github.com/Alexsvensson99/BetterButtons/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-7dd3a8.svg)](LICENSE)

BetterButtons is a dependency-free CSS button system with an accessible visual builder. Combine 20 themes, 12 styles, 6 sizes, 4 shapes and 10 motion options into up to 57,600 core class combinations, then copy production-ready HTML. The builder adapts markup for combinations such as icon-only circles.

The library has no runtime JavaScript and no framework dependency. The JavaScript in this repository powers only the documentation showcase and builder.

## Quick start

Use the checked-in source file directly:

```html
<link rel="stylesheet" href="button-library.css" />

<button type="button" class="bb-btn bb-ocean bb-solid bb-lg bb-pill bb-anim-shine">
  Ship it
  <span class="bb-btn-icon" aria-hidden="true">→</span>
</button>
```

Or import the built package from a bundler after the first npm release:

```bash
npm install betterbuttons
```

```css
@import 'betterbuttons';
```

The package build produces readable and minified stylesheets in `dist/`. The npm name was available when the release tooling was prepared, but it is not reserved until the first package is published.

## Build a button

Every button starts with `bb-btn`. Add one class from each family:

```html
<button type="button" class="bb-btn bb-violet bb-gradient bb-xl bb-pill bb-anim-glow bb-shadow">
  Explore the release
</button>
```

| Family  | Required    | Examples                                          |
| ------- | ----------- | ------------------------------------------------- |
| Theme   | Yes         | `bb-ocean`, `bb-emerald`, `bb-violet`             |
| Style   | Yes         | `bb-solid`, `bb-outline`, `bb-gradient`           |
| Size    | Yes         | `bb-xs` through `bb-2xl`                          |
| Shape   | Recommended | `bb-rounded`, `bb-square`, `bb-pill`, `bb-circle` |
| Motion  | Optional    | `bb-anim-shine`, `bb-anim-glow`, `bb-anim-none`   |
| Utility | Optional    | `bb-shadow`, `bb-block`, `bb-loading`             |

See the complete [CSS API](docs/API.md), [customization guide](docs/CUSTOMIZATION.md), [browser support](docs/BROWSER_SUPPORT.md) and [accessibility guidance](docs/ACCESSIBILITY.md).

## Accessible defaults

BetterButtons includes visible keyboard focus, disabled states, forced-colors support and reduced-motion fallbacks. Markup still matters:

- Add `type="button"` unless the button intentionally submits a form.
- Give icon-only buttons an accessible name with `aria-label`.
- Pair `bb-loading` with `disabled` and `aria-busy="true"`.
- Recheck contrast if you override color tokens or place a transparent style on a new surface.

Automated browser tests include axe checks, but automated checks cannot prove complete WCAG conformance.

## Run locally

The CSS has no runtime requirement. Repository development uses Node.js 24 LTS; CI also verifies Node.js 22 LTS. A current Chrome installation is needed for the default local browser suite.

```bash
npm ci
npm run serve
```

Open <http://localhost:4173>. For development and release checks:

```bash
npm run build
npm run test:unit
npm run test:browser
npm run test:visual
npm run check
```

`npm run check` formats, lints, tests the public CSS contract and size budget, runs browser accessibility, responsive and visual regression checks, and installs the packed tarball in a clean consumer project. See the [visual testing guide](docs/VISUAL_TESTING.md) before reviewing or updating screenshot baselines.

## Project map

```text
button-library.css       Public source stylesheet
dist/                    Deterministic package builds
index.html               Showcase, gallery and visual builder
styles.css               Showcase-only styles
app.js                   Showcase-only interactions
theme-init.js            Pre-paint light/dark theme initialization
examples/                Copyable integration examples
docs/                    API, accessibility and release guides
scripts/                 Build, server and package-audit tools
tests/                   Unit-contract, browser and reviewed visual tests
.github/                 CI, templates and dependency updates
```

## Contributing and support

Small fixes, new themes, accessibility improvements and documentation corrections are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md), check the [roadmap](ROADMAP.md), and use the issue templates before opening a pull request.

- Usage questions: [question issue form](https://github.com/Alexsvensson99/BetterButtons/issues/new?template=question.yml)
- Reproducible defects: [GitHub Issues](https://github.com/Alexsvensson99/BetterButtons/issues)
- Security concerns: follow [SECURITY.md](SECURITY.md) and do not open a public issue

The project follows semantic versioning for the packaged CSS API. Changes are tracked in [CHANGELOG.md](CHANGELOG.md), and maintainership is described in [GOVERNANCE.md](GOVERNANCE.md).

Repository preparation does not itself authorize public visibility or registry publication. Maintainers use the [public launch checklist](docs/PUBLIC_LAUNCH.md) and [provenance review](docs/PROVENANCE.md) for those separate decisions.

## License

BetterButtons is available under the [MIT License](LICENSE).
