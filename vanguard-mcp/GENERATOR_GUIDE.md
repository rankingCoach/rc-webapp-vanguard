# Component Context Generator Guide

## Overview

The component context generator (`scripts/generate-component-context.mjs`) pre-generates structured metadata for all Vanguard components from `src/core/`. This metadata enables fast, rich component discovery for the MCP server and other tools.

## What It Generates

### `data/components.index.json` - Master Catalog
A searchable index of all components with:
- Component ID (normalized name: "Button" → "button")
- Display name and component path
- Story count and tags
- Props extraction status

```json
{
  "version": "1.0.0",
  "generatedAt": "2026-02-10T09:38:48.326Z",
  "totalComponents": 53,
  "components": [
    {
      "id": "button",
      "name": "Button",
      "displayName": "Button",
      "componentPath": "src/core/Button/Button.tsx",
      "storyCount": 11,
      "hasProps": false,
      "tags": ["dev", "test", "autodocs", "play-fn"]
    }
  ]
}
```

### `data/props/{componentId}.json` - Per-Component Metadata
Detailed metadata for each component:
- Props list with TypeScript types, descriptions, and requirements
- Raw props interface text
- **All dependent types** (enums, interfaces, type aliases used in props)
- All stories with IDs and file paths
- Tags and generation timestamp

```json
{
  "componentId": "icon",
  "componentName": "Icon",
  "displayName": "Icon",
  "componentPath": "src/core/Icon/Icon.tsx",
  "props": [
    {
      "name": "children",
      "type": "IconNames | null",
      "required": true,
      "optional": false
    },
    {
      "name": "type",
      "type": "IconSize",
      "required": false,
      "optional": true
    }
  ],
  "propsRaw": "export interface IconProps { ... }",
  "dependentTypes": {
    "IconNames": {
      "kind": "enum",
      "text": "export enum IconNames {\n  hamburgerMenu = 'hamburger-menu',\n  search = 'search',\n  ... (130+ icon names)\n}"
    },
    "IconSize": {
      "kind": "enum",
      "text": "export enum IconSize {\n  small = 'small',\n  large = 'large',\n}"
    }
  },
  "stories": [
    {
      "id": "icon-icon--icons-default",
      "name": "Icons Default",
      "storyFilePath": "./src/core/Icon/_Icon.stories.tsx",
      "tags": ["dev", "test", "autodocs"]
    }
  ],
  "storyCount": 6,
  "generatedAt": "2026-02-10T09:38:48.314Z",
  "tags": ["dev", "test", "autodocs"]
}
```

## How to Use

### Basic Usage

```bash
cd vanguard-mcp
npm run gen:mcp-context
```

### Workflow

1. **Build Storybook** (in repo root):
   ```bash
   npm run storybook:build
   # or
   npm run build:storybook
   ```

2. **Generate Component Context** (in vanguard-mcp):
   ```bash
   npm run gen:mcp-context
   ```

3. **Verify Output**:
   ```bash
   # Check index file
   ls -lh data/components.index.json
   
   # Check props files (one per component)
   ls data/props/ | wc -l
   
   # Inspect a specific component
   cat data/props/button.json | jq .
   ```

### Environment Variables (Optional)

```bash
# Custom Storybook index path
STORYBOOK_INDEX=../storybook-static/index.json npm run gen:mcp-context

# Custom output directory
OUT_DIR=./data npm run gen:mcp-context

# Custom TypeScript config
TSCONFIG=../tsconfig.json npm run gen:mcp-context
```

## Features

### ✅ Intelligent Filtering
- Only processes components from `src/core/`
- Automatically excludes `src/common/`, `src/services/`, etc.
- Uses Storybook index as single source of truth

### ✅ TypeScript Props Extraction
- Parses `interface ComponentProps` and `type ComponentProps`
- Extracts prop names, types, required/optional status
- Preserves JSDoc comments as descriptions
- Detects `@deprecated` tags

### ✅ Dependent Types Resolution
- **Automatically extracts all types referenced in props**
- Includes full enum definitions (e.g., IconNames with 130+ values)
- Includes local type aliases and interfaces
- Resolves imported types and tracks their origin
- Makes component usage self-documenting (no need to look up type definitions)

### ✅ Story Metadata Collection
- Groups stories by component from Storybook index
- Preserves story IDs and file paths
- Collects all tags from stories
- Maintains story display names

### ✅ Component Name Mapping
- Extracts component name from Storybook title
- Handles naming conventions: "Button/_Button" → "Button"
- Normalizes component IDs to kebab-case: "Button" → "button"

