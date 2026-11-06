import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ImpactEvents as Baseline } from './runs/72f977d6/event-impact.mjs';
import { ImpactEvents as Original } from './runs/8c3d3cb5/event-impact.mjs';
const source = await readFile(new URL('./runs/8c3d3cb5/event-impact.mjs', import.meta.url), 'utf8');
const patch = await readFile(new URL('./pending-callback.patch', import.meta.url), 'utf8');
const before = patch.split('\n').find(line => line.startsWith('-    ')).slice(1);
const after = patch.split('\n').find(line => line.startsWith('+    ')).slice(1);
assert.equal(source.split(before).length, 2, 'patch must have exactly one target');
const { ImpactEvents: Fixed } = await import('data:text/javascript;base64,' + Buffer.from(source.replace(before, after)).toString('base64'));
const event = { id: 'hit', round: 'round-1', revision: 1, state: 'pending', point: { x: 5, y: 8 } };

test('preserve the original callback failure; separate patch meets the phase contract', () => {
  const results = [];
  for (const [name, Type, acceptsCallback] of [['baseline', Baseline, true], ['full-original', Original, false], ['full-patched', Fixed, true]]) {
    for (const completion of ['timer', 'callback']) {
      const p = new Type(); p.receive(event); const token = p.completionToken('hit');
      if (completion === 'timer') p.advance(.81); else p.finish(token);
      const accepted = p.receive({ ...event, revision: 2, state: 'confirmed' });
      const expected = completion === 'timer' || acceptsCallback;
      assert.equal(accepted, expected);
      assert.equal(p.active.size, expected ? 1 : 0);
      if (expected) {
        assert.equal(p.snapshot()[0].age, 0); assert.equal(p.bursts, 1);
        assert.equal(p.finish(token), false);
        p.advance(.4); assert.equal(p.active.size, 1);
        p.advance(.4); assert.equal(p.active.size, 0);
        assert.equal(p.receive({ ...event, revision: 3, state: 'confirmed' }), false);
      }
      results.push({ name, completion, accepted });
    }
    const rejected = new Type(); rejected.receive(event); rejected.receive({ ...event, revision: 2, state: 'rejected' });
    assert.equal(rejected.receive({ ...event, revision: 3, state: 'confirmed' }), false);
    const finished = new Type(); finished.receive({ ...event, state: 'confirmed' });
    finished.finish(finished.completionToken('hit'));
    assert.equal(finished.receive({ ...event, revision: 2, state: 'confirmed' }), false);
  }
  console.log(JSON.stringify(results));
});
