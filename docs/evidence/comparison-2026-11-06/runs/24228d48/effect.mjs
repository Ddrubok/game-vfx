export const duration = 1.2;
export const loop = true;

const embers = [
  { x: 100, phase: 0.10, size: 3.4 },
  { x: 126, phase: 0.30, size: 2.8 },
  { x: 147, phase: 0.50, size: 3.2 },
  { x: 114, phase: 0.70, size: 2.5 },
  { x: 139, phase: 0.90, size: 3.0 },
];

function paintEmber(ctx, x, y, radius, opacity) {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 3.5);
  glow.addColorStop(0, `rgba(188, 145, 80, ${0.36 * opacity})`);
  glow.addColorStop(0.45, `rgba(188, 145, 80, ${0.13 * opacity})`);
  glow.addColorStop(1, 'rgba(188, 145, 80, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, radius * 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(188, 145, 80, ${0.72 * opacity})`;
  ctx.beginPath();
  ctx.ellipse(x, y, radius * 0.72, radius, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawEffect(ctx, timeSeconds, { reducedMotion = false } = {}) {
  if (!Number.isFinite(timeSeconds)) return;
  const cycle = ((timeSeconds % duration) + duration) % duration / duration;
  ctx.save();
  for (const ember of embers) {
    const progress = reducedMotion ? ember.phase : (cycle + ember.phase) % 1;
    // Each ember disappears gently before it returns to the bottom of its path.
    const opacity = reducedMotion ? 0.65 : Math.sin(Math.PI * progress) ** 2;
    const x = ember.x + (reducedMotion ? 0 : 5 * Math.sin(2 * Math.PI * progress + ember.phase * 7));
    const y = 202 - 112 * progress;
    paintEmber(ctx, x, y, ember.size, opacity);
  }
  ctx.restore();
}
