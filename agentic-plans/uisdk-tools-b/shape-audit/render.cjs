#!/usr/bin/env node
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { Console } = require('node:console');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { parseArgs } = require('node:util');
const { build } = require('esbuild');
const { JSDOM, VirtualConsole } = require('jsdom');
const ts = require('typescript5');
const React = require('react');

const { values: args } = parseArgs({ options: {
  component: { type: 'string' },
  'routing-props': { type: 'string' },
  pack: { type: 'string' },
  sites: { type: 'string' },
  fixture: { type: 'string' },
} });
const component = args.component;
if (!/^[A-Z]\w*$/.test(component ?? '') || args['routing-props'] === undefined || !args.pack || !args.sites || !args.fixture) {
  throw new Error('Usage: render.cjs --component Name --routing-props key1,key2 --pack path.tgz --sites sites.json --fixture fixture.cjs');
}
const routingProps = [...new Set(args['routing-props'].split(',').map((key) => key.trim()).filter(Boolean))].sort();
const sites = JSON.parse(fs.readFileSync(args.sites, 'utf8'));
assert.equal(sites.component, component, 'Component differs from site scan');
assert.deepEqual(sites.routingProps, routingProps, 'Routing props differ from site scan');
const fixture = require(path.resolve(args.fixture));
assert.equal(typeof fixture.inspect, 'function', 'Fixture must export inspect({ host, props, site, bundle })');
assert.equal(typeof fixture.assertFirstRender, 'function', 'Fixture must export assertFirstRender(first, { props, site, bundle })');

function literal(recipe) {
  switch (recipe.kind) {
    case 'value': return recipe.value;
    case 'undefined': return undefined;
    case 'array': return recipe.items.map(literal);
    case 'object': return Object.fromEntries(recipe.entries.map(([key, value]) => [key, literal(value)]));
    default: throw new Error(`Cannot render ${recipe.kind} as a prop value`);
  }
}

function buildCases(site) {
  if (site.spreads.length || !site.routes) {
    const resolved = fixture.resolveSite?.({ site, React });
    if (!resolved?.length) return { reason: { spreads: site.spreads, unresolved: site.unresolved } };
    return { propsList: resolved, manual: true };
  }
  const defaults = typeof fixture.defaults === 'function' ? fixture.defaults({ site, React }) : fixture.defaults ?? {};
  const missing = site.keys.filter((key) => !site.props[key].values && !routingProps.includes(key) && !Object.hasOwn(defaults, key));
  if (missing.length) return { reason: { missingSyntheticValues: missing } };
  const propsList = site.routes.flatMap((routing) => {
    const props = Object.fromEntries(site.keys.map((key) => {
      const value = Object.hasOwn(routing, key) ? routing[key] : site.props[key].values?.[0];
      return [key, value ? literal(value) : defaults[key]];
    }));
    const expected = Object.fromEntries(routingProps.filter((key) => Object.hasOwn(props, key))
      .map((key) => [key, literal(routing[key])]));
    const expanded = fixture.expand?.({ site, props, React }) ?? [props];
    assert.ok(expanded.length, `${site.location}: fixture must render every routing alternative`);
    for (const instance of expanded) {
      const actual = Object.fromEntries(routingProps.filter((key) => Object.hasOwn(instance, key)).map((key) => [key, instance[key]]));
      assert.deepEqual(actual, expected, `${site.location}: fixture changed the resolved routing props`);
    }
    return expanded;
  });
  return { propsList, manual: false };
}

function namedExports(file) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  return source.statements.flatMap((statement) => ts.isExportDeclaration(statement) && statement.exportClause
    && ts.isNamedExports(statement.exportClause) ? statement.exportClause.elements.map((element) => element.name.text) : []);
}

async function loadPackedComponent(tmp, bundle) {
  const entry = `./package/${bundle}/index.js`;
  const outdir = path.join(tmp, bundle);
  await build({
    stdin: { contents: `export { ${component} } from ${JSON.stringify(entry)};`, resolveDir: tmp },
    bundle: true,
    splitting: true,
    format: 'esm',
    platform: 'node',
    packages: 'external',
    outdir,
    outExtension: { '.js': '.mjs' },
    logOverride: { 'ignored-bare-import': 'silent' },
  });
  return (await import(pathToFileURL(path.join(outdir, 'stdin.mjs')).href))[component];
}

