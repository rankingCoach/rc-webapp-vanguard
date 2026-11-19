import re,subprocess,sys
from collections import Counter
diff=subprocess.run(['git','diff','-U0','--']+sys.argv[1:],capture_output=True,text=True).stdout
ATTR=re.compile(r"\s*data-(?!testid)[a-z][a-z0-9-]*=(\{(?:[^{}]|\{[^{}]*\})*\}|'[^']*'|\"[^\"]*\")")
norm=lambda l: re.sub(r'\s+','',ATTR.sub('',l))
rem=Counter();add=Counter();bad=[]
for line in diff.splitlines():
    if line.startswith('---') or line.startswith('+++'): continue
    if line.startswith('-'): rem[norm(line[1:])]+=1
    elif line.startswith('+'):
        body=line[1:]
        if re.match(r"\s*import \{ dataFlag \} from '@helpers/data-attributes';",body): continue
        n=norm(body)
        if n=='' : continue  # pure attribute line
        add[n]+=1
# joined comparison handles reflowed JSX: compare concatenated streams
r=''.join(sorted(rem.elements())); a=''.join(sorted(add.elements()))
print('removed',sum(rem.values()),'added(non-attr)',sum(add.values()))
# Reflow-tolerant: per file, the concatenation of removed lines must equal the concatenation of added lines
# once data-* attributes and whitespace are stripped (order preserved).
files={};cur=None
for line in diff.splitlines():
    if line.startswith('+++ '): cur=line[6:]; files.setdefault(cur,['',''])
    elif line.startswith('--- '): continue
    elif cur and line.startswith('-'): files[cur][0]+=norm(line[1:])
    elif cur and line.startswith('+') and not re.match(r"\s*import \{ dataFlag \} from '@helpers/data-attributes';",line[1:]): files[cur][1]+=norm(line[1:])
bad=[f for f,(a,b) in files.items() if a!=b and not f.endswith('.spec.tsx')]
print('stream check:', 'OK' if not bad else 'MISMATCH '+', '.join(bad))
print('OK' if rem==add else 'line check MISMATCH (see stream check for reflow)')
if rem!=add:
    for k in (rem-add): print('-',k[:160])
    for k in (add-rem): print('+',k[:160])
