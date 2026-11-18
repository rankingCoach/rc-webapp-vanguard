# Header

Top-level header component with site branding, navigation and optional actions.

- Kind: component
- Import: `import { Header } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Header/Header.tsx`
- Keywords: header, navigation, brand, topbar, site, layout

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `description` | `string` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `testId` | `string` | no |  |
| `title` | `string` | yes |  |
| `type` | `HeaderTypes` | yes |  |

## Examples

From `src/core/Header/stories/BamHeader.story.tsx`:

```tsx
import React from 'react';
import { Header, HeaderTypes } from '../Header';
import { within, expect } from 'storybook/test';
import { Story } from './_Header.default';

export const BamHeader: Story = {
  args: {
    title: 'BAM Header',
    description: 'This is a BAM header with description',
    type: HeaderTypes.bamHeader,
  },
  render: (args) => (
    <div style={{ width: '90%' }}>
      <Header {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const titleElement = canvas.getByText('BAM Header');
    const descriptionElement = canvas.getByText('This is a BAM header with description');

    await expect(titleElement).toBeInTheDocument();
    await expect(descriptionElement).toBeInTheDocument();
  },
};

export default BamHeader;
```

From `src/core/Header/stories/BamWithPreviewHeader.story.tsx`:

```tsx
import React from 'react';
import { Header, HeaderTypes } from '../Header';
import { within, expect } from 'storybook/test';
import { Story } from './_Header.default';

export const BamWithPreviewHeader: Story = {
  args: {
    title: 'BAM with Preview Header',
    description: 'This is a BAM with preview header with description',
    type: HeaderTypes.bamWithPreviewHeader,
  },
  render: (args) => (
    <div style={{ width: '90%' }}>
      <Header {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const titleElement = canvas.getByText('BAM with Preview Header');
    const descriptionElement = canvas.getByText('This is a BAM with preview header with description');

    await expect(titleElement).toBeInTheDocument();
    await expect(descriptionElement).toBeInTheDocument();
  },
};

export default BamWithPreviewHeader;
```
