# BetterButtons agent instructions

## Playwright on macOS

- In Codex on macOS, request browser/GUI process permission before the first command that can launch Playwright. This includes `npm run check`, `npm run test:browser`, `npm run test:visual`, `npm run test:visual:update`, and direct `playwright` or `npx playwright` commands.
- Never probe browser startup inside the Codex seatbelt sandbox. The repository guard intentionally stops before launching a browser there.
- If output mentions `Sandbox`, `LaunchServices`, `WindowServer`, `MachPortRendezvousServer`, `_RegisterApplication`, or `browserType.launch`, stop the whole browser suite. Do not retry individual tests until the permission context has changed.
- Keep non-GUI checks in the normal workspace sandbox.
