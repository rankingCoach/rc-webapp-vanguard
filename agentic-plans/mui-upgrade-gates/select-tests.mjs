import fs from 'node:fs';
import {planSelection,resolveSelection} from './selection-policy.mjs';
const [request,output]=process.argv.slice(2);
const {before,after,component,failedFiles}=JSON.parse(fs.readFileSync(request));
const plan=planSelection(before,after,{component,failedFiles});
const selected=plan.changed.length||component||failedFiles?await resolveSelection({...plan,full:plan.tier===3}):[];
fs.writeFileSync(output,JSON.stringify({...plan,selected},null,2)+'\n');
