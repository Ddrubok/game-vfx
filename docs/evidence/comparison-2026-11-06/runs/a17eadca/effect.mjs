export const duration = 0.8;
export const loop = false;

const ink = '#454b39';
const paper = '#eee8d5';

export function drawEffect(ctx, timeSeconds, { state = 'confirmed', reducedMotion = false } = {}) {
  if (timeSeconds < 0 || timeSeconds >= duration) return;

  const pending = state === 'pending';
  const progress = timeSeconds / duration;
  ctx.save();
  ctx.translate(128, 128);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Keep the status mark steady. Only the outer flourish moves.
  if (!reducedMotion) {
    ctx.save();
    ctx.globalAlpha = (1 - progress) * 0.55;
    ctx.strokeStyle = pending ? '#bc9150' : '#8d9b70';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 46 + 45 * progress, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = paper;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 43, 0, Math.PI * 2);
  ctx.fill();
  if (pending) ctx.setLineDash([5, 8]);
  ctx.stroke();
  ctx.setLineDash([]);

  if (pending) {
    // Dots and a broken border signal an unfinished status.
    ctx.fillStyle = ink;
    for (const x of [-18, 0, 18]) {
      ctx.beginPath();
      ctx.arc(x, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // The check is present from the first frame through the last.
    ctx.strokeStyle = ink;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(-5, 15);
    ctx.lineTo(23, -17);
    ctx.stroke();
  }

  ctx.restore();
}
