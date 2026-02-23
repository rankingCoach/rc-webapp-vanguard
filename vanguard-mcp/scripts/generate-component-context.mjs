#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { Project } from 'ts-morph';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const MCP_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(MCP_DIR, 'data');
const PROPS_DIR = path.join(DATA_DIR, 'props');

const STORYBOOK_INDEX_PATH = path.join(ROOT_DIR, 'storybook-static/index.json');
const OUTPUT_INDEX_PATH = path.join(DATA_DIR, 'components.index.json');
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
    fs.mkdirSync(path.join(DATA_DIR, 'hooks'), { recursive: true });
    fs.mkdirSync(path.join(DATA_DIR, 'helpers'), { recursive: true });
    fs.mkdirSync(path.join(DATA_DIR, 'items'), { recursive: true });

    const componentDataList = [];

    // Process components
    for (const [componentId, componentData] of storiesByComponent) {
      // Resolve component file path from moduleSpec
      let compPathCandidates = [];
      const mod = componentData.moduleSpec || '';
      const rootBase = path.join(ROOT_DIR, mod);
      // Try various heuristics
      const candidates = [
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
      const sig = extractSignature(ROOT_DIR, TSCONFIG_PATH, h.moduleSpec, h.name);
      const id = h.name.replace(/([A-Z])/g, (m, p1, offset) =>
        offset > 0 ? '-' + p1.toLowerCase() : p1.toLowerCase(),
      );
      const meta = metaMap.get(h.name);
      const hookData = sig || { name: h.name, filePath: h.moduleSpec };
      hookData.summary = meta?.summary;
      hookData.keywords = meta?.keywords || [];
      hookData.tags = meta?.tags || [];
      const filePath = path.join(DATA_DIR, 'hooks', `${id}.json`);
      try {
        fs.writeFileSync(filePath, JSON.stringify(hookData, null, 2), 'utf-8');
      } catch (err) {
        console.warn(`  ⚠ Failed to write hook file ${filePath}: ${err.message}`);
      }
      hooksList.push({ id, name: h.name, filePath: sig?.filePath || h.moduleSpec, signature: sig?.signature || null });
    }

    // Process helpers
    const helpersList = [];
    for (const hh of indexExports.helpers) {
      const sig = extractSignature(ROOT_DIR, TSCONFIG_PATH, hh.moduleSpec, hh.name);
      const id = hh.name.replace(/([A-Z])/g, (m, p1, offset) =>
        offset > 0 ? '-' + p1.toLowerCase() : p1.toLowerCase(),
      );
      const meta = metaMap.get(hh.name);
      const helperData = sig || { name: hh.name, filePath: hh.moduleSpec };
      helperData.summary = meta?.summary;
      helperData.keywords = meta?.keywords || [];
      helperData.tags = meta?.tags || [];
      const filePath = path.join(DATA_DIR, 'helpers', `${id}.json`);
      try {
        fs.writeFileSync(filePath, JSON.stringify(helperData, null, 2), 'utf-8');
      } catch (err) {
        console.warn(`  ⚠ Failed to write helper file ${filePath}: ${err.message}`);
      }
      helpersList.push({
        id,
        name: hh.name,
        filePath: sig?.filePath || hh.moduleSpec,
        signature: sig?.signature || null,
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
      path.join(DATA_DIR, 'items')
    );

    // Write per-component props files
    writePropsFiles(componentDataList);

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

    // Write legacy components.index.json for backward compatibility
    const componentCount = writeIndexFile(componentDataList);
    console.log(`  ✓ Wrote ${componentCount} props files + index + vanguard.index.json\n`);

    console.log('✅ Generation complete!\n');
    console.log('Output:');
    console.log(`  📄 ${OUTPUT_INDEX_PATH}`);
    console.log(`  📁 ${PROPS_DIR}/*.json (${componentDataList.length} files)\n`);
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
  fs.mkdirSync(PROPS_DIR, { recursive: true });
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
  return name.replace(/([A-Z])/g, (match, p1, offset) => (offset > 0 ? '-' + p1.toLowerCase() : p1.toLowerCase()));
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
 * Extract props using ts-morph
 */
function extractPropsWithTsMorph(componentFilePath, componentName) {
  try {
    if (!fs.existsSync(componentFilePath)) {
      return null;
    }

    const sourceFile = project.addSourceFileAtPath(componentFilePath);

    // Try various props names
    const propsNames = ['Props', `${componentName}Props`];

    for (const propsName of propsNames) {
      // Try interface
      const interfaceDecl = sourceFile.getInterface(propsName);
      if (interfaceDecl) {
        const interfaceData = parseInterface(interfaceDecl);
        // Extract dependent types referenced in props
        const dependentTypes = extractDependentTypes(sourceFile, interfaceDecl);
        return { ...interfaceData, dependentTypes };
      }

      // Try type alias
      const typeAlias = sourceFile.getTypeAlias(propsName);
      if (typeAlias) {
        const typeData = parseTypeAlias(typeAlias);
        // Extract dependent types referenced in this type
        const dependentTypes = extractDependentTypesFromTypeAlias(sourceFile, typeAlias);
        return { ...typeData, dependentTypes };
      }
    }

    return null;
  } catch (error) {
    console.warn(`  ⚠ Error parsing ${componentName}: ${error.message}`);
    return null;
  }
}

/**
 * Extract dependent types referenced in an interface
 */
function extractDependentTypes(sourceFile, interfaceDecl) {
  const dependentTypes = {};
  const collectedTypeNames = new Set();

  try {
    // Get all property types
    const properties = interfaceDecl.getProperties();

    for (const prop of properties) {
      const typeNode = prop.getTypeNode();
      if (!typeNode) continue;

      // Extract type names from the type node text
      const typeText = typeNode.getText();
      const typeNames = extractTypeNamesFromText(typeText);

      for (const typeName of typeNames) {
        collectedTypeNames.add(typeName);
      }
    }

    // Now resolve each type name and get its definition
    for (const typeName of collectedTypeNames) {
      const enumDecl = sourceFile.getEnum(typeName);
      if (enumDecl) {
        dependentTypes[typeName] = {
          kind: 'enum',
          text: enumDecl.getText(),
        };
        continue;
      }

      const typeAlias = sourceFile.getTypeAlias(typeName);
      if (typeAlias) {
        dependentTypes[typeName] = {
          kind: 'type',
          text: typeAlias.getText(),
        };
        continue;
      }

      const interfaceDecl2 = sourceFile.getInterface(typeName);
      if (interfaceDecl2) {
        dependentTypes[typeName] = {
          kind: 'interface',
          text: interfaceDecl2.getText(),
        };
        continue;
      }

      // Try to find in imported modules
      const allImports = sourceFile.getImportDeclarations();
      for (const imp of allImports) {
        const namedImports = imp.getImportClause()?.getNamedImports() || [];
        const importedName = namedImports.find((n) => n.getName() === typeName);
        if (importedName) {
          const moduleSpec = imp.getModuleSpecifier()?.getLiteralValue();

          // Try to resolve relative imports
          if (moduleSpec.startsWith('.') && project) {
            try {
              const importDir = path.dirname(sourceFile.getFilePath());
              const importPath = path.resolve(importDir, moduleSpec);

              // Try with common extensions
              let resolvedFile = null;
              for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
                if (fs.existsSync(importPath + ext)) {
                  resolvedFile = importPath + ext;
                  break;
                }
              }

              // Also try as a directory with index file
              if (!resolvedFile) {
                for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
                  if (fs.existsSync(path.join(importPath, `index${ext}`))) {
                    resolvedFile = path.join(importPath, `index${ext}`);
                    break;
                  }
                }
              }

              if (resolvedFile) {
                const importedSourceFile = project.addSourceFileAtPath(resolvedFile);

                // Try to find the type in the imported file
                const importedEnum = importedSourceFile.getEnum(typeName);
                if (importedEnum) {
                  dependentTypes[typeName] = {
                    kind: 'enum',
                    text: importedEnum.getText(),
                  };
                  break;
                }

                const importedType = importedSourceFile.getTypeAlias(typeName);
                if (importedType) {
                  dependentTypes[typeName] = {
                    kind: 'type',
                    text: importedType.getText(),
                  };
                  break;
                }

                const importedInterface = importedSourceFile.getInterface(typeName);
                if (importedInterface) {
                  dependentTypes[typeName] = {
                    kind: 'interface',
                    text: importedInterface.getText(),
                  };
                  break;
                }
              }
            } catch (err) {
              // Silently fail and fall through to import reference
            }
          }

          // Fallback: store as import reference
          dependentTypes[typeName] = {
            kind: 'import',
            from: moduleSpec,
          };
          break;
        }
      }
    }
  } catch (error) {
    console.warn(`  ⚠ Error extracting dependent types: ${error.message}`);
  }

  return Object.keys(dependentTypes).length > 0 ? dependentTypes : undefined;
}

/**
 * Extract dependent types from a type alias
 */
function extractDependentTypesFromTypeAlias(sourceFile, typeAlias) {
  const dependentTypes = {};
  const collectedTypeNames = new Set();

  try {
    const typeNode = typeAlias.getTypeNode();
    if (!typeNode) return undefined;

    const typeText = typeNode.getText();
    const typeNames = extractTypeNamesFromText(typeText);

    for (const typeName of typeNames) {
      collectedTypeNames.add(typeName);
    }

    // Resolve type names
    for (const typeName of collectedTypeNames) {
      const enumDecl = sourceFile.getEnum(typeName);
      if (enumDecl) {
        dependentTypes[typeName] = {
          kind: 'enum',
          text: enumDecl.getText(),
        };
        continue;
      }

      const typeAlias2 = sourceFile.getTypeAlias(typeName);
      if (typeAlias2) {
        dependentTypes[typeName] = {
          kind: 'type',
          text: typeAlias2.getText(),
        };
        continue;
      }

      const interfaceDecl = sourceFile.getInterface(typeName);
      if (interfaceDecl) {
        dependentTypes[typeName] = {
          kind: 'interface',
          text: interfaceDecl.getText(),
        };
      }
    }
  } catch (error) {
    console.warn(`  ⚠ Error extracting dependent types from alias: ${error.message}`);
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
 * Parse type alias declaration
 */
function parseTypeAlias(typeAlias) {
  try {
    const typeNode = typeAlias.getTypeNode();
    let raw = typeAlias.getText();

    // Try to extract members if it's an object type
    if (typeNode && typeNode.getMembers) {
      const members = typeNode.getMembers();
      const props = members.map((member) => {
        const name = member.getName();
        const optional = member.hasQuestionToken ? member.hasQuestionToken() : false;
        const type = member.getTypeNode
          ? member.getTypeNode().getText()
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

        return {
          name,
          type,
          required: !optional,
          optional,
          description,
          deprecated: deprecated || undefined,
        };
      });

      return { props, raw };
    }

    // For non-object types, try to resolve if it's a reference to another type
    // e.g., "export type TextProps = Props;" should expand to show Props definition
    if (typeNode) {
      const sourceFile = typeAlias.getSourceFile();
      const typeText = typeNode.getText();

      // Check if it's a simple type reference (e.g., "Props", "ComponentProps")
      const isSimpleReference = /^[A-Z]\w+$/.test(typeText.trim());

      if (isSimpleReference) {
        // Try to find and resolve the referenced type locally first
        const referencedType = sourceFile.getTypeAlias(typeText);
        if (referencedType && referencedType !== typeAlias) {
          // Found the referenced type, use its full definition
          raw = referencedType.getText();
        } else {
          // Check for interface
          const referencedInterface = sourceFile.getInterface(typeText);
          if (referencedInterface) {
            raw = referencedInterface.getText();
          } else {
            // Try to resolve from imports
            const allImports = sourceFile.getImportDeclarations();
            for (const imp of allImports) {
              const namedImports = imp.getImportClause()?.getNamedImports() || [];
              const importedName = namedImports.find((n) => n.getName() === typeText);
              if (importedName) {
                const moduleSpec = imp.getModuleSpecifier()?.getLiteralValue();

                // Try to resolve the import
                if (moduleSpec && project) {
                  try {
                    let resolvedPath = moduleSpec;

                    // Handle path aliases from tsconfig.json
                    if (moduleSpec.startsWith('@vanguard')) {
                      // @vanguard/* -> ./src/core/*
                      resolvedPath = moduleSpec.replace('@vanguard', path.join(ROOT_DIR, 'src/core'));
                    } else if (moduleSpec.startsWith('@common')) {
                      // @common/* -> ./src/common/*
                      resolvedPath = moduleSpec.replace('@common', path.join(ROOT_DIR, 'src/common'));
                    } else if (moduleSpec.startsWith('@helpers')) {
                      // @helpers/* -> ./src/helpers/*
                      resolvedPath = moduleSpec.replace('@helpers', path.join(ROOT_DIR, 'src/helpers'));
                    } else if (moduleSpec.startsWith('@services')) {
                      // @services/* -> ./src/services/*
                      resolvedPath = moduleSpec.replace('@services', path.join(ROOT_DIR, 'src/services'));
                    } else if (moduleSpec.startsWith('@stores')) {
                      // @stores/* -> ./src/stores/*
                      resolvedPath = moduleSpec.replace('@stores', path.join(ROOT_DIR, 'src/stores'));
                    } else if (moduleSpec.startsWith('.')) {
                      // Relative import
                      const importDir = path.dirname(sourceFile.getFilePath());
                      resolvedPath = path.resolve(importDir, moduleSpec);
                    }

                    // Try with common extensions
                    let resolvedFile = null;
                    for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
                      if (fs.existsSync(resolvedPath + ext)) {
                        resolvedFile = resolvedPath + ext;
                        break;
                      }
                    }

                    // Also try as a directory with index file
                    if (!resolvedFile) {
                      for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
                        if (fs.existsSync(path.join(resolvedPath, `index${ext}`))) {
                          resolvedFile = path.join(resolvedPath, `index${ext}`);
                          break;
                        }
                      }
                    }

                    if (resolvedFile) {
                      const importedSourceFile = project.addSourceFileAtPath(resolvedFile);
                      const importedType = importedSourceFile.getTypeAlias(typeText);
                      if (importedType) {
                        raw = importedType.getText();
                        break;
                      }
                      const importedInterface = importedSourceFile.getInterface(typeText);
                      if (importedInterface) {
                        raw = importedInterface.getText();
                        break;
                      }
                    }
                  } catch (err) {
                    // Silently fail, keep original raw
                  }
                }
                break;
              }
            }
          }
        }
      }
    }

    // For non-object types, return empty props with raw type
    return { props: [], raw };
  } catch (error) {
    console.warn(`  ⚠ Error parsing type alias: ${error.message}`);
    return null;
  }
}

/**
 * Write per-component props files
 */
function writePropsFiles(componentDataList) {
  for (const componentData of componentDataList) {
    const filePath = path.join(PROPS_DIR, `${componentData.componentId}.json`);

    // Remove hasProps field before writing
    const payload = { ...componentData };
    delete payload.hasProps;

    try {
      fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (error) {
      console.warn(`  ⚠ Failed to write ${componentData.componentId}.json: ${error.message}`);
    }
  }
}

/**
 * Write master index file
 */
function writeIndexFile(componentDataList) {
  const components = componentDataList
    .map((data) => ({
      id: data.componentId,
      name: data.componentName,
      displayName: data.displayName,
      componentPath: data.componentPath,
      storyCount: data.storyCount,
      hasProps: data.props.length > 0,
      tags: data.tags,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const index = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalComponents: components.length,
    components,
  };

  try {
    fs.writeFileSync(OUTPUT_INDEX_PATH, JSON.stringify(index, null, 2), 'utf-8');
    return components.length;
  } catch (error) {
    throw new Error(`Failed to write index file: ${error.message}`);
  }
}

// Run
main();
