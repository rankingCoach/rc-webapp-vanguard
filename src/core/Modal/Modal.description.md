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

The panel is 480px wide and at most 760px tall, bounded by the viewport with a
16px gutter. Its content stays mounted while switching modes. Compact mode
allows page interaction and scrolling; other open, non-compact modals still lock
page scrolling. Closing keeps the existing callbacks and cleanup behavior.
Calls for a closed modal or one without `allowCompact` have no effect. Mode is
not persisted: each new modal opens in its original presentation.
