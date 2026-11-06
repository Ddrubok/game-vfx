import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';
const routes = new Map([
  ['/examples/event-replay/index.html', ['examples/event-replay/index.html', 'text/html']],
  ['/assets/event-impact.mjs', ['assets/event-impact.mjs', 'text/javascript']],
  ['/assets/canvas-impact.html', ['assets/canvas-impact.html', 'text/html']],
]);
export const replayHandler = root => staticHandler(root, routes);
export async function staticHandler(root, allowedRoutes) {
  const base = await realpath(root);
  return async (req, res) => {
    try {
      const route = allowedRoutes.get(new URL(req.url, 'http://localhost').pathname);
      if (!route || !['GET', 'HEAD'].includes(req.method)) { res.writeHead(404).end(); return; }
      const target = await realpath(path.join(base, route[0]));
      const relative = path.relative(base, target);
      if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) { res.writeHead(403).end(); return; }
      const data = await readFile(target);
      res.setHeader('Content-Type', route[1] + '; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch { res.writeHead(404).end(); }
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  createServer(await replayHandler(root)).listen(8000, '127.0.0.1', () =>
    console.log('http://127.0.0.1:8000/examples/event-replay/index.html'));
}
