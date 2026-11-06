"""One serial S3 validation; stop on any raw failure. Run from repository root."""
import hashlib
import json
from pathlib import Path
import sys
from bounded_runner import run, atomic_json

root = Path.cwd()
gates = Path('agentic-plans/mui-upgrade-gates')
out = gates/'out/s3-continuous-final1'
out.mkdir(parents=True, exist_ok=True)
def snapshot():
    paths = []
    for base in ['src', 'scripts', str(gates), '.storybook']:
        paths.extend(p for p in (root/base).rglob('*') if p.is_file() and not {'out', '__pycache__'}.intersection(p.relative_to(root/base).parts))
    paths.extend(p for p in root.iterdir() if p.is_file() and p.suffix in ['.json','.ts','.yaml','.js','.cjs','.mjs'])
    return {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(set(paths)) if p.name != 'verification-s3.md'}
commands = [(name, ['bash', str(gates/(name+'.sh'))]) for name in ['selftest','suite-selftest','coverage-selftest']]
commands += [('scripts-project-selftest', ['node', str(gates/'scripts-project-selftest.mjs')])]
commands += [('runner-selftest', [sys.executable, '-m', 'unittest', 'discover', '-s', str(gates), '-p', 'test_bounded_runner.py']), ('static', ['bash', str(gates/'gates.sh'), 's3-continuous-final1'])]
# Direct project commands avoid suite.sh's legacy watchdog and automatic isolated retries.
commands += [('suite-'+project, ['pnpm','vitest','run','--project',project,'--maxWorkers=1','--no-file-parallelism']) for project in ['spec', 'scripts', 'storybook']]
commands += [('coverage',['bash',str(gates/'coverage.sh'),'s3-continuous-final1']), ('package',['env','PACKAGE_FIXTURE_OUT=/tmp/mui-upgrade/s3-continuous-final1-package','bash',str(gates/'package.sh')])]
commands.insert(0, ('package-count-selftest', [sys.executable, '-m', 'unittest', 'discover', '-s', str(gates), '-p', 'test_package_counts.py']))
before = snapshot()
atomic_json(out/'input-hashes-before.json', before)
results = []
try:
    for name, command in commands:
        print('START '+name, flush=True)
        data = run(command,1800,out/(name+'-process.json'),out/(name+'-run.log'),inhibit=True)
        results.append({'gate':name, **data})
        print(json.dumps(results[-1]),flush=True)
        if data['reported_exit'] != 0:
            break
finally:
    after = snapshot()
    atomic_json(out/'input-hashes-after.json',after)
    atomic_json(out/'input-integrity.json',{'count':len(before),'changed':[p for p in before if before[p]!=after.get(p)],'added':sorted(set(after)-set(before))})
    atomic_json(out/'results.json',results)
