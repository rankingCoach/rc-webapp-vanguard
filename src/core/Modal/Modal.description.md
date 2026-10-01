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
ModalService.compact(id);
ModalService.expand(id);
```

Compact and expand controls switch **every modal opened with `allowCompact`** together,
including ones opened while compact mode is active. BAMs and dialogs opened without
`allowCompact` never take the compact presentation: one opened while compact windows
are showing opens fullscreen above them, and the compact windows keep their stacks,
geometry and overlay slots.

The panel is 480px wide and at most 760px tall, bounded by the viewport with a
16px gutter. Its content stays mounted while switching modes. Compact mode
allows page interaction and scrolling; other open, non-compact modals still lock
page scrolling. Closing keeps the existing callbacks and cleanup behavior.
Calls for a closed modal or one without `allowCompact` have no effect. Mode is
not persisted to storage. It remains active for this service until explicitly expanded.

### Service-level presentation modes

```tsx
ModalService.setCompactMode(true); // Compact all current and future allowCompact modals
ModalService.setCompactMode(false); // Expand them

ModalService.setStackingEnabled(true); // Opt into overlapping cards
const id = ModalService.open(<BusinessProfile close={() => {}} />, {
  allowCompact: true,
  allowStacking: true, // Only modals opened with allowStacking join a stack
  stackTitle: "Business profile",
});
ModalService.bringToFront(id);
ModalService.setStackTitle(id, "Business profile – Berlin"); // Relabel after open
ModalService.setStackingEnabled(false); // Return to ordinary modal presentation
```

Stacking is disabled by default and works in both fullscreen and compact mode.
It needs both the service switch and a per-modal opt-in: only modals opened with
`allowStacking: true` join a stack. Any other BAM opens as a plain fullscreen modal
above the stacks (open order decides the overlay slot) and leaves them untouched: it
gets no rear strip or tab, does not count toward the stack limit, cannot be docked, and
promoting or focusing stacked windows never reorders it. Compact windows and expanded
BAMs never share a stack.
With more than three expanded stacked BAMs, a single horizontal tab bar replaces
the overlapping rear strips. Tabs preserve their order when switching, scroll
horizontally when necessary, and support Left/Right arrows and Home/End. Closing
back down to three restores the overlapping stack. Compact BAMs always retain
their card stacks, regardless of count.
Each newer card sits slightly lower, exposing the cards behind it. Hovering or
focusing an exposed tab lifts the rear card and shows “Bring to front” with its
`stackTitle` (falling back to its string `title`). `ModalService.setStackTitle(id, title)`
changes that label after open; the tab, the “Bring to front” strip and the compact
window controls' labels update in place (unknown ids and unchanged titles are ignored). Clicking or pressing Enter on
the tab promotes that card without remounting its content. Background cards are
inert until activated. Ordinary dialogs and drawers keep their overlay slots.
Reduced-motion preferences disable the layout transitions.

A modal is *presented* when it is not stacked, or is the active card/tab of its
stack; rear cards, background tabs and the non-front windows of a docked compact
stack are not. Detached compact windows are always presented. Use it to pause
work (polling, media, editors) while a window is hidden behind another:

```tsx
ModalService.isModalPresented(id); // false for unknown/closed ids; re-read on subscribePresentation

const EditorBody = () => {
  // Works anywhere inside the service modal, including inside <Modal>.
  // Outside a service modal it reports presented: true.
  const { presented, modalId } = useModalPresentation();
  useEffect(() => {
    if (!presented) return;
    const timer = setInterval(fetchDraft, 5000);
    return () => clearInterval(timer);
  }, [presented]);
  return <Editor />;
};
```

### Optional moving and resizing of compact BAMs

```ts
ModalService.setCompactWindowControlsEnabled(true); // Separate flag; defaults to false.
ModalService.setCompactMode(true);
ModalService.setStackingEnabled(true); // Optional: also works with independent compact windows.
```

Only compact fullscreen BAMs receive invisible movement areas and edge/corner resize handles.
Only compact windows opened with `allowStacking` dock, join stacks or share stack geometry;
any other compact window moves and resizes on its own.
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

The limit applies independently to each compact stack and to the stack of expanded BAMs. Opening or attaching a BAM
beyond that stack’s limit closes its backmost BAM, keeping the incoming BAM. Promoting windows changes that order. Detached
compact windows, BAMs without `allowStacking` and ordinary dialogs do not count. The limit also applies when enabling
stacking, lowering the maximum, gathering windows, or expanding detached compact BAMs
back into a fullscreen stack. Closing follows the normal injected close callback and
close-listener path with `{ isOk: false }`. The maximum must be a positive integer.

## Optional window metadata and lifecycle events

Pass `windowMetadata` to `ModalService.open` to register a window for consumer-owned
routing or workspace integration. Omitting it leaves the modal outside this API.
This opt-in is independent of compact/stacking flags. Vanguard never reads the
metadata, changes the URL, accesses browser history, or persists window state.

```tsx
const id = ModalService.open(<BusinessProfile close={() => {}} />, {
  allowCompact: true,
  stackTitle: 'Business profile',
  windowMetadata: {
    route: '/customer/app/projects/42/presence/profile',
    projectId: 42,
    kind: 'business-profile',
  },
});

