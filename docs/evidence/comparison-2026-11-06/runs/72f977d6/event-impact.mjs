// Presentation only. Event authority and gameplay state stay with the caller.
const validKey = value =>
  (typeof value === 'string' && value.length > 0 && value.length <= 128) ||
  (typeof value === 'number' && Number.isSafeInteger(value));
const validLimit = value => Number.isSafeInteger(value) && value >= 0;

export class ImpactEvents {
  constructor({ round = 'round-1', duration = 0.8, maxActive = 128, maxHistory = 4096 } = {}) {
    if (!validKey(round) || !Number.isFinite(duration) || duration <= 0 ||
        !validLimit(maxActive) || !validLimit(maxHistory)) throw new TypeError('options');
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
    if (!e || !validKey(e.id) || !validKey(e.round) ||
        !Number.isSafeInteger(e.revision) || e.revision < 1 ||
        !['pending', 'confirmed', 'rejected'].includes(e.state)) throw new TypeError('event');
    if (e.state !== 'rejected' || e.point !== undefined) {
      if (!Number.isFinite(e.point?.x) || !Number.isFinite(e.point?.y)) throw new TypeError('point');
    }
    if (this.closed || e.round !== this.round) return false;
    const prior = this.history.get(e.id);
    if (prior?.finished || (prior && e.revision <= prior.revision) ||
        (prior?.state === 'confirmed' && e.state === 'pending')) return false;
    if (!prior && this.history.size >= this.maxHistory) return false;

    const firstConfirmation = e.state === 'confirmed' && prior?.state !== 'confirmed';
    const record = prior ?? { revision: 0, state: 'pending', born: this.clock,
      phase: 0, finished: false, previewExpired: false };
    record.revision = e.revision;
    if (firstConfirmation) {
      record.born = this.clock;
      record.phase++;
    }
    record.state = e.state;
    if (e.state === 'rejected') {
      record.finished = true;
      this.active.delete(e.id);
    } else if (e.state === 'confirmed') {
      const cue = this.active.get(e.id);
      if (cue) {
        cue.kind = 'impact';
        cue.point = { x: e.point.x, y: e.point.y };
      } else if (firstConfirmation && this.active.size < this.maxActive) {
        this.active.set(e.id, { kind: 'impact', point: { x: e.point.x, y: e.point.y } });
      }
      if (firstConfirmation && this.active.has(e.id)) this.bursts++;
    } else if (!record.previewExpired) {
      const cue = this.active.get(e.id);
      if (cue) cue.point = { x: e.point.x, y: e.point.y };
      else if (this.active.size < this.maxActive) {
        this.active.set(e.id, { kind: 'preview', point: { x: e.point.x, y: e.point.y } });
      }
    }
    this.history.set(e.id, record);
    return true;
  }

  completionToken(id) {
    const record = this.history.get(id);
    return Object.freeze({ owner: this, generation: this.generation, id,
      phase: record?.phase });
  }

  finish(token) {
    if (this.closed || token?.owner !== this || token.generation !== this.generation) return false;
    const record = this.history.get(token.id);
    if (!record || record.finished || token.phase !== record.phase ||
        (record.state === 'pending' && record.previewExpired)) return false;
    this.active.delete(token.id);
    if (record.state === 'pending') record.previewExpired = true;
    else record.finished = true;
    return true;
  }

  advance(seconds, { paused = false } = {}) {
    if (!Number.isFinite(seconds) || seconds < 0) throw new TypeError('elapsed seconds');
    if (this.closed || paused) return;
    this.clock += seconds;
    for (const [id, record] of this.history) {
      if (record.finished || record.previewExpired && record.state === 'pending') continue;
      const end = record.born + this.duration;
      if (this.clock + Number.EPSILON * Math.max(1, this.clock, end) >= end)
        this.finish(this.completionToken(id));
    }
  }

  snapshot() {
    return [...this.active].map(([id, cue]) => ({ id, kind: cue.kind,
      point: { ...cue.point }, age: this.clock - this.history.get(id).born }));
  }

  nextRound(round) {
    if (this.closed || !validKey(round) || round === this.round) throw new Error('new live round required');
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
