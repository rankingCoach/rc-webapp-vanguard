import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript5';
import { expect, test } from 'vitest';

import { optimizedMuiEntrypoints, unpreparedMuiEntrypoints } from './mui-entrypoint-policy';

// MUI's package exports support public component entry points, not nested implementation files.
test('production MUI imports use public package entry points', () => {
  const sourceRoot = path.resolve('src');
  const files = ts.sys.readDirectory(sourceRoot, ['.ts', '.tsx'], ['**/*.spec.*', '**/*.stories.*']);
  const privateImports: string[] = [];
  for (const file of files) {
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    for (const statement of source.statements) {
      if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) continue;
      const specifier = statement.moduleSpecifier;
      if (!specifier || !ts.isStringLiteral(specifier)) continue;
      if (/^@mui\/(material|system)\//.test(specifier.text) && specifier.text.split('/').length > 3) {
        privateImports.push(`${path.relative(sourceRoot, file)}: ${specifier.text}`);
      }
    }
  }
  expect(privateImports).toEqual([]);
});


test('a new runtime MUI subpath requires explicit browser prebundling', () => {
  const unrelated = optimizedMuiEntrypoints('const config = { test: { include: ["@mui/material/utils"] } };');
  expect(unpreparedMuiEntrypoints("import { mergeSlotProps } from '@mui/material/utils'", new Set(), unrelated))
    .toEqual(['@mui/material/utils']);
});

test('root imports and existing accepted entrypoints need no new optimizer entry', () => {
  expect(unpreparedMuiEntrypoints("import { mergeSlotProps } from '@mui/material'; import { styled } from '@mui/material/styles'",
    new Set(['@mui/material/styles']), new Set())).toEqual([]);
});

test('an explicit optimizeDeps include permits a new runtime MUI subpath', () => {
  const optimized = optimizedMuiEntrypoints('const config = { optimizeDeps: { include: ["@mui/material/utils"] } };');
  expect(unpreparedMuiEntrypoints("export { mergeSlotProps } from '@mui/material/utils'", new Set(), optimized)).toEqual([]);
});

test('erased type-only MUI imports do not create runtime optimizer entries', () => {
  expect(unpreparedMuiEntrypoints("import type { TransitionProps } from '@mui/material/transitions'; export type { TextFieldProps } from '@mui/material/TextField'",
    new Set(), new Set())).toEqual([]);
});

test('new src MUI runtime entrypoint uses are prebundled or use the package root', () => {
  const baseline = JSON.parse(fs.readFileSync('scripts/mui-runtime-entrypoints-baseline.json', 'utf8')) as {
    uses: { file: string; specifier: string }[];
  };
  const accepted = new Set(baseline.uses.map((use) => use.specifier));
  const optimized = optimizedMuiEntrypoints(fs.readFileSync('vitest.config.ts', 'utf8'));
  const violations = ts.sys.readDirectory(path.resolve('src'), ['.ts', '.tsx', '.js', '.jsx'])
    .filter((file) => !file.endsWith('.d.ts'))
    .flatMap((file) => {
      const relative = path.relative(process.cwd(), file).split(path.sep).join('/');
      return unpreparedMuiEntrypoints(fs.readFileSync(file, 'utf8'), accepted, optimized)
        .map((specifier) => `${relative}: ${specifier}`);
    });
  expect(violations).toEqual([]);
});
