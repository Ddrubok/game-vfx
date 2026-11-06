import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { selectCases, assertResults } from './checks.mjs';
const read = async file => JSON.parse(await readFile(new URL(file, import.meta.url), 'utf8'));
const { mapping } = await read('manifest.json'), execution = await read('execution.json');

test('comparison requires every unique cell, completed run and named check', async () => {
  assert.equal(selectCases(mapping, execution).length, 10);
  assert.equal(selectCases(mapping, execution, true).length, 2);
  for (const bad of [[], mapping.slice(1), [...mapping, mapping[0]], mapping.map((x, i) => i ? x : { ...x, label: mapping[1].label })]) {
    for (const godot of [false, true]) assert.throws(() => selectCases(bad, execution, godot));
  }
  for (const bad of [[], execution.slice(1), [...execution, execution[0]], execution.map((x, i) => i ? x : { ...x, status: 'ERROR' })]) {
    assert.throws(() => selectCases(mapping, bad));
  }
  for (const file of ['verification.json', 'godot-verification.json']) {
    const expected = await read(file);
    assertResults(expected, expected);
    assert.throws(() => assertResults([], expected));
    const bad = structuredClone(expected);
    bad[0].checks.pop();
    assert.throws(() => assertResults(bad, expected));
    bad[0].checks.push(bad[0].checks[0]);
    assert.throws(() => assertResults(bad, expected));
  }
});
