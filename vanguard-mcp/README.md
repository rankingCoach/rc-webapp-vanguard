# Vanguard MCP

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that exposes the Vanguard design system — its components, hooks, and helpers — as structured, queryable tools for AI assistants (e.g. Claude).

---

## How it works

The system has two distinct phases:

1. **Generation** (build-time) — scripts that read the source library, extract metadata, props, and story examples, and write pre-processed JSON files to disk.
2. **MCP Server** (runtime) — a Node.js process that reads those JSON files and serves them to an AI assistant via the MCP protocol over stdio.

---

## Directory structure

```
vanguard-mcp/
├── scripts/                        # Build-time generators (run once, before the server starts)
│   ├── generate-component-context.mjs   # Main entry point for generation
│   ├── loaders/
│   │   └── meta-loader.mjs              # Reads src/exports-meta/*.json files
│   ├── parsers/
│   │   └── index-parser.mjs             # Parses src/index.ts to classify exports
│   ├── extractors/
│   │   ├── signature-extractor.mjs      # Extracts TS signatures via ts-morph
│   │   └── story-extractor.mjs          # Extracts story source code via regex
│   └── generators/
│       ├── catalogue-generator.mjs      # Writes data/catalogue.json
│       └── detail-generator.mjs         # Writes data/items/{kind}__{id}.json
│
├── src/                            # MCP server runtime (TypeScript)
│   ├── index.ts                    # Server entry point, tool registration
│   ├── types.ts                    # Shared TypeScript interfaces
│   ├── loaders/                    # Read pre-generated JSON files
│   │   ├── catalogue-loader.ts     # Loads data/catalogue.json
│   │   ├── detail-loader.ts        # Loads data/items/*.json on demand
│   │   ├── storybook-loader.ts     # Loads vanguard.index.json (Storybook index)
│   │   ├── props-loader.ts         # Loads data/props/*.json (legacy)
│   │   ├── hook-loader.ts          # Loads data/hooks/*.json
│   │   └── helper-loader.ts        # Loads data/helpers/*.json
│   ├── parsers/
│   │   └── component-parser.ts     # Live prop extraction via ts-morph (fallback)
│   └── tools/                      # MCP tool implementations
│       ├── search-components.ts
│       ├── get-component-details.ts
│       ├── get-component-examples.ts
│       ├── get-related-components.ts
│       ├── search-hooks.ts
│       ├── get-hook-details.ts
│       ├── search-helpers.ts
│       └── get-helper-details.ts
│
└── data/                           # Generated — do not edit by hand
    ├── catalogue.json              # Unified index of all components, hooks, helpers
    ├── items/                      # Per-item detail files
    │   └── {kind}__{id}.json       # e.g. component__button.json
    ├── props/                      # Per-component props (legacy format)
    ├── hooks/                      # Hook signatures
    └── helpers/                    # Helper signatures
```

---

## Phase 1: Generation

Run generation from the repo root (or inside `vanguard-mcp/`):

```bash
npm run gen:mcp-context
# equivalent to: node vanguard-mcp/scripts/generate-component-context.mjs
```

This runs once and produces the `data/` directory. Re-run it when:
- New components, hooks, or helpers are added/removed
- Metadata files in `src/exports-meta/` are updated
- Storybook stories change

### What the generator does

```
src/index.ts            ──► index-parser          Classifies each export as component / hook / helper
src/exports-meta/*.json ──► meta-loader            Loads human-authored metadata per export
storybook-static/       ──► story-extractor        Reads compiled Storybook index + raw story source
src/**/*.tsx            ──► signature-extractor    Extracts TypeScript function signatures via ts-morph
                                     │
                                     ▼
                        catalogue-generator  ──►  data/catalogue.json
                        detail-generator     ──►  data/items/{kind}__{id}.json
                                                  data/props/*.json  (legacy)
                                                  data/hooks/*.json
                                                  data/helpers/*.json
```

#### `index-parser.mjs`
Reads `src/index.ts` and classifies every re-export by name convention:
- Names starting with `use` → hook
- Known utility names → helper
- Everything else → component

#### `meta-loader.mjs`
Reads `src/exports-meta/{ExportName}.json`. Each file contains human-authored metadata:
```json
{
  "summary": "A short one-sentence description.",
  "keywords": ["form", "input", "controlled"],
  "tags": ["form", "ui"],
  "category": "Forms"
}
```
Filenames must match the export name exactly (case-sensitive).

#### `signature-extractor.mjs`
Uses `ts-morph` to open the TypeScript project and extract the function/component signature (parameter names, types, return type) for each export.

#### `story-extractor.mjs`
Reads the compiled Storybook `index.json` to discover story IDs, then reads the raw `.stories.tsx` source files to extract individual story code blocks via regex.

