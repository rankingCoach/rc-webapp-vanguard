#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { HelperLoader } from './loaders/helper-loader.js';
import { HookLoader } from './loaders/hook-loader.js';
import { StorybookLoader } from './loaders/storybook-loader.js';
import { ComponentParser } from './parsers/component-parser.js';
import { getComponentDetails, GetComponentDetailsInputSchema } from './tools/get-component-details.js';
import { getComponentExamples, GetComponentExamplesInputSchema } from './tools/get-component-examples.js';
import { getHelperDetails, GetHelperDetailsInputSchema } from './tools/get-helper-details.js';
import { getHookDetails, GetHookDetailsInputSchema } from './tools/get-hook-details.js';
import { getRelatedComponents, GetRelatedComponentsInputSchema } from './tools/get-related-components.js';
import { searchComponents, SearchComponentsInputSchema } from './tools/search-components.js';
import { searchHelpers, SearchHelpersInputSchema } from './tools/search-helpers.js';
import { searchHooks, SearchHooksInputSchema } from './tools/search-hooks.js';
import { ComponentIndex } from './types.js';

// Global component index
let componentIndex: ComponentIndex = {};

// Initialize the MCP server
const server = new McpServer({
  name: 'vanguard-mcp',
  version: '1.0.0',
});

/**
 * Register tool: search_components (enhanced with multi-mode search)
 */
server.tool(
  'search_components',
  'Search for components with multiple modes: name (component name), keyword (metadata keywords), semantic (all text fields), or all (combined). Supports filtering by tags and category, with relevance scoring.',
  SearchComponentsInputSchema.shape,
  (input) => {
    const results = searchComponents(componentIndex, {
      query: input.query,
      searchMode: input.searchMode,
      tags: input.tags,
      category: input.category,
      limit: input.limit,
    });
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              results: results.length > 0 ? results : [],
              totalMatches: results.length,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

/**
 * Register tool: get_related_components (new - discover similar components)
 */
server.tool(
  'get_related_components',
  'Discover components related to a reference component based on shared tags, keywords, or category. Helps find similar or alternative components.',
  GetRelatedComponentsInputSchema.shape,
  (input) => {
    const result = getRelatedComponents({
      componentName: input.componentName,
      relationshipType: input.relationshipType,
      limit: input.limit,
    });
    if (!result) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ error: `Component "${input.componentName}" not found` }, null, 2),
          },
        ],
      };
    }
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
);

/**
 * Register tool: get_component_details (enhanced with metadata and related components)
 */
server.tool(
  'get_component_details',
  'Get detailed information about a component including its props interface, available stories, dependent types (enums, type aliases, etc.), metadata (summary, keywords, tags, category), and related components.',
  GetComponentDetailsInputSchema.shape,
  (input) => {
    const details = getComponentDetails(componentIndex, {
      componentName: input.componentName,
      includeRelated: input.includeRelated,
    });
    if (!details) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ error: `Component "${input.componentName}" not found` }, null, 2),
          },
        ],
      };
    }
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(details, null, 2),
        },
      ],
    };
  },
);

/**
 * Register tool: get_component_examples
 */
server.tool(
  'get_component_examples',
  'Get code examples from Storybook stories for a component. Can request all stories or a specific story.',
  GetComponentExamplesInputSchema.shape,
  (input) => {
    const examples = getComponentExamples(componentIndex, {
      componentName: input.componentName,
      storyName: input.storyName,
    });
    if (!examples) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ error: `Component "${input.componentName}" not found` }, null, 2),
          },
        ],
      };
    }
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(examples, null, 2),
        },
      ],
    };
  },
);

/**
 * Register tool: search_hooks
 */
server.tool('search_hooks', 'Search for hooks by name', SearchHooksInputSchema.shape, (input) => {
  const results = searchHooks(input.query);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ results }, null, 2),
      },
    ],
  };
});

/**
 * Register tool: get_hook_details
 */
server.tool(
  'get_hook_details',
  'Get details for a hook (signature, dependent types)',
  GetHookDetailsInputSchema.shape,
  (input) => {
    const details = getHookDetails(input.name);
    if (!details) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ error: `Hook "${input.name}" not found` }, null, 2),
          },
        ],
      };
    }
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(details, null, 2),
        },
      ],
    };
  },
);

/**
 * Register tool: search_helpers
 */
server.tool('search_helpers', 'Search for helpers by name', SearchHelpersInputSchema.shape, (input) => {
  const results = searchHelpers(input.query);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ results }, null, 2),
      },
    ],
  };
});

/**
 * Register tool: get_helper_details
 */
server.tool(
  'get_helper_details',
  'Get details for a helper (signature, dependent types)',
  GetHelperDetailsInputSchema.shape,
  (input) => {
    const details = getHelperDetails(input.name);
    if (!details) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ error: `Helper "${input.name}" not found` }, null, 2),
          },
        ],
      };
    }
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(details, null, 2),
        },
      ],
    };
  },
);

/**
 * Initialize and start the server
 */
async function start(): Promise<void> {
  console.error('Starting Vanguard MCP Server...');

  // Load storybook / vanguard index
  console.error('Loading vanguard index (or fallback to components.index.json)...');
  componentIndex = StorybookLoader.loadStorybook();
  const componentCount = Object.keys(componentIndex).length;
  console.error(`Loaded ${componentCount} components`);

  // Load hooks/helpers (if present)
  const hooks = HookLoader.loadAll();
  const helpers = HelperLoader.loadAll();
  console.error(`Loaded ${hooks.length} hooks and ${helpers.length} helpers`);

  // Initialize TypeScript parser
  console.error('Initializing TypeScript parser...');
  ComponentParser.initialize();

  // Start the server
  console.error('Starting MCP server on stdio...');
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Vanguard MCP Server running');
}

start().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
