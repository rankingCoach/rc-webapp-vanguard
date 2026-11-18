# Modal

Composable modal dialog component that handles content, visibility and basic keyboard/overlay behavior.

- Kind: component
- Import: `import { Modal } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Modal/Modal.tsx`
- Keywords: modal, dialog, overlay, dialogue, popup, close, overlay

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `allowCompact` | `boolean` | no | Opt into compact()/expand() controls. Existing modals remain unchanged when omitted. |
| `allowStacking` | `boolean` | no | Opt into the BAM card stack (active while setStackingEnabled(true)). Omitted, the modal opens as a plain BAM above any stack and never joins, counts toward or reorders one. |
| `animation` | `ModalTransition` | no |  |
| `backdrop` | `ModalBackdrop` | no | What lies behind the content. `dimmed` (default): the usual dimmed page with the content on a surface panel. `immersive`: the whole screen frosted under a dark pool, with the content straight on it and no panel; the content is on dark, so its texts and buttons take their light colours (`onDark` buttons). |
| `backgroundColor` | `string` | no |  |
| `baseZIndex` | `number` | no | Floor to stack this modal from. Defaults to the shared stacking floor. Pass a higher value to force the modal above content outside the overlay ledger (e.g. injected 3rd-party widgets). Layering against other overlays is still managed by OverlayStackingService. |
| `children` | `React.ReactNode` | no |  |
| `className` | `string` | no |  |
| `closeOnEsc` | `boolean` | no | Close on Escape key press (topmost modal only). Defaults to `true`. |
| `closeOnOutsideClick` | `boolean` | no | Close on overlay / outside click. Defaults to `true`. |
| `disableOutsideClick` | `boolean` | no |  |
| `fullscreen` | `boolean` | no |  |
| `hideCloseButtonOnMobile` | `boolean` | no | Hide the built-in close button on mobile/tablet. Defaults to `false`. |
| `hideHeaderCloseBtn` | `boolean` | no |  |
| `maxWidth` | `string` | no |  |
| `message` | `React.ReactNode` | no |  |
| `minHeight` | `string` | no |  |
| `modalContentClassName` | `string` | no |  |
| `modalPosition` | `"center" \| "bottom" \| "top"` | no |  |
| `onClose` | `(response?: ModalResponse<any>) => void` | no | Close handler owned by the modal. When provided, the modal renders its own close (✕) button and wires Esc / outside-click closing to it. Same signature as the (deprecated) `ModalHeader` `closeFn`, so the `close` injected by `ModalService` can be passed directly. |
| `onContentClick` | `(event: React.MouseEvent<Element, MouseEvent>) => void` | no |  |
| `onOutsideClick` | `(event: React.MouseEvent<Element, MouseEvent>) => void` | no |  |
| `outerContent` | `React.ReactNode` | no | Content rendered OUTSIDE the modal panel but inside the overlay, positioned relative to the panel bounds (e.g. lightbox navigation arrows / counter). Clicks on it do not trigger outside-click closing. |
| `padding` | `string` | no |  |
| `showCloseButton` | `boolean` | no | Render the built-in close button when `onClose` is set. Defaults to `true`. |
| `stackTitle` | `string` | no | Label shown on the exposed stacking tab. |
| `testId` | `string` | no |  |
| `title` | `string` | no |  |
| `type` | `ModalType` | no |  |
| `width` | `string` | no |  |
| `windowMetadata` | `Readonly<Record<string, unknown>>` | no | Opt into window lifecycle events. Omit to retain ordinary modal behavior. |
| `wrapInModal` | `boolean` | no |  |

## Examples

From `src/core/Modal/stories/FooterNeutralButton.story.tsx`:

```tsx
import React from "react";
import { ModalFooter } from "@vanguard/Modal/ModalFooter/ModalFooter";
import { Story } from "./_Modal.default";

/**
 * Static render of the ModalFooter: the neutral (middle) button has no explicit `type`,
 * so it falls back to the default muted button.
 */
export const FooterNeutralButton: Story = {
  args: {},
  render: () => (
    <ModalFooter
      negative={{ text: "Cancel", cta: () => {} }}
      neutral={{ text: "Save draft", cta: () => {} }}
      positive={{ text: "Publish", cta: () => {} }}
    />
  ),
};
```

From `src/core/Modal/stories/ModalStory.story.tsx`:

```tsx
import React from "react";
import { fn, userEvent, within, expect } from "storybook/test";
import { ModalService } from "@vanguard/Modal/ModalService";
import { Modal } from "@vanguard/Modal/Modal";
import { Button } from "@vanguard/Button/Button";
import { Story } from "./_Modal.default";

const ModalOne = () => {
  return (
    <Modal minHeight={"500px"} fullscreen={true}>
      TEST1
    </Modal>
  );
};

const ModalTwo = () => {
  return (
    <Modal minHeight={"500px"} fullscreen={true}>
      TEST2
    </Modal>
  );
};

export const ModalStory: Story = {
  args: {},
  render: (args) => (
    <div>
      <Button
        onClick={() => {
          const id1 = ModalService.openSlide(<ModalOne />);
          const id2 = ModalService.openSlide(<ModalTwo />);
          // ModalService.closeEv(id2);
        }}
      >
        Open Modals
      </Button>
    </div>
  ),
};
```
