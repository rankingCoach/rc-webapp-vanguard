## MUI Components Showcase

This showcase demonstrates all Vanguard components that utilize Material-UI (MUI) components internally. These components provide enhanced functionality by leveraging MUI's robust UI primitives while maintaining Vanguard's design system and theming.

### Overview

Vanguard integrates MUI components to provide:
- Consistent Material Design patterns
- Accessibility features
- Responsive behavior
- Theme compatibility

### Components Included

The following Vanguard components use MUI:

#### Form Controls
- **FormControl**: Wrapper for form elements with MUI FormControl
- **Input**: Text input using MUI TextField
- **Select**: Dropdown selection with MUI Select
- **Autocomplete**: Advanced autocomplete with MUI Autocomplete
- **SearchableSelect**: Searchable dropdown
- **Slider**: Range slider with MUI Slider

#### Layout & Navigation
- **AppBar**: Application bar with MUI AppBar
- **Toolbar**: Toolbar component with MUI Toolbar
- **Tabs**: Tab navigation (vanguard-native, no MUI)
- **Drawer**: Slide-out panel with MUI Drawer
- **Accordion**: Collapsible content with MUI Accordion

#### Feedback & Display
- **ProgressBar**: Progress indicator with MUI LinearProgress
- **Snackbar**: Toast notifications with MUI Snackbar
- **Popover**: Floating content with MUI Popover
- **PopoverModal**: Modal popover with MUI Popper
- **DropdownMenu**: Dropdown menu with MUI components

#### Date & Time
- **DatePicker**: Date selection with MUI x-date-pickers
- **DateRangePicker**: Date range picker with MUI components

#### Buttons & Controls
- **Button**: Enhanced button with MUI Grow animation
- **ToggleButton**: Toggle button with MUI ToggleButton
- **ToggleButtonGroup**: Group of toggle buttons

#### Utilities
- **Collapse**: Collapsible content with MUI Collapse
- **FlagAdornment**: Input adornment with MUI InputAdornment
- **ListShowMore**: Expandable list with MUI Collapse

### Usage Examples

#### Basic Form Control
```tsx
import { FormControl, Input } from '@vanguard';

<FormControl>
  <Input label="Email" type="email" />
</FormControl>
```

#### Navigation
```tsx
import { AppBar, Toolbar, Tabs } from '@vanguard';

<AppBar>
  <Toolbar>
    <Tabs
      tabs={[
        { label: 'Home', value: 'home' },
        { label: 'About', value: 'about' },
      ]}
      value={activeTab}
      onChange={(_e, value) => setActiveTab(value)}
    />
  </Toolbar>
</AppBar>
```

#### Feedback
```tsx
import { Snackbar, Button } from '@vanguard';

<Snackbar open={true} message="Operation completed" />
<Button onClick={showProgress}>Start</Button>
<ProgressBar value={75} />
```

### Integration Notes

- All components use Vanguard's Emotion cache to prevent MUI style conflicts
- Components follow Vanguard's theming system
- MUI dependencies are bundled appropriately for tree-shaking
- Components maintain compatibility with existing Vanguard props and patterns

### API Compatibility

These components extend MUI components while adding Vanguard-specific features:
- Consistent prop naming
- Additional styling options
- Enhanced accessibility
- Integration with Vanguard's form system

For detailed API documentation of individual components, refer to their respective documentation.