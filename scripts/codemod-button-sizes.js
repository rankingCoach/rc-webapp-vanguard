#!/usr/bin/env node
/**
 * Codemod for the harmonized button sizes (VAN-85): every type now shares the muted size set, so the
 * non-muted types (default, primary, secondary, shimmer) are bumped one step to keep their footprint:
 *
 *   small            -> medium        (32 / 40px, unchanged)
 *   medium / no size -> extraLarge    (48 / 40px, unchanged)
 *   large            -> extraLarge    (60 -> 48px / 48 -> 40px, shorter)
 *
 * Muted buttons are left alone. Buttons whose type or size is computed at runtime, or that spread
 * props, are not touched: they are listed for a manual check.
 *
 * Usage: node scripts/codemod-button-sizes.js <dir> [--write] [--exclude <substring>]...
 * Without --write it only reports what it would change.
 *
 * Run it once per codebase: it can't tell a migrated `medium` (formerly `small`) from an unmigrated one,
 * so a second run reports, and with --write applies, a second bump.
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const args = process.argv.slice(2);
const root = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--exclude');
const write = args.includes('--write');
const excludes = args.filter((_, i) => args[i - 1] === '--exclude');
if (!root) {
  console.error('Usage: node scripts/codemod-button-sizes.js <dir> [--write] [--exclude <substring>]...');
  process.exit(1);
}

// Modules a vanguard Button can be imported from (the package, the @vanguard/Button barrel and its index,
// the Button file with or without its extension, relative paths inside vanguard at any depth)
const BUTTON_MODULE =
  /(^vanguard$|@rankingcoach\/vanguard|@vanguard\/Button(\/index)?$|Button\/Button(\.tsx)?$|^(\.\/|(\.\.\/)+)Button(\/index)?$)/;
const BUMP = { small: 'medium', medium: 'extraLarge', large: 'extraLarge', extraLarge: 'extraLarge' };
const SIZE_STRINGS = { small: 'small', medium: 'medium', large: 'large', 'extra-large': 'extraLarge' };
const NON_MUTED = ['default', 'primary', 'secondary', 'shimmer'];

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (excludes.some((ex) => full.includes(ex))) continue;
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.tsx')) files.push(full);
  }
})(root);

const changed = [];
const manual = [];

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  if (!src.includes('Button')) continue;
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  // Local names of Button / ButtonSizes / ButtonTypes, and the import to add ButtonSizes to if it's missing.
  // Type-only bindings can't be used as values, so they don't count; a type-only ButtonSizes is remembered
  // so it can be turned into a value import rather than importing the name a second time.
  const names = { Button: new Set(), ButtonSizes: null, ButtonTypes: null };
  let buttonImport = null;
  let typeOnlySizes = null;
  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt) || !BUTTON_MODULE.test(stmt.moduleSpecifier.text)) continue;
    const bindings = stmt.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const el of bindings.elements) {
      const imported = (el.propertyName || el.name).text;
      if (stmt.importClause.isTypeOnly || el.isTypeOnly) {
        if (imported === 'ButtonSizes') typeOnlySizes = { clause: stmt.importClause, el };
        continue;
      }
      if (imported === 'Button') {
        names.Button.add(el.name.text);
        buttonImport = buttonImport || bindings;
      }
      if (imported === 'ButtonSizes') names.ButtonSizes = el.name.text;
      if (imported === 'ButtonTypes') names.ButtonTypes = el.name.text;
    }
  }
  if (!names.Button.size) continue;

  const sizesName = names.ButtonSizes || typeOnlySizes?.el.name.text || 'ButtonSizes';
  const edits = [];
  const where = (node) => `${path.relative(root, file)}:${sf.getLineAndCharacterOfPosition(node.getStart()).line + 1}`;

  const literal = (init, enumName) => {
    if (!init) return { value: 'true' };
    if (ts.isStringLiteral(init)) return { value: init.text, string: true };
    const expr = init.expression;
    if (expr && ts.isPropertyAccessExpression(expr) && expr.expression.getText() === enumName) {
      return { value: expr.name.text };
    }
    return null;
  };

  const visit = (node) => {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      names.Button.has(node.tagName.getText())
    ) {
      const props = node.attributes.properties;
      const attr = (name) => props.find((p) => ts.isJsxAttribute(p) && p.name.getText() === name);
      const typeAttr = attr('type');
      const sizeAttr = attr('size');

      if (props.some(ts.isJsxSpreadAttribute)) {
        manual.push(`${where(node)}  spread props`);
      } else {
        const type = typeAttr ? literal(typeAttr.initializer, names.ButtonTypes) : { value: 'primary' };
        if (!type) {
          manual.push(`${where(node)}  type={${typeAttr.initializer.expression.getText()}}`);
        } else if (NON_MUTED.includes(type.value)) {
          if (!sizeAttr) {
            edits.push({
              pos: node.tagName.getEnd(),
              end: node.tagName.getEnd(),
              text: ` size={${sizesName}.extraLarge}`,
            });
            changed.push(`${where(node)}  ${type.value}: (default) -> extraLarge`);
          } else {
            const size = literal(sizeAttr.initializer, sizesName);
            const key = size && (size.string ? SIZE_STRINGS[size.value] : size.value);
            if (!key || !BUMP[key]) {
              manual.push(
                `${where(node)}  ${type.value}, size={${sizeAttr.initializer.expression?.getText() ?? sizeAttr.initializer.getText()}}`,
              );
            } else if (BUMP[key] !== key) {
              const init = sizeAttr.initializer;
              edits.push({ pos: init.getStart(), end: init.getEnd(), text: `{${sizesName}.${BUMP[key]}}` });
              changed.push(`${where(node)}  ${type.value}: ${key} -> ${BUMP[key]}`);
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);

  if (!edits.length) continue;
  if (!names.ButtonSizes && typeOnlySizes) {
    const { clause, el } = typeOnlySizes;
    if (el.isTypeOnly) {
      // `import { type ButtonSizes }`: drop the specifier's `type`
      edits.push({ pos: el.getStart(), end: (el.propertyName || el.name).getStart(), text: '' });
    } else {
      // `import type { ButtonSizes, X }` -> `import { ButtonSizes, type X }`: the others stay type-only
      edits.push({ pos: clause.getStart(), end: clause.namedBindings.getStart(), text: '' });
      for (const other of clause.namedBindings.elements)
        if (other !== el) edits.push({ pos: other.getStart(), end: other.getStart(), text: 'type ' });
    }
  } else if (!names.ButtonSizes) {
    // Add ButtonSizes to the import that brings in Button
    const last = buttonImport.elements[buttonImport.elements.length - 1];
    edits.push({ pos: last.getEnd(), end: last.getEnd(), text: ', ButtonSizes' });
  }
  if (write) {
    let out = src;
    for (const edit of edits.sort((a, b) => b.pos - a.pos))
      out = out.slice(0, edit.pos) + edit.text + out.slice(edit.end);
    fs.writeFileSync(file, out);
  }
}

console.log(`${write ? 'Changed' : 'Would change'} ${changed.length} buttons:`);
changed.forEach((line) => console.log(`  ${line}`));
console.log(`\nCheck by hand (${manual.length}): type or size computed at runtime, or spread props`);
manual.forEach((line) => console.log(`  ${line}`));
