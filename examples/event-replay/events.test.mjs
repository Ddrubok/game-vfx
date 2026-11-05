import test from 'node:test';
import assert from 'node:assert/strict';
import { ImpactEvents } from '../../assets/event-impact.mjs';

const event = (overrides = {}) => ({ id: 'hit', round: 'round-1', revision: 1,
  state: 'confirmed', point: { x: 256, y: 256 }, ...overrides });

test('pending is provisional; confirmation bursts once; duplicate and older deliveries are ignored', () => {
  const p = new ImpactEvents();
  p.receive(event({ state: 'pending' }));
  assert.equal(p.snapshot()[0].kind, 'preview');
  assert.equal(p.bursts, 0);
  p.receive(event({ revision: 2 }));
  assert.equal(p.snapshot()[0].kind, 'impact');
  assert.equal(p.receive(event({ revision: 2 })), false);
  assert.equal(p.receive(event()), false);
  assert.equal(p.bursts, 1);
});
for (const state of ['pending', 'confirmed']) {
  test(`finished ${state} cannot revive on a higher revision`, () => {
    const p = new ImpactEvents(); p.receive(event({ state }));
    p.advance(.8);
    const bursts = p.bursts;
    assert.equal(p.receive(event({ revision: 99 })), false);
    assert.deepEqual(p.snapshot(), []);
    assert.equal(p.bursts, bursts);
  });
}
test('correction relocates an active cue without a restart or a second burst', () => {
  const p = new ImpactEvents(); p.receive(event()); p.advance(.4);
  p.receive(event({ revision: 2, point: { x: 50, y: 70 } }));
  assert.deepEqual(p.snapshot()[0], { id: 'hit', kind: 'impact', point: { x: 50, y: 70 }, age: .4 });
  assert.equal(p.bursts, 1);
  p.advance(.4); assert.deepEqual(p.snapshot(), []);
});
test('rejection closes this sample lifetime, including later confirmation', () => {
  const p = new ImpactEvents(); p.receive(event());
  p.receive(event({ revision: 2, state: 'rejected' }));
  assert.equal(p.receive(event({ revision: 3 })), false);
  assert.equal(p.receive(event({ revision: 4, state: 'pending' })), false);
  assert.deepEqual(p.snapshot(), []);
});
test('a live confirmed event cannot regress to pending', () => {
  const p = new ImpactEvents(); p.receive(event());
  assert.equal(p.receive(event({ revision: 2, state: 'pending' })), false);
  assert.equal(p.snapshot()[0].kind, 'impact');
});
test('pause preserves local age and resume completes at the lifetime boundary', () => {
  const p = new ImpactEvents(); p.receive(event()); p.advance(.3);
  p.advance(10, { paused: true }); assert.equal(p.snapshot()[0].age, .3);
  p.advance(.49); assert.equal(p.active.size, 1);
  p.advance(.02); assert.equal(p.active.size, 0);
});
test('fractional time steps close at the represented 0.8-second boundary', () => {
  const p = new ImpactEvents(); p.receive(event());
  p.advance(.1); p.advance(.7);
  assert.equal(p.active.size, 0);
  assert.equal(p.receive(event({ revision: 2 })), false);
});
test('new round clears bounded history; stale event and completion cannot affect reused ID', () => {
  const p = new ImpactEvents(); p.receive(event());
  const old = p.completionToken('hit');
  p.nextRound('round-2'); assert.equal(p.history.size, 0);
  p.receive(event({ round: 'round-2' }));
  assert.equal(p.receive(event({ revision: 9 })), false);
  assert.equal(p.finish(old), false);
  assert.equal(p.active.size, 1);
  assert.equal(p.finish(p.completionToken('hit')), true);
});
test('owner disposal and late completion leave no retained history', () => {
  const p = new ImpactEvents(); p.receive(event());
  const token = p.completionToken('hit'); p.dispose(); p.dispose();
  assert.equal(p.finish(token), false);
  assert.equal(p.receive(event({ revision: 5 })), false);
  assert.equal(p.history.size, 0); assert.equal(p.active.size, 0);
});
test('another owner and unknown ID cannot finish an effect or create history', () => {
  const a = new ImpactEvents(), b = new ImpactEvents();
  a.receive(event()); b.receive(event());
  assert.equal(a.finish(b.completionToken('hit')), false);
  assert.equal(a.finish(a.completionToken('unknown')), false);
  a.dispose(); assert.equal(b.active.size, 1);
});
test('input and snapshot coordinates are copied; frozen events remain unchanged', () => {
  const p = new ImpactEvents(), e = Object.freeze(event({ point: Object.freeze({ x: 10, y: 20 }) }));
  p.receive(e); p.snapshot()[0].point.x = 999;
  assert.equal(p.snapshot()[0].point.x, 10);
  assert.equal(e.point.x, 10);
});
test('invalid lifetime, time, revision or position is rejected', () => {
  assert.throws(() => new ImpactEvents({ duration: 0 }));
  const p = new ImpactEvents();
  assert.throws(() => p.advance(-1)); assert.throws(() => p.advance(NaN));
  assert.throws(() => p.receive(event({ revision: .5 })));
  assert.throws(() => p.receive(event({ point: { x: NaN, y: 0 } })));
  assert.throws(() => p.nextRound('round-1'));
});
