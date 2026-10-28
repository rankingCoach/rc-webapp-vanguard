# Ado styling spec: one-colour AiGlow, restyled shimmer button

## Context

This plan implements the rc-webapp handover
`~/Projects/rc-webapp/tmp/handoffs/2026-09-28-vanguard-ado-styling-spec/README.md` (r3, ready) in Vanguard. The
handover is based on the artifact "Ado styling spec" (https://claude.ai/artifact/A9a3Eq8sg6hmAkokampEKz, version
`1790597821-9982`).

- **Branch:** `release/modal-service-split` @ `1d26131`. This is the commit the handover checked, and the branch has not
  moved since. `git rev-list --count HEAD` = 259, the same as rc-webapp's pin
  `1.20.0-release-modal-service-split.259`.
- **Scope:** V1 and V2 are required. From V3, reduced motion is required and the parity options are optional. V4 is
  optional. This plan recommends shipping all four, because V3's options and V4 add no visual change by default.
- **Out of scope:** colour tokens, the chat window (background, WebGL, composer inset, shadow values), rc-webapp's call
  sites, and any new `ButtonTypes` member.

## 1. Handover checked against the spec

### 1.1 Matches the spec (verified)

| Item | Result |
|---|---|
| Glow formulas | Accent `oklch(from base 0.6471 0.247 calc(h - 10))`, light `oklch(from base 0.8771 0.1392 calc(h - 30))`. White is `oklch(from base 1 0 h)`, which is white for every base, so the literal white stays. Match. |
| Glow stop map | 0/55 % accent · 22/66/88 % base · 33.3/49/100 % light · 50 % white. Match. |
| Shimmer | 110°, all 9 stops (82/68/55/68/82 %), `260% 100%`, `repeat-x`, `162.5% 50%` → `0% 50%`, `6s linear infinite`, `filter 150ms ease`, `brightness(0.92)` under `(hover: hover)`, `animation: none` under reduced motion. Match, including the seam explanation and the 2/255 measurement. |
| Glow geometry table (§3.1) | Matches the spec's "Layers and motion (unchanged)" table: `inset: -2px`, `blur(6px)` / `blur(1px)`, opacity 1 / 0.4, z −10 / −1, `8.487deg`, `200% 200%`, 24 s animations, and no blend mode in the spec. |
| Chat windows | The spec's background by size, two-layer shadow and composer inset are all assigned to rc-webapp. Match. |
| Colour and contrast tables | Recomputed with sRGB → OKLab → OKLCH, sRGB clipping and WCAG luminance. **Every value matches.** `#006a85` → `oklch(0.4868 0.0909 223.33)`, which is the spec's value. Derived colours `#00ace7` / `#3df3f0` equal the spec's fallbacks. `#0062ff` and `#093c97` have hues 261.33° and 261.34°, so both derive `#008bff` / `#66e6ff`. |

### 1.2 Deliberate deviations from the spec (acceptable, keep)

1. **Fallback without relative colour syntax.** The spec's fallbacks are fixed hex values (`#00ace7`, `#3df3f0`),
   which are correct only for the teal base. The handover falls back to `var(--ai-base-color)`, which is correct for any
   base. As a result, older browsers see a glow of the base colour plus white, and a flat shimmer button.
2. **`background-image` instead of the `background` shorthand.** The theme's `background-color` (from `buttonProps`)
   keeps painting underneath the gradient.
3. **Label colour.** The spec's `color: #fff` becomes the theme's `--button-shimmer-text-color`. It is `white` in
   `.storybook/theming.css:490`, and the contrast table holds only if every host theme also uses white.
4. **Scope is wider than the spec.** The spec restyles Ado's primary buttons only. V2 restyles every
   `ButtonTypes.shimmer`, including 13 non-Ado AI features. The owner has accepted this (handover §3.2).

### 1.3 Corrections to the handover's Vanguard facts

These change the plan and should go back to rc-webapp in the §8 reply.

1. **A Storybook test will fail after V2, and the handover does not mention it.** The shimmer story is
   `src/core/Button/stories/ButtonTypeShimmer.story.tsx`; `_Button.stories.tsx` only re-exports it. Its `play` test
   asserts that `::before` has `content` and a `linear-gradient` background (`:36-39`), which is exactly what V2
   removes. The test must be rewritten (§3, step 4).
