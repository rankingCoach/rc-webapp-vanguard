#!/usr/bin/env node
/**
 * Generate TypeScript type information for all exported components, hooks, and helpers.
 *
 * This script:
 * 1. Parses src/index.ts to identify all value exports (skips types/interfaces)
 * 2. Loads metadata from src/exports-meta/*.json for enrichment
 * 3. Uses TypeScript Compiler API to extract type information
 * 4. Generates JSON files with props, types, and metadata for MCP context
 *
 * Output: src/exports-props/*.json
 *
 * Usage: node scripts/generate-exports-props.js
 */
const ts = require('typescript');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'src', 'index.ts');
const META_DIR = path.join(ROOT, 'src', 'exports-meta');
// output folder moved under `src` so MCP package can import generated files
const OUT_DIR = path.join(ROOT, 'src', 'exports-props');

function ensureOutDir() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
}

function log(...args) {
  console.log('[generate-exports-props]', ...args);
}

/**
 * Parse index.ts to extract all value (non-type) exports.
 * Uses regex-based approach similar to check-meta-coverage.js for consistency.
 */
function parseValueExportsFromIndex(indexPath) {
  const content = fs.readFileSync(indexPath, 'utf8');
  const lines = content.split('\n');
  const exports = new Set();

  // Regex to match "export { A, B, C } from ..." or "export { A } from ..."
  const namedExportRegex = /export\s+\{\s*([^}]+)\s*\}\s+from/g;
  // Regex to match "export const x = ..." or "export function x() ..." or "export class x ..."
  const inlineExportRegex = /export\s+(const|function|class|let|var)\s+([a-zA-Z0-9_$]+)/g;

  lines.forEach((line) => {
    // Skip type exports
    if (line.trim().startsWith('export type')) return;
    if (line.trim().startsWith('export interface')) return;

    // Handle named exports: export { A, B } from '...'
    let match;
    while ((match = namedExportRegex.exec(line)) !== null) {
      const items = match[1].split(',').map((i) => i.trim().split(/\s+as\s+/)[0]);
      items.forEach((item) => {
        if (item && item !== 'type') {
          exports.add(item);
        }
      });
    }
    namedExportRegex.lastIndex = 0; // Reset for next line

    // Handle inline exports: export const X = ...
    while ((match = inlineExportRegex.exec(line)) !== null) {
      exports.add(match[2]);
    }
    inlineExportRegex.lastIndex = 0;
  });

  return Array.from(exports);
}

/**
 * Load metadata files to classify exports and get additional context.
 */
function loadMetadata() {
  const metadata = new Map();
  if (!fs.existsSync(META_DIR)) {
    log('WARNING: Meta directory does not exist:', META_DIR);
    return metadata;
  }

  const metaFiles = fs.readdirSync(META_DIR).filter((f) => f.endsWith('.json'));
  log('Loading', metaFiles.length, 'metadata files from', META_DIR);

  for (const file of metaFiles) {
    const name = path.basename(file, '.json');
    const filePath = path.join(META_DIR, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      metadata.set(name, data);
    } catch (e) {
      log('WARNING: Failed to parse metadata file', file, ':', e.message);
    }
  }

  return metadata;
}

function createProgram() {
  // Load project tsconfig so we analyze the whole project and can resolve types across files
  try {
    const configPath = ts.findConfigFile(ROOT, ts.sys.fileExists, 'tsconfig.json');
    if (configPath) {
      const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
      const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));
      const rootNames = parsed.fileNames;
      const options = parsed.options;
      return ts.createProgram(rootNames, options);
    }
  } catch (e) {
    console.warn('Could not load tsconfig, falling back to single-file program', e && e.message);
  }

  const options = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    jsx: ts.JsxEmit.React,
    allowJs: true,
    skipLibCheck: true,
  };
  return ts.createProgram([INDEX], options);
}

function resolveModule(specifier, containingFile, options) {
  const resolved = ts.resolveModuleName(specifier, containingFile, options, ts.sys);
  return resolved.resolvedModule && resolved.resolvedModule.resolvedFileName;
}

