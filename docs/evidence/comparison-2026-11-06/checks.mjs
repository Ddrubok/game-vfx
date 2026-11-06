import assert from 'node:assert/strict';

const kinds = { recolor: 'visual', style: 'visual', loop: 'visual', reduced: 'visual', events: 'events', godot: 'godot' };
const cell = x => `${x.task}/${x.condition}`;
export function selectCases(mapping, execution, godot = false) {
  const expected = Object.keys(kinds).flatMap(task => ['baseline', 'full'].map(condition => `${task}/${condition}`));
  assert.deepEqual(mapping.map(cell).sort(), expected.sort(), 'missing or duplicate comparison cell');
  assert.equal(new Set(mapping.map(x => x.label)).size, 12, 'duplicate label');
  for (const x of mapping) {
    assert.match(x.label, /^[a-f0-9]{8}$/, 'invalid label');
    assert.equal(x.kind, kinds[x.task], 'wrong task kind');
  }
  assert.deepEqual(execution.map(x => x.label).sort(), mapping.map(x => x.label).sort(), 'missing or duplicate execution');
  assert.ok(execution.every(x => x.status === 'SUCCESS'), 'incomplete execution');
  return mapping.filter(x => (x.kind === 'godot') === godot);
}

export function comparisonRoutes(mapping) {
  return new Map(mapping.filter(x => x.kind === 'visual').flatMap(x =>
    [['preview.html', 'text/html'], ['effect.mjs', 'text/javascript']].map(([file, type]) => {
      const name = `runs/${x.label}/${file}`;
      return ['/' + name, [name, type]];
    })));
}

export function assertResults(results, expected) {
  assert.deepEqual(results.map(cell).sort(), expected.map(cell).sort(), 'missing or duplicate result');
  for (const result of results) {
    const reference = expected.find(x => cell(x) === cell(result));
    assert.equal(result.label, reference.label, 'wrong result label');
    assert.deepEqual(result.checks.map(x => x.name).sort(), reference.checks.map(x => x.name).sort(), 'missing or duplicate check');
    assert.ok(result.checks.every(x => typeof x.pass === 'boolean'), 'incomplete check');
  }
}
