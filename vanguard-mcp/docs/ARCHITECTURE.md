# Vanguard MCP Architecture

This document describes the architecture of the Vanguard MCP (Model Context Protocol) server and how component context data is generated and served.

## Overview

The Vanguard MCP provides rich component, hook, and helper information to AI assistants. It integrates multiple data sources:

1. **Component exports** from `src/index.ts`
2. **Metadata files** from `src/exports-meta/*.json`
3. **TypeScript props** extracted via ts-morph
4. **Storybook stories** from component story files
5. **Type definitions** (enums, types, interfaces used by props)

## Data Generation Flow

```
Source Data                 Generation                    Storage                  MCP Tools
┌──────────────────────┐    ┌─────────────────┐         ┌────────────┐           ┌──────────┐
│ src/index.ts         │───▶│                 │         │            │           │  search  │
│ (exports)            │    │ generate-       │         │ catalogue  │──────────▶│ component│
│                      │    │ component-      │         │.json       │           │  tools   │
│ src/exports-meta/    │    │ context.mjs     │         │            │           │          │
│ *.json               │    │                 │         ├────────────┤           └──────────┘
│ (metadata)           │    │ Processes:      │         │ data/items/│
│                      │    │ • Load meta     │         │ *.json     │──────────▶ get-
│ Component files      │    │ • Extract props │         │            │            component
│ (props, types)       │    │ • Build map     │         │ (detail    │            tools
│                      │    │ • Generate      │         │ files)     │
│ Storybook index      │    │   catalogue     │         │            │
│ (stories)            │    │ • Generate      │         ├────────────┤
│                      │    │   details       │         │props/*.json│
└──────────────────────┘    └─────────────────┘         │(legacy)    │
                                                         └────────────┘
```

## Data Structures

### 1. Metadata Files (`src/exports-meta/*.json`)

Simple JSON files containing manual metadata for each export.

**Format:**
```json
{
  "id": "component:button",
  "kind": "component",
  "summary": "Clickable button supporting sizes, variants and accessible labels.",
  "keywords": ["button", "click", "cta", "action"],
  "tags": ["buttons", "forms", "ui"]
}
```

**Naming:** Filename (without `.json`) must match the export name exactly.

### 2. Catalogue (`data/catalogue.json`)

Unified index of all components, hooks, and helpers with metadata and references to detail files.

**Format:**
```json
{
  "version": "1.0.0",
  "generatedAt": "2026-02-11T...",
  "stats": {
    "totalComponents": 221,
    "totalHooks": 3,
    "totalHelpers": 1,
    "totalItems": 225,
    "itemsWithMetadata": 225,
    "coveragePercent": "100.0"
  },
  "items": [
    {
      "id": "component:button",
      "kind": "component",
      "name": "Button",
      "summary": "...",
      "keywords": ["button", "click"],
      "tags": ["ui", "forms"],
      "source": {
        "path": "src/core/Button/Button.tsx",
        "moduleSpec": "src/core/Button"
      },
      "detailsRef": "data/items/component__button.json"
    }
  ]
}
```

### 3. Detail Files (`data/items/{kind}__{id}.json`)

Comprehensive per-item files merging all data sources.

**Component Detail Format:**
```json
{
  "id": "component:button",
  "kind": "component",
  "name": "Button",
  "displayName": "Button",
  "summary": "...",
  "keywords": ["button", "click"],
  "tags": ["ui", "forms"],
  "source": {
    "path": "src/core/Button/Button.tsx",
    "moduleSpec": "src/core/Button"
  },
  "props": {
    "fields": [
      {
        "name": "type",
        "type": "ButtonTypes",
        "required": true,
        "description": "Button type variant"
      }
    ],
    "raw": "export type ButtonProps = ...",
    "dependentTypes": {
      "ButtonTypes": {
        "kind": "enum",
        "text": "export enum ButtonTypes { ... }"
      }
    }
  },
  "stories": [
    {
      "id": "button--primary",
      "name": "Primary",
      "filePath": "./src/core/Button/_Button.stories.tsx",
      "tags": ["dev", "test"]
    }
  ],
  "category": "core",
  "hasStorybook": true,
  "storyCount": 30,
  "generatedAt": "2026-02-11T..."
}
```

**Hook/Helper Detail Format:**
```json
{
  "id": "hook:use-form-config",
  "kind": "hook",
  "name": "useFormConfig",
  "summary": "...",
  "keywords": [],
  "tags": [],
  "source": {
    "path": "src/custom-hooks/useFormConfig.ts"
  },
  "signature": "...",
  "generatedAt": "2026-02-11T..."
}
```