function isSimpleConstant(decl) {
  // treat as simple constant if it's a variable declared with const and initializer is literal (string/number/boolean/null)
  if (!decl) return false;
  if (decl.kind === ts.SyntaxKind.VariableDeclaration) {
    const parent = decl.parent && decl.parent.parent; // VariableDeclarationList -> VariableStatement
    const declList = decl.parent;
    if (declList && declList.flags & ts.NodeFlags.Const) {
      const init = decl.initializer;
      if (!init) return false;
      return (
        init.kind === ts.SyntaxKind.StringLiteral ||
        init.kind === ts.SyntaxKind.NumericLiteral ||
        init.kind === ts.SyntaxKind.TrueKeyword ||
        init.kind === ts.SyntaxKind.FalseKeyword ||
        init.kind === ts.SyntaxKind.NullKeyword
      );
    }
  }
  return false;
}

function serializeType(checker, type) {
  try {
    return checker.typeToString(
      type,
      undefined,
      ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseFullyQualifiedType,
    );
  } catch (e) {
    return String(type && type.symbol ? type.symbol.name : type);
  }
}

function collectReferencedTypes(checker, type, out = {}, seen = new Set()) {
  if (!type || seen.has(type.id)) return out;
  seen.add(type.id);

  // Helpers
  function isIntrinsic(t) {
    const F = ts.TypeFlags;
    return !!(
      t.flags &
      (F.String |
        F.StringLiteral |
        F.Number |
        F.NumberLiteral |
        F.Boolean |
        F.BooleanLiteral |
        F.ESSymbol |
        F.ESSymbolLike |
        F.Null |
        F.Undefined |
        F.Void |
        F.Any |
        F.Unknown)
    );
  }
  function isProjectSource(sf) {
    if (!sf) return false;
    if (sf.isDeclarationFile) return false; // skip lib and .d.ts files
    const fn = sf.fileName;
    if (!fn) return false;
    if (fn.indexOf('node_modules') !== -1) return false;
    // prefer files inside project root
    return fn.startsWith(ROOT);
  }

  // Skip primitives and builtins to avoid huge noise (String/Array prototype methods etc)
  try {
    if (isIntrinsic(type)) return out;
  } catch (e) {}

  // If this type is a named symbol, capture a minimal snippet + source only when it's from project files
  const typeSymbol = type.symbol || type.aliasSymbol || null;
  if (typeSymbol && typeSymbol.getName && typeSymbol.declarations && typeSymbol.declarations.length) {
    const name = typeSymbol.getName();
    if (!out[name]) {
      try {
        const decl = typeSymbol.declarations[0];
        const sf = decl.getSourceFile && decl.getSourceFile();
        if (isProjectSource(sf)) {
          const src = path.relative(ROOT, sf.fileName);
          // get a short snippet (avoid dumping entire lib files)
          let text = '';
          try {
            text = sf.text.substring(decl.pos, decl.end).trim().replace(/\s+/g, ' ');
            if (text.length > 600) text = text.slice(0, 600) + '...';
          } catch (e) {
            text = name;
          }
          out[name] = { source: src, snippet: text };
        }
      } catch (e) {
        out[typeSymbol.getName()] = { source: 'unknown', snippet: typeSymbol.getName() };
      }
    }
  }

  // Recurse into alias/type arguments
  if (type.aliasTypeArguments && type.aliasTypeArguments.length) {
    for (const ta of type.aliasTypeArguments) collectReferencedTypes(checker, ta, out, seen);
  }
  if (type.typeArguments && type.typeArguments.length) {
    for (const ta of type.typeArguments) collectReferencedTypes(checker, ta, out, seen);
  }

  // If object-like, iterate properties but avoid recursing into builtins or declaration file types
  const props = type.getProperties ? type.getProperties() : [];
  for (const p of props) {
    try {
      const decl = p.valueDeclaration || (p.declarations && p.declarations[0]);
      const pType = checker.getTypeOfSymbolAtLocation(p, decl || decl);
      // if property's type is intrinsic or from .d.ts skip
      const pDecl =
        (pType && (pType.symbol || pType.aliasSymbol) && pType.symbol.declarations && pType.symbol.declarations[0]) ||
        null;
      const pSF = pDecl && pDecl.getSourceFile && pDecl.getSourceFile();
      if (pSF && !isProjectSource(pSF)) continue;
      if (isIntrinsic(pType)) continue;
      collectReferencedTypes(checker, pType, out, seen);
    } catch (e) {
      /* ignore */
    }
  }

  // signatures
  if (type.getCallSignatures) {
    for (const sig of type.getCallSignatures()) {
      for (const param of sig.getParameters()) {
        try {
          const decl = param.valueDeclaration || (param.declarations && param.declarations[0]);
          const pType = checker.getTypeOfSymbolAtLocation(param, decl || decl);
          if (isIntrinsic(pType)) continue;
          // skip params declared in .d.ts
          const pDecl = (param && param.declarations && param.declarations[0]) || null;
          const pSF = pDecl && pDecl.getSourceFile && pDecl.getSourceFile();
          if (pSF && !isProjectSource(pSF)) continue;
          collectReferencedTypes(checker, pType, out, seen);
        } catch (e) {}
      }
      const ret = sig.getReturnType && sig.getReturnType();
      if (ret && !isIntrinsic(ret)) {
        const retDecl =
          (ret &&
            (ret.symbol || ret.aliasSymbol) &&
            ret.symbol &&
            ret.symbol.declarations &&
            ret.symbol.declarations[0]) ||
          null;
        const rSF = retDecl && retDecl.getSourceFile && retDecl.getSourceFile();
        if (!rSF || isProjectSource(rSF)) collectReferencedTypes(checker, ret, out, seen);
      }
    }
  }

  return out;
}

