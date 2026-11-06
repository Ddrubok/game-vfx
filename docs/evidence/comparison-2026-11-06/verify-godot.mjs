import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {selectCases, assertResults} from './checks.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const {mapping}=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
const execution=JSON.parse(fs.readFileSync(path.join(root,'execution.json'),'utf8'));
const selected=selectCases(mapping,execution,true);
const expected=JSON.parse(fs.readFileSync(path.join(root,'godot-verification.json'),'utf8'));
const exe=process.env.VFX_GODOT_PATH || 'godot';
const results=[];
for(const m of selected){
 const dir=path.join(root,'runs',m.label);fs.copyFileSync(path.join(root,'godot-heldout.gd'),path.join(dir,'heldout.gd'));
 const imp=spawnSync(exe,['--headless','--path',dir,'--editor','--import','--quit'],{encoding:'utf8',timeout:30000,windowsHide:true});
 fs.rmSync(path.join(dir,'heldout-results.json'),{force:true});
 const run=spawnSync(exe,['--headless','--path',dir,'--script','res://heldout.gd'],{encoding:'utf8',timeout:30000,windowsHide:true});
 fs.mkdirSync(path.join(root,'recheck',m.label),{recursive:true});
 fs.writeFileSync(path.join(root,'recheck',m.label,'godot.log'),[imp.stdout,imp.stderr,run.stdout,run.stderr].join('\n'));
 let checks=[];try{checks=JSON.parse(fs.readFileSync(path.join(dir,'heldout-results.json'),'utf8'));}catch{}
 results.push({...m,importExit:imp.status,runExit:run.status,checks,error:run.error?.message,scriptErrors:(run.stderr||'').includes('SCRIPT ERROR')});
}
fs.writeFileSync(path.join(root,'recheck-godot-verification.json'),JSON.stringify(results,null,2));console.log(results.map(x=>({label:x.label,checks:x.checks.length,passed:x.checks.filter(c=>c.pass).length,scriptErrors:x.scriptErrors})));

assertResults(results,expected);
if(results.some(x=>x.importExit!==0||x.runExit!==0||x.scriptErrors||x.checks.length!==54||x.checks.some(c=>!c.pass)))process.exitCode=1;
