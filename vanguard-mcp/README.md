# Vanguard MCP Server

Model Context Protocol (MCP) server for the Vanguard component library. This server exposes Vanguard's 90+ components through an MCP interface, providing LLMs and other tools with detailed component metadata, props documentation, and usage examples from Storybook.

## Features

- **Component Discovery**: Search and browse all Vanguard components
- **Props Documentation**: Access TypeScript interface definitions for component props
- **Usage Examples**: Get code examples directly from Storybook stories
- **Fast Startup**: Pre-indexed metadata from `storybook.json` (90+ components loaded instantly)
- **Zero Configuration**: Works out of the box with existing Storybook setup

## Quick Start

### Installation

```bash
npm install
```

### Running the Server

```bash
npm start
```

The server will start and listen on stdio. You should see:
```
Starting Vanguard MCP Server...
Loading storybook.json...
Loaded 90 components
Initializing TypeScript parser...
```

### Generating Component Context

To pre-generate component metadata for faster MCP queries:

```bash
npm run gen:mcp-context
```

This generates:
- `data/components.index.json` - Master catalog of all components
- `data/props/*.json` - Per-component metadata with props, stories, and tags

**When to use this:**
- After building Storybook with `npm run storybook:build`
- When component library changes
- To enable richer component discovery for the MCP server

**Optional environment variables:**
```bash
# Storybook index path (default: ../storybook-static/index.json)
STORYBOOK_INDEX=../storybook-static/index.json npm run gen:mcp-context

# Output directory (default: ./data)
OUT_DIR=./data npm run gen:mcp-context

# TypeScript config (default: ../tsconfig.json)
TSCONFIG=../tsconfig.json npm run gen:mcp-context
```

## Tools

### 1. `search_components`

Search for components by name (case-insensitive, partial match).

**Parameters:**
- `query` (string): Search query (e.g., "button", "input")

**Response:**
```json
{
  "results": [
    {
      "name": "Button",
      "storyCount": 30,
      "componentPath": "src/core/Button/Button.tsx"
    }
  ]
}
```

**Example:**
```
Search for "button" returns: Button, ActionButton, IconButton, RadioButton, ToggleButton, ToggleButtonGroup
```

### 2. `get_component_details`

Get detailed information about a specific component including its props interface and all available stories.

**Parameters:**
- `componentName` (string): Name of the component (e.g., "Button", "Input")

**Response:**
```json
{
  "name": "Button",
  "storyCount": 30,
  "stories": [
    {
      "name": "Button Type Primary",
      "id": "button-button--button-type-primary"
    }
  ],
  "propsInterface": "export interface ButtonProps { ... }",
  "componentPath": "src/core/Button/Button.tsx"
}
```

**Example Use Cases:**
- Get all props for a component
- See what stories are available for a component
- Find the component file location

### 3. `get_component_examples`

Get code examples from Storybook stories. Can request all stories or a specific story.

**Parameters:**
- `componentName` (string): Name of the component
- `storyName` (string, optional): Specific story name to retrieve

**Response:**
```json
{
  "componentName": "Button",
  "stories": [
    {
      "name": "Button Type Primary",
      "code": "export const ButtonTypePrimary: Story = { args: { ... } }"
    }
  ]
}
```

**Example Use Cases:**
- Show concrete usage examples to users
- Copy story code for reference
- Understand component behavior through stories
- Generate component implementations

## Architecture

### Project Structure

```
vanguard-mcp/
├── src/
│   ├── index.ts                 # Main MCP server entry point
│   ├── types.ts                 # TypeScript type definitions
│   ├── loaders/
│   │   └── storybook-loader.ts  # Loads and parses storybook.json
│   ├── parsers/
│   │   └── component-parser.ts  # Extracts TypeScript props
│   └── tools/
│       ├── search-components.ts     # Search tool
│       ├── get-component-details.ts # Details tool
│       └── get-component-examples.ts# Examples tool
├── scripts/
│   └── generate-component-context.mjs # Component context generator
├── storybook.json               # Pre-built index (from Storybook)
├── data/                        # Generated component metadata
│   ├── components.index.json    # Master component catalog
│   └── props/                   # Per-component metadata
│       ├── button.json
│       ├── input.json
│       └── ...
└── package.json
```

### Key Classes

#### `StorybookLoader`
- Loads `storybook.json` (pre-built by Storybook)
- Builds component index by grouping stories
- Extracts component names from story titles
- Provides search functionality

**Why it's fast:**
- Single file load (294KB)
- No filesystem scanning needed
- No story file parsing needed (metadata pre-computed)

#### `ComponentParser`
- Extracts TypeScript props interfaces from `.tsx` files
- Uses `ts-morph` for AST parsing (with regex fallback)
- Caches parsed props to avoid re-parsing
- Lazy-loads props on-demand