function findTypeAliasByName(program, checker, typeName, preferredDir) {
  // Prefer same-directory declarations
  const files = program.getSourceFiles();
  let candidate = null;
  for (const sf of files) {
    if (sf.isDeclarationFile) continue;
    if (preferredDir && !sf.fileName.startsWith(preferredDir)) continue;
    for (const stmt of sf.statements) {
      if (
        (ts.isTypeAliasDeclaration(stmt) || ts.isInterfaceDeclaration(stmt)) &&
        stmt.name &&
        stmt.name.text === typeName
      ) {
        try {
          if (ts.isTypeAliasDeclaration(stmt) && stmt.type) {
            return checker.getTypeFromTypeNode(stmt.type);
          }
          return checker.getTypeAtLocation(stmt);
        } catch (e) {}
      }
    }
    // if not found in preferred dir, remember one as fallback
    for (const stmt of sf.statements) {
      if (
        (ts.isTypeAliasDeclaration(stmt) || ts.isInterfaceDeclaration(stmt)) &&
        stmt.name &&
        stmt.name.text === typeName
      ) {
        try {
          if (!candidate) candidate = checker.getTypeAtLocation(stmt);
        } catch (e) {}
      }
    }
  }
  return candidate;
}

function findTypeDeclarationSnippet(program, checker, typeName, preferredDir) {
  const files = program.getSourceFiles();
  // Prefer same-directory declarations
  for (const sf of files) {
    if (sf.isDeclarationFile) continue;
    if (preferredDir && !sf.fileName.startsWith(preferredDir)) continue;
    for (const stmt of sf.statements) {
      if (
        (ts.isTypeAliasDeclaration(stmt) || ts.isInterfaceDeclaration(stmt) || ts.isEnumDeclaration(stmt)) &&
        stmt.name &&
        stmt.name.text === typeName
      ) {
        try {
          const src = path.relative(ROOT, sf.fileName);
          let text = stmt.getText().replace(/\s+/g, ' ');
          if (text.length > 600) text = text.slice(0, 600) + '...';
          return { source: src, snippet: text };
        } catch (e) {}
      }
    }
  }
  // fallback: loose search across project files
  for (const sf of files) {
    if (sf.isDeclarationFile) continue;
    for (const stmt of sf.statements) {
      if (
        (ts.isTypeAliasDeclaration(stmt) || ts.isInterfaceDeclaration(stmt) || ts.isEnumDeclaration(stmt)) &&
        stmt.name &&
        stmt.name.text === typeName
      ) {
        try {
          const src = path.relative(ROOT, sf.fileName);
          let text = stmt.getText().replace(/\s+/g, ' ');
          if (text.length > 600) text = text.slice(0, 600) + '...';
          return { source: src, snippet: text };
        } catch (e) {}
      }
    }
  }
  return null;
}