### ✅ Idempotent Generation
- Safe to re-run multiple times
- Always produces consistent output
- No incremental state or caching between runs
- Overwrites previous output cleanly

### ✅ Error Handling
- Gracefully skips missing component files
- Continues on props parsing failures
- Warns about issues without stopping
- Returns minimal data when props can't be extracted

## Performance

| Metric | Value |
|--------|-------|
| Components processed | 53 |
| Total files generated | 54 (index + 53 props) |
| Total output size | ~324 KB |
| Execution time | ~2-3 seconds |

## Generated Component Summary

As of latest run:
- **Total components**: 53
- **With props extracted**: ~40% (depends on TypeScript interface availability)
- **Total stories**: 591
- **Coverage**: All `src/core/` components in Storybook

Sample components with complete props:
- Icon (19 props)
- Button (union type, limited props extraction)
- Input (65 stories)
- Text (109 stories)

## Troubleshooting

### "Storybook index not found"
```bash
# Build Storybook first
npm run storybook:build
```

### "Component file not found" warnings
Some components in Storybook may not have corresponding `.tsx` files. This is expected for:
- Barrel files (Charts, CustomDrawers, Gallery, StandardModals, Vanguard)
- Internal/example components (_internal)

These will be marked with `hasProps: false` in the index.

### No props extracted for a component
This can happen when:
- Props are imported from another file
- Props use complex type composition
- Interface naming doesn't match `{ComponentName}Props` or `Props`

Check the component file manually or use the raw `propsRaw` field to see the TypeScript definition.

### Props extraction seems incomplete
The generator uses `ts-morph` to parse TypeScript. Some advanced TypeScript constructs may not be fully supported. Use `propsRaw` field to see the complete interface text.

## Integration with MCP Server

The generated metadata can be consumed by:

1. **MCP Server Tools**: Load `data/components.index.json` for fast component discovery
2. **Search Indexes**: Index component names and tags from `components.index.json`
3. **Documentation**: Use per-component JSON files to generate docs
4. **AI Context**: Feed component metadata to LLMs via MCP tools

Example in MCP:
```typescript
import { readFileSync } from 'fs';

const componentIndex = JSON.parse(
  readFileSync('data/components.index.json', 'utf-8')
);

// Use for fast lookup
const button = componentIndex.components.find(c => c.id === 'button');

// Load per-component metadata
const buttonProps = JSON.parse(
  readFileSync('data/props/button.json', 'utf-8')
);
```

## Advanced Usage

### CI/CD Integration

Add to your CI pipeline to keep metadata fresh:

```bash
#!/bin/bash
cd vanguard-mcp
npm install
npm run gen:mcp-context
# Commit generated files
git add data/
git commit -m "chore: regenerate component metadata"
```

### Monitoring Generated Files

```bash
# Watch generated files for changes
npm run gen:mcp-context && git diff data/

# Count components by type
jq '.components | length' data/components.index.json

# Find components without props
jq '.components[] | select(.hasProps==false) | .name' data/components.index.json

# List all story tags
jq '.components[].tags[] | @csv' data/components.index.json | sort -u
```

### Manual Inspection

```bash
# Pretty-print index
jq . data/components.index.json

# Find components with most stories
jq '.components | sort_by(.storyCount) | reverse | .[0:5]' data/components.index.json

# Count total stories across all components
jq '.components | map(.storyCount) | add' data/components.index.json
```

## Implementation Details

### Script: `scripts/generate-component-context.mjs`

**Responsibilities:**
1. Load `storybook-static/index.json` from monorepo root
2. Filter to `src/core/` entries only
3. Group stories by component name
4. Extract props using ts-morph for each component
5. Write `data/props/{componentId}.json` for each component
6. Write master `data/components.index.json`

**Key functions:**
- `extractComponentName()` - Parse title to component name
- `normalizeComponentId()` - Convert to kebab-case ID
- `extractPropsWithTsMorph()` - Parse TypeScript props
- `parseInterface()` / `parseTypeAlias()` - Extract prop details

**Error handling:**
- Missing component files: warn and continue
- Props parsing failures: warn and return empty props
- File write errors: log and continue
- Fatal errors: exit with message

## Future Enhancements

- [ ] Incremental generation (only changed components)
- [ ] Watch mode (auto-regenerate on file changes)
- [ ] Props type resolution (expand union/intersection types)
- [ ] Story code snippet extraction
- [ ] Component dependency graph
- [ ] Full-text search index
- [ ] Export counts and statistics
- [ ] Integration with MCP server loader
