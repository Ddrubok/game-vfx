export const duration = 1.2;
export const loop = true;

const embers = [
  { x: 88, y: 178, size: 2.6, phase: 0.10, drift: 4.0 },
  { x: 112, y: 166, size: 3.2, phase: 0.30, drift: -3.5 },
  { x: 137, y: 183, size: 2.5, phase: 0.50, drift: 3.0 },
  { x: 160, y: 170, size: 3.0, phase: 0.70, drift: -4.0 },
  { x: 185, y: 178, size: 2.4, phase: 0.90, drift: 3.5 },
];

export function drawEffect(ctx, timeSeconds, { reducedMotion = false } = {}) {
  const time = Number.isFinite(timeSeconds) ? timeSeconds : 0;
  const cycle = ((time / duration) % 1 + 1) % 1;

  ctx.save();
  for (const ember of embers) {
    const phase = reducedMotion ? ember.phase : (cycle + ember.phase) % 1;
    const x = ember.x + (reducedMotion ? 0 : ember.drift * Math.sin(phase * Math.PI * 2));
    const y = ember.y - (reducedMotion ? 12 : phase * 36);
    // Fade to transparent before the position wraps to the bottom.
    const fade = reducedMotion ? 0.75 : Math.min(1, phase * 9, (1 - phase) * 9) * 0.78;
    const radius = ember.size;

    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 5);
    glow.addColorStop(0, `rgba(219, 151, 59, ${fade * 0.25})`);
    glow.addColorStop(0.4, `rgba(191, 120, 39, ${fade * 0.10})`);
    glow.addColorStop(1, 'rgba(191, 120, 39, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius * 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = fade * 0.38;
    ctx.fillStyle = '#b97831';
    ctx.beginPath();
    ctx.ellipse(x, y + radius * 1.2, radius * 0.65, radius * 2.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = fade;
    ctx.fillStyle = '#d39a50';
    ctx.beginPath();
    ctx.ellipse(x, y, radius * 0.72, radius, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#efd09a';
    ctx.beginPath();
    ctx.arc(x - radius * 0.16, y - radius * 0.22, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
