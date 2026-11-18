# SearchableSelect

Select input with search/filter capabilities and keyboard navigation for large option sets.

- Kind: component
- Import: `import { SearchableSelect } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/SearchableSelect/SearchableSelect.tsx`
- Keywords: select, search, filter, dropdown, autocomplete, options

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `defaultSelected` | `T` | no |  |
| `displaySearchBarMinimumElements` | `number` | no |  |
| `displayTotalCountThreshold` | `number` | no |  |
| `elementName` | `string` | no |  |
| `onSelection` | `(value: T) => void` | no |  |
| `options` | `O[]` | yes |  |
| `searchableProps` | `(keyof O)[]` | no |  |
| `startAdornment` | `{ icon: IconNames; color?: string; }` | no |  |
| `value` | `T` | no |  |

## Examples

From `src/core/SearchableSelect/stories/Default.story.tsx`:

```tsx
import { Story, testOptions } from "./_SearchableSelect.default";
import { SearchableSelect } from "../SearchableSelect";
import { within, expect } from "storybook/test";

export const Default: Story = {
  render: () => <SearchableSelect options={testOptions} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByTestId("vanguard-searchable-select-input");

    await expect(select).toBeInTheDocument();
  },
};
```

From `src/core/SearchableSelect/stories/WithDescriptions.story.tsx`:

```tsx
import { Story, testOptionsWithDescriptions } from "./_SearchableSelect.default";
import { SearchableSelect } from "../SearchableSelect";
import { within, expect } from "storybook/test";

export const WithDescriptions: Story = {
  render: () => <SearchableSelect options={testOptionsWithDescriptions} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByTestId("vanguard-searchable-select-input");

    await expect(select).toBeInTheDocument();
  },
};
```
