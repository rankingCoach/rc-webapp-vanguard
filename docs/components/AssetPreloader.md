# AssetPreloader

Preloads images, fonts and other assets to improve perceived performance and avoid layout shifts.

- Kind: component
- Import: `import { AssetPreloader } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/AssetPreloader/AssetPreloader.tsx`
- Keywords: preload, assets, images, fonts, performance

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `avatars` | `string[]` | no |  |
| `icons` | `IconNames[]` | no |  |
| `images` | `string[]` | no |  |

## Examples

From `src/core/AssetPreloader/stories/Default.story.tsx`:

```tsx
import React from "react";
import { AssetPreloader } from "../AssetPreloader";
import { within, expect } from "storybook/test";
import { Story } from "./_AssetPreloader.default";

/**
 * Default story for AssetPreloader.
 * This is a technical component that preloads assets (icons, avatars, images) to improve performance.
 * It renders a hidden span element off-screen to load the assets without displaying anything visible.
 * The component accepts optional props for icons, avatars, and images to preload.
 */
export const Default: Story = {
  args: {},
  render: (args) => (
    <div>
      <AssetPreloader {...args} />
      <div style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px' }}>
        <h3>AssetPreloader Component</h3>
        <p>This is a technical component that preloads assets (icons, avatars, images) to improve performance.</p>
        <p>It renders a hidden span element off-screen to load the assets without displaying anything visible.</p>
        <p>The component accepts optional props for icons, avatars, and images to preload.</p>
        <p><strong>Note:</strong> No visible output is shown in the story canvas as the component is designed to work invisibly.</p>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The component renders a hidden span for preloading assets
    const preloader = canvasElement.querySelector("span");
    await expect(preloader).toBeInTheDocument();
  },
};
```

From `src/core/AssetPreloader/stories/WithAvatars.story.tsx`:

```tsx
import React from "react";
import { AssetPreloader } from "../AssetPreloader";
import { within, expect } from "storybook/test";
import { Story, testAvatars } from "./_AssetPreloader.default";

/**
 * WithAvatars story for AssetPreloader.
 * Demonstrates preloading specific avatar icons. The component renders Avatar components inside a hidden span
 * to preload the SVG assets for avatars. No visible output is shown as the span is positioned off-screen.
 */
export const WithAvatars: Story = {
  args: {
    avatars: testAvatars,
  },
  render: (args) => (
    <div>
      <AssetPreloader {...args} />
      <div style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px' }}>
        <h3>AssetPreloader with Avatars</h3>
        <p>Demonstrates preloading specific avatar icons: {testAvatars.join(', ')}.</p>
        <p>The component renders Avatar components inside a hidden span to preload the SVG assets for avatars.</p>
        <p><strong>Note:</strong> No visible output is shown in the story canvas as the component is designed to work invisibly.</p>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const preloader = canvasElement.querySelector("span");
    await expect(preloader).toBeInTheDocument();
    // Check that avatars are rendered
    const avatars = preloader?.querySelectorAll("div");
    await expect(avatars?.length).toBe(testAvatars.length);
  },
};
```