## Generation Process

### Step 1: Load Metadata

```javascript
const { loadAllMetaFiles, buildMetaMap } =
  await import('./loaders/meta-loader.mjs');
const metaMap = buildMetaMap(
  loadAllMetaFiles(path.join(ROOT_DIR, 'src/exports-meta'))
);
```

Loads all metadata files and creates a Map for quick lookup by export name.

### Step 2: Parse Exports

```javascript
const { parseIndexExports } = await import('./parsers/index-parser.mjs');
const indexExports = await parseIndexExports(ROOT_DIR, TSCONFIG_PATH);
```

Parses `src/index.ts` to find all exported components, hooks, and helpers.

### Step 3: Load Storybook Index

Reads `storybook-static/index.json` to get story information for each component.

### Step 4: Extract Props and Signatures

Uses ts-morph to extract:
- Props interfaces/types
- Function signatures
- Dependent types (enums, type aliases, interfaces)

### Step 5: Generate Outputs

Creates three types of output files:

1. **Catalogue** (`data/catalogue.json`)
   - Single unified index
   - Enables fast searching and filtering

2. **Detail Files** (`data/items/{kind}__{id}.json`)
   - Comprehensive per-item data
   - All metadata, props, types, stories

3. **Props Files** (`data/props/{id}.json`)
   - Legacy format for backward compatibility
   - Contains props and dependent types

## MCP Tools

### search_components

Searches catalogue for components by name/ID.

**Uses:** CatalogueLoader.searchByName()

**Response includes:**
- name, summary, keywords, tags
- componentPath, storyCount

### get_component_details

Gets full details for a component.

**Uses:** DetailLoader.loadDetail() → PropsLoader.loadComponentProps()

**Response includes:**
- name, summary, keywords, tags
- props interface, dependent types
- stories list, component path

### get_component_props

Gets parsed props fields and dependent types.

**Uses:** PropsLoader.loadComponentProps()

**Response includes:**
- fields array (name, type, required, description)
- dependent types (enums, types, interfaces)

### get_component_examples

Gets story code examples.

**Uses:** PropsLoader.loadComponentProps() → extractStoryCode()

### search_hooks, get_hook_details

Similar to component tools but for hooks.

### search_helpers, get_helper_details

Similar to component tools but for helpers.

## File Naming Conventions

### Metadata Files
- Must match export name: `Button.json` for `Button` component
- Case-sensitive

### ID Format
- Components: `button`, `action-bar-root`
- Hooks: `use-form-config`
- Helpers: `class-names`
- Generated from CamelCase by converting to kebab-case

### Detail File Naming
- Format: `{kind}__{id}.json`
- Examples:
  - `component__button.json`
  - `hook__use-form-config.json`
  - `helper__class-names.json`

## Adding New Metadata

To add metadata for a new component:

1. Create a file in `src/exports-meta/{ComponentName}.json`
2. Use this format:
   ```json
   {
     "id": "component:component-name",
     "kind": "component",
     "summary": "Brief description of component",
     "keywords": ["keyword1", "keyword2"],
     "tags": ["category", "subcategory"]
   }
   ```
3. Run `npm run gen:mcp-context` to regenerate data
4. Verify with `node vanguard-mcp/scripts/validate-generated-data.mjs`

## Backward Compatibility

The implementation maintains backward compatibility:

- **data/props/*.json** files are still generated
- **data/vanguard.index.json** continues to work
- **data/components.index.json** (legacy) is maintained
- Existing MCP tools continue to function
- New tools can use enriched data from detail files

## Validation

Run validation to check generated data:

```bash
node vanguard-mcp/scripts/validate-generated-data.mjs
```

Checks:
- Catalogue structure and required fields
- Detail files exist and are valid JSON
- No duplicate IDs
- Stats accuracy
- Data consistency

## Performance Considerations

- **Caching:** Loaders cache loaded data in memory
- **File I/O:** Minimized through pre-generation
- **Lookup speed:** Catalogue enables fast component discovery
- **Memory:** Detail files loaded on-demand, not all at once

## Future Enhancements

Possible improvements:
- Generate summaries automatically for missing metadata
- Add keyword-based search/filtering tool
- Suggest related components based on keywords
- Track component usage statistics
- Generate documentation from catalogue
- Add semantic search via embeddings
