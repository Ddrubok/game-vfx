import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { replayHandler } from './server.mjs';

test('only replay files inside the real root are served', async () => {
  const temp = await mkdtemp(path.join(tmpdir(), 'vfx-server-'));
  try {
    const root = path.join(temp, 'root'), outside = path.join(temp, 'outside');
    await mkdir(path.join(root, 'examples/event-replay'), { recursive: true });
    await mkdir(outside);
    await writeFile(path.join(root, 'examples/event-replay/index.html'), 'ALLOWED');
    await writeFile(path.join(root, '.dummy'), 'PRIVATE_DUMMY');
    await writeFile(path.join(outside, 'event-impact.mjs'), 'OUTSIDE_DUMMY');
    await symlink(outside, path.join(root, 'assets'), process.platform === 'win32' ? 'junction' : 'dir');
    const handler = await replayHandler(root);
    async function request(url) {
      const res = { status: 200, setHeader() {}, writeHead(n) { this.status = n; return this; }, end(data) { this.body = String(data ?? ''); } };
      await handler({ url, method: 'GET' }, res); return res;
    }
    assert.equal((await request('/examples/event-replay/index.html')).body, 'ALLOWED');
    for (const url of ['/.dummy', '/%2e%2e/outside/event-impact.mjs', '/assets/unknown.mjs']) {
      const response = await request(url); assert.equal(response.status, 404); assert.equal(response.body, '');
    }
    const escaped = await request('/assets/event-impact.mjs');
    assert.equal(escaped.status, 403); assert.equal(escaped.body, '');
  } finally { await rm(temp, { recursive: true, force: true }); }
});
