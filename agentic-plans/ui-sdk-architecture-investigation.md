# Investigation: rebuild Vanguard on UI SDK architecture, drop third-party components

> ## Decisions log (user handed authority to the watchdog 2026-11-18; verdicts recorded for the user)
> 1. D5 `sx` runtime narrowed: **APPROVED (watchdog), per component with usage evidence.**
> 2. D2 legacy `Mui*` aliases: **APPROVED: kept for the whole rebuild.**
> 3. D9 exit / `react-redux` peer: **DEFERRED to end of rebuild; shim stays.**
> 4. gates.sh base warnings: **APPROVED as a separate cleanup change.**
> 5. Form: **DECIDED: hybrid, staged F0–F5 (D14).**
> 6. Local commits per component after Tier A PASS: **APPROVED (§14.14).**
> 7. F2 (registration replacing child-walking): **CLOSED, not done by design** (fallback accepted; analysis in §D14/F2). F3 `field` prop: **GO**.
> 8. **Known bug left in place: Slider on the legacy `formconfig` path** calls `setStateValue` without dispatching, so slider values are never stored. Kept, because fixing it would start writing into consumer stores. Verifier: rc-webapp renders Slider in 7 files and none binds a formconfig, so **zero consumer impact**; the decision stands. On the new `field` path Slider DOES store its value.
> 9. Reporting rule: "passed" only for a Tier A/B verdict returned by the verifier; my own gates are "green on my side".


Date: 2026-11-18 · Branch: `feature/ui-sdk-architecture-investigation` (from `feature/file-manager-variants`)

## 1. What UI SDK is (ui-sdk.dev, vercel-labs/ui)

1. "A library of behaviors for agents to build the next generation of user interfaces." Beta, launched 2026-11-12.
2. Layers:
   1. `@ui-sdk/core` — framework-free TS behaviors (`createPopup`, `createSelection`, `createTypeahead`, `createRovingFocus`, `createListbox`, `createVirtualizer`, `createReorder`, `createResize`, `createUndoStack`, …) + `definePrimitive({ name, state, api, slots })`.
   2. Adapters — `@ui-sdk/react|vue|svelte|solid|web`, each exposing `createParts(primitive, { root: "button" })`.
   3. `@ui-sdk/react` — ~52 unstyled components, subpath-only imports (`@ui-sdk/react/select`), no root barrel.
3. Principles: "No styles, no dependencies, no providers, no portals." Styling via `data-slot` + state attrs (`data-open`, `data-pressed`, `data-disabled`, `data-side`) + CSS vars (`--anchor-width`). Animations via `data-starting-style` / `data-ending-style` (CSS, no JS anim lib).
4. Agent surface:
   1. `llms.txt` per package, shipped inside `node_modules/@ui-sdk/*/docs` (version-matched).
   2. `SKILL.md` shipped in package (`@ui-sdk/core/skills/ui-sdk/SKILL.md`).
   3. Runtime agent bridge: `createAgent()` → `snapshot()`, `act({steps})`, `query()`; `agentTools` JSON schemas; WebMCP `registerTools`; `data-agent-confirm|hidden|secret`; `details.source === "agent"`.
   4. `@ui-sdk/core/testing` — keyboard/focus/ARIA checks.
5. Unknowns: license not verified, no version number seen, `agent` key marked experimental.

## 2. Vanguard today

1. 129 components in `src/core`, ~68k LOC (non-test), 211 `*.module.scss`, 202 `exports-meta` entries.
2. Already agent-aware: `vanguard-mcp` server (catalogue/details/examples from exports-meta + stories). Not shipped in npm package, no `llms.txt`, no `SKILL.md`, no runtime agent bridge.
3. No `data-slot` / `data-state` contract (0 hits). Styling = SCSS modules + `--fn-*` tokens, state via class names.
4. Peer deps: `@emotion/*`, `@reduxjs/toolkit`, `react-redux`, `imask`, `react-imask`. MUI bundled.

### 2.1 Third-party usage → components

| Package | Files | Components | Fate |
|---|---|---|---|
| `@mui/material` | 58 | Accordion, AppBar, Autocomplete(+WithAnchor), Button, Collapse, DateRangeInput, DateRangePicker, Documents, Drawer, DropdownMenu, FlagAdornment, Form, FormControl, Input, List, Menu, MenuItem, Popover, PopoverModal, ProgressBar, SearchableSelect, Select, Slider, Snackbar(+Root), ToggleButton(+Group), Toolbar, AIAssistant, `_internal` | **Replace** with behaviors |
| `@mui/x-date-pickers` | 1 | DatePicker | **Replace** (Calendar/Date Picker/Date Input) |
| `react-date-range` | 6 | DateRange, DateRangePicker | **Replace** |
| `react-imask` / `imask` | 4 | DateRangePicker, IMaskInput, PhoneNumber | **Replace** (Date/Number/OTP input + own mask) |
| `react-spring` | 15 | AnimatedConditional, AnimatedSwitchConditional, CardMotion, Charts, DateRangePicker, IconButton, Modal, Skeleton, SlideCarousel, SlideTransition | **Replace** with CSS + `animateIn/Out` |
| `@use-gesture/react` | 1 | SlideCarousel | **Replace** (`bindDrag`, `createSwipeActions`) |
| `react-cropper` | 1 | Cropper | **Replace** (Image Cropper) |
| `@nozbe/microfuzz` | 1 | SearchableSelect | Replace (small own fuzzy) |
| `moment` | 35 | Charts, DatePicker, DateRange*, DateTimePicker, TimePicker | **Replace** with `Intl` / date-fns (already dep) |
| `styled-components` | 1 | StyledSVG | Drop |
| `react-inlinesvg` | 3 | CreditCard | Drop (own SVG loader) |
| `classnames` | 8 | many | Drop (own `@helpers/class`) |
| `html-react-parser` | 2 | Text | Keep or own sanitizer |
| `@reduxjs/toolkit`, `react-redux`, `redux-persist` | ~77 | Form, Modal, Drawer, CheckBox, ActionBar, AvatarCheckbox, Rating, ColorPicker, Charts, ExportXLS, ErrorBoundary, `_internal` | **Decouple** (violates "no providers") |
| `lexical`, `@lexical/*` | 13 | RichTextEditor | Keep → optional subpath |
| `apexcharts` | 10 | Charts | Keep → optional subpath |
| `video.js` | 1 | VideoPlayer | Keep → optional subpath |
| `lottie-web` | 2 | LottieAnimationLoader | Keep → optional subpath |
| `@react-google-maps/api` | 9 | GoogleMaps | Keep → optional subpath |
| `xlsx`, `file-saver`, `jszip` | 3 | ExportXLS | Keep → optional subpath |
| `libphonenumber-js` | 6 | PhoneNumber | Keep (data lib, not UI) |

Reading: "drop **all** third party" is not realistic for rich text, charts, video, maps, xlsx, phone metadata. Reimplementing them = years. Real target: **zero third-party UI-primitive deps** (MUI, pickers, spring, gesture, cropper, imask, moment); domain engines isolated behind optional subpaths.

## 3. Target architecture (UI SDK shape)

```
@rankingcoach/vanguard-core     framework-free behaviors + definePrimitive  (or @ui-sdk/core)
@rankingcoach/vanguard          React parts: createParts(primitive) + SCSS/tokens skin
  /button /select /date-picker  subpath-only exports, no barrel
  /agent                        createAgent / agentTools / WebMCP registerTools
  /rich-text /charts /maps ...  optional, own peer deps (lexical, apexcharts, ...)
  docs/llms.txt, docs/*.md      generated from exports-meta (vanguard-mcp generator)
  skills/vanguard/SKILL.md      shipped in package
```

1. Behavior layer — two options:
   1. **A. Build on `@ui-sdk/core`** (recommended if license OK). Get popup/positioning, focus, typeahead, listbox, virtualizer, drag, a11y for free. Vanguard = skin + rC variants + domain components. Still a third-party dep, but zero transitive deps and same arch.
   2. **B. Own `vanguard-core`.** Truly zero third-party. Must write ~40 behaviors incl. popup positioning, focus trap, roving focus, typeahead, virtualizer, calendar grid. Est. 4–6 dev-months before first component parity; a11y risk high.
2. Parts contract — every component emits `data-slot="<component>-<part>"` + state attrs. SCSS keys off attrs, not internal class names. Agents + tests address by slot.
3. Skin stays ours — SCSS modules + `--fn-*` tokens + `theming/direct-channel` unchanged in spirit; ui-sdk is unstyled so no conflict. Optional `@layer vanguard`.
4. No providers — remove Redux from presentational components (Form, Modal, Drawer, CheckBox…). Move to props/hooks; keep a thin `vanguard/redux` adapter for rc-webapp back-compat.
5. Agent surface:
   1. Ship `llms.txt` + per-component `.md` inside npm package (reuse `vanguard-mcp/scripts` generators).
   2. Ship `SKILL.md`.
   3. Expose `vanguard/agent` (wrap ui-sdk agent bridge if option A).
   4. Keep `vanguard-mcp` for design-time; it becomes one consumer of the same generated docs.

