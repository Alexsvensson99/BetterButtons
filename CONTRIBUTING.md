# Contributing to BetterButtons

Thanks for helping improve BetterButtons. The best contributions are focused, documented and easy to verify.

## Before opening a change

1. Search existing issues and merged pull requests.
2. Open an issue first for a new public class, removal, large visual change or behavior change.
3. Keep unrelated cleanup out of the pull request.
4. Never include credentials, private data, generated dependency folders or copied proprietary design assets.

Small typo, test and bug fixes can go directly to a pull request.

## Local setup

Use Node.js 24 LTS (see `.nvmrc`) and a current Chrome installation. CI also verifies the supported Node.js 22 LTS line.

```bash
git clone https://github.com/Alexsvensson99/BetterButtons.git
cd BetterButtons
npm ci
npm run check
```

Start the showcase with `npm run serve`, then open <http://localhost:4173>.

## Making a change

- Create a focused branch from `main`.
- Preserve the composable naming model: `bb-<theme>`, `bb-<style>`, `bb-<size>` and `bb-anim-<motion>`.
- Add or update contract tests when changing a public class or token.
- Include an accessible usage example for new patterns.
- Add a note under `Unreleased` in `CHANGELOG.md` for user-visible changes.
- Do not edit generated files in `dist/` by hand; run `npm run build`.

## Required checks

Run this before submitting:

```bash
npm run check
```

If a browser check fails, include the failure output and screenshot in the pull request. Visual changes should include desktop and narrow-screen screenshots. Read [docs/VISUAL_TESTING.md](docs/VISUAL_TESTING.md), inspect every changed baseline at full size and never update snapshots only to make CI pass.

## Pull requests

Explain the problem, the chosen approach and how you verified it. Maintainers may ask to split broad changes, adjust public naming or add accessibility coverage. All contributions are made under the repository's MIT License.

The repository's commit-identity privacy check applies only to the named maintainer. External contributors may use their own preferred Git identity.

## Community expectations

Be constructive and specific. Review [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before participating.
