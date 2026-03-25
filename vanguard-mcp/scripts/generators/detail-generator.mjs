import fs from 'node:fs';
import path from 'node:path';

/**
 * Generate and write detail files for all items
 * Detail files contain comprehensive merged data: metadata, props, types, and stories
 * @param {Object} items - Object with components, hooks, helpers arrays
 * @param {string} outputDir - Output directory for detail files
 * @returns {Promise<void>}
 */
export function writeDetailFiles(items, outputDir) {
  const { components, hooks, helpers } = items;

  // Process components
  for (const comp of components) {
    const detail = generateComponentDetail(comp);
    const filename = `component__${comp.componentId}.json`;
    const filePath = path.join(outputDir, filename);

    try {
      fs.writeFileSync(filePath, JSON.stringify(detail, null, 2), 'utf-8');
    } catch (err) {
      console.warn(`  ⚠ Failed to write component detail ${filename}: ${err.message}`);
    }
  }

  // Process hooks
  for (const hook of hooks) {
    const detail = generateHookDetail(hook);
    const filename = `hook__${hook.id}.json`;
    const filePath = path.join(outputDir, filename);

    try {
      fs.writeFileSync(filePath, JSON.stringify(detail, null, 2), 'utf-8');
    } catch (err) {
      console.warn(`  ⚠ Failed to write hook detail ${filename}: ${err.message}`);
    }
  }

  // Process helpers
  for (const helper of helpers) {
    const detail = generateHelperDetail(helper);
    const filename = `helper__${helper.id}.json`;
    const filePath = path.join(outputDir, filename);

    try {
      fs.writeFileSync(filePath, JSON.stringify(detail, null, 2), 'utf-8');
    } catch (err) {
      console.warn(`  ⚠ Failed to write helper detail ${filename}: ${err.message}`);
    }
  }
}

/**
 * Generate comprehensive detail for a component
 * @param {Object} componentData - Component data
 * @returns {Object} Component detail object
 */
function generateComponentDetail(componentData) {
  return {
    id: `component:${componentData.componentId}`,
    kind: 'component',
    name: componentData.componentName,
    displayName: componentData.displayName,
    summary: componentData.summary,
    keywords: componentData.keywords || [],
    tags: componentData.tags || [],
    source: {
      path: componentData.componentPath,
      moduleSpec: componentData.moduleSpec,
    },
    props: {
      fields: componentData.props || [],
      raw: componentData.propsRaw,
      dependentTypes: componentData.dependentTypes,
    },
    stories: (componentData.stories || []).map((story) => ({
      id: story.id,
      name: story.name,
      filePath: story.storyFilePath,
      tags: story.tags || [],
    })),
    category: componentData.category,
    hasStorybook: componentData.hasStorybook,
    storyCount: componentData.storyCount,
    generatedAt: componentData.generatedAt,
  };
}

/**
 * Generate comprehensive detail for a hook
 * @param {Object} hookData - Hook data
 * @returns {Object} Hook detail object
 */
function generateHookDetail(hookData) {
  return {
    id: `hook:${hookData.id}`,
    kind: 'hook',
    name: hookData.name,
    summary: hookData.summary,
    keywords: hookData.keywords || [],
    tags: hookData.tags || [],
    source: {
      path: hookData.filePath,
    },
    signature: hookData.signature,
    dependentTypes: hookData.dependentTypes,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate comprehensive detail for a helper
 * @param {Object} helperData - Helper data
 * @returns {Object} Helper detail object
 */
function generateHelperDetail(helperData) {
  return {
    id: `helper:${helperData.id}`,
    kind: 'helper',
    name: helperData.name,
    summary: helperData.summary,
    keywords: helperData.keywords || [],
    tags: helperData.tags || [],
    source: {
      path: helperData.filePath,
    },
    signature: helperData.signature,
    dependentTypes: helperData.dependentTypes,
    generatedAt: new Date().toISOString(),
  };
}
