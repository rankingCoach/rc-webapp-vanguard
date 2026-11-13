import sys,json,hashlib,uuid,os,tarfile
from pathlib import Path
R=Path.cwd(); G=R/'agentic-plans/mui-upgrade-gates';sys.path.insert(0,str(G))
from bounded_runner import run,atomic_json
O=G/'out'/('s4a-node-final-'+uuid.uuid4().hex);O.mkdir(); print(O,flush=True)
import shutil,subprocess
for tag in ['red','green']:
 for suffix in ['.log','-process.json','-process.json.resources.json']:
  shutil.copyfile('/tmp/mui-node-'+tag+suffix,O/('resolution-'+tag+suffix))
(O/'start-resources.txt').write_text(subprocess.check_output(['uptime'],text=True)+subprocess.check_output(['ps','-p','84651,85414,85417','-o','pid,ppid,%cpu,command'],text=True))
P=Path('/tmp/mui-upgrade/s4a-node-final-package'); assert not P.exists()
H=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
A=json.loads((G/'approved-frozen-changes.json').read_text()); assert len(A)==3
old=G/'out/s4a-final-d50d1d63beed418887311cba09f1e1b5'
watch=[x['fullName'] for x in json.loads((old/'spec-c1.json').read_text())]
results=[]
def frozen(tag):
 d={}
 for name,path,n,expected in [('492',Path('/tmp/mui-upgrade/s4-frozen-inputs.json'),492,1),('490',Path('/tmp/mui-upgrade/s3-frozen-characterization-and-probes.json'),490,3)]:
  s=json.loads(path.read_text()); assert len(s)==n
  changes=[p for p,h in s.items() if not (R/p).exists() or H(R/p)!=h]
  d[name]={'count':n,'snapshot_sha':H(path),'changed':changes}
  assert len(changes)==expected,(name,changes)
  for p in changes: assert p in A and H(R/p)==A[p]['after_sha256'] and s[p]==A[p]['before_sha256']
 for p,a in A.items(): assert H(R/p)==a['after_sha256']
 atomic_json(O/('frozen-'+tag+'.json'),d)
def snapshot():
 s={}
 for p in R.rglob('*'):
  rel=p.relative_to(R)
  if any(x in rel.parts for x in ['node_modules','.git','out','__pycache__','report','dist','dist-wp']):continue
  if p.is_file() and p.name not in ['verification-s4a.md','.tsbuildinfo-app']:s[str(rel)]=H(p)
 return s
before=snapshot();atomic_json(O/'input-hashes-before.json',before)
def generated(tag):
 atomic_json(O/('generated-'+tag+'.json'),{str(p.relative_to(R)):H(p) for p in R.rglob('*') if p.is_file() and (p.name=='.tsbuildinfo-app' or ('node_modules' not in p.parts and 'out' not in p.parts and 'analysis' in p.name.lower() and p.suffix=='.json'))})
def gate(name,cmd,env=None,suite=False,full=False):
 print('START '+name,flush=True)
 if suite:(O/(name+'-vitest.json')).unlink(missing_ok=True)
 d=run(cmd,1800,O/(name+'-process.json'),O/(name+'.log'),inhibit=True,**({'env':env} if env else {}));results.append({'gate':name,**d});atomic_json(O/'results.json',results)
 resource=Path(str(O/(name+'-process.json'))+'.resources.json');assert resource.exists() and json.loads(resource.read_text()),'missing resources'
 if suite:
  report=O/(name+'-vitest.json');assert report.exists(),'missing JSON test report'
  j=json.loads(report.read_text()); rows=[a for t in j['testResults'] for a in t['assertionResults']]; c=[]
  for w in watch:
   matches=[a for a in rows if a['fullName']==w]
   if full:
    assert len(matches)==1,(w,matches)
    a=matches[0];assert isinstance(a.get('duration'),(int,float)) and a.get('status')
    c.append(a)
   else:c.append({'fullName':w,'status':'notincluded'})
  atomic_json(O/(name+'-c1.json'),c)
  trigger=[a for a in c if a.get('duration',0)>2500 or any('timeout' in m.lower() for m in a.get('failureMessages',[]))]
  if trigger:atomic_json(O/'ESCALATE.json',trigger);raise RuntimeError('C1 escalation required')
  atomic_json(O/(name+'-counts.json'),{k:v for k,v in j.items() if k.startswith('num')})
 assert d['raw_exit']==0 and d['reported_exit']==0 and not d['timeout'],name+' RED'
 assert d['clock']=='mach_continuous_time' and d['inhibitor_reaped']
 print('PASS '+name,flush=True)
