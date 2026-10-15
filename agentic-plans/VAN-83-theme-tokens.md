# VAN-83 — Theme changes required for the muted button

**For:** theme team (rc-webapp palette generator → `theming/*/…min.css` and every brand/white-label theme)
**Blocking:** must ship in the themes **before** the Vanguard release that contains VAN-83.
**Source:** design PRD "Muted button and muted inverted + onDark" (linked in VAN-83).

## Context

The Vanguard muted button (`<Button type={ButtonTypes.muted} />`) was reworked:

- The fill is now a separate, **blended** layer (`mix-blend-mode`) instead of a flat background with a hover ripple.
- New surface flag `onDark`, which combines with the existing `inverted` into four variants: **default**, **onDark**, **inverted**, **inverted + onDark**.
- Focus is now a 2px **outline** (not a box-shadow). Disabled is 40% opacity on the fill and content (no colour tokens).
- Text no longer changes colour on hover or when disabled.

The button reads only the 16 tokens listed in sections 1 and 2 below. It keeps the spec values as a safety-net fallback, but
**every theme must define all 16** so brands can customise them.

Naming follows the existing pattern: `--button-muted[-on-dark|-inverted|-inverted-on-dark]-[<state>-]<property>`.
Like the other button tokens, solid colours get the usual `-rgb` companion and the `.color-*` / `.bg-color-*`
utility classes. The rgba fills and the two blend modes get neither.

## 1. Existing tokens: change these values

| Token | Current value | New value |
|---|---|---|
| `--button-muted-background-color` | `light-dark(rgba(1, 4, 11, 0.02), rgba(255, 255, 255, 0.3))` | `rgba(185, 197, 216, 0.25)` |
| `--button-muted-hover-background-color` | `light-dark(rgba(1, 4, 11, 0.02), rgba(255, 255, 255, 0.3))` | `rgba(185, 197, 216, 0.4)` |
| `--button-muted-inverted-background-color` | `light-dark(rgba(255, 255, 255, 0.1), rgba(24, 33, 47, 0.1))` | `rgba(255, 255, 255, 0.18)` |
| `--button-muted-inverted-hover-background-color` | `light-dark(rgba(255, 255, 255, 0.1), rgba(24, 33, 47, 0.1))` | `rgba(255, 255, 255, 0.28)` |

These two existing tokens are still used, with **no value change**:

| Token | Value |
|---|---|
| `--button-muted-text-color` (+ `-rgb`) | `light-dark(#263349, #f6f9fc)` |
| `--button-muted-inverted-text-color` (+ `-rgb`) | `#ffffff` |

## 2. New tokens to add

