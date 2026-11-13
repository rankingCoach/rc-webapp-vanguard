const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mui-lint-zero-'));
try{
 const report=path.join(dir,'lint.json'),base=path.join(dir,'warnings.json');
 const warning={severity:'warning',category:'lint/example',message:'existing warning',location:{path:'src/Existing.tsx',start:{line:1,column:1}}};
 fs.writeFileSync(base,JSON.stringify({inventory:{[JSON.stringify([warning.location.path,warning.category,warning.message])]:1}}));
 const check=(diagnostics,exit)=>{fs.writeFileSync(report,JSON.stringify({summary:{errors:diagnostics.filter(d=>d.severity==='error').length,warnings:diagnostics.filter(d=>d.severity==='warning').length,diagnosticsNotPrinted:0},diagnostics}));const r=spawnSync(process.execPath,[path.join(__dirname,'compare-clean-biome.cjs'),report,base,process.cwd()],{encoding:'utf8'});assert.equal(r.status,exit,r.stdout+r.stderr);};
 check([],0);check([warning],0);check([{...warning,location:{...warning.location,start:{line:999,column:1}}}],0);
 check([{...warning,severity:'error'}],1);check([warning,warning],1);check([{...warning,message:'new warning'}],1);check([{...warning,location:{...warning.location,path:'src/New.tsx'}}],1);
 console.log('PASS: zero errors required; stable existing warnings allowed; extra/different warnings rejected');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