try:
 frozen('before');generated('before')
 assert 'release/mui-upgrade'==os.popen('git branch --show-current').read().strip()
 for name in ['selftest','suite-selftest','coverage-selftest']:gate(name,['bash',str(G/(name+'.sh'))])
 gate('scripts-project-selftest',['node',str(G/'scripts-project-selftest.mjs')])
 gate('runner-selftest',[sys.executable,'-m','unittest','discover','-s',str(G),'-p','test_bounded_runner.py'])
 gate('static',['bash',str(G/'gates.sh'),O.name])
 gate('extra-types',['node','node_modules/typescript/bin/tsc','-p',str(R/'node_modules/.tsconfig.s4a-popover.json')])
 base=['node','node_modules/vitest/vitest.mjs','run']
 for name,project in [('spec','spec'),('scripts','scripts'),('storybook','storybook')]:
  gate(name,base+['--project',project,'--maxWorkers=1','--no-file-parallelism','--reporter=default','--reporter=json','--outputFile.json='+str(O/(name+'-vitest.json'))],suite=True,full=name=='spec')
 files=json.loads((G/'coverage-files.json').read_text());assert len(files)==35
 cmd=['env','VANGUARD_V8_COVERAGE=1']+base+['--project','spec','--project','storybook','--maxWorkers=1','--no-file-parallelism','--coverage','--coverage.provider=v8']+['--coverage.include='+f for f in files]+['--coverage.reportOnFailure','--coverage.reporter=json','--coverage.reporter=json-summary','--coverage.reporter=text','--coverage.reportsDirectory='+str(O/'coverage'),'--coverage.thresholds.perFile','--coverage.thresholds.lines=95','--coverage.thresholds.branches=85','--reporter=default','--reporter=json','--outputFile.json='+str(O/'coverage-vitest.json')]
 gate('coverage',cmd,suite=True,full=True)
 assert (O/'coverage/coverage-final.json').exists(),'missing mapped coverage'
 mapped=json.loads((O/'coverage/coverage-final.json').read_text());assert all(str(R/f) in mapped for f in files),'missing mapped files'
 summary=json.loads((O/'coverage/coverage-summary.json').read_text());metrics={}
 for f in files:
  m=summary[str(R/f)];assert m['lines']['pct']>=95 and m['branches']['pct']>=85;metrics[f]=m
 atomic_json(O/'coverage-metrics.json',metrics)
 gate('package-count-selftest',[sys.executable,'-m','unittest','discover','-s',str(G),'-p','test_package_counts.py'])
 gate('package',['env','PACKAGE_FIXTURE_OUT='+str(P),'bash',str(G/'package.sh')])
 audit=(G/'out/s4a-popover-package-audit.py').read_text()
 audit=audit.replace("O=G/'out/s4a-popover-final-5d439fbb278643c1b8949b2dd34a5c6e'",'O=Path('+repr(str(O))+')').replace('s4a-popover-final-package','s4a-node-final-package')
 audit=audit.replace("re.search(r'Tests\\s+18 passed',log)", "re.search(r'Tests\\s+'+str(5 if bundle=='default' else 4)+r' passed',log)").replace("audit['runtime'][key]=18", "audit['runtime'][key]=5 if bundle=='default' else 4")
 exec(compile(audit,'package-audit','exec'))
except Exception as e:
 atomic_json(O/'STOP.json',{'error':str(e)});print('STOP '+str(e),flush=True)
finally:
 frozen('after');generated('after');after=snapshot();atomic_json(O/'input-hashes-after.json',after);atomic_json(O/'input-integrity.json',{'changed':[p for p in before if before[p]!=after.get(p)],'added':sorted(set(after)-set(before))});print('DONE '+str(O),flush=True)
