import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

// Evaluation-only helper. Reuse the installed browser tooling; not a skill dependency.
const dir = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(path.resolve(process.env.VFX_TOOL_ROOT || dir), 'package.json'));
const { chromium } = require('playwright');
const out = path.resolve(process.argv[2] || path.join(dir, 'output'));
await mkdir(out, { recursive: true });
const input = process.env.VFX_INPUT || path.resolve(dir, '../../assets/canvas-impact.html');
const browser = await chromium.launch({ ...(process.env.VFX_BROWSER_PATH ? { executablePath: process.env.VFX_BROWSER_PATH } : {}), headless: true });
const errors = [], checks = [];
const page = await browser.newPage({ viewport: { width: 900, height: 1160 }, reducedMotion: 'no-preference' });
page.on('pageerror', e => errors.push(e.message));
const check = (name, value) => { assert.ok(value, name); checks.push(name); };
try {
  await page.goto(pathToFileURL(input).href);
  const stats = await page.evaluate(() => {
    const o = vfx.options();
    const pixels = c => c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    const visible = c => pixels(c).some((v, i) => i % 4 === 3 && v > 0);
    const a = vfx.frameAt(0.18, o).toDataURL();
    vfx.frameAt(0.52, o);
    const d = pixels(vfx.frameAt(0.18, o));
    let edge = 0, partial = 0, transparent = 0;
    for (let step = 0; step <= 20; step++) {
      const data = pixels(vfx.frameAt(step / 25, o));
      for (let x = 0; x < 512; x++) for (const y of [0, 511]) edge += data[(y * 512 + x) * 4 + 3];
      for (let y = 0; y < 512; y++) for (const x of [0, 511]) edge += data[(y * 512 + x) * 4 + 3];
    }
    for (let i = 3; i < d.length; i += 4) { if (d[i] === 0) transparent++; else if (d[i] < 255) partial++; }
    return {
      deterministic: a === vfx.frameAt(0.18, o).toDataURL(),
      seedChanges: a !== vfx.frameAt(0.18, { ...o, seed: 24 }).toDataURL(),
      colorChanges: a !== vfx.frameAt(0.18, { ...o, color: '#d89032' }).toDataURL(),
      reducedChanges: a !== vfx.frameAt(0.18, { ...o, reducedMotion: true }).toDataURL(),
      endpointsEmpty: [-0.1, 0, 0.8, 2].every(t => !visible(vfx.frameAt(t, o))),
      peakVisible: visible(vfx.frameAt(0.18, o)), edge, partial, transparent
    };
  });
  for (const key of ['deterministic', 'seedChanges', 'colorChanges', 'reducedChanges', 'endpointsEmpty', 'peakVisible']) check(key, stats[key]);
  check('No nontransparent pixels touch frame edges at 21 sampled times', stats.edge === 0);
  check('Transparent and partially transparent pixels exist', stats.partial > 0 && stats.transparent > 0);

  await page.screenshot({ path: path.join(out, 'preview-dark.png'), fullPage: true });
  await page.selectOption('#background', '#f5f2eb');
  await page.screenshot({ path: path.join(out, 'preview-light.png'), fullPage: true });
  const baseline = await page.evaluate(() => document.getElementById('preview').toDataURL());
  await page.selectOption('#background', 'checker');
  check('Background selector does not bake background into the effect', baseline === await page.evaluate(() => document.getElementById('preview').toDataURL()));
  await page.selectOption('#background', '#15212c');

  for (const [selector, file] of [['#frame', 'frame.png'], ['#sheet', 'sheet.png'], ['#metadata', 'sheet.json']]) {
    const waiting = page.waitForEvent('download');
    await page.click(selector);
    const download = await waiting;
    await download.saveAs(path.join(out, file));
    check(`${file} download completed`, !await download.failure());
  }
  const metadata = JSON.parse(await readFile(path.join(out, 'sheet.json'), 'utf8'));
  check('20 fixed-rate frame durations sum to the declared 0.8 seconds', metadata.frames.length === 20 && metadata.frames.reduce((n, f) => n + f.durationMs, 0) === 800 && metadata.durationSeconds === 0.8);
  check('Midpoint samples preserve playback interval starts', metadata.sampling === 'interval-midpoint' && metadata.frames.every((f, i) => f.timeSeconds === i / 25 && f.sampleTimeSeconds === (i + .5) / 25));
  check('Metadata records actual custom format and center pivot', metadata.format === 'game-vfx-sheet-v1' && metadata.blend === 'source-over' && !metadata.loop && metadata.pivotPixels.x === 256 && metadata.pivotPixels.y === 256);
  const savedImage = (await readFile(path.join(out, 'sheet.png'))).toString('base64');
  const exportCheck = await page.evaluate(async ({ savedImage, metadata }) => {
    const image = new Image(); image.src = 'data:image/png;base64,' + savedImage; await image.decode();
    const c = document.createElement('canvas'); c.width = image.width; c.height = image.height;
    const cx = c.getContext('2d'); cx.drawImage(image, 0, 0);
    const reference = document.createElement('canvas'); reference.width = reference.height = 512;
    const referenceContext = reference.getContext('2d');
    let matching = 0, biggestDifference = 0, alphaDifference = 0, premultipliedDifference = 0;
    const mismatches = []; let visibleFrames = 0, firstFrameVisible = false;
    for (const f of metadata.frames) {
      const actual = cx.getImageData(f.x, f.y, f.width, f.height).data;
      const visible = actual.some((v, i) => i % 4 === 3 && v > 0);
      if (visible) visibleFrames++;
      if (f.index === 0) firstFrameVisible = visible;
      // Compare PNG roundtrips on both sides, so decoding/color conversion is equivalent.
      const referenceImage = new Image();
      referenceImage.src = vfx.frameAt(f.sampleTimeSeconds, metadata.options).toDataURL();
      await referenceImage.decode(); referenceContext.clearRect(0, 0, 512, 512);
      referenceContext.drawImage(referenceImage, 0, 0);
      const expected = referenceContext.getImageData(0, 0, 512, 512).data;
      let match = true;
      for (let i = 0; i < actual.length; i++) {
        const delta = Math.abs(actual[i] - expected[i]); biggestDifference = Math.max(biggestDifference, delta);
        if (delta !== 0) {
          match = false;
          if (mismatches.length < 6) mismatches.push({frame: f.index, channel: i % 4, actual: actual[i], expected: expected[i], alphaActual: actual[i - i % 4 + 3], alphaExpected: expected[i - i % 4 + 3]});
        }
        if (i % 4 === 3) alphaDifference = Math.max(alphaDifference, delta);
        else {
          const alpha = i - i % 4 + 3;
          premultipliedDifference = Math.max(premultipliedDifference, Math.abs(actual[i] * actual[alpha] / 255 - expected[i] * expected[alpha] / 255));
        }
      }
      if (match) matching++;
    }
    return { width: image.width, height: image.height, matching, visibleFrames, firstFrameVisible, biggestDifference, alphaDifference, premultipliedDifference, mismatches };
  }, { savedImage, metadata });
  check('First exported frame is visible', exportCheck.firstFrameVisible);
  check('Saved PNG dimensions match metadata', exportCheck.width === metadata.width && exportCheck.height === metadata.height);
  check('All 20 saved sheet frames match individually exported PNG frames pixel-for-pixel', exportCheck.matching === 20);

  await page.click('#replay'); await page.waitForTimeout(180);
  const advancing = await page.locator('#time').inputValue();
  check('Playback advances with elapsed time', Number(advancing) > 0 && Number(advancing) < 0.8);
  await page.click('#pause');
  const paused = await page.locator('#time').inputValue(); await page.waitForTimeout(100);
  check('Pause stops advancement', paused === await page.locator('#time').inputValue());
  await page.click('#replay'); await page.waitForTimeout(950);
  check('One-shot reaches its end and clears', await page.evaluate(() => {
    const data = document.getElementById('preview').getContext('2d').getImageData(0, 0, 512, 512).data;
    return Number(document.getElementById('time').value) === 0.8 && !data.some((v, i) => i % 4 === 3 && v > 0);
  }));
  await page.click('#replay'); await page.waitForTimeout(120);
  check('Replay restarts a completed effect', Number(await page.locator('#time').inputValue()) < 0.8);
  await page.evaluate(() => vfx.setTime(0.18));
  await page.check('#reduced');
  await page.screenshot({ path: path.join(out, 'preview-reduced.png'), fullPage: true });
  await page.uncheck('#reduced');

  const contact = await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 960; c.height = 660;
    const cx = c.getContext('2d'); cx.fillStyle = '#15212c'; cx.fillRect(0, 0, c.width, c.height);
    [0.02, 0.12, 0.24, 0.4, 0.6, 0.78].forEach((t, i) => {
      const x = i % 3 * 320, y = Math.floor(i / 3) * 330;
      cx.drawImage(vfx.frameAt(t), x + 10, y + 20, 300, 300);
      cx.fillStyle = '#edf0f4'; cx.font = '16px sans-serif'; cx.fillText(t.toFixed(2) + ' s', x + 16, y + 22);
    });
    return c.toDataURL().split(',')[1];
  });
  await writeFile(path.join(out, 'contact-sheet.png'), Buffer.from(contact, 'base64'));
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await mobile.goto(pathToFileURL(input).href);
  check('Reduced motion preference is honored on initial load', await mobile.isChecked('#reduced'));
  check('390px viewport has no document horizontal overflow', await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await mobile.screenshot({ path: path.join(out, 'preview-narrow.png'), fullPage: true });
  await mobile.close();
  check('No browser JavaScript errors', errors.length === 0);
  const report = { source: 'assets/canvas-impact.html', date: new Date().toISOString(), browser: browser.version(), scope: 'Bundled Canvas example only; automated runtime and export checks, not subjective motion evaluation or game integration', checks, stats, exportCheck, errors };
  await writeFile(path.join(out, 'validation.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ passed: checks.length, browser: report.browser, exportCheck, errors }, null, 2));
} finally { await browser.close(); }
