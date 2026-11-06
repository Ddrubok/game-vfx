import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const root=path.dirname(fileURLToPath(import.meta.url));
const {mapping}=JSON.parse(await fs.readFile(path.join(root,'manifest.json'),'utf8'));
const require=createRequire(path.join(path.resolve(process.env.VFX_TOOL_ROOT || root), 'package.json'));
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true});
const server=createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost');const p=path.resolve(root,'.'+u.pathname);if(!p.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',p.endsWith('.mjs')?'text/javascript':'text/html');res.end(await fs.readFile(p));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const all=[];
const completed=JSON.parse(await fs.readFile(path.join(root,'execution.json'),'utf8')).map(x=>x.label);
try{for(const m of mapping.filter(x=>x.kind!=='godot'&&completed.includes(x.label)&&!all.some(y=>y.label===x.label))){
 const dir=path.join(root,'runs',m.label),checks=[],errors=[];
 const check=(name,value)=>checks.push({name,pass:!!value});
 try{
 if(m.kind==='visual'){
 const page=await browser.newPage({viewport:{width:900,height:640}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/runs/${m.label}/preview.html`);await page.waitForFunction(()=>window.fx);
 const metrics=await page.evaluate(task=>{
  const c=document.querySelector('canvas'),ctx=c.getContext('2d');
  const frame=(t,o={})=>{ctx.clearRect(0,0,256,256);fx.drawEffect(ctx,t,o);return [...ctx.getImageData(0,0,256,256).data];};
  const alpha=a=>a.filter((_,i)=>i%4===3),same=(a,b)=>a.every((v,i)=>v===b[i]);
  const a=frame(.1),b=frame(.4),end=frame(fx.duration);
  const out={duration:fx.duration,loop:fx.loop,visible:a.some((v,i)=>i%4===3&&v),deterministic:same(a,frame(.1)),ends:!end.some((v,i)=>i%4===3&&v)};
  if(task==='recolor'){
   const original=(t)=>{ctx.clearRect(0,0,256,256);const p=t/.8;ctx.save();ctx.translate(128,128);ctx.strokeStyle='#e34860';ctx.globalAlpha=1-p;ctx.lineWidth=6*(1-p);ctx.beginPath();ctx.arc(0,0,10+90*p,0,Math.PI*2);ctx.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(Math.cos(a)*(20+65*p),Math.sin(a)*(20+65*p));ctx.lineTo(Math.cos(a)*(30+65*p),Math.sin(a)*(30+65*p));ctx.stroke();}ctx.restore();return [...ctx.getImageData(0,0,256,256).data];};
   out.alphaPreserved=[.1,.4,.7].every(t=>same(alpha(frame(t)),alpha(original(t))));
   let count=0,match=0;for(let i=0;i<a.length;i+=4)if(a[i+3]>30){count++;if(Math.abs(a[i]-85)<=5&&Math.abs(a[i+1]-187)<=5&&Math.abs(a[i+2]-170)<=5)match++;}out.tealRatio=match/count;
  }
  if(task==='loop'){
   const left=frame(1.2-.001),right=frame(1.2+.001);out.seamMean=left.reduce((n,v,i)=>n+Math.abs(v-right[i]),0)/left.length;
   out.periodic=same(frame(.25),frame(3.85));out.laterVisible=frame(3.85).some((v,i)=>i%4===3&&v);
   out.staticReduced=same(frame(.1,{reducedMotion:true}),frame(.7,{reducedMotion:true}));
  }
  if(task==='reduced'){
   const p=frame(.1,{state:'pending',reducedMotion:true}),q=frame(.1,{state:'confirmed',reducedMotion:true});
   out.nonColorDistinct=!same(alpha(p),alpha(q));out.bothVisible=[p,q].every(a=>a.some((v,i)=>i%4===3&&v));
   out.staticReduced=['pending','confirmed'].every(state=>same(frame(.1,{state,reducedMotion:true}),frame(.4,{state,reducedMotion:true}))&&same(frame(.4,{state,reducedMotion:true}),frame(.7,{state,reducedMotion:true})));
  }
  return out;
 },m.task);
 check('visible',metrics.visible);check('deterministic',metrics.deterministic);
 if(m.task!=='loop')check('ends transparent',metrics.ends);
 if(m.task==='recolor'){check('duration preserved',metrics.duration===.8);check('geometry/alpha preserved',metrics.alphaPreserved);check('requested teal',metrics.tealRatio>.98);}
 if(m.task==='style')check('duration 0.6',metrics.duration===.6);
 if(m.task==='loop'){check('loop contract',metrics.loop&&metrics.duration===1.2);check('seam mean difference <1',metrics.seamMean<1);check('period repeat',metrics.periodic);check('later visible',metrics.laterVisible);check('static reduced motion',metrics.staticReduced);}
 if(m.task==='reduced'){check('non-color distinction',metrics.nonColorDistinct);check('both states visible',metrics.bothVisible);check('static reduced motion',metrics.staticReduced);}
 await fs.mkdir(path.join(root,'recheck',m.label),{recursive:true});
 for(const [name,t,o] of [['early',.1,{}],['middle',.3,{}],['late',.5,{}],['pending-reduced',.2,{state:'pending',reducedMotion:true}],['confirmed-reduced',.2,{state:'confirmed',reducedMotion:true}]]){
 await page.evaluate(([t,o])=>render(t,o),[t,o]);await page.screenshot({path:path.join(root,'recheck',m.label,name+'.png')});
 }
 await page.close();all.push({...m,checks,errors,metrics});continue;
 }
 if(m.kind==='events'){
 const {ImpactEvents}=await import(pathToFileURL(path.join(dir,'event-impact.mjs')));
 const e=(x={})=>({id:'hit',round:'round-1',revision:1,state:'pending',point:{x:5,y:8},...x});
 let p=new ImpactEvents();p.receive(e());const token=p.completionToken('hit');p.advance(.81);const accepted=p.receive(e({revision:2,state:'confirmed'}));
 check('late confirmation displays',accepted&&p.active.size===1&&p.bursts===1);check('late phase starts at zero',p.snapshot()[0]?.age===0);
 check('old pending token cannot finish confirmed',p.finish(token)===false&&p.active.size===1);
 p.advance(.4);p.receive(e({revision:3,state:'confirmed',point:{x:30,y:40}}));p.receive(e({revision:3,state:'confirmed'}));check('correction retains age and one burst',Math.abs(p.snapshot()[0]?.age-.4)<1e-9&&p.snapshot()[0]?.point.x===30&&p.bursts===1);p.advance(.4);check('confirmed completes',p.active.size===0);check('finished cannot revive',p.receive(e({revision:99,state:'confirmed'}))===false&&p.active.size===0);
 p=new ImpactEvents();p.receive(e());p.advance(.79);p.receive(e({revision:2,state:'confirmed'}));p.advance(.02);check('near expiry confirmation retains full phase',p.active.size===1&&p.snapshot()[0]?.age<.03);
 p=new ImpactEvents();p.receive(e());p.receive(e({revision:2,state:'rejected'}));check('reject terminal',p.receive(e({revision:3,state:'confirmed'}))===false&&p.active.size===0);
 p=new ImpactEvents();const old=p.completionToken('hit');p.nextRound('new');p.receive(e({round:'new'}));check('old round callback rejected',p.finish(old)===false&&p.active.size===1);p.dispose();check('disposed stays closed',p.receive(e({round:'new',revision:2,state:'confirmed'}))===false&&p.history.size===0);
 p=new ImpactEvents();let invalid=true;for(const id of [{x:1},[],null,'','x'.repeat(129)]){try{p.receive(e({id}));invalid=false;}catch{}}check('invalid IDs before mutation',invalid&&p.history.size===0);
 p=new ImpactEvents({maxActive:1,maxHistory:2});for(let id=0;id<10000;id++){try{p.receive(e({id,state:'confirmed'}));}catch{}}check('resources bounded',p.active.size<=1&&p.history.size<=2);p.advance(1);check('capacity does not replay old ID',p.receive(e({id:0,state:'confirmed',revision:9}))===false);
 }
 }catch(e){errors.push(e.stack);}
 all.push({...m,checks,errors});
}
}finally{await browser.close();await new Promise(r=>server.close(r));}
await fs.writeFile(path.join(root,'recheck-verification.json'),JSON.stringify(all,null,2));
console.log(all.map(x=>({task:x.task,label:x.label,pass:x.checks.filter(c=>c.pass).length,total:x.checks.length,errors:x.errors.length})));

if(all.some(x=>x.errors.length||x.checks.some(c=>!c.pass)))process.exitCode=1;