## 4. Cost

| Bucket | Components | Est. effort (1 dev) |
|---|---|---|
| Agent surface only (llms.txt, SKILL.md, data-slot attrs on existing components) | all | 2–3 wk |
| MUI-backed → behaviors (option A) | ~31 | 10–14 wk |
| Pickers/dates (DatePicker, DateRange*, DateTime, Time, moment removal) | ~8 | 5–7 wk |
| Motion (react-spring → CSS) | ~10 | 2–3 wk |
| Misc (Cropper, SlideCarousel, imask, SearchableSelect, StyledSVG, CreditCard) | ~7 | 3–4 wk |
| Redux decoupling + compat adapter | ~12 | 3–4 wk |
| Domain libs → optional subpaths | 6 | 1–2 wk |
| Consumer migration in rc-webapp `html/react` + visual QA | — | 4–8 wk |
| **Total option A** | | **~7–10 months** |
| Option B extra (own behavior core) | | **+4–6 months** |

Remaining ~85 components are already mostly own code (SCSS + React); they need `data-slot` attrs + agent metadata, not rewrites.

## 5. Risks

1. UI SDK beta, 6 days old, `agent` API experimental — APIs may change. License unverified (check `vercel-labs/ui` repo before any adoption).
2. Conflicts with in-flight MUI v9 upgrade plan (S4b → S5a pickers9 → S5b core9). Doing both = wasted work on MUI-backed components. Need decision: freeze MUI v9 at current stage, or finish it first.
3. Breaking DOM/class changes for rc-webapp (selectors, tests, snapshots). Must keep public props API stable per component.
4. Bundle wins real (MUI + emotion + moment + spring gone), but rich-text/charts/maps stay heavy.
5. Redux removal from Form/Modal = semantics change for consumers relying on store-driven state.
6. a11y regressions if behaviors hand-rolled (option B).

## 6. Recommendation

1. **Phase 0 — spike (1 wk):** verify ui-sdk license + version; rebuild `ToggleButtonGroup` (segmented) and `Select` on `@ui-sdk/core` behind identical Vanguard props; run existing specs/stories; compare bundle + a11y.
2. **Phase 1 — agent surface (2–3 wk, independent of internals):** `data-slot`/state attrs everywhere, generated `llms.txt` + `SKILL.md` shipped in npm, subpath-only exports. Biggest agent value, lowest risk.
3. **Phase 2 — strangler:** replace MUI per component, behind stable API, one PR each (TDD, same as VAN flow). Pickers last.
4. **Phase 3 — decouple Redux, move domain libs to optional subpaths, drop emotion/MUI peers → major version.**
5. Decide MUI v9 path before Phase 2.

## 7. Decisions (2026-11-18, user)

1. **Option B chosen: own behavior core.** No `@ui-sdk/core` dependency. Vanguard ships its own framework-free primitives (UI SDK *architecture* only).
2. **MUI v9 will not ship.** MUI is removed component by component instead.
3. **Base / visual baseline:** `release/file-manager-variants` (9d3b75b, MUI 9.5) — has the gate kit; rc-webapp consumes its `.472` build.
4. Internals free to change; **public API identical**; visual deltas minimal and each one listed.
5. Verification partner: webapp verifier thread (computed-style diff light/dark, characterization specs, package.sh, rc-webapp stories). Hand-off per component: SHA + name + selector-swap list.

---

# Part II — Rebuild decisions, review log, inventories, estimate (2026-11-18)

Status keys: **PROPOSED** = waiting for watchdog sign-off · **APPROVED** · **USER** = needs the user's call via watchdog.

## 8. Decisions

### D1. Core/React boundary (PROPOSED)
1. `src/primitives/core/*`: naturally pure behaviour as plain TS, no React import: `selection.ts`, `roving-focus.ts`, `press.ts`, `ripple.ts` (geometry). Later: typeahead, listbox navigation, popup positioning, date math.
2. `src/primitives/react/*`: React wiring only: `ButtonBase/` (press + ripple + focus-visible), `ToggleGroup/` contexts, `sx-compat.ts`.
3. No `definePrimitive`/`createParts`, no other-framework adapters. Door kept open only by keeping core pure. Where staying pure costs real extra work, it goes in React and is noted here.
4. Rejected: (a) React-only hooks for everything, superseded by the user's "nice to have if easy"; (b) a generic primitive engine, since it costs work for frameworks we don't ship.

### D2. DOM contract: `data-slot` + boolean state attributes (PROPOSED)
1. Every rebuilt part carries `data-slot="<component>[-<part>]"`, e.g. `toggle-button-group`, `toggle-button`, and later `select-trigger`, `select-popup`, `select-option`.
2. State as present/absent boolean attributes: `data-pressed`, `data-disabled`, `data-open`, `data-highlighted`, `data-selected`. Enums as values: `data-orientation`, `data-side`. Plus `data-value` where useful. No `data-state`.
3. Legacy `Mui*` classes (`MuiButtonBase-root`, `MuiToggleButton-root`, `Mui-selected`, `Mui-disabled`, `Mui-focusVisible`, `MuiToggleButtonGroup-grouped|firstButton|middleButton|lastButton`, `MuiTouchRipple-*`) are a **compatibility alias**. rc-webapp styles them in 6 modules today (ColorSchemeToggle, AdminColorSchemeToggle, ScreenSizeSelector, ExportScopeSwitch, AgentChatAdminSettingsModal, LogsPage).
4. New Vanguard SCSS should target the data attributes. Removal of the aliases is a later, separate breaking step (USER), after rc-webapp moves its 6 modules to data attributes.

### D3. CSS: order-independent at MUI's exact specificity, no `@layer` (PROPOSED)
1. Each skin includes the ButtonBase reset **inside its own root rule** (`@include button-base-reset` from `_button-base.scss`). Reset and skin then share one selector, so stylesheet order can't flip them. Ripple classes are unique, so their order doesn't matter either.
2. Specificities copy the old emotion output 1:1:
   1. Skin base and variants (size, fullWidth): 1 class.
   2. Selected/colour: 2 classes.
   3. Group joined corners: 2 classes, 3 for the disabled variant.
   4. rc-webapp relies on these: LogsPage notes it out-ranks "two classes" MUI rules.
3. Rejected: `@layer` and `:where()`. Both lose to unlayered host element rules like `button { … }`. WordPress themes and `src/index.css` have them, so the reset would silently stop applying. UI SDK can use layers because it ships no reset for host pages.
4. The old "import ButtonBase.scss first" comment and import order are gone.

### D4. Typography without a required provider (PROPOSED)
1. `VanguardTypographyContext` defaults to `'default'`: MUI default theme, 0.875rem, uppercase. With no provider mounted, components render exactly as they did without `VanguardThemeProvider`.
2. `VanguardThemeProvider` additionally provides `'vanguard'`: 1rem, no uppercase, exact `pxToRem` literals.
3. Tested both ways (`_ToggleButtonTheme.spec.tsx`). No new required provider.

### D5. `sx` / `classes` / ButtonBase passthroughs: API kept, `sx` runtime narrowed (USER — API delta)
1. Types accept every MUI shape: `sx` object, theme callback, array; all MUI `classes` keys (toggleButtonClasses, toggleButtonGroupClasses incl. first/middle/lastButton); `action`, `touchRippleRef`, `TouchRippleProps`, `focusVisibleClassName`, `disableTouchRipple`, `centerRipple`, `LinkComponent`, `nativeButton`, `component`, `href`.
2. **Delta:** `sx` applies only flat CSS objects (inline style). Theme callbacks, arrays, nested selectors, breakpoint objects and spacing shorthand (`m`, `p`, `bgcolor`, …) are ignored with a dev warning.
3. Usage evidence: 0 uses of `sx`, `classes` or `component` on ToggleButton/Group in rc-webapp (15 files) and in Vanguard production code.
4. Approve, or ask for a full `sx` engine (cost ≈ 1–2 days, adds a runtime style injector).

### D6. Arrow-key roving focus kept (PROPOSED)
1. The MUI 9.5 baseline **had** it (`useRovingTabIndexRoot` in ToggleButtonGroup). Pinned by `_ToggleButtonGroupRoving.spec.tsx`, which passed 6/6 on unmodified MUI before any change.
2. Kept for parity: every button stays a Tab stop, and arrows/Home/End move focus.
3. Micro-delta (safer than MUI): events whose target isn't a roving item are ignored (no focus move, no `preventDefault`). Visual impact none.

### D7. Redux (PROPOSED direction; part USER) — see §11.

### D8. Select popup approach (PROPOSED, needed before Select's popup is built)
1. Popup in the **browser top layer** (`popover="manual"` + `showPopover()`) instead of a React portal. No stacking-context/z-index fights.
2. OverlayStacking stays the source of truth for Modal/Drawer z-order. Top layer sits above them, and the menu must be above the modal anyway.
3. Fallback when unsupported (Safari < 17, outside the documented v9 browser policy): fixed positioning in the body.
4. Positioning: core `position.ts`, pure TS (anchor rect + viewport → side/offset, flip). Exposes `--anchor-width` and `--available-height` CSS variables, matching the current menu width/max-height behaviour.
5. Enter/exit as CSS-only via `data-starting-style` / `data-ending-style`, timed to the current MUI Grow/Fade durations.
6. Focus moves into the listbox on open and back to the trigger on close; Escape and outside click close it.
7. Dark-mode white-panel bug (verifier note) is **not** reproduced. The popup paints from tokens.
8. Visual parity risk: the MUI Menu Paper shadow, radius and transform-origin animation must be copied exactly. The verifier's computed-style diff covers it.