| Token | Value | Meaning |
|---|---|---|
| `--button-muted-blend-mode` | `multiply` | How the default/onDark fill mixes with the surface behind it. `multiply` only darkens. **Not a colour.** |
| `--button-muted-focus-outline-color` (+ `-rgb`) | `#0062ff` | Focus ring, default muted. |
| `--button-muted-on-dark-text-color` (+ `-rgb`) | `#ffffff` | Text and icon, `onDark`. |
| `--button-muted-on-dark-background-color` | `rgba(185, 197, 216, 0.25)` | Resting fill, `onDark`. Same as default per spec; a separate token so a theme can raise it (PRD decision 11 suggests 80% on Ado's dark bubble). |
| `--button-muted-on-dark-hover-background-color` | `rgba(185, 197, 216, 0.4)` | Hover/pressed fill, `onDark`. |
| `--button-muted-on-dark-focus-outline-color` (+ `-rgb`) | `#ffffff` | Focus ring, `onDark`. |
| `--button-muted-inverted-blend-mode` | `plus-lighter` | How the inverted fill mixes with the surface behind it. `plus-lighter` only brightens. **Not a colour.** |
| `--button-muted-inverted-focus-outline-color` (+ `-rgb`) | `#ffffff` | Focus ring, `inverted`. |
| `--button-muted-inverted-on-dark-text-color` (+ `-rgb`) | `light-dark(#263349, #f6f9fc)` | Text and icon, `inverted + onDark` (dark `-rgb`: `246, 249, 252`). |
| `--button-muted-inverted-on-dark-focus-outline-color` (+ `-rgb`) | `#0062ff` | Focus ring, `inverted + onDark`. |

`inverted + onDark` reuses the `--button-muted-inverted-*` fills and blend mode. It has no fill tokens of its own.

## 3. Existing tokens to remove

Remove each token below together with its `-rgb` companion and its `.color-*` / `.bg-color-*` utility classes,
including the dark-theme `-rgb` overrides.

| Token | Why |
|---|---|
| `--button-muted-hover-text-color` | Text no longer changes on hover. |
| `--button-muted-disabled-text-color` | Disabled is now an opacity, not a colour. |
| `--button-muted-disabled-background-color` | Same. |
| `--button-muted-focus-box-shadow-color` | Replaced by `--button-muted-focus-outline-color`. |
| `--button-muted-ripple-background-color` | The ripple layer is gone. |
| `--button-muted-inverted-hover-text-color` | Text no longer changes on hover. |
| `--button-muted-inverted-disabled-text-color` | Disabled is now an opacity. |
| `--button-muted-inverted-disabled-background-color` | Same. |
| `--button-muted-inverted-focus-box-shadow-color` | Replaced by `--button-muted-inverted-focus-outline-color`. |

**Order matters:** remove these only in the theme that ships with (or after) the new Vanguard release. The current
Vanguard still reads them.

## Copy-paste block (`:root`)

```css
/* Muted button (VAN-83) */
--button-muted-text-color: light-dark(#263349, #f6f9fc);
--button-muted-text-color-rgb: 38, 51, 73;
--button-muted-background-color: light-dark(rgba(185, 197, 216, 0.25), rgba(255, 255, 255, 0.1));
--button-muted-hover-background-color: light-dark(rgba(185, 197, 216, 0.4), rgba(255, 255, 255, 0.1));
--button-muted-blend-mode: multiply;
--button-muted-focus-outline-color: #0062ff;
--button-muted-focus-outline-color-rgb: 0, 98, 255;

/* Muted onDark */
--button-muted-on-dark-text-color: #ffffff;
--button-muted-on-dark-text-color-rgb: 255, 255, 255;
--button-muted-on-dark-background-color: light-dark(rgba(185, 197, 216, 0.25), rgba(24, 33, 47, 0.25));
--button-muted-on-dark-hover-background-color: light-dark(rgba(185, 197, 216, 0.4), rgba(24, 33, 47, 0.4));
--button-muted-on-dark-focus-outline-color: #ffffff;
--button-muted-on-dark-focus-outline-color-rgb: 255, 255, 255;

/* Muted inverted */
--button-muted-inverted-text-color: #ffffff;
--button-muted-inverted-text-color-rgb: 255, 255, 255;
--button-muted-inverted-background-color: rgba(255, 255, 255, 0.18);
--button-muted-inverted-hover-background-color: rgba(255, 255, 255, 0.28);
--button-muted-inverted-blend-mode: plus-lighter;
--button-muted-inverted-focus-outline-color: #ffffff;
--button-muted-inverted-focus-outline-color-rgb: 255, 255, 255;

/* Muted inverted + onDark */
--button-muted-inverted-on-dark-text-color: light-dark(#263349, #f6f9fc);
--button-muted-inverted-on-dark-text-color-rgb: 38, 51, 73;
--button-muted-inverted-on-dark-focus-outline-color: #0062ff;
--button-muted-inverted-on-dark-focus-outline-color-rgb: 0, 98, 255;
```

Dark-scheme `-rgb` overrides (set in the dark-scheme blocks, since `light-dark()` cannot hold an rgb triplet):

```css
--button-muted-text-color-rgb: 246, 249, 252;
--button-muted-inverted-on-dark-text-color-rgb: 246, 249, 252;
```

## Dark-scheme values (as shipped in the regenerated theme)

| Token | Value |
|---|---|
| `--button-muted-background-color` | `light-dark(rgba(185, 197, 216, 0.25), rgba(255, 255, 255, 0.1))` |
| `--button-muted-hover-background-color` | `light-dark(rgba(185, 197, 216, 0.4), rgba(255, 255, 255, 0.1))` |
| `--button-muted-on-dark-background-color` | `light-dark(rgba(185, 197, 216, 0.25), rgba(24, 33, 47, 0.25))` |
| `--button-muted-on-dark-hover-background-color` | `light-dark(rgba(185, 197, 216, 0.4), rgba(24, 33, 47, 0.4))` |
| `--button-muted-inverted-on-dark-text-color` | `light-dark(#263349, #f6f9fc)` (dark `-rgb`: `246, 249, 252`) |

## Known bug (accepted)

**Default muted button has no visible fill or hover in the dark scheme.** The dark fill is white at 10% under
`multiply`, and multiplying by white leaves the surface unchanged. Rest and hover are also identical (`0.1`). So the
default pill shows only its label and icon in dark mode.

Suggested fix for a later theme release (verified in Storybook): in the `[data-color-scheme=dark]` and
`prefers-color-scheme: dark` blocks, set `--button-muted-blend-mode: plus-lighter`, and set the dark hover value to
`rgba(255, 255, 255, 0.18)`.

## How to verify

The Vanguard Storybook stories **Button → Button Muted Surface Matrix / States / Dark Theme** show every variant.
With the theme loaded, each muted button should report (light scheme):

| Variant | `::after` fill | blend | text | focus ring |
|---|---|---|---|---|
| default | `rgba(185,197,216,.25)` | multiply | `#263349` | `#0062ff` |
| onDark | `rgba(185,197,216,.25)` | multiply | `#ffffff` | `#ffffff` |
| inverted | `rgba(255,255,255,.18)` | plus-lighter | `#ffffff` | `#ffffff` |
| inverted + onDark | `rgba(255,255,255,.18)` | plus-lighter | `#263349` | `#0062ff` |
