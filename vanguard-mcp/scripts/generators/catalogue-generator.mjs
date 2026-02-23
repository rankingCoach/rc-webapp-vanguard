/**
 * Generate a unified catalogue of all components, hooks, and helpers
 * with metadata, keywords, and references to detail files
 */

/**
 * Generate catalogue from component, hook, and helper data
 * @param {Object[]} components - Array of component data
 * @param {Object[]} hooks - Array of hook data
 * @param {Object[]} helpers - Array of helper data
 * @returns {Object} Catalogue structure with metadata and statistics
 */
export function generateCatalogue(components, hooks, helpers) {
  const items = [];

  // Add components to catalogue
  for (const comp of components) {
    items.push({
      id: `component:${comp.componentId}`,
      kind: 'component',
      name: comp.componentName,
      summary: comp.summary,
      keywords: comp.keywords || [],
      tags: comp.tags || [],
      source: {
        path: comp.componentPath,
        moduleSpec: comp.moduleSpec,
      },
      detailsRef: `data/items/component__${comp.componentId}.json`,
    });
  }

  // Add hooks to catalogue
  for (const hook of hooks) {
    items.push({
      id: `hook:${hook.id}`,
      kind: 'hook',
      name: hook.name,
      summary: hook.summary,
      keywords: hook.keywords || [],
      tags: hook.tags || [],
      source: {
        path: hook.filePath,
      },
      detailsRef: `data/items/hook__${hook.id}.json`,
    });
  }

  // Add helpers to catalogue
  for (const helper of helpers) {
    items.push({
      id: `helper:${helper.id}`,
      kind: 'helper',
      name: helper.name,
      summary: helper.summary,
      keywords: helper.keywords || [],
      tags: helper.tags || [],
      source: {
        path: helper.filePath,
      },
      detailsRef: `data/items/helper__${helper.id}.json`,
    });
  }

  // Calculate statistics
  const itemsWithMetadata = items.filter(
    (item) => item.summary || (item.keywords && item.keywords.length > 0)
  ).length;

  const stats = {
    totalComponents: components.length,
    totalHooks: hooks.length,
    totalHelpers: helpers.length,
    totalItems: items.length,
    itemsWithMetadata,
    coveragePercent: items.length > 0 ? ((itemsWithMetadata / items.length) * 100).toFixed(2) : 0,
  };

  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    stats,
    items,
  };
}
