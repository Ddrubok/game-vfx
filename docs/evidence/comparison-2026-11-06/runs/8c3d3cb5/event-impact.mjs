// Presentation only. The caller remains responsible for authoritative outcomes.
const validIdentity = value =>
  (typeof value === 'string' && value.trim().length > 0 && value.length <= 128) ||
  (typeof value === 'number' && Number.isSafeInteger(value));
const validLimit = value => Number.isSafeInteger(value) && value > 0;

export class ImpactEvents {
  constructor({ round = 'round-1', duration = 0.8, maxActive = 128, maxHistory = 4096 } = {}) {
    if (!validIdentity(round) || !Number.isFinite(duration) || duration <= 0 ||
        !validLimit(maxActive) || !validLimit(maxHistory)) throw new TypeError('configuration');
    this.round = round;
    this.duration = duration;
    this.maxActive = maxActive;
    this.maxHistory = maxHistory;
    this.generation = 0;
    this.clock = 0;
    this.closed = false;
    this.history = new Map();
    this.active = new Map();
    this.bursts = 0;
  }

  receive(e) {
    if (!e || !validIdentity(e.id) || !validIdentity(e.round) ||
        !Number.isSafeInteger(e.revision) || e.revision < 1 ||
        !['pending', 'confirmed', 'rejected'].includes(e.state)) throw new TypeError('event');
    if (e.state !== 'rejected' &&
        (!Number.isFinite(e.point?.x) || !Number.isFinite(e.point?.y))) throw new TypeError('point');
    if (this.closed || e.round !== this.round) return false;
    const prior = this.history.get(e.id);
    if (prior?.finished || (prior && e.revision <= prior.revision)) return false;
    if (prior && prior.state !== 'pending' && e.state === 'pending') return false;
    if (!prior && this.history.size >= this.maxHistory) return false;
    if (e.state === 'rejected') {
      this.history.set(e.id, { revision: e.revision, state: 'rejected',
        born: prior?.born ?? this.clock, phase: prior?.phase ?? 0, finished: true });
      this.active.delete(e.id);
      return true;
    }
    // First confirmation starts a full phase, including after preview expiry.
    const firstConfirmation = e.state === 'confirmed' && prior?.state !== 'confirmed';
    const born = firstConfirmation ? this.clock : prior?.born ?? this.clock;
    const phase = firstConfirmation ? (prior?.phase ?? 0) + 1 : prior?.phase ?? 1;
    const previewExpired = e.state === 'pending' &&
      this.clock + Number.EPSILON * Math.max(1, this.clock, born + this.duration) >= born + this.duration;
    const hasCapacity = this.active.has(e.id) || this.active.size < this.maxActive;
    const canDisplay = !previewExpired && hasCapacity;
    const record = { revision: e.revision, state: e.state, born, phase,
      finished: !previewExpired && !hasCapacity };
    this.history.set(e.id, record);
    if (canDisplay) {
      this.active.set(e.id, { kind: e.state === 'pending' ? 'preview' : 'impact',
        point: { x: e.point.x, y: e.point.y } });
      if (firstConfirmation) this.bursts++;
    } else this.active.delete(e.id);
    return true;
  }

  completionToken(id) {
    if (!validIdentity(id)) throw new TypeError('id');
    return Object.freeze({ owner: this, generation: this.generation,
      round: this.round, id, phase: this.history.get(id)?.phase });
  }

  finish(token) {
    if (this.closed || token?.owner !== this || token.generation !== this.generation ||
        token.round !== this.round) return false;
    const record = this.history.get(token.id);
    if (!record || record.finished || !this.active.has(token.id) ||
        token.phase !== record.phase) return false;
    record.finished = true;
    this.active.delete(token.id);
    return true; // Deduplication survives until round teardown.
  }

  advance(seconds, { paused = false } = {}) {
    if (!Number.isFinite(seconds) || seconds < 0) throw new TypeError('elapsed seconds');
    if (this.closed || paused) return;
    this.clock += seconds;
    for (const id of this.active.keys()) {
      const record = this.history.get(id);
      const end = record.born + this.duration;
      if (this.clock + Number.EPSILON * Math.max(1, this.clock, end) >= end) {
        if (record.state === 'pending') this.active.delete(id);
        else this.finish(this.completionToken(id));
      }
    }
  }

  snapshot() {
    return [...this.active].map(([id, cue]) => ({ id, kind: cue.kind,
      point: { ...cue.point }, age: this.clock - this.history.get(id).born }));
  }

  nextRound(round) {
    if (this.closed || !validIdentity(round) || round === this.round)
      throw new Error('new live round required');
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
