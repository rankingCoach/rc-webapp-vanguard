"""Manifest-based test selection; all execution uses the owned sleep-aware bounded runner."""
from pathlib import Path
import argparse,hashlib,json,os,subprocess,sys,re
G=Path(__file__).resolve().parent;R=G.parent.parent
sys.path.insert(0,str(G));from bounded_runner import run,atomic_json

def manifest():
 p=subprocess.run(['git','ls-files','-z','--cached','--others','--exclude-standard'],cwd=R,capture_output=True,check=True)
 generated={'.tsbuildinfo-app','dynamic-import-analysis.json','dynamic-import-analysis-simple.json'}
 skip={'node_modules','out','dist','dist-wordpress','coverage','__pycache__'}
 return {n:hashlib.sha256((R/n).read_bytes()).hexdigest() for n in sorted(set(p.stdout.decode().split('\0'))- {''}) if (R/n).is_file() and Path(n).name not in generated and not skip.intersection(Path(n).parts)}

def main():
 ap=argparse.ArgumentParser();ap.add_argument('mode',choices=['snapshot','inner','failed','component','stage']);ap.add_argument('--baseline',required=True,type=Path);ap.add_argument('--out',type=Path);ap.add_argument('--component');ap.add_argument('--failed-report',type=Path);ap.add_argument('--package-green',type=Path);ap.add_argument('--audit-command',type=Path,help='Stage-specific argv JSON: build diagnostics, tarball bytes/pins and frozen proofs');a=ap.parse_args();os.chdir(R)
 if a.mode=='snapshot':atomic_json(a.baseline,manifest());return
 assert a.out and not a.out.exists(),'fresh evidence directory required';a.out.mkdir(parents=True);O=a.out.resolve();os.environ['MUI_GATE_OUT']=str(O);current=manifest();atomic_json(O/'inputs-before.json',current);baseline=json.loads(a.baseline.read_text());result=[]
 def command(name,args):
  d=run(args,1800,O/(name+'-process.json'),O/(name+'.log'),inhibit=True);result.append({'gate':name,**d});atomic_json(O/'results.json',result)
  assert d['validity']=='VALID' and d['reported_exit']==0 and not d['timeout'],name+' STOP; no automatic retry'
 def vitest(name,args):
  report=O/(name+'-tests.json');command(name,['pnpm','vitest',*args,'--maxWorkers=1','--no-file-parallelism','--reporter=default','--reporter=json','--outputFile.json='+str(report)]);return json.loads(report.read_text())
 failed=None
 if a.mode=='failed':
  assert a.failed_report and a.component,'failed report and component required'
  data=json.loads(a.failed_report.read_text());failed=sorted({str(Path(t['name']).resolve().relative_to(R)) for t in data['testResults'] if t['status']=='failed' or any(x['status']=='failed' for x in t['assertionResults'])});assert failed
 payload={'before':baseline,'after':current,'component':a.component if a.mode=='component' else None,'failedFiles':failed}
 atomic_json(O/'selection-request.json',payload)
 command('selection',['node',str(G/'select-tests.mjs'),str(O/'selection-request.json'),str(O/'selection.json')]);plan=json.loads((O/'selection.json').read_text())
 if a.mode!='stage' and plan['tier']==3:raise RuntimeError('Shared/deleted input requires Tier 3: '+str(plan['triggers']))
 if a.mode=='stage':
  assert a.audit_command,'stage-specific diagnostic/byte/pin/frozen audit is mandatory'
  for name,args in [('static-selftest',['bash',str(G/'selftest.sh')]),('suite-selftest',['bash',str(G/'suite-selftest.sh')]),('coverage-selftest',['bash',str(G/'coverage-selftest.sh')]),('runner-selftests',[sys.executable,'-m','unittest','discover','-s',str(G),'-p','test_bounded_runner.py']),('package-count-selftest',[sys.executable,'-m','unittest','discover','-s',str(G),'-p','test_package_counts.py']),('package-isolation-selftest',[sys.executable,'-m','unittest','discover','-s',str(G),'-p','test_package_isolation.py']),('stage-audit-selftest',[sys.executable,'-m','unittest','discover','-s',str(G),'-p','test_s5b_stage_audit.py']),('scripts-resolution',['node',str(G/'scripts-project-selftest.mjs')]),('discovery',['node',str(G/'discovery-selftest.mjs')])]:command(name,args)
  command('static',['bash',str(G/'gates.sh'),O.name+'-static'])
  command('lint-zero',['pnpm','lint:err'])
  vitest('scripts',['run','--project','scripts'])
  names=json.loads((G/'c1-test-names.json').read_text());pattern='|'.join('^'+re.escape(n)+'$' for n in names)
  data=vitest('c1',['run','--project','spec','src/core/Autocomplete/_Autocomplete.mui.spec.tsx','--testNamePattern',pattern]);rows=[x for t in data['testResults'] for x in t['assertionResults'] if x['status']=='passed'];assert len(rows)==3 and {x['fullName'] for x in rows}==set(names);assert all(x['duration']<2500 for x in rows),'C1 escalation';atomic_json(O/'c1.json',rows)
  command('coverage',['bash',str(G/'coverage.sh'),O.name+'-coverage'])
  coverage_tests=json.loads((G/'out'/(O.name+'-coverage')/'tests.json').read_text());assert coverage_tests['numFailedTests']==0 and coverage_tests['numPendingTests']==0 and coverage_tests.get('numTodoTests',0)==0,'unexpected coverage skips/failures'
  atomic_json(O/'coverage-test-counts.json',{k:v for k,v in coverage_tests.items() if k.startswith('num')})
  package_baseline=json.loads(a.package_green.read_text()) if a.package_green else {};needs_package=any(h!=package_baseline.get(p) for p,h in current.items() if p.startswith('src/') or p in ['package.json','pnpm-lock.yaml'] or p.startswith('vite.config.')) or any(p not in current for p in package_baseline if p.startswith('src/'))
  package_output=Path('/tmp/mui-upgrade')/(O.name+'-package');package_output.parent.mkdir(parents=True,exist_ok=True)
  atomic_json(O/'package-selection.json',{'required':needs_package,'baseline':str(a.package_green) if a.package_green else None,'output':str(package_output)})
  if needs_package:
   assert not package_output.exists(),'fresh isolated package root required'
   os.environ['PACKAGE_FIXTURE_OUT']=str(package_output);command('package',['bash',str(G/'package.sh')])
  else:command('build',['pnpm','run','build'])
  command('stage-audit',json.loads(a.audit_command.read_text()))
 else:
  command('static',['bash',str(G/'gates.sh'),O.name+'-static'])
  selected=plan['selected'];assert selected or not plan['changed'],'changed input selects no tests; investigate'
  if selected:
   projects=[p for name in plan['projects'] for p in ['--project',name]]
   if a.mode=='inner':data=vitest('related',['related',*plan['changed'],'--run',*projects])
   else:data=vitest('selected',['run',*sorted({s['file'] for s in selected}),*projects])
   assert data['numPendingTests']==0 and data.get('numTodoTests',0)==0,'unexpected skip'
   actual={str(Path(t['name']).resolve().relative_to(R)) for t in data['testResults']};assert actual=={s['file'] for s in selected},'resolved selection and execution differ'
 after=manifest();delta={p for p in set(current)|set(after) if current.get(p)!=after.get(p)};assert not delta,'input drift: '+str(delta);atomic_json(O/'input-integrity.json',{'changed':[],'added':[]})
 if a.mode in ['component','stage']:
  atomic_json(O/'GREEN-manifest.json',after)
  if a.mode=='stage' and needs_package:atomic_json(O/'package-GREEN-manifest.json',after)
 else:atomic_json(O/'next-step.json',{'required':'component tier 2 before promoting GREEN baseline','component':a.component})

if __name__=='__main__':main()
