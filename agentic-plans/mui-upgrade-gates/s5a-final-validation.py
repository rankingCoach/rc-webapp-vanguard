"""One S5a final candidate, serial and fail-fast; execute only after clean install/scoped GREEN."""
from pathlib import Path
import collections
import hashlib
import json
import os
import re
import subprocess
import sys
import tarfile
import uuid

R = Path.cwd().resolve()
assert str(R) == '/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade'
G = R / 'agentic-plans/mui-upgrade-gates'
sys.path.insert(0, str(G))
from bounded_runner import run, atomic_json

NODE = '/Users/a.kott/.nvm/versions/node/v20.19.5/bin/node'
os.environ['PATH'] = str(Path(NODE).parent) + ':' + os.environ['PATH']
O = G / 'out' / ('s5a-final-' + uuid.uuid4().hex)
O.mkdir()
P = Path('/tmp/mui-upgrade') / (O.name + '-package')
assert not P.exists()
print(O, flush=True)
H = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
A = json.loads((G / 'approved-frozen-changes.json').read_text())
watch = [a['fullName'] for a in json.loads((G / 'out/s4a-final-d50d1d63beed418887311cba09f1e1b5/spec-c1.json').read_text())]
assert len(watch) == 3
results = []
generated_names = {'.tsbuildinfo-app', 'dynamic-import-analysis.json', 'dynamic-import-analysis-simple.json'}

def snapshot():
    skip = {'node_modules', '.git', 'out', '__pycache__', 'report', 'dist', 'dist-wordpress', 'coverage', 'storybook-static'}
    return {str(p.relative_to(R)): H(p) for p in R.rglob('*') if p.is_file() and not skip.intersection(p.relative_to(R).parts) and p.name not in generated_names and p.name != 'verification-s5a.md'}

def generated(tag):
    atomic_json(O / ('generated-' + tag + '.json'), {name: H(R / name) for name in sorted(generated_names) if (R / name).exists()})

def approved_hashes(entry):
    values = {entry.get('before_sha256'), entry.get('after_sha256')}
    for key in ['prior_approval', 'static_cleanup_prior_approval']:
        if key in entry:
            values |= approved_hashes(entry[key])
    return values

def frozen(tag):
    data = {}
    snapshots = [('490', Path('/tmp/mui-upgrade/s3-frozen-characterization-and-probes.json'), 490), ('492', Path('/tmp/mui-upgrade/s4-frozen-inputs.json'), 492)]
    for label, path, count in snapshots:
        old = json.loads(path.read_text()); assert len(old) == count
        changed = [p for p, sha in old.items() if not (R / p).exists() or H(R / p) != sha]
        for p in changed:
            assert p in A and H(R / p) == A[p]['after_sha256'] and old[p] in approved_hashes(A[p]), ('unapproved frozen change', p)
        data[label] = {'count': count, 'snapshot_sha256': H(path), 'changed': changed}
    for p, entry in A.items():
        assert H(R / p) == entry['after_sha256'], ('approval SHA mismatch', p)
    atomic_json(O / ('frozen-' + tag + '.json'), data)

def gate(name, command, project=None):
    print('START ' + name, flush=True)
    d = run(command, 1800, O / (name + '-process.json'), O / (name + '.log'), inhibit=True)
    results.append({'gate': name, **d}); atomic_json(O / 'results.json', results)
    if project:
        j = json.loads((O / (name + '-vitest.json')).read_text())
        rows = [a for t in j['testResults'] for a in t['assertionResults']]
        c1 = []
        for full_name in watch:
            matches = [a for a in rows if a['fullName'] == full_name]
            if project in ['spec', 'coverage']:
                assert len(matches) == 1, (name, full_name, matches)
                a = matches[0]; assert isinstance(a.get('duration'), (int, float))
                c1.append(a)
            else:
                c1.append({'fullName': full_name, 'status': 'notincluded'})
        atomic_json(O / (name + '-c1.json'), c1)
        trigger = [a for a in c1 if a.get('duration', 0) > 2500 or any('timeout' in m.lower() for m in a.get('failureMessages', []))]
        if trigger:
            atomic_json(O / 'ESCALATE-C1.json', trigger); raise RuntimeError('C1 requires escalation')
        atomic_json(O / (name + '-counts.json'), {k: v for k, v in j.items() if k.startswith('num')})
    assert d['raw_exit'] == 0 and d['reported_exit'] == 0 and d['validity'] == 'VALID' and not d['timeout'], name + ' failed or sleep-invalid'
    assert d['inhibitor_reaped']
    print('PASS ' + name, flush=True)