### D9. Form binding seam: one seam for all inputs (PROPOSED — sign-off before Select's form binding)
1. Inputs (Select, CheckBox, Input, …) become plain controlled/uncontrolled components with no Redux import and no form knowledge.
2. One seam, `useFieldBinding(props)`, in `src/primitives/react/form/`. Every input calls it with its public form props (today `formConfig` / `InputFormConfigProps`). It returns:
   ```ts
   { value, setValue(v, event?), onBlur, error: { hasError, messages }, isDirty, isTouched, register(ref), name, disabled }
   ```
3. Behind the seam today: the existing `useFormConfig` (Redux) path, unchanged behaviour. Later the Form rewrite swaps only the seam's backend.
4. With no form config the seam is a pass-through (local state, or controlled `value`/`onChange`).
5. Public form props on inputs stay identical. Anything that can't be kept is listed as a delta.

### D10. Entry layout / code splitting / assets (PROPOSED, measured first — §10)

## 9. Review log (watchdog findings → status)

1. **B1 API narrowing, fixed.** Types restored to the full MUI surface (D5). `_ToggleButtonGroupApi.spec.tsx` compiles every MUI-era shape plus every rc-webapp call-site shape under `tsc -p tsconfig.spec.json` (gates.sh). At runtime it asserts `classes` keys, `action.focusVisible()`, `touchRippleRef`, stable callback ref and flat `sx`. Remaining delta: `sx` runtime (D5, USER).
2. **B2 roving, baseline had it.** Kept (D6), with a target guard added and tested in core `_roving-focus.spec.ts`.
3. **B3 CSS order, fixed** via the mixin-in-rule approach (D3). WordPress bundle re-checked after the build (§12).
4. **B4 ref stability, fixed.** `useCallback` keyed on `ref`; spec asserts a callback ref fires once across re-renders.
5. **B5 ripple timers, fixed.** Timers are tracked and cleared on unmount.
6. **B6 Mui alias, recorded** (D2).
7. **B7 no provider, verified** (D4).
8. **B8 vitest.config.ts:** the only change is in project `spec`: `css: { include: [/src\/primitives\//, /src\/core\/ToggleButton(Group)?\//] }`. That lets jsdom see the plain SCSS of migrated components for the existing computed-style assertions. Nothing is excluded, relaxed or skipped; include/exclude/setup are untouched.
9. **B9 UI SDK popup choices:** applied in D8.
10. Process incident: one `biome check --write` run reformatted `_ToggleButton.mui.spec.tsx` and `_ToggleButton.stories.tsx`. Both were reverted with `git checkout` before any test run, so existing tests are byte-identical to 9d3b75b. Biome now runs only on files I author.

## 10. Efficiency architecture

### 10.1 Baseline (measured; release worktree build of 9d3b75b, Nov 16)
| Artifact | Files | JS | CSS | CSS gz |
|---|---|---|---|---|
| `dist/` (default, preserveModules) | 2754 | 11.62 MB | 338 KB (`vanguard.css`, single file) | 62.8 KB |
| `dist-wordpress/` (single bundle) | 338 | 2.88 MB (index.js 2.54 MB, 623 KB gz) | 175 KB | 30.1 KB |

Still to measure before any efficiency change: what one root import (`import { Button } from '@rankingcoach/vanguard'`) pulls into a consumer bundle (package.sh fixture with a size probe), and rc-webapp's vendor chunk share of Vanguard + MUI + emotion.

