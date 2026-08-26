import { rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
await rm(join(root, 'dist'), { recursive: true, force: true });
await rm(join(root, 'playwright-report'), { recursive: true, force: true });
await rm(join(root, 'test-results'), { recursive: true, force: true });
console.log('Removed generated build and test artifacts.');
