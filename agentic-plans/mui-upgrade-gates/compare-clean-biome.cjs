const fs=require('node:fs'),path=require('node:path');
const [reportPath,baselinePath,root]=process.argv.slice(2);
const report=JSON.parse(fs.readFileSync(reportPath,'utf8'));
if(!report.summary||!Array.isArray(report.diagnostics)||report.summary.diagnosticsNotPrinted!==0||!Number.isInteger(report.summary.errors)||!Number.isInteger(report.summary.warnings))throw new Error('Missing, malformed or truncated Biome report');
const warnings=new Map();let errors=0,warningCount=0;
for(const d of report.diagnostics){
 if(!['error','fatal','warning'].includes(d.severity))continue;
 if(!d.location||typeof d.location.path!=='string'||typeof d.category!=='string'||typeof d.message!=='string')throw new Error('Malformed diagnostic identity');
 if(d.severity==='error'||d.severity==='fatal'){errors++;continue;}
 const file=path.isAbsolute(d.location.path)?path.relative(root,d.location.path):d.location.path;
 const identity=JSON.stringify([file,d.category,d.message]);warnings.set(identity,(warnings.get(identity)||0)+1);warningCount++;
}
if(errors!==report.summary.errors||warningCount!==report.summary.warnings)throw new Error('Incomplete diagnostic inventory');
const baseline=JSON.parse(fs.readFileSync(baselinePath,'utf8')).inventory;
if(!baseline||typeof baseline!=='object')throw new Error('Malformed master warning baseline');
const introduced=[...warnings].filter(([identity,n])=>n>(baseline[identity]||0));
console.log(`Biome: ${errors} errors (must be 0); ${warningCount} warnings, ${introduced.length} introduced identities`);
introduced.slice(0,40).forEach(([identity,n])=>console.log(identity+' '+(baseline[identity]||0)+' -> '+n));
process.exit(errors||introduced.length?1:0);
