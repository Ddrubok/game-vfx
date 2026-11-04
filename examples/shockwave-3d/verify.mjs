import { createRequire } from 'node:module';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const root = path.dirname(fileURLToPath(import.meta.url)), out = path.join(root, 'evidence');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.VFX_BROWSER_EXECUTABLE ? { executablePath: process.env.VFX_BROWSER_EXECUTABLE } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 1040 }, reducedMotion: 'no-preference' });
const page = await context.newPage(), errors = [], network = [], checks = [];
const check = (name, value) => { assert.ok(value, name); checks.push(name); };
const url = pathToFileURL(path.join(root, 'shockwave-3d.html')).href;
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('request', request => { if (/^https?:/.test(request.url())) network.push(request.url()); });
const capture = () => page.evaluate(() => vfx3d.canvas.toDataURL());
const decode = uri => PNG.sync.read(Buffer.from(uri.split(',')[1], 'base64'));
try {
  await page.goto(url);
  await page.waitForFunction(() => window.vfx3d?.ready, null, { timeout: 20000 });
  const environment = await page.evaluate(() => vfx3d.snapshot());
  console.log(JSON.stringify({ browser: browser.version(), gpu: environment.gpu, revision: environment.threeRevision }));
  check('Three.js 187 scene initializes in a WebGL2 browser', environment.threeRevision === '187' && environment.instances === 1);
  await page.screenshot({ path: path.join(out, '01-isometric.png'), fullPage: true });
  const image = await capture();
  await page.evaluate(() => { vfx3d.seek(0.93); vfx3d.seek(0.42); });
  check('Seeking returns to identical pixels at the same time and seed', image === await capture());
  await page.evaluate(() => { vfx3d.setVisible(false); }); const empty = await capture();
  check('The effect changes rendered pixels', empty !== image);
  await page.evaluate(() => { vfx3d.setVisible(true); vfx3d.seek(0); });
  check('Before onset, the scene matches the no-effect baseline', empty === await capture());
  await page.evaluate(() => vfx3d.seek(1.6));
  check('After the one-shot, no effect pixels remain', empty === await capture());
  await page.evaluate(() => { vfx3d.seek(0.42); vfx3d.view('side'); });
  await page.screenshot({ path: path.join(out, '02-side.png'), fullPage: true });
  check('Side view changes camera and projected pixels', image !== await capture());

  // Four real renders plus a depth mask: foreground object pixels must stay unchanged,
  // and removing that object must reveal effect pixels at the same screen positions.
  const mask = decode(await page.evaluate(() => vfx3d.frontMask()));
  const withEffect = decode(await capture());
  await page.evaluate(() => vfx3d.setVisible(false)); const baseline = decode(await capture());
  await page.evaluate(() => { vfx3d.setObstacles(false); vfx3d.setVisible(true); }); const exposedEffect = decode(await capture());
  await page.evaluate(() => vfx3d.setVisible(false)); const exposedBase = decode(await capture());
  let maskPixels = 0, alteredBehindBlock = 0, revealed = 0;
  for (let y = 2; y < mask.height - 2; y++) for (let x = 2; x < mask.width - 2; x++) {
    const i = (y * mask.width + x) * 4;
    const solid = [[0,0],[-2,0],[2,0],[0,-2],[0,2]].every(([dx,dy]) => mask.data[((y + dy) * mask.width + x + dx) * 4] > 250);
    if (!solid) continue;
    maskPixels++;
    const differs = [0,1,2].some(c => Math.abs(withEffect.data[i+c] - baseline.data[i+c]) > 1);
    if (differs) alteredBehindBlock++;
    if ([0,1,2].some(c => Math.abs(exposedEffect.data[i+c] - exposedBase.data[i+c]) > 4)) revealed++;
  }
  const occlusion = { maskPixels, alteredBehindBlock, revealed };
  console.log(JSON.stringify({ occlusion }));
  check('Front pillar occludes all effect pixels in its sampled interior', maskPixels > 100 && alteredBehindBlock === 0);
  check('Removing the pillar reveals effect pixels at those same positions', revealed > 20);
  await page.evaluate(() => { vfx3d.setObstacles(true); vfx3d.setVisible(true); vfx3d.view('top'); });
  await page.screenshot({ path: path.join(out, '03-top.png'), fullPage: true });
  check('Top view changes the actual 3D camera position', (await page.evaluate(() => vfx3d.snapshot())).camera[1] > 16);
  await page.evaluate(() => { vfx3d.view('iso'); vfx3d.setOptions({ count: 6 }); vfx3d.seek(0.42); });
  await page.screenshot({ path: path.join(out, '04-six-effects.png'), fullPage: true });
  const six = await page.evaluate(() => vfx3d.snapshot());
  check('Six separate effect owners render simultaneously', six.instances === 6 && six.children === 6 && six.states.every(s => s.visible));
  check('Six-effect draw issues triangles', six.render.triangles > 0 && six.render.calls > 0);
  await page.evaluate(() => { vfx3d.setOptions({ count: 1 }); vfx3d.seek(0.42); });
  const before = await page.evaluate(() => vfx3d.snapshot());
  await page.evaluate(() => {
    for (let i = 0; i < 20; i++) {
      vfx3d.clear(); vfx3d.setOptions({ count: 6 }); vfx3d.seek(0.42);
      vfx3d.setOptions({ count: 1 }); vfx3d.seek(0.42);
    }
  });
  const after = await page.evaluate(() => vfx3d.snapshot());
  check('20 clear/recreate cycles leave only one requested owner', after.instances === 1 && after.children === 1);
  check('Tracked geometry and texture counts do not grow across those cycles', before.memory.geometries === after.memory.geometries && before.memory.textures === after.memory.textures);
  check('Shader program count does not grow across those cycles', before.programs === after.programs);
  await page.click('#clear');
  check('Clear removes effect owners from the scene', (await page.evaluate(() => vfx3d.snapshot())).instances === 0);
  await page.click('#play'); await page.waitForTimeout(300);
  check('Replay recreates a cleared effect and advances time', await page.evaluate(() => { const s = vfx3d.snapshot(); return s.instances === 1 && s.time > 0 && s.running; }));
  await page.click('#pause'); const paused = (await page.evaluate(() => vfx3d.snapshot())).time;
  await page.waitForTimeout(120);
  check('Pause holds the presentation time', paused === (await page.evaluate(() => vfx3d.snapshot())).time);
  await page.click('#play'); await page.waitForFunction(() => !vfx3d.snapshot().running, null, { timeout: 5000 });
  check('Playback stops at the configured duration', await page.evaluate(() => { const s = vfx3d.snapshot(); return s.time === 1.6 && s.states.every(x => !x.visible); }));
  await page.evaluate(() => { vfx3d.setOptions({ reducedMotion: true }); vfx3d.seek(0.42); });
  await page.screenshot({ path: path.join(out, '05-reduced-motion.png'), fullPage: true });
  check('Reduced motion retains a marker without particles', await page.evaluate(() => vfx3d.snapshot().states.every(s => s.reducedMotion && s.particleCount === 0 && s.visible)));
  await page.evaluate(() => { vfx3d.setOptions({ reducedMotion: false }); vfx3d.seek(0.42); });

  const cameraBefore = await page.evaluate(() => vfx3d.snapshot().camera);
  const box = await page.locator('canvas').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 110, box.y + box.height / 2 + 30, { steps: 6 }); await page.mouse.up();
  check('Pointer drag rotates the camera', JSON.stringify(cameraBefore) !== JSON.stringify(await page.evaluate(() => vfx3d.snapshot().camera)));
  await page.click('#view-iso');
  const cameraKey = await page.evaluate(() => vfx3d.snapshot().camera);
  await page.locator('canvas').focus(); await page.keyboard.press('ArrowLeft');
  check('Keyboard controls rotate the camera', JSON.stringify(cameraKey) !== JSON.stringify(await page.evaluate(() => vfx3d.snapshot().camera)));
  await page.click('#view-iso');
  const downloadEvent = page.waitForEvent('download'); await page.click('#capture');
  const download = await downloadEvent; await download.saveAs(path.join(out, 'scene-export.png'));
  const exported = PNG.sync.read(await readFile(path.join(out, 'scene-export.png')));
  check('UI exports a readable PNG of the actual canvas', exported.width === Math.round(box.width) && exported.height === Math.round(box.height));

  const frames = [];
  for (const t of [0.06, 0.18, 0.42, 0.7, 1.05, 1.5]) {
    await page.evaluate(t => vfx3d.seek(t), t);
    const data = Buffer.from((await capture()).split(',')[1], 'base64');
    const name = `frame-${Math.round(t * 1000)}ms.png`; await writeFile(path.join(out, name), data); frames.push({ t, name });
  }
  await page.evaluate(() => vfx3d.seek(0.42));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(out, '06-narrow.png'), fullPage: true });
  check('390px layout has no document horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const mobile = await context.newPage();
  await mobile.emulateMedia({ reducedMotion: 'reduce' }); await mobile.goto(url);
  await mobile.waitForFunction(() => window.vfx3d?.ready);
  check('OS reduced-motion preference is honored on entry', await mobile.isChecked('#reduced'));
  await mobile.evaluate(() => vfx3d.destroy());
  check('Explicit teardown marks the renderer destroyed and removes effects', await mobile.evaluate(() => { const s = vfx3d.snapshot(); return s.destroyed && s.instances === 0; }));
  await mobile.reload(); await mobile.waitForFunction(() => window.vfx3d?.ready);
  check('A fresh page initializes again after teardown', await mobile.evaluate(() => !vfx3d.snapshot().destroyed && vfx3d.snapshot().instances === 1));
  await mobile.close();
  check('No HTTP requests are needed by the offline HTML', network.length === 0);
  check('No browser JavaScript or shader errors were logged', errors.length === 0);
  const hashes = {};
  for (const name of ['shockwave.js', 'app.js', 'template.html', 'shockwave-3d.html', 'package-lock.json']) hashes[name] = createHash('sha256').update(await readFile(path.join(root, name))).digest('hex');
  const report = { date: new Date().toISOString(), browser: browser.version(), environment, checks, occlusion, repeatedCycles: { count: 20, before, after }, sixEffects: six, frames, errors, network, hashes, limits: ['No human real-time motion rating', 'No Unity/Godot/Flutter integration', 'No real phone benchmark', 'Resource counters are not a full GPU/heap leak audit'] };
  await writeFile(path.join(out, 'validation.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ passed: checks.length, errors, memoryBefore: before.memory, memoryAfter: after.memory, programsBefore: before.programs, programsAfter: after.programs }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ errors, notice: await page.locator('#error').textContent().catch(() => ''), failure: error.message }, null, 2));
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true }).catch(() => {});
  throw error;
} finally { await browser.close(); }
