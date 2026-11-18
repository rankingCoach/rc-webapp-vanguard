# NavigationModal

- Kind: component
- Import: `import { NavigationModal } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Modal/NavigationModal/NavigationModal.tsx`

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `activeIndex` | `number` | yes | 0-based index of the currently shown item. Controlled by the parent. |
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
| `hideCounter` | `boolean` | no | Hide the "N of M" counter below the panel. Defaults to `false`. |
| `hideHeaderCloseBtn` | `boolean` | no |  |
| `keyboardNavigation` | `boolean` | no | Navigate with the ArrowLeft/ArrowRight keys. Defaults to `true`. |
| `loop` | `boolean` | no | Wrap around at the ends. When `false` (default) arrows are disabled at the bounds. |
| `maxWidth` | `string` | no |  |
| `message` | `React.ReactNode` | no |  |
| `minHeight` | `string` | no |  |
| `modalContentClassName` | `string` | no |  |
| `modalPosition` | `"center" \| "bottom" \| "top"` | no |  |
| `onClose` | `(response?: ModalResponse<any>) => void` | no | Close handler owned by the modal. When provided, the modal renders its own close (✕) button and wires Esc / outside-click closing to it. Same signature as the (deprecated) `ModalHeader` `closeFn`, so the `close` injected by `ModalService` can be passed directly. |
| `onContentClick` | `(event: React.MouseEvent<Element, MouseEvent>) => void` | no |  |
| `onNavigate` | `(newIndex: number) => void` | yes | Called with the new index when the user navigates via arrows or keyboard. |
| `onOutsideClick` | `(event: React.MouseEvent<Element, MouseEvent>) => void` | no |  |
| `padding` | `string` | no |  |
| `showCloseButton` | `boolean` | no | Render the built-in close button when `onClose` is set. Defaults to `true`. |
| `stackTitle` | `string` | no | Label shown on the exposed stacking tab. |
| `testId` | `string` | no |  |
| `title` | `string` | no |  |
| `totalItems` | `number` | yes | Total number of items in the collection. |
| `type` | `ModalType` | no |  |
| `width` | `string` | no |  |
| `windowMetadata` | `Readonly<Record<string, unknown>>` | no | Opt into window lifecycle events. Omit to retain ordinary modal behavior. |
| `wrapInModal` | `boolean` | no |  |

## Examples

From `src/core/Modal/NavigationModal/stories/SingleItem.story.tsx`:

```tsx
import { ModalService } from '@vanguard/Modal/ModalService';
import React from 'react';
import { expect, screen, userEvent, within } from 'storybook/test';

import { closeAllModals, DemoNavigationModal, Story } from './_NavigationModal.default';

export const SingleItem: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Close any remaining modals from previous tests
    await closeAllModals();

    // Open modal
    const openButton = canvas.getByRole('button', { name: /open modal/i });
    await userEvent.click(openButton);

    // Counter is shown, arrows are not rendered for a single item
    const counter = await screen.findByTestId('navigation-modal-counter');
    await expect(counter).toHaveTextContent('1 of 1');
    await expect(screen.queryByTestId('navigation-modal-prev')).not.toBeInTheDocument();
    await expect(screen.queryByTestId('navigation-modal-next')).not.toBeInTheDocument();
  },
  render: () => {
    const openModal = () => {
      ModalService.open(<DemoNavigationModal totalItems={1} close={() => {}} />);
    };

    return (
      <div>
        <button onClick={openModal}>Open Modal</button>
      </div>
    );
  },
};
```
