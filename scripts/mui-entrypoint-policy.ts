import ts from 'typescript5';

/** Type-only imports and declarations do not create browser optimizer entrypoints. */
export function runtimeMuiEntrypoints(code: string): string[] {
  if (!code.includes('@mui/')) return [];
  const source = ts.createSourceFile('entry.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const entries = new Set<string>();
  const add = (value: ts.Node | undefined) => {
    if (value && ts.isStringLiteralLike(value) && value.text.startsWith('@mui/')) entries.add(value.text);
  };
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node)) {
      const clause = node.importClause;
      const names = clause?.namedBindings;
      const typesOnly = clause?.isTypeOnly ||
        (!clause?.name && names && ts.isNamedImports(names) && names.elements.length > 0 &&
          names.elements.every((entry) => entry.isTypeOnly));
      if (!typesOnly) add(node.moduleSpecifier);
    } else if (ts.isExportDeclaration(node) && !node.isTypeOnly) {
      const names = node.exportClause;
      if (!names || !ts.isNamedExports(names) || names.elements.some((entry) => !entry.isTypeOnly)) add(node.moduleSpecifier);
    } else if (ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
      add(node.arguments[0]);
    } else if (ts.isImportEqualsDeclaration(node) && !node.isTypeOnly && ts.isExternalModuleReference(node.moduleReference)) {
      add(node.moduleReference.expression);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return [...entries].sort();
}

/** Read only literal optimizeDeps.include values; unrelated include globs grant no waiver. */
export function optimizedMuiEntrypoints(config: string): Set<string> {
  const source = ts.createSourceFile('config.ts', config, ts.ScriptTarget.Latest, true);
  const entries = new Set<string>();
  const visit = (node: ts.Node) => {
    if (ts.isPropertyAssignment(node) && node.name.getText(source).replace(/["']/g, '') === 'optimizeDeps' &&
      ts.isObjectLiteralExpression(node.initializer)) {
      for (const property of node.initializer.properties) {
        if (ts.isPropertyAssignment(property) && property.name.getText(source).replace(/["']/g, '') === 'include' &&
          ts.isArrayLiteralExpression(property.initializer)) {
          for (const value of property.initializer.elements) if (ts.isStringLiteralLike(value)) entries.add(value.text);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return entries;
}

export function unpreparedMuiEntrypoints(
  code: string,
  accepted: ReadonlySet<string>,
  optimized: ReadonlySet<string>,
): string[] {
  return runtimeMuiEntrypoints(code).filter((specifier) =>
    specifier.split('/').length > 2 && !accepted.has(specifier) && !optimized.has(specifier),
  );
}
