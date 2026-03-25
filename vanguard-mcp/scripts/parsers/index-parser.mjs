import fs from 'node:fs';
import path from 'node:path';

import { Project } from 'ts-morph';

/**
 * Parse src/index.ts exports and categorize them into components, hooks, and helpers.
 * Returns {components: [], hooks: [], helpers: [], all: {name -> entry}}
 */
export function parseIndexExports(rootDir, tsConfigPath) {
  const project = new Project({
    tsConfigFilePath: tsConfigPath,
    compilerOptions: { allowJs: true, skipLibCheck: true },
  });
  const indexPath = path.join(rootDir, 'src', 'index.ts');

  if (!fs.existsSync(indexPath)) {
    throw new Error(`src/index.ts not found at ${indexPath}`);
  }

  const sourceFile = project.addSourceFileAtPath(indexPath);

  const components = [];
  const hooks = [];
  const helpers = [];
  const all = {};

  // Look for export declarations: export { X, Y } from './core/X';
  for (const exp of sourceFile.getExportDeclarations()) {
    const moduleSpec = exp.getModuleSpecifierValue();
    const namedExports = exp.getNamedExports();

    // Skip type-only exports (export type { ... })
    const isTypeOnly = exp.isTypeOnly();

    for (const named of namedExports) {
      const name = named.getName();
      const alias = named.getAliasNode()?.getText() || null;

      // Resolve module specifier to file(s)
      let resolved = moduleSpec;
      if (moduleSpec.startsWith('.')) {
        // Make it absolute to src/...
        resolved = path.join('src', moduleSpec.replace(/^\.\/?/, ''));
      }

      // Normalize path separators
      const normalized = resolved.replace(/\\/g, '/');

      const entry = {
        name,
        alias,
        moduleSpec: normalized,
        isTypeOnly: !!isTypeOnly,
      };

      all[name] = entry;

      // Skip type-only exports (we don't treat types as components/hooks/helpers)
      if (isTypeOnly) continue;

      // Additional check: resolve module file and see if the export is a type alias or interface
      try {
        // Resolve possible module paths
        const modulePathBase = moduleSpec.startsWith('.')
          ? path.join(rootDir, 'src', moduleSpec.replace(/^\.\/?/, ''))
          : moduleSpec;
        const candidates = [];
        for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
          candidates.push(modulePathBase + ext);
          candidates.push(path.join(modulePathBase, `index${ext}`));
        }

        const resolvedFile = candidates.find((p) => fs.existsSync(p));
        if (resolvedFile) {
          const sf = project.addSourceFileAtPath(resolvedFile);

          // Direct declarations
          const isTypeDecl = !!(sf.getTypeAlias(name) || sf.getInterface(name));
          const isEnum = !!sf.getEnum(name);
          if (isTypeDecl || isEnum) continue; // skip type aliases, interfaces, and enums (types are handled elsewhere)

          // Check re-exports: if current file re-exports the name from another module, resolve that module and inspect
          const exportDecls = sf.getExportDeclarations();
          let skip = false;
          for (const ed of exportDecls) {
            const edNamedExports = ed.getNamedExports().map((n) => n.getName());
            if (!ed.getModuleSpecifierValue() || !edNamedExports.includes(name)) continue;

            // Resolve the module specifier relative to resolvedFile
            const edModuleSpec = ed.getModuleSpecifierValue();
            const baseDir = path.dirname(resolvedFile);
            const targetBase = edModuleSpec.startsWith('.')
              ? path.resolve(baseDir, edModuleSpec)
              : path.resolve(rootDir, edModuleSpec);
            const targetCandidates = [];
            for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
              targetCandidates.push(targetBase + ext);
              targetCandidates.push(path.join(targetBase, `index${ext}`));
            }
            const targetFile = targetCandidates.find((p) => fs.existsSync(p));
            if (targetFile) {
              const tsf = project.addSourceFileAtPath(targetFile);
              const isTypeDecl2 = !!(tsf.getTypeAlias(name) || tsf.getInterface(name));
              const isEnum2 = !!tsf.getEnum(name);
              if (isTypeDecl2 || isEnum2) {
                skip = true;
                break;
              }

              // Also check if the declaration is in a sibling file with same base name (e.g., './Text' -> './Text/Text.tsx)
              const siblingFile = path.join(
                path.dirname(targetFile),
                `${path.basename(targetFile, path.extname(targetFile))}.tsx`,
              );
              if (fs.existsSync(siblingFile)) {
                const sval = project.addSourceFileAtPath(siblingFile);
                const isTypeDecl3 = !!(sval.getTypeAlias(name) || sval.getInterface(name));
                const isEnum3 = !!sval.getEnum(name);
                if (isTypeDecl3 || isEnum3) {
                  skip = true;
                  break;
                }
              }
            }
          }

          if (skip) continue;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        // ignore resolution errors and continue
      }

      // Categorize based on path
      if (/custom-hooks|\/custom-hooks\//.test(normalized) || /\/hooks\//.test(normalized)) {
        hooks.push(entry);
      } else if (/\/helpers\//.test(normalized)) {
        helpers.push(entry);
      } else if (/\/core\//.test(normalized) || /\/common\//.test(normalized)) {
        // Before treating as a component, check the export is actually a React component
        // and not a service, constant, utility function, or hook living inside core/common.
        const kind = resolveExportKind(name, normalized, rootDir, project);
        if (kind === 'hook') {
          hooks.push(entry);
        } else if (kind === 'helper') {
          helpers.push(entry);
        } else if (kind === 'component') {
          components.push(entry);
        }
        // kind === 'skip' → non-component (service, constant, utility) — silently omit
      } else {
        // fallback: treat as component
        components.push(entry);
      }
    }
  }

  // Deduplicate
  const uniqBy = (arr) => Array.from(new Map(arr.map((x) => [x.name, x])).values());

  return {
    components: uniqBy(components),
    hooks: uniqBy(hooks),
    helpers: uniqBy(helpers),
    all,
  };
}

