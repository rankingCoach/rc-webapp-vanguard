import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

const script = path.resolve(__dirname, 'codemod-button-sizes.js');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'codemod-button-sizes-'));

// One fixture per module a vanguard Button can be imported from, each with a primary button that needs the bump
const RECOGNISED = [
  'vanguard',
  '@rankingcoach/vanguard',
  '@vanguard/Button',
  '@vanguard/Button/index',
  '@vanguard/Button/Button',
  '@vanguard/Button/Button.tsx',
  '../Button',
  './Button',
  '../../Button/Button',
];
const IGNORED = ['@vanguard/ButtonGroup', '@vanguard/IconButton', '@mui/material/Button', '../ButtonGroup'];

const fixture = (module: string) =>
  `import { Button } from '${module}';\nexport const X = () => <Button>Go</Button>;\n`;
const writeFixtures = (dir: string, modules: string[]) => {
  fs.mkdirSync(path.join(root, dir));
  modules.forEach((module, i) => fs.writeFileSync(path.join(root, dir, `Fixture${i}.tsx`), fixture(module)));
};
const dryRun = (dir: string) => execFileSync('node', [script, path.join(root, dir)], { encoding: 'utf8' });

afterAll(() => fs.rmSync(root, { recursive: true, force: true }));

describe('codemod-button-sizes import forms', () => {
  it('recognises every supported Button import path', () => {
    writeFixtures('recognised', RECOGNISED);
    const out = dryRun('recognised');
    expect(out).toContain(`Would change ${RECOGNISED.length} buttons:`);
    RECOGNISED.forEach((_, i) => expect(out).toContain(`Fixture${i}.tsx:2  primary: (default) -> extraLarge`));
  });

  it('ignores other components whose module name contains Button', () => {
    writeFixtures('ignored', IGNORED);
    expect(dryRun('ignored')).toContain('Would change 0 buttons:');
  });
});