2. **`Button.spec.tsx` is not run by any vitest project.** The `spec` project includes only `**/_*.spec.{ts,tsx}`
   (`vitest.config.ts`), and `vitest run --project spec src/core/Button/Button.spec.tsx` reports "No test files found".
   The handover's gate "`Button.spec.tsx` still passing" therefore proves nothing. The real gate is the `storybook`
   project, which runs story `play` tests in Chromium.
3. **The existing `oklch(from …)` precedent is `src/core/PageSection/PageSection.module.scss:10-18`**, not AIOrb (AIOrb
   has only commented-out `hsl(from …)` lines). I compiled the proposed mixin, the `@supports` block and the
   `color-mix` stops with the repo's **Sass 1.62.1**, and they come out verbatim.
4. **Sass wiring.** `_mixins.scss` already has `@use "@styles/_ai_variables"`, and the namespace resolves to
   `ai_variables`. `Button.module.scss` loads `_mixins` through `@import`. Adding a second `@use` of `ai_variables` to
   `Button.module.scss` emits the `:root` block twice (checked by compiling). The shimmer body therefore stays in the
   `shimmerEffect` mixin in `_mixins.scss`, and the keyframes live in `Button.module.scss`.
5. **The WordPress build does not export `AiGlow`** (`src/index-wordpress.ts`), so no deprecation cycle is needed and
   `startColor` / `endColor` are removed outright. That build does export `Button`, so it gets the new shimmer look.
6. **The spec's `transition: filter 150ms ease` would replace `.button`'s `transition: all 200ms ease-in-out`**
   (`Button.module.scss:88`), and the shimmer would lose its colour, border and focus-ring transitions. The plan uses
   `transition: all $transitionTime ease-in-out, filter 150ms ease` instead. `filter` still gets the spec's 150 ms ease,
   and every other property keeps today's timing.
7. **V4 has two sites.** `Modal.scss:47` and `Modal.scss:119` (`.modal-position-bottom .modal-content`) both use
   `var(--shadow-large)`.
8. **How the changelog works on this line.** `CHANGELOG.md` is generated by `standard-version` (`.versionrc.cjs`, only
   `feat` / `fix` are shown) when master is released. None of the 7 prerelease commits on this branch edit it by hand. The
   "changelog entries" of handover §6.2 are therefore conventional commit messages with a `BREAKING CHANGE:` footer
   (§6).
9. **Gap on the rc-webapp side, not Vanguard's.** The spec sets `--ai-glow-radius: 30px` on the Ask input, and the
   handover does not mention it. Vanguard's default `borderRadius` is 24, the same as the spec's default, so rc-webapp
   should pass `borderRadius={30}` on the composer.

## 2. V1: AiGlow takes one colour (required, breaking)

### 2.1 `src/styles/_ai_variables.scss`: shared derivation mixin

Add the mixin after the `:root` block. The `:root` definitions of `--ai-start-color`, `--ai-start-color-lighter` and
`--ai-end-color` stay untouched, because `Text.scss:198` (`mark`) and rc-webapp's landing page still use them.

```scss
// Colours derived from the --ai-base-color of the element this is included on: each has a fixed OKLCH lightness and
// chroma and takes its hue as an offset from the base hue. Declared on the element itself (never on :root), so an
// element whose --ai-base-color differs from the theme's derives from its own base.
// Without relative colour syntax (Chrome < 119, Safari < 18, Firefox < 128) both fall back to the base.
@mixin aiDerivedColors {
  --ai-glow-accent-color: var(--ai-base-color);
  --ai-glow-light-color: var(--ai-base-color);

  @supports (color: oklch(from red l c h)) {
    --ai-glow-accent-color: oklch(from var(--ai-base-color) 0.6471 0.247 calc(h - 10));
    --ai-glow-light-color: oklch(from var(--ai-base-color) 0.8771 0.1392 calc(h - 30));
  }
}
```

The names are final unless review objects: `aiDerivedColors`, `--ai-glow-accent-color`, `--ai-glow-light-color`.

### 2.2 [AiGlow.tsx](../src/core/AiGlow/AiGlow.tsx)

- Remove `startColor` and `endColor` from `AiGlowProps` (`:11-12`), from the destructure (`:18`) and from the inline
  style (`:25-26`).