def diagnostics(path):
    lines = re.sub(r'\x1b\[[0-9;]*m', '', path.read_text()).splitlines()
    warnings = collections.Counter(re.sub(r'\(\d+:\d+\)', '(LINE:COL)', line) for line in lines if 'Module level directives cause errors when bundled' in line)
    errors = []
    for i, line in enumerate(lines):
        if re.match(r'src/.*?:\d+:\d+ - error TS\d+:', line):
            block = []; j = i
            while j < len(lines) and lines[j].strip():
                block.append(re.sub(r':\d+:\d+ - error', ':LINE:COL - error', lines[j])); j += 1
            errors.append('\n'.join(block))
    move = [line for line in lines if line.startswith('mv: ')]
    return warnings, errors, move

def package_audit():
    expected = json.loads((R / 'out/s5a-review-warning-reconciliation/warning-inventory.json').read_text())
    warnings, errors, move = diagnostics(P / 'build.log')
    baseline_w, baseline_e, baseline_m = diagnostics(Path('/tmp/mui-upgrade/s4b-final-package/build.log'))
    added = dict(warnings - collections.Counter(expected['inventory'])); removed = dict(collections.Counter(expected['inventory']) - warnings)
    atomic_json(O / 'build-diagnostics.json', {'warnings': dict(sorted(warnings.items())), 'added': added, 'removed': removed, 'declaration_blocks': errors, 'wp_move': move, 'matches_accepted_errors': errors == baseline_e and move == baseline_m})
    assert sum(warnings.values()) == 584 and not added and not removed, 'warning delta requires reconciliation'
    assert len(errors) == 8 and errors == baseline_e and move == baseline_m, 'new build error requires escalation'
    tgzs = list((P / 'pack').glob('*.tgz')); assert len(tgzs) == 1
    T = tgzs[0]; audit = {'tar': str(T), 'tar_sha256': H(T), 'packed': {}, 'installed': {}, 'pins': {}, 'runtime': {}}
    pins = {'@mui/material': '7.3.11', '@mui/system': '7.3.11', '@mui/x-date-pickers': '9.17.0'}
    with tarfile.open(T) as tar:
        manifest = json.load(tar.extractfile('package/package.json'))
        for pkg, version in pins.items():
            assert manifest['devDependencies'][pkg] == version
            assert json.loads((R / 'node_modules' / pkg / 'package.json').read_text())['version'] == version
        for bundle in ['dist', 'dist-wordpress']:
            for suffix in ['index.js', 'types/index.d.ts']:
                f = bundle + '/' + suffix; packed = tar.extractfile('package/' + f).read(); assert packed == (R / f).read_bytes(), f
                audit['packed'][f] = hashlib.sha256(packed).hexdigest()
        for bundle in ['default', 'wp']:
            for peer in ['declared', 'mui']:
                key = bundle + '-' + peer; D = P / key; N = D / 'node_modules'; V = N / '@rankingcoach/vanguard'
                audit['installed'][key] = {}
                for suffix in ['index.js', 'types/index.d.ts']:
                    packed = tar.extractfile('package/' + ('dist' if bundle == 'default' else 'dist-wordpress') + '/' + suffix).read()
                    actual = (V / 'dist' / suffix).read_bytes(); assert packed == actual, (key, suffix)
                    audit['installed'][key][suffix] = hashlib.sha256(actual).hexdigest()
                assert not (N / '@mui/x-date-pickers').exists(), 'picker is bundled'
                installed_pins = {}
                for pkg in ['@mui/material', '@mui/system']:
                    path = N / pkg / 'package.json'
                    if peer == 'mui':
                        version = json.loads(path.read_text())['version']; assert version == pins[pkg]; installed_pins[pkg] = version
                    else:
                        assert not path.exists(), (key, pkg); installed_pins[pkg] = 'absent by declared-only design'
                audit['pins'][key] = installed_pins
                assert not (D / 'types-gated.log').read_text().strip(), key
                if key == 'default-mui': assert not (D / 'types-mui-gated.log').read_text().strip()
                count = 5 if bundle == 'default' else 4
                assert re.search(r'Tests\s+' + str(count) + r' passed', (D / 'smoke.log').read_text()), key
                audit['runtime'][key] = count
    assert sum(audit['runtime'].values()) == 18
    atomic_json(O / 'package-audit.json', audit)

