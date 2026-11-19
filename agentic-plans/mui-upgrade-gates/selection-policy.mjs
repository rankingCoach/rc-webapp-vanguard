import path from 'node:path';
import fs from 'node:fs';
import { createVitest } from 'vitest/node';

const gate = 'agentic-plans/mui-upgrade-gates/';
const executable = p => /\.(?:[cm]?[jt]sx?|json|ya?ml|scss|css|sh|py)$/.test(p) || p === '.pnpmfile.cjs';
export const isInput = p => executable(p) && !p.startsWith('out/') && !p.split('/').some(x=>['node_modules','dist','dist-wordpress','coverage','__pycache__'].includes(x)) && (!p.startsWith('agentic-plans/') || (p.startsWith(gate) && !p.startsWith(gate+'out/')));
const shared = p => !/\.(?:spec|stories|story)\.[cm]?[jt]sx?$/.test(p) && ( /^(?:package\.json|(?:pnpm|package)-lock\.(?:yaml|json)|\.pnpmfile\.cjs|(?:vitest|vite|tsconfig)[^/]*|biome\.json)$/.test(p)
  || p.startsWith('.storybook/') || p.startsWith('test-utils/') || p.startsWith('src/test-utils/')
  || p.startsWith('src/styles/') || p.startsWith('src/core/_internal/') || /(?:^|\/)(?:theming|themes?)(?:\/|\.)/i.test(p)
  || p.startsWith(gate));
export function planSelection(before, after, {component, failedFiles} = {}) {
  const changed = [...new Set([...Object.keys(before),...Object.keys(after)])].filter(p=>isInput(p)&&before[p]!==after[p]).sort();
  const triggers = changed.filter(p=>shared(p)||!(p in after));
  const projects=['spec','storybook',...(changed.some(p=>p.startsWith('scripts/'))?['scripts']:[])];
  return {tier:triggers.length?3:component?2:1,changed,projects,triggers,component:component??null,failedFiles:failedFiles??null,
    packageRequired:changed.some(p=>p.startsWith('src/')||/^package\.json$|lock\.(yaml|json)$|^vite\.config\./.test(p))};
}
export async function resolveSelection({root=process.cwd(),changed=[],projects=['spec','storybook'],component,failedFiles,full=false}) {
  root=fs.realpathSync(root);
  process.env.VITEST='true';
  const ctx=await createVitest('test',{root,config:path.join(root,'vitest.config.'+(fs.existsSync(path.join(root,'vitest.config.ts'))?'ts':'mjs')),watch:false,project:projects,related:changed.map(p=>path.resolve(root,p))});
  try {
    let specs;
    if(component) {
      const sourceFiles=[];
      const walk=dir=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.[cm]?[jt]sx?$/.test(p)&&!/\.(?:spec|stories|story)\./.test(p))sourceFiles.push(p);}};
      walk(path.resolve(root,component));
      ctx.config.related=[...new Set([...(ctx.config.related??[]),...sourceFiles])];
    }
    if(full){specs=await ctx.globTestSpecifications();}
    else if(failedFiles){specs=await ctx.globTestSpecifications(failedFiles);}
    else {
      specs=await ctx.getRelevantTestSpecifications();
      if(component) specs.push(...await ctx.globTestSpecifications([component]));
    }
    const unique=new Map(specs.map(s=>{
      const project=s.project.name.replace(/ \(.*\)$/,''); const file=path.relative(root,s.moduleId);
      return [project+':'+file,{project,file}];
    }));
    return [...unique.values()].sort((a,b)=>(a.project+':'+a.file).localeCompare(b.project+':'+b.file));
  } finally {await ctx.close();}
}
