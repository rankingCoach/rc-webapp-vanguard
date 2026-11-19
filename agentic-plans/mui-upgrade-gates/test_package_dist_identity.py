import io
import tarfile
import tempfile
import unittest
from pathlib import Path

import importlib.util

spec = importlib.util.spec_from_file_location('ident', Path(__file__).with_name('package-dist-identity.py'))
ident = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ident)


def make(root, files, tgz):
    with tarfile.open(tgz, 'w:gz') as tar:
        for rel, data in files.items():
            info = tarfile.TarInfo('package/' + rel)
            info.size = len(data)
            tar.addfile(info, io.BytesIO(data))


class DistIdentity(unittest.TestCase):
    def test_equal_passes_and_mismatch_fails(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            (root / 'dist').mkdir()
            (root / 'dist/index.js').write_bytes(b'a')
            tgz = root / 'p.tgz'
            make(root, {'dist/index.js': b'a'}, tgz)
            ident.check(tgz, root)
            (root / 'dist/index.js').write_bytes(b'b')
            with self.assertRaises(SystemExit):
                ident.check(tgz, root)


if __name__ == '__main__':
    unittest.main()
