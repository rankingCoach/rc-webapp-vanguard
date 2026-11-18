# Tabs

Tabs control to partition content into labeled panels with keyboard and accessibility support.

- Kind: component
- Import: `import { Tabs } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/Tabs/Tabs.tsx`
- Keywords: tabs, navigation, panels, keyboard, accessibility, ui

## DOM contract

Slots: `[data-slot="tabs"]`, `[data-slot="tabs-list"]`, `[data-slot="tabs-scroller"]`

State / variant attributes: `data-variant`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `alignCenter` | `boolean` | no | Vertically centers the bar content. |
| `ariaLabel` | `string` | no | Accessible name of the tablist. Same as passing `aria-label`. |
| `className` | `string` | no | Class name applied to the tab-bar root element (not the outer wrapper). |
| `iconSize` | `"default" \| "small"` | no | Size of the `tabIcons` avatars: `'small'` renders xs avatars. |
| `keepInactiveTabsInDom` | `boolean` | no | Keep inactive panels mounted (hidden with `display: none`) so their state is preserved. |
| `onChange` | `TabsChangeHandler` | no | Called on every tab click, including clicks on the already-selected tab. |
| `onValueChange` | `(value: any, event: React.SyntheticEvent<Element, Event>) => void` | no | Convenience callback fired together with `onChange`, with the value first. |
| `padding` | `"default" \| "small"` | no | `'small'` applies an 8px padding to each tab. |
| `ref` | `React.Ref<HTMLDivElement>` | no | Ref to the tab-bar root element (the element receiving `className`). |
| `selectionFollowsFocus` | `boolean` | no | When true, moving focus with the keyboard also selects the focused tab (automatic activation). |
| `tabConfig` | `TabConfig` | no | Visual configuration (theme, sizes, paddings...) shared by all tabs. Same keys as the flat props; a key set here wins over the flat prop. |
| `tabGrow` | `boolean` | no | `false` prevents tabs from growing to fill the bar (themes that grow by default). |
| `tabHeight` | `"small" \| "tall"` | no | `'small'` renders 36px high tabs. `'tall'` (default) keeps the 48px minimum. |
| `tabListClassName` | `string` | no | Class name applied to the `role="tablist"` element. |
| `tabNoMinWidth` | `boolean` | no | Removes the 90px minimum width of each tab. |
| `tabs` | `TabProps<any>[]` | yes | Tab definitions. Disabled tabs are hidden from the bar. |
| `tabTextTransform` | `"none" \| "uppercase" \| "capitalize" \| "lowercase"` | no | Text transform applied to the tab labels. Defaults to `'none'`. |
| `testId` | `string` | no | Base test id: each tab label gets `data-testid="${testId}-${index}"` (index in the `tabs` array). |
| `theme` | `"floating" \| "highlight" \| "underline"` | no | Visual theme of the bar. Defaults to `'highlight'`. |
| `value` | `any` | no | Value of the selected tab, matched against each tab's `value` (or its index when the tab has no value). When `undefined` the component keeps its own selection state, starting at `0`. |
| `wrapperClassName` | `string` | no | Class name applied to the outer element wrapping the bar and the panels. |

Also accepts: 275 React DOM attributes (not listed).

## Examples

From `src/core/Tabs/stories/BarOnly.story.tsx`:

```tsx
import React from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Story, TabsHarness } from './_Tabs.default';

export const BarOnly: Story = {
  args: {
    onChange: fn(),
    tabs: [
      { label: 'Alpha', value: 'alpha' },
      { label: 'Beta', value: 'beta' },
      { label: 'Gamma', value: 'gamma' },
    ],
  },
  render: (args) => <TabsHarness {...args} initialValue="alpha" />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('tablist')).toBeInTheDocument();
    await expect(canvas.getAllByRole('tab')).toHaveLength(3);

    await userEvent.click(canvas.getByRole('tab', { name: 'Beta' }));
    await expect(args.onChange).toHaveBeenCalledWith(expect.anything(), 'beta');
    await expect(canvas.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
  },
};
```

From `src/core/Tabs/stories/ComponentNull.story.tsx`:

```tsx
import React, { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Story, TabsHarness } from './_Tabs.default';

const LazyHarness = () => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setLoaded(true)}>
        Load
      </button>
      <TabsHarness
        initialValue="a"
        tabs={[
          { label: 'A', value: 'a', component: loaded ? <p>Loaded</p> : null },
          { label: 'B', value: 'b', component: <p>Other</p> },
        ]}
      />
    </div>
  );
};

export const ComponentNull: Story = {
  render: () => <LazyHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('tab')).toHaveLength(2);
    await expect(canvas.queryByText('Loaded')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Load' }));

    await expect(canvas.getByText('Loaded')).toBeVisible();
  },
};
```
