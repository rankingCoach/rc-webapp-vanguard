# Button focus ring and corner shape: request for the webapp team (VAN-85)

**For:** the rc-webapp palette generator (`html/theming/default-theme.scss`), which produces `theming/*/…min.css` and
every brand/white-label theme.
**Goal:**
1. a visible keyboard focus ring on default, primary, secondary and shimmer buttons;
2. a per-theme switch for the new squircle button corners, so resellers with a large border radius can keep round
   corners.

**Ordering:** non-blocking. Vanguard ships with fallbacks for both (below), so these tokens can land any time. Set
`--button-corner-shape` for large-radius reseller themes **before** they pick up the Vanguard release (see 2.4).

| # | Token | Type | Vanguard fallback |
|---|---|---|---|
| 1 | `--button-{default,primary,secondary,shimmer}-focus-outline-color` | colour | `--button-<type>-focus-box-shadow-color` |
| 2 | `--button-corner-shape` | `corner-shape` value (not a colour) | `superellipse(1.3)` |

---

## 1. Focus ring colour

### 1.1 Why

VAN-85 moves the focus ring of every button type to a 2px `outline` with a 2px offset (as muted already does). The
ring now sits on the page background instead of hugging the button fill. It currently reads
`--button-<type>-focus-box-shadow-color` = `--fn-bg-hov-p-gl` (`--p200`, `#b8d9ff` light / `#000335` dark), which is
about 1.4:1 against white, below the 3:1 WCAG non-text contrast target. In dark mode the navy ring is almost
invisible on the dark page.

Vanguard reads a new token first and falls back to the old one:

```scss
outline: 2px solid var(--button-<type>-focus-outline-color, var(--button-<type>-focus-box-shadow-color));
```

### 1.2 Requested tokens

Same naming as the muted set (`--button-muted-focus-outline-color`), with the usual `-rgb` companions:

```css
:root {
  --button-default-focus-outline-color: #0062ff;   /* or the generator's primary 500/600 */
  --button-primary-focus-outline-color: #0062ff;
  --button-secondary-focus-outline-color: #0062ff;
  --button-shimmer-focus-outline-color: #0062ff;
}
```

Suggested source: the same value as `--button-muted-focus-outline-color` (`#0062ff`, from VAN-83), so every button
type shares one ring colour. In dark mode it must stay ≥ 3:1 against the dark page background (e.g.
`light-dark(#0062ff, #5c9dff)`). Also add `--header-button-*-focus-outline-color` aliases next to the existing
`--header-button-secondary-focus-box-shadow-color` alias, if header buttons should follow.

### 1.3 Keep / remove

- Keep `--button-*-focus-box-shadow-color`: it stays the fallback and is overridden in the app (below).
- Nothing to remove.

### 1.4 App follow-ups once the tokens exist

Files that override the old ring token for primary buttons must also override the new one, or their custom colour
stops applying:

- `html/react/src/components/partner/ResellerAccounts/DeleteAccountModal.module.scss:15`
- `html/react/src/components/partner/ResellerAccounts/BulkDeleteAccountsModal.module.scss:41`
  (use an opaque colour, e.g. `var(--e500)`; a 35% colour reads faint as an offset outline)
- `html/react/src/components/ai-conversations/widgets/mobile/MobileAppInviteConversationWidget/_mobile-app-invite-tokens.scss:62`

---

## 2. Corner shape

### 2.1 Why

VAN-85 gives buttons squircle corners (`corner-shape: superellipse(1.3)`). It works well on the default 4px radius,
where it is subtle. Some resellers set a much larger `--buttons-border-radius`, and there the squircle gets too
strong: the corners turn visibly boxy. Those themes need to keep plain round corners.

Vanguard reads the token and falls back to the squircle:

```scss
.button {
  border-radius: var(--buttons-border-radius, 4px);
  corner-shape: var(--button-corner-shape, superellipse(1.3));
}
```

### 2.2 Requested token

```css
:root {
  /* Corner shape of every button type. Default theme: the squircle from VAN-85. */
  --button-corner-shape: superellipse(1.3);
}

/* Reseller themes with a large button radius: keep round corners */
:root {
  --buttons-border-radius: 16px;
  --button-corner-shape: round;
}
```

**Value rules (it is not a colour):**
- Emit the value as is: a keyword (`round`, `squircle`) or `superellipse(<number>)`. `round` = `superellipse(1)`,
  higher numbers are squarer.
- No `-rgb` companion, no `light-dark()`, no `.color-*` / `.bg-color-*` utility classes.
- It sits next to `--buttons-border-radius` in the generator, because the two are chosen together.

**Which value per theme (decided 2026-10-21: 8px threshold):**

| `--buttons-border-radius` | `--button-corner-shape` |
|---|---|
| up to 8px (default theme: 4px) | `superellipse(1.3)` |
| more than 8px | `round` |

If the generator knows each theme's radius, it can derive the shape with that rule; otherwise set it per reseller
theme.

### 2.3 What it does and does not affect

- All button types (default, primary, secondary, shimmer, muted), including icon-only buttons. The muted glass
  layers follow the button's shape.
- **Not** `rounded` buttons (`shape="round"`): they are pills and circles and always stay `round`, whatever the token.
- Only Chromium 139+ draws `corner-shape`. Firefox and Safari ignore it and show the plain border radius, so the token
  makes no difference there.

### 2.4 Rollout

1. Add `--button-corner-shape: superellipse(1.3)` to the default theme (optional: the fallback already gives that).
2. Add `--button-corner-shape: round` to every reseller theme whose `--buttons-border-radius` is above the
   threshold, **before** those themes run the Vanguard release with VAN-85. Otherwise their buttons go squircle in
   Chrome/Edge until the theme catches up.
3. Nothing to remove.