#### `catalogue-generator.mjs`
Merges all of the above into `data/catalogue.json` — a flat list of all items with their metadata, tags, keywords, and summary. This is the index used for fast search and filtering at runtime.

#### `detail-generator.mjs`
Produces one JSON file per item in `data/items/`. Files are named `{kind}__{id}.json` (double underscore) where `kind` is `component`, `hook`, or `helper` and `id` is kebab-case. Example: `data/items/component__button.json`.

A detail file contains everything about an item: metadata, props interface, dependent types, story examples, and signature.

---

## Phase 2: MCP Server

### Starting the server

```bash
# Development (tsx, no compile step needed)
npm start

# Production (compile first)
npm run build
node dist/index.js
```

The server communicates over **stdio** using the MCP protocol. Connect it from your AI client config (e.g. Claude Desktop `claude_desktop_config.json` or a `.mcp.json` in the repo root).

### Startup sequence

1. `StorybookLoader.loadStorybook()` — loads `vanguard.index.json` (or falls back to `components.index.json`) into a `ComponentIndex` map (component name → story paths).
2. `HookLoader.loadAll()` / `HelperLoader.loadAll()` — reads all pre-generated hook and helper JSON files into memory.
3. `ComponentParser.initialize()` — boots a `ts-morph` project pointing at the library source, used as a live fallback if a pre-generated props file is missing.
4. The MCP server begins listening on stdio.

### Loaders (runtime)

| Loader | Data source | Caching |
|---|---|---|
| `StorybookLoader` | `data/vanguard.index.json` | Loaded once at startup |
| `CatalogueLoader` | `data/catalogue.json` | In-memory singleton |
| `DetailLoader` | `data/items/{kind}__{id}.json` | Per-item in-memory cache |
| `PropsLoader` | `data/props/{Component}.json` | Per-component in-memory cache |
| `HookLoader` | `data/hooks/*.json` | All loaded at startup |
| `HelperLoader` | `data/helpers/*.json` | All loaded at startup |

---

## MCP Tools

These are the tools the AI assistant can call.

### `search_components`
Search for components using one of four modes:

| Mode | What it searches |
|---|---|
| `name` | Component name (fuzzy prefix match) |
| `keyword` | Metadata keywords array |
| `semantic` | All text fields (summary, keywords, tags, category) |
| `all` | All of the above, combined with relevance scoring |

**Parameters:**
- `query` (string) — search term
- `searchMode` (optional) — `"name"` | `"keyword"` | `"semantic"` | `"all"` (default: `"all"`)
- `tags` (optional) — filter results to items with any of these tags
- `category` (optional) — filter results to this category
- `limit` (optional) — max number of results (default: 10)

**Returns:** Array of matches with `name`, `summary`, `tags`, `keywords`, `score`.

---

### `get_component_details`
Get everything known about a single component.

**Parameters:**
- `componentName` (string) — exact component name (e.g. `"Button"`)
- `includeRelated` (optional boolean) — whether to include related components

**Returns:** Props interface, dependent types (enums, unions), available story names, metadata (summary, keywords, tags, category), and optionally related components.

---

### `get_component_examples`
Get story source code for a component.

**Parameters:**
- `componentName` (string)
- `storyName` (optional string) — if omitted, returns all stories

**Returns:** Map of story name → raw TSX source code.

---

### `get_related_components`
Find components related to a given one.

**Parameters:**
- `componentName` (string)
- `relationshipType` (optional) — `"tags"` | `"keywords"` | `"category"` | `"all"` (default: `"all"`)
- `limit` (optional) — default: 5

**Returns:** List of related components with a `reason` field explaining the relationship.

---

### `search_hooks`
Search for hooks by name (fuzzy).

**Parameters:** `query` (string)

**Returns:** Matching hook names.

---

### `get_hook_details`
Get the TypeScript signature and dependent types for a hook.

**Parameters:** `name` (string) — hook name (e.g. `"useFormConfig"`)

**Returns:** Signature string and any referenced types.

---

### `search_helpers`
Search for helper utilities by name (fuzzy).

**Parameters:** `query` (string)

---

### `get_helper_details`
Get the TypeScript signature and dependent types for a helper.

**Parameters:** `name` (string)

---

## Metadata files (`src/exports-meta/`)

Each file corresponds to one export and must be named exactly after it:

```
src/exports-meta/Button.json
src/exports-meta/useFormConfig.json
src/exports-meta/classNames.json
```

Schema:
```json
{
  "summary": "One sentence describing what this export does.",
  "keywords": ["list", "of", "searchable", "terms"],
  "tags": ["ui", "form"],
  "category": "Forms"
}
```

Run the coverage check to see which exports are missing metadata:

```bash
npm run check-meta-coverage
```

---

## Validation

After running generation you can validate the output:

```bash
node vanguard-mcp/scripts/validate-generated-data.mjs
```

Reports errors, warnings, and statistics about the generated `data/` directory.
