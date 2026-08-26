import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const modulePath = fileURLToPath(import.meta.url);
const root = resolve(join(dirname(modulePath), '..'));
const publicFiles = new Set([
  'app.js',
  'button-library.css',
  'dist/betterbuttons.css',
  'dist/betterbuttons.min.css',
  'dist/manifest.json',
  'examples/quick-start.html',
  'favicon.svg',
  'index.html',
  'styles.css',
  'theme-init.js'
]);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8'
};

function parseLocalAuthority(value, port, includeProtocol) {
  if (typeof value !== 'string' || value.length === 0) return false;

  try {
    const parsed = new URL(includeProtocol ? value : `http://${value}`);
    const expectedPort = String(port);
    const actualPort = parsed.port || (parsed.protocol === 'http:' ? '80' : '443');
    return (
      parsed.protocol === 'http:' &&
      (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost') &&
      actualPort === expectedPort &&
      parsed.username === '' &&
      parsed.password === '' &&
      parsed.pathname === '/' &&
      parsed.search === '' &&
      parsed.hash === ''
    );
  } catch {
    return false;
  }
}

export function isAllowedHost(value, port) {
  return parseLocalAuthority(value, port, false);
}

export function isAllowedOrigin(value, port) {
  return value === undefined || parseLocalAuthority(value, port, true);
}

export async function resolveRequestPath(url, baseRoot = root) {
  if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) return null;

  const parsed = new URL(url, 'http://localhost');
  if (parsed.origin !== 'http://localhost') return null;

  const pathname = decodeURIComponent(parsed.pathname);
  if (pathname.includes('\\') || pathname.includes('\0')) return null;

  const requestPath = pathname === '/' ? 'index.html' : pathname.slice(1);
  if (!publicFiles.has(requestPath)) return null;

  try {
    const canonicalRoot = await realpath(baseRoot);
    const candidate = resolve(canonicalRoot, requestPath);
    const canonicalTarget = await realpath(candidate);
    if (canonicalTarget !== candidate) return null;

    const file = await stat(canonicalTarget);
    return file.isFile() ? canonicalTarget : null;
  } catch {
    return null;
  }
}

function writeText(response, statusCode, message, extraHeaders = {}) {
  response
    .writeHead(statusCode, {
      'Content-Type': 'text/plain; charset=utf-8',
      ...extraHeaders
    })
    .end(message);
}

function listeningPort(server) {
  const address = server.address();
  return address && typeof address === 'object' ? address.port : null;
}

export function createPreviewServer({ rootDirectory = root } = {}) {
  const server = createServer((request, response) => {
    void (async () => {
      const port = listeningPort(server);
      if (!port || !isAllowedHost(request.headers.host, port)) {
        writeText(response, 403, 'Forbidden');
        return;
      }

      const origin = Array.isArray(request.headers.origin) ? null : request.headers.origin;
      if (origin === null || !isAllowedOrigin(origin, port)) {
        writeText(response, 403, 'Forbidden');
        return;
      }

      if (request.method !== 'GET' && request.method !== 'HEAD') {
        writeText(response, 405, 'Method not allowed', { Allow: 'GET, HEAD' });
        return;
      }

      let filePath;
      try {
        filePath = await resolveRequestPath(request.url || '/', rootDirectory);
      } catch (error) {
        if (error instanceof URIError || error instanceof TypeError) {
          writeText(response, 400, 'Bad request');
          return;
        }
        throw error;
      }

      if (!filePath) {
        writeText(response, 404, 'Not found');
        return;
      }

      const file = await stat(filePath);
      response.writeHead(200, {
        'Cache-Control': 'no-store',
        'Content-Length': file.size,
        'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream',
        'Cross-Origin-Resource-Policy': 'same-origin',
        'X-Content-Type-Options': 'nosniff'
      });

      if (request.method === 'HEAD') {
        response.end();
        return;
      }

      const stream = createReadStream(filePath);
      stream.on('error', () => response.destroy());
      stream.pipe(response);
    })().catch(() => {
      if (response.headersSent) response.destroy();
      else writeText(response, 500, 'Internal server error');
    });
  });

  server.on('clientError', (_error, socket) => {
    if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
  });

  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === modulePath) {
  const requestedPort = Number.parseInt(process.env.PORT || process.argv[2] || '4173', 10);
  const port = Number.isInteger(requestedPort) && requestedPort > 0 ? requestedPort : 4173;
  const server = createPreviewServer();

  server.listen(port, '127.0.0.1', () => {
    console.log(`BetterButtons preview: http://127.0.0.1:${port}`);
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => server.close(() => process.exit(0)));
  }
}