function getPropsTypeForSymbol(checker, symbol, fromPath) {
  if (!symbol) return null;

  // If this is an alias (re-export), resolve to the original symbol so we can inspect the real declaration
  try {
    if (symbol.flags & ts.SymbolFlags.Alias) {
      const aliased = checker.getAliasedSymbol(symbol);
      if (aliased) symbol = aliased;
    }
  } catch (e) {
    // ignore
  }

  const decl = symbol.valueDeclaration || (symbol.declarations && symbol.declarations[0]);
  if (!decl) return null;

  // If this declaration is an export specifier from a barrel file, try to resolve the original module
  if (
    decl.kind === ts.SyntaxKind.ExportSpecifier ||
    (decl.getSourceFile && decl.getSourceFile().fileName && decl.getSourceFile().fileName.endsWith('/index.ts'))
  ) {
    try {
      const sf = decl.getSourceFile();
      // find export declarations that export this name and have a moduleSpecifier
      const nameToFind = symbol.getName();
      const exports = sf.statements.filter(
        (s) => ts.isExportDeclaration(s) && s.moduleSpecifier && s.exportClause && ts.isNamedExports(s.exportClause),
      );
      for (const ed of exports) {
        const named = ed.exportClause;
        for (const el of named.elements) {
          const exportedName = el.name && el.name.text;
          const localName = el.propertyName ? el.propertyName.text : exportedName;
          if (exportedName === nameToFind) {
            const spec = ed.moduleSpecifier && ed.moduleSpecifier.text;
            if (!spec) continue;
            const resolved = resolveModule(spec, sf.fileName, program.getCompilerOptions());
            if (!resolved) continue;
            const targetSF = program.getSourceFile(resolved);
            if (!targetSF) continue;
            const moduleSymbol = checker.getSymbolAtLocation(targetSF);
            if (!moduleSymbol) continue;
            const exportsOfModule = checker.getExportsOfModule(moduleSymbol);
            const sym = exportsOfModule.find(
              (s) => s.getName() === (el.propertyName ? el.propertyName.text : exportedName),
            );
            if (sym) {
              // recurse on resolved symbol
              return getPropsTypeForSymbol(checker, sym, resolved);
            }
          }
        }
      }

      // Fallback: attempt to find implementation file with the same name in this folder (e.g., Text.tsx)
      try {
        const dir = path.dirname(sf.fileName);
        const candidates = [`${nameToFind}.tsx`, `${nameToFind}.ts`, `${nameToFind}.jsx`, `${nameToFind}.js`];
        for (const c of candidates) {
          const p = path.join(dir, c);
          const targetSF2 = program.getSourceFile(p);
          if (!targetSF2) continue;
          const moduleSymbol2 = checker.getSymbolAtLocation(targetSF2);
          if (!moduleSymbol2) continue;
          const exportsOfModule2 = checker.getExportsOfModule(moduleSymbol2);
          const sym2 = exportsOfModule2.find((s) => s.getName() === nameToFind);
          if (sym2) return getPropsTypeForSymbol(checker, sym2, p);
        }
      } catch (e) {
        // ignore
      }
    } catch (e) {
      // ignore resolution errors
    }
  }

  // If the declaration is a variable with an arrow/function initializer, inspect its parameters directly
  if (decl.kind === ts.SyntaxKind.VariableDeclaration) {
    const init = decl.initializer;
    // handle direct function/arrow
    if (init && (init.kind === ts.SyntaxKind.ArrowFunction || init.kind === ts.SyntaxKind.FunctionExpression)) {
      const params = init.parameters || [];
      if (params.length > 0) {
        const firstParam = params[0];
        if (firstParam.type) {
          try {
            return checker.getTypeFromTypeNode(firstParam.type);
          } catch (e) {
            // fall through to other heuristics
          }
        }
      }
    }

    // handle forwardRef/memo and HOC patterns: variable initializer is a CallExpression
    if (init && ts.isCallExpression(init)) {
      const expr = init.expression;
      // common patterns: React.forwardRef(Component), memo(Component)
      if (ts.isIdentifier(expr) || ts.isPropertyAccessExpression(expr)) {
        const arg0 = init.arguments && init.arguments[0];
        if (arg0 && (ts.isFunctionExpression(arg0) || ts.isArrowFunction(arg0))) {
          const params = arg0.parameters || [];
          if (params.length > 0) {
            const firstParam = params[0];
            if (firstParam.type) {
              try {
                return checker.getTypeFromTypeNode(firstParam.type);
              } catch (e) {}
            }
          }
        }

        // if arg0 is an identifier, try to resolve its symbol
        if (arg0 && ts.isIdentifier(arg0)) {
          try {
            const s = checker.getSymbolAtLocation(arg0);
            if (s)
              return getPropsTypeForSymbol(
                checker,
                s,
                s.valueDeclaration && s.valueDeclaration.getSourceFile && s.valueDeclaration.getSourceFile().fileName,
              );
          } catch (e) {}
        }
      }
    }
  }

  // If it's a function or has call signatures, use the first parameter type
  const valueType = checker.getTypeOfSymbolAtLocation(symbol, decl);
  const callSigs = valueType.getCallSignatures ? valueType.getCallSignatures() : [];
  if (callSigs && callSigs.length) {
    const sig = callSigs[0];
    const params = sig.getParameters();
    if (params.length > 0) {
      try {
        const first = params[0];
        const pt = checker.getTypeOfSymbolAtLocation(
          first,
          first.valueDeclaration || (first.declarations && first.declarations[0]),
        );
        return pt;
      } catch (e) {
        // fallback
      }
    }
  }

  // If it's a class, check constructor
  if (decl.kind === ts.SyntaxKind.ClassDeclaration) {
    const classType = checker.getTypeAtLocation(decl);
    const constructs = classType.getConstructSignatures();
    if (constructs && constructs.length) {
      const sig = constructs[0];
      const params = sig.getParameters();
      if (params.length > 0) {
        try {
          const pt = checker.getTypeOfSymbolAtLocation(
            params[0],
            params[0].valueDeclaration || (params[0].declarations && params[0].declarations[0]),
          );
          return pt;
        } catch (e) {}
      }
    }
  }

  // Attempt to use alias type arguments (React.FC<P>)
  if (valueType.aliasTypeArguments && valueType.aliasTypeArguments.length) {
    return valueType.aliasTypeArguments[0];
  }
  if (valueType.typeArguments && valueType.typeArguments.length) {
    return valueType.typeArguments[0];
  }

  // if the valueType itself is object with a single property named 'props', use that
  const propsProp = valueType.getProperty && valueType.getProperty('props');
  if (propsProp) {
    try {
      return checker.getTypeOfSymbolAtLocation(
        propsProp,
        propsProp.valueDeclaration || (propsProp.declarations && propsProp.declarations[0]),
      );
    } catch (e) {}
  }

  // As a last resort, try to find a type alias/interface named `${Name}Props` or `Props` in workspace (prefer same dir)
  try {
    const name = symbol.getName();
    const dirPref = decl && decl.getSourceFile && path.dirname(decl.getSourceFile().fileName);
    const byName = findTypeAliasByName(program, checker, `${name}Props`, dirPref);
    if (byName) return byName;
    // generic 'Props' in same dir
    const byProps = findTypeAliasByName(program, checker, 'Props', dirPref);
    if (byProps) return byProps;
  } catch (e) {}

  return null;
}

