import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { replayHandler, staticHandler } from './server.mjs';
import { comparisonRoutes } from '../../docs/evidence/comparison-2026-11-06/checks.mjs';

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

test('comparison routes reject outside links and all unlisted files', async () => {
  const temp = await mkdtemp(path.join(tmpdir(), 'vfx-comparison-server-'));
  try {
    const root = path.join(temp, 'root'), outside = path.join(temp, 'outside');
    await mkdir(path.join(root, 'runs', '11111111'), { recursive: true });
    await mkdir(outside);
    await writeFile(path.join(root, 'runs', '11111111', 'preview.html'), 'ALLOWED');
    await writeFile(path.join(root, 'runs', '11111111', '.dummy'), 'PRIVATE_DUMMY');
    await writeFile(path.join(outside, 'effect.mjs'), 'OUTSIDE_DUMMY');
    await symlink(outside, path.join(root, 'runs', '22222222'), process.platform === 'win32' ? 'junction' : 'dir');
    const handler = await staticHandler(root, comparisonRoutes(['11111111', '22222222'].map(label => ({ label, kind: 'visual' }))));
    for (const [url, expected] of [['/runs/11111111/preview.html', 200], ['/runs/11111111/.dummy', 404], ['/runs/11111111/REQUEST.md', 404], ['/runs/22222222/effect.mjs', 403]]) {
      const res = { status: 200, setHeader() {}, writeHead(n) { this.status = n; return this; }, end(data) { this.body = String(data ?? ''); } };
      await handler({ url, method: 'GET' }, res);
      assert.equal(res.status, expected);
      assert.equal(res.body, expected === 200 ? 'ALLOWED' : '');
    }
  } finally { await rm(temp, { recursive: true, force: true }); }
});
