import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import ts from 'typescript';
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
  '../../Button',
  '../../../Button/index',
];
const IGNORED = [
  '@vanguard/ButtonGroup',
  '@vanguard/IconButton',
  '@mui/material/Button',
  '../ButtonGroup',
  '../../ButtonGroup',
];

const fixture = (module: string) =>
  `import { Button } from '${module}';\nexport const X = () => <Button>Go</Button>;\n`;
const writeFixtures = (dir: string, modules: string[]) => {
  fs.mkdirSync(path.join(root, dir));
  modules.forEach((module, i) => fs.writeFileSync(path.join(root, dir, `Fixture${i}.tsx`), fixture(module)));
};
const dryRun = (dir: string) => execFileSync('node', [script, path.join(root, dir)], { encoding: 'utf8' });

// Runs the codemod with --write on a single source and returns the rewritten source
const rewrite = (dir: string, source: string) => {
  fs.mkdirSync(path.join(root, dir));
  const file = path.join(root, dir, 'Fixture.tsx');
  fs.writeFileSync(file, source);
  execFileSync('node', [script, path.join(root, dir), '--write'], { encoding: 'utf8' });
  return fs.readFileSync(file, 'utf8');
};

// Typechecks a rewritten source against a minimal stand-in for the Button module
const STUB = `declare module '@vanguard/Button' {
  export enum ButtonSizes { small = 'small', medium = 'medium', large = 'large', extraLarge = 'extra-large' }
  export type ButtonProps = { size?: ButtonSizes; children?: unknown };
  export const Button: (props: ButtonProps) => null;
}
declare namespace JSX { interface Element {} interface IntrinsicElements {} }
`;
const typeErrors = (source: string) => {
  const files: Record<string, string> = { '/stub.d.ts': STUB, '/Fixture.tsx': source };
  const options = { jsx: ts.JsxEmit.Preserve, strict: true, noEmit: true, types: [] };
  // The fixtures live in memory; the TypeScript lib files are read from disk
  const host = ts.createCompilerHost(options);
  const { getSourceFile, fileExists, readFile } = host;
  host.getSourceFile = (name, target, ...rest) =>
    name in files ? ts.createSourceFile(name, files[name], target, true) : getSourceFile(name, target, ...rest);
  host.fileExists = (name) => name in files || fileExists(name);
  host.readFile = (name) => (name in files ? files[name] : readFile(name));
  return ts
    .getPreEmitDiagnostics(ts.createProgram(Object.keys(files), options, host))
    .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
};

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

describe('codemod-button-sizes type-only ButtonSizes imports', () => {
  it('turns an import-level type-only ButtonSizes into a value import', () => {
    const source =
      "import { Button } from '@vanguard/Button';\n" +
      "import type { ButtonSizes, ButtonProps } from '@vanguard/Button';\n" +
      'export const X = (props: ButtonProps) => <Button>{props.children}</Button>;\n';
    expect(typeErrors(source)).toEqual([]);
    const out = rewrite('type-only-import', source);
    expect(out).toContain("import { Button } from '@vanguard/Button';");
    expect(out).toContain("import { ButtonSizes, type ButtonProps } from '@vanguard/Button';");
    expect(out).toContain('<Button size={ButtonSizes.extraLarge}>');
    expect(typeErrors(out)).toEqual([]);
  });

  it('drops the type modifier from a specifier-level type-only ButtonSizes', () => {
    const source =
      "import { type ButtonSizes, Button } from '@vanguard/Button';\n" +
      'export const X = () => <Button>Go</Button>;\n';
    const out = rewrite('type-only-specifier', source);
    expect(out).toContain("import { ButtonSizes, Button } from '@vanguard/Button';");
    expect(out).toContain('<Button size={ButtonSizes.extraLarge}>');
    expect(typeErrors(out)).toEqual([]);
  });

  it('keeps the local alias of a type-only ButtonSizes', () => {
    const source =
      "import { Button, type ButtonSizes as Sizes } from '@vanguard/Button';\n" +
      'export const X = () => <Button>Go</Button>;\n';
    const out = rewrite('type-only-alias', source);
    expect(out).toContain("import { Button, ButtonSizes as Sizes } from '@vanguard/Button';");
    expect(out).toContain('<Button size={Sizes.extraLarge}>');
    expect(typeErrors(out)).toEqual([]);
  });
});
