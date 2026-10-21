# VAN-85 – Tabs overflow scroll buttons: investigation

Scope: replace the custom `TabsCustomScroll` arrows of `Tabs` with muted round icon-only `Button`s
(`type={ButtonTypes.muted} blurred shape="round"`), make the left/right buttons jump to the
start/end of the tabs, and remove the dead custom styling.

## Verdict

**Non-breaking, no theme or webapp work needed.** Implemented directly in this branch (MINOR, 2.6.0).

## 1. Public surface

| Surface | Finding |
| --- | --- |
| `TabsCustomScroll` export | Not exported from `src/index.ts` nor `src/core/Tabs/index.ts`. The `./core/*` subpath in `package.json#exports` has types (`dist/types/core/...`) but no JS: `dist/core/` is not built (checked in the webapp's installed 2.4.0). The only way to reach it is the internal chunk `dist/index-TabsCustomScroll.js` through `./dist/*`, which is not API. Deleting it is safe. |
| `useTabsScroll` hook | Same: internal, not exported. Its return shape changes (`canScrollStart/End`, `scrollToStart/End`). |
| `Tabs` props | No prop is tied to the scroll buttons. `testId` still yields `${testId}-scroll-left` / `${testId}-scroll-right` on the button wrappers (now with the `_button` suffix on the inner `<button>`, the Button convention). |
| Class names | `custom-scroll-button-wrapper`, `.left`, `.right`, `.hidden` (TabsCustomScroll module) and `.scroll-button` (Tabs module) go away / change. Only vanguard's own stories queried them. |
| Accessibility | The old arrows were `aria-hidden` divs (mouse only). The new ones are real `<button>`s with an `aria-label` ("Scroll to start" / "Scroll to end", via `translationService`). `Button` had no way to set `aria-label`, so it gains an optional `ariaLabel` prop (additive). |

## 2. Theme tokens

| Token | Status |
| --- | --- |
| `--button-muted-*` (background, hover, text, blend mode, focus outline) | Defined in the webapp theme (`rc-webapp/html/theming/default-theme.scss`, `storybook-default.scss`) and in `.storybook/theming.css`, like the `inverted` / `onDark` variants. `Button.module.scss` only keeps the literals as a safety net. |
| `blurred` | No token: a plain `backdrop-filter: blur(32px)` layer. |

No theme request needed.

Design follow-up: the first cut used `inverted onDark` (white 60% glass); it read poorly on the light tab themes, so
the buttons use the regular muted fill (multiply-blended) with the blur and a soft drop shadow. The button wrappers
are rendered after the scroller and carry no z-index/transform so the multiply blend reaches the tabs below.

## 3. Direction bug

`Tabs` wires `scrollLeftward` → left button and `scrollRightward` → right button, both in this repo and in the
2.4.0 `dist/index-Tabs.js` the webapp runs. A real-browser play test (Highlight, Floating and Underline themes,
320px wide, right ×2 then left) **paged correctly in both directions**, so the "both scroll left" report was not
reproduced in Storybook. The arrows only ever paged by "the leading tabs that fit" (MUI `getScrollSize`), which in
a narrow bar with long labels (e.g. "Canale de contact") can be smaller than one tab and looks like nothing / the
wrong thing happened.

The new behaviour sidesteps it: the start button scrolls to the very start, the end button to the very end.
RTL is respected: buttons are placed with logical insets (start button on the inline-start side) and the hook maps
start/end onto `scrollLeft` (LTR `0 … max`, RTL `0 … -max`). Covered by a hook spec and a play test in both
directions.

Side note: the caret SVG assets are mirror-named (`Icon-caret-left.svg` draws a right-pointing caret). The new
buttons follow the existing convention (`NavigationModal`, `SlideCarousel/Arrow`) and comment it.

## 4. Webapp sweep (`rc-webapp/html/react`, vanguard 2.4.0)

27 vanguard `<Tabs>` usages in 21 files, all with `theme: 'floating'` (6 more files use MUI's `Tabs`, unaffected).

Likely / possible to overflow (show the scroll buttons):

| Usage | Tabs | Risk |
| --- | --- | --- |
| `settings/AssistantSettings/AssistantSettingsPage/AssistantSettingsPage.tsx:199/207` (also rendered by `agent/Agent/AgentSettingsModal/AgentSettingsTabs.tsx:34`) | 2–6, long labels incl. "Contact channels" / "Canale de contact" | **Likely** (the screenshot) |
| `engagement/.../CreatePostFormInputActions.tsx:83` | 1–5 channels with icons | Possible (mobile) |
| `engagement/_common/EngagementCard/EngagementCardComments/EngagementCardComments.tsx:246` | up to 4 | Possible |
| `main/MainDashboard/MainDashboardTabs/MainDashboardTabs.tsx:178` | dynamic nav items | Possible (mobile) |
| `account/AccountLayout/AccountLayout.tsx:70` | dynamic nav items | Possible (mobile) |
| `ga/.../AccountKeywords/AccountKeywords.tsx:109` | 3 | Possible (mobile) |
| `ads/.../GoogleAdsAdGroupLoadedContent.tsx:191`, `ads/.../GoogleAdsCampaignDetailContent.tsx:126` | 5, small | Possible (mobile) |
| `projects/ProjectsOverview/settings/ProjectSettingsDrawer.tsx:93` | 2–3 in a drawer | Possible |

The other ~15 usages (2–4 short tabs) are unlikely to overflow.

Overrides and imports:

- No local CSS targets vanguard Tabs internals (`scroller`, `tab-list`, `custom-scroll-button*`, `[role="tablist"]`).
  `AccountLayout.module.scss` / `MainDashboardTabs.module.scss` style their own `className` on the bar root only;
  `AssistantSettingsPage.module.scss .tabBar` pads the wrapping card.
- No `*-scroll-left` / `*-scroll-right` test ids in the webapp's tests or e2e.
- Nothing imports `TabsCustomScroll` directly.

Nothing to change in the webapp; after upgrading to 2.6.0, eyeball the Assistant settings tab bar (page and
`AgentSettingsModal`) at a narrow width.
