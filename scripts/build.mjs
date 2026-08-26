import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'lightningcss';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = join(root, 'button-library.css');
const outputDirectory = join(root, 'dist');
const minifiedBudget = 20_000;
const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const source = await readFile(sourcePath);
const banner = `/*! BetterButtons v${packageJson.version} | MIT License | github.com/Alexsvensson99/BetterButtons */\n`;

function compile(minify) {
  const result = transform({
    filename: 'betterbuttons.css',
    code: source,
    minify
  });
  return Buffer.concat([Buffer.from(banner), result.code]);
}

function metadata(file) {
  return {
    bytes: file.byteLength,
    sha256: createHash('sha256').update(file).digest('hex')
  };
}

await mkdir(outputDirectory, { recursive: true });
const standard = compile(false);
const minified = compile(true);
if (minified.byteLength > minifiedBudget) {
  throw new Error(`Minified CSS is ${minified.byteLength} bytes, above the ${minifiedBudget}-byte budget.`);
}
await writeFile(join(outputDirectory, 'betterbuttons.css'), standard);
await writeFile(join(outputDirectory, 'betterbuttons.min.css'), minified);
await writeFile(
  join(outputDirectory, 'manifest.json'),
  `${JSON.stringify(
    {
      name: packageJson.name,
      version: packageJson.version,
      files: {
        'betterbuttons.css': metadata(standard),
        'betterbuttons.min.css': metadata(minified)
      }
    },
    null,
    2
  )}\n`
);

console.log(
  `Built BetterButtons ${packageJson.version}: ${standard.byteLength} bytes (${minified.byteLength} minified).`
);
