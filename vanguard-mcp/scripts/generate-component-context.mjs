#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Project } from 'ts-morph';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const MCP_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(MCP_DIR, 'data');

const STORYBOOK_INDEX_PATH = path.join(ROOT_DIR, 'storybook-static/index.json');
const TSCONFIG_PATH = path.join(ROOT_DIR, 'tsconfig.json');

let project;

/**
 * Main entry point
 */
async function main() {
  console.log('🔧 Component Context Generator for MCP');
  console.log('=====================================\n');

  try {
    // Step 1: Ensure output directories exist
    ensureDirectories();
    console.log('[1/5] ✓ Directories ready\n');

    // Step 2: Load and parse storybook index
    console.log('[2/5] Loading storybook-static/index.json...');
    const storybookData = loadStorybookIndex(STORYBOOK_INDEX_PATH);
    const allEntries = Object.values(storybookData.entries);
    console.log(`  ✓ Loaded ${allEntries.length} entries\n`);

    // Step 3: Parse src/index.ts exports (components, hooks, helpers)
    console.log('[3/5] Parsing src/index.ts exports...');
    const { parseIndexExports } = await import(path.join(MCP_DIR, 'scripts/parsers/index-parser.mjs'));
    const { extractSignature } = await import(path.join(MCP_DIR, 'scripts/extractors/signature-extractor.mjs'));
    const { loadAllMetaFiles, buildMetaMap } = await import(path.join(MCP_DIR, 'scripts/loaders/meta-loader.mjs'));

    const indexExports = await parseIndexExports(ROOT_DIR, TSCONFIG_PATH);
    const metaMap = buildMetaMap(loadAllMetaFiles(path.join(ROOT_DIR, 'src/exports-meta')));

    // Build component map from index exports
    const storiesByComponent = new Map();

    // Seed components from index exports
    for (const comp of indexExports.components) {
      const name = comp.name;
      const id = normalizeComponentId(name);
      storiesByComponent.set(id, {
        id,
        name,
        displayName: name,
        componentPath: undefined,
        stories: [],
        tags: new Set(),
        moduleSpec: comp.moduleSpec,
      });
    }

    // Attach stories from storybook index
    for (const entry of allEntries) {
      if (entry.type !== 'story') continue;
      const componentName = extractComponentName(entry.title);
      const componentId = normalizeComponentId(componentName);
      const target = storiesByComponent.get(componentId);
      if (target) {
        target.stories.push({
          id: entry.id,
          name: entry.name,
          storyFilePath: entry.importPath,
          tags: entry.tags || [],
        });
        (entry.tags || []).forEach((t) => target.tags.add(t));
      }
    }

    // For components without storybook stories, ensure they are included (common components)
    for (const comp of indexExports.components) {
      const id = normalizeComponentId(comp.name);
      if (!storiesByComponent.has(id)) {
        storiesByComponent.set(id, {
          id,
          name: comp.name,
          displayName: comp.name,
          componentPath: undefined,
          stories: [],
          tags: new Set(),
          moduleSpec: comp.moduleSpec,
        });
      }
    }

    console.log(
      `  ✓ Parsed ${storiesByComponent.size} exports (${indexExports.components.length} components, ${indexExports.hooks.length} hooks, ${indexExports.helpers.length} helpers)\n`,
    );

    // Step 4: Initialize ts-morph and extract props/signatures
    console.log('[4/5] Extracting props and signatures with ts-morph...');
    initializeProject();

    // Ensure output directories
    fs.mkdirSync(path.join(DATA_DIR, 'items'), { recursive: true });

    const componentDataList = [];

    // Process components
    for (const [componentId, componentData] of storiesByComponent) {
      // Resolve component file path from moduleSpec
      const mod = componentData.moduleSpec || '';
      const rootBase = path.join(ROOT_DIR, mod);
      // Try various heuristics
      const candidates = [
        // If moduleSpec already ends with an extension, use it directly
        ...((/\.(tsx?|jsx?)$/.test(mod)) ? [rootBase] : []),
        `${rootBase}.tsx`,
        `${rootBase}.ts`,
        path.join(rootBase, `${componentData.name}.tsx`),
        path.join(rootBase, `${componentData.name}.ts`),
        path.join(rootBase, 'index.tsx'),
        path.join(rootBase, 'index.ts'),
      ];

      let fullComponentPath = null;
      for (const c of candidates) {
        if (fs.existsSync(c)) {
          fullComponentPath = c;
          break;
        }
      }

      // If we landed on a barrel index file, walk it to find the sub-file that actually
      // declares this component (so props extraction targets the right file).
      if (fullComponentPath && path.basename(fullComponentPath).startsWith('index.')) {
        const walked = resolveBarrelToSourceFile(fullComponentPath, componentData.name, ROOT_DIR, project);
        if (walked) fullComponentPath = walked;
      }

      let componentPath = undefined;
      if (fullComponentPath) {
        componentPath = path.relative(ROOT_DIR, fullComponentPath);
      } else if (componentData.stories[0]?.storyFilePath) {
        let storyImport = componentData.stories[0].storyFilePath.replace(/^\.\//, '');
        // Normalize possible duplicated src/src
        storyImport = storyImport.replace(/^src\//, 'src/');
        storyImport = storyImport.replace(/^src\/src\//, 'src/');
        componentPath = storyImport;
      }

      let propsInfo = null;
      let hasProps = false;

      if (project && fullComponentPath) {
        propsInfo = extractPropsWithTsMorph(fullComponentPath, componentData.name);
        hasProps = !!propsInfo;
      }

      if (!propsInfo) {
        if (fullComponentPath) {
          console.log(`  ⚠ Could not extract props for ${componentData.name}`);
        } else {
          console.log(`  ⚠ Component source not found for ${componentData.name}`);
        }

        propsInfo = { props: [], raw: null };
      }

      const meta = metaMap.get(componentData.name);
      const payload = {
        componentId,
        componentName: componentData.name,
        displayName: componentData.name,
        componentPath: componentPath || undefined,
        summary: meta?.summary,
        keywords: meta?.keywords || [],
        props: propsInfo.props || [],
        propsRaw: propsInfo.raw || undefined,
        dependentTypes: propsInfo.dependentTypes || undefined,
        stories: componentData.stories,
        storyCount: componentData.stories.length,
        generatedAt: new Date().toISOString(),
        tags: meta?.tags || Array.from(componentData.tags),
        category: componentData.moduleSpec && componentData.moduleSpec.includes('/common/') ? 'common' : 'core',
        hasStorybook: componentData.stories.length > 0,
      };

      componentDataList.push({ ...payload, hasProps });
    }

    // Process hooks
    const hooksList = [];
    for (const h of indexExports.hooks) {
      const sig = extractSignature(ROOT_DIR, TSCONFIG_PATH, h.moduleSpec, h.name, project);
      const id = h.name.replace(/([A-Z])/g, (_m, p1, offset) =>
        offset > 0 ? `-${p1.toLowerCase()}` : p1.toLowerCase(),
      );
      const meta = metaMap.get(h.name);
      hooksList.push({
        id,
        name: h.name,
        filePath: sig?.filePath || h.moduleSpec,
        signature: sig?.signature || null,
        dependentTypes: sig?.dependentTypes || null,
        summary: meta?.summary,
        keywords: meta?.keywords || [],
        tags: meta?.tags || [],
      });
    }

    // Process helpers
    const helpersList = [];
    for (const hh of indexExports.helpers) {
      const sig = extractSignature(ROOT_DIR, TSCONFIG_PATH, hh.moduleSpec, hh.name, project);
      const id = hh.name.replace(/([A-Z])/g, (_m, p1, offset) =>
        offset > 0 ? `-${p1.toLowerCase()}` : p1.toLowerCase(),
      );
      const meta = metaMap.get(hh.name);
      helpersList.push({
        id,
        name: hh.name,
        filePath: sig?.filePath || hh.moduleSpec,
        signature: sig?.signature || null,
        dependentTypes: sig?.dependentTypes || null,
        summary: meta?.summary,
        keywords: meta?.keywords || [],
        tags: meta?.tags || [],
      });
    }

    console.log(
      `  ✓ Processed ${componentDataList.length} components, ${hooksList.length} hooks, ${helpersList.length} helpers\n`,
    );

    // Step 5: Write output files
    console.log('[5/5] Writing output files...');

    // Generate and write catalogue
    const { generateCatalogue } = await import(path.join(MCP_DIR, 'scripts/generators/catalogue-generator.mjs'));
    const catalogue = generateCatalogue(componentDataList, hooksList, helpersList);
    try {
      fs.writeFileSync(path.join(DATA_DIR, 'catalogue.json'), JSON.stringify(catalogue, null, 2), 'utf-8');
    } catch (err) {
      throw new Error(`Failed to write catalogue.json: ${err.message}`);
    }

    // Generate and write detail files
    const { writeDetailFiles } = await import(path.join(MCP_DIR, 'scripts/generators/detail-generator.mjs'));
    await writeDetailFiles(
      {
        components: componentDataList,
        hooks: hooksList,
        helpers: helpersList,
      },
      path.join(DATA_DIR, 'items'),
    );

    // Write vanguard.index.json (new unified format)
    const vanguardIndex = {
      version: '2.0.0',
      generatedAt: new Date().toISOString(),
      stats: {
        totalComponents: componentDataList.length,
        coreComponents: componentDataList.filter((c) => c.category === 'core').length,
        commonComponents: componentDataList.filter((c) => c.category === 'common').length,
        componentsWithStorybook: componentDataList.filter((c) => c.hasStorybook).length,
        totalHooks: hooksList.length,
        totalHelpers: helpersList.length,
      },
      components: componentDataList.map((c) => ({
        id: c.componentId,
        name: c.componentName,
        displayName: c.displayName,
        componentPath: c.componentPath,
        storyCount: c.storyCount,
        hasStorybook: c.hasStorybook,
        category: c.category,
        tags: c.tags,
      })),
      hooks: hooksList,
      helpers: helpersList,
    };

    try {
      fs.writeFileSync(path.join(DATA_DIR, 'vanguard.index.json'), JSON.stringify(vanguardIndex, null, 2), 'utf-8');
    } catch (err) {
      throw new Error(`Failed to write vanguard.index.json: ${err.message}`);
    }

    console.log(`  ✓ Wrote ${componentDataList.length} components to vanguard.index.json\n`);

    console.log('✅ Generation complete!\n');
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    process.exit(1);
  }
}

/**
 * Ensure output directories exist
 */
function ensureDirectories() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Load storybook index JSON
 */
function loadStorybookIndex(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Storybook index not found: ${filePath}\nBuild Storybook first: npm run storybook:build`);
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse storybook index: ${error.message}`);
  }
}

/**
 * Normalize component name to ID
 * "AIOrb" → "ai-orb"
 * "Button" → "button"
 */
function normalizeComponentId(name) {
  return name.replace(/([A-Z])/g, (_match, p1, offset) => (offset > 0 ? `-${p1.toLowerCase()}` : p1.toLowerCase()));
}

/**
 * Extract component name from Storybook title
 * "AIOrb/_AIOrb" → "AIOrb"
 * "Accordion/_Accordion" → "Accordion"
 */
function extractComponentName(title) {
  return title.split('/')[0];
}

/**
 * Given a barrel index file (e.g. src/core/Modal/index.ts), walk its named re-exports
 * to find which sub-file actually declares `componentName`.
 * Returns the absolute path of that sub-file, or null if not found.
 */
function resolveBarrelToSourceFile(barrelPath, componentName, rootDir, tsProject) {
  try {
    if (!tsProject) return null;
    const sf = tsProject.addSourceFileAtPath(barrelPath);

    for (const ed of sf.getExportDeclarations()) {
      const exportedNames = ed.getNamedExports().map((n) => n.getName());
      if (!exportedNames.includes(componentName)) continue;

      const edSpec = ed.getModuleSpecifierValue();
      if (!edSpec) continue;

      const baseDir = path.dirname(barrelPath);
      const targetBase = edSpec.startsWith('.') ? path.resolve(baseDir, edSpec) : path.resolve(rootDir, edSpec);

      const targetCandidates = [];
      // If the spec already has a file extension, try it directly first
      if (/\.(tsx?|jsx?)$/.test(edSpec)) targetCandidates.push(targetBase);
      for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
        targetCandidates.push(targetBase + ext);
        targetCandidates.push(path.join(targetBase, `index${ext}`));
      }

      const targetFile = targetCandidates.find((p) => fs.existsSync(p));
      if (!targetFile) continue;

      // If we hit another barrel, recurse one level
      if (path.basename(targetFile).startsWith('index.')) {
        const deeper = resolveBarrelToSourceFile(targetFile, componentName, rootDir, tsProject);
        if (deeper) return deeper;
      }

      return targetFile;
    }
  } catch {
    // ignore — fall back to barrel path
  }
  return null;
}

