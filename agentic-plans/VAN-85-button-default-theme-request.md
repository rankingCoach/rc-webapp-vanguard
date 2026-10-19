# Default button theme update: request for the webapp team (VAN-85)

**For:** the rc-webapp palette generator (`html/theming/default-theme.scss`), which produces `theming/*/…min.css` and
every brand/white-label theme.
**Goal:** the Vanguard `default` button is transparent at rest (a "ghost" button, as in the `ado hub` mock), and it
gets an `accent` option whose text is Ado's colour, for the Needs-you row action.
**Ordering:** sections 2 and 3 are additive and can ship right away. Vanguard reads every new token with a fallback, so
nothing breaks while the theme lags behind. Nothing is removed.

---

## 1. Read this first: we are *not* asking to change `--button-default-background-color`

The obvious change, `--button-default-background-color: transparent`, would reach further than the React button:

| Reader | Where | Effect of `transparent` |
|---|---|---|
| Vanguard `Button type="default"` | React app | Wanted. |
| `--email-button-default-bg` / `--email-button-default-border` | `default-theme.scss`, `$email` map: both alias `--button-default-background-color` | Email default buttons lose their white fill and border colour. Email clients do not all handle transparent the same way. |
| `.btn.btn-default` | legacy compiled `html/vanguard/styles/vanguard.css`, loaded for the PHP views (`application/config/content/vanguard/clients.php`) | 42 legacy PHP views (`application/views/clients/jump/…`) change look at once. |

So instead, Vanguard stops reading `--button-default-background-color` for the rest state (the rest fill becomes
`transparent` in the component, which is a structural choice, not a brand colour) and reads the **new** tokens below for
the hover fill and the accent text. The existing `--button-default-*` tokens keep their values and keep serving the
email and legacy readers.

If you would rather flip `--button-default-background-color` itself, please first point the two email aliases at
`--fn-bg` directly and confirm the legacy `.btn-default` views are fine without a fill. Tell us and we will read the
existing token instead.

---

## 2. New: ghost hover fill

```css
:root {
  /* Default (ghost) button: the fill shown on hover/focus/press. Translucent so it works on any surface. */
  --button-default-ghost-hover-background-color: light-dark(rgba(185, 197, 216, 0.12), rgba(255, 255, 255, 0.08));
}
```

- Light value is the mock's `--button-ghost-hover` (`tmp/ado hub/src/styles/tokens.css`).
- The mock has no dark scheme. The dark value is our proposal (white 8%, a step below the muted button's white 10%);
  please confirm it with design.
- Translucent, so no `-rgb` companion and no `.color-*` / `.bg-color-*` utility classes.

Today the hover fill is `--button-default-hover-background-color` = `--fn-bg-var` (`#f6f9fc`), an opaque near-white.
On a transparent button over a grey or coloured surface that opaque patch would look like a hole, hence the new token.
`--button-default-hover-background-color` stays as it is (the legacy `.btn-default` reads it).

---

## 3. New: Ado's text colour, and the accent default-button tokens

### 3.1 `--ado-text` (palette)

The mock defines Ado's colour as text as the base with its lightness capped so it reads on white:

```css
--ado-text: oklch(from var(--ado-base) min(l, 0.5) c h);   /* #006a85 for the default base */
```

The webapp theme has `--ado-base` and its derived `--ado-*` colours, but no `--ado-text`. Please add it next to the
other `--ado-*` colours, computed at build time like the others. `oklchFrom()` takes a fixed lightness, so it needs a
`min(l, 0.5)` variant (or compute it in the generator). For the default base (`l = 0.4868`) it resolves to `--ado-base`
itself, `#006a85`, with `-rgb` `0, 106, 133`.

### 3.2 Button tokens (role, aliasing the palette)

Following the usual pattern (button tokens alias palette tokens), so a brand can retune the button without touching
Ado's palette:

```css
:root {
  --button-default-accent-text-color: var(--ado-text);          /* #006a85 */
  --button-default-accent-text-color-rgb: 0, 106, 133;
  --button-default-accent-hover-text-color: var(--ado-text);    /* the mock keeps the text colour on hover */
  --button-default-accent-hover-text-color-rgb: 0, 106, 133;
}
```

In the generator: `--button-default-accent-text-color: --ado-text`, `--button-default-accent-hover-text-color: --ado-text`.
Dark scheme: no change requested for now (the mock has no dark scheme). If design wants a lighter Ado text on dark
surfaces, it goes in these two tokens.

Hover fill, focus ring and disabled state are shared with the plain default button (section 2 and the existing
`--button-default-focus-box-shadow-color`, `--button-default-disabled-text-color`).

---

## 4. What Vanguard uses until the theme ships

| Token | Fallback in Vanguard |
|---|---|
| `--button-default-ghost-hover-background-color` | `rgba(185, 197, 216, 0.12)` |
| `--button-default-accent-text-color` | `var(--ado-text, var(--ado-base, #006a85))` |
| `--button-default-accent-hover-text-color` | the accent text colour above |

## 5. Not part of this request

- The mock's ghost button uses slate text (`--n900`); the Vanguard default button keeps its blue CTA text
  (`--button-default-text-color`). Changing that is a separate design decision.
