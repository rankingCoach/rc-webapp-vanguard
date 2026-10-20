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
  --ado-text: light-dark(#006a85, #7fcde3);
  --ado-text-rgb: 0, 106, 133;
}

/* Dark-scheme blocks (both [data-color-scheme=dark] and the prefers-color-scheme: dark one) */
--ado-text-rgb: 127, 205, 227;
```

- **Light:** the same as `--ado-base`. On the 12% fill over white (≈ `#e0edf0`) it measures ≈ 5.2:1, which passes AA
  for the badge's 11px bold text.
- **Dark:** a light tint of the Ado hue. `#006a85` on a 12% teal over the dark surface is far below 4.5:1. The value
  above is a suggestion (≈ `oklch(from var(--ado-base) 0.8 0.08 h)`), so please let design confirm it.
- For other brands and white labels, derive the token from that theme's `--ado-base`:
  - light: the base itself, or darker if the base is light
  - dark: a high-lightness tint of the same hue
  - in both cases, ≥ 4.5:1 against a 12% base fill on that scheme's surface
- Generate the `-rgb` companion and the `.color-*` / `.bg-color-*` utility classes as usual for solid colours.

## 2. Not needed

- No fill token. Vanguard computes the 12% fill from `--ado-base` with `color-mix()` inside the component.
- No removals.
