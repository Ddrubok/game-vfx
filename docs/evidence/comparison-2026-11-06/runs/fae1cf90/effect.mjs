export const duration = 0.6;
export const loop = false;

const ink = '#454b39';
const sage = '#aab28c';
const paleSage = '#c5c7a6';
const ochre = '#bc9150';
const clamp = (v) => Math.max(0, Math.min(1, v));
const easeOut = (v) => 1 - (1 - v) ** 3;

function shard(ctx, x, y, angle, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(-size * .72, size * .24);
  ctx.quadraticCurveTo(-size * .15, -size * .62, size, -size * .42);
  ctx.quadraticCurveTo(size * .42, size * .28, -size * .72, size * .24);
  ctx.fillStyle = color;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.1;
  ctx.lineJoin = 'round';
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// Coordinates are drawn at 256 px, with the landing point at (128, 153).
export function drawEffect(ctx, timeSeconds, options = {}) {
  if (timeSeconds < 0 || timeSeconds >= duration) return;
  const travel = options.reducedMotion ? .48 : 1;
  const appear = easeOut(clamp(timeSeconds / .075));
  const fade = 1 - easeOut(clamp((timeSeconds - .34) / .26));
  const alpha = appear * fade;
  if (alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // The puff spreads close to the ground instead of forming a circular blast.
  const spread = easeOut(clamp((timeSeconds - .025) / .28)) * travel;
  const lift = Math.sin(Math.PI * clamp(timeSeconds / .48)) * travel;
  ctx.save();
  ctx.translate(128, 151 - lift * 4);
  ctx.scale(.55 + spread * .48, .45 + spread * .5);
  ctx.beginPath();
  ctx.moveTo(-30, 2);
  ctx.quadraticCurveTo(-46, 0, -48, -9);
  ctx.quadraticCurveTo(-51, -17, -40, -20);
  ctx.quadraticCurveTo(-37, -30, -26, -27);
  ctx.quadraticCurveTo(-19, -38, -7, -31);
  ctx.quadraticCurveTo(2, -39, 12, -29);
  ctx.quadraticCurveTo(25, -33, 29, -22);
  ctx.quadraticCurveTo(44, -22, 42, -11);
  ctx.quadraticCurveTo(42, -3, 31, 1);
  ctx.quadraticCurveTo(12, 4, -3, 3);
  ctx.quadraticCurveTo(-17, 5, -30, 2);
  ctx.closePath();
  ctx.fillStyle = paleSage;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.7;
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // A few offset paper fragments give the landing a directional, organic edge.
  const fly = easeOut(clamp(timeSeconds / .31)) * travel;
  shard(ctx, 100 - 15 * fly, 132 - 13 * fly, -.55 - fly * .26, 10, sage);
  shard(ctx, 151 + 15 * fly, 134 - 20 * fly, .64 + fly * .24, 8, sage);
  shard(ctx, 124 + 7 * fly, 127 - 17 * fly, -.1 + fly * .3, 6, ochre);

  // Short ink ground marks remain inside the same fade envelope.
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(91 - 9 * spread, 155);
  ctx.quadraticCurveTo(87 - 9 * spread, 157, 83 - 9 * spread, 155);
  ctx.moveTo(159 + 8 * spread, 154);
  ctx.quadraticCurveTo(165 + 8 * spread, 152, 169 + 8 * spread, 154);
  ctx.stroke();
  ctx.restore();
}