/**
 * Initialize ts-morph project
 */
function initializeProject() {
  try {
    project = new Project({
      tsConfigFilePath: TSCONFIG_PATH,
      compilerOptions: {
        allowJs: true,
        skipLibCheck: true,
      },
    });
  } catch (error) {
    console.warn(`  ⚠ Warning: Could not initialize ts-morph, props extraction may be limited: ${error.message}`);
    project = null;
  }
}

/**
 * Resolve a module specifier to an absolute file path, handling path aliases and relative imports.
 * @param {string} moduleSpec - The import specifier (e.g. '@vanguard/Text/Text.types', './types')
 * @param {string} importingFilePath - Absolute path of the file that contains the import
 * @returns {string|null} Resolved absolute file path or null
 */
function resolveModulePath(moduleSpec, importingFilePath) {
  let resolvedBase = null;

  if (moduleSpec.startsWith('@vanguard/')) {
    resolvedBase = path.join(ROOT_DIR, 'src/core', moduleSpec.slice('@vanguard/'.length));
  } else if (moduleSpec.startsWith('@common/')) {
    resolvedBase = path.join(ROOT_DIR, 'src/common', moduleSpec.slice('@common/'.length));
  } else if (moduleSpec.startsWith('@helpers/')) {
    resolvedBase = path.join(ROOT_DIR, 'src/helpers', moduleSpec.slice('@helpers/'.length));
  } else if (moduleSpec.startsWith('@services/')) {
    resolvedBase = path.join(ROOT_DIR, 'src/services', moduleSpec.slice('@services/'.length));
  } else if (moduleSpec.startsWith('@stores/')) {
    resolvedBase = path.join(ROOT_DIR, 'src/stores', moduleSpec.slice('@stores/'.length));
  } else if (moduleSpec.startsWith('.')) {
    resolvedBase = path.resolve(path.dirname(importingFilePath), moduleSpec);
  } else {
    return null; // external package, skip
  }

  for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
    if (fs.existsSync(resolvedBase + ext)) return resolvedBase + ext;
  }
  for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
    const idx = path.join(resolvedBase, `index${ext}`);
    if (fs.existsSync(idx)) return idx;
  }
  return null;
}

