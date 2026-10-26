# Default button theme update: request for the webapp team (VAN-85)

**For:** the rc-webapp palette generator (`html/theming/default-theme.scss`), which produces `theming/*/…min.css`,
the email theme templates and every brand/white-label theme.
**Goal:** the Vanguard `default` button is transparent at rest, with a light translucent fill on hover (the mock's ghost
button). Light scheme only; dark mode is not supported yet.
**Status:** approved by design (2026-10-21). The `meditrend` brand override is handled separately, as webapp step W7.
**No new tokens.** Two existing values change, and two readers that inherit them get decoupled first.

---

## 1. Decouple first: the readers that must keep a white button

Both readers below inherit `--button-default-background-color` today. Decouple them **before or in the same build** as
the value change in section 2.

| Reader | Today | Change |
|---|---|---|
| Email buttons (87 generated `app/templates/Email/Common/templates/theming/*.mjml.twig`) | `default-theme.scss:283-285`: `--email-button-default-bg` and `--email-button-default-border` alias `--button-default-background-color` | Alias both to `--fn-bg` directly, then regenerate. `--email-button-default-fg` can keep aliasing the text colour. |
| Legacy `.btn.btn-default` (42 PHP views under `application/views/`) | `html/vanguard/src/styles/components/_buttons.scss:163` uses `buttonProps(default)`, compiled into `html/vanguard/styles/vanguard.css` | After the mixin, set `background-color: var(--fn-bg)` at rest and `var(--fn-bg-var)` on hover. Or check the views and accept the ghost look. |

## 2. Change two values

```scss
// default-theme.scss, $buttons
--button-default-background-color: transparent,                      // was --fn-bg (white)
--button-default-hover-background-color: rgba(185, 197, 216, 0.12),   // was --fn-bg-var (#f6f9fc)
```

- The hover value is the mock's `--button-ghost-hover` (`tmp/ado hub/src/styles/tokens.css:156`). It is translucent so it
  works on grey and coloured surfaces, where the opaque `#f6f9fc` would look like a hole.
- Translucent values get no meaningful `-rgb` companion. Vanguard does not read `--button-default-background-color-rgb`
  or `--button-default-hover-background-color-rgb`. Drop them, or keep the generator's output. Either way, nothing
  reads them.
- Every other `--button-default-*` token is unchanged.

## 3. Nothing else

- The Ado colour for the Needs-you row action needs **no** theme token. Vanguard maps a typed `textColor="ado"` prop to
  the existing `--ado-base` and derives the hover colour itself.
- `--button-default-border-color` stays undefined, so the default button keeps having no border.
