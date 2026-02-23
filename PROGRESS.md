# Storybook Component Audit and Standardization Progress

## Task Overview
This document tracks the progress of auditing and standardizing all components in the Vanguard React component library to ensure they have comprehensive Storybook stories that test all props and follow the established guidelines.

### Objectives

- **Comprehensive Testing**: Ensure every prop of each component is tested in Storybook stories.
- **Structural Compliance**: All stories must follow the mandatory organization rules:
  - Main stories file: `_ComponentName.stories.tsx` with SbDecorator configuration and re-exports.
  - Stories folder structure:
    - `_ComponentName.default.ts`: Shared types, utilities, and constants (must export `Story` type).
    - Individual story files: `StoryName.story.tsx` for each story variant.
  - Proper import/export patterns: Import with underscore alias, export with explicit type and spread.
- **Testing Standards**: All tests must use vitest, follow specific import rules, use React Testing Library queries, and adhere to SCSS spacing/breakpoint rules.
- **Completion Criteria**: A component is marked as DONE only when all props are tested and the structure fully complies with guidelines.

### Guidelines Reference
- Use vitest for all testing (not Jest).
- Import only from `import { userEvent, within, expect, fireEvent } from "storybook/test";`
- Use `await expect(...).toBe(...)` for assertions.
- Use React Testing Library queries (e.g., `getByRole`, `getByText`) instead of direct DOM access.
- Story filenames must start with `_`.
- Use SbDecorator with spread operator for meta exports.
- SCSS must use predefined spacing variables and include-media breakpoints.
- Main story files must import and export stories using the pattern:
  ```typescript
  import { Story } from "./stories/_ComponentName.default";
  import { StoryName as _StoryName } from "./stories/StoryName.story";
  export const StoryName: Story = { ..._StoryName };
  ```

### Components to Audit
List of all components from `src/core/`directories. Status: [ ] Pending, [x] DONE.

#### Core Components (src/core/)
- [x] Accordion
- [x] ActionBar
- [x] ActionButton
- [x] ActionCard
- [x] AIAssistant
- [x] AiGlow
- [x] AIOrb
- [x] Alert
- [x] AnimatedConditional
- [x] AnimatedSwitchConditional
- [x] AppBar
- [x] ArcGauge
- [x] AssetPreloader
- [x] Autocomplete
- [x] AutocompleteWithAnchor
- [x] Avatar
- [x] AvatarCheckbox
- [x] AvatarStack
- [x] Button
- [x] Charts
- [x] CheckBox
- [x] ClipboardText
- [x] Collapse
- [x] ColorPicker
- [x] ComponentContainer
- [x] CreditCard
- [x] Cropper
- [x] CustomDrawers
- [x] CustomModals
- [x] DatePicker
- [x] DateRange
- [x] DateRangeInput
- [x] DateRangePicker
- [x] DateTimePicker
- [x] Divider
- [x] Documents
- [x] DragAndDropFile
- [x] Drawer
- [x] DropdownMenu
- [x] ExportXLS
- [x] FadeCarouselAuto
- [x] FadedCarousel
- [x] FileSelect
- [x] FlagAdornment
- [x] Form
- [x] FormControl
- [x] FrostedGlass
- [x] Gallery
- [x] GallerySummary
- [x] GlobalStateComponent
- [x] GoogleMaps
- [x] Icon
- [x] IconButton
- [x] IllustrationBlob
- [x] ImgLoader
- [x] ImgWithLoader
- [x] InfoBox
- [x] Input
- [x] Label
- [x] LineAlert
- [x] Link
- [x] LinkConditional
- [x] List
- [ ] ListItem
- [ ] ListItems
- [ ] ListLoader
- [ ] Loader
- [ ] LottieAnimationLoader
- [ ] Modal
- [ ] Notification
- [ ] NotificationAction
- [ ] NotificationSource
- [ ] PaymentModal
- [ ] PhoneNumber
- [ ] Popover
- [ ] PopoverModal
- [ ] ProgressBar
- [ ] ProgressCircle
- [ ] QuoteContainer
- [ ] RadioButton
- [ ] RadioButtonGroup
- [ ] Rating
- [ ] RcErrorBoundry
- [ ] RcNavLink
- [ ] Render
- [ ] RichTextEditor
- [ ] SearchableSelect
- [ ] Select
- [ ] Skeleton
- [ ] SlideCarousel
- [ ] Slider
- [ ] SlideTransition
- [ ] SmallLoader
- [ ] Snackbar
- [ ] SnackbarRoot
- [ ] StandardModals
- [ ] StarRating
- [ ] StatusBadge
- [ ] StyledSVG
- [ ] SvgImage
- [ ] Switch
- [ ] Table
- [ ] Tabs
- [ ] TagList
- [ ] Text
- [ ] Textarea
- [ ] TextHighlighted
- [ ] TimePicker
- [ ] ToggleButton
- [ ] ToggleButtonGroup
- [ ] TogglerWithText
- [ ] Toolbar
- [ ] VideoPlayer


### Progress Notes
- Start with components that already have some stories and ensure they comply.
- For each component, first read the component file to understand all props.
- Create or refactor stories to cover all prop combinations.
- Run tests to ensure they pass.
- Update this file by marking as [x] DONE only when fully compliant.

### Instructions for AI Workers
1. Pick a component marked as [ ] Pending.
2. Examine the component's TypeScript interface to list all props.
3. Check existing stories; refactor if needed to match structure.
4. Add missing stories to test all props and edge cases.
5. Ensure all stories use the correct patterns and pass tests.
6. Mark as [x] DONE in this file.
7. Move to the next component.
8. After the job is done print the command to run the test for that component