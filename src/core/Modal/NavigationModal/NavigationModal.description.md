# NavigationModal

Lightbox-style modal for paging through a collection (e.g. a media gallery preview). The prev/next arrows and the "N of M" counter render **outside** the modal panel — arrows vertically centered on the backdrop at the left/right of the panel, counter centered below the panel.

## Controlled API

The parent owns the navigation state and renders the current item as `children`:

```tsx
const [index, setIndex] = useState(0);

<NavigationModal
  activeIndex={index}
  totalItems={gallery.length}
  onNavigate={setIndex}
  onClose={close}
>
  <MediaPreview item={gallery[index]} />
</NavigationModal>;
```

- `loop` — wrap around at the ends; without it, the arrows are disabled at the bounds.
- `keyboardNavigation` — ArrowLeft/ArrowRight navigation (default `true`). Key presses are ignored while typing in inputs/textareas/contenteditable elements.
- `hideCounter` — hide the "N of M" counter.
- Arrows are hidden automatically when `totalItems <= 1`.
- All other `Modal` props (`onClose`, `width`, `maxWidth`, `modalPosition`, ...) pass through; `modalPosition` defaults to `center`.

## Mobile / fullscreen

On mobile the modal is fullscreen, so there is no "outside": the arrows are hidden and the counter overlays the bottom of the panel. Pair the content with a swipeable component so navigation stays possible — e.g. `SlideCarousel` with `hasArrows={false}`, syncing `activeIndex`/`onSlideChange` with the modal's `activeIndex`/`onNavigate`.

## Notes

- Content should be sized to fit the viewport (cap `width`/`maxWidth`); a panel taller than the viewport scrolls together with the arrows/counter.
- Arrow-key listeners are per-instance: avoid mounting two NavigationModals at once.
