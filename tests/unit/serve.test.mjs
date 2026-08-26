import assert from 'node:assert/strict';
import { mkdir, mkdtemp, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  createPreviewServer,
  isAllowedHost,
  isAllowedOrigin,
  resolveRequestPath
} from '../../scripts/serve.mjs';

async function createFixture(t) {
  const parent = await mkdtemp(join(tmpdir(), 'betterbuttons-serve-'));
  const fixtureRoot = join(parent, 'root');
  await mkdir(fixtureRoot);
  await writeFile(join(fixtureRoot, 'index.html'), '<h1>BetterButtons</h1>');
  await writeFile(join(fixtureRoot, 'styles.css'), 'body { color: black; }');
  t.after(() => rm(parent, { force: true, recursive: true }));
  return { fixtureRoot, parent };
}

function sendRequest(port, path, { headers = {}, method = 'GET' } = {}) {
  return new Promise((resolve, reject) => {
    const client = request(
      {
        headers: { Host: `127.0.0.1:${port}`, ...headers },
        host: '127.0.0.1',
        method,
        path,
        port
      },
      (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () =>
          resolve({
            body: Buffer.concat(chunks).toString('utf8'),
            headers: response.headers,
            statusCode: response.statusCode
          })
        );
      }
    );
    client.on('error', reject);
    client.end();
  });
}

async function startServer(t, rootDirectory) {
  const server = createPreviewServer({ rootDirectory });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return server.address().port;
}

test('only exact local authorities are accepted', () => {
  assert.equal(isAllowedHost('127.0.0.1:4173', 4173), true);
  assert.equal(isAllowedHost('localhost:4173', 4173), true);
  assert.equal(isAllowedHost('attacker.invalid:4173', 4173), false);
  assert.equal(isAllowedHost('localhost.attacker.invalid:4173', 4173), false);
  assert.equal(isAllowedHost('127.0.0.1:8080', 4173), false);
  assert.equal(isAllowedOrigin(undefined, 4173), true);
  assert.equal(isAllowedOrigin('http://127.0.0.1:4173', 4173), true);
  assert.equal(isAllowedOrigin('http://localhost:4173', 4173), true);
  assert.equal(isAllowedOrigin('https://localhost:4173', 4173), false);
  assert.equal(isAllowedOrigin('http://attacker.invalid:4173', 4173), false);
});

test('the resolver exposes only canonical public files', async (t) => {
  const { fixtureRoot } = await createFixture(t);
  assert.equal(await resolveRequestPath('/', fixtureRoot), await realpath(join(fixtureRoot, 'index.html')));
  assert.equal(
    await resolveRequestPath('/styles.css', fixtureRoot),
    await realpath(join(fixtureRoot, 'styles.css'))
  );
  assert.equal(await resolveRequestPath('/.git/config', fixtureRoot), null);
  assert.equal(await resolveRequestPath('/package.json', fixtureRoot), null);
  assert.equal(await resolveRequestPath('/D:%5Csecret%5Cfile', fixtureRoot), null);
  assert.equal(await resolveRequestPath('//attacker.invalid/index.html', fixtureRoot), null);
});

test('the resolver rejects an allowlisted symlink outside its root', async (t) => {
  const { fixtureRoot, parent } = await createFixture(t);
  const outside = join(parent, 'outside.css');
  await writeFile(outside, 'secret');
  await rm(join(fixtureRoot, 'styles.css'));
  await symlink(outside, join(fixtureRoot, 'styles.css'));
  assert.equal(await resolveRequestPath('/styles.css', fixtureRoot), null);
});

test('the server rejects hostile requests and stays alive after malformed input', async (t) => {
  const { fixtureRoot } = await createFixture(t);
  const port = await startServer(t, fixtureRoot);

  const publicResponse = await sendRequest(port, '/');
  assert.equal(publicResponse.statusCode, 200);
  assert.match(publicResponse.body, /BetterButtons/);

  const hostileHost = await sendRequest(port, '/', { headers: { Host: `attacker.invalid:${port}` } });
  assert.equal(hostileHost.statusCode, 403);

  const hiddenFile = await sendRequest(port, '/.git/config');
  assert.equal(hiddenFile.statusCode, 404);

  const malformed = await sendRequest(port, '/%');
  assert.equal(malformed.statusCode, 400);

  const stillAlive = await sendRequest(port, '/', { method: 'HEAD' });
  assert.equal(stillAlive.statusCode, 200);
  assert.equal(stillAlive.body, '');
});
