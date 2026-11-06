// Resolve installed Vitest projects only. Proof/evidence copies must never become tests.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createVitest } from 'vitest/node';

const option = name => process.argv.find(a => a.startsWith('--' + name + '='))?.split('=').slice(1).join('=');
// Storybook's plugin enables its actual file globs only in Vitest mode.
process.env.VITEST = 'true';
const ctx = await createVitest('test', { watch: false });
try {
  const specifications = await ctx.globTestSpecifications();
  const names = ['spec', 'storybook', 'scripts'];
  const projectName = name => name.replace(/ \(.*\)$/, '');
  const files = Object.fromEntries(names.map(name => [name, specifications.filter(s => projectName(s.project.name) === name).map(s => path.relative(process.cwd(), s.moduleId)).sort()]));
  const proof = { files, excludes: Object.fromEntries(ctx.projects.map(p => [projectName(p.name), p.config.exclude])), coverageExclude: ctx.config.coverage.exclude };
  if (option('output')) fs.writeFileSync(option('output'), JSON.stringify(proof, null, 2));
  assert.ok(files.storybook.length > 0, 'real Storybook resolution required');
  const artifacts = Object.values(files).flat().filter(f => f.startsWith('out/') || f.startsWith('agentic-plans/'));
  assert.deepEqual(artifacts, [], 'proof copies under out/ must never be discovered');
  for (const name of ['spec', 'storybook']) {
    for (const pattern of ['out/**', 'agentic-plans/**']) assert.ok(proof.excludes[name].includes(pattern), `${name} excludes ${pattern}`);
  }
  for (const pattern of ['out/**', 'agentic-plans/**']) assert.ok(proof.coverageExclude.includes(pattern));
  assert.ok(files.spec.includes('config/_regex.spec.ts'), 'legitimate config test preserved');
  assert.deepEqual(files.scripts, ['scripts/_codemod-button-sizes.spec.ts', 'scripts/_mui-public-imports.spec.ts', 'scripts/_mui-v7-public-imports.spec.ts', 'scripts/_rollup-onwarn.spec.ts'].sort());
  if (option('compare')) {
    const before = JSON.parse(fs.readFileSync(option('compare'))).files;
    const removed = before.spec.filter(f => !files.spec.includes(f));
    assert.equal(removed.length, 6);
    assert.ok(removed.every(f => f.startsWith('out/s5a-') && f.includes('/before/')));
    assert.deepEqual(files.spec, before.spec.filter(f => !removed.includes(f)));
    assert.deepEqual(files.storybook, before.storybook);
    assert.deepEqual(files.scripts, before.scripts);
    console.log(JSON.stringify({ removed, preserved: Object.fromEntries(names.map(n => [n, files[n].length])) }));
  }
  console.log('PASS: real project files retained; proof outputs excluded in normal discovery and coverage');
} finally {
  await ctx.close();
}