function main() {
  log('Starting analysis of', INDEX);

  // Step 1: Parse index.ts to get all value exports
  const allExports = parseValueExportsFromIndex(INDEX);
  log('Found', allExports.length, 'value exports in index.ts');

  // Step 2: Load metadata to enrich context
  const metadata = loadMetadata();
  log('Loaded metadata for', metadata.size, 'items');

  // Step 3: Create TypeScript program for type analysis
  const program = createProgram();
  const checker = program.getTypeChecker();
  const sf = program.getSourceFile(INDEX);
  if (!sf) {
    console.error('Could not load', INDEX);
    process.exit(1);
  }

  ensureOutDir();

  // Step 4: Build a map of export name -> symbol for type extraction
  const symbolMap = new Map();
  const moduleSymbol = checker.getSymbolAtLocation(sf);
  if (moduleSymbol) {
    const exports = checker.getExportsOfModule(moduleSymbol);
    for (const sym of exports) {
      symbolMap.set(sym.getName(), sym);
    }
  }

  log('Processing', allExports.length, 'exports...');

  let processed = 0;
  let skipped = 0;

  for (const name of allExports) {
    const symbol = symbolMap.get(name);
    if (!symbol) {
      log('WARNING: Could not find symbol for export:', name);
      skipped++;
      continue;
    }

    // Get the original declaration location
    let from = INDEX;
    try {
      if (symbol.flags & ts.SymbolFlags.Alias) {
        const aliased = checker.getAliasedSymbol(symbol);
        if (aliased && aliased.declarations && aliased.declarations[0]) {
          const decl = aliased.declarations[0];
          const declSf = decl.getSourceFile && decl.getSourceFile();
          if (declSf) from = declSf.fileName;
        }
      } else if (symbol.declarations && symbol.declarations[0]) {
        const decl = symbol.declarations[0];
        const declSf = decl.getSourceFile && decl.getSourceFile();
        if (declSf) from = declSf.fileName;
      }
    } catch (e) {
      // Keep default 'from' value
    }
    try {
      // Skip type-only symbols (type/interface/enum)
      const decl = symbol.declarations && symbol.declarations[0];
      if (!decl) {
        skipped++;
        continue;
      }
      if (
        decl.kind === ts.SyntaxKind.TypeAliasDeclaration ||
        decl.kind === ts.SyntaxKind.InterfaceDeclaration ||
        decl.kind === ts.SyntaxKind.EnumDeclaration
      ) {
        skipped++;
        continue;
      }

      // Skip simple constants
      if (isSimpleConstant(decl)) {
        skipped++;
        continue;
      }

      // Determine kind
      let kind = 'value';
      if (decl.kind === ts.SyntaxKind.FunctionDeclaration) kind = 'function';
      else if (decl.kind === ts.SyntaxKind.ClassDeclaration) kind = 'class';
      else if (decl.kind === ts.SyntaxKind.VariableDeclaration) kind = 'variable';

      let propsType = getPropsTypeForSymbol(checker, symbol, from);

      // Special-case: directly read `Props` from `src/core/Text/Text.types.tsx` for the `Text` component
      try {
        if (name === 'Text' && (!propsType || serializeType(checker, propsType) === 'any')) {
          const candidates = [
            path.join(ROOT, 'src', 'core', 'Text', 'Text.types.tsx'),
            path.join(ROOT, 'src', 'core', 'Text', 'Text.types.ts'),
            path.join(ROOT, 'src', 'core', 'Text', 'Text.types.jsx'),
            path.join(ROOT, 'src', 'core', 'Text', 'Text.types.js'),
          ];
          for (const p of candidates) {
            const sfTypes = program.getSourceFile(p);
            if (!sfTypes) continue;
            for (const stmt of sfTypes.statements) {
              if (ts.isTypeAliasDeclaration(stmt) && stmt.name && stmt.name.text === 'Props') {
                try {
                  const t = checker.getTypeFromTypeNode(stmt.type);
                  if (t) {
                    propsType = t;
                    break;
                  }
                } catch {
                  // Ignore errors
                }
              }
            }
            if (propsType) break;
          }
        }
      } catch {
        // Ignore Text special-case errors
      }

      // If we couldn't infer props or it resolved to `any`, try to find an exported props type in the same module
      try {
        const serialized = propsType ? serializeType(checker, propsType) : null;
        if ((!propsType || serialized === 'any' || serialized === 'unknown') && from) {
          const targetSF = program.getSourceFile(from);
          if (targetSF) {
            const targetModuleSymbol = checker.getSymbolAtLocation(targetSF);
            if (targetModuleSymbol) {
              const exportsOfModule = checker.getExportsOfModule(targetModuleSymbol);
              const candidateNames = [`${name}Props`, 'Props', `${name}Props`];
              for (const cn of candidateNames) {
                const tsym = exportsOfModule.find((s) => s.getName() === cn);
                if (tsym) {
                  try {
                    let ttype = null;
                    try {
                      // resolve re-exports/aliases
                      if (tsym.flags & ts.SymbolFlags.Alias) {
                        try {
                          const aliased = checker.getAliasedSymbol(tsym);
                          if (aliased) tsym = aliased;
                        } catch (e) {}
                      }

                      const decl0 = tsym.declarations && tsym.declarations[0];
                      // If it's a type alias with an explicit type node, use that to get a concrete type
                      if (
                        decl0 &&
                        (decl0.kind === ts.SyntaxKind.TypeAliasDeclaration ||
                          decl0.kind === ts.SyntaxKind.InterfaceDeclaration)
                      ) {
                        try {
                          if (decl0.kind === ts.SyntaxKind.TypeAliasDeclaration && decl0.type) {
                            ttype = checker.getTypeFromTypeNode(decl0.type);
                          } else {
                            ttype = checker.getTypeAtLocation(decl0);
                          }
                        } catch (e) {
                          ttype = null;
                        }
                      }

                      // fallback to getDeclaredTypeOfSymbol or getTypeOfSymbolAtLocation
                      if (!ttype) {
                        try {
                          if (tsym.flags & ts.SymbolFlags.TypeAlias) {
                            ttype = checker.getDeclaredTypeOfSymbol(tsym);
                          } else {
                            ttype = checker.getTypeOfSymbolAtLocation(tsym, tsym.valueDeclaration || decl0);
                          }
                        } catch (e) {
                          ttype = null;
                        }
                      }
                    } catch {
                      ttype = null;
                    }
                    if (ttype) {
                      propsType = ttype;
                      break;
                    }
                  } catch {
                    // Ignore type resolution errors
                  }
                }
              }
            }
          }
        }
      } catch (e) {}

      const props = propsType ? serializeType(checker, propsType) : null;

      // Build expanded props as a map of propName -> { type: string, optional: boolean }
      let expandedProps = null;
      // collect type names referenced via import("...") so we can ensure they appear in referencedTypes
      const importedTypeNames = new Set();
      try {
        if (propsType) {
          const propsObj = {};
          const propsSyms = propsType.getProperties ? propsType.getProperties() : [];
          const importRegex = /import\(["'][^"']+["']\)\.([A-Za-z0-9_$]+)/g;
          for (const ps of propsSyms) {
            try {
              const decl0 = ps.valueDeclaration || (ps.declarations && ps.declarations[0]);
              const ptype = checker.getTypeOfSymbolAtLocation(ps, decl0 || decl);
              let ptypeStr = serializeType(checker, ptype);
              // detect and collect imported type names (import("...").Name)
              let m;
              while ((m = importRegex.exec(ptypeStr))) {
                importedTypeNames.add(m[1]);
              }
              // shorten import("...").Name -> Name for readability
              const ptypeStrShort = ptypeStr.replace(importRegex, '$1');
              const optional = decl0 && !!decl0.questionToken;
              propsObj[ps.getName()] = { type: ptypeStrShort, optional };
            } catch (e) {
              propsObj[ps.getName()] = { type: 'unknown', optional: false };
            }
          }
          expandedProps = propsObj;
        }
      } catch (e) {
        expandedProps = null;
      }

      const referenced = propsType ? collectReferencedTypes(checker, propsType) : {};

      // Ensure any types referenced via import("...").Name in expandedProps are present in referencedTypes
      try {
        const dirPref = decl && decl.getSourceFile && decl.getSourceFile().fileName;
        for (const tn of importedTypeNames) {
          if (!referenced[tn]) {
            const snippet = findTypeDeclarationSnippet(program, checker, tn, dirPref);
            if (snippet) referenced[tn] = snippet;
            else referenced[tn] = { source: 'unknown', snippet: tn };
          }
        }
      } catch (e) {}

      // Get metadata if available
      const meta = metadata.get(name);

      // Build output with metadata enrichment
      const out = {
        name,
        from: path.relative(ROOT, from),
        kind,
        props: props,
        referencedTypes: referenced,
        expandedProps: expandedProps,
        // Include metadata for MCP context
        ...(meta && {
          metadata: {
            kind: meta.kind,
            category: meta.category,
            summary: meta.summary,
            description: meta.description,
            tags: meta.tags,
            keywords: meta.keywords,
            relatedComponents: meta.relatedComponents,
          },
        }),
      };

      fs.writeFileSync(path.join(OUT_DIR, `${name}.json`), JSON.stringify(out, null, 2), 'utf8');
      processed++;
    } catch (error) {
      console.error('Error processing', name, ':', error.message);
      skipped++;
    }
  }

  log('✅ Processing complete!');
  log('  - Processed:', processed);
  log('  - Skipped:', skipped);
  log('  - Output directory:', OUT_DIR);
}

if (require.main === module) main();

module.exports = { main };
