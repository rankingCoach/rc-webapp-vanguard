# Vanguard Component Library

A comprehensive React component library optimized for performance and flexibility.

## 🚀 Quick Setup

### Essential Setup Commands

```bash
# Install the library
npm install vanguard

# Build the library
npm run build-lib
```

## 📦 Installation

### Full Mode
- **Bundle Size**: ~2.5MB
- **Components**: All available (~50+ components)
- **Assets**: All asset categories included
- **Setup**: Zero configuration required
- **Best for**: All use cases - development, prototyping, and production

## 🛠️ CLI Commands

### Configuration Management
```bash
# Show current status and configuration
npx vanguard status

# List all available components and assets
npx vanguard list

# Configure build options (treeshaking, minify, sourcemap)
npx vanguard build

# Force rebuild the library (same as postinstall build)
npx vanguard rebuild
```

## 💻 Usage Examples

### Basic Component Usage
```typescript
import { Button, Icon, Text } from 'vanguard';

function MyComponent() {
  return (
    <div>
      <Text variant="h1">Welcome</Text>
      <Button variant="primary" onClick={() => console.log('clicked')}>
        <Icon name="star" />
        Click me!
      </Button>
    </div>
  );
}
```

### Enhanced Dynamic Import
```typescript
import { useSelectiveDynamicImport } from 'vanguard';

function MyIcon({ iconName }) {
  const { SvgIcon, loading, error, isSelectiveMode, assetEnabled } = useSelectiveDynamicImport(
    `icons/${iconName}.svg`,
    { 
      shouldRequest: true,
      fallbackBehavior: 'placeholder' // 'error' | 'empty' | 'placeholder'
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <img src={SvgIcon} alt={iconName} />;
}
```

### Standard Dynamic Import
```typescript
import { useDynamicImport } from 'vanguard';

function MyIcon({ iconName }) {
  const { SvgIcon, loading, error } = useDynamicImport(`icons/${iconName}.svg`);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <img src={SvgIcon} alt={iconName} />;
}
```

## 🎯 Asset Categories

Available asset types in the library:

| Category | Description | Typical Size |
|----------|-------------|--------------|
| `icons` | UI icons and symbols | ~800KB |
| `logos` | Company and brand logos | ~400KB |
| `flags` | Country and region flags | ~200KB |
| `photos` | Stock photos and images | ~1.2MB |
| `gifs` | Animated GIF files | ~600KB |
| `avatarIcons` | Avatar and profile icons | ~300KB |
| `decorations` | Decorative elements | ~150KB |
| `placeholders` | Placeholder images | ~100KB |

## ⚙️ Build Options

Configure build optimization settings:

- **`treeshaking`**: Remove unused code (recommended: `true`)
- **`minify`**: Compress output files (recommended: `true` for production)
- **`sourcemap`**: Generate source maps for debugging (recommended: `true` for development)

### Custom Build Scripts

Add to your `package.json`:
```json
{
  "scripts": {
    "vanguard:build": "npm run build-lib",
    "vanguard:status": "npx vanguard status",
    "vanguard:rebuild": "npx vanguard rebuild"
  }
}
```

## 📊 Performance Information

| Configuration | Components | Assets | Bundle Size | Load Time | Use Case |
|---------------|------------|--------|-------------|-----------|-----------|
| Full Mode | All (~50) | All | ~2.5MB | ~800ms | All use cases |

## 🚨 Troubleshooting

### Common Issues

**Build fails during installation**:
```bash
# Check dependencies
npm ls vite typescript

# Force rebuild using CLI
npx vanguard rebuild

# Manual build
npm run build-lib

# Check configuration
npx vanguard status
```

**Assets not loading**:
```bash
# Check configuration
npx vanguard status

# Force rebuild using CLI
npx vanguard rebuild

# Rebuild library
npm run build-lib
```

**Build options not applied**:
```bash
# Check build configuration
npx vanguard status

# Reconfigure build options
npx vanguard build

# Verify in build output
npm run build-lib
```

### Debug Mode

Enable verbose logging:
```bash
DEBUG=vanguard:* npm run build-lib
```

## 🔄 Migration Guide

### From Previous Versions

**No breaking changes** - existing code continues to work exactly as before.

**Optional enhancements**:
1. Use `useSelectiveDynamicImport` for enhanced error handling
2. Configure build options for optimization

### Updating Existing Projects

```bash
# Update package
npm update vanguard

# Optional: Configure build options
npx vanguard build
```

## 📋 Important Notes

### Redux Dependencies
It is very important that consuming projects use the correct versions of Redux and Redux Toolkit. Make sure they match the versions in this package.json. Updates should happen at the same time.

### Automatic Build Process
Vanguard uses a smart postinstall build system:
- **Development Environment**: Skips postinstall build (uses `prepare` script)
- **Production Installation**: Builds automatically
- **Missing Dependencies**: Gracefully skips build if dev dependencies unavailable
- **Up-to-date Check**: Skips build if distribution files are current

### Backward Compatibility
- All existing code continues to work without changes
- Original `useDynamicImport` hook remains fully functional
- `useSelectiveDynamicImport` provides enhanced functionality with backward compatibility

## 🤝 Contributing

When adding new components or assets:
1. Ensure proper export in `src/index.ts`
2. Test functionality thoroughly
3. Update documentation as needed

## 🆘 Support

- **Issues**: Report problems with installation or configuration
- **Examples**: Check `src/examples/` for usage patterns
- **CLI Help**: Run `npx vanguard` for command help
- **Status Check**: Run `npx vanguard status` for current configuration

## Testing individual components
vitest run --project storybook src/core/Component/_Component.stories.tsx
