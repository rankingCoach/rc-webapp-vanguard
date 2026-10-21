# VAN-85 rollout: transparent default Button and `textColor`

Apply these steps **after** the Vanguard release that ships `ButtonTextColors` / `textColor` (branch
`feature/VAN-85`, next minor after 2.4.0). Steps 1–5 go into **one webapp PR**, in this order, so that no build ships
a transparent default button with the email or legacy readers still attached to its token. Light scheme only.

Background and decisions: RFC "RFC: Transparent default Button (VAN-85)", `VAN-85-button-default-investigation.md`,
`VAN-85-button-default-theme-request.md`.

## What the Vanguard release already contains

- `ButtonTextColors` enum (`ado`) and a `textColor` prop on `Button`. It only acts on `type={ButtonTypes.default}`
  and is ignored by the other types.
- `ado` colours the label and icon with `--ado-base`. Hover and focus get a derived colour: 25% towards black.
- **No change to the fill.** The default button still reads `--button-default-background-color` and
  `--button-default-hover-background-color`. Until step 3 lands, nothing looks different.
- Stories under Vanguard/Button:
  - "Button Default Text Color"
  - "Button Default Transparent Preview", which shows the post-rollout look with the step 3 values scoped to the story.

## Step 1: bump Vanguard

Bump `@vanguard` in `html/react` to the release above. Nothing changes visually.

## Step 2: decouple the readers that must stay white

### 2a. Email buttons, in `html/theming/default-theme.scss` (`$email` map, around line 283)

```diff
-  --email-button-default-bg: --button-default-background-color,
+  --email-button-default-bg: --fn-bg,
   --email-button-default-fg: --button-default-text-color,
-  --email-button-default-border: --button-default-background-color,
+  --email-button-default-border: --fn-bg,
```

### 2b. Legacy `.btn.btn-default`, in `html/vanguard/src/styles/components/_buttons.scss` (around line 163)

```diff
   &.btn-default {
     @include buttonProps(default);
-
+    // VAN-85: the theme makes the default button transparent for the React Button; legacy PHP pages keep the
+    // white chip, so the fills are pinned here instead of read from --button-default-*-background-color.
+    background-color: var(--fn-bg);
+
+    &:hover,
+    &:focus,
+    &:active {
+      background-color: var(--fn-bg-var);
+    }
   }
```

This keeps all 42 legacy views (`application/views/**`, `btn-default`) exactly as they are. If design would rather have
the ghost look there too, skip 2b and check those views instead.

## Step 3: change the two theme values

In `html/theming/default-theme.scss` (`$buttons` map, around line 389):

```diff
-  --button-default-background-color: --fn-bg,
+  --button-default-background-color: transparent,
-  --button-default-hover-background-color: --fn-bg-var,
+  --button-default-hover-background-color: rgba(185, 197, 216, 0.12),
```

- Leave every other `--button-default-*` token as it is.
- Check the brand definitions (`html/theming/definitions/*/*.scss`, 84 of them) for their own overrides of these two
  tokens:

  ```bash
  grep -rn -e "button-default-background-color\|button-default-hover-background-color" html/theming/definitions --include="*.scss"
  ```

  Any brand that overrides them needs the same two values, or a deliberate decision to keep its own. As of 2026-10-20,
  three brands do:

  | Brand | Override | Action |
  |---|---|---|
  | `meditrend/meditrend.scss:30,32` | bg `--n200`, hover `--brand-color` (both opaque) | Not part of this PR: handled as webapp step **W7** (D3, 2026-10-21). The proposed default is to drop both overrides |
  | `pylot-barmenia/pylot-barmenia.scss:23` | hover `--p100` (`#fff7eb`, opaque) | **Update the override** (decided), see below |
  | `webcentral/webcentral.scss:46` | bg `transparent` | Already matches; no change |

  **pylot-barmenia.** It does not override the rest fill, so it inherits the new `transparent`. Its hover override
  (`--p100`, a solid cream `#fff7eb`) would show as an opaque patch on grey or tinted surfaces. Replace it with a
  translucent tint of the brand's palette, which keeps the cream look on white:

  ```diff
     // Default btn
     --button-default-text-color: --p600,
     --button-default-hover-text-color: --p700,
  -  --button-default-hover-background-color: --p100,
  +  --button-default-hover-background-color: rc_rgba(--p300, 0.12),
  ```

  `--p300` is `#e3ac5b`. At 12% over white it gives about `#fcf5eb`, close to today's `#fff7eb`, so the hover on
  white looks the same. The 12% matches the default slate hover. Brand files already use `rc_rgba` (e.g. `namecheap`).
  After step 4, check:

  ```bash
  grep -o -e "--button-default-[a-z-]*background-color:[^;]*" html/theming/definitions/pylot-barmenia/pylot-barmenia.min.css
  ```

  It must print `transparent` for the rest fill and `rgba(227, 172, 91, 0.12)` for the hover.

