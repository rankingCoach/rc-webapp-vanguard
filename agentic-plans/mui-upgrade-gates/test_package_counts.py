"""Validator TDD: fixture summaries, not product regression tests."""
import importlib.util
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('package_counts', Path(__file__).with_name('package-counts.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

class Counts(unittest.TestCase):
    def test_summaries(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            expected = {'default-declared':5, 'default-mui':5, 'wp-declared':4, 'wp-mui':4}
            def reset():
                for key, n in expected.items():
                    (root/key).mkdir(exist_ok=True)
                    (root/key/'smoke.log').write_text(f' Test Files  1 passed (1)\n      Tests  {n} passed ({n})\n')
            reset()
            self.assertEqual(m.validate(root)['aggregate'],18)
            for key,n in expected.items():
                for bad in [f'Tests  {n-1} passed ({n-1})', f'Tests  {n+1} passed ({n+1})', f'Tests  1 failed | {n} passed ({n+1})', f'Tests  {n} passed | 1 skipped ({n+1})', f'Tests  {n} passed (99)', 'Tests  nonsense', f'Tests  {n} passed ({n})\nTests  {n} passed ({n})']:
                    reset()
                    (root/key/'smoke.log').write_text(bad+'\n')
                    with self.subTest(key=key,bad=bad), self.assertRaises(ValueError):m.validate(root)
                reset(); (root/key/'smoke.log').unlink()
                with self.subTest(key=key,missing=True), self.assertRaises(ValueError):m.validate(root)

if __name__ == '__main__':unittest.main()