**Why it's efficient:**
- Only parses component files when props are requested
- Caches results to avoid repeated parsing
- Uses TypeScript AST for accurate extraction

#### Tools
- Simple functions that query the component index
- Handle input validation with Zod
- Format responses as JSON

## Data Sources

### `storybook.json`
**What it contains:** 921 pre-indexed entries with component/story metadata
**Built by:** Storybook (automatic, happens during build)
**Used for:** Component discovery, story listing, import paths

### Component `.tsx` files
**What they contain:** TypeScript prop interfaces
**Accessed when:** `get_component_details` is called
**Why on-demand:** Props are only needed when explicitly requested

### Story `.stories.tsx` files
**What they contain:** Code examples and Storybook configurations
**Accessed when:** `get_component_examples` is called
**Format:** ES6 exports with metadata

### Generated Component Metadata (from `gen:mcp-context`)
**Location:** `data/components.index.json` and `data/props/*.json`
**Built by:** `scripts/generate-component-context.mjs`
**Updated:** Run `npm run gen:mcp-context` after Storybook builds
**Contains:** Pre-extracted component props, stories, tags, and metadata

## Configuration

### Environment

The server expects:
- `storybook.json` in the MCP project root
- TypeScript files at `../src/core/{ComponentName}/{ComponentName}.tsx`
- Story files at `../src/core/{ComponentName}/*.stories.tsx`

### Transport

Currently configured for **stdio** (standard input/output). This is ideal for:
- CLI tools (Claude Code, command-line clients)
- Local development
- Simple integration

To use a different transport, modify `src/index.ts`:
```typescript
// Change from:
const transport = new StdioServerTransport();

// To:
const transport = new HttpServerTransport(...); // or SSE, etc.
```

## Performance Characteristics

| Operation | Time | Notes |
|-----------|------|-------|
| Startup | ~100ms | Load storybook.json + initialize TS parser |
| Search 100 components | ~1ms | In-memory filter |
| Get component details | ~50ms | First call: parse TS file. Cached after. |
| Get component examples | ~5ms | File I/O only, no parsing |

## Extending the Server

### Adding a New Tool

1. Create tool handler in `src/tools/my-tool.ts`:
```typescript
import { z } from 'zod';

export const MyToolInputSchema = z.object({
  param1: z.string().describe('Description'),
});

export function myTool(componentIndex: ComponentIndex, input: z.infer<typeof MyToolInputSchema>) {
  // Implementation
}
```

2. Register in `src/index.ts`:
```typescript
server.tool(
  'my_tool',
  'Tool description',
  MyToolInputSchema.shape,
  (input) => {
    const result = myTool(componentIndex, input);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);
```

### Improving Component Detection

The server automatically extracts component names from Storybook titles. Component categorization can be added by:
1. Extending `ComponentInfo` type with a `category` field
2. Detecting categories in `StorybookLoader.loadStorybook()`
3. Exposing via the tools

Example detection logic:
```typescript
const category =
  name.includes('Input') ? 'form' :
  name.includes('Button') ? 'interaction' :
  name.includes('Icon') ? 'display' :
  'other';
```

## Troubleshooting

### "Cannot find module 'ts-morph'"
- Run `npm install`
- Check that `node_modules/@ts-morph` exists

### "Loaded 0 components"
- Verify `storybook.json` exists in the MCP project root
- Check that storybook.json has `entries` object
- Ensure stories were built: `npm run build:storybook` in parent

### "Component not found"
- Use `search_components` to verify the component exists
- Component names are case-sensitive (e.g., "Button" not "button")
- Component must have at least one story in Storybook

### Props interface is empty/null
- Not all components may have typed props (check manually)
- Props might be defined in parent file or external type
- Use examples tool as fallback for usage documentation

## Development

### Testing Tools Locally

Create a test file:
```typescript
import { StorybookLoader } from './src/loaders/storybook-loader.js';
import { searchComponents } from './src/tools/search-components.js';

const index = StorybookLoader.loadStorybook();
const results = searchComponents(index, { query: 'button' });
console.log(results);
```

Run with: `npx tsx test-file.ts`

### Building for Production

```bash
npm run build  # Compile TypeScript
```

## Integration with Claude Code

1. Add to Claude Code settings:
```json
{
  "mcpServers": {
    "vanguard": {
      "command": "npm",
      "args": ["start"],
      "cwd": "/path/to/vanguard-mcp"
    }
  }
}
```

2. Use in Claude Code:
```
Show me the Button component props
What stories are available for Input?
Search for date picker components
```

## Contributing

To add new capabilities:
1. Extend types in `src/types.ts`
2. Create new tool in `src/tools/`
3. Register tool in `src/index.ts`
4. Test with `npx tsx test-tools.ts`

## License

Same as Vanguard component library
