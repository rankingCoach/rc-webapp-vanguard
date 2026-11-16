"""Negative controls for final evidence completeness and exact build diagnostics."""
import copy,importlib.util,tempfile,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('audit',Path(__file__).with_name('s5b-stage-audit.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class Audit(unittest.TestCase):
 def test_runtime_completeness(self):
  root=Path('/tmp/audit-fixture');row={'name':str(root/'src/_one.spec.ts'),'status':'passed','assertionResults':[{'status':'passed'}]}
  data={'testResults':[row],'numTotalTests':1,'numPassedTests':1,'numFailedTests':0,'numPendingTests':0,'numTodoTests':0}
  self.assertEqual(m.assert_runtime(data,['src/_one.spec.ts'],1,root)['tests'],1)
  for mutate in [lambda d:d['testResults'].clear(),lambda d:d['testResults'][0]['assertionResults'].clear(),lambda d:d.update(numPendingTests=1),lambda d:d['testResults'][0]['assertionResults'][0].update(status='skipped')]:
   bad=copy.deepcopy(data);mutate(bad)
   with self.assertRaises(AssertionError):m.assert_runtime(bad,['src/_one.spec.ts'],1,root)
 def test_build_inventory_retains_errors_and_identity(self):
  with tempfile.TemporaryDirectory() as tmp:
   p=Path(tmp)/'build.log';a='node_modules/@mui/example.mjs (1:0): Module level directives cause errors when bundled, "use client" was ignored.'
   p.write_text(a+'\n'+a+'\nsrc/one.ts: error TS2322: bad\n');v=m.build_inventory(p)
   self.assertEqual(v['warning_count'],2);self.assertEqual(v['warning_identities'],1);self.assertEqual(len(v['declaration_blocks']),1)
   p.write_text(a.replace('node_modules/@mui','src'))
   with self.assertRaises(AssertionError):m.build_inventory(p)
if __name__=='__main__':unittest.main()
