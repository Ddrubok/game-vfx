export const duration=0.8; export const loop=false;
export function drawEffect(ctx,t,{state='confirmed',reducedMotion=false}={}) {
 if(t<0||t>=duration)return; const p=t/duration;
 ctx.save(); ctx.translate(128,128); ctx.strokeStyle='#55bbaa';
 ctx.globalAlpha=1-p; ctx.lineWidth=6*(1-p); ctx.beginPath();ctx.arc(0,0,10+90*p,0,Math.PI*2);ctx.stroke();
 for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(Math.cos(a)*(20+65*p),Math.sin(a)*(20+65*p));ctx.lineTo(Math.cos(a)*(30+65*p),Math.sin(a)*(30+65*p));ctx.stroke();}ctx.restore();
}
