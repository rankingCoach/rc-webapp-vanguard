# VAN-85 · Button labels clipped at the top and bottom

Jira: https://rankingcoach.atlassian.net/browse/VAN-85

Report: an extra-large muted button labelled "Încarcă" loses the circumflex on the Î. Descenders (g, j, p, y) and
diacritics (Î, Ș, Ț, Ä) are affected.

## Cause: a VAN-85 regression

`.button-text` has `overflow: hidden` (needed for the ellipsis), so anything outside its line box is cut.

| Release | Label line-height | Clipped? |
|---|---|---|
| ≤ 2.3.0, every type | `calc(var(--label-height) + 7px)`, so 23px | No |
| 2.4.0, default / primary / secondary / shimmer | same 23px | No |
| 2.4.0, muted (redesign) | per-size `line-height: 16px` | Yes, on large and extraLarge |
| `feature/VAN-85` after 2eed48f, every type | `var(--label-height)`, so 16px | Yes, on large and extraLarge |

`2eed48f feat(button): share one size set across every button type` moved every type onto the muted size set and
replaced the shared `+ 7px` with `line-height: var(--label-height)`. The 2.4.0 muted buttons already had the problem
(the webapp's installed `2.3.0-release-tabs-and-buttons-redesign.313` build has the same `1rem` muted line-heights, which
is where the screenshot comes from); VAN-85 spread it to every type.

### Measured (Storybook, Chromium, real Inter Medium, label "Încarcă gjpy ȘȚÄ")

Ink room inside the label's clip box, in px (negative = clipped). It's the same for every type, because the label rules
are shared, and the same on mobile and desktop, because the sizes only change `--padding-y`.

| size | text | 16px line box (before) | 23px line box (fix) |
|---|---|---|---|
| small / medium | 12px | +1.2 / +1.1 | +4.7 / +4.6 |
| large | 14px | +0.3 / **−0.8** | +3.8 / +2.7 |
| extraLarge | 16px | **−1.1 / −1.3** | +2.4 / +2.2 |

The button height and the baseline position are identical with both line-heights on every type × size, so restoring
the 23px line box has no layout effect.

## Fix: restore the 2.4.0 line-height

```scss
.button-text,
.button-icon {
  line-height: calc(var(--label-height) + 7px);
}
```

This is the rule every non-muted button shipped with up to 2.4.0. The button height is computed from `--label-height`
(`calc(2 * var(--padding-y) + var(--label-height))`), not from the label, so the label box is 7px taller than the
content box and overflows into the padding evenly. The baseline doesn't move. `textWrap="wrap"` keeps its own 20px
leading with the -2px margin, as before; its first and last lines have +0.9 / +0.7px of room at extraLarge.

Rejected alternatives (a Fable review compared them in Chrome 152 and Safari 18.6):
- `padding-block` on the label with an equal negative `margin-block`: works, but it adds a magic number and two
  declarations to undo one change from 2eed48f.
- `overflow-x: clip; overflow-y: visible`: Chrome doesn't draw `text-overflow: ellipsis` when the inline axis uses
  `clip`, and `Button Truncate` fails.
- `overflow-x: hidden; overflow-y: visible`: the browser turns `visible` into `auto`, so the label still clips and
  becomes a scroll container.
- `overflow: clip` with `overflow-clip-margin`: not supported in Safari or iOS.
- `text-box-trim`, `clip-path`, `contain`: none of these can make the clip box bigger.

## 1. Is it breaking? Does it need the theme?

- **Not breaking.** It restores the 2.4.0 rule. Heights, widths and baselines are unchanged.
- **No theme change.** `--buttons-typeface` is `'Inter', sans-serif` in both the Storybook theme and the webapp's
  generated CSS, and no theme line-height token is involved.

## 2. Webapp sweep (`rc-webapp/html/react/src`)

Nothing in the webapp cancels the fix, and nothing works around vertical glyph clipping. No rule overrides
`--label-height`, `--text-size` or `--letter-spacing`, and no `style`/`sx` sits on a `<Button>`.

| Where | Rule | Interaction |
|---|---|---|
| `upsellings/.../SpaceshipUpsellCard/SpaceshipUpsellCard.module.scss:63-79` | `--padding-y` on the CTA; `span.paragraph { font-size: 1rem; line-height: 1.25rem }` (wins over Vanguard's line-height) | That label keeps a 20px box, which fits 16px Inter (+0.9 / +0.7). No change. |
| `ai-conversations/.../LogoGalleryConversationWidget.module.scss:42-52` | `button { height: auto }`, `button * { white-space: normal; overflow: visible; text-overflow: clip !important }` | Doesn't clip at all. No change. |
| `presence/GBP/GoogleBusinessProfileCreateNotInPlanNotice.module.scss:36-43` | ≤480px: `button { height: auto }`, label `white-space: normal !important` | Wraps with the 23px line-height, as on 2.4.0. |
| `upsellings/.../UpsellingCard/UpsellingCard.module.scss:23-40` | font-size, line-height and padding on the `<button>` | Vanguard sets the label's own values, so these don't reach it. None. |
| `ai-extensions/AIExtensionsTrigger.module.scss:6-27`, `AgentConversationsList.module.scss:101`, `ResellerOverviewDashboard.scss:9`, `BundleBadge.module.scss:85`, `LocationSummaryPageHeaderLogo.module.scss:56`, `FineTuningServicesModalAdd.tsx:167` | `--padding-y`, height or padding on the button | Button-level only. None. |

No workarounds need to be removed after the release.

## Tests

- Storybook now loads Inter. Until now the Inter `@font-face` rules were stripped by
  `.storybook/vite-plugin-missing-assets.ts`, so every story rendered in a system fallback font. The three
  `Inter-*.woff2` files (and the OFL licence) are now served from `public/vanguard/assets/fonts`, like Crimson Pro.
- Story `Button/Label Glyphs` (`stories/ButtonLabelGlyphs.story.tsx`) shows "Încarcă gjpy ȘȚÄ" on every type × size,
  plus inverted primary and shimmer, the muted blurred, onDark, inverted and inverted + onDark buttons, an icon button,
  and both wrap types. The play test checks four things:
  - Inter is actually loaded;
  - each button keeps its height from the size matrix (mobile or desktop);
  - `scrollHeight <= clientHeight` (this only catches the bug in Chromium; Safari reports equal heights while clipping);
  - the drawn text (canvas `measureText` bounds placed on the baseline) fits inside the label's box.
- With the 16px line-height the play test fails; with the 23px line-height it passes.
- Known gap: the wrap variants hold a single line, so the first and last lines of a label that really wraps aren't
  covered.