/**
 * Find a Props or {ComponentName}Props declaration in a source file or its imported types files.
 * Returns { sourceFile, decl, kind } where kind is 'interface' or 'typeAlias'.
 */
function findPropsDecl(sourceFile, componentName) {
  const propsNames = ['Props', `${componentName}Props`];

  // 1. Look in the source file itself
  for (const propsName of propsNames) {
    const iface = sourceFile.getInterface(propsName);
    if (iface) return { sourceFile, decl: iface, kind: 'interface' };
    const alias = sourceFile.getTypeAlias(propsName);
    if (alias) return { sourceFile, decl: alias, kind: 'typeAlias' };
  }

  // 2. Walk imports to find where Props is imported from
  for (const imp of sourceFile.getImportDeclarations()) {
    const namedImports = imp.getImportClause()?.getNamedImports() || [];
    const importedPropsName = namedImports.find((n) => propsNames.includes(n.getName()))?.getName();
    if (!importedPropsName) continue;

    const moduleSpec = imp.getModuleSpecifier()?.getLiteralValue();
    if (!moduleSpec) continue;

    const resolvedPath = resolveModulePath(moduleSpec, sourceFile.getFilePath());
    if (!resolvedPath) continue;

    try {
      const importedFile = project.addSourceFileAtPath(resolvedPath);
      const iface = importedFile.getInterface(importedPropsName);
      if (iface) return { sourceFile: importedFile, decl: iface, kind: 'interface' };
      const alias = importedFile.getTypeAlias(importedPropsName);
      if (alias) return { sourceFile: importedFile, decl: alias, kind: 'typeAlias' };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {}
  }

  // 3. Fallback: find the component function and read the type name of its first parameter.
  //    Handles cases like `rcInputBaseProps` where the type name doesn't follow *Props convention.
  const propsTypeName = resolvePropsTypeNameFromComponent(sourceFile, componentName);
  if (propsTypeName) {
    // Search in the source file itself first
    const iface = sourceFile.getInterface(propsTypeName);
    if (iface) return { sourceFile, decl: iface, kind: 'interface' };
    const alias = sourceFile.getTypeAlias(propsTypeName);
    if (alias) return { sourceFile, decl: alias, kind: 'typeAlias' };

    // Then walk imports for it
    for (const imp of sourceFile.getImportDeclarations()) {
      const namedImports = imp.getImportClause()?.getNamedImports() || [];
      if (!namedImports.find((n) => n.getName() === propsTypeName)) continue;
      const moduleSpec = imp.getModuleSpecifier()?.getLiteralValue();
      if (!moduleSpec) continue;
      const resolvedPath = resolveModulePath(moduleSpec, sourceFile.getFilePath());
      if (!resolvedPath) continue;
      try {
        const importedFile = project.addSourceFileAtPath(resolvedPath);
        const iface2 = importedFile.getInterface(propsTypeName);
        if (iface2) return { sourceFile: importedFile, decl: iface2, kind: 'interface' };
        const alias2 = importedFile.getTypeAlias(propsTypeName);
        if (alias2) return { sourceFile: importedFile, decl: alias2, kind: 'typeAlias' };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {}
    }
  }

  return null;
}

/**
 * Find the component function/variable declaration for `componentName` in `sourceFile`
 * and return the type name of its first parameter (e.g. "rcInputBaseProps").
 * Returns null if not determinable.
 */
function resolvePropsTypeNameFromComponent(sourceFile, componentName) {
  // Arrow function or variable: const Foo = (props: FooProps) => ...
  const varDecl = sourceFile.getVariableDeclaration(componentName);
  if (varDecl) {
    const init = varDecl.getInitializer?.();
    if (init) {
      const params = init.getParameters?.();
      if (params?.length > 0) {
        const typeNode = params[0].getTypeNode?.();
        if (typeNode) return typeNode.getText().trim();
      }
    }
  }

  // Function declaration: function Foo(props: FooProps) { ... }
  const fnDecl = sourceFile.getFunction(componentName);
  if (fnDecl) {
    const params = fnDecl.getParameters();
    if (params.length > 0) {
      const typeNode = params[0].getTypeNode?.();
      if (typeNode) return typeNode.getText().trim();
    }
  }

  return null;
}

/**
 * Extract props using ts-morph
 */
function extractPropsWithTsMorph(componentFilePath, componentName) {
  try {
    if (!fs.existsSync(componentFilePath)) {
      return null;
    }

    const sourceFile = project.addSourceFileAtPath(componentFilePath);
    const found = findPropsDecl(sourceFile, componentName);

    if (!found) return null;

    const { sourceFile: propsSourceFile, decl, kind } = found;

    if (kind === 'interface') {
      const interfaceData = parseInterface(decl);
      const dependentTypes = extractDependentTypes(propsSourceFile, decl);
      return { ...interfaceData, dependentTypes };
    } else {
      const typeData = parseTypeAlias(decl, propsSourceFile);
      // Collect dependent types from the flattened fields, not the alias text.
      // The alias text (e.g. "BaseProps & SeeMoreProps") only references container types,
      // not the actual prop types like TextTypes, FontWeights, etc.
      //
      // For simple re-export aliases like `export type TextProps = Props`, the fields come
      // from the file that defines Props (e.g. Text.types.tsx). We need to also search that
      // file for dependent types. Find it by following the import of the referenced type.
      const sourceFiles = [propsSourceFile];
      if (sourceFile !== propsSourceFile) sourceFiles.push(sourceFile);
      const typeNode = decl.getTypeNode?.();
      if (typeNode) {
        const typeText = typeNode.getText().trim();
        if (/^[A-Z]\w+$/.test(typeText) && typeText !== decl.getName?.()) {
          // Walk imports of propsSourceFile to find where this referenced type comes from
          for (const imp of propsSourceFile.getImportDeclarations()) {
            const namedImports = imp.getImportClause()?.getNamedImports() || [];
            if (!namedImports.find((n) => n.getName() === typeText)) continue;
            const moduleSpec = imp.getModuleSpecifier()?.getLiteralValue();
            if (!moduleSpec) continue;
            const resolvedPath = resolveModulePath(moduleSpec, propsSourceFile.getFilePath());
            if (resolvedPath) {
              try {
                const importedFile = project.addSourceFileAtPath(resolvedPath);
                if (!sourceFiles.includes(importedFile)) sourceFiles.push(importedFile);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
              } catch (_) {}
            }
          }
        }
      }
      const dependentTypes = collectDependentTypesFromFields(typeData?.props ?? [], sourceFiles);
      return { ...typeData, dependentTypes };
    }
  } catch (error) {
    console.warn(`  ⚠ Error parsing ${componentName}: ${error.message}`);
    return null;
  }
}

/**
 * Resolve a single type name to its definition, searching the given source file and its imports.
 * Returns a dependentTypes entry or null.
 */
function resolveDependentType(typeName, sourceFile) {
  // Check in the current file first
  const enumDecl = sourceFile.getEnum(typeName);
  if (enumDecl) return { kind: 'enum', text: enumDecl.getText() };

  const typeAlias = sourceFile.getTypeAlias(typeName);
  if (typeAlias) return { kind: 'type', text: typeAlias.getText() };

  const iface = sourceFile.getInterface(typeName);
  if (iface) return { kind: 'interface', text: iface.getText() };

  // Walk imports
  for (const imp of sourceFile.getImportDeclarations()) {
    const namedImports = imp.getImportClause()?.getNamedImports() || [];
    if (!namedImports.find((n) => n.getName() === typeName)) continue;

    const moduleSpec = imp.getModuleSpecifier()?.getLiteralValue();
    if (!moduleSpec) continue;

    const resolvedPath = resolveModulePath(moduleSpec, sourceFile.getFilePath());
    if (!resolvedPath) {
      return { kind: 'import', from: moduleSpec };
    }

    try {
      const importedFile = project.addSourceFileAtPath(resolvedPath);
      const result = resolveDependentType(typeName, importedFile);
      if (result) return result;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {}

    return { kind: 'import', from: moduleSpec };
  }

  return null;
}

/**
 * Collect all type names referenced in a set of property nodes and resolve their definitions.
 */
function collectDependentTypes(properties, sourceFile) {
  const dependentTypes = {};
  const typeNames = new Set();

  for (const prop of properties) {
    const typeNode = prop.getTypeNode?.();
    if (!typeNode) continue;
    for (const name of extractTypeNamesFromText(typeNode.getText())) {
      typeNames.add(name);
    }
  }

  for (const typeName of typeNames) {
    const resolved = resolveDependentType(typeName, sourceFile);
    if (resolved) dependentTypes[typeName] = resolved;
  }

  return Object.keys(dependentTypes).length > 0 ? dependentTypes : undefined;
}

/**
 * Extract dependent types referenced in an interface
 */
function extractDependentTypes(sourceFile, interfaceDecl) {
  try {
    return collectDependentTypes(interfaceDecl.getProperties(), sourceFile);
  } catch (error) {
    console.warn(`  ⚠ Error extracting dependent types: ${error.message}`);
    return undefined;
  }
}

/**
 * Collect dependent types from an already-flattened array of field objects.
 * Works from field.type strings rather than ts-morph property nodes.
 * sourceFiles can be a single source file or an array to search in order.
 */
function collectDependentTypesFromFields(fields, sourceFiles) {
  const dependentTypes = {};
  const typeNames = new Set();
  const files = Array.isArray(sourceFiles) ? sourceFiles : [sourceFiles];

  for (const field of fields) {
    if (!field?.type) continue;
    for (const name of extractTypeNamesFromText(field.type)) {
      typeNames.add(name);
    }
  }

  for (const typeName of typeNames) {
    for (const sf of files) {
      const resolved = resolveDependentType(typeName, sf);
      if (resolved) {
        dependentTypes[typeName] = resolved;
        break;
      }
    }
  }

  return Object.keys(dependentTypes).length > 0 ? dependentTypes : undefined;
}

/**
 * Extract type names from TypeScript type text
 * e.g., "IconNames | null" → ["IconNames"]
 * e.g., "IconSize" → ["IconSize"]
 */
function extractTypeNamesFromText(typeText) {
  const typeNames = new Set();

  // Remove literals, keywords, and built-ins
  const builtIns = new Set([
    'string',
    'number',
    'boolean',
    'null',
    'undefined',
    'any',
    'void',
    'object',
    'never',
    'unknown',
    'React',
    'MutableRefObject',
    'HTMLDivElement',
    'CSSProperties',
    'function',
    'true',
    'false',
  ]);

  // Split on common delimiters and operators
  const tokens = typeText.split(/[|&<>()[\]{},\s\n;]+/).filter((token) => token && token.length > 0);

  for (const token of tokens) {
    // Skip if it's a built-in or primitive
    if (builtIns.has(token.toLowerCase())) continue;

    // Skip if it's all lowercase (likely a built-in)
    if (token === token.toLowerCase() && !token.includes('_')) continue;

    // Skip if it looks like a module path
    if (token.includes('/')) continue;

    // Add if it looks like a type name (starts with capital letter or has camelCase)
    if (/^[A-Z]/.test(token) || /[a-z][A-Z]/.test(token)) {
      typeNames.add(token);
    }
  }

  return typeNames;
}

/**
 * Parse interface declaration
 */
function parseInterface(interfaceDecl) {
  try {
    const props = interfaceDecl.getProperties().map((prop) => {
      const name = prop.getName();
      const optional = prop.hasQuestionToken();
      const typeNode = prop.getTypeNode();
      const type = typeNode ? typeNode.getText() : prop.getType().getText();

      // Extract JSDoc
      const jsDocs = prop.getJsDocs();
      const description =
        jsDocs
          .map((d) => d.getComment())
          .filter(Boolean)
          .join('\n') || undefined;

      // Check for @deprecated
      const deprecated = jsDocs.some((d) => d.getTags().some((t) => t.getTagName() === 'deprecated'));

      return {
        name,
        type,
        required: !optional,
        optional,
        description,
        deprecated: deprecated || undefined,
      };
    });

    const raw = interfaceDecl.getText();

    return { props, raw };
  } catch (error) {
    console.warn(`  ⚠ Error parsing interface: ${error.message}`);
    return null;
  }
}

/**
 * Extract props fields from a single type/interface member node.
 */
function memberToField(member) {
  const name = member.getName?.();
  if (!name) return null;
  const optional = member.hasQuestionToken ? member.hasQuestionToken() : false;
  const type = member.getTypeNode
    ? (member.getTypeNode()?.getText() ?? 'unknown')
    : member.getType
      ? member.getType().getText()
      : 'unknown';
  const jsDocs = member.getJsDocs ? member.getJsDocs() : [];
  const description =
    jsDocs
      .map((d) => d.getComment())
      .filter(Boolean)
      .join('\n') || undefined;
  const deprecated = jsDocs.some((d) => d.getTags().some((t) => t.getTagName() === 'deprecated'));
  return { name, type, required: !optional, optional, description, deprecated: deprecated || undefined };
}

/**
 * Resolve a named type reference (e.g. "BaseProps") to its fields, looking in sourceFile and imports.
 * Returns an array of field objects, or null if unresolvable.
 */
function resolveTypeToFields(typeName, sourceFile) {
  // Look for interface in current file
  const iface = sourceFile.getInterface(typeName);
  if (iface) return iface.getProperties().map(memberToField).filter(Boolean);

  // Look for type alias in current file
  const alias = sourceFile.getTypeAlias(typeName);
  if (alias) return flattenTypeAliasToFields(alias, sourceFile);

  // Walk imports
  for (const imp of sourceFile.getImportDeclarations()) {
    const namedImports = imp.getImportClause()?.getNamedImports() || [];
    if (!namedImports.find((n) => n.getName() === typeName)) continue;

    const moduleSpec = imp.getModuleSpecifier()?.getLiteralValue();
    if (!moduleSpec) continue;

    const resolvedPath = resolveModulePath(moduleSpec, sourceFile.getFilePath());
    if (!resolvedPath) continue;

    try {
      const importedFile = project.addSourceFileAtPath(resolvedPath);
      const result = resolveTypeToFields(typeName, importedFile);
      if (result) return result;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {}
  }

  return null;
}

/**
 * Flatten a type alias (including intersection types like A & B) to a flat field list.
 */
function flattenTypeAliasToFields(typeAlias, sourceFile) {
  const typeNode = typeAlias.getTypeNode();
  if (!typeNode) return [];

  // Direct object type: type T = { foo: string }
  if (typeNode.getMembers) {
    return typeNode.getMembers().map(memberToField).filter(Boolean);
  }

  // Intersection (A & B) or union (A | B) — getTypeNodes() works for both
  if (typeNode.getTypeNodes) {
    const allFields = [];
    const seen = new Set();
    for (const constituent of typeNode.getTypeNodes()) {
      let fields = null;

      // Inline object type literal: { foo: string; bar?: number }
      if (constituent.getMembers) {
        fields = constituent.getMembers().map(memberToField).filter(Boolean);
      } else {
        const constituentText = constituent.getText().trim();
        // Strip Omit<X, ...> — just take X for display purposes
        const baseTypeName = constituentText.replace(/^Omit\s*<\s*(\w+)\s*,[\s\S]*>$/, '$1').trim();
        if (/^[A-Z]\w*$/.test(baseTypeName)) {
          fields = resolveTypeToFields(baseTypeName, sourceFile);
        }
      }

      if (fields) {
        for (const f of fields) {
          if (f && !seen.has(f.name)) {
            seen.add(f.name);
            allFields.push(f);
          }
        }
      }
    }
    return allFields;
  }

  return [];
}

/**
 * Parse type alias declaration
 */
function parseTypeAlias(typeAlias, sourceFile) {
  try {
    const typeNode = typeAlias.getTypeNode();
    const raw = typeAlias.getText();
    const sf = sourceFile ?? typeAlias.getSourceFile();

    // Direct object type members
    if (typeNode?.getMembers) {
      const props = typeNode.getMembers().map(memberToField).filter(Boolean);
      return { props, raw };
    }

    // Intersection or union — flatten to fields
    if (typeNode?.getTypeNodes) {
      const props = flattenTypeAliasToFields(typeAlias, sf);
      return { props, raw };
    }

    // Simple reference: type T = SomeOtherType
    if (typeNode) {
      const typeText = typeNode.getText().trim();
      if (/^[A-Z]\w+$/.test(typeText) && typeText !== typeAlias.getName()) {
        const fields = resolveTypeToFields(typeText, sf);
        if (fields && fields.length > 0) {
          return { props: fields, raw };
        }
      }
    }

    return { props: [], raw };
  } catch (error) {
    console.warn(`  ⚠ Error parsing type alias: ${error.message}`);
    return null;
  }
}

// Run
main();
