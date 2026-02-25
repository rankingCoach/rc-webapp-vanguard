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
      if (/\/core\//.test(normalized) || /\/common\//.test(normalized)) {
        components.push(entry);
      } else if (/custom-hooks|\/custom-hooks\//.test(normalized) || /\/hooks\//.test(normalized)) {
        hooks.push(entry);
      } else if (/\/helpers\//.test(normalized)) {
        helpers.push(entry);
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
