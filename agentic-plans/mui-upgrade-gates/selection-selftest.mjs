import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { planSelection } from './selection-policy.mjs';

const before = {'src/Leaf/Leaf.js':'old','src/Other.js':'unchanged'};
const after = {...before, 'src/Leaf/Leaf.js':'new'};
const leaf = planSelection(before, after);
assert.deepEqual(leaf.changed, ['src/Leaf/Leaf.js']);
assert.equal(leaf.tier, 1);
assert.deepEqual(leaf.projects, ['spec','storybook']);
assert.equal(leaf.packageRequired, true);
for (const shared of ['package.json','pnpm-lock.yaml','.pnpmfile.cjs','vitest.config.ts','vite.config.lib.ts','vitest.setup.tsx','.storybook/preview.tsx','src/test-utils/a.ts','test-utils/a.ts','src/core/_internal/InputBase/InputBase.tsx','src/styles/theme.ts']) {
  assert.equal(planSelection({}, {[shared]:'changed'}).tier, 3, shared);
}
assert.deepEqual(planSelection({'src/Removed.ts':'old'},{}).changed, ['src/Removed.ts']);
assert.equal(planSelection({'src/Removed.ts':'old'},{}).tier, 3, 'deleted imports cannot be resolved safely');
assert.deepEqual(planSelection({}, {'scripts/helper.ts':'changed'}).projects, ['spec','storybook','scripts']);
assert.deepEqual(planSelection({}, {'agentic-plans/verification.md':'report','out/proof.ts':'proof'}).changed, []);

// Real installed Vitest graph, with own files, transitive dependents and an unrelated test.
const { resolveSelection } = await import('./selection-policy.mjs');
const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'mui-selection-')));
try {
  const files = {
    'src/Leaf/Leaf.js':'export const leaf = 1;',
    'src/Dependent/Dependent.js':"import {leaf} from '../Leaf/Leaf.js'; export const dependent=leaf;",
    'src/Leaf/_Leaf.spec.js':"import {leaf} from './Leaf.js'; export const value=leaf;",
    'src/Leaf/_Leaf.stories.js':"import {leaf} from './Leaf.js'; export const value=leaf;",
    'src/Dependent/_Dependent.spec.js':"import {dependent} from './Dependent.js'; export const value=dependent;",
    'src/Dependent/_Dependent.stories.js':"import {dependent} from './Dependent.js'; export const value=dependent;",
    'src/Other/_Other.spec.js':'export const value=0;',
    'vitest.config.mjs':`export default { test: { projects: [
      {root:${JSON.stringify(tmp)},test:{name:'spec',environment:'node',include:['src/**/*.spec.js']}},
      {root:${JSON.stringify(tmp)},test:{name:'storybook',environment:'node',include:['src/**/*.stories.js']}}
    ] } };`,
  };
  for(const [p,content] of Object.entries(files)){fs.mkdirSync(path.dirname(path.join(tmp,p)),{recursive:true});fs.writeFileSync(path.join(tmp,p),content);}
  const selected = await resolveSelection({root:tmp,changed:leaf.changed,projects:leaf.projects});
  assert.deepEqual(selected.map(s=>s.file).sort(),[
    'src/Leaf/_Leaf.spec.js','src/Leaf/_Leaf.stories.js',
    'src/Dependent/_Dependent.spec.js','src/Dependent/_Dependent.stories.js',
  ].sort());
  const component = await resolveSelection({root:tmp,changed:['src/Dependent/Dependent.js'],projects:leaf.projects,component:'src/Leaf'});
  assert.deepEqual(component.map(s=>s.file).sort(), selected.map(s=>s.file).sort());
  console.log(JSON.stringify({leafChange:leaf,selected,sharedChangeForcesTier3:true}));
  console.log('PASS: manifest leaf change selects own specs/stories and transitive dependents; shared changes force full Tier 3');
} finally {fs.rmSync(tmp,{recursive:true,force:true});}
