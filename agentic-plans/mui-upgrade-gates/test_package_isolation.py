import importlib.util,json,tempfile,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('isolation',Path(__file__).with_name('package-isolation.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
G=Path(__file__).resolve().parent;R=G.parent.parent
class Isolation(unittest.TestCase):
 def test_worktree_consumer_is_rejected(self):
  with tempfile.TemporaryDirectory(dir=G/'out',prefix='isolation-red-') as tmp:
   consumer=Path(tmp)/'default-declared';consumer.mkdir()
   with self.assertRaises(ValueError):m.precondition(consumer,R)
 def test_clean_external_consumer_is_allowed(self):
  with tempfile.TemporaryDirectory() as tmp:
   result=m.precondition(Path(tmp)/'default-declared',R)
   self.assertTrue(result)

class AncestorsAndResolution(unittest.TestCase):
 def test_ancestor_mui_and_react_are_rejected(self):
  for dependency in ['@mui','react']:
   with self.subTest(dependency=dependency),tempfile.TemporaryDirectory() as tmp:
    parent=Path(tmp);(parent/'node_modules'/dependency).mkdir(parents=True)
    with self.assertRaises(ValueError):m.precondition(parent/'consumers/default-declared',R)
 def test_declared_mui_absent_and_present_mui_owned(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp)/'consumer';root.mkdir();(root/'package.json').write_text('{}')
   self.assertEqual(len(m.probe(root,'declared',R)['packages']),3)
   for name in m.MUI:
    d=root/'node_modules'/name;d.mkdir(parents=True);(d/'package.json').write_text(json.dumps({'name':name,'version':'1.0.0','main':'index.js'}));(d/'index.js').write_text('module.exports={};')
   self.assertEqual(len(m.probe(root,'mui',R)['packages']),3)
   with self.assertRaises(ValueError):m.probe(root,'declared',R)
 def test_mui_present_missing_package_is_rejected(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp)/'consumer';root.mkdir();(root/'package.json').write_text('{}')
   with self.assertRaises(ValueError):m.probe(root,'mui',R)