/**
 * Resolve the true kind of a named export by inspecting its declaration in the source file.
 * Returns 'component' | 'hook' | 'helper' | 'skip'.
 *
 * 'skip'  → service instance/class, plain constant, utility function, or object map — not a component.
 * 'hook'  → starts with `use` and is a function.
 * 'helper'→ plain utility function (not a hook, not a component).
 * 'component' → everything else that could be a React component.
 */
function resolveExportKind(name, normalizedModuleSpec, rootDir, project) {
  // Name-based fast paths that don't need file inspection
  if (/^use[A-Z]/.test(name)) return 'hook';
  if (/Service$/.test(name)) return 'skip';
  if (/^[A-Z_]{2,}$/.test(name)) return 'skip'; // ALL_CAPS constant
  if (/Map$/.test(name) && /^[A-Z]/.test(name)) return 'skip'; // e.g. AvatarIconMap

  // Resolve the file that contains the export
  const modulePathBase = path.join(rootDir, normalizedModuleSpec);
  const candidates = [];
  for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
    candidates.push(modulePathBase + ext);
    candidates.push(path.join(modulePathBase, `index${ext}`));
  }
  // Also try the path directly if it already has an extension
  if (/\.(tsx?|jsx?)$/.test(normalizedModuleSpec)) {
    candidates.unshift(modulePathBase);
  }

  const resolvedFile = candidates.find((p) => fs.existsSync(p));
  if (!resolvedFile) return 'component'; // can't determine, assume component

  try {
    const sf = project.addSourceFileAtPath(resolvedFile);
    const decl = findExportDeclaration(sf, name, resolvedFile, project, rootDir);
    if (!decl) return 'component';

    return classifyDeclaration(decl, name);
  } catch {
    return 'component';
  }
}

/**
 * Find the declaration node for `name` in sourceFile, following one level of barrel re-exports.
 */
