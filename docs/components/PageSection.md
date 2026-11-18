# PageSection

Structural component representing a page section with title and optional actions.

- Kind: component
- Import: `import { PageSection } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/PageSection/PageSection.tsx`
- Keywords: section, page, layout, header, content, block

## DOM contract

Slots: `[data-slot="page-section"]`, `[data-slot="page-section-content"]`, `[data-slot="page-section-header"]`

State / variant attributes: `data-background`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `background` | `PageSectionBackground` | no |  |
| `children` | `React.ReactNode` | no |  |
| `className` | `string` | no |  |
| `description` | `string` | no |  |
| `headerActionArea` | `React.ReactNode` | no |  |
| `headerType` | `HeaderTypes` | no |  |
| `innerRef` | `PageSectionInnerRef` | no |  |
| `isVisible` | `boolean` | no |  |
| `noDefaultPadding` | `boolean` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `roundedEdges` | `PageSectionRoundedEdges` | no |  |
| `testId` | `string` | no |  |
| `title` | `string` | yes |  |

## Related

- Use PageSection to logically group related content on a page, improving readability and organization.
- Include a title in the PageSection to provide context and improve accessibility for screen readers.
- Consider using actions (e.g., buttons) in the header of the PageSection for relevant interactions related to that section's content.
- Use multiple PageSections on a page to break up content into manageable chunks, enhancing user experience.
- PageSection component can be used to define an entire page, splitting it into multiple sections for better structure and navigation. First section should have rounded corners at the top, and last section should have rounded corners at the bottom to create a cohesive page layout.
- When using multiple PageSections one after another, ensure that background is alternated: fist section use functionalBg, then frostedGlass, then functionalBg again, and so on. This will help visually separate the sections and improve readability

## Examples

From `src/core/PageSection/stories/Default.story.tsx`:

```tsx
import React from 'react';
import {within, expect} from 'storybook/test';

import {PageSection} from '../PageSection';
import type {Story} from './_PageSection.default';

export const Default: Story = {
  render: () => (
    <PageSection testId="PageSection_Default">
      <div>Body content</div>
    </PageSection>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Body content')).toBeInTheDocument();
    await expect(canvas.getByTestId('PageSection_Default_Children')).toBeInTheDocument();

    // Default contract: defaultPadding is applied when noDefaultPadding is not set
    const root = canvas.getByTestId('PageSection_Default');
    await expect(root.className).toContain('defaultPadding');

    // Default contract: functionalBg class applied by default
    await expect(root.className).toContain('functionalBg');
  },
};
```

From `src/core/PageSection/stories/FrostedGlass.story.tsx`:

```tsx
import React from 'react';
import {within, expect} from 'storybook/test';

import {HeaderTypes} from '@vanguard/Header';
import {PageSection, PageSectionBackground} from '../PageSection';
import type {Story} from './_PageSection.default';

export const FrostedGlass: Story = {
  render: () => (
    <PageSection
      testId="PageSection_FrostedGlass"
      background={PageSectionBackground.frostedGlass}
      headerType={HeaderTypes.sectionHeader}
      title="Frosted section"
      description="Frosted description"
    >
      <div>Body content</div>
    </PageSection>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Frosted section')).toBeInTheDocument();
    await expect(canvas.getByText('Frosted description')).toBeInTheDocument();
    await expect(canvas.getByText('Body content')).toBeInTheDocument();

    const root = canvas.getByTestId('PageSection_FrostedGlass');
    await expect(root.className).toContain('frostedGlass');
  },
};
```