### 10.2 Target layout, ordered by gain per effort
1. **Drop runtime CSS-in-JS** (emotion), a by-product of removing MUI. Gain: emotion and MUI runtime gone from every consumer bundle; no style injection at render. Effort: included in the component work.
2. **CSS delivery:** keep the single `vanguard.css` (works with the WordPress single bundle and rc-webapp's import). Add optional per-component CSS only if measured unused-CSS is large. Order-independence is guaranteed by D3, so splitting is safe later.
3. **Lazy optional heavies behind existing exports:** lexical (RichTextEditor), apexcharts (Charts), video.js, lottie, Google Maps, xlsx/file-saver, cropper. They become `React.lazy` boundaries inside the component, so the import path stays the same and the code loads on first render. Measure the consumer bundle before and after.
4. **Root barrel side effects:** mark CSS as the only side effect (`"sideEffects": ["*.css","*.scss"]`). Today it's `false`, which is wrong with global SCSS imports and risks CSS being tree-shaken. Verify per-component subpaths `./core/*` actually resolve (package README says some exports point to unbuilt targets). Keep old paths as aliases.
5. **Icons/SVG:** replace `react-inlinesvg` fetch-then-inline (a waterfall) with build-time SVG components or `<img>` with intrinsic `width`/`height`, `loading="lazy"`, `decoding="async"` for illustrations.
6. **Fewer wrappers:** `ComponentContainer` divs stay (rc-webapp selectors and `testId` contracts depend on them).

Each item reports before/after numbers; nothing ships without a measured win.

## 11. Redux inventory (Vanguard side; rc-webapp side owed by the verifier)

### 11.1 Production imports (stories/specs excluded)
| Where | Use | Only for Form binding? | Class |
|---|---|---|---|
| `custom-hooks/useFormConfig.ts` | `useSelector(config.reducer)`, `dispatch(config.slice.*)` | yes, the form binding itself | **(b) public:** `FormConfig.reducer`/`slice` are consumer Redux |
| 19 inputs via `useFormConfig` (InputBase, Input, CheckBox, RadioButton(Group), Slider, DatePicker, TimePicker, PhoneNumber(+Base), ColorPicker, AvatarCheckbox, Verification*Input, FormElement, Form) | through the hook | **yes** | (a) internal once the seam (D9) sits between them and the hook |
| `core/Form/extract-error-scopes.ts` | `PayloadAction` type | yes | (b) exported fn signature |
| `core/Modal/ModalStepper` | `useDispatch` → `slice.setStep` from props | no: stepper step sync to a consumer slice | (b) prop contract |
| `core/RcErrorBoundry/generate-error-boundary-data.ts` | `EnhancedStore` type | no: reads store for error reports | (b)? needs rc-webapp list |
| `components/PersistGates.tsx`, `get-persistor-from-store.ts` | redux-persist | no: persistence | (b)? needs rc-webapp list |
| `common/ListPage` (7 files), `custom-hooks/use-stepper`, `use-bind-query-param-to-redux-state`, `use-app-dispatch`, `jwt-hooks`, `helpers/redux-common`, `stores/redux-base.store`, `app-loaders/load-component` | app-level Redux helpers | no | (b)? needs rc-webapp list |
| `DrawerRoot.slice`, `Rating.slice`, `ExportXLS.slice`, `AreaChart.slice`, `ActionBarRoot.slice` | `createSlice` | — | **dead:** 0 importers, not exported. Delete. |
| `main.store.ts`, `global.slice.ts`, `App.tsx`, `test-utils/*` | dev app / tests | — | internal |

Split: of 24 core/common Redux touch points, **19 are Form binding** through one hook, **5 are dead slices**, and the rest (ModalStepper, ErrorBoundary, PersistGates, ListPage, stepper/query-param/jwt hooks) are non-form.

The user's hypothesis holds for components: every *input* uses Redux only via Form.

### 11.2 Modal / Drawer (verified on this branch)
1. Modal open/stack state is **React context** (`ModalContext`/`ModalProvider`, `ModalLifecycleContext`, `ModalPresentationContext`). Not a Redux blocker.
2. Only leftover: `ModalStepper` `useDispatch` for an optional consumer slice step sync. Story/spec bootstraps use RTK.
3. Drawer: no Redux in production; `DrawerRoot.slice.ts` is dead.
4. Design note kept: the modal host must work with no provider above it other than its own, because rc-webapp renders ModalRoot outside RouterProvider.

### 11.3 End state
1. `redux`, `@reduxjs/toolkit`, `react-redux` and `redux-persist` leave the root entry's dependencies.
2. If rc-webapp (verifier list) uses `FormConfig.reducer/slice`, ModalStepper slice sync, PersistGates or the ListPage/stepper helpers, they move behind an optional entry `@rankingcoach/vanguard/redux` with **optional** peer deps (USER).
3. Old root exports stay as re-exports from that entry for one major version.
4. WordPress: its entry exports `Form`, `FormElement` and `useFormConfig`. `dist-wordpress/index.js` imports `react-redux` as an external today, so WordPress hosts currently need react-redux plus a store to use form config. After D9 plus a non-Redux Form backend, that requirement disappears. Until then the seam keeps WordPress behaviour identical.

### 11.4 Form on React 19 (feasibility stub; full entry after Select, characterization first)
1. Known contract facts: `useFormConfig` mirrors field values, errors, `initialState` and `resetState` into a **consumer-owned Redux slice**. rc-webapp therefore reads/writes form state from its own store, so external read/write is part of the contract.
2. React 19 actions/`useActionState`/`useFormStatus` cover submit and pending state. They don't cover controlled per-field state, change detection, cross-field validation or external store read/write.
3. Those need a small external store (`useSyncExternalStore`) behind the D9 seam, plus a compat adapter that mirrors to a consumer slice when `reducer/slice` are passed.
4. Provisional verdict: **feasible with the compat adapter, no API delta expected**. Recommendation: first swap only the state container behind D9 (fallback path, low risk); adopt React 19 actions for submit/pending second.
5. Full capability matrix and rc-webapp usage come after the verifier's inventory; characterization tests come before any Form change.

## 12. WordPress variant: proof per component
1. What it depends on:
   1. Build: `vite.config.wordpress.ts`, entry `src/index-wordpress.ts`, single `dist-wordpress/index.js` + `vanguard.css`, `WORDPRESS_BUILD=true`, asset exclusion.
   2. Packaging: `.vanguardrc`-driven asset cleanup (`clean-assets-based-on-vanguardrc.js`).
   3. Package gate: `package.sh` builds both bundles, installs the tarball into `wp-declared` and `wp-mui` consumers and runs 4 jsdom smoke tests each (entry selection, Button, Input, Textarea), plus gated types (`wp.tsx`, `wp-measured.tsx`).
2. Per rebuilt component the handoff states:
   1. Exported from the WordPress entry, or reachable from it (grep of the built bundle for its `data-slot`).
   2. `package.sh` WordPress consumers green.
   3. If reachable: a WordPress smoke test exists for it.
3. Gap today: no WordPress smoke test for Select (exported) or Form. Smallest proposal: add one smoke test per WordPress-exported rebuilt component to `package-fixture/smoke/bundle.test.tsx` (render, interact, assert value). First one: Select, added with the Select rebuild.
4. ToggleButtonGroup: not exported or reachable from the WordPress entry. The built `dist-wordpress/index.js` contains no `toggle-button` and the CSS has no `MuiToggleButton`. Evidence for the r2 build is in the handoff.

## 13. Estimate (measured basis)
Measured: ToggleButtonGroup + ToggleButton + ButtonBase/ripple/press/roving/selection primitives took **≈2 h agent wall-clock**: about 1 h build + specs, 0.5 h review rework, and ≈0.75 h serialized gate runtime (spec, storybook, gates.sh, package.sh) under host load average ~24. The shared primitives are now done and reused.

| Group | Components | Shared primitives needed first | Agent h (low–high) |
|---|---|---|---|
| Trivial (own code: data-slot, CSS, no 3rd-party) | ~85 | D2/D3 conventions | 20–40 |
| Simple MUI-backed (Button, Collapse, ProgressBar, Toolbar, AppBar, List/ListItem, Accordion, Snackbar, FormControl, Divider-like) | ~14 | ButtonBase ✔, transition/collapse | 20–40 |
| Popup / behaviour-heavy (Select, SearchableSelect, Autocomplete(+Anchor), Menu, MenuItem, DropdownMenu, Popover, PopoverModal, Drawer, Modal motion, Slider, InputBase/Input/Textarea, AIAssistant) | ~14 | popup/position/top layer, listbox+typeahead, focus return, field seam (D9) | 60–120 |
| Pickers + dates (DatePicker, DateRange*, DateTimePicker, TimePicker, moment→Intl/date-fns, imask) | ~8 | calendar grid, date math, masked input | 60–130 |
| Redux-coupled (Form + seam backend, ModalStepper, ErrorBoundary, Persist, ListPage, dead slices) | ~10 | D9 seam, external store | 30–80 |
| Motion (react-spring → CSS) / misc (Cropper, SlideCarousel, CreditCard, StyledSVG, PhoneNumber) | ~17 | CSS motion helpers, drag/gesture core | 25–60 |
| Domain libs → lazy boundaries | 6 | — | 6–12 |
| Efficiency architecture + WordPress smoke tests | — | — | 20–45 |
| Gate runtime overhead (serialized, ~0.5–0.75 h per component PR) | — | — | 40–80 |
| **Total agent working time** | | | **≈280–610 h** |
| **Calendar** (one PR per component, the user reviews/commits each, verifier diff per PR; ~6–8 agent h/day effective) | | | **≈2.5–5 months** |

Top 3 blow-up risks:
1. **Pickers:** reproducing MUI 9 picker DOM, sections a11y and visuals within the verifier's 0.5px / 0.1% bar.
2. **Form + Redux contract:** if rc-webapp reads or writes the consumer slice in ways the characterization tests don't capture yet.
3. **Verification loop throughput:** visual-diff iterations per component and host load (gates ran ~2–3× slower at load average 24). Serialized gates bound daily output.

### 11.5 Correction from the verifier's rc-webapp inventory (2026-11-18 17:10)
Source: `/Users/a.kott/PhpstormProjects/mgm/rc-webapp/tmp/research/vanguard-ui-sdk-visual-baseline/redux-and-entry-inventory.md`.

1. rc-webapp imports **nothing Redux-shaped** from Vanguard (no slice, reducer, store, selector or helper). PersistGates, ListPage*, useStepper and the GlobalReducer helpers are unreachable from rc-webapp. `use-global-slice` is dead.
2. The coupling runs the other way. **Vanguard dispatches consumer action creators:**
   1. `useAppDispatch()` + `dispatch(formconfig.setStateValue(v))` / `setStateValueArray(...)` in InputBase, CheckBox, Autocomplete, ColorPicker and DateRangeInput.
   2. rc-webapp passes `formconfig=` 180× in 64 files, almost all built by rc-webapp's own fork `src/custom-hooks/useFormConfig.ts` (setStateValue = slice action creator). One file uses Vanguard's `useFormConfig({reducer, slice})`.
   3. `ModalStepper` does `dispatch(slice.setStep(name))`. 5 rc-webapp wizards pass `slice`.
   4. Plus ListPage* and ReviewsTypesCheckboxGroup (not reached by rc-webapp).
   5. My §11.1 grep missed these call sites because the import is `@custom-hooks/use-app-dispatch`, not `react-redux`.
3. Consequence: Redux on the input side is public contract **(b)**. Removing `dispatch` silently freezes every rc-webapp form.

### D9 (revised). Form binding seam with a dispatch shim (PROPOSED)
1. `useFieldBinding` calls `formconfig.setStateValue(v)` / `setStateValueArray(...)` as **plain callbacks**. If the return value is an action object (`{ type: string }`), the seam dispatches it.
2. The dispatch comes from **one** place, `src/primitives/react/form/use-legacy-dispatch.ts`. It is the only file in the input path that touches `react-redux`.
3. Transition: `react-redux` stays a peer **only for that file**. Inputs stop calling `useDispatch` themselves, so 6 call sites become 1.
4. Exit (USER):
   1. rc-webapp binds `dispatch` inside its one fork file. Then `setStateValue` already dispatches and returns nothing, and the shim becomes a no-op.
   2. Vanguard then makes `react-redux` an **optional** peer: the shim reads `ReactReduxContext` only when it's installed, via an optional-entry bridge.
5. No public prop changes. `FormConfigElement`, `FormFieldType` and `ValidationResultWithInfo` type exports are kept.
6. WordPress: identical behaviour (its entry already treats `react-redux` as external).

### D11. ModalStepper step sync (PROPOSED)
1. Keep the `slice` prop: call `slice.setStep(name)` as a plain function and dispatch the result through the same shim if it's an action.
2. Add optional `onStepChange(name)` (additive, no delta). The 5 rc-webapp wizards keep working unchanged.

### D12. Import paths outside the root (constraint, from the verifier)
1. These must keep resolving: `exports` `"."`, `"./style.css"`, `"./dist/*"`, and specifically:
   1. `dist/index-OverlayStackingService.js` (+ `dist/types/core/OverlayStacking/OverlayStackingService`).
   2. `dist/types/core/Modal/ModalSplitView/ModalSplitView` (`SplitViewElement`).
   3. `dist/index-es.js` (widget-image stub).
   4. The `dist/index-<File>.js` naming used by rc-webapp's unregistered codesplit plugin.
2. Any efficiency change to entry layout or chunk names (D10) keeps these names as aliases or is announced to the verifier first.

### 11.6 Updated Redux end state
1. Root entry: **no** `redux`/`@reduxjs/toolkit`/`redux-persist` in production. `react-redux` only in `use-legacy-dispatch.ts` until rc-webapp's fork binds dispatch, then optional.
2. Dead: 5 slices, `use-global-slice` + `GlobalReducer` helpers, PersistGates/get-persistor (not reached).
3. ListPage* / ReviewsTypesCheckboxGroup: not reached by rc-webapp, so they're rebuilt on the seam (internal, class a).

### D8 (revised after reading Select's characterization spec). Popup host = portal into `document.body` + OverlayStacking, not top layer (PROPOSED)
1. `_Select.mui.spec.tsx` pins:
   1. `listbox.closest('.MuiMenu-root').parentElement === document.body`.
   2. `.MuiMenu-root` z-index = `OVERLAY_BASE_Z_INDEX + 1` from the shared OverlayStacking ledger, released on close.
   3. `src/app-loaders/load-component/root-components.scss` targets `.MuiMenu-root`.
2. The top layer would ignore z-index and the ledger. That's a behaviour change for modals/drawers that stack above an open menu, and it would break those assertions. **Rejected** for parity.
3. Kept from UI SDK:
   1. CSS-only enter/exit (`data-starting-style` / `data-ending-style`), timed like MUI Grow (enter ≈ auto ~ 225–300 ms, scale 0.75→1 + opacity).
   2. `--anchor-width` / `--available-height` variables.
   3. Focus into the selected option on open and back to the trigger on close.
   4. Pure-TS positioning in core.
4. Select scope: own TextField frame + select mode behind `MuiTextField.tsx` (the single MUI import site of the field stack). Same DOM and classes as MUI: FormControl/InputLabel/OutlinedInput + notched fieldset, combobox div, hidden native input, Menu → Paper → List → MenuItem.
5. Only the `select` path switches first. Input/Textarea/SearchableSelect/pickers move to the same frame in their own handoffs, so nothing is rebuilt twice.

### 11.7 Form prior art (read-only search, 2 passes)
1. **`feature/refactor-form`** (local + origin, Vanguard repo): 16 commits, 2026-04-07…04-14, last `121d4e3`, base `7d73b87` (1.5.0). 71 files, +4832/−1304.
   1. Approach: `FieldConfigProvider` context so inputs bind without `formconfig` prop-drilling.
   2. New hooks `useFormRuntime`, `useRuntimeConfigRegistry`, `useBuiltFormChildren` and a custom `useFormStatus`.
   3. `formconfig` renamed to `fieldConfig` (**an API break**). `FormElement` deleted (**an API break**). Redux kept.
   4. Validation stories added: dirty, reset, nested config isolation, child removal, Autocomplete/ValidInput matrices.
2. Likely stall reason: it broke the public API (rename + deletion) and so needed a big-bang rc-webapp migration. It now trails the release line by 426 commits. No TODO notes.
3. **Reusable:** the context auto-binding idea (matches D9 + the user's goal), the runtime registry design, and its validation stories as extra characterization cases, ported onto the current code.
4. **Not reusable as-is:** the renames and deletions. The rule now is that `formconfig`/`FormElement` keep working as the compat path.
5. Older rc-webapp attempts (2022–2023 branches/stashes) are pre-Vanguard history only.
6. No `useActionState` anywhere; React 19 actions would be new.

### D13. Lost tie-break from runtime CSS-in-JS (PROPOSED; affects every component)
1. Fact: emotion inserted MUI's rules at runtime, after every static stylesheet (vanguard.css, rc-webapp CSS, WordPress theme CSS). So MUI **won all equal-specificity ties**.
2. Static SCSS in `vanguard.css` loads before consumer CSS and **loses** those ties. A consumer or Vanguard override that was previously dead CSS (same specificity as MUI's single hashed class) can start applying.
3. Tooling:
   1. `agentic-plans/uisdk-tools/extract-emotion-rules.mjs` (Playwright against Storybook) dumps the exact emotion rules per element, keyed by stable `Mui*` classes. Base SCSS is written from that dump (Select: 62 emotion classes across 6 states).
   2. Variant modifiers use `:where(...)` so each rule keeps emotion's single-class specificity.
4. Detection: the verifier's computed-style diff on Vanguard stories and rc-webapp screens. Any delta from a newly-live tie gets fixed at that selector (raise our rule, or list the override).
5. ToggleButton review: rc-webapp's overrides are all ≥2 classes (module class + `:global(.MuiToggleButton-root)`), so they out-rank the 1-class base either way. No new ties expected; the verifier diff will confirm.
6. Rejected:
   1. Runtime-injected base CSS: brings back a CSS-in-JS runtime.
   2. `!important`: breaks consumer overrides.

## 14. Watchdog verdicts (2026-11-18, full authority delegated by the user)
1. D1 APPROVED.
2. D2 APPROVED: `Mui*` aliases stay for the whole rebuild.
3. D3 APPROVED. Condition: report the CSS size of the duplicated reset as skins accumulate; above a few KB gzipped, propose a shared class at equal specificity.
4. D4 APPROVED.
5. D5 APPROVED **per component**: narrowing `sx` only with usage evidence; shapes in use get supported.
6. D6 APPROVED.
7. D8 (revised) APPROVED.
8. D9 (revised) APPROVED with a fix: the shim dispatches any non-`undefined` result (`result !== undefined → dispatch(result)`), thunks included. Spec covers object, thunk and void returns.
9. D10 APPROVED in the listed order, with conditions:
   1. Lazy boundaries keep first paint: same-size Suspense fallback, refs and imperative handles intact. Otherwise stay eager.
   2. The WordPress bundle stays single (lazy inlined there).
   3. Fix `sideEffects` first and prove with package.sh that CSS still arrives.
10. D11 APPROVED.
11. D12 APPROVED.
12. gates.sh base warnings: one separate cleanup change, only those 7 warnings.
13. D9 exit DEFERRED to the end of the rebuild; the shim stays.
14. **Commits:** local conventional commits on this branch, one per component or decision-sized change, after its specs + static gate are green (and Tier A PASS for components). Commitlint-clean, no trailer. Never push/tag/publish/rebase or touch other branches. Replaces the commit-tree snapshot.

### D14. Form rework: hybrid, staged (APPROVED by the watchdog; replaces §11.4's provisional verdict)
**User's intent, as shown by the early attempt** (`rc-webapp-vanguard-new/src/core/Form`):
- The form config is carried by a form-scoped context, so children don't receive `formconfig` as a prop.
- Nested forms report to their parent.

We design to that intent. We do not copy its `cloneElement` child-walking.

**Framing:** React 19 form primitives cover submit, pending and action results. Controlled field state, change detection, cross-field validation and external read/write (rc-webapp mirrors values into its slices; 180 `formconfig=` sites in 64 files) need a form-scoped context plus a small per-form external store. React 19 actions sit on top. The no-prop-drilling goal is met by the context.

Rules:
1. Zero required rc-webapp changes. These all keep working unchanged:
   1. `formconfig=` / `formConfig=`.
   2. `useFormConfig`, `FormElement`, `FormStatus`.
   3. `Form` props: `config`, `onChange`, `onSubmit`, `className`.
2. No rename, no deletion. An explicit prop wins over context.
3. Context binding is additive via a new explicit prop on inputs (proposed `field="email"`; collision check across inputs first). Never bind on native `name`. When bound, set native `name` from the field if unset, so FormData works.
4. Inputs register with the nearest Form through the D9 seam (mount/unmount, change, blur, validity), replacing `Children.map` + `cloneElement`. `FormElement` stays as a thin registering wrapper.
5. Array fields: registration order reproduces today's child-order `idxMap`, including conditional rendering and reorder. Cases that can't be reproduced keep `arrayPosition` and are listed.
6. Nested forms: characterize and keep today's behaviour. "Report to parent" applies only on the new context path, and only if no existing screen changes.
7. Backends behind the seam:
   1. Legacy: the useFormConfig / rc-webapp-fork config element, written through `setStateValue` via the shim.
   2. New: a Redux-free per-form `useSyncExternalStore` store with the same field element shape. Used by new forms and WordPress.
8. React 19 layer is additive:
   1. Real `<form>` only if Form renders one today (check; a host change would be a DOM delta).
   2. `action` receives typed values from the store; pending via `useFormStatus`; result via `useActionState`.
   3. `onSubmit` unchanged.
9. `FormStatus` `onChange` timing (effect on change, including mount): same call count and order, characterized first.

Stages, each green and handed off:
1. **F0:** characterization on untouched Form. All capabilities, plus the `feature/refactor-form` validation stories ported as cases; mount/unmount, array index, nested, onChange sequence, reset, dirty/touched.
2. **F1:** seam in inputs (with Select first, then input by input).
3. **F2:** registration replaces child-walking (highest risk; Tier B on form screens).
4. **F3:** context binding by `field` (additive).
5. **F4:** Redux-free store backend + hook; WordPress smoke test for Form without react-redux.
6. **F5:** React 19 action/pending layer.

Fallback if F2 can't reach parity on some case: stop at F1 + F3, keeping child-walking for prop-configured children, and record why.

Order: ToggleButtonGroup handoff → commit after Tier A PASS → Select → F0.

## 15. Gate notes (2026-11-18 17:30)
1. **package.sh `declared` consumers fail on base (pre-existing):**
   1. The isolation probe asserts declared-only consumers can't resolve `@mui/material`.
   2. 9d3b75b lists `@mui/material`, `@mui/system` and `@mui/x-date-pickers` in **dependencies** (package.json unchanged in our diff; `npm ls` in the consumer shows them under `@rankingcoach/vanguard@2.10.0`).
   3. Resolves when MUI leaves the dependency list at the end of the rebuild.
   4. The `mui` consumers pass: default 5/5, wp 4/4.
2. **Real finding fixed:** `tsconfig.lib.json` and `tsconfig.dts.json` include lists lacked `src/primitives`, so the public `ToggleButton.d.ts` imported unemitted files. Both now include it.
3. **Per-component d.ts guard:** `node agentic-plans/uisdk-tools/check-dts-imports.mjs dist/types` checks that every relative import in emitted declarations resolves.
   1. After the fix: 743 files, 0 unresolved.
   2. Negative control (emitted primitives hidden): 3 unresolved.
4. package.sh runs only at milestones (next: Select).
5. gates.sh exits 1 on base for 7 Biome warnings in untouched files (separate cleanup change, approved).

### D11 (revised, 2026-11-18 17:50): no new prop
1. `onStepChange` already exists (deprecated, `(index, name, step)`), so the proposed `onStepChange(name)` would collide.
2. `onStepChangeName` isn't a substitute: it skips step index 0 and scrolls.
3. Instead, through the D9 shim `slice.setStep` may now be a **plain callback**. It's called with the step name, and the result is dispatched only when it's not `undefined`.
4. The 5 rc-webapp wizards (action creators) are unchanged.
5. Spec: `_ModalStepperSliceShim.spec.tsx` covers an action-returning setter (store updated, step 0 included) and a plain callback (called, nothing dispatched).
6. Zero API change.

### D9 rollout (2026-11-18)
1. `useLegacyDispatch` (`src/primitives/react/form/use-legacy-dispatch.ts`, spec: object / thunk / void) replaces `useAppDispatch` / `useDispatch` in InputBase, CheckBox, Autocomplete, ColorPicker, DateRangeInput and ModalStepper.
2. The call sites are textually unchanged.
3. No direct react-redux dispatch is left in `src/core` production code.

## 16. Select: consumer evidence, deltas, test-edit list (for the Select handoff)
1. What consumers put into a select (evidence, read-only greps):
   1. Public `Select` takes `options`. It spreads its props into InputBase and supplies its own option children, so consumer `children` were never rendered.
   2. rc-webapp: every `<Select>` is option-driven (`options=`). The single non-self-closing one (`EngagementChatUsersListHeader.tsx:52`) has no children.
   3. rc-webapp has no InputBase in select mode, no `MenuItem` inside a select, and 0 `@mui` imports.
   4. Package fixtures (`components.tsx`, `realistic-usage.tsx`, `wp.tsx`, `wp-measured.tsx`) use `options=` only.
   5. The only children path is the public `InputBase` with `select` plus children. Vanguard's public `MenuItem` (wraps MUI) is the natural child there.
2. Vanguard `MenuItem` inside the own-core select:
   1. The popup provides `OptionHostContext`. Inside it `MenuItem` renders the own-core `MenuOption` with the same content and props; everywhere else it still renders MUI's MenuItem (Menu, DropdownMenu, TableToolbar) until Menu is rebuilt.
   2. Spec `_MenuItemInSelect.spec.tsx`: selection, selected/disabled classes, testId, keyboard skip of disabled, closed typeahead.
   3. Story `_MenuItemInSelect.stories.tsx`: real-browser keyboard, typeahead, disabled pointer-events, selected class.
3. **API delta (USER via watchdog):** an MUI `MenuItem` (from `@mui/material`) as a child of InputBase select no longer renders; it throws MUI's "MenuListContext is missing".
   1. Evidence of no consumer impact: rc-webapp has 0 `@mui` imports; the package fixtures use `options` only.
   2. Vanguard's own stories/specs that used it are the 4 test files below (import swapped).
   3. SearchableSelect uses MUI `Select` + MUI `MenuItem` itself, so it is unaffected until it is rebuilt.
4. Test-file edits, import line only, assertions unchanged:
   1. `src/core/_internal/InputBase/_InputBase.mui.spec.tsx`: `import { MenuItem } from '@mui/material'` → `import { MenuOption as MenuItem } from '../../../primitives/react/Menu/MenuOption'`.
   2. `src/core/_internal/InputBase/_MuiTextFieldCompatibility.spec.tsx`: same swap.
   3. `src/core/_internal/InputBase/_TextFieldV9Compatibility.spec.tsx`: same swap.
   4. `src/core/_internal/InputBase/_InputBaseMuiContract.stories.tsx`: `import { InputAdornment, MenuItem } from '@mui/material'` → `import { InputAdornment } from '@mui/material'` + `import { MenuOption as MenuItem } from '../../../primitives/react/Menu/MenuOption'`.
5. Paths kept on MUI for now (only reachable via the `textFieldProps` escape hatch): `SelectProps.native` (native `<select>`) and non-outlined select variants. They move with the Input/TextField frame stage.

## 17. F0: Form characterization (inventory 2026-11-18; read-only agent, file:line in the agent report)
1. Today **no Form spec runs**: `Form.spec.tsx` and `FormElement.spec.tsx` lack the `_` prefix the spec project collects. The Storybook stories that run cover:
   1. Validation for minLength / required / custom message / hex colour.
   2. The `hasChanges` flag on Input and Select.
   3. The `onChange` mount status.
   4. className.
2. Dead paths today, characterized as they are and not "fixed" in the rewrite without a decision:
   1. `onSubmit` is never read.
   2. `_onBlur` / validate-on-blur is never called.
   3. The debounced validation in InputBase is created but never invoked.
   4. Child removal re-validates `.config` (undefined), so it is always valid.
   5. Slider's `setStateValue` result isn't dispatched.
   6. The CheckBox and Slider `_onChange` never reach Form.
3. F0 characterization targets, each as a `_*.spec.tsx` on the untouched Form:
   1. Host element: a div `Form-container ${className}`, which gives the literal `undefined` class without className. Not a `<form>`.
   2. `onChange(status)` call sequence: mount call `{hasChanges:false,isValid:true,{}, {}, null}`, then one call per status update. `inputsStatus` / `inputsChanges` keys are `name` and `name+idx`. `currentConfig` = the last changed field.
   3. Wiring: both the `formconfig` and `formConfig` keys; recursion through plain wrapper elements; no wiring inside wired elements.
   4. Array fields: idxMap order → `arrayPosition` → `setStateValueArray({el, idx})`, including the inconsistent index-0 key.
   5. `valueMappers.toObject`.
   6. Nested Form: the child's status goes to the parent `onChange`; the child's own `onChange` is ignored.
   7. `useFormConfig`: `getData`, `getChangedData`, `resetForm` (throws without `resetState`), `isValid()` (sets errors), `validateFromState` / `errorMatching` (server errors).
   8. `passError` / `extractSetErrorsFromConfig` / `extractErrorScopes`.
   9. Loose dirty check (`'' != null`), InputNumber/Checkbox `getValue`, child removal.
   10. `validateOn:'blur'` (the positive-only change validation).

## 18. Watchdog verdicts round 2 (2026-11-18 evening) and follow-ups
1. **Commits:** `9d900aa` ToggleButtonGroup/ToggleButton, `3cad19a` D9 dispatch shim, `a4dcbba` D11 ModalStepper. All are Tier A PASS and each equals its verified snapshot.
2. **Dark-mode Select menu: ACCEPTED (decided by the watchdog)** as an intended delta.
   1. Light mode is byte-identical.
   2. Dark mode uses the existing token `--fn-bg-surface`.
   3. Evidence for condition (b): rc-webapp's `src/app-loaders/load-component/root-components.scss` (and Vanguard's own copy) already paint `.MuiMenu-root > .MuiPaper-root { background: var(--fn-bg-surface) }` at (0,2,0), above the base paper rule. Inside the app the menu therefore already uses the same token and nothing fights.
   4. To keep the app pixel-identical, the paper `color` stays MUI's `rgba(0,0,0,0.87)`. A dark `--fn-fg` would have changed inherited text and the currentColor ripple. The background is the only change, and it is only visible where root-components.scss is not loaded (e.g. Vanguard's Storybook).
   5. Story `select-ownCoreParity--menu-paper-follows-colour-scheme` pins it.
3. **D3 addendum (APPROVED):** `:where()` holds only variant/scoping conditions (`:where(.variant)`, `:where([data-slot])`, `:where(.Parent > *)`), never the ButtonBase reset. The reset stays inside each skin's single-class root rule, so D3's guarantee (reset beats host element rules like `button {}`) is unchanged.
4. **ModalHost (APPROVED) and coexistence:**
   1. A single shared instance with MUI is impossible while MUI-based overlays exist: MUI's default ModalManager is a module-private instance in `useModal` and is not exported.
   2. Vanguard's own `ModalRoot` uses no manager; it sets `body.style.overflow/marginRight` directly.
   3. The own-core `defaultModalManager` therefore becomes THE manager as Drawer/Popover/Modal are rebuilt (one instance across all own-core overlays).
   4. Until then the mixed case is pinned by stories `overlaystacking-ownCoreSelectFocus--modal-then-select` and `--drawer-then-select`, both green. They check:
      1. Focus enters the listbox and stays there 300 ms later, so an outer FocusTrap doesn't steal it.
      2. Arrows move focus.
      3. Escape returns focus to the trigger.
      4. The outer overlay's body scroll lock is still held after the menu closes.
   5. Plus the existing Drawer → Modal → Select stacking story.
5. **F0 rules:**
   1. The un-run `Form.spec.tsx` / `FormElement.spec.tsx` get the `_` prefix and are reported. Only stale setup is fixed, never assertion intent; each change is listed.
   2. Dead code is deleted only after F0, in its own commit, with reachability evidence.
   3. F0 mirrors the 3–4 most complex rc-webapp form shapes (requested from the verifier).
6. **F0 renames (setup-only fixes, assertions unchanged):**
   1. `src/core/Form/Form.spec.tsx` → `_Form.spec.tsx` (now runs):
      1. `RenderRoot` (removed from Vanguard) replaced by react-redux `Provider` for the same store.
      2. `render(ui, null, store)` → `render(ui, { customStore: store })` (current test-utils signature).
      3. `writeInInput(id, text)` → `writeInInput(id, text, within(document.body))` (helper now takes a scope).
      4. Explicit vitest imports.
      5. Result: 3/3 green on the untouched Form.
   2. `src/core/Form/FormElement/FormElement.spec.tsx` → `_FormElement.spec.tsx`: explicit vitest imports only. 1/1 green.
7. **F0 batch 1** (`_FormCharacterization.spec.tsx`, 9 cases, green on the untouched Form):
   1. Host div / `undefined` class.
   2. Mount status.
   3. Typing → dispatch + `hasChanges` + `currentConfig`.
   4. camelCase `formConfig` on Input is NOT stored (quirk).
   5. Recursion through wrappers.
   6. Arrays (arrays of objects; `inArrSetter` merges `toObject(value)` into the element at the idxMap position).
   7. `valueMappers.toObject`.
   8. Nested Form → outer `onChange`.
   9. `getData` / `isValid()` / `resetForm`.
   10. Finding: `useFormConfig` mutates `inputs` in place and calls hooks per key, so `inputs` must be built fresh per render (as consumers do inline).
8. **F0 batch 2** (`_FormCharacterization2.spec.tsx`, 6 cases, observed with a throwaway probe then pinned; green on the untouched Form):
   1. Mount: the empty status, then one call per `passError` field (field invalid).
   2. One `onChange` per keystroke. `inputsChanges` / `inputsStatus` accumulate. Validity aggregates over the reported fields. Errors show as translation keys (`validation_minLength`). `getChangedData` returns `{name:'ab'}`.
   3. InputNumber stores the parsed number.
   4. [quirk] Server errors via `errorMatching` show on the matched field AND clear `passError` on the others.
   5. [quirk] Removing a child reports once with `isValid: true` and keeps its stale keys.
   6. [quirk] `validateOn: 'blur'` never shows an error.
   7. All Form specs: 5 files / 27 tests.
9. **F0 batch 3:**
   1. `_FormErrorHelpers.spec.tsx` (5 cases): `extractSetErrorsFromConfig` string / array-by-position (also writes `errors`) / warns on a non-array field; `extractErrorScopes` takes the first result per element with jsonPath + message, plus the request-body object at that path.
   2. `_FormCheckBox.spec.tsx` (1 case): [quirk] CheckBox dispatches to the store but never reports to the Form status.
   3. All Form specs: 7 files / 33 tests, green on the untouched Form. Still owed: the rc-webapp complex-form shapes (requested from the verifier).

### D13 (revised after verifier Tier A, Select round 1): emulate emotion's tie-wins exactly
1. Finding: rc-webapp's EntityListPage has `.compactSelect :global(.MuiSelect-select) { min-height: 0 }` at (0,2,0).
   1. Before: MUI's (0,2,0) `min-height: 1.4375em` won that tie, because emotion was injected after all static CSS.
   2. After my port: the base rule was also (0,2,0) and the app CSS loads later, so an empty select collapsed by 2.9px.
2. Rule now:
   1. Every own-core base rule carries its host element type (+0,0,1); variable hosts use `:is(label, span, div)`. Equal-specificity consumer or Vanguard rules lose, as they did to emotion.
   2. The field/menu base (`TextField.scss`) is `@import`ed at the top of `InputBase.scss`, so Vanguard's own skin rules that were exactly one type above emotion (e.g. the focused-outline rules) still win, by coming later in the SAME file. Deterministic in every bundle.
   3. The ToggleButton base (D3 mixin inside the skin rule) is unaffected.
3. Exception: the notched legend keeps (0,1,0), because Vanguard's `.vanguard-input legend { display: none }` (0,1,1) beat MUI's hashed legend rule.
4. Pinned by story `select-ownCoreParity--consumer-equal-specificity-rule-does-not-collapse-empty-select`: red before (`0px`), green after (`17.25px`).
5. My style diff on 28 consumer stories plus 3 open states shows 0 style deltas.
6. vitest spec project: css include adds `src/core/_internal/InputBase/`, because the base now arrives through `InputBase.scss`. Nothing is excluded or relaxed; 48 spec files / 578 tests green.

### WordPress runtime evidence (verifier request): Select smoke in the package fixture
1. `package-fixture/smoke/bundle.test.tsx` gains one test, run in both bundles: open the installed Select, pick an option, check onChange and the displayed value, and that the trigger carries `data-slot="select-trigger"`.
2. The validator expects default 6/6 and wp 5/5, aggregate 22 (`package-counts.py`, `test_package_counts.py` selftest green, README updated).
3. This is a gate change, logged here for the watchdog.
10. **F0 batch 4 + completion:** `_FormRcWebappShapes.spec.tsx` mirrors the verifier's rc-webapp inventory.
    1. AdHeadlines/AdDescriptions arrays: positional `passError`, `currentConfig.arrayPosition`, per-index keys.
    2. EditAddress / EditPhoneNumbers: multi-field `errorMatching` incl. `propertyName`; `resetForm` keeps the shown errors and the stale `getChangedData` (quirks).
    3. ProductRatePlanEditForm: 18 fields.
    4. EditDescription: two sibling Forms, each reporting only its own children.
    5. rc-webapp runs its own fork of `useFormConfig` (same engine semantics, different imports and types) through Vanguard's Form, FormElement and inputs. That shared engine is what F0 pins.
    6. **F0 = 8 spec files / 36 tests, green on the untouched Form. Commits `49727fb` and `f60fc03` (test-only).**
    7. Next per D14: F1 (the `useFieldBinding` seam in inputs, no Form change), then F2 (registration replaces child-walking; Tier B on form screens after it).
11. **Storybook for handoffs:** my :6009 dies at the 2-hour background limit. If it's down, the handoff says so and names the SHA. The verifier then serves a detached worktree of that SHA (read-only use, they remove it afterwards).
12. **Select Tier A PASS (3c, tree 8cafbcd):** 0 computed-style deltas; rc-webapp 8/8; the dark paper delta is approved. Commit after the final package.sh (WordPress Select smoke, expected 22). The Tier B milestone sweep was requested from the verifier now, before F1/F2.

## 19. Milestone 1 accepted (watchdog), queue and open risks
1. Milestone 1 = 8 commits `9d900aa`…`eecd392`.
2. Tier B (corrected): about 40 form-heavy and Select/ToggleButtonGroup stories in `tierB-inputs.json` (~20 min), reused after each Form stage. It runs from the verifier's shadow rc-webapp copy on :6010. A Tier B delta preempts F1.
3. **Now: F1** (`useFieldBinding` seam in the inputs, Form untouched, F0 36 tests as the guard). One input per commit, in this order:
   1. InputBase (Input / Textarea / Select).
   2. CheckBox.
   3. RadioButton (+ Group).
   4. Slider.
   5. Autocomplete.
   6. ColorPicker.
   7. DateRangeInput.
   8. DatePicker / TimePicker.
   9. PhoneNumber.
   10. AvatarCheckbox.
   11. Verification*Input.

   After each: its own specs + F0, then a commit. F1 goes to the verifier as ONE Tier A item at the end (two form screens + `tierB-inputs.json`); no DOM/CSS change expected.
4. **Queued next group A, the rest of the text-field stack on the Select frame:**
   1. Order:
      1. Outlined TextField frame for Input (text / number / email / password, adornments, highlight backdrop).
      2. Textarea (multiline, autosize rows / minRows / maxRows).
      3. Native select (`SelectProps.native`).
      4. Non-outlined variants (filled / standard via the `textFieldProps` escape hatch).
   2. Each is a separate Tier A.
   3. Tier A screens to request:
      1. Vanguard Input / Textarea / InputBase stories (light / dark, empty / filled / error / disabled / focused).
      2. rc-webapp `editassistantgeneralsettings--default` (Textarea + Select) and `eventssetupformmain--empty` (Input / Textarea / date-time).
      3. One search-heavy screen with an Input adornment (verifier to pick).
5. **Queued group B, Menu family on ModalHost + MenuPopup:**
   1. Order:
      1. Menu + MenuItem (MenuItem's MUI branch removed).
      2. DropdownMenu.
      3. Popover / PopoverModal.
      4. Then the Drawer and Modal surfaces move onto `defaultModalManager`, giving the single manager.
   2. Tier A screens to request:
      1. Vanguard Menu / MenuItem / DropdownMenu / Popover / PopoverModal stories (open / closed, keyboard, light / dark).
      2. The OverlayStacking showcase stories.
      3. rc-webapp MediaBrowser `default-grid` (MediaItemActionsMenu) and one table toolbar with a DropdownMenu (verifier to pick).
6. **Open risk: the WordPress-without-MUI path is untested.**
   1. The `declared` package consumers stop at the pre-existing isolation probe, because MUI is a regular dependency. No test installs the WordPress bundle without MUI.
   2. It becomes testable when `@mui/material`, `@mui/system` and `@mui/x-date-pickers` leave `dependencies`.
   3. Earliest point, measured by the dependency graph:
      1. `@mui/x-date-pickers` after DatePicker and the range pickers.
      2. `@mui/material` / `@mui/system` after the last `@mui` import goes.
   4. Pull-forward option: when the WordPress entry's own import graph has no `@mui` left (it exports Select / Form / Input / Textarea / Button / … but no DatePicker), add a WordPress-only declared consumer that installs with MUI excluded via npm `overrides`. That tests the WordPress-without-MUI path before the full package is MUI-free.
   5. The check that tells when we get there is a grep of `dist-wordpress/index.js` for `@mui`, added to every handoff's WordPress evidence from now on.
7. **F1 done (seam in inputs, Form untouched):**
   1. `useFieldBinding` provides `bound`, `canWrite`, `toStored`, `write` (array-aware, scalar transform), `writeScalar` (plain setStateValue) and `notifyChange`.
   2. Commits:
      1. `a8ebd9e` InputBase (Input / InputNumber / ColorPicker-in-input / Textarea / Select branches).
      2. `9f60c48` CheckBox (writeScalar; still no Form notification, as F0 pins).
      3. `1416944` Autocomplete.
      4. `b0a345a` ColorPicker.
      5. `cf988cf` DateRangeInput.
   3. No own write path, so nothing to move: RadioButton, RadioButtonGroup, DatePicker, TimePicker, PhoneNumber, AvatarCheckbox, Verification*Input. They pass the config to InputBase or an inner Form.
   4. No input calls `useLegacyDispatch` / `dispatch(formconfig…)` directly any more. ModalStepper keeps the D11 shim.
   5. **Decision for the watchdog: Slider.** Today it calls `formconfig?.setStateValue?.(value)` without dispatching, so nothing is ever stored (F0 inventory). Putting it on the seam (`writeScalar`) would START storing slider values in consumer slices, a behaviour change. Recommendation: keep it as-is (not on the seam) and decide when Slider is rebuilt; rc-webapp usage to be checked by the verifier.

### D14 / F2 verdict per its own fallback rule: keep child-walking; go to F3 (PROPOSED, watchdog to confirm)
1. Why F2 (registration replacing `Children.map` + `cloneElement`) can't reach parity, from `Form.tsx`:
   1. **Wiring scope.** The walker only wires elements it reaches through `props.children`. It recurses through plain wrappers whose element has `children`, but never into what a component renders. With registration, every input that receives a `formconfig` would bind, including inputs rendered inside custom components that are unwired today. That changes `inputsStatus`, `isValid` and `hasChanges` for those screens.
   2. **Array indices.** `idxMap` follows the walk order of wired elements. Registration order follows render order (every field, including those inside components). Exactly the same cases diverge.
   3. **Status sequence.** The `onChange` sequence on mount (F0: empty status, then one call per `passError` field) comes from FormElement's effect order around the cloned children. Registration effects reorder it whenever registration and the walk disagree.
   4. Restricting registration to "what the walker would reach" needs the walker anyway, so nothing would be removed.
2. **Recommendation (the D14 fallback):** stop at F1 + F3.
   1. Prop-configured children keep FormElement + child-walking unchanged (all 36 F0 tests stay byte-identical).
   2. **F3** adds the user's goal additively. Inputs get an explicit `field="name"` prop. The seam (`useFieldBinding`) resolves the field config from the nearest Form's context when no `formconfig` prop is given, so no prop drilling. An explicit `formconfig` wins. Fields bound via `field` register with the Form through the seam (new path only, so no parity constraint).
   3. Then **F4**: the Redux-free per-form store behind the seam for `field`-bound forms and WordPress.
   4. Then **F5**: React 19 actions / pending.
   5. FormElement's child-walking may be retired later, once rc-webapp has migrated its forms to `field`. That's a future, separately decided step.
3. Collision check for the prop name `field`: none of Input, Textarea, Select, CheckBox, Autocomplete, ColorPicker, DateRangeInput, Slider, RadioButtonGroup, PhoneNumber, DatePicker, TimePicker or InputBase has a `field` prop today, so the name is free.

## 20. F3 and Tier B follow-ups
1. **Logs page ToggleButtonGroup "1px left shift" (Tier B): status (c), not reproducible in Vanguard.**
   1. Commit `0992855`'s differential story renders the MUI-backed legacy DOM vs the own core under LogsPage's exact override (and AgentChatAdmin's).
   2. Pill offsets, group geometry, margins and borders are identical.
   3. The verifier's own recapture matched on both builds (capture artefact).
   4. The verifier is asked to confirm, or to send element, rule and offsets. F3 is not handed off until this is closed.
2. **F3 implementation:**
   1. `useFormElementBinding` is extracted from FormElement, with identical code and hook order plus an `active` flag; FormElement = hook + cloneElement.
   2. Form exposes `fieldApi` through FormConfigProvider.
   3. `useResolvedFormConfig(formconfig, field, index)`:
      1. An explicit `formconfig` wins (dev warning if `field` is also given).
      2. `field` binds through the nearest Form's context with the same per-field logic.
      3. No Form above, or an unknown key: unbound, with a dev warning.
   4. Inputs: InputBase (Input / Textarea / Select), CheckBox (reports to Form on the field path), Slider (stores on the field path; legacy no-op kept), Autocomplete, ColorPicker, DateRangeInput, DatePicker, TimePicker.
   5. `useLegacyDispatch` now reads `ReactReduxContext` (no throw without a Provider; results dropped with a dev warning). Found because Slider, which had no Redux before, would otherwise have thrown.
   6. Guards, green on my side: F0 36 + F3 specs 8 + shim 4, and wide specs 60 files / 724 tests, wide stories 32 / 303.
3. **Tier B #1 (milestone 1, pack sel-r4): PASS**, from the verifier's shadow rc-webapp on :6010.
   1. 40 stories: Select 21/21, ToggleButtonGroup 6/7, root 38/40 with 2 unstable.
   2. Logs: not reproducible, closed.
   3. AgentChatAdmin: computed `border-left-color` on joined middle/last buttons with 0 px changed (under the -1px join). Logged as invisible; no round.
4. **F3 handed off as HANDOFF 5** (snapshot `558dbc3`, pack `f3`). Commits only after Tier A PASS + the final package.sh (WordPress `field` smoke, expected 26).
5. **Group A started (while F3 is in Tier A): Input / Textarea on the own TextField frame.**
   1. Emotion rules were extracted from the verifier's MUI baseline (:6007, read-only) for 17 Input / Textarea / InputBase-contract stories: 111 emotion classes, saved at `scratchpad/input-emotion.json`. Re-extract with `agentic-plans/uisdk-tools/extract-emotion-rules.mjs` if the scratchpad is gone.
   2. Element variants seen:
      1. FormControl root.
      2. OutlinedInput root: plain, adornedStart, adornedStart+End, multiline, multiline+adornedStart.
      3. The `input` / `textarea` `.MuiInputBase-input.MuiOutlinedInput-input`.
      4. Label: plain, shrink, filled+shrink.
      5. The asterisk, the legend, and the helper (contained ± filled).
   3. Plan:
      1. Generalise SelectTextField's frame (FormControl / label / outlined root / notch / helper, already MUI-exact incl. the D13 type bump) into a TextField frame with an input slot.
      2. Add the `input` slot (text / number / email / password / date; `inputProps`/`htmlInput`; `inputComponent`; startAdornment/endAdornment; inputRef; autoFocus).
      3. Add the `textarea` slot as a port of MUI TextareaAutosize (hidden shadow textarea measuring rows / minRows / maxRows, the same inline height style).
      4. Route MuiTextField's non-select outlined path to it. The native select and non-outlined variants come last.
   4. Guards: `_InputBase.mui.spec.tsx`, `_MuiTextFieldCompatibility.spec.tsx`, `_TextFieldV9Compatibility.spec.tsx`, the Input / Textarea stories and the InputBase MUI-contract stories, plus a style diff vs :6007 across the extracted story list.
   5. Tier A request when ready:
      1. The Vanguard Input / Textarea / InputBase stories (light / dark; empty / filled / error / disabled / focused).
      2. The two rc-webapp form screens.
      3. One Input-adornment screen (verifier to pick).
      4. `tierB-inputs.json` (Tier B #2 after group A).