- Keep writing `baseColor` as `--ai-base-color`, so children such as rc-webapp's send button inherit it.
- Add a JSDoc line to `baseColor`: "The glow's only colour; the other stops are derived from it. Defaults to the
  inherited `--ai-base-color`."

### 2.3 [AiGlow.module.scss](../src/core/AiGlow/AiGlow.module.scss)

- In `.grad`, add `@include ai_variables.aiDerivedColors;`. The file already has `@use "@styles/ai_variables"`.
- Change the stops at `:32-40`: 0 % and 55 % become `var(--ai-glow-accent-color)`; 33.3 %, 49 % and 100 % become
  `var(--ai-glow-light-color)`. The 22 %, 66 % and 88 % base stops and the 50 % white stop stay as they are.

### 2.4 Stories

- `stories/WithColors.story.tsx` and `stories/WithBlurWidth.story.tsx`: remove the `startColor` / `endColor` args and
  assertions. Keep `baseColor`. Add assertions that `--ai-start-color` / `--ai-end-color` are **not** set inline
  (`glowContainer.style.getPropertyValue(...) === ''`), and that
  `getComputedStyle(glowContainer).getPropertyValue('--ai-glow-light-color')` contains the base colour. This works
  because Chromium returns the substituted token stream `oklch(from #ff4500 …)`.
- `stories/TwoAiGlowComponents.story.tsx`: remove `startColor` / `endColor`. Assert that each container's computed
  `--ai-glow-accent-color` contains **its own** base. This covers the acceptance item "two glows each derive from their
  own base".
- New `stories/DerivedFromBase.story.tsx`: four glows side by side, `#006a85`, `#0062ff`, `#3920c8` and one without
  `baseColor` (theme). Each has a caption with the expected accent and light hex values from the handover table. The
  `play` test asserts four containers, and that the first three derive from their own base.
- [_AiGlow.stories.tsx](../src/core/AiGlow/_AiGlow.stories.tsx): remove the `startColor` / `endColor` argTypes
  (`:42-49`), update the `baseColor` description, and register `DerivedFromBase`.

## 3. V2: restyle `ButtonTypes.shimmer` (required)

The public API does not change: `ButtonTypes.shimmer`, `.button-shimmer`, the props, the size union, the radius
(`calc(var(--border-radius) * 3)`) and the `--button-shimmer-*` tokens all stay.

### 3.1 [_mixins.scss](../src/styles/_mixins.scss): replace `shimmerEffect` (`:23-62`), delete `fadeGradient1/2` (`:64-98`)

The two keyframes have no other user. `Switch.scss` imports `_mixins`, so today it also emits them as global keyframes,
and those go away too.

```scss
// Ado shimmer: a 110° gradient in --ai-base-color with a band of the derived light colour sweeping across it.
// The image is 260% wide, so moving it by 162.5% is exactly one repeat and the loop has no seam.
// The including stylesheet must define `@keyframes adoShimmer` (CSS Modules rename keyframes per file).
@mixin shimmerEffect($duration: 6s) {
  @include ai_variables.aiDerivedColors;

  background-image: linear-gradient(
    110deg,
    var(--ai-base-color) 0%,
    var(--ai-base-color) 20%,
    color-mix(in oklch, var(--ai-base-color) 82%, var(--ai-glow-light-color)) 34%,
    color-mix(in oklch, var(--ai-base-color) 68%, var(--ai-glow-light-color)) 44%,
    color-mix(in oklch, var(--ai-base-color) 55%, var(--ai-glow-light-color)) 50%,
    color-mix(in oklch, var(--ai-base-color) 68%, var(--ai-glow-light-color)) 56%,
    color-mix(in oklch, var(--ai-base-color) 82%, var(--ai-glow-light-color)) 66%,
    var(--ai-base-color) 80%,
    var(--ai-base-color) 100%
  );
  background-size: 260% 100%;
  background-repeat: repeat-x;
  background-position: 162.5% 50%;
  animation: adoShimmer $duration linear infinite;

  @media (hover: hover) {
    &:hover { filter: brightness(0.92); }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}
```

This removes everything from the old effect: the `!important` background, `z-index: 1`, the `> * { z-index: 2 }` lift,
and both pseudo-element layers.

### 3.2 [Button.module.scss](../src/core/Button/Button.module.scss) (`:162-170`)

