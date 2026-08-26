# Public launch checklist

Repository readiness and public release are separate decisions. Complete every unchecked owner item immediately before launch.

## Prepared in the repository

- [x] MIT license and public API documentation
- [x] Contribution, conduct, support, security and governance policies
- [x] Deterministic readable and minified CSS builds
- [x] Isolated clean-consumer package audit
- [x] Lint, unit, WCAG contrast, axe, keyboard, motion, forced-colors and responsive checks
- [x] Reviewed desktop, mobile, light, dark, builder and forced-colors visual baselines
- [x] SHA-pinned GitHub Actions with read-only default permissions
- [x] Tag/version/changelog release guard
- [x] Tarball checksum and CycloneDX SBOM generation
- [x] Registry publication remained locked with `"private": true` until the reviewed `2.0.0` release branch
- [x] A second publication guard requires exact version-bound release approval

## Owner decisions before public visibility

- [ ] Confirm the provenance attestation in [PROVENANCE.md](PROVENANCE.md).
- [x] Use `2.0.0` as the first public package version.
- [ ] Recheck and reserve `betterbuttons`, or choose an npm scope.
- [ ] Confirm a private conduct-reporting contact method.
- [ ] Enable GitHub Discussions and private vulnerability reporting.
- [x] Keep the initial showcase repository-local; no separate canonical hosting URL for `2.0.0`.
- [ ] Review the exact commit, repository description, topics and public README.
- [ ] Explicitly approve changing the GitHub repository from private to public.

## Owner decisions before npm publication

- [ ] Configure npm Trusted Publishing or another approved least-privilege release method.
- [ ] Protect the release environment and require review.
- [x] Convert `Unreleased` to a dated version in `CHANGELOG.md`.
- [x] Remove `"private": true` in the reviewed release pull request.
- [ ] Verify the tag equals `v${package.version}` and inspect the generated artifact.
- [ ] Install the published version in a clean consumer before announcing it.
