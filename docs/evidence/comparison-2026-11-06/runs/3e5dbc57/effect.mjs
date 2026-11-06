export const duration = 0.8;
export const loop = false;

export function drawEffect(ctx, timeSeconds, { state = 'confirmed', reducedMotion = false } = {}) {
  if (timeSeconds < 0 || timeSeconds >= duration) return;

  const pending = state === 'pending';
  const progress = timeSeconds / duration;

  ctx.save();
  ctx.translate(128, 128);
  ctx.strokeStyle = pending ? '#8a6330' : '#455a39';
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // A fixed, non-color cue remains legible for the entire one-shot.
  ctx.lineWidth = 5;
  ctx.setLineDash(pending ? [7, 6] : []);
  ctx.beginPath();
  ctx.arc(0, 0, 35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  if (pending) {
    for (const x of [-12, 0, 12]) {
      ctx.beginPath();
      ctx.arc(x, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(-4, 12);
    ctx.lineTo(18, -13);
    ctx.stroke();
  }

  if (!reducedMotion) {
    ctx.globalAlpha = (1 - progress) * 0.55;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 43 + 55 * progress, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}
