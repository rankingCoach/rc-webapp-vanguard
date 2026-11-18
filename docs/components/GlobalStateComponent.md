# GlobalStateComponent

Wrapper that draws visual states over its content: hover highlight, blur (blocks clicks) and loading shimmer.

- Kind: component
- Import: `import { GlobalStateComponent } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/GlobalStateComponent/GlobalStateComponent.tsx`
- Keywords: hover, blur, shimmer, loading, overlay, wrapper, state

## DOM contract

Slots: `[data-slot="global-state"]`, `[data-slot="global-state-blur"]`, `[data-slot="global-state-shimmer"]`

State / variant attributes: `data-blurred`, `data-hoverable`, `data-shimmering`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `blurred` | `boolean` | no | Blurs the content and blocks pointer interaction with it. |
| `children` | `React.ReactNode` | yes |  |
| `className` | `string` | no |  |
| `data-slot` | `string` | no |  |
| `hoverable` | `boolean` | no | Highlights the content while the pointer is over it. |
| `id` | `string` | no |  |
| `innerRef` | `React.MutableRefObject<HTMLDivElement> \| ((node?: Element) => void)` | no |  |
| `onClick` | `React.MouseEventHandler<Element>` | no |  |
| `role` | `"article"` | no |  |
| `shimmering` | `boolean` | no | Sweeps a shimmer band over the content, e.g. while it is loading. |
| `style` | `React.CSSProperties` | no |  |
| `testId` | `string` | no |  |

## Examples

From `src/core/GlobalStateComponent/stories/Blurred.story.tsx`:

```tsx
import { within, expect } from "storybook/test";
import { Story, demoCardContent, demoCardStyle, demoTestId, getTopElementAtCenterOf } from "./_GlobalStateComponent.default";

export const Blurred: Story = {
  args: {
    blurred: true,
    testId: demoTestId,
    style: demoCardStyle,
    children: demoCardContent,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wrapper = canvas.getByTestId(demoTestId);

    const blurLayer = wrapper.querySelector('[class*="blurLayer"]') as HTMLElement;
    await expect(blurLayer).toBeTruthy();
    await expect(getComputedStyle(blurLayer).backdropFilter).toBe("blur(4px)");

    // The blur layer covers the content, so a click lands on the layer, not the button
    const button = canvas.getByRole("button", { name: "Edit" });
    await expect(getTopElementAtCenterOf(button)).toBe(blurLayer);
  },
};
```

From `src/core/GlobalStateComponent/stories/Default.story.tsx`:

```tsx
import { within, expect } from "storybook/test";
import { Story, demoCardContent, demoCardStyle, demoTestId, getTopElementAtCenterOf } from "./_GlobalStateComponent.default";

export const Default: Story = {
  args: {
    testId: demoTestId,
    style: demoCardStyle,
    children: demoCardContent,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wrapper = canvas.getByTestId(demoTestId);

    await expect(canvas.getByText("Business hours")).toBeInTheDocument();

    // No state set: no layer is rendered and the content stays clickable
    await expect(wrapper.className).not.toContain("hoverable");
    await expect(wrapper.querySelector('[class*="blurLayer"]')).toBeNull();
    await expect(wrapper.querySelector('[class*="shimmerLayer"]')).toBeNull();

    const button = canvas.getByRole("button", { name: "Edit" });
    await expect(getTopElementAtCenterOf(button)).toBe(button);
  },
};
```
