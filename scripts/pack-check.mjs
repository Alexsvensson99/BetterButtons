import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { verifyPackageFileSet } from './package-files.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'betterbuttons-pack-'));
const isolatedCache = join(temporaryDirectory, 'npm-cache');

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      npm_config_cache: isolatedCache,
      npm_config_update_notifier: 'false'
    }
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed:\n${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

try {
  run('npm', ['run', 'build'], root);
  const output = run(
    'npm',
    ['pack', '--json', '--ignore-scripts', '--pack-destination', temporaryDirectory],
    root
  );
  const [pack] = JSON.parse(output);
  verifyPackageFileSet(pack.files.map((file) => file.path));

  const tarball = join(temporaryDirectory, basename(pack.filename));
  const consumerDirectory = join(temporaryDirectory, 'consumer');
  await mkdir(consumerDirectory);
  run('npm', ['init', '--yes'], consumerDirectory);
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball], consumerDirectory);
  const installedPackage = JSON.parse(
    await readFile(join(consumerDirectory, 'node_modules', 'betterbuttons', 'package.json'), 'utf8')
  );
  const installedManifest = JSON.parse(
    await readFile(join(consumerDirectory, 'node_modules', 'betterbuttons', 'dist', 'manifest.json'), 'utf8')
  );
  const installedDirectory = join(consumerDirectory, 'node_modules', 'betterbuttons', 'dist');
  const readableCss = await readFile(join(installedDirectory, 'betterbuttons.css'));
  const minifiedCss = await readFile(join(installedDirectory, 'betterbuttons.min.css'));

  if (installedPackage.version !== installedManifest.version) {
    throw new Error('Installed package version does not match its build manifest.');
  }
  if (!readableCss.includes('.bb-btn') || !minifiedCss.includes('.bb-btn')) {
    throw new Error('Installed CSS exports do not contain the BetterButtons base class.');
  }
  if (minifiedCss.byteLength >= readableCss.byteLength) {
    throw new Error('Minified CSS must be smaller than the readable build.');
  }
  for (const [fileName, contents] of [
    ['betterbuttons.css', readableCss],
    ['betterbuttons.min.css', minifiedCss]
  ]) {
    const metadata = installedManifest.files[fileName];
    const sha256 = createHash('sha256').update(contents).digest('hex');
    if (metadata.bytes !== contents.byteLength || metadata.sha256 !== sha256) {
      throw new Error(`Installed ${fileName} does not match its build manifest.`);
    }
  }

  console.log(
    `Package audit passed: ${pack.filename}, ${pack.entryCount} files, ${pack.size} compressed bytes.`
  );
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
