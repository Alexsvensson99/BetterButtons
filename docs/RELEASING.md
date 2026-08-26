# Releasing BetterButtons

Only a maintainer with repository and package-registry authority performs a release. Publication is intentionally separate from continuous integration.

## Before release

1. Confirm the target commit is on `main` and the working tree is clean.
2. Review all changes under `Unreleased` in `CHANGELOG.md`.
3. Choose the semantic version based on the documented public CSS classes and tokens.
4. Update `package.json`, convert the changelog section to the version and release date, and regenerate the lockfile when package metadata affects it.
5. Run `npm ci` and `npm run check` on Node.js 24 LTS, then confirm CI passes on Node.js 22 and 24.
6. Inspect the tarball contents with `npm pack --dry-run` and verify the clean-consumer package test passed.
7. Confirm package ownership and verify that npm Trusted Publishing still maps exactly to `Alexsvensson99/BetterButtons`, workflow `publish.yml`, environment `npm-production` and the `npm publish` action.

Removing or renaming a documented class or token, changing its meaning, or changing documented cascade-layer priority requires a major version. Backward-compatible additions use a minor version; compatible fixes use a patch version.

## Create the release

1. Prepare a reviewed release change with the selected version, dated changelog entry and regenerated lockfile when needed.
2. Land the reviewed commit on `main` while preserving the maintainer's GitHub noreply identity.
3. Create an annotated `v<version>` tag on the verified `main` commit.
4. Push the tag and wait for the package workflow to validate it, run the full quality suite, then build the tarball, checksum and CycloneDX SBOM with the pinned npm CLI.
5. Download the artifact, verify `SHA256SUMS`, inspect the tarball and copy its lowercase SHA-256 value.
6. Confirm the repository is public and the protected `npm-production` environment is configured with a required review before registry publication.
7. Dispatch `publish.yml` from the exact tag with the reviewed SHA-256 value. The job rebuilds the tarball, rejects a hash mismatch, checks `BETTERBUTTONS_PUBLISH=v<version>` and publishes that inspected tarball with provenance.
8. Create a GitHub release from the same tag, attach the inspected tarball, checksum and SBOM, and paste the matching changelog notes.

Do not publish from an unreviewed branch, bypass failing checks or reuse a version that reached a registry.

## Trusted Publishing

BetterButtons publishes through npm Trusted Publishing. The workflow receives a short-lived OIDC credential from GitHub Actions and contains no npm access token.

- npm trusts only `Alexsvensson99/BetterButtons`, workflow `publish.yml`, environment `npm-production` and the `npm publish` action.
- The workflow retains `id-token: write`, runs on a GitHub-hosted runner and invokes `npm publish` directly.
- The protected `npm-production` environment requires maintainer approval before publication.
- Package publishing requires 2FA and disallows bypass-2FA tokens.
- No `NPM_TOKEN` repository or environment secret is required.

The one-time token used to bootstrap `2.0.0` was revoked after the package provenance, Trusted Publisher mapping and restrictive publishing policy were verified. Do not recreate a long-lived publishing token as part of the normal release procedure.

## After release

- Install the exact published version in a clean temporary project.
- Verify package exports, readable and minified CSS, and the quick-start markup.
- Confirm the GitHub release, tag and npm version all reference the same commit and version.
- Open a new `Unreleased` section in `CHANGELOG.md`.
- If verification fails, document the impact and use a new patch version; do not overwrite an existing release.