## Step 4: regenerate

```bash
gulp vanguard-theme-build
```

```bash
gulp vanguard-styles-build
```

- `vanguard-theme-build` regenerates `html/theming/definitions/*/*.css`, the `*.min.css` files and the email
  partials `app/templates/Email/Common/templates/theming/*.mjml.twig`.
- `vanguard-styles-build` rebuilds the legacy `html/vanguard/styles/vanguard.css` with step 2b.

Check the output:

```bash
grep -o -e "--button-default-background-color:[^;]*" html/theming/definitions/direct-channel/direct-channel.min.css
```

```bash
grep -n -e "email_button_default_bg\b" app/templates/Email/Common/templates/theming/direct-channel.mjml.twig
```

The first must print `transparent`. The second must still print `'white'` (or that brand's `--fn-bg`).

## Step 5: fix the usages that relied on the white fill

All paths are under `html/react/src/components/`. The design-approved replacements:

| Usage | Change to |
|---|---|
| `_common/LandingPage/Hero/Hero.tsx:29` (fallback when `cta.type` is unset on `gradientPrimaryMesh`) | `ButtonTypes.muted` + `inverted` (fix the fallback, not each config) |
| `ai-extensions/AIExtensionsLandingPage/AIExtensionsLandingPage.tsx:222` | `ButtonTypes.muted` + `inverted` |
| `ai-extensions/AIExtensionsLandingPage/AIExtensionsLandingPage.tsx:143` | `ButtonTypes.secondary` |
| `_common/UpsellingTrigger/UpsellingTrigger.tsx:27` | `ButtonTypes.secondary` |
| `ga/_common/KeywordsTable/KeywordsTableItem/EditMode/EditMode.tsx:150` | `ButtonTypes.muted` |
| `_widgets/LocationSummaryPageHeader/LocationSummaryPageHeaderCover/LocationSummaryPageHeaderCover.tsx:175` | keep. Verify the hover: the local `.btn-edit-cover` white must not show the slate fill over the photo |
| `_widgets/LocationSummaryPageHeader/LocationSummaryPageHeaderLogo/LocationSummaryPageHeaderLogo.tsx:170, 222` | keep. Verify the hover, same as the cover |
| `upsellings/LandingPage/models/PackageBasedModel/LandingPageNav/LandingPageNav.tsx:45` | keep. Verify the hover on the coloured nav |

Muted takes `ButtonSizes.extraLarge` for the medium height. See the `ButtonTypes.secondary` doc comment for the size
mapping.

Then replace the hand-made Needs-you row action. In `ado/AdoDashboard/tasks/NeedsSection/NeedsTaskRow/NeedsTaskRow.tsx`
(lines 39-52), swap the native `<button className={styles.action}>` for:

```tsx
<Button
  type={ButtonTypes.default}
  textColor={ButtonTextColors.ado}
  size={ButtonSizes.small}
  icon={IconNames.caretLeft} // Vanguard's caret names are reversed: caretLeft points right
  iconPosition="right"
  onClick={…}
>
  {…}
</Button>
```

Then delete the `.action` rules from `NeedsTaskRow.module.scss` (lines 4-18).

## Step 6: QA before merging

Use the light scheme.

- [ ] Landing pages: the ads, reputation and social feature-gated pages (Hero CTA) and the AI Extensions page.
- [ ] Location summary header: the edit-cover and add-logo buttons, at rest and on hover, over a photo.
- [ ] Ado dashboard: Needs-you rows. Ado colour at rest, darker on hover and focus, focus ring, keyboard Enter/Space.
- [ ] Grey surfaces: GA "Load more" (AdVersions), AI-visibility page actions, `EditableCard` edit pencil. A ghost look
      is expected.
- [ ] Modals, drawers and the ActionBar footer: no visible change on white.
- [ ] One email that renders a default button (any template using `email_button_default_*`): still white.
- [ ] pylot-barmenia brand: a default button on white and on a grey card, at rest and on hover (light cream tint,
      no opaque patch).
- [ ] Three legacy PHP pages with `btn-default`, e.g. `account/subscriptions`, `directories/errors`, `tools/analysis/new`:
      unchanged.

## Rollback

- Revert step 3 and regenerate with step 4.
- Steps 1, 2 and 5 can stay: they are correct with either value.
- The Needs-you row keeps working with the white fill.
