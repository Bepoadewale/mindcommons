import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../dist-vision');
const base = '/mindcommons/';
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

createServer((request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
  if (pathname === '/mindcommons') {
    response.writeHead(308, { Location: base }).end();
    return;
  }
  if (!pathname.startsWith(base)) {
    response.writeHead(404).end();
    return;
  }

  let decoded;
  try {
    decoded = decodeURIComponent(pathname.slice(base.length));
  } catch {
    response.writeHead(400).end();
    return;
  }
  const file = resolve(root, decoded || 'index.html');
  if (!file.startsWith(`${root}/`) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  if (request.method === 'HEAD') response.end();
  else createReadStream(file).pipe(response);
}).listen(4174, '127.0.0.1');
