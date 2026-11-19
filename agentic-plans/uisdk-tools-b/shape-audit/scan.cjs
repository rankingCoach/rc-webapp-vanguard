#!/usr/bin/env node
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { parseArgs } = require('node:util');
const ts = require('typescript5');

const { values: args } = parseArgs({ options: {
  component: { type: 'string' },
  'routing-props': { type: 'string' },
  sha: { type: 'string' },
  'consumer-root': { type: 'string' },
} });
const component = args.component;
if (!/^[A-Z]\w*$/.test(component ?? '') || args['routing-props'] === undefined || !args.sha || !args['consumer-root']) {
  throw new Error('Usage: scan.cjs --component Name --routing-props key1,key2 --sha commit --consumer-root path');
}
const repo = path.resolve(__dirname, '../../..');
const consumer = path.resolve(args['consumer-root']);
const routingProps = [...new Set(args['routing-props'].split(',').map((key) => key.trim()).filter(Boolean))].sort();
const git = (args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
const sha = git(['rev-parse', '--verify', '--end-of-options', `${args.sha}^{commit}`]).trim();

function candidates(run) {
  try {
    return run().split('\0').filter(Boolean);
  } catch (error) {
    if (error.status === 1) return [];
    throw error;
  }
}

const consumerFiles = candidates(() => execFileSync('rg', [
  '-l0w', '-g', '*.{tsx,ts,jsx,js}', '--', component, '.',
], { cwd: consumer, encoding: 'utf8' }));
const libraryFiles = candidates(() => git(['grep', '-lz', '-w', '-e', component, sha, '--', 'src']))
  .map((file) => file.slice(sha.length + 1))
  .filter((file) => /\.[jt]sx?$/.test(file));
const isEvidenceFile = (file) => /\.(?:spec|test|stories|story)\.[jt]sx?$|(?:^|\/)(?:stories|__tests__)\/|_[^/]*[Rr]eference\./.test(file);
const unique = (values) => [...new Map(values.map((value) => [JSON.stringify(value), value])).values()];
const scalar = (value) => [{ kind: 'value', value }];

function product(options) {
  let rows = [[]];
  for (const choices of options) {
    if (!choices || rows.length * choices.length > 256) return null;
    rows = rows.flatMap((row) => choices.map((choice) => [...row, choice]));
  }
  return rows;
}

function alternatives(node) {
  if (!node) return [{ kind: 'undefined' }];
  if (ts.isStringLiteralLike(node)) return scalar(node.text);
  if (ts.isNumericLiteral(node)) return scalar(Number(node.text));
  if (node.kind === ts.SyntaxKind.TrueKeyword) return scalar(true);
  if (node.kind === ts.SyntaxKind.FalseKeyword) return scalar(false);
  if (node.kind === ts.SyntaxKind.NullKeyword) return scalar(null);
  if (ts.isIdentifier(node) && node.text === 'undefined') return [{ kind: 'undefined' }];
  if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isNonNullExpression(node)) {
    return alternatives(node.expression);
  }
  if (ts.isConditionalExpression(node)) {
    const yes = alternatives(node.whenTrue);
    const no = alternatives(node.whenFalse);
    return yes && no ? unique([...yes, ...no]) : null;
  }
  if (ts.isArrayLiteralExpression(node)) {
    return product(node.elements.map(alternatives))?.map((items) => ({ kind: 'array', items })) ?? null;
  }
  if (ts.isObjectLiteralExpression(node)) {
    const names = [];
    const values = [];
    for (const prop of node.properties) {
      if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name) && !ts.isStringLiteralLike(prop.name) && !ts.isNumericLiteral(prop.name)) return null;
      names.push(prop.name.text);
      values.push(alternatives(prop.initializer));
    }
    return product(values)?.map((items) => ({ kind: 'object', entries: items.map((item, i) => [names[i], item]) })) ?? null;
  }
  return null;
}

const sites = [];
const indirect = [];
const wpEntry = 'src/index-wordpress.ts';

