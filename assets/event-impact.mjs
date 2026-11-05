// Optional local presentation template, not a transport or authority layer.
// Policy: one closed lifetime per event/round; corrections do not restart time.
export class ImpactEvents {
  constructor({ round = 'round-1', duration = 0.8 } = {}) {
    if (!round || !Number.isFinite(duration) || duration <= 0) throw new TypeError('round/duration');
    this.round = round;
    this.duration = duration;
    this.generation = 0;
    this.clock = 0;
    this.closed = false;
    this.history = new Map();
    this.active = new Map();
    this.bursts = 0;
  }

  receive(e) {
    if (this.closed || e.round !== this.round) return false;
    if (!e.id || !Number.isSafeInteger(e.revision) || e.revision < 1 ||
        !['pending', 'confirmed', 'rejected'].includes(e.state)) throw new TypeError('event');
    if (e.state !== 'rejected' && (!Number.isFinite(e.point?.x) || !Number.isFinite(e.point?.y))) {
      throw new TypeError('point');
    }
    const prior = this.history.get(e.id);
    if (prior?.finished || (prior && e.revision <= prior.revision)) return false;
    if (prior && prior.state !== 'pending' && e.state === 'pending') return false;
    const confirmedBefore = prior?.confirmedBefore ?? false;
    const record = { revision: e.revision, state: e.state,
      born: prior?.born ?? this.clock,
      confirmedBefore: confirmedBefore || e.state === 'confirmed', finished: e.state === 'rejected' };
    this.history.set(e.id, record);
    if (record.finished) this.active.delete(e.id);
    else {
      this.active.set(e.id, { kind: e.state === 'pending' ? 'preview' : 'impact', point: { ...e.point } });
      if (e.state === 'confirmed' && !confirmedBefore) this.bursts++;
    }
    return true;
  }

  completionToken(id) {
    return Object.freeze({ owner: this, generation: this.generation, id });
  }

  finish(token) {
    if (this.closed || token?.owner !== this || token.generation !== this.generation) return false;
    const record = this.history.get(token.id);
    if (!record || record.finished) return false;
    record.finished = true;
    this.active.delete(token.id);
    return true; // Keep the tombstone until the round ends.
  }

  advance(seconds, { paused = false } = {}) {
    if (!Number.isFinite(seconds) || seconds < 0) throw new TypeError('elapsed seconds');
    if (this.closed || paused) return;
    this.clock += seconds;
    for (const id of this.active.keys()) {
      // Account for floating-point addition at a boundary such as .1 + .7.
      const end = this.history.get(id).born + this.duration;
      if (this.clock + Number.EPSILON * Math.max(1, this.clock, end) >= end) this.finish(this.completionToken(id));
    }
  }

  snapshot() {
    return [...this.active].map(([id, cue]) => ({ id, kind: cue.kind,
      point: { ...cue.point }, age: this.clock - this.history.get(id).born }));
  }

  nextRound(round) {
    if (this.closed || !round || round === this.round) throw new Error('new live round required');
    this.generation++;
    this.round = round;
    this.clock = 0;
    this.history.clear();
    this.active.clear();
  }

  dispose() {
    this.closed = true;
    this.generation++;
    this.active.clear();
    this.history.clear();
  }
}
