import fs from 'node:fs';
import path from 'node:path';

import ts from 'typescript5';
import { expect, test } from 'vitest';

function privateImports(code: string): string[] {
  if (!code.includes('@mui/')) return [];
  const source = ts.createSourceFile('fixture.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const imports: string[] = [];
  const inspect = (node: ts.Node) => {
    // Imports and config aliases share the same public-entry policy.
    if (ts.isStringLiteralLike(node) && /^@mui\/[^/]+(\/|$)/.test(node.text)) {
      const parts = node.text.split('/');
      if (parts.length > 3 || ['esm', 'modern', 'private'].includes(parts[2])) imports.push(node.text);
    }
    ts.forEachChild(node, inspect);
  };
  inspect(source);
  return imports;
}

for (const statement of [
  "import Button from '@mui/material/Button/Button'",
  "import type { ButtonProps } from '@mui/material/Button/Button'",
  "export { default } from '@mui/material/Button/Button'",
  "const load = import('@mui/material/Button/Button')",
  "const Button = require('@mui/material/Button/Button')",
  "import Button from '@mui/material/esm/Button'",
  "import Button from '@mui/material/modern/Button'",
  "import Button from '@mui/material/esm'",
  "import Button from '@mui/material/modern'",
  "const config = { resolve: { alias: { button: '@mui/material/Button/Button' } } }",
  "const config = { resolve: { alias: [{ find: 'button', replacement: '@mui/material/private' }] } }",
  'const config = { "compilerOptions": { "paths": { "button": ["@mui/material/esm/Button"] } } }',
])
  test(`rejects private MUI path: ${statement}`, () => expect(privateImports(statement)).toHaveLength(1));

test('allows public MUI package and one-level entries', () => {
  expect(
    privateImports(
      "import { Button } from '@mui/material'; import type { ButtonProps } from '@mui/material/Button'; export { styled } from '@mui/system';",
    ),
  ).toEqual([]);
});

test('production and config MUI imports use public entries', () => {
  const files = [
    ...ts.sys.readDirectory(path.resolve('src'), ['.ts', '.tsx'], ['**/*.spec.*', '**/*.stories.*']),
    ...ts.sys.readDirectory(path.resolve('config'), ['.ts', '.tsx', '.js']),
    ...ts.sys.readDirectory(path.resolve('.storybook'), ['.ts', '.tsx', '.js']),
    ...fs.readdirSync('.').filter((file) => /config\.[cm]?[jt]s$/.test(file)),
  ];
  expect(
    files.flatMap((file) => privateImports(fs.readFileSync(file, 'utf8')).map((value) => `${file}: ${value}`)),
  ).toEqual([]);
});
