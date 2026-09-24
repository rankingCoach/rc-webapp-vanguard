## Modal Usage

To use modals in your application, you need to set up the ModalProvider and ModalRoot components:

### Basic Setup

Wrap your application root with `ModalProvider` and include `ModalRoot` in your component tree:

```tsx
import { ModalProvider, ModalRoot } from '@vanguard/Modal';

function App() {
  return (
    <ModalProvider>
      <div>
        {/* Your app content */}
        <ModalRoot />
      </div>
    </ModalProvider>
  );
}
```

### ModalProvider

The `ModalProvider` provides the context necessary for modal management. It must wrap any components that will open or interact with modals.

### ModalRoot

The `ModalRoot` component is responsible for rendering all active modals. It should be placed in your component tree where you want modals to appear (typically near the root level).

### Opening Modals

Modals are typically opened using the ModalService:

```tsx
import { ModalService } from '@vanguard/Modal';

// Open a modal
ModalService.open(<MyModal close={() => {}} />, { /* modal options */ });
```

### Opt-in compact mode

Open a fullscreen modal with `{ allowCompact: true }` to enable a floating,
bottom-right presentation. The consumer receives optional `compact()` and
`expand()` methods alongside `close`; no buttons are added automatically.

```tsx
const Editor = ({ close, compact, expand }: StandardModalProps<unknown>) => (
  <Modal fullscreen onClose={close}>
    <button onClick={compact}>Compact</button>
    <button onClick={expand}>Expand</button>
    <EditorContent />
  </Modal>
);

const id = ModalService.open(<Editor close={() => {}} />, { allowCompact: true });
ModalService.compactEv(id);
ModalService.expandEv(id);
```

Compact and expand controls now switch **all fullscreen BAMs together**, including
BAMs inside consumer wrappers and BAMs opened while compact mode is active.
Ordinary non-fullscreen dialogs retain their existing presentation.

The panel is 480px wide and at most 760px tall, bounded by the viewport with a
16px gutter. Its content stays mounted while switching modes. Compact mode
allows page interaction and scrolling; other open, non-compact modals still lock
page scrolling. Closing keeps the existing callbacks and cleanup behavior.
Calls for a closed modal or one without `allowCompact` have no effect. Mode is
not persisted to storage. It remains active for this service until explicitly expanded.

### Service-level presentation modes

```tsx
ModalService.setCompactMode(true); // Compact all current and future BAMs
ModalService.setCompactMode(false); // Expand all BAMs

ModalService.setStackingEnabled(true); // Opt into overlapping cards
const id = ModalService.open(<BusinessProfile close={() => {}} />, {
  allowCompact: true,
  stackTitle: "Business profile",
});
ModalService.bringToFront(id);
ModalService.setStackingEnabled(false); // Return to ordinary modal presentation
```

Stacking is disabled by default and works in both fullscreen and compact mode.
Each newer card sits slightly lower, exposing the cards behind it. Hovering or
focusing an exposed tab lifts the rear card and shows “Bring to front” with its
`stackTitle` (falling back to its string `title`). Clicking or pressing Enter on
the tab promotes that card without remounting its content. Background cards are
inert until activated. Ordinary dialogs and drawers keep their overlay slots.
Reduced-motion preferences disable the layout transitions.

### Optional moving and resizing of compact BAMs

```ts
ModalService.setCompactWindowControlsEnabled(true); // Separate flag; defaults to false.
ModalService.setCompactMode(true);
ModalService.setStackingEnabled(true); // Optional: also works with independent compact windows.
```

Only compact fullscreen BAMs receive invisible movement areas and edge/corner resize handles.
The top 48px acts as an invisible title band (the outer 8px remains available for resizing).
Dragging the sides moves an individual BAM; the center 96px moves the attached stack.
Buttons, links, inputs, and focusable controls in the band remain interactive. Add
`data-modal-no-drag` to a custom CTA or region to exclude it from dragging. Resizing the front attached BAM resizes the shared stack; resizing a
floating BAM affects only that window. Drop onto another BAM to rejoin a stack.
`returnCompactWindowToStack(id)` and `stackAllCompactWindows()` remain available for
consumer-owned controls; no action button row is rendered inside the modal. Components stay mounted,
so drafts and local state survive these operations. Arrow keys on the movement/resize
handles offer keyboard control (10px steps, or 40px with Shift).

Positions and sizes are constrained to the viewport, with preferred minimum dimensions
of 320 × 240px. Geometry is kept in memory and restored when switching back from fullscreen.
Window resize events keep compact windows reachable.

`ModalService.setCompactWindowControlsEnabled(false)` removes all movement controls,
resize handles, their listeners, and custom geometry, returning to the existing compact
presentation. When never enabled, no window controls are mounted and geometry APIs do
nothing. Fullscreen BAMs and regular dialogs are unaffected. Applications can also call
`returnCompactWindowToStack(modalId)` or `stackAllCompactWindows()` while the flag is enabled.

Dragging an individual compact BAM over another window highlights and slightly lifts the
destination when at least 50% of the smaller window's area overlaps. Dropping two detached
BAMs creates a new, independent stack at the destination. Existing stacks keep their
members, order, position, and size. Each stack has its own center drag band, resize bounds,
and active front window. New BAMs opened through the service join the original stack.

Dropping a window onto an existing stack joins that stack. Dropping an entire stack onto
another stack merges only those two groups, preserving the internal order of each. A
stack can also be dropped onto a detached BAM. Windows within the dragged stack cannot
become drop targets. Resizing and cancelled drags do not dock.

`stackAllCompactWindows()` explicitly gathers every group and detached BAM into the
original stack; `returnCompactWindowToStack(id)` returns one BAM to that original stack.
Expanding to fullscreen temporarily presents one stack; compacting again restores the
separate groups. Disabling window controls discards the groups and custom geometry.

The threshold can be configured with `ModalService.setCompactWindowDockThreshold(50)`
(percentage greater than 0 and at most 100). Drop-to-stack uses the same disabled-by-default
`setCompactWindowControlsEnabled` flag.

With compact window controls enabled, exposed rear strips also support dragging. A press
keeps the window in place; release without movement brings it forward. Moving at least
4px detaches that individual window, including a window in the middle of the stack.


### Optional stack limit

```ts
ModalService.setMaxStackSize(3); // Keep at most three attached BAMs when stacking is enabled.
ModalService.setMaxStackSize(); // Restore the default: no limit (null also clears it).
```

The limit applies independently to each compact stack. Opening or attaching a BAM
beyond that stack’s limit closes its backmost BAM, keeping the incoming BAM. Promoting windows changes that order. Detached
compact windows and ordinary dialogs do not count. The limit also applies when enabling
stacking, lowering the maximum, gathering windows, or expanding detached compact BAMs
back into a fullscreen stack. Closing follows the normal injected close callback and
close-listener path with `{ isOk: false }`. The maximum must be a positive integer.
