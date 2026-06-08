ZENCODER INSTRUCTION SET — FRONTEND STORYBOOK & STYLING

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 .stories.tsx RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ All test assertions MUST use await expect:
await expect(...).toBe(...)

✅ Import ONLY from:
import { userEvent, within, expect, fireEvent } from "storybook/test";

⛔️ DO NOT USE:
import { userEvent, within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";

✅ Use vitest for all test logic (⛔️ NEVER use jest).

✅ Use the play function for test interaction.
⛔️ DO NOT USE scheduleAt.

✅ MANDATORY: Use React Testing Library queries instead of direct DOM access
⛔️ NEVER use document.querySelector, document.querySelectorAll, or canvas.container.querySelector
✅ Always use within(canvasElement) with semantic queries like:
   - getByRole('button'), getAllByRole('button')
   - getByText(), getByLabelText()
   - getByTestId() (only when necessary)

✅ All story filenames MUST start with _.

HOW TO RUN TESTS :
pnpm exec vitest run --project storybook {PATH_TO_STORY}

✅ Story decorators MUST use spread operator:
...SbDecorator({
title: "TITLE",
component: COMPONENT,
extra: {
args: {
testId: "action",
},
},
}),

✅ Use classNames when assigning multiple classes.

✅ MANDATORY: Use args in stories whenever possible instead of render
⛔️ NEVER use render unless the story cannot be expressed with args alone

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SCSS RULES — SPACING + BREAKPOINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Always import:
@import "@styles/spacings";
@import "@styles/media-mixins";

✅ Use ONLY these spacing variables (⛔️ NO raw px values):

$pico: 1px;
$nano: 2px;
$bit: 4px;
$byte: 8px;
$bytex: $byte + $bit;
$kilo: 14px;
$mega: 16px;
$giga: 20px;
$tera: 24px;
$peta: 32px;
$petax: $peta + $byte;
$exa: 48px;
$zetta: 56px;
$yotta: 64px;
$xenotta: 72px;

// special
$fcCalendarMinWidth: 800px;

✅ Use include-media for media queries with the following breakpoints:

$breakpoints: (
phone: 325px,
mobile: 767px,
tablet: 1025px,
desktop: 1200px,
) !default;

Example:
@include media("<mobile") {
...
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✔️ EVERYTHING ABOVE IS MANDATORY FOR AI AGENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// STORYBOOK META EXPORT RULE:
// Always use:
// export default { ...SbDecorator({ ... }) }
// Never use:
// export default SbDecorator({ ... })
// This ensures Storybook meta compliance and prevents CSF errors.
// Example:
// export default {
//   ...SbDecorator({
//     title: "vanguard/Component",
//     component: Component,
//     ...etc
//   })
// }
//
// All main story files (_Component.stories.tsx) must follow this pattern.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SHOWCASE STORIES DESCRIPTIONS (MANDATORY)
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 
 ✅ All showcase stories (_*Showcase.stories.tsx) MUST include a description file
 ✅ Description files MUST be named {ComponentName}.description.md
 ✅ Description files MUST be imported as: import description from "./{ComponentName}.description.md?raw";
 ✅ Default export MUST include description in parameters:
    export default {
      title: "TITLE",
      component: COMPONENT,
      parameters: {
        docs: {
          description: {
            component: description,
          },
        },
      },
    };
 ✅ Description content MUST follow the Modal.description.md pattern with usage examples and API documentation
 ✅ Note: Avoid SbDecorator for showcase stories as it may interfere with component rendering (e.g., chart colors)

// Last updated: 2025-10-06
//
// See also: https://storybook.js.org/docs/react/writing-stories/introduction#default-export

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 MAIN STORYBOOK FILE PATTERN (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Main storybook files MUST use the following import/export pattern for each story:

```typescript
import { StoryName as _StoryName } from "./stories/StoryName.story";
export const StoryName: StoryType = { ..._StoryName };
```
- Always import each story with an underscore alias (as _StoryName)
- Always export with explicit type and object spread
- This ensures type safety, clarity, and consistency for all agents
