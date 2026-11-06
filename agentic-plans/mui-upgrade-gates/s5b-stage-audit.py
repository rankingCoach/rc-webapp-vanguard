"""Fail closed on the S5b exact build, complete runtime, frozen and packed-artifact contracts."""
from pathlib import Path
from collections import Counter
import hashlib,json,os,re,tarfile
G=Path(__file__).resolve().parent; R=G.parent.parent

def digest(data):return hashlib.sha256(data).hexdigest()
def load(p):return json.loads(Path(p).read_text())
def build_inventory(log):
 text=re.sub(r'\x1b\[[0-9;]*m','',Path(log).read_text());lines=text.splitlines()
 warnings=Counter(re.sub(r'\(\d+:\d+\)','(LINE:COL)',s) for s in lines if 'Module level directives' in s)
 assert all(k.startswith('node_modules/') for k in warnings),'source directive warning'
 return {'warnings':dict(sorted(warnings.items())),'warning_count':sum(warnings.values()),'warning_identities':len(warnings),'declaration_blocks':[s for s in lines if re.search(r'error TS\d+',s)],'wp_move':[s for s in lines if s.startswith('mv: ')],'other_esbuild_warnings':[re.sub(r':\d+:\d+',':LINE:COL',s) for s in lines if '[plugin vite:esbuild]' in s], 'other_warning_identities':[re.sub(r'\(\d+:\d+\)','(LINE:COL)',s) for s in lines if 'Module level directives' not in s and (s.startswith('[plugin ') or s.startswith('(!)') or re.search(r'\(\d+:\d+\):|\b(?:warning|deprecated)\b',s,re.I)) and not s.startswith('dist')]}

def assert_runtime(data,expected_files,expected_count,root=R):
 root=Path(root).resolve()
 files={str(Path(t['name']).resolve().relative_to(root)) for t in data['testResults']}
 assert files==set(expected_files),{'missing':sorted(set(expected_files)-files),'extra':sorted(files-set(expected_files))}
 rows=[x for t in data['testResults'] for x in t['assertionResults']]
 assert len(rows)==expected_count and data['numTotalTests']==expected_count,(len(rows),expected_count)
 assert all(x['status']=='passed' for x in rows),'failed/pending assertion'
 assert all(t['status']=='passed' and t['assertionResults'] for t in data['testResults']),'failed/empty file'
 for key in ['numFailedTests','numPendingTests','numTodoTests']:assert data.get(key,0)==0,key
 assert data['numPassedTests']==expected_count
 return {'files':len(files),'tests':len(rows),'failures':0,'unexpected_skips':0}

def main():
 O=Path(os.environ['MUI_GATE_OUT']);P=Path(load(O/'package-selection.json')['output']);out={}
 plan=load(O/'selection.json');selected=plan['selected'];assert plan['tier']==3
 coverage=G/'out'/(O.name+'-coverage')
 expected=[s['file'] for s in selected if s['project'] in ['spec','storybook']]
 assert len([s for s in selected if s['project']=='spec'])==118
 assert len([s for s in selected if s['project']=='storybook'])==174
 out['coverage_runtime']=assert_runtime(load(coverage/'tests.json'),expected,1777+1292)
 stories=[t for t in load(coverage/'tests.json')['testResults'] if '.stories.' in t['name']]
 assert sum(len(t['assertionResults']) for t in stories)==1292,'incomplete Storybook'
 scripts=[s['file'] for s in selected if s['project']=='scripts']
 assert len(scripts)==4
 out['scripts_runtime']=assert_runtime(load(O/'scripts-tests.json'),scripts,37)
 for p in [coverage.parent/(coverage.name+'.log'),O/'coverage.log',O/'scripts.log']:
  if not p.exists():continue
  assert not re.search(r'Unhandled (?:Errors|Error|Rejection)|Uncaught Exception',p.read_text(),re.I),str(p)
 metrics=load(coverage/'coverage/coverage-summary.json');required=load(G/'coverage-files.json');matched={}
 for f in required:
  found=[v for k,v in metrics.items() if k!='total' and Path(k).resolve()==(R/f).resolve()];assert len(found)==1,f
  v=found[0];assert v['lines']['pct']>=95 and v['branches']['pct']>=85,(f,v)
  matched[f]={'lines':v['lines']['pct'],'branches':v['branches']['pct']}
 assert len(matched)==35
 out['coverage_metrics']=matched
 expected_build=load(G/'baseline/s5b-build.json');actual=build_inventory(P/'build.log')
 assert actual=={k:expected_build[k] for k in actual},'build diagnostic identity/count drift'
 out['build']=actual
 registry=load(G/'approved-frozen-changes.json');master=load(G/'master-sync-frozen-changes.json');before=load(G/'baseline/s5b-frozen-before.json');approved=[]
 for f,h in before.items():
  expected_hash=registry.get(f,master.get(f,{})).get('after_sha256',h)
  assert (R/f).is_file() and digest((R/f).read_bytes())==expected_hash,('frozen drift',f)
  if expected_hash!=h:approved.append(f)
 out['frozen']={'checked':len(before),'approved_changes':approved,'unexpected_changes':[]}
 tgzs=list((P/'pack').glob('*.tgz'));assert len(tgzs)==1
 out['tarball']={'file':str(tgzs[0]),'sha256':digest(tgzs[0].read_bytes())}
 bytes_proof=[]
 with tarfile.open(tgzs[0]) as tar:
  for consumer in ['default-declared','default-mui','wp-declared','wp-mui']:
   bundle='dist' if consumer.startswith('default-') else 'dist-wordpress';installed=P/consumer/'node_modules/@rankingcoach/vanguard'
   pkg=load(installed/'package.json');assert pkg['version']=='2.9.1'
   assert pkg['devDependencies']['@mui/material']=='9.5.0' and pkg['devDependencies']['@mui/system']=='9.5.0' and pkg['devDependencies']['@mui/x-date-pickers']=='9.17.0'
   for file in ['index.js','index-Button.js'] if bundle=='dist' else ['index.js','vanguard.css']:
    packed=tar.extractfile('package/'+bundle+'/'+file).read();built=(R/bundle/file).read_bytes();actual_bytes=(installed/'dist'/file).read_bytes()
    assert packed==built==actual_bytes,(consumer,file)
    bytes_proof.append({'consumer':consumer,'file':file,'sha256':digest(packed)})
   if consumer.endswith('-mui'):
    assert load(P/consumer/'node_modules/@mui/material/package.json')['version']=='9.5.0'
   assert not (P/consumer/'types-gated.log').read_text().strip(),consumer+' types'
   if consumer=='default-mui':assert not (P/consumer/'types-mui-gated.log').read_text().strip()
 out['installed_bytes']=bytes_proof;out['runtime_counts']=load(P/'runtime-counts.json');assert out['runtime_counts']['aggregate']==18
 (O/'s5b-stage-audit.json').write_text(json.dumps(out,indent=2)+'\n')
 print('PASS: 3069 component tests +37 scripts complete;35 mapped thresholds;0 visible directive warnings;0 TS diagnostics;frozen/bytes/pins/types;18 packed runtime')
if __name__=='__main__':main()
