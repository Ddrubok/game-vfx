import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';

const dir = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(dir, '../..');
const out = path.resolve(process.argv[2] || path.join(dir, 'output'));
await mkdir(out, { recursive: true });
const require = createRequire(path.join(path.resolve(process.env.VFX_TOOL_ROOT || dir), 'package.json'));
const { chromium } = require('playwright');
const server = createServer(async (req, res) => {
  try {
    const name = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    const relative = path.relative(root, name);
    if (relative.startsWith('..') || path.isAbsolute(relative)) { res.writeHead(403).end(); return; }
    const data = await readFile(name);
    res.setHeader('Content-Type', name.endsWith('.mjs') ? 'text/javascript' : 'text/html');
    res.end(data);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
const checks = [], errors = [];
const check = (name, value) => { assert.ok(value, name); checks.push(name); };
try {
  browser = await chromium.launch({ ...(process.env.VFX_BROWSER_PATH ? { executablePath: process.env.VFX_BROWSER_PATH } : {}), headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 900 }, reducedMotion: 'no-preference' });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/examples/event-replay/index.html`);
  await page.waitForFunction(() => !!window.demo);
  const pixels = () => page.evaluate(() => [...document.querySelector('#scene').getContext('2d').getImageData(0, 0, 512, 512).data].filter((n, i) => i % 4 === 3 && n > 0).length);
  const png = () => page.evaluate(() => document.querySelector('#scene').toDataURL());
  await page.evaluate(() => { demo.reset(); demo.send(); demo.step(.1); });
  check('Pending event renders a provisional cue', await pixels() > 0 && await page.evaluate(() => demo.owner.bursts === 0 && demo.owner.snapshot()[0].kind === 'preview'));
  const pending = await png();
  await page.evaluate(() => { demo.send({ revision: 2, state: 'confirmed' }); demo.render(); });
  const confirmed = await png();
  check('Confirmation changes visible cue and counts one burst', pending !== confirmed && await page.evaluate(() => demo.owner.bursts === 1));
  await page.evaluate(() => { demo.send({ revision: 2, state: 'confirmed' }); demo.render(); });
  check('Duplicate does not change rendered output', confirmed === await png());
  await page.evaluate(() => { demo.send({ revision: 3, state: 'confirmed', point: { x: 290, y: 256 } }); demo.render(); });
  check('Active correction changes location without an extra burst', confirmed !== await png() && await page.evaluate(() => demo.owner.bursts === 1 && demo.owner.snapshot()[0].age === .1));
  await page.screenshot({ path: path.join(out, 'active-correction.png'), fullPage: true });
  await page.evaluate(() => demo.step(.7));
  check('Lifetime completion clears actual pixels', await pixels() === 0);
  await page.click('#late');
  check('Higher revision after completion cannot restore pixels', await pixels() === 0 && await page.evaluate(() => demo.owner.active.size === 0));
  await page.evaluate(() => { demo.reset(); demo.send({ state: 'confirmed' }); demo.step(.1); });
  await page.click('#round');
  check('Round teardown clears actual pixels and history', await pixels() === 0 && await page.evaluate(() => demo.owner.history.size === 0));
  await page.evaluate(() => { demo.send({ state: 'confirmed' }); demo.step(.1); });
  await page.click('#dispose'); await page.click('#late');
  check('Disposed owner cannot render late events', await pixels() === 0 && await page.evaluate(() => demo.owner.history.size === 0));
  await page.click('#replay'); await page.waitForTimeout(220);
  check('Real-time replay advances and renders', await pixels() > 0);
  await page.waitForTimeout(850);
  check('Real-time replay finishes', await pixels() === 0 && await page.evaluate(() => demo.owner.active.size === 0));
  check('No browser script errors', errors.length === 0);
  const result = { date: new Date().toISOString(), browser: browser.version(), scope: 'Synthetic event adapter rendered through the Canvas example; not server, engine, player or skill-behavior evaluation', checks, errors };
  await writeFile(path.join(out, 'validation.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ passed: checks.length, browser: result.browser }));
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
