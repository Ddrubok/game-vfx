import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(process.argv[2] || path.join(dir, 'output/variants'));
await mkdir(out, { recursive: true });
const require = createRequire(path.join(path.resolve(process.env.VFX_TOOL_ROOT || dir), 'package.json'));
const { chromium } = require('playwright');
const browser = await chromium.launch({ ...(process.env.VFX_BROWSER_PATH ? { executablePath: process.env.VFX_BROWSER_PATH } : {}), headless: true });
const checks = [], errors = [], assets = [];
const check = (name, value) => { assert.ok(value, name); checks.push(name); };
try {
  const page = await browser.newPage({ viewport: { width: 980, height: 1100 }, reducedMotion: 'no-preference' });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(dir, '../../assets/canvas-impact.html')).href);
  for (const [effect, color, frames, duration] of [['impact', '#29b8ad', 12, .6], ['slash', '#d1b58a', 12, .4], ['embers', '#e89643', 16, 1.6]]) {
    await page.selectOption('#effect', effect); await page.selectOption('#size', '128');
    await page.fill('#frames', String(frames)); await page.fill('#duration', String(duration));
    await page.locator('#color').evaluate((el, color) => { el.value = color; el.dispatchEvent(new Event('input')); }, color);
    await page.evaluate(() => vfx.setTime(.18));
    for (const [selector, extension] of [['#sheet', 'png'], ['#metadata', 'json']]) {
      const waiting = page.waitForEvent('download'); await page.click(selector);
      const download = await waiting; await download.saveAs(path.join(out, `${effect}.${extension}`));
      check(`${effect}: ${extension} download`, !await download.failure());
    }
    const metadata = JSON.parse(await readFile(path.join(out, `${effect}.json`), 'utf8'));
    check(`${effect}: settings, pivot and full duration`, metadata.frames.length === frames && metadata.pivotPixels.x === 64 && metadata.pivotPixels.y === 64 &&
      Math.abs(metadata.frames.reduce((n, f) => n + f.durationMs, 0) - duration * 1000) < 1e-6 && metadata.loop === (effect === 'embers'));
    const saved = (await readFile(path.join(out, `${effect}.png`))).toString('base64');
    const result = await page.evaluate(async ({ saved, metadata }) => {
      const image = new Image(); image.src = `data:image/png;base64,${saved}`; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
      const c = canvas.getContext('2d'); c.drawImage(image, 0, 0);
      let matching = 0, firstVisible = false, clipped = 0, maxAlphaDelta = 0, maxPremultipliedDelta = 0;
      for (const f of metadata.frames) {
        const expected = new Image(); expected.src = vfx.frameAt(f.sampleTimeSeconds, metadata.options).toDataURL(); await expected.decode();
        const target = document.createElement('canvas'); target.width = target.height = f.width;
        const t = target.getContext('2d'); t.drawImage(expected, 0, 0);
        const actual = c.getImageData(f.x, f.y, f.width, f.height).data, want = t.getImageData(0, 0, f.width, f.height).data;
        if (actual.every((value, i) => value === want[i])) matching++;
        for (let i = 0; i < actual.length; i += 4) {
          maxAlphaDelta = Math.max(maxAlphaDelta, Math.abs(actual[i + 3] - want[i + 3]));
          for (let channel = 0; channel < 3; channel++) maxPremultipliedDelta = Math.max(maxPremultipliedDelta, Math.abs(actual[i + channel] * actual[i + 3] / 255 - want[i + channel] * want[i + 3] / 255));
        }
        if (f.index === 0) firstVisible = actual.some((value, i) => i % 4 === 3 && value > 0);
        for (let i = 0; i < f.width; i++) for (const [x, y] of [[i, 0], [i, f.height - 1], [0, i], [f.width - 1, i]]) clipped += actual[(y * f.width + x) * 4 + 3];
      }
      return { matching, firstVisible, clipped, maxAlphaDelta, maxPremultipliedDelta, width: image.width, height: image.height };
    }, { saved, metadata });
    // Browser PNG roundtrips can differ by one 8-bit premultiplied color unit.
    // Require exact alpha (shape/time) and report exact-match counts separately.
    check(`${effect}: packed alpha matches; premultiplied color within one unit; fits`, result.maxAlphaDelta === 0 && result.maxPremultipliedDelta <= 1 && result.firstVisible && result.clipped === 0 && result.width === metadata.width && result.height === metadata.height);
    await page.screenshot({ path: path.join(out, `${effect}-preview.png`), fullPage: true });
    assets.push({ effect, metadata, export: result, rgba8Bytes: metadata.width * metadata.height * 4 });
  }
  check('Ember cycle endpoints match exactly', await page.evaluate(() => vfx.frameAt(0).toDataURL() === vfx.frameAt(vfx.options().duration).toDataURL()));
  check('Reduced-motion ember pattern is static', await page.evaluate(() => {
    const o = { ...vfx.options(), reducedMotion: true }; return vfx.frameAt(.1, o).toDataURL() === vfx.frameAt(1.1, o).toDataURL();
  }));
  await page.click('#replay'); await page.waitForTimeout(1900);
  check('Loop continues beyond one cycle', await page.evaluate(() => {
    const data = document.querySelector('#preview').getContext('2d').getImageData(0, 0, 512, 512).data;
    return data.some((n, i) => i % 4 === 3 && n > 0) && Number(document.querySelector('#time').value) < vfx.options().duration;
  }));
  await page.click('#pause');
  check('Invalid API parameters are rejected before atlas allocation', await page.evaluate(() => {
    return [{ size: 4096 }, { frames: 0 }, { frames: 3.5 }, { duration: NaN }, { duration: -1 }, { effect: 'unknown' }].every(o => {
      try { vfx.makeSheet(o); return false; } catch (e) { return e instanceof RangeError; }
    });
  }));
  await page.fill('#frames', '0'); await page.click('#sheet');
  check('Invalid UI value reports an error without a page crash', (await page.locator('#status').textContent()).includes('4–60'));
  check('No browser errors', errors.length === 0);
  const report = { date: new Date().toISOString(), browser: browser.version(), checks, assets, errors,
    scope: 'Parameterized Canvas outputs and three shape/motion examples; not artist preference or target-device performance' };
  await writeFile(path.join(out, 'validation.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ passed: checks.length, assets: assets.map(a => ({ effect: a.effect, rgba8Bytes: a.rgba8Bytes })) }));
} finally { await browser.close(); }
