"""Fail unless the tarball's dist/ and dist-wordpress/ are byte-identical to the build on disk (gate integrity)."""
import hashlib
import sys
import tarfile
from pathlib import Path


def digests_from_tar(tgz):
    out = {}
    with tarfile.open(tgz, 'r:gz') as tar:
        for member in tar.getmembers():
            if not member.isfile():
                continue
            rel = member.name.split('/', 1)[1]
            if rel.startswith(('dist/', 'dist-wordpress/')):
                out[rel] = hashlib.sha256(tar.extractfile(member).read()).hexdigest()
    return out


def digests_on_disk(root, names):
    return {rel: hashlib.sha256((Path(root) / rel).read_bytes()).hexdigest() if (Path(root) / rel).is_file() else None
            for rel in names}


def check(tgz, root):
    packed = digests_from_tar(tgz)
    if not packed:
        raise SystemExit('dist identity: tarball has no dist files')
    disk = digests_on_disk(root, packed.keys())
    differing = sorted(rel for rel, digest in packed.items() if disk[rel] != digest)
    if differing:
        raise SystemExit(f'dist identity: {len(differing)} packed files differ from disk, e.g. {differing[:5]}')
    print(f'dist identity: {len(packed)} packed dist files equal the build on disk')


if __name__ == '__main__':
    check(sys.argv[1], sys.argv[2])
