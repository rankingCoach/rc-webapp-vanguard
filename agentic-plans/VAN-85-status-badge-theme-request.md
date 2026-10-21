# Ado text token: request for the webapp team (VAN-85)

**For:** the rc-webapp palette generator, which produces `theming/*/…min.css` and every brand/white-label theme.
**Goal:** a readable Ado-coloured label on Ado-tinted surfaces. The first consumer is Vanguard's
`<StatusBadge status="ado" />` (the webapp's "New" badge). The badge's text sits on
`color-mix(in srgb, var(--ado-base) 12%, transparent)`.
**Ordering:** independent. Vanguard already ships with a fallback (`var(--ado-text, var(--ado-base))`), so this token
can land before or after the Vanguard release.

---

## 1. New token

```css
:root {
  /* Ado label colour on Ado-tinted surfaces (e.g. a 12% --ado-base fill). */
  --ado-text: #006a85;
  --ado-text-rgb: 0, 106, 133;
}
```

**Decided (2026-10-21):** one value for light and dark, with no `light-dark()` and no dark-scheme override. The webapp
has no dark mode yet; revisit when it gets one.

- **Light:** the same as `--ado-base`. On the 12% fill over white (≈ `#e0edf0`) it measures ≈ 5.2:1, which passes AA
  for the badge's 11px bold text.
- For other brands and white labels, derive the token from that theme's `--ado-base`: the base itself, or darker if
  the base is light, so it stays ≥ 4.5:1 against a 12% base fill on white.
- Generate the `-rgb` companion and the `.color-*` / `.bg-color-*` utility classes as usual for solid colours.

## 2. Not needed

- No fill token. Vanguard computes the 12% fill from `--ado-base` with `color-mix()` inside the component.
- No removals.