before = snapshot(); atomic_json(O / 'input-hashes-before.json', before)
(O / 'start-resources.txt').write_text(subprocess.check_output(['uptime'], text=True) + 'Orphan cleanup boundary: prior timings not directly comparable, C1 included.\n')
try:
    assert subprocess.check_output(['git', 'branch', '--show-current'], text=True).strip() == 'release/mui-upgrade'
    frozen('before'); generated('before')
    for name in ['selftest', 'suite-selftest', 'coverage-selftest']:
        gate(name, ['bash', str(G / (name + '.sh'))])
    gate('scripts-project-selftest', [NODE, str(G / 'scripts-project-selftest.mjs')])
    gate('discovery-selftest', [NODE, str(G / 'discovery-selftest.mjs'), '--output=' + str(O / 'resolved-project-files.json')])
    for name, pattern in [('runner-selftest', 'test_bounded_runner.py'), ('package-count-selftest', 'test_package_counts.py')]:
        gate(name, [sys.executable, '-m', 'unittest', 'discover', '-s', str(G), '-p', pattern])
    gate('static', ['bash', str(G / 'gates.sh'), O.name])
    config = json.loads((R / 'out/s5a-keyboard-section-final/tsconfig.json').read_text()); atomic_json(O / 'extra-types.json', config)
    gate('extra-types', [NODE, 'node_modules/typescript/bin/tsc', '-p', str(O / 'extra-types.json')])
    base = [NODE, 'node_modules/vitest/vitest.mjs', 'run']
    reporting = ['--maxWorkers=1', '--no-file-parallelism', '--reporter=default', '--reporter=json']
    for project in ['spec', 'scripts', 'storybook']:
        gate(project, base + ['--project', project] + reporting + ['--outputFile=' + str(O / (project + '-vitest.json'))], project)
    files = json.loads((G / 'coverage-files.json').read_text()); assert len(files) == 35
    cmd = ['env', 'VANGUARD_V8_COVERAGE=1'] + base + ['--project', 'spec', '--project', 'storybook'] + reporting + ['--coverage', '--coverage.provider=v8'] + ['--coverage.include=' + f for f in files] + ['--coverage.reportOnFailure', '--coverage.reporter=json', '--coverage.reporter=json-summary', '--coverage.reporter=text', '--coverage.reportsDirectory=' + str(O / 'coverage'), '--coverage.thresholds.perFile', '--coverage.thresholds.lines=95', '--coverage.thresholds.branches=85', '--outputFile=' + str(O / 'coverage-vitest.json')]
    gate('coverage', cmd, 'coverage')
    mapped = json.loads((O / 'coverage/coverage-final.json').read_text()); summary = json.loads((O / 'coverage/coverage-summary.json').read_text())
    metrics = {}
    for f in files:
        assert str(R / f) in mapped; m = summary[str(R / f)]; assert m['lines']['pct'] >= 95 and m['branches']['pct'] >= 85; metrics[f] = m
    atomic_json(O / 'coverage-metrics.json', metrics)
    # npm10 pack previously ignored --ignore-scripts; use the accepted cached npm11 CLI explicitly.
    npm_cli = Path('/Users/a.kott/.npm/_npx/778e2a9d4b99c7e3/node_modules/npm/bin/npm-cli.js')
    assert json.loads((npm_cli.parent.parent / 'package.json').read_text())['version'] == '11.6.2'
    shim = O / 'package-bin'; shim.mkdir()
    (shim / 'npm').write_text('#!/bin/sh\nexec ' + NODE + ' ' + str(npm_cli) + ' "$@"\n')
    (shim / 'npm').chmod(0o755)
    gate('package', ['env', 'PATH=' + str(shim) + ':' + os.environ['PATH'], 'PACKAGE_FIXTURE_OUT=' + str(P), 'bash', str(G / 'package.sh')])
    package_audit()
except Exception as exc:
    atomic_json(O / 'STOP.json', {'error': str(exc)}); print('STOP ' + str(exc), flush=True)
    raise
finally:
    frozen('after'); generated('after'); after = snapshot(); atomic_json(O / 'input-hashes-after.json', after)
    integrity = {'changed': [p for p in before if before[p] != after.get(p)], 'added': sorted(set(after) - set(before))}
    atomic_json(O / 'input-integrity.json', integrity)
    if integrity['changed'] or integrity['added']:
        atomic_json(O / 'STOP-input-drift.json', integrity)
        raise RuntimeError('Candidate input drift during final validation')
    print('DONE ' + str(O), flush=True)
