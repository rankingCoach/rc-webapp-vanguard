# Button focus ring colour: request for the webapp team (VAN-85)

**For:** the rc-webapp palette generator (`html/theming/default-theme.scss`), which produces `theming/*/…min.css` and
every brand/white-label theme.
**Goal:** a visible keyboard focus ring on default, primary, secondary and shimmer buttons.
**Ordering:** optional and non-blocking. Vanguard ships with a fallback (below); these tokens can land any time.

---

## Why

VAN-85 moves the focus ring of every button type to a 2px `outline` with a 2px offset (as muted already does). The
ring now sits on the page background instead of hugging the button fill. It currently reads
`--button-<type>-focus-box-shadow-color` = `--fn-bg-hov-p-gl` (`--p200`, `#b8d9ff` light / `#000335` dark), which is
about 1.4:1 against white, below the 3:1 WCAG non-text contrast target.

Vanguard reads a new token first and falls back to the old one:

```scss
outline: 2px solid var(--button-<type>-focus-outline-color, var(--button-<type>-focus-box-shadow-color));
```

## Requested tokens

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

## Keep / remove

- Keep `--button-*-focus-box-shadow-color`: it stays the fallback and is overridden in the app (below).
- Nothing to remove.

## App follow-ups once the tokens exist

Files that override the old ring token for primary buttons must also override the new one, or their custom colour
stops applying:

- `html/react/src/components/partner/ResellerAccounts/DeleteAccountModal.module.scss:15`
- `html/react/src/components/partner/ResellerAccounts/BulkDeleteAccountsModal.module.scss:41`
  (use an opaque colour, e.g. `var(--e500)`; a 35% colour reads faint as an offset outline)
- `html/react/src/components/ai-conversations/widgets/mobile/MobileAppInviteConversationWidget/_mobile-app-invite-tokens.scss:62`