function scan(kind, fileName, contents) {
  const file = ts.createSourceFile(fileName, contents, ts.ScriptTarget.Latest, true);
  const scope = kind === 'vanguard' && fileName === wpEntry ? 'wordpress' : isEvidenceFile(fileName) ? 'evidence' : 'production';
  const named = new Set();
  const namespaces = new Set();
  const bindings = new Set();
  const vanguardModule = (name) => /^(?:vanguard|@rankingcoach\/vanguard)(?:\/|$)/.test(name)
    || kind === 'vanguard' && !name.includes('/primitives/') && (
      name.startsWith('@vanguard/') || name.startsWith('.') && (
        name.split('/').includes(component) || /(?:\/index|\.\.)$|\/core$|\/common$/.test(name)
      )
    );

  for (const statement of file.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteralLike(statement.moduleSpecifier)) continue;
    if (!vanguardModule(statement.moduleSpecifier.text) || statement.importClause?.isTypeOnly) continue;
    const imports = statement.importClause?.namedBindings;
    if (imports && ts.isNamespaceImport(imports)) {
      namespaces.add(imports.name.text);
      bindings.add(imports.name);
    }
    if (imports && ts.isNamedImports(imports)) {
      for (const spec of imports.elements) {
        if (spec.isTypeOnly || (spec.propertyName ?? spec.name).text !== component) continue;
        named.add(spec.name.text);
        bindings.add(spec.name);
      }
    }
  }

  function location(node) {
    const { line, character } = file.getLineAndCharacterOfPosition(node.getStart(file));
    return `${fileName.replace(/^\.\//, '')}:${line + 1}:${character + 1}`;
  }

  function isComponent(node) {
    return ts.isIdentifier(node) && named.has(node.text)
      || ts.isPropertyAccessExpression(node) && node.name.text === component
        && ts.isIdentifier(node.expression) && namespaces.has(node.expression.text);
  }

  function record(node, props, spreads) {
    const keys = Object.keys(props).sort();
    const values = routingProps.map((key) => Object.hasOwn(props, key) ? props[key].values : [{ kind: 'omitted' }]);
    const routes = product(values)?.map((row) => Object.fromEntries(routingProps.map((key, i) => [key, row[i]]))) ?? null;
    const unresolved = routingProps.filter((key) => Object.hasOwn(props, key) && props[key].values === null);
    if (routes === null && !unresolved.length) unresolved.push('routing alternative limit exceeded');
    sites.push({ kind, scope, location: location(node), keys, routes, unresolved, spreads, props });
  }

  function visit(node) {
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && isComponent(node.tagName)) {
      const props = Object.create(null);
      const spreads = [];
      for (const attr of node.attributes.properties) {
        if (ts.isJsxSpreadAttribute(attr)) {
          spreads.push(attr.expression.getText(file));
          continue;
        }
        const init = attr.initializer;
        const value = init && ts.isJsxExpression(init) ? init.expression : init;
        props[attr.name.getText(file)] = { source: init?.getText(file) ?? '(boolean presence)', values: init ? alternatives(value) : scalar(true) };
      }
      if (ts.isJsxOpeningElement(node) && node.parent.children.some((child) => child.getText(file).trim())) {
        props.children = { source: '(JSX children)', values: null };
      }
      record(node, props, spreads);
    }
    if (ts.isCallExpression(node) && node.arguments[0] && isComponent(node.arguments[0]) && /(?:^|\.)createElement$/.test(node.expression.getText(file))) {
      const props = Object.create(null);
      const spreads = [];
      const input = node.arguments[1];
      if (input && ts.isObjectLiteralExpression(input)) {
        for (const prop of input.properties) {
          if (ts.isPropertyAssignment(prop) && (ts.isIdentifier(prop.name) || ts.isStringLiteralLike(prop.name))) {
            props[prop.name.text] = { source: prop.initializer.getText(file), values: alternatives(prop.initializer) };
          } else spreads.push(prop.getText(file));
        }
      } else if (input && input.kind !== ts.SyntaxKind.NullKeyword && input.getText(file) !== 'undefined') spreads.push(input.getText(file));
      if (node.arguments.length > 2) props.children = { source: '(createElement children)', values: null };
      record(node, props, spreads);
      for (const child of node.arguments.slice(1)) visit(child);
      return;
    }
    if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)
      && vanguardModule(node.moduleSpecifier.text) && node.exportClause && ts.isNamedExports(node.exportClause)
      && node.exportClause.elements.some((spec) => !spec.isTypeOnly && (spec.propertyName ?? spec.name).text === component)
      && kind === 'rc-webapp') {
      indirect.push({ kind, scope, location: location(node), source: node.getText(file) });
    }
    if (isComponent(node) && !bindings.has(node) && !(ts.isImportSpecifier(node.parent) || ts.isTypeQueryNode(node.parent) || ts.isJsxOpeningElement(node.parent)
      || ts.isJsxSelfClosingElement(node.parent) || ts.isJsxClosingElement(node.parent))) {
      indirect.push({ kind, scope, location: location(node), source: node.parent.getText(file) });
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
}

for (const file of consumerFiles.sort()) scan('rc-webapp', file, fs.readFileSync(path.join(consumer, file), 'utf8'));
for (const file of libraryFiles.sort()) scan('vanguard', file, git(['show', `${sha}:${file}`]));

const shapes = new Map();
for (const site of sites.filter((site) => site.kind === 'rc-webapp' || site.scope !== 'evidence')) {
  if (site.spreads.length || !site.routes) continue;
  for (const routing of site.routes) {
    const id = JSON.stringify([site.keys, routing]);
    if (!shapes.has(id)) shapes.set(id, { keys: site.keys, routing, counts: {} });
    const { counts } = shapes.get(id);
    const origin = `${site.kind}:${site.scope}`;
    counts[origin] = (counts[origin] ?? 0) + 1;
  }
}

console.log(JSON.stringify({ component, sha, routingProps, candidateFiles: { consumer: consumerFiles.length, vanguard: libraryFiles.length },
  sites, indirect, shapes: [...shapes.values()] }, null, 2));
