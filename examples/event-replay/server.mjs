import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
const routes = new Map([
  ['/examples/event-replay/index.html', ['examples/event-replay/index.html', 'text/html']],
  ['/assets/event-impact.mjs', ['assets/event-impact.mjs', 'text/javascript']],
  ['/assets/canvas-impact.html', ['assets/canvas-impact.html', 'text/html']],
]);
export async function replayHandler(root) {
  const base = await realpath(root);
  return async (req, res) => {
    try {
      const route = routes.get(new URL(req.url, 'http://localhost').pathname);
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