async function main() {
  globalThis.console = new Console(process.stderr);
  const pack = path.resolve(args.pack);
  const checksum = createHash('sha256').update(fs.readFileSync(pack)).digest('hex');
  if (fixture.packSha256) assert.equal(checksum, fixture.packSha256, 'Unexpected tarball checksum');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vg-shape-audit-'));
  process.on('exit', () => fs.rmSync(tmp, { recursive: true, force: true }));
  execFileSync('tar', ['-xzf', pack, '-C', tmp], { env: { ...process.env, LC_ALL: 'C' } });
  fs.symlinkSync(path.resolve(__dirname, '../../../node_modules'), path.join(tmp, 'node_modules'), 'dir');

  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => errors.push(String(error)));
  const dom = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/', virtualConsole });
  for (const name of ['window', 'document', 'HTMLElement', 'Element', 'Node', 'MutationObserver']) {
    globalThis[name] = name === 'window' ? dom.window : dom.window[name];
  }
  const { flushSync } = require('react-dom');
  const { createRoot } = require('react-dom/client');

  function measure(Component, props, site, bundle) {
    const host = document.createElement('div');
    document.body.append(host);
    const onError = (error) => errors.push(String(error));
    const root = createRoot(host, { onCaughtError: onError, onUncaughtError: onError, onRecoverableError: onError });
    try {
      const createElement = () => React.createElement(Component, props);
      flushSync(() => root.render(fixture.wrap ? fixture.wrap({ createElement, props, site, bundle, React }) : createElement()));
      return fixture.inspect({ host, props, site, bundle });
    } finally {
      flushSync(() => root.unmount());
      host.remove();
    }
  }

  const Component = await loadPackedComponent(tmp, 'dist');
  const candidates = sites.sites.filter((site) => site.kind === 'rc-webapp' || site.scope !== 'evidence');
  const cases = [];
  const unresolved = [];
  for (const site of candidates) {
    const { propsList, manual, reason } = buildCases(site);
    if (reason) {
      unresolved.push({ location: site.location, ...reason });
      continue;
    }
    for (const props of propsList) {
      const keys = Object.keys(props).sort();
      if (site.spreads.length) assert.ok(site.keys.every((key) => Object.hasOwn(props, key)), `${site.location}: fixture dropped an explicit key`);
      else assert.deepEqual(keys, site.keys, `${site.location}: fixture changed the explicit key set`);
      const context = { props, site, bundle: 'dist' };
      const first = measure(Component, props, site, context.bundle);
      fixture.assertFirstRender(first, context);
      cases.push({ location: site.location, keys, props, first, manual });
    }
  }

  const wordpressBundle = 'dist-wordpress';
  const wordpressFile = path.join(tmp, 'package', wordpressBundle, 'index.js');
  const wpExports = fs.existsSync(wordpressFile) ? namedExports(wordpressFile) : [];
  const wordpress = { present: fs.existsSync(wordpressFile), namedExports: wpExports.length, exported: wpExports.includes(component), cases: [] };
  fixture.assertWordPress?.(wordpress, wordpress.present ? fs.readFileSync(wordpressFile, 'utf8') : '');
  if (fixture.wordpress?.length) {
    assert.ok(wordpress.exported, `${component} is unavailable in the WordPress bundle`);
    const WordPressComponent = await loadPackedComponent(tmp, wordpressBundle);
    for (const props of fixture.wordpress) {
      const first = measure(WordPressComponent, props, null, wordpressBundle);
      fixture.assertFirstRender(first, { props, site: null, bundle: wordpressBundle });
      wordpress.cases.push({ props, first });
    }
  }

  const controls = (fixture.controls ?? []).map(({ props, assertFirstRender }) => {
    const first = measure(Component, props, null, 'dist');
    assertFirstRender(first);
    return { props, first };
  });
  dom.window.close();
  const indirect = sites.indirect.filter((item) => item.scope !== 'evidence');
  return { component, sha: sites.sha, packSha256: checksum, routingProps, tested: cases.length,
    cases, controls, wordpress, unresolved, indirect, errors };
}

main().then((report) => {
  fs.writeFileSync(1, `${JSON.stringify(report, null, 2)}\n`);
  // Cold controls intentionally leave imports pending. The evidence ends at the first commit.
  process.exit(report.unresolved.length || report.indirect.length || report.errors.length ? 1 : 0);
}, (error) => {
  fs.writeFileSync(2, `${error.stack ?? error}\n`);
  process.exit(1);
});
