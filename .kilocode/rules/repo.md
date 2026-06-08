---
description: Repository Information Overview
alwaysApply: true
---

# Vanguard Component Library Information

## Summary
A comprehensive React component library optimized for performance and flexibility. Vanguard provides a collection of reusable UI components, hooks, and utilities for building React applications.

## Structure
- **src/**: Main source code containing components, hooks, and utilities
  - **core/**: Core components of the library
  - **components/**: UI components
  - **custom-hooks/**: Custom React hooks including dynamic import functionality
  - **styles/**: SCSS styles and styling utilities
  - **services/**: Service modules
  - **stores/**: Redux store configurations
- **.storybook/**: Storybook configuration for component documentation
- **scripts/**: Build and utility scripts
- **config/**: Configuration files
- **theming/**: Theming configurations

## Language & Runtime
**Language**: TypeScript
**Version**: TypeScript 7 (using tsgo)
**Build System**: Vite 6.3.5
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- React 19.1.1
- React DOM 19.1.1
- Redux Toolkit 1.7.1
- React Redux 7.2.6
- @emotion/react & @emotion/styled
- date-fns
- classnames

**Development Dependencies**:
- Vite 6.3.5
- Vitest 3.2.3
- Storybook 9.1.2
- ESLint 9.16.0
- Sass
- TypeScript

## Build & Installation
```bash
# Install dependencies
pnpm install

# Build library
pnpm run build-lib

# Development mode
pnpm run dev

# Run Storybook
pnpm run storybook
```

## Testing
**Framework**: Vitest
**Test Location**: Files with `.spec.ts`, `.spec.tsx`, `.test.ts`, `.test.tsx` extensions
**Storybook Tests**: Files with `_*.stories.tsx` pattern
**Configuration**: vitest.config.ts
**Run Command**:
```bash
# Run tests with coverage and UI
pnpm run test:w:c
```

## Storybook
**Configuration**: .storybook/main.ts
**Stories Pattern**: `src/core/**/_*.stories.@(js|jsx|mjs|ts|tsx)`
**Run Command**:
```bash
pnpm run storybook
```

## Package Distribution
**Package Name**: @rankingcoach/vanguard
**Version**: 0.1.48
**Main Entry**: dist/index.es.js
**Registry**: https://npm.rankingcoach.com/
**CLI Tool**: scripts/vanguard-cli.js

## Asset Management
**Dynamic Import System**: Custom hooks for asset loading
- useDynamicImport: Standard dynamic import
- useSelectiveDynamicImport: Enhanced with error handling
**Asset Categories**: icons, logos, flags, photos, gifs, avatarIcons, decorations, placeholders
**CLI Commands**:
```bash
# List all available components and assets
pnpm exec vanguard list

# Show current status and configuration
pnpm exec vanguard status

# Force rebuild the library
pnpm exec vanguard rebuild
```

## Build Configuration
**Build Options**:
- treeshaking: Remove unused code
- minify: Compress output files
- sourcemap: Generate source maps for debugging
**Configuration File**: scripts/vanguard-config.js

## Coding Standards
**Enums Usage**: Always use enum values instead of magic strings for component props that accept enums.
- Use `ButtonTypes.primary` instead of `"primary"`
- Use `IconNames.check` instead of `"check"`
- This ensures type safety and prevents typos in prop values.