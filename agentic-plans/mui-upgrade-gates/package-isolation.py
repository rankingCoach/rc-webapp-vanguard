"""Reject ancestor dependency leakage from packed-consumer fixtures."""
from pathlib import Path
import json,subprocess,sys
CONSUMERS=('default-declared','default-mui','wp-declared','wp-mui')
MUI=('@mui/material','@mui/system','@mui/x-date-pickers')

def precondition(root,worktree):
 root=Path(root).resolve();worktree=Path(worktree).resolve()
 if root.is_relative_to(worktree):raise ValueError(f'Consumer must be outside worktree: {root}')
 checked=[]
 for ancestor in root.parents:
  checked.append(str(ancestor))
  for package in ('@mui','react'):
   dependency=ancestor/'node_modules'/package
   if dependency.exists():raise ValueError(f'Ancestor dependency can leak into consumer: {dependency}')
 return {'root':str(root),'worktree':str(worktree),'ancestors_checked':checked,'outside_worktree':True,'ancestor_mui_react_absent':True}

def probe(root,mode,worktree):
 if mode not in ('declared','mui'):raise ValueError('Unknown peer mode')
 root=Path(root).resolve();proof=precondition(root,worktree)
 code="""const fs=require('fs'),{createRequire}=require('module');const req=createRequire(process.argv[1]);const out={};for(const name of JSON.parse(process.argv[2])){try{out[name]={status:'FOUND',path:fs.realpathSync(req.resolve(name))};}catch(e){out[name]={status:'ERROR',code:e.code};}}process.stdout.write(JSON.stringify(out));"""
 result=subprocess.run(['node','-e',code,str(root/'package.json'),json.dumps(MUI)],capture_output=True,text=True,timeout=30,check=True);resolved=json.loads(result.stdout);own=(root/'node_modules').resolve()
 for name in MUI:
  row=resolved[name]
  if mode=='declared':
   if row!={'status':'ERROR','code':'MODULE_NOT_FOUND'}:raise ValueError(f'Declared-only {name} unexpectedly resolves: {row}')
  elif row.get('status')!='FOUND' or not Path(row['path']).is_relative_to(own):raise ValueError(f'MUI-present {name} must resolve inside own node_modules: {row}')
 return {**proof,'mode':mode,'packages':resolved}

def main():
 action,worktree,root,*rest=sys.argv[1:];root=Path(root)
 if action=='preflight':result={c:precondition(root/c,worktree) for c in CONSUMERS};dest=root/'isolation-preflight.json'
 elif action=='probe':result=probe(root,rest[0],worktree);dest=root/'isolation-probe.json'
 else:raise ValueError('Unknown isolation action')
 dest.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
if __name__=='__main__':main()
