# LoadingModal

Modal variant that displays a loading indicator and message during long operations.

- Kind: component
- Import: `import { LoadingModal } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/StandardModals/LoadingModal/LoadingModal.tsx`
- Keywords: modal, loading, spinner, progress, overlay

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `close` | `ModalResponseHandler<null>` | yes |  |
| `compact` | `() => void` | no | Injected only when ModalService.open opts into allowCompact. |
| `ctaNegative` | `ModalFooterAction & SubButtonProps` | no |  |
| `ctaPosition` | `"start" \| "end" \| "between" \| "center"` | no |  |
| `ctaPositive` | `ModalFooterAction & SubButtonProps` | no |  |
| `customNegativeFn` | `(change?: React.Dispatch<React.SetStateAction<number>>) => void` | no |  |
| `expand` | `() => void` | no | Restore the original presentation without losing component state. |
| `headerTitle` | `string` | no |  |
| `headerType` | `ModalType` | no |  |
| `hideHeaderCloseBtn` | `boolean` | no |  |
| `loadingAnimation` | `"default" \| "ai" \| "rocket"` | no |  |
| `message` | `React.ReactNode` | no |  |
| `negativeCtaText` | `string` | no |  |
| `positiveCtaText` | `string` | no |  |
| `positiveIconLeft` | `IconNames` | no |  |
| `title` | `string` | no |  |

## Examples

From `src/core/StandardModals/LoadingModal/stories/Ai.story.tsx`:

```tsx
import { Story } from "./_LoadingModal.default";

export const Ai: Story = {
  args: {
    loadingAnimation: "ai",
    message: "We’re crafting the text for your series posts and sourcing images for each one",
    title: "Our AI assistant is working",
  },
};
```

From `src/core/StandardModals/LoadingModal/stories/Default.story.tsx`:

```tsx
import { Story } from "./_LoadingModal.default";

export const Default: Story = {
  args: {
    loadingAnimation: "default",
  },
};
```
