// Resolve installed Vitest configuration and actual file specifications; never execute tests.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createVitest } from 'vitest/node';
const expected = ['scripts/_codemod-button-sizes.spec.ts', 'scripts/_mui-public-imports.spec.ts', 'scripts/_mui-v7-public-imports.spec.ts', 'scripts/_rollup-onwarn.spec.ts'].sort();
const ctx = await createVitest('test', { watch: false });
try {
  const specs = await ctx.globTestSpecifications();
  const projects = Object.fromEntries(ctx.projects.map(p => [p.name, p]));
  const files = name => specs.filter(s => s.project.name === name).map(s => path.relative(process.cwd(), s.moduleId)).sort();
  const proof = Object.fromEntries(Object.entries(projects).map(([name,p]) => [name, { environment:p.config.environment, setupFiles:p.config.setupFiles, plugins:p.vite.config.plugins.map(x=>x.name), files:files(name) }]));
  console.log(JSON.stringify(proof,null,2));
  assert.ok(projects.scripts, 'dedicated scripts project required');
  assert.equal(projects.scripts.config.environment,'node');
  assert.deepEqual(projects.scripts.config.setupFiles,[]);
  assert.ok(!proof.scripts.plugins.some(n=>/storybook|react|jsx|jsdom/i.test(n)), 'UI plugin in scripts');
  assert.deepEqual(files('scripts'),expected);
  assert.ok(files('spec').length>0);
  assert.deepEqual(files('spec').filter(f=>f.startsWith('scripts/')),[]);
  const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
  const names = text => [...text.matchAll(/--project(?:=|\s+)([\w-]+)/g)].map(m=>m[1]).sort();
  for(const key of ['test','test:w','test:w:c']) assert.deepEqual(names(pkg.scripts[key]),['scripts','spec','storybook']);
  const suite=fs.readFileSync('agentic-plans/mui-upgrade-gates/suite.sh','utf8');
  assert.deepEqual(suite.match(/for proj in ([^;]+);/)[1].split(/\s+/).sort(),['scripts','spec','storybook']);
  const final=fs.readFileSync('agentic-plans/mui-upgrade-gates/final-validation.py','utf8');
  assert.match(final,/\['spec',\s*'scripts',\s*'storybook'\]/);
  const coverage=fs.readFileSync('agentic-plans/mui-upgrade-gates/coverage.sh','utf8');
  assert.deepEqual(names(coverage),['spec','storybook']);
  assert.ok(!/--(?:coverage\.)?exclude/.test(coverage));
  console.log('PASS: resolved Node isolation, exact mandatory scripts and project-only coverage');
} finally { await ctx.close(); }