```scss
&.button-shimmer {
  @include buttonProps($name: shimmer);
  border-radius: calc(var(--border-radius) * 3);

  &:not(:disabled) {
    // Apply the shimmer only when the button is enabled; disabled keeps today's look
    @include shimmerEffect;
    // Keep the base transitions; the hover darkening uses the spec's 150ms filter transition
    transition: all $transitionTime ease-in-out, filter 150ms ease;
  }
}
```

Add the keyframes at file level, after the `.button` block:

```scss
// Used by shimmerEffect; it lives here because CSS Modules rename keyframes per stylesheet
@keyframes adoShimmer {
  from { background-position: 162.5% 50%; }
  to   { background-position: 0% 50%; }
}
```

Update the header comment (`:25`) to "Shimmer: base-colour gradient with a sweeping light band".

### 3.3 How the existing pieces interact (checked in the code, no change needed)

- `buttonProps(shimmer)` sets `background-color` for hover, focus and active. It now paints under the gradient, so hover
  shows only the `filter` darkening, and only on hover-capable devices.
- The focus ring (`box-shadow`) and the text and icon colours are unchanged. `Button.tsx:198-242` still maps icons to
  `--button-shimmer-text-color`.
- `isLoading` does not set `disabled` (`Button.tsx:382`), so a loading shimmer keeps animating, as it does today.
- `.button` has `overflow: hidden` and the border radius (`:92-93`), so the gradient is clipped to the shape in every
  size, in `rounded` and in icon-only buttons.

### 3.4 Stories

1. **Rewrite the `play` test in `stories/ButtonTypeShimmer.story.tsx`**, keeping the toggle-disabled interaction:
   - enabled: `getComputedStyle(button).backgroundImage` contains `linear-gradient`, `animationName` contains
     `adoShimmer`, and `getComputedStyle(button, '::before').content` is `none` (the old layer is gone);
   - after the click (disabled): `backgroundImage` is `none` and `animationName` is `none`.