function findExportDeclaration(sf, name, resolvedFile, project, rootDir) {
  // Direct declarations in this file
  const fn = sf.getFunction(name);
  if (fn) return fn;
  const varDecl = sf.getVariableDeclaration(name);
  if (varDecl) return varDecl;
  const cls = sf.getClass(name);
  if (cls) return cls;

  // Follow barrel re-exports one level deep
  for (const ed of sf.getExportDeclarations()) {
    const exported = ed.getNamedExports().map((n) => n.getName());
    if (!exported.includes(name)) continue;
    const edSpec = ed.getModuleSpecifierValue();
    if (!edSpec) continue;

    const baseDir = path.dirname(resolvedFile);
    const targetBase = edSpec.startsWith('.') ? path.resolve(baseDir, edSpec) : path.resolve(rootDir, edSpec);
    const targetCandidates = [];
    for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
      targetCandidates.push(targetBase + ext);
      targetCandidates.push(path.join(targetBase, `index${ext}`));
    }
    const targetFile = targetCandidates.find((p) => fs.existsSync(p));
    if (!targetFile) continue;

    try {
      const tsf = project.addSourceFileAtPath(targetFile);
      const fn2 = tsf.getFunction(name);
      if (fn2) return fn2;
      const var2 = tsf.getVariableDeclaration(name);
      if (var2) return var2;
      const cls2 = tsf.getClass(name);
      if (cls2) return cls2;
    } catch {
      // ignore
    }
  }

  return null;
}

/**
 * Classify a ts-morph declaration node into component / hook / helper / skip.
 */
function classifyDeclaration(decl, name) {
  const kindName = decl.getKindName?.() ?? '';

  // Class declarations → service or component
  if (kindName === 'ClassDeclaration') {
    // A class that is a React component would be unusual; treat as skip (service/utility)
    return 'skip';
  }

  // Variable declarations: inspect the initializer
  if (kindName === 'VariableDeclaration') {
    const init = decl.getInitializer?.();
    if (!init) return 'component';

    const initKind = init.getKindName?.() ?? '';
    const initText = init.getText() ?? '';

    // Class expression used as a service singleton: `new SomeClass()`
    if (initKind === 'NewExpression') return 'skip';

    // Object literal (e.g. AvatarIconMap = { ... }) — not a component
    if (initKind === 'ObjectLiteralExpression') return 'skip';

    // Arrow function or regular function expression
    if (initKind === 'ArrowFunction' || initKind === 'FunctionExpression') {
      if (/^use[A-Z]/.test(name)) return 'hook';
      // Check return type via ts-morph type text
      const type = decl.getType?.().getText() ?? '';
      if (isReactComponentType(type, initText)) return 'component';
      return 'helper';
    }

    // Primitive initializers (string, number, boolean literals)
    if (['StringLiteral', 'NumericLiteral', 'TrueLiteral', 'FalseLiteral', 'NoSubstitutionTemplateLiteral'].includes(initKind)) {
      return 'skip';
    }

    // Property access expression (e.g. `LocationMediaItemScope.PHOTO`) → constant
    if (initKind === 'PropertyAccessExpression') return 'skip';

    return 'component';
  }

  // Function declarations
  if (kindName === 'FunctionDeclaration') {
    if (/^use[A-Z]/.test(name)) return 'hook';
    const type = decl.getReturnType?.().getText() ?? '';
    const bodyText = decl.getBodyText?.() ?? '';
    if (isReactComponentType(type, bodyText)) return 'component';
    return 'helper';
  }

  return 'component';
}

/**
 * Heuristic: does this function likely return JSX / ReactElement?
 */
function isReactComponentType(typeText, bodyText) {
  // Return type mentions JSX or React element types
  if (/JSX\.Element|ReactElement|ReactNode|React\.FC|React\.Component/.test(typeText)) return true;
  // Body contains JSX tags
  if (/<[A-Z][A-Za-z]*[\s/>]|<\/[A-Z]|return\s*\(?\s*</.test(bodyText)) return true;
  return false;
}
