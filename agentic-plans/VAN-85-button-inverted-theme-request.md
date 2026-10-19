# Inverted primary & shimmer button theme tokens: request for the webapp team (VAN-85)

**For:** the rc-webapp palette generator, which produces `theming/*/…min.css` and every brand/white-label theme.
**Goal:** the Vanguard `primary` and `shimmer` buttons get an `inverted` option: a white button for dark or coloured
surfaces such as the recommended card.
**Ordering:** not blocking. Vanguard already ships with fallbacks equal to the values below, so the tokens can land
before or after the Vanguard release. Nothing is removed.

---

## 1. Read this first: the face colour

The design prototype (`tmp/ado hub/src/styles/tokens.css`) calls Ado's face colour `--ado-face-start`. The generated
theme calls it **`--ado-face-gradient-start`** (`#00495d` in `direct-channel`). The values below refer to the
generated name. Please don't add an `--ado-face-start` alias for this.

Unlike the muted hover tokens, `…-hover-background-color` here is **the final hover colour**, not a layer on top of the
rest fill. The inverted primary/shimmer button has a single fill.

---

## 2. Target values

The values are the same in both colour schemes. The button sits on its own dark surface, not on the page background,
so it doesn't need `light-dark()`.

```css
:root {
  /* Primary inverted: white button on dark / coloured surfaces (recommended card) */
  --button-primary-inverted-background-color: #ffffff;
  --button-primary-inverted-background-color-rgb: 255, 255, 255;
  --button-primary-inverted-hover-background-color: color-mix(in srgb, #fff 88%, var(--ado-face-gradient-start));
  --button-primary-inverted-text-color: var(--ado-face-gradient-start);
  --button-primary-inverted-focus-outline-color: #ffffff;
  --button-primary-inverted-focus-outline-color-rgb: 255, 255, 255;

  /* Shimmer inverted: the same button, plus the colour of the sweep band running over the white fill */
  --button-shimmer-inverted-background-color: #ffffff;
  --button-shimmer-inverted-background-color-rgb: 255, 255, 255;
  --button-shimmer-inverted-hover-background-color: color-mix(in srgb, #fff 88%, var(--ado-face-gradient-start));
  --button-shimmer-inverted-text-color: var(--ado-face-gradient-start);
  --button-shimmer-inverted-sweep-color: color-mix(in srgb, #fff 88%, var(--ado-face-gradient-start));
  --button-shimmer-inverted-focus-outline-color: #ffffff;
  --button-shimmer-inverted-focus-outline-color-rgb: 255, 255, 255;
}
```

Notes for the generator:

- **Text colour.** It references `var(--ado-face-gradient-start)` so that it follows each brand's Ado colour. If the
  generator can only emit literals, emit the resolved `--ado-face-gradient-start` value of that theme (e.g. `#00495d`),
  plus a `-text-color-rgb` companion.
- **Hover and sweep colours.** These are `color-mix()` values (12% face colour into white). For `direct-channel` they
  resolve to about `#e0e9ec`. They get no `-rgb` companion and no `.color-*` / `.bg-color-*` utility classes, the same
  as other non-literal values.
- **Disabled.** No tokens: Vanguard fades the inverted button to 40% opacity itself.
- **Dark-scheme blocks.** No overrides are needed.

---

## 3. What Vanguard reads, and the fallbacks it uses until then

| Token | Vanguard fallback |
|---|---|
| `--button-{primary,shimmer}-inverted-background-color` | `#fff` |
| `--button-{primary,shimmer}-inverted-hover-background-color` | `color-mix(in srgb, #fff 88%, var(--ado-face-gradient-start, #00495d))` |
| `--button-{primary,shimmer}-inverted-text-color` | `var(--ado-face-gradient-start, #00495d)` |
| `--button-{primary,shimmer}-inverted-focus-outline-color` | `#fff` |
| `--button-shimmer-inverted-sweep-color` | the hover colour above |

## 4. Not part of this request

`--ado-text` (in the prototype) isn't used by this change.