ModalService.getWindow(id);      // { id, metadata } | undefined
ModalService.getWindows();       // opted-in windows, in opening order
ModalService.getActiveWindow();  // highest opted-in window in the overlay order, or null

// Replace the entire metadata record (does not activate or rerender the window).
ModalService.setWindowMetadata(id, {
  route: '/customer/app/projects/42/presence/profile?section=hours',
  projectId: 42,
  kind: 'business-profile',
});
```

`ModalWindowMetadata`, `ModalWindow`, and `ModalWindowEvent` are exported types.
Metadata is an opaque read-only record with unknown values. Records are shallow
copied/frozen; treat nested values as immutable too. Prefer plain serializable
route/record identifiers if your application will persist them. Setting metadata
on an unknown or non-opted-in modal is a no-op.

`subscribeWindowEvents(callback)` returns an unsubscribe function. Events are
synchronous notifications with these discriminated shapes:

| `type` | Fields | Meaning |
| --- | --- | --- |
| `activated` | `window`, `previousWindowId`, `reason` | Active opted-in window changed. Reason is `open`, `focus`, `dock`, or `close`. |
| `closed` | `window`, `wasActive`, `activeWindow` | Window removed from the service; includes its last metadata and the remaining active window or `null`. |
| `metadataChanged` | `window`, `isActive` | Consumer explicitly replaced a window's metadata. |

Opening emits activation before `open()` returns: use the event's `window.id`,
not a variable assigned from the return value. Subscribing does not replay events;
read the snapshots after subscribing to initialize a coordinator. Closing emits
`closed` first, then `activated` if the active window was replaced. Closing a
background window emits only `closed`. Duplicate removal does not emit again.
The close notification means service removal, not completion of the exit animation.
It covers normal close, `closeAllModals`, and stack-limit eviction. Bulk close can
emit intermediate activations; a coordinator clearing a workspace should suppress
URL writes until its bulk operation completes. Subscriber exceptions are logged
and isolated from modal operations and other subscribers.

Activation means the highest **opted-in window**, not DOM focus or the highest
arbitrary dialog. An ordinary confirmation dialog does not take over its URL.
Repeated focus, dragging/resizing, hovering, compact/expand, and geometry-only
stack changes do not emit activation. Existing bring-to-front controls, fullscreen
tabs, and compact-window focus report actual changes in active window identity.
Geometry subscriptions (`subscribePresentation`) should not drive routing.

### Consumer routing example

Install one coordinator inside the application's router. The following function
accepts the application's URL writer; Vanguard has no router dependency:

```ts
import { ModalService, type ModalWindow } from 'vanguard';

function connectWindowRoutes(
  writeRoute: (route: string, mode: 'push' | 'replace') => void,
  baseRoute: string,
) {
  const reflect = (window: ModalWindow | null, mode: 'push' | 'replace') => {
    const route = window?.metadata.route;
    if (typeof route === 'string') writeRoute(route, mode);
    else if (!window) writeRoute(baseRoute, 'replace');
  };
  const unsubscribe = ModalService.subscribeWindowEvents((event) => {
    if (event.type === 'activated') {
      reflect(event.window, event.reason === 'open' ? 'push' : 'replace');
    } else if (event.type === 'metadataChanged' && event.isActive) {
      reflect(event.window, 'replace');
    } else if (event.type === 'closed' && event.wasActive && !event.activeWindow) {
      reflect(null, 'replace');
    }
  });
  reflect(ModalService.getActiveWindow(), 'replace');
  return unsubscribe; // return from the consumer's effect cleanup
}
```

The application must validate route metadata, preserve unrelated URL parameters,
avoid writing an already-current URL, and guard URL-driven restoration against
writing back into history. Back/Forward, deep-link resolution, duplicate-window
policy, account/project scope, unsaved drafts, and reload restoration remain
application responsibilities. Do not use an application navigation helper that
closes every modal when reflecting a window's URL. Layout/group geometry belongs
in workspace/session state, not the active window's shareable URL.


### Compact presentation event

The public pub/sub event `PUB_SUB_EVENTS.reactModalCompactChange`
(`REACT_MODAL_COMPACT_CHANGE`) carries `{ modalId: string; isCompact: boolean }`.
It is published synchronously after an individual BAM's compact state changes;
a shared compact/expand action can publish once for each affected BAM. Unchanged
states do not publish. It reports presentation changes, not window activation,
and should not drive routing. Publications before the first subscription are discarded. Once a subscription
channel exists, the pub/sub service buffers subsequent events and replays that
history to later subscribers; unsubscribe during consumer cleanup.

The consumer controls `compact()` / `expand()` injected by `open()` and the
service methods `compact(id)` / `expand(id)` retain the existing opt-in behavior.
The older service names `compactEv(id)` / `expandEv(id)` remain deprecated aliases.
