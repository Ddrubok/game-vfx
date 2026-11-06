export const duration = 0.6;
export const loop = false;

const ink = '#454b39';
const paper = '#d3c5a3';
const ochre = '#bc9150';
const sage = '#8d9b70';

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const easeOut = n => 1 - (1 - n) ** 3;

function blob(ctx, x, y, sx, sy, color, weight = 2.6) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sx, sy);
  ctx.beginPath();
  ctx.moveTo(-1, 0.12);
  ctx.bezierCurveTo(-1.04, -0.49, -0.45, -0.95, 0.12, -0.81);
  ctx.bezierCurveTo(0.76, -0.96, 1.09, -0.33, 0.91, 0.19);
  ctx.bezierCurveTo(0.78, 0.7, 0.19, 0.91, -0.23, 0.75);
  ctx.bezierCurveTo(-0.68, 0.88, -1.03, 0.54, -1, 0.12);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = weight / Math.max(sx, sy);
  ctx.strokeStyle = ink;
  ctx.stroke();
  ctx.restore();
}

function leaf(ctx, x, y, angle, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(-size * 0.55, size * 0.24);
  ctx.quadraticCurveTo(-size * 0.15, -size * 0.52, size * 0.72, -size * 0.5);
  ctx.quadraticCurveTo(size * 0.39, size * 0.27, -size * 0.55, size * 0.24);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 2.1;
  ctx.strokeStyle = ink;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();
}

/** Draw one transparent, non-looping seed landing cue on a 256px canvas. */
export function drawEffect(ctx, timeSeconds, options = {}) {
  if (!Number.isFinite(timeSeconds) || timeSeconds < 0 || timeSeconds >= duration) return;
  const t = timeSeconds;
  const reduced = options.reducedMotion === true;
  const spread = reduced ? 0.22 : easeOut(clamp(t / 0.28, 0, 1));
  const fade = 1 - easeOut(clamp((t - (reduced ? 0.25 : 0.3)) / (reduced ? 0.35 : 0.3), 0, 1));
  const appear = 0.55 + 0.45 * clamp(t / 0.035, 0, 1);
  const x = 128, y = 154;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.3, 1.3);
  ctx.translate(-x, -y);
  ctx.globalAlpha = fade * appear;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // A low, broken puff keeps the silhouette grounded; it never forms a ring.
  const swell = 0.74 + 0.26 * spread;
  blob(ctx, x - 15 - 12 * spread, y - 5 - 4 * spread, 15 * swell, 8 * swell, paper);
  blob(ctx, x + 12 + 14 * spread, y - 9 - 7 * spread, 17 * swell, 10 * swell, paper);
  blob(ctx, x - 1, y - 14 - 8 * spread, 19 * swell, 11 * swell, '#c7bb9a');

  // The asymmetric leaf chips borrow the scene's sage fill and ink edge.
  leaf(ctx, x - 24 - 15 * spread, y - 19 - 16 * spread, -0.42 - 0.2 * spread, 12, sage);
  leaf(ctx, x + 18 + 18 * spread, y - 25 - 13 * spread, 2.55 + 0.23 * spread, 10, sage);
  leaf(ctx, x + 4 + 6 * spread, y - 34 - 18 * spread, -1.12, 7, ochre);

  // A short contact mark carries the authoritative landing at small size.
  ctx.globalAlpha = fade * appear * (1 - 0.32 * spread);
  ctx.beginPath();
  ctx.moveTo(x - 17 - 5 * spread, y + 3);
  ctx.quadraticCurveTo(x, y + 9 + 2 * spread, x + 19 + 6 * spread, y + 2);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}