2. **New `stories/ButtonShimmerShowcase.story.tsx`**, registered in `_Button.stories.tsx`. Its rows:
   - small, medium and large;
   - rounded icon-only with `IconNames.arrowUp` (rc-webapp's 36 px send button);
   - disabled;
   - `isLoading`;
   - `w100`;
   - a shimmer inside `<AiGlow baseColor="#006a85">`.

   `parameters.docs.description.story` carries a note that reduced motion stops the sweep, and the contrast table from
   handover §4 V2: the band's peak falls to 2.72–3.80 : 1, below WCAG AA's 4.5 : 1. Design decides whether to cap it.
   The `play` test asserts that the button inside the glow has a computed `--ai-base-color` of `#006a85`.
3. Check `ButtonDemoShimmer` and `ButtonAI` in `_ButtonDemo.stories.tsx` (`:57-100`) visually. Their code does not
   change.

## 4. V3: AiGlow motion and parity

### 4.1 Reduced motion (required): end of [AiGlow.module.scss](../src/core/AiGlow/AiGlow.module.scss)

```scss
@media (prefers-reduced-motion: reduce) {
  .grad::before,
  .grad::after { animation: none; }
}
```

### 4.2 Parity options (recommended): CSS custom properties, no new props

The options are custom properties, each read with a fallback in the pseudo-elements and **not declared on `.grad`**. A
consumer's `className` can therefore set them without a specificity fight, and the defaults render exactly as today.

| Property | Default | rc-webapp composer |
|---|---|---|
| `--ai-glow-angle-offset` | `0deg` | `8.487deg` |
| `--ai-glow-background-size` | `300%` | `200%` |
| `--ai-glow-after-blend-mode` | `overlay` | `normal` (confirm against the prototype render) |

The changes in `AiGlow.module.scss`:
- `linear-gradient(var(--ai-bg-angle), …)` becomes `linear-gradient(calc(var(--ai-glow-angle-offset, 0deg) + var(--ai-bg-angle)), …)`;
- `background-size: 300% 300%` becomes `var(--ai-glow-background-size, 300%) var(--ai-glow-background-size, 300%)`;
- `mix-blend-mode: overlay` becomes `var(--ai-glow-after-blend-mode, overlay)`.

Why not props: exactly one call site uses them, they are prototype-parity knobs, and custom properties keep the typed
API unchanged. If review prefers props in the `borderWidth` / `blurWidth` style, add `angleOffset`, `backgroundSize` and
`afterBlendMode` that write the same properties.

Add a `WithParityOptions.story.tsx` that sets all three through `className` next to a default glow.

## 5. V4: modal shadow custom property (recommended)

In [Modal.scss](../src/core/Modal/Modal.scss), change `:47` and `:119` to
`box-shadow: var(--modal-content-shadow, var(--shadow-large));`. The default render does not change. rc-webapp then
sets the spec's two-layer shadow on the Ado modal root.

## 6. Commits and release

The commits use the conventional format, because `standard-version` builds the changelog from them. End each one with
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

1. `feat(AiGlow)!: derive glow stops from a single baseColor`, with the footer
   `BREAKING CHANGE: AiGlow no longer accepts startColor / endColor. The accent and light stops are derived from baseColor or the inherited --ai-base-color, so every glow's colours change (no pink stop).`
   This commit includes §2.
2. `feat(AiGlow): stop animations under reduced motion and add parity custom properties` (§4).
3. `feat(Button): restyle shimmer as a seamless base-colour sweep`. The body says that reduced motion is supported, and
   that disabled, radius, sizes and tokens are unchanged (§3).
4. `feat(Modal): add --modal-content-shadow custom property` (§5).

Release, only after verification passes:
1. Run `pnpm run release-dry-run`. It should print `1.20.0-release-modal-service-split.<259 + commits>`, which is
   `.263` for the four commits above, or `.264` if this plan file is committed too.
2. Run `pnpm run build`.
3. Run `pnpm run release`.
4. Run `pnpm run deploy-package`. This pushes the branch and publishes to npm under the branch dist-tag. **It is an
   outward-facing step: confirm with Radu before running it.**

## 7. Verification

1. **Types and lint:** `npx tsgo --noEmit --project tsconfig.lib.json` and `pnpm lint`. No `startColor` / `endColor`
   remain under `src/`.
2. **Tests:** `pnpm test` (the `storybook` and `spec` projects), with the rewritten `ButtonTypeShimmer`, the new
   showcase, and the updated AiGlow `play` tests passing.
3. **Compiled CSS:** after `pnpm run build-lib`, grep `dist/` for:
   - `@supports (color: oklch(from red l c h))` next to `--ai-glow-accent-color`;
   - the hashed `adoShimmer_xx` keyframes, with the animation reference using the same hash;
   - no `fadeGradient`, and no `::before` rule for `.button-shimmer`;
   - one `:root { --ai-start-color … }` per stylesheet.
4. **Storybook (`pnpm storybook`), visually:**
   - the four bases derive the expected hex values;
   - `Text` `mark` looks unchanged (it still uses `:root` `--ai-start-color`);
   - the shimmer shows no visible jump at the 6 s seam. Pause with `document.getAnimations()`, set `currentTime` to 0 and
     then to 5999, and compare;
   - hover darkens the button without replacing the gradient;
   - the disabled button looks the same as on `master`.
5. **Reduced motion:** in Chrome DevTools → Rendering, emulate `prefers-reduced-motion: reduce`. The shimmer and both
   glow layers must stand still.
6. **Fallback:** the fallback declarations sit outside `@supports`, so a browser without relative colour syntax gets the
   base colour. Check this in the compiled CSS; there is no older browser to test in.

## 8. Reply to rc-webapp (fill in the version after publishing)

1. `startColor` / `endColor` are removed outright. The WordPress build does not export `AiGlow`, so no deprecation
   cycle is needed.
2. Mixin `aiDerivedColors` in `src/styles/_ai_variables.scss`; properties `--ai-glow-accent-color` and
   `--ai-glow-light-color`; keyframes `adoShimmer`.
3. The shimmer keeps its radius, sizes and `--button-shimmer-*` tokens. What changed: `background-image`, `animation`,
   hover (a `filter` on hover-capable devices only), and a 150 ms `filter` transition added to the base transitions.
4. V3: custom properties `--ai-glow-angle-offset`, `--ai-glow-background-size` and `--ai-glow-after-blend-mode`, set
   through `className`.
5. V4 shipped as `--modal-content-shadow`, and it applies to both the default and the bottom-positioned modal.
6. Version: `1.20.0-release-modal-service-split.<N>`.
7. Also tell rc-webapp about §1.3 items 1, 2 and 9: the story test rewrite, the fact that `Button.spec.tsx` does not
   run, and that the composer should pass `borderRadius={30}`.
