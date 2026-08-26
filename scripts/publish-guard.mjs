import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function verifyPublishGuard({ approval, packageJson }) {
  if (packageJson.private) {
    throw new Error('Registry publication is locked: package.json is still marked private.');
  }

  const expectedApproval = `v${packageJson.version}`;
  if (approval !== expectedApproval) {
    throw new Error(`Set BETTERBUTTONS_PUBLISH=${expectedApproval} only inside the approved release job.`);
  }
}

const isMainModule = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainModule) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  verifyPublishGuard({ approval: process.env.BETTERBUTTONS_PUBLISH, packageJson });
  console.log(`Registry publication unlocked for v${packageJson.version}.`);
}
