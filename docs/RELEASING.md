# Releasing BetterButtons

Only a maintainer with repository and package-registry authority performs a release. Publication is intentionally separate from continuous integration.

## Before release

1. Confirm the target commit is on `main` and the working tree is clean.
2. Review all changes under `Unreleased` in `CHANGELOG.md`.
3. Choose the semantic version based on the documented public CSS classes and tokens.
4. Update `package.json`, convert the changelog section to the version and release date, and regenerate the lockfile when package metadata affects it.
5. Run `npm ci` and `npm run check` on Node.js 24 LTS, then confirm CI passes on Node.js 22 and 24.
6. Inspect the tarball contents with `npm pack --dry-run` and verify the clean-consumer package test passed.
7. Confirm the npm package name and publishing account immediately before the first release.

Removing or renaming a documented class or token, changing its meaning, or changing documented cascade-layer priority requires a major version. Backward-compatible additions use a minor version; compatible fixes use a patch version.

## Create the release

1. In the reviewed release pull request, remove `"private": true` from `package.json`; this is the deliberate registry-publication gate.
2. Merge the reviewed release pull request.
3. Create an annotated `v<version>` tag on the verified `main` commit.
4. Push the tag and wait for the package workflow to validate it, run the full quality suite, then build the tarball, checksum and CycloneDX SBOM with the pinned npm CLI.
5. Download the artifact, verify `SHA256SUMS`, inspect the tarball and copy its lowercase SHA-256 value.
6. Confirm the repository is public and the protected `npm-production` environment is configured with a required review before registry publication.
7. Dispatch `publish.yml` from the exact tag with the reviewed SHA-256 value. The job rebuilds the tarball, rejects a hash mismatch, checks `BETTERBUTTONS_PUBLISH=v<version>` and publishes that inspected tarball with provenance.
8. Create a GitHub release from the same tag, attach the inspected tarball, checksum and SBOM, and paste the matching changelog notes.

Do not publish from an unreviewed branch, bypass failing checks or reuse a version that reached a registry.

## First npm release

The npm package does not exist until its first successful publish, so Trusted Publishing cannot be configured beforehand. Bootstrap `2.0.0` with this bounded exception:

1. The maintainer creates a short-lived granular npm token that is limited to package publication and explicitly permitted for the required 2FA policy.
2. Store it only as the `NPM_TOKEN` secret in the protected `npm-production` GitHub environment. Never commit or paste it into an issue, pull request, log or local project file.
3. Run the reviewed tag workflow once, approve the environment deployment and verify that npm displays provenance.
4. In the new npm package settings, configure GitHub Actions as the Trusted Publisher for `Alexsvensson99/BetterButtons`, workflow `publish.yml`, environment `npm-production`, with `npm publish` as the allowed action.
5. Delete the temporary environment secret and remove the `NODE_AUTH_TOKEN` line from the workflow in the immediate post-release commit. Future publishes then use short-lived OIDC credentials.

## After release

- Install the exact published version in a clean temporary project.
- Verify package exports, readable and minified CSS, and the quick-start markup.
- Confirm the GitHub release, tag and npm version all reference the same commit and version.
- Open a new `Unreleased` section in `CHANGELOG.md`.
- If verification fails, document the impact and use a new patch version; do not overwrite an existing release.
