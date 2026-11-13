"""Fail closed on incomplete or unexpected packed-consumer Vitest summaries."""
import json
import re
import sys
from pathlib import Path
EXPECTED = {'default-declared': 5, 'default-mui': 5, 'wp-declared': 4, 'wp-mui': 4}

def validate(root):
    counts = {}
    for key, expected in EXPECTED.items():
        path = Path(root)/key/'smoke.log'
        if not path.is_file():
            raise ValueError(f'{key}: missing smoke.log')
        log = re.sub(r'\x1b\[[0-9;]*m', '', path.read_text())
        summaries = re.findall(r'^\s*Tests\s+([^\n]+)', log, re.M)
        if len(summaries) != 1:
            raise ValueError(f'{key}: expected exactly one final Tests summary')
        match = re.fullmatch(r'(\d+) passed \((\d+)\)\s*', summaries[0])
        if not match or int(match[1]) != expected or int(match[2]) != expected:
            raise ValueError(f'{key}: expected {expected} passed ({expected}), got {summaries[0]!r}')
        counts[key] = int(match[1])
    aggregate = sum(counts.values())
    if aggregate != 18:
        raise ValueError(f'aggregate: expected 18, got {aggregate}')
    return {'consumers': counts, 'aggregate': aggregate, 'expected_aggregate': 18}

if __name__ == '__main__':
    result = validate(Path(sys.argv[1]))
    (Path(sys.argv[1])/'runtime-counts.json').write_text(json.dumps(result, indent=2)+'\n')
    print(json.dumps(result))
