# NavigationModal — modal with navigation controls outside the panel

## Context

The media gallery preview (see user's screenshot) shows prev/next arrows and a "3 of 30" position indicator *inside* the modal panel. The desired UX is lightbox-style: arrows on the backdrop vertically centered at the left/right of the panel, and the counter centered *below* the panel — all outside `.modal-content`.

Today this is impossible: the base [Modal](src/core/Modal/Modal.tsx) renders `.rc-modal` (fixed overlay, flex, `overflow-y: auto`) with `.modal-content` (panel, `overflow: hidden`) as its only child — children always go inside the panel. The existing [PhotoCarouselModal](src/core/CustomModals/PhotoCarouselModal/PhotoCarouselModal.tsx) delegates navigation to [SlideCarousel](src/core/SlideCarousel/SlideCarousel.tsx), which renders arrows inside the panel and keeps the current index internal to `useCarouselMovement`.

**Approach (confirmed with user): hybrid.** A minimal generic `outerContent` slot on the base `Modal` (mechanism) + a specific **`NavigationModal`** wrapper owning arrows/counter/keyboard nav (policy). **Controlled API** — parent owns the index (`activeIndex`, `totalItems`, `onNavigate`), since the parent needs it anyway to render the current item. **Mobile:** arrows hidden (fullscreen modal; consumers rely on swipe via SlideCarousel content), counter stays visible. **Scope:** new component + stories + specs only; no PhotoCarouselModal migration (but design must not preclude it).

## Implementation

### 1. Base Modal slot — [Modal.tsx](src/core/Modal/Modal.tsx) + [Modal.scss](src/core/Modal/Modal.scss)

Add to `Props` (lines 13–32): `outerContent?: React.ReactNode` — content rendered outside the panel but inside the overlay, positioned relative to the panel; clicks on it must not trigger outside-click close.

In the return block (lines 131–169), extract the existing `.modal-content` div into a `panel` const (unchanged), then:

- `outerContent === undefined` → render `panel` directly (**byte-identical DOM to today** — zero regression risk).
- otherwise wrap: `.modal-content-wrapper` (`position: relative`, fit-content flex, `height: max-content`, `max-width: 100%`) containing `panel` + `.modal-outer-content` (`position: absolute; inset: 0; pointer-events: none`, with `> * { pointer-events: auto }`, and `onClick={e => e.stopPropagation()}` mirroring the panel's own handler at lines 142–148).

Why a relative wrapper (not flex siblings or absolute-in-overlay): outer elements must track the *panel's* bounds — flex siblings would shift the panel off-center and can't sit *below* it; absolute against `.rc-modal` can't track the panel, whose vertical position varies with `modal-position-top|center`. The slot cannot live inside `.modal-content` because of its `overflow: hidden` ([Modal.scss:37](src/core/Modal/Modal.scss#L37)).

SCSS notes:
- `modal-position-center`: move the `margin: auto` scroll fix ([Modal.scss:102](src/core/Modal/Modal.scss#L102)) onto the wrapper when it exists (`.modal-content-wrapper { margin: auto; .modal-content { margin: 0 } }`).
- `modal-fullscreen`: wrapper gets `width: 100vw; height: 100vh` so `.modal-outer-content` overlays the fullscreen panel.
- `modal-position-bottom` selectors (lines 77–95) are descendant selectors — unaffected by the extra wrapper.

### 2. NavigationModal — new `src/core/Modal/NavigationModal/`

Lives beside the other generic wrappers (`ModalStepper/`, `ModalSplitView/`); `CustomModals/` is for product-specific modals. Files: `NavigationModal.tsx`, `NavigationModal.module.scss` (CSS modules — the newer convention), `NavigationModal.description.md`, `_NavigationModal.stories.tsx` + `stories/`, `_NavigationModal.spec.tsx`.

```ts
export type NavigationModalProps = Omit<ModalProps, 'outerContent'> & {
  /** 0-based index of the currently shown item. Controlled by the parent. */
  activeIndex: number;
  totalItems: number;
  /** Called with the new index when the user navigates (arrows or keyboard). */
  onNavigate: (newIndex: number) => void;
  /** Wrap around at the ends. Default false → arrows disabled at bounds. */
  loop?: boolean;
  /** ArrowLeft/ArrowRight navigation. Default true. */
  keyboardNavigation?: boolean;
  /** Default false. */
  hideCounter?: boolean;
};
```

Renders `<Modal modalPosition="center" {...modalProps} outerContent={...}>{children}</Modal>` (center default before the spread, so callers can override). The `outerContent`:

- **Arrows**: `Button type={ButtonTypes.muted} inverted rounded size={ButtonSizes.large} icon={IconNames.caretLeft|caretRight}` — the exact vocabulary of Modal's own close button ([Modal.tsx:156-163](src/core/Modal/Modal.tsx#L156-L163)); `inverted` (supported by `MutedButtonProps`, [Button.tsx:99-106](src/core/Button/Button.tsx#L99-L106)) for dark circular buttons on the backdrop. testIds `navigation-modal-prev|next`. Do **not** reuse SlideCarousel's `Arrow` (no `disabled` support, renders an `<a>`). Hidden when `totalItems <= 1`; `disabled` at bounds when not looping.
- **Counter**: pill below the panel, testId `navigation-modal-counter`, i18n via the library's `Text` replacement pattern: `<Text replacements={{ current: activeIndex + 1, total: totalItems }}>{'%current% of %total%'}</Text>` (falls back to the key — precedent: `ErrorImagesList.tsx`).

Positioning (`NavigationModal.module.scss`): `.arrow { position: absolute; top: 50%; transform: translateY(-50%) }`, `.arrowLeft { right: calc(100% + 24px) }` / `.arrowRight { left: calc(100% + 24px) }`; `.counter { top: calc(100% + 16px); left: 50%; transform: translateX(-50%) }`. Mobile: `@include media('<=mobile') { .arrow { display: none } }` (767px — matches `deviceService.isMobile()`), and under `:global(.rc-modal.modal-fullscreen)` hide arrows + move counter to `bottom: 16px` inside the panel.

**Keyboard**: add `useOnArrowKeyPress(handler, enabled)` to [use-on-escape-kye-press.tsx](src/custom-hooks/use-on-escape-kye-press.tsx), following its existing document-level keydown pattern (`useOnEscapeKyePress`, `useOnEnterKeyPress`); guard against `input`/`textarea`/`[contenteditable]` targets; `enabled=false` detaches the listener.

### 3. Exports

- [src/core/Modal/index.ts](src/core/Modal/index.ts): `export type { NavigationModalProps }` + `export { NavigationModal }` (alphabetical, after Modal entries).
- [src/index.ts](src/index.ts) `// Modals` block (lines 110–128): same pair via `'./core/Modal'`.
- ModalService convenience opener: **out of scope** (follow-up; `ModalService.open(<X/>, opts)` works today).

### 4. Stories (`stories/*.story.tsx` + aggregate, `SbDecorator` convention)

Demo via `ModalService.open()` like [PhotoCarouselModal's stories](src/core/CustomModals/PhotoCarouselModal/stories/Default.story.tsx) — an "Open modal" button; the opened component holds `useState(activeIndex)` and maps injected `close` → `onClose`. Stories with `play()` assertions:
1. **Default** — 5 slides, no loop: counter "1 of 5", prev disabled, next → "2 of 5".
2. **Looping** — prev at index 0 → "5 of 5".
3. **SingleItem** — no arrows, counter "1 of 1".
4. **WithSlideCarousel** — content `<SlideCarousel hasArrows={false} activeIndex={idx} onSlideChange={setIdx}>` synced with `activeIndex`/`onNavigate` — documents the mobile-swipe integration.

Cap story width (e.g. `maxWidth: 'calc(100vw - 160px)'`) so arrows aren't clipped by `.rc-modal { overflow-x: hidden }`.

### 5. Specs

`_NavigationModal.spec.tsx` — leading underscore is **mandatory** (spec project include is `**/_*.spec.{ts,tsx}`, [vitest.config.ts:59](vitest.config.ts#L59)). Follow [_Modal.spec.tsx](src/core/Modal/_Modal.spec.tsx) patterns (`render`/`appScreen`/`fireEvent` from `@test-utils/test-utils`, query by testId):
- next/prev clicks → `onNavigate(±1)`; disabled at bounds without loop; wrap-around with loop.
- keyboard ArrowRight/ArrowLeft (incl. `keyboardNavigation={false}` → inert).
- counter text "3 of 30"; hidden with `hideCounter`; arrows absent for `totalItems={1}`.
- clicking an arrow does NOT call `onClose`; overlay click does.

Also add a describe block to `_Modal.spec.tsx`: `outerContent` renders in `.modal-outer-content`; no `.modal-content-wrapper` when the prop is absent; outer-content click doesn't close.

## Verification

```bash
pnpm run lint
pnpm exec tsgo --project tsconfig.app.json
pnpm exec vitest run --project spec _NavigationModal
pnpm exec vitest run --project spec _Modal.spec        # base Modal regression
pnpm test                                              # storybook + spec projects
pnpm storybook                                         # visual check: Vanguard/Modal/NavigationModal
```

In Storybook, manually verify: arrows centered on panel, counter below, backdrop click closes, arrow click doesn't close, Esc still closes, keyboard nav, mobile viewport (arrows hidden, counter overlaid), `modal-position-top` vs `center`.

## Known limitations (acceptable for v1, note in description.md)

- Arrows clip when viewport < panel + ~80px per side (`.rc-modal` has `overflow-x: hidden`); consumers should cap `width`/`maxWidth`. Hidden ≤767px anyway.
- Panel taller than viewport: wrapper scrolls with the panel, so arrows/counter scroll too — fine for viewport-fit lightbox content.
- Arrow-key listeners are per-instance (not LIFO-stacked like `escStack`); two simultaneous NavigationModals would both navigate. Mirror escStack later if ever needed.

## Follow-ups (out of scope)

- Migrate `PhotoCarouselModal` / `ModalService.openPhotoGalleryModal` to NavigationModal (design supports it: SlideCarousel `hasArrows={false}` + `onSlideChange` sync).
- The details-sidebar preview from the screenshot (needs new fields — `MediaItemFile` has no `description`/`model`).
