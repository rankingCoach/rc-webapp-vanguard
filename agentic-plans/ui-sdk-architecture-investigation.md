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
> 10. SnackbarRoot pub-sub subscription leak (2026-11-19): **DECIDED (watchdog), fix after H17's PASS** in a separate commit with a reproducing spec (0 observers after unmount, flat over N mounts, remount replay unchanged); the `[bug-lock]` in `_SnackbarRoot.mui.spec.tsx` is rewritten to the fixed behaviour in that commit. User-facing behaviour delta: none; internal leak fixed. Tier P scenario for verifier 2: mount/unmount ×200 + service events.
> 11. Class builders (2026-11-19): **DECIDED (watchdog), two documented contracts, not duplication.** Internal `cx` (src/primitives/react/class-names.ts, never exported) for own-core components that reproduce MUI markup (clsx semantics, collapses whitespace inside tokens); the public `@helpers/classNames` keeps its contract for everything else (drops non-string/empty entries, byte-identical for all-string calls). Conditions: a one-line header per file, src/helpers/_class-builders-contract.spec.ts pins the difference, `cx` never exported.
> 13. Shared host memory budget (2026-11-19, **decided-by-watchdog**). Run no wide gate or full spec project while the one-minute load exceeds 40. Cap Vitest at `--maxWorkers=4` and keep targeted runs at `--maxWorkers=2` by default. Run at most one Storybook. Ask the watchdog to reserve a wide slot and keep it clear of verifier Storybook swaps.
> 14. Durable verification evidence (2026-11-19, **decided-by-watchdog**). Put packs in `/Users/a.kott/vanguard-verify/packs/<sha>-<label>.tgz` and record each exact file's SHA-256 in `SHA256SUMS` there. Keep logs and traces used for decisions under `agentic-plans/` or `/Users/a.kott/vanguard-verify/`. The reboot removed pkg-16d and both verifier shadows. Close the `277bc04` sweep as partial and restart the broad consumer sweep on the shared H19b / H16c pack.

> 15. Mandatory release checks (2026-11-19, **decided-by-watchdog**). The canonical release gate runs both the `spec` and `scripts` Vitest projects with global fallback preload disabled. The `scripts` project runs serially after the pack fixtures so its export check sees the installed tarball. A failed project blocks handoff.

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
5. Naming convention (watchdog, fixed for the whole library, 2026-11-18): the bare `<component>` slot goes on the
   element that carries the component's own styling and state (it receives the consumer `className` and the state
   classes), with the state attributes on that same element. When the ComponentContainer wrapper is a distinct
   element it gets `<component>-container`. Parts are `<component>-<part>`. Existing own-core slots already follow it
   (`toggle-button` on ButtonBase, `select-trigger`, `text-field-*`, `menu-list`, `popper`). Implementer B adds the
   `-container` slots to rebuilt components' wrappers and announces it before touching those files; ComponentContainer
   gets an optional typed data-* pass-through in B's batch 1.

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
3. **User-confirmed on 2026-11-19.** The `./core/*`, `./common/*`, `./components/*` and `./helpers/*` wildcard
   subpaths stay removed as in `04fca13`. This differs from the master 2.11.0 manifest, which still lists them
   because master predates the MUI update. The merge takes master's version only. WordPress plugin deep imports
   are outside the available consumer source. The scripts project asserts the four keys are absent.

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
6. **Select complete** (verifier): Tier A PASS, WordPress static + runtime PASS (wp-mui 5/5 incl. the Select smoke), Tier B PASS.
   1. Type check asked by the verifier: `realistic-usage.tsx(36,45)` TS2322 on the 2-arg Select `onChange` is **pre-existing**. It is already present in the pre-Select package run (`xnfTOG`), and the producing types (`InputEventsProps.onChange` & `SelectOnChange`) are byte-identical to 9d3b75b.
   2. Proposed follow-up (type-only, watchdog): make Select's `onChange` accept the 2-arg form without the intersection conflict, when the TextField frame work touches InputBase's prop types.
7. **Tier B follow-ups (verifier):**
   1. Logs is CLOSED as a capture artefact.
   2. **AgentChatAdmin REOPENED as a real, visible delta.**
      1. In the fully disabled option group, the middle/last pills got a 1px grey left edge.
      2. Cause: the D13 tie. MUI's (0,3,0) disabled-join `border-left: 1px solid transparent` vs the consumer's (0,3,0) border.
      3. Fix: the ToggleButtonGroup parity rules carry the host element type (`:is(button, div, a, span, li)`, +0,0,1), so the disabled-join rule is (0,3,1) and the enabled join rules (0,2,1); the consumer's (0,3,0) still wins on enabled chips, as before.
      4. Story `--agent-chat-admin-disabled-group-keeps-transparent-joins`: red, then green.
      5. My earlier differential story missed it because an inline consumer `<style>` comes after emotion's runtime styles. Lesson recorded: differential "live MUI" columns are only valid when the consumer CSS order matches the app's. Otherwise, pin MUI's values explicitly.
   3. The fix ships in the F3 pack (HANDOFF 5b, snapshot `5f8feb1`) and is committed separately after PASS.
   4. Verification now runs from paired shadows (.472 on :6011, the candidate on :6010) built from one source snapshot.

## 21. D15: who won equal-specificity ties before (facts per shape)

### Setup at base 9d3b75b and in rc-webapp

1. Vanguard: no `createCache`, `StyledEngineProvider`, `injectFirst` or `insertionPoint` in `src`, `.storybook` or
   `index.html`; only `StyledSVG/provider.tsx` has a `CacheProvider`. MUI therefore uses emotion's default cache:
   the first `<style data-emotion="css">` is appended to the end of `<head>` on the first styled render, and later
   tags go right after the last emotion tag.
2. rc-webapp `html/react/src`: same, no emotion configuration anywhere. Default cache.
3. rc-webapp build (`vite.config.ts`, default `cssCodeSplit`): `app-build/index.html` has one static
   `<link rel=stylesheet href=index-<ver>.css>` (the entry CSS). `main.tsx` calls `createRoot().render()` and then
   `import("@rankingcoach/vanguard/style.css")`; Vite's preload helper appends that `<link>`
   (`assets/vanguard-*.css`, plus `App-*.css`) synchronously during the call, before React's scheduled render
   inserts the first emotion tag. 81 lazy routes; each route chunk's CSS is appended by the preload helper on
   navigation, so after emotion.

### Who won ties, per shape

| Shape | Order in `<head>` | Consumer CSS vs MUI emotion at equal specificity |
|---|---|---|
| Built app, entry CSS (e.g. AgentChatAdmin `optionGroup`, ScreenSizeSelector) | entry link, vanguard link, emotion | emotion wins |
| Built app, lazy route CSS (e.g. LogsPage, ColorSchemeToggle, AdminColorSchemeToggle, FrequencySelect) | ..., emotion, route link | **consumer wins** |
| Storybook dev (rc-webapp :6011, measured on AgentChatAdmin story) | 88 module style tags, then emotion (index 88 of 91) | emotion wins |
| Vanguard skin vs MUI (all shapes) | vanguard CSS before emotion | emotion wins |

1. Measured: Storybook dev order (script `css-order.mjs` in the scratchpad). Read from files: built `index.html`,
   the entry bundle's `__vite__mapDeps` (vanguard CSS listed with the `App` chunk), `main.tsx` order.
2. Not measured: the built app in a browser (rule: no live app). The built-app rows are static inference; the
   one step that is inference rather than file content is "Vite's preload `<link>` is appended before React's
   first render inserts emotion". Cheapest proof without the app: serve `app-build/` on a local static port with
   no backend and read `<head>` order once, or a prod Storybook build (`storybook build`) which uses the same
   preload helper for lazy CSS. Both are Storybook/test-kit-shaped; the watchdog decides.
3. The EntityListPage `compactSelect` rule (D13 finding) is a story fixture only (`stories/_fixtures`), so it has
   no production shape.

### Consequence for D13 (+type bump)

1. Storybook dev and the built app disagree for lazy route CSS. A bump reproduces Storybook (emotion always last);
   production lazy routes need the ported MUI rule to LOSE equal ties to route CSS.
2. Without emotion, the candidate's production order is entry link, vanguard link, route link. Ported MUI rules at
   their native specificity, emitted after the Vanguard skin inside `style.css`, reproduce production for all
   three rows: entry consumers lose (vanguard link is later), route consumers win (route link is later), skin
   loses (later in the same file). The bump only adds wrong wins over lazy route CSS.
3. Inventory of built rc-webapp rules that target Mui classes (`consumer-mui-inventory.mjs/json`, scratchpad):
   52 rules, 12 entry, 40 lazy. InputBase 0/19, ToggleButton 4/14, OutlinedInput 1/14, Autocomplete 2/3,
   ToggleButtonGroup 2/2, Select 0/2, Menu/Paper/Slider/FormControl/FormHelperText 1/0 each.
4. Concrete divergence today: ColorSchemeToggle and AdminColorSchemeToggle (lazy) set `border-color` on
   `.x .MuiToggleButton-root` (0,2,0). MUI's middle/last join `.css .MuiToggleButtonGroup-middleButton`
   (0,2,0) loses to them in production, so their joins take the consumer colour; the candidate's bumped
   `.MuiToggleButtonGroup-horizontal :is(button,...).MuiToggleButtonGroup-middleButton` (0,2,1) wins and paints
   the join transparent. Expected pixel effect is nil when neighbours share that border colour (margin-left -1
   overlaps), but the mechanism is wrong. Select lazy rules (PresenceKeywords (0,4,0), FrequencySelect (0,2,0))
   resolve the same in production and candidate.
5. Proposal (D15, for the watchdog): replace the +type bump with "native specificity, one compat partial emitted
   last in `style.css`" (ToggleButtonGroup parity block, TextField/Select base, later InputBase). Storybook-based
   verification then compares against production order: differential stories inject consumer CSS before the
   vanguard CSS for entry consumers and after it for route consumers. AgentChatAdmin stays correct (entry,
   vanguard later). Until decided, 5b stays as sent.

### D15 APPROVED (watchdog) and implemented (handoff 5c)

1. Ported MUI rules keep emotion's specificity and live in `src/styles/mui-compat.scss` (ToggleButton paint,
   ToggleButtonGroup joins, TextField/Select/Menu base). No component imports them.
2. Builds: `config/mui-compat-last.ts` (vite plugin `vanguard-mui-compat-last`, in `vite.config.lib.ts`, inherited
   by the WordPress config) compiles that file and appends it after everything else in `vanguard.css`, behind the
   marker `/*! vanguard:mui-compat (D15) must stay last */`.
3. Dev/test: `.storybook/preview.tsx` and `src/test-utils/vitest.setup.tsx` import the file and keep its `<style>`
   last in `<head>` (`src/styles/keep-mui-compat-last.ts`).
4. +type bumps removed: ToggleButtonGroup joins/disabled joins/root/fullWidth, every TextField.scss block (FormControl,
   InputLabel, asterisk, InputBase root, notched outline, Select, Select icon, native input, helper text, Modal,
   Backdrop, Popover paper, Menu list, MenuItem). D3 has no bump to keep: the ButtonBase reset is single-class.
   InputBase.scss no longer `@import`s TextField.scss.
5. Guard (a): `scripts/_mui-compat-order.spec.ts` checks both built `vanguard.css` files: exactly one compat block,
   at the end, identical to a fresh compile, and none of its selectors in the part before it. Guard (b): see the
   rc-webapp note `agentic-plans/ui-sdk-rc-webapp-consumer-notes.md`.
6. Production-order fixtures: `src/test-utils/consumer-css.tsx` (`EntryCss` prepends to `<head>`, `RouteCss` is a
   body `<style>`), pixel check `agentic-plans/uisdk-tools/pixel-diff.mjs` (snaps each element to whole pixels).

### Decisions for the user

**Confirmed on 2026-11-19.** D12 keeps all four removed wildcard subpaths absent. This differs from the master
2.11.0 manifest. WordPress plugin deep imports remain outside the available source.

**For information.** Typing and clearing text in Chromium retains native Undo/Redo history for the mounted
Textarea. The same curve occurs in a bare browser textarea. Undo/Redo behavior is preserved.

1. Before release, open the built rc-webapp once (not authorised inside this work) and read `<head>`: expected entry
   CSS link, then the vanguard CSS link, then (no emotion tag for migrated components), then route CSS links as you
   navigate. The checklist covers 13 tie rules, including [Navbar transition](./consumer-overrides.md). Eyeball the
   entry-chunk consumers whose rules tie with ported MUI rules:
   1. `root-components.scss`: `.MuiAutocomplete-paper`, `.MuiAutocomplete-listbox`, `.MuiMenu-root > .MuiPaper-root`.
   2. ComposedInputs slider track (`.MuiSlider-rail`).
   3. SetupKeywordChipsEditor add input (`.vanguard-input .MuiOutlinedInput-input`).
   4. ScreenSizeSelector (ToggleButtonGroup, 5 rules).
   5. CompetitorSelectionSearch helper text margin.
   6. AgentChatAdminSettingsModal option chips.
2. Other rc-webapp shapes not covered by the three-row table: `RenderRoot.tsx`, the public widgets and the
   WidgetPreview/WidgetImageRender hosts import `@rankingcoach/vanguard/style.css` statically, so there the vanguard
   CSS position follows import order inside that bundle. Same eyeball check if any of them shows a ported component.
3. WordPress (no consumer doc or fixture in reach prescribes an enqueue order; the WordPress plugin that consumes
   `dist-wordpress` is not on this machine). Before: emotion was appended last, so MUI won every equal tie against
   theme CSS. Now `vanguard.css` position decides: theme CSS enqueued BEFORE it behaves as before; theme CSS enqueued
   AFTER it wins equal ties against the ported rules. WordPress loads plugins before the theme, so plugin
   `wp_enqueue_scripts` callbacks usually run first and the theme stylesheet lands after Vanguard: the risky order
   is the likely default. Scope: only exact ties with Mui classes (Select/Input/Form are what the WordPress bundle
   exports); generic theme rules on elements (0,0,1) or `input[type=text]` (0,1,1) resolve as before. Mitigation if
   wanted: enqueue `vanguard.css` with the theme stylesheet as a dependency (or at a later priority). RISK LOGGED.

4. **DatePicker date format per locale (watchdog decision A, 2026-11-19; pre-existing, not changed).**
   The four older rc-webapp DatePicker files pass dash locales. With underscore keys in `getDatePatternFromLocale`,
   those seven sites show DD.MM.YYYY and log a console.error. The composed widget normalizes its locale before
   calling DatePicker and uses the matching pattern. The existing lookup would show the following for the older
   paths if it accepted dashes:

   | locale | today | after a fix |
   | --- | --- | --- |
   | de-DE, de-AT | DD.MM.YYYY | DD.MM.YYYY |
   | en-GB, es-ES | DD.MM.YYYY | DD/MM/YYYY |
   | en-US | DD.MM.YYYY | MM/DD/YYYY |
   | en-IE, en (no entry) | DD.MM.YYYY | DD.MM.YYYY (fallback, still an error) |

   Locked by `src/helpers/_locale-date-pattern.bug-lock.spec.ts`. The DatePicker port keeps the lookup byte-for-byte.

## 22. Group A: Input and Textarea on the own-core text field (handoff 6)

1. `TextFieldFrame` (FormControl root, label, notched outline, helper text) is shared by `SelectTextField` and the
   new `InputTextField`. Select DOM is byte-identical before/after the extraction (4 stories incl. the open menu).
2. `InputTextField` ports MUI 9.5 InputBase/OutlinedInput/TextField behaviour: focused/filled state machine
   (uncontrolled typing, autofill animation hook, mount read), root click focuses the input, `slotProps.input`
   InputBase keys override the TextField's own (MUI spread order; two InputProps bug-lock tests pin it).
   `TextareaAutosize` ports MUI's (hidden shadow twin, resize + ResizeObserver resync, maths in core/autosize.ts).
3. Routing (`MuiTextField.tsx`): outlined, non-select, no `inputComponent`/`InputProps.ref`/MUI slots/classes/function
   slots → own core; everything else stays on MUI until its own port.
4. rc-webapp `textFieldProps` inventory (65 uses): `inputProps` (58; aria-invalid, aria-describedby, autoComplete,
   inputMode, maxLength, style, min, type, aria-label), `name`, `autoComplete`, `autoFocus`, `error`, and one
   `InputProps.inputComponent` (stays on MUI). All covered.
5. Native select and filled/standard variants: no use in Vanguard or rc-webapp (`textFieldProps` never sets `variant`
   or `SelectProps.native`); the package fixtures only use them in type-level checks (`mui-typed.tsx`
   `@ts-expect-error` cases, `mui-gated.tsx` `native: false`, `components.tsx` `native: false`), none renders them.
   DECIDED (watchdog): stay on MUI for now. At the MUI-removal step: native select gets an own implementation on
   the shared frame (a real `<select>` in the input slot); `variant="filled" | "standard"` stay accepted and render
   as outlined with a dev warning, listed as an API/visual delta with this zero-usage evidence.
6. Inventory fixtures (`_TextFieldConsumerOverride.stories.tsx`): AiVisibilityCustomQueryDraftRow (route, 17 rules,
   6 states) and SetupKeywordChipsEditor (entry, 1 rule, 2 states): 0 differing pixels against the MUI-rendered
   legacy column. ArrayMapViewer's 2 rules target react-json-editor, not Vanguard.

## 23. Paths still on MUI (keep current; each line names what removes it)

Status 2026-11-19 (tip 0109680 + pack-16 Drawer). "Own" = renders on src/primitives; a remaining MUI path is a
fallback a consumer reaches only through the props named.

1. Text field: custom `inputComponent`, MUI `slots`/`classes`, function slots, `variant` filled/standard, native
   select → MUI-exit step (renders as outlined/own or warns). InputBase `Skeleton` import → trivial.
2. Autocomplete (own since H15, 01bcea8): MUI `Autocomplete` stays for consumers passing `slots`, `slotProps`,
   `componentsProps`, `sx`, `ListboxProps`, `ListboxComponent`, `ChipProps`, `PaperComponent`, `PopperComponent` or
   `renderGroup` (rc-webapp passes none) → MUI-exit step (port or warn). `useThemeProps` import → same step.
   AutocompleteWithAnchor: MUI `ClickAwayListener` → own ClickAway (next small item).
3. Menu / MenuItem: own for modelled props; MUI `Menu` for unmodelled consumer props (routing), MUI `MenuItem` outside
   own lists → MUI-exit step. Popover: `TooltipClasses` type only → types step (10). PopoverModal / PopoverPopper:
   MUI `Popper` for the non-modelled path → MUI-exit step.
4. Popper: own OwnPopper everywhere it is wired; the `altBoundary` handling differs from popper.js only where the
   shared resolution (ed9af0e) applies, no consumer passes it → keep, documented in Popper.tsx.
5. ProgressBar: determinate/indeterminate own (B, de017d4); `buffer` and `query` keep `ProgressBarMui` (MUI
   LinearProgress) → B's ProgressBar follow-up (no rc-webapp usage of either variant found yet; reachability map).
6. B leaf queue (B owns): Button (in progress, Grow), Chip (b9f8736 passed, merge pending), Breadcrumbs, Pagination,
   Slider, then the react-spring motion group. Accordion: `AccordionProps` type import only → types step (10).
7. Drawer (pack-16): own (ModalHost + Slide + Paper markup). Open, not reached by rc-webapp: (a) a Drawer open together
   with a MUI-rendered Modal (any MUI fallback above) has two scroll-lock owners, so non-LIFO closing can restore
   scroll early / leave it locked; removed when the last MUI Modal path goes (MUI-exit step); (b) with
   `disableAutoFocus`, focus restore targets the opener, not the first focus inside (MUI FocusTrap) → ModalHost
   follow-up if a consumer ever passes it.
8. AppBar, Toolbar, Snackbar, SnackbarRoot, FocusTrap, AIAssistantPanel → layout/overlay group (A, next after Drawer).
9. DatePicker (@mui/x-date-pickers), DateRangeInput, DateRangePicker (+ adornment), FlagAdornment, FormControl,
   Documents (DocumentDisplay/Upload) → pickers group (largest; x-date-pickers is the only @mui/x import).
10. `use-media-query` (MUI useMediaQuery), `helpers/hex-to-rgba` (@mui/system) → trivial.
11. VanguardThemeProvider (`createTheme`/ThemeProvider): source of the two `@mui` strings in `dist-wordpress/index.js`
    (createTheme's palette error message and `toRuntimeSource` template) → last, once nothing reads the MUI theme.
12. Types: `core/_internal/mui-legacy-props.ts` (public prop types derived from MUI types), `mui-slot-compat.ts` and the
    type-only imports above; emitted `.d.ts` files import `@mui/*` → vendored MUI types in the published declarations
    (§26).
13. Redux (not MUI): the bundles import `react-redux` as an external module (dispatch shim, legacy useFormConfig), so
    consumers must have it installed although useFormStore needs no Provider/store → deferred end step with the
    rc-webapp fork change.

## 24. Earliest point MUI can leave `dependencies` (measured 2026-11-18, scratch run, not committed)

1. Experiment: package.sh on fe3ace1 with `@mui/material`, `@mui/system`, `@mui/x-date-pickers` moved to
   devDependencies (scratch worktree, reverted). Result: **all 26 runtime tests pass**, including default-declared
   7/7 and wp-declared 6/6 where no `@mui/*` resolves (isolation probe: MODULE_NOT_FOUND for all three). MUI is
   bundled into both `dist` and `dist-wordpress` (not in rollup `external`), so at runtime nothing needs it installed.
   WordPress-without-MUI therefore works at runtime TODAY; the open risk is types, not runtime.
2. Types without MUI installed: the declared consumers' measured declaration pass shows 26 `Unused @ts-expect-error`
   (MUI-typed public props degrade to `any`) and 2 implicit-any parameters; the gated pass shows the same 6
   baseline errors as the MUI-present consumer (3 unused expect-error, 3 missing subpath modules: pre-existing).
3. So the earliest point is a TYPE milestone, not a runtime one. The 11 `.d.ts` files extend MUI prop types
   (AppBarProps, DrawerProps, AutocompleteProps (generic), AccordionProps, ToolbarProps, MenuItemProps, MenuProps,
   PopperProps, FormControlProps, TooltipClasses, and in `mui-legacy-props` TextField/Select/Menu/Modal/Paper/
   Snackbar/Backdrop/... props). Copying them is not small (they pull in SxProps/Theme). Options:
   1. `@mui/*` → devDependencies + optional `peerDependencies` (`peerDependenciesMeta.optional`): runtime unchanged
      (bundled); consumers that have MUI (rc-webapp: 9.5.0) keep identical types; consumers without it (WordPress)
      get `any` for those MUI-derived props (the 26 measured). Cheapest; one package.json change; declared consumers
      go green at runtime immediately (30/30 with F4).
   2. Bundle the declarations (vite-plugin-dts `rollupTypes`/api-extractor) so the needed MUI types are vendored into
      Vanguard's `.d.ts`. Exact types without MUI installed; build-tooling change, larger d.ts.
   3. Own prop interfaces per component as each is ported (groups B/C/pickers): the natural end state; MUI-derived
      types disappear with the last port.
   PROPOSED: 1 now (closes the never-run 13 runtime tests and the WordPress-without-MUI runtime risk), 3 over the
   remaining groups, 2 only if a typed WordPress consumer appears before the ports finish. Decision: watchdog.

## 25. F4 / F5 (handoff 7)

1. F4 `useFormStore<T, R>({ initialValues, inputs, validateOn, serverErrors, action, validateBeforeAction })`:
   per-form store (`primitives/core/form-store.ts`, framework-free, immutable snapshots) read with
   useSyncExternalStore. Same field-element shape as `useFormConfig`: each element's `reducer` is the values object
   and `slice` holds `set<Key>` / `set<Key>inArray`, so FormElement, the F3 `field` path and every input work
   unchanged. The setters are pure (FormElement calls `setStateValue` during render without dispatching, as Redux
   action creators allow): they return a marked local form action that the F1 seam's shim applies itself; legacy
   results take the old path. No react-redux store or Provider on this path. `getData` returns the typed store
   values. Note: the bundles still import react-redux as an external module (the shim and the legacy path), so a
   consumer must have the package installed; it needs no Provider/store.
2. F5: Form today renders a `<div>` (ComponentContainer) and never used its `onSubmit` prop. With the new `action`
   prop it renders a real `<form action noValidate class="Form-form">` inside the same container; without it the
   DOM is unchanged. `useFormStore` wires `options.action(values, previous)` through `useActionState` (`result`).
   Pending is read with `useFormStatus` in the form's children (browser story; jsdom does not commit the host
   transition state). Validation runs in the submit event with a side-effect-free check and prevents the submit when
   invalid (then shows the field errors); any field-error state update in the submit event or inside the action
   cancels the form's pending state (measured). A hook-level `isPending` was dropped: it only rendered inside the
   suspended transition.
3. Tests: `_form-store.spec.ts` (4), `_FormStore.spec.tsx` (7, no Provider), `_FormAction.spec.tsx` (3),
   `_FormAction.stories.tsx` (pending + result in Chromium), shim local-action spec; package fixture F4 smoke
   (both bundles, no Provider). F0's 36 tests unchanged and green.

## 26. Watchdog round on §24: rc-webapp gets MUI only transitively → types first (2026-11-18)

1. Fact (read-only): rc-webapp `html/react/package.json` declares no `@mui/*` or `@emotion/*` (121 deps, 72 devDeps)
   and no source file imports `@mui/*`; its lockfile shows `@mui/material` 9.5.0 only as a dependency of
   `@rankingcoach/vanguard`. The package-fixture consumers: `*-mui` install MUI on purpose, `*-declared` do not.
   So moving MUI out now would turn MUI-derived prop types into `any` in rc-webapp (consumer-visible type
   regression). DECIDED (watchdog): do not move yet; remove `@mui` from every published `.d.ts` first.
2. Guard added (cfaaeff): `scripts/_dts-package-imports.spec.ts`. Published `.d.ts` (default + WordPress) may only
   import declared packages; the 21 pre-existing undeclared ones are frozen and may only shrink. Red check: MUI
   out of `dependencies` fails it on 11 files.
3. Sizing the type work (measured): hand-written own prop types for the 11 files would change the public type
   surface (e.g. `MenuProps extends MuiMenuProps` accepts every MUI Menu prop today). Exact preservation =
   vendoring. api-extractor (already installed with vite-plugin-dts) rolls exactly the 28 MUI names the 11 files
   import, with `@mui/*`, `@emotion/*`, react-transition-group and popper inlined, into ONE file: 14.4k lines,
   559 KB, external imports only `react` and `csstype`. A probe file using Menu/Autocomplete/TextField/Popper/
   Transition props (incl. a rejected bad `variant` via `@ts-expect-error`) typechecks against it; the only gap is
   popper's `export * from './lib'` (4 names), fixed by rolling popper's lib types too.
4. Implementation plan (post-build, no source change): (1) `scripts/vendor-mui-types.mjs` produces
   `types/_vendor/mui.d.ts` for both bundles; (2) rewrite the `@mui/*` imports of the emitted `.d.ts` to that file
   (relative path); (3) guard: no published `.d.ts` imports `@mui`; (4) acceptance: the declared consumers' typed
   fixtures (`mui-typed.tsx`, `mui-gated.tsx`) give the same result as the MUI consumers; (5) then MUI →
   devDependencies (+ nothing else), package.sh 30/30 runtime in all four consumers. Estimate: half a day.
5. react-redux (F4 caveat) on the remaining-paths list: "not yet Redux-free for consumers: the package must be
   installed, no Provider or store needed", exit = the deferred end step together with the rc-webapp fork change.

## 27. Group B design: shared overlay pieces (for watchdog review; pure-core work starts now)

| Piece | Pure core (no React) | React wiring | Used by (MUI today) | Proves it first |
|---|---|---|---|---|
| Anchored placement (popper.js semantics: 12 placements, offset, flip, preventOverflow/shift, arrow, hide) | `core/anchored-placement.ts` | `react/Popper/use-anchored` (rAF/scroll/resize/ResizeObserver updates, portal) | Popover (Tooltip), PopoverPopper, DropdownMenu, PopoverModal, AutocompleteWithAnchor, Autocomplete, SearchableSelect, DatePicker, DateRangePicker (9) | PopoverPopper (thin wrapper), then DropdownMenu |
| Click-away | `core/click-away.ts` (event classification: composedPath/contains, touch vs mouse, ignore the opening event, inside-React-portal marker) | `react/ClickAway` (capture listener on document, React-tree marker via onClickCapture) | DropdownMenu, Autocomplete, PopoverModal (via Popper/ClickAwayListener) | DropdownMenu |
| Tooltip timing / hover intent | `core/tooltip-timing.ts` (enter/leave/enterNext delays, global hysteresis, touch long-press, focus-visible open, `disableInteractive`) as a state machine | `react/Tooltip` | Popover (MUI Tooltip with Vanguard skin) | Popover |
| Focus management | `roving-focus.ts` (exists) for MenuList; `core/focus-trap.ts` (tabbable order, sentinel wrap, restore target) | MenuList on MenuPopup (exists), `react/FocusTrap` | DropdownMenu (MenuList), PopoverModal, FocusTrap component, Drawer later | DropdownMenu (MenuList), then PopoverModal |
| Transitions | `transition.ts` (exists: Grow), add Fade timing | existing Grow wiring | DropdownMenu (Fade), Tooltip (Grow) | DropdownMenu |

1. Order: anchored placement first (9 users, every other piece sits on it), then click-away + MenuList focus
   (DropdownMenu proves both), then tooltip timing (Popover), then focus trap (PopoverModal). Menu/MenuItem already
   share MenuPopup + MenuOption from Select (popover-style positioning `position.ts`, not popper).
2. Verification method for placement: a differential story in Chromium that runs the real `@popperjs/core`
   (MUI's own dependency, dev-only) and the pure core on the same reference/floating rects across a scenario grid
   (all placements × viewport edges × offset/flip/shift/arrow), asserting identical x/y/placement/arrow, like the
   ripple parity spec. Parity target = popper with MUI Popper's default modifiers and Tooltip's modifier set.
3. Scope limit, stated: clipping boundary = viewport (`clippingParents` of nested scroll containers is not modelled
   in v1; recorded as a delta to check against the inventory before replacing MUI Popper in a component).
4. Each component keeps its public props (PopperProps-derived types stay vendored, §26) and its DOM classes
   (`MuiPopper-root`, `MuiTooltip-*`, `MuiMenuList-root`) as aliases, plus data-slot hooks; fixtures per inventory
   rule (root-components.scss Menu/Autocomplete paper/listbox are entry-chunk rules).

## 28. Group B review round (watchdog §26/§27) and positioning facts

1. §26 APPROVED with conditions: licence notices (vendored file header + a build-generated
   `THIRD_PARTY_NOTICES.txt` for every bundled npm package; today the package ships only Vanguard's own LICENSE and
   `legalComments: "none"` strips the bundled MUI notices; LOGGED FOR THE USER), generated-file determinism spec,
   rc-webapp typecheck against the candidate pack without MUI (verifier) = `.472` baseline, then MUI →
   devDependencies with package.sh 30/30, before continuing group B components.
2. MAJOR 1 (clipping parents) done in the core path: `react/Popper/dom-geometry.ts` ports popper's clipping
   parents, offset parent/containing block (transforms, contain:paint, will-change), composite rects and scroll
   parents; `react/Popper/compute-anchored.ts` = measure + clip + core + shift into offset-parent coordinates.
   Finding while porting: popper's computeAutoPlacement does not forward `altBoundary`, so `auto` is scored against
   the floating element's clipping parents while flip/preventOverflow use the anchor's (core `autoBoundary`).
   Differential in Chromium against real popper.js: 2520 rect scenarios + 2880 DOM scenarios (none / nested scroll
   container scrolled 140×90 / overflow:hidden / transformed ancestor / scroll inside transform × portal vs
   disablePortal(altBoundary) × absolute vs fixed × 4 anchor positions incl. partly scrolled out × 6 placements incl.
   auto × offset/preventOverflow variants): all exact.
3. MINOR 2 positioning strategies actually used: absolute in a body portal (MUI default: Popover/Tooltip,
   DropdownMenu, Autocomplete, AutocompleteWithAnchor, SearchableSelect, DatePicker, DateRangePicker, Menu);
   `strategy: fixed` (Popover `fixedPosition`, used by rc-webapp ExportAccountsChip and AiUsageKpisInfoIcon);
   `disablePortal` (PopoverModal default `renderInPortal=false`, used by Vanguard stories; rc-webapp passes `renderInPortal` in all 3 of its
   uses). All three are used, all three are in the grid. Popper `modifiers` in use are only built-ins (arrow,
   offset, flip padding/altBoundary/rootBoundary viewport, preventOverflow altAxis/tether, computeStyles
   adaptive/gpu); anything else (custom modifier, function options, other boundaries) is routed to MUI Popper by
   `popper-options.ts` and goes on the "Paths still on MUI" list if it ever appears.
4. MINOR 3/4 recorded for the tooltip and click-away work: keyboard path + aria semantics in the tooltip spec,
   global hysteresis in a browser story; click-away ignores events starting in a layer stacked above (ModalHost
   stack), mixed Select-inside-DropdownMenu/PopoverModal story.
5. §26 acceptance (package.sh, HEAD 40b71c5 + vendoring, MUI in devDependencies, scratch): runtime 30/30 in all four
   consumers; the consumers WITHOUT MUI give exactly the same type error set as those with MUI (default gated 6 =
   6, measured 6 = 6, identical line for line; WordPress 0 = 0), down from 33 measured before vendoring.
   Committed: 7d1c8ae (THIRD_PARTY_NOTICES), 0eebfc9 (vendored types + determinism spec).
6. FOR THE USER (licences of bundled code, from THIRD_PARTY_NOTICES.txt): default bundle 116 packages, WordPress 55.
   143 MIT, 10 Apache-2.0, 11 BSD-2/3, 2 0BSD entries (both bundles). Two to look at: `jszip` is
   "MIT OR GPL-3.0-or-later" (the MIT option applies); 5 packages ship no licence file (inline-style-parser,
   react-property, react-twitter-widgets, styled-components, videojs-youtube; all declare MIT, the notices file
   carries the declared id). Apache-2.0 packages (9: @googlemaps/js-api-loader, m3u8-parser, mpd-parser, mux.js,
   rxjs, url-toolkit, video.js, videojs-vtt.js, xlsx): none ships a NOTICE file, so the licence text suffices.
7. Pending: the verifier runs rc-webapp's own typecheck in the shadow copy against the candidate pack without MUI
   resolvable through Vanguard (error set must equal `.472`); then commit MUI → devDependencies.

## 29. Process log

1. TDD exception (b423180): the click-away decision spec (`_layer-stack.spec.ts`) was written together with the
   code, not red first. The parity spec against MUI was added after, with MUI's counts pinned. Rule from now on:
   behaviour ports start with a red spec against MUI's pinned values.
2. Watchdog standing rule (2026-11-18 evening): a status report is not a stopping point; a turn ends only when every
   queued item waits on a verdict/gate and nothing else can start, or on a blocker. Queue: DropdownMenu → Menu/
   MenuItem → Tooltip timing + Popover → focus trap + PopoverModal → Autocomplete/SearchableSelect; filler while
   waiting: the Trivial group (data-slot only, 10–15 per commit) and the agent surface (llms.txt, per-component docs,
   skill file; design entry first).
3. Codex review of handoff 10 (gpt-6.1-sol, high, read-only; 13 findings, all checked):
   1. Fixed, each with a red spec against MUI first: SSR `document` access in OwnPopper (1); MenuList items arriving
      after mount (2), focus by pointer/code moving the tab stop (4), consumer onKeyDown after navigation (9),
      Shift+Arrow (10), first focusable selected item (11); Fade child-ref churn/cleanup (5), `enter`/`exit` and extra
      props reaching Transition/the child (6); ClickAway layer rule narrowed to layers opened from inside the host
      (8: two independent dropdowns now behave like MUI).
   2. Not reproduced, defensive change kept: reopen during exit (3), MUI-pinned spec added; MenuPopup now gates
      `autoFocusItem` with `open` like MUI Menu.
   3. Accepted deltas (zero usage): RTL theme direction flipping popper placements (7: no RTL theme in rc-webapp or
      Vanguard); theme `motion.reducedMotion` (12: MUI default 'never', nothing sets it); TransitionGroup context for
      Transition (13: no Fade inside a TransitionGroup).
4. Own-core CSS marker (watchdog MAJOR from B's review): compat selectors scoped `:where([data-slot])` treated any
   data-slot on a Mui-classed element as own core; B is adding slots library-wide. The own core now emits an explicit
   `data-vg-core` on every element a compat rule targets (TextField frame parts, select trigger/native input/icon,
   text control and autosize shadow, ModalHost backdrop, menu popup/paper/list/option) and the selectors require it
   (text-control rules keep the slot filter too). Spec `_own-core-marker.spec.tsx`: no compat selector uses data-slot
   as the marker; an MUI-rendered TextField whose parts carry data-slot matches none of them (jsdom treats `:where()`
   as always true, so the spec unwraps it before matching). Side effect, toward parity: the required asterisk span
   never carried a slot, so its error colour rule never applied; it now does (MUI colours it red on error).
   Tell B when it lands so the defensive "never slot a Mui-classed element" rule can go.

## 30. Verification additions (user, 2026-11-18 night)

1. Unit tests count as verification too (the limit is no live backend calls, no live app session, no real user
   data). The verifier also runs rc-webapp's own Vitest specs for the files that import a handed-off component,
   paired against `.472` in the shadow copies; catch-up run on Select, Input/Textarea, ToggleButtonGroup, Form/field
   binding and the dispatch shim. A spec that passes on `.472` and fails on a candidate pack is a FAIL.
2. Tier P (final phase, after Tier C): performance and leak sweep per component (mount/unmount and open/close cycles,
   forced GC, heap / DOM node / listener counts, leftover timers and observers, body state after close, commit counts),
   paired against `.472`; the verifier builds the harness now and runs it early on rebuilt components. A NEW leak or a
   clear render-cost regression is a FAIL; a leak that also exists on `.472` is reported as pre-existing.
3. For the own code: every primitive/component that adds a document/window listener, timer, rAF loop, observer,
   portal node, body class/style, sibling aria-hidden or scroll lock gets a spec proving it is gone after unmount and
   after close. Backfill for what is committed (ButtonBase/ripple, ModalHost, MenuPopup, Popper, click-away, autosize,
   keep-last helper, layer stack) in one commit.
4. User decisions (2026-11-18 night):
   1. Every WordPress export is in use (curated list). "Used" = rc-webapp usage OR WordPress export. When rebuilt,
      Autocomplete, Popover, Accordion, Button, CheckBox, Skeleton, SlideTransition, Modal (ModalRoot/ModalService/
      ModalProvider), EditModal, Form, Input, Textarea and Select each get a WordPress smoke test in the package
      fixture.
   2. Components with no rc-webapp usage and no WordPress export are still migrated, last in order.
   3. The full rc-webapp unit suite runs once at the end, paired in the shadows.
   4. ONE BRANCH: B's `feature/ui-sdk-b-data-slots` is merged into `feature/ui-sdk-architecture-investigation` after
      every verifier PASS on a B batch (plain merge, no rebase/squash; conflicts go to the watchdog), and checked at
      least hourly for passed, unmerged commits.
   5. Pre-existing leaks/performance problems found by Tier P on `.472` are FIXED (own commit + reproducing spec).
   6. Duplicate-component families (B's audit) merge through B, approved per family by the watchdog.
   7. The old component-usage "zero usage" list counted only direct imports and is being rebuilt; nothing is treated
      as unused until the reachability map arrives (ModalService/DrawerService/snackbarService/actionBarService/
      videoPlayerService and rendering by other Vanguard components count). rc-webapp calls: ModalService.open 328,
      snackbarService.openErrorSnackbar 169, ModalService.openConfirmModal 71, DrawerService.open 56, ...
5. Zero-usage claims in this plan, re-verified against direct AND indirect use (2026-11-18 night):
   1. Native select / filled-standard variants (§22.5): no Vanguard component passes `native`/`variant` to
      InputBase/Select/TextField (grep of non-story src), rc-webapp's 65 `textFieldProps` never do. NOT verifiable for
      WordPress consumers (Input/Select are WordPress exports and take `textFieldProps`). The decision is unaffected:
      those props keep working through the MUI fallback until the MUI-removal step.
   2. PopoverPopper / AutocompleteWithAnchor: no rc-webapp import, not WordPress-exported, and no Vanguard component
      renders them (Autocomplete only mentions AutocompleteWithAnchor in a comment; Popover imports PopoverPopper.scss,
      not the component). Holds; migrated anyway (91e27ce).
   3. Slider with formconfig: rc-webapp renders Slider in 7 files, none binds formconfig/field; Vanguard renders it in
      Cropper and AgeSlider, neither binds. Holds.
   4. RTL theme direction (handoff 10 review, finding 7): Vanguard's theme (`createTheme` in VanguardThemeProvider)
      sets no direction (ltr); MUI is bundled into Vanguard, so a consumer's own MUI ThemeProvider is a different
      context the bundled MUI never reads; rc-webapp has no RTL theme. Holds for rc-webapp and WordPress.
   5. "MUI MenuItem inside Select" (Vanguard MenuItem): MenuItem renders the own MenuOption inside every own popup
      (OptionHostContext: MenuList now provides it, so also inside DropdownMenu); MUI MenuItem remains only inside
      MUI-rendered Menus until Menu is rebuilt (queue item 2.2).

## 31. Duplication audit (implementer B, watchdog decisions) → rebuild entries

Source: agentic-plans/ui-sdk-thread-b-log.md "3B duplication audit" (usage ledger there). Each merge lands with the
rebuild of the named family, public API unchanged.

1. ListPageCheckboxGroup / ListPageSwitchGroup (common/ListPage): TSX 54 %, SCSS 91 %, copied Redux filter dispatch.
   With the ListPage rebuild: Checkbox owns a boolean-filter renderer with a control adapter, Switch is a thin
   wrapper; module classes kept. Owner: A.
2. AcceptModal / ConfirmModal (74 % TSX, 78 % SCSS; ModalService call sites Confirm 67, Accept 5): with the Modal
   rebuild, ConfirmModal owns the decision dialog, AcceptModal becomes a wrapper (no negative action, centred buttons).
3. EditModal / BigAssEditModal: identical positive/negative fns, diverged async/loading/close-result handling. One
   shared core with the Modal rebuild; EditModal is a WordPress export (smoke test required).
4. TextEditDrawer / MultiSelectDrawer: shared drawer chrome (title/actions/width) with the Drawer rebuild.
5. DropdownMenu / Popover: arrow-placement SCSS copied (31 %) → one mixin with the Popover rebuild (queue 2.3).
6. PhoneNumberIMask / VerificationPinInputIMask: one internal mask adapter (forwardRef + IMask + synthetic change) in
   the imask/Input work.
7. B (approved, no merge): BarChart/HSBChart getCategories + repeated Apex options → pure helper with spec, output
   identical.

### DropdownMenu opened during load (verifier, handoff 10) → fixed in pack-11 (10b)

Cause (verifier repro): the trigger's Icon loads lazily (useDynamicImport) and re-renders only itself; the anchor SPAN
grows 0×0 → 16×16 after the popper positioned, and nothing re-ran it. Fix: OwnPopper observes the anchor with a
ResizeObserver (beyond popper.js; MUI's result was the settled position). Red→green story: Popper Parity ›
FollowsAnchorResizeAfterOpen; jsdom timing differential `_popper-timing.spec.tsx` stays equal to MUI.

## 32. Usage map (watchdog prep item 1) and how the queue uses it

Source (read-only, rc-webapp `html/react/src`, swagger and model mocks excluded):
`rc-webapp/tmp/research/vanguard-ui-sdk-visual-baseline/component-usage.md`. 297 value exports, 171 rendered as JSX,
55 PascalCase exports never imported from the root.

1. Ordering weight, not a usage verdict. User decision stands: nothing counts as unused until the reachability map
   arrives. Known undercounts in this map:
   1. Service-rendered components: ConfirmModal (67) and AcceptModal (5) via ModalService (B's audit), listed as zero
      here.
   2. Deep `dist/` imports: OverlayStackingService, OVERLAY_BASE_Z_INDEX.
   3. WordPress exports: EditableCard, SlideTransition (WordPress smoke test still required).
   4. Components passed as values (`component={X}`) are not counted.
2. Queue items it confirms as high-traffic own-core surfaces: Input 320 sites (formconfig ×115, textFieldProps ×64),
   Select 168 (valueAsDefaultValue ×58, translateOptions ×55), Popover 67 (message, position, wrapChildren; interactive
   ×5, arrow ×3, fixedPosition ×2) → 2.3 Popover/Tooltip covers those prop paths first, the rest stay on the MUI path
   until modelled (§23 rule).
3. Props-actually-passed lists drive the "modelled props" routing (Menu-style hybrid router) and the Tier A story set
   per component: every prop with ≥1 rc-webapp site gets a parity story before the component's MUI path is removed.

### 32.1 Reachability map (verifier 2, replaces the zero-usage list)

`rc-webapp tmp/research/vanguard-ui-sdk-visual-baseline/v2/reachability-map.md` at Vanguard ef2ee15, 300 value
exports: used directly 230, indirectly 50 (import graph + service methods, e.g. ConfirmModal ← openConfirmModal, 67
sites), WordPress only 4 (EditableCard, SlideTransition, TextHighlighted, useFormStore), unreachable 16 with evidence
(AdvancedMarker(F), AIBudgetEnd, CsvContentValidator, DragAndDropFile, FormControl, GoogleMapsMarker(+Default),
IMaskInput, MarkerF, OnboardingWelcomeAnimation, RcNavLink [rc-webapp stories only], SelectiveImportExample, SvgImage,
useSelectiveDynamicImport, VideoTrimmerTransformer). Ordering: direct/indirect by call sites first, WordPress-only with
the WordPress smoke, the 16 unreachable last (still migrated, user decision). Limits are listed in the map.

## 33. Queue 2.3: Popover on the own Tooltip (2026-11-19)

1. MUI Tooltip is used only by Popover, always controlled (`open` from Vanguard's own mouseenter/leave, focus/blur
   with `openOnFocus`). MUI's delay/hysteresis timers only drive onOpen/onClose, which Popover never passes: no
   visible effect, not modelled. Ported: trigger clone (aria-label/-labelledby or describedby, handler order
   consumer-first), touch user-select window + `MuiTooltip-touch`, OwnPopper + arrow modifier (padding 4), 200 ms Grow,
   MuiTooltip DOM, emotion styles in mui-compat.scss for MUI's default theme and VanguardThemeProvider (both rendered:
   rc-webapp with the provider, WordPress without).
2. Popper fidelity fixes found on the way, each its own SHA: popper.js `hide` modifier (70a5065), getLayoutRect size
   rule (98a144b, fractional widths moved arrows by 1px).
3. Evidence: jsdom DOM differential (15 cases), Chromium computed styles (24 cases × 2 themes; positions judged
   against MUI's live instance or a fresh popper.js run), Popover's MUI contract specs/stories unchanged and green,
   cleanup spec, WordPress package smoke (Popover hover → own-core tooltip, both bundles; counts 9/9/8/8 = 34).
4. Trigger slot: the wrapper span is `data-slot="popover-trigger"` (wrapChildren); with wrapChildren={false} the
   consumer's element is the trigger. rc-webapp Tier A screens: schedulecard `[class*="runTime"]`, InfoIcon story
   (`buildingblocks-infoicon--info-icon-story`, hover the popover-trigger span).

## 34. D10 efficiency and watchdog decisions (2026-11-19)

1. B's measurement (thread B log "(e) D10 efficiency measurement", tool agentic-plans/uisdk-tools-b/measure-exports.mjs,
   1693d92): root barrel static closure 1.97 MB gz; eager heavy libs per export (video.js 158 KB, apexcharts 147 KB,
   xlsx/jszip 146 KB [now lazy, b4ef33a/ec7b592], lexical 89 KB, lottie 68 KB, moment 23 KB in 24 exports); Text pays
   37 KB (html-react-parser + react-spring, animateWords; B f4 768ca96 lazy, pending); Table pays libphonenumber
   metadata via Toolbar → CheckBox → FormElement → valid-input; emotion still reached through Toolbar → Input →
   Skeleton and Button → Grow/useTheme (goes with the Button/motion rebuilds).
2. Decided by watchdog: package.json `sideEffects: ["*.css", "**/*.css"]` (false also marked style.css
   side-effect-free; other bundlers may drop it). Own commit, red/green spec scripts/_package-side-effects.spec.ts,
   package gate.
3. Decided by watchdog: StyledSVG moves from styled-components to static rules (B, f3) in the compat last block
   (runtime-injected styles won ties like emotion; D15 position keeps that); A drops styled-components from
   package.json in its own commit after B10 passes.
4. Decided by watchdog: B takes MUI-backed leaf components (no overlay/positioning/input-frame), same differential
   method, one component = one commit = one pack, verifier 2 Tier A. Order agreed: Collapse → Fade → Button →
   ProgressBar → Accordion → List/ListShowMore → Chip → Breadcrumbs → Pagination → Slider, then the react-spring motion
   group. A keeps Autocomplete/SearchableSelect, Select variants, Modal/Drawer/Snackbar, pickers, Tooltip users,
   FocusTrap/PopoverModal, AppBar/Toolbar; approves B's compat `@use` lines, applies B's WordPress smoke patches, takes
   primitive requests.
5. Standing rule (watchdog): the moment a pack goes to a verifier, its content is committed by path as its own SHA
   ("handoff N, verdict pending"); a FAIL gets a fix commit on top.
6. Differential canonical form (SearchableSelect): attribute, style-declaration and class-token order are sorted
   before comparing (no observable meaning); values and structure must match.

### 28.x Licence of ported code (decided by watchdog, MAJOR; 2026-11-19)

The own core ports MUI 9.5 and popper.js 2.11 source (hooks, components, algorithms) and MUI's emotion styles; that is
derivative work of MIT code. THIRD_PARTY_NOTICES.txt was derived from bundled packages only, so the notices would
vanish with the last MUI import. Since e86a665: config/derived-notices.txt (hand-maintained "Portions derived from"
section with both MIT texts) is appended by config/third-party-notices.ts; scripts/check-package-contents.mjs asserts
it in both bundles' notices in the tarball (package gate); every ported file starts with
`// Ported from <package>@<version> <file> (MIT)` (B informed; B sends other upstreams, e.g. react-spring, for A to add).

### 34.1 Package gate cadence (decided by watchdog, 2026-11-19, from pack-16)

Host load (163) made the full package gate (~11 min, 4 consumer fixtures) per handoff a main contributor to
verifier-capture noise. Per handoff: build + pack and the targeted checks for what changed (its specs/stories, its
WordPress smoke test alone, the compat-order guard). Full package.sh: when package.json / build config / notices /
exports change, every 3rd handoff (milestone), and before Tier C. Wide vitest runs keep --maxWorkers=4.
Pending full run: 501d8cb (styled-components dropped, package.json).

## 35. H16 scroll lock: ModalHost on MUI Portal's two-phase timing (2026-11-19)

1. **Exact trigger.** A temporary Drawer whose `open` is true in the same commit in which Vanguard's `ModalRoot` mounts
   (Vanguard `drawer--temporary` story: the Storybook decorator mounts ModalProvider > ModalRoot together with the
   story). ModalRoot's `useEffect([hasBlockingModal])` runs on mount with no blocking modal and writes
   `body.style.overflow = ''` / `marginRight = ''`. The own ModalHost had locked in that commit's layout effect, so the
   passive reset ran after it and removed `overflow: hidden` (the scrollbar-gap `padding-right` stayed). In rc-webapp,
   ModalRoot mounts with the app, long before a drawer opens, so the 6 rc-webapp drawer screens kept the lock
   (verifier 1, fingerprinted pack). It also applied to an own MenuPopup or SearchableSelect open on page mount.
2. **Why MUI survived.** MUI's Portal renders nothing in its first commit and sets its mount node in a layout effect.
   The content is portaled in the next (synchronous) commit, after the first commit's passive effects (ModalRoot's
   reset) have flushed. MUI then locks (`handleMounted` via the portal ref), and hides siblings earlier in a passive
   effect (`handleOpen`).
3. **Fix (f1924b5).** ModalHost follows MUI's sequence:
   1. Portal attached in the second commit (`portalReady`).
   2. `manager.add` (sibling aria-hidden) in a passive effect on open.
   3. `manager.mount` (lock) once the root is attached.
   4. Focus trap/auto-focus/restore keyed on content present.
   5. On close, focus restore before `manager.remove`.
   6. MenuPopup's enter effect waits for its paper node; that is the only consumer change. Per the watchdog rule
      (revert if a second consumer needs patching) the rework stays.
4. **Rejected.**
   1. Lock in a later passive effect only: still runs before ModalRoot when ModalRoot is a later sibling, and it
      diverges from MUI's order.
   2. Re-asserting the lock (observer or retry): it fights consumer code and leaves a window where a frame paints
      unlocked.
   3. Changing ModalRoot: its baseline behaviour is part of the app and stays as is.
5. **Cost.** At most +1 commit per open versus MUI (Drawer: equal; SearchableSelect: one fewer).
   `_modal-host-order.spec.tsx` asserts order equality and commits <= MUI + 1. The rule is that +2 or more than
   1.5x fails.
6. **Why the H16 differential missed it.**
   1. Its snapshots covered `body.innerHTML` (sibling aria-hidden) but not body's own inline style. That applied to
      Drawer, SearchableSelect, Autocomplete and Snackbar; all four now include it.
   2. The harness had no app root (ModalRoot). `_Drawer.body-lock.spec.tsx` now reproduces the story condition.
7. **Verifier 1 at 277bc04.** H16b passed scroll lock, the other ModalHost callers and first-render readiness.
   It failed on the BusinessProfile edit-drawer tooltip alone: x506 after fonts loaded (10/10 per theme) vs
   baseline x514 (light 10/10, dark 9/10). The tooltip's width increased from 163.6 to 171.1 px while the anchor
   stayed the same size. Popper now updates on a font event when its own layout size changes. Verifier 1 is
   rechecking `32a6b93` against the rebuilt `.472` shadow.
8. **H16c geometry diagnostic.** With the same settled 171.1 px tooltip and an unconstrained top placement, the
   MUI/own DOM differential gives x514 for an anchor centre at 599.8 px and x506 for one at 591.8 px. Reducing the
   viewport from 1280 to 1265 px with the first anchor fixed leaves x514 on both. These anchor centres are inputs,
   not measured story values. An 8 px anchor movement translates the popper and arrow together. Body scroll-lock
   padding can move a centred layout by about half the scrollbar gutter. A boundary/padding change can shift a
   clipped popper despite an unchanged anchor; compare the effective placement and popper's residual from its
   centred left edge. The [guarded-page probe](./mui-upgrade-gates/h16c-tooltip-geometry.cjs) records the anchor and
   arrow rects, clipping ancestors, viewport, offset parent, body padding and scrollbar gutter. The rebuilt light
   pilot gave x506 with the arrow centred in 9/9 rendered `.472` samples (one capture missing), same x and arrow
   offset as 10/10 on `32a6b93`. The paired verifier verdict determines H16c.
9. **H16c PASS (decided-by-watchdog).** The guarded fresh pair used `32a6b93` against `.472`, both on committed
   rc-webapp `73673465091`. All 39 measurable primary runs settled at x506 / width 171.1 px / arrow offset 74 px
   with zero centre error after fonts loaded. On both builds the first visible x and the +1 s x were 506 in every
   measurable cold-context run. The live probe measured anchor and arrow centres at x592 with a 1280×900 viewport
   and 0 px scrollbar width. Drawer Page matched 4/4. Neither side reproduced historical x514 from the lost shadow.
   The cause of the old difference remains unexplained. [H16c verdict](/Users/a.kott/vanguard-verify/v1/logs/H16c-verdict.md).
   H16b closes and Drawer brings the running tally to **29/31**. DatePicker and FormControl remain.

## 36. DatePicker off @mui/x-date-pickers (staged, 2026-11-19)

DatePicker (8 rc-webapp sites) is the last user of `@mui/x-date-pickers`. It uses DatePicker (desktop popper / mobile
dialog via `(pointer: fine)`), DateField (sectioned keyboard editing, the accessible section DOM), the day/year calendar
views (`renderDateViewCalendar`), PickersLayout, DatePickerToolbar with the keyboard-view toggle, and AdapterMoment.
Existing contract: 13 spec files + 2 MUI contract stories. Staged so nothing is wired before it is proven against the
MUI X component it replaces:
1. S1 DateCalendar primitive (day grid, month switch header, year view, keyboard navigation, min/max/disablePast,
   focus) vs MUI X DateCalendar: DOM + keyboard timelines, Chromium computed styles. Not wired.
2. S2 DateField primitive (sections: format parsing, typing, arrows, Backspace, paste, clear, invalid states, the
   accessible section DOM) vs MUI X DateField. Not wired.
3. S3 picker shell on OwnPopper (desktop) / ModalHost dialog (mobile), toolbar + keyboard-view toggle, layout; then
   the DatePicker switch, judged by the 13 existing specs + the frozen-reference differential + Chromium parity.
Each stage is its own commit; S3 is the handoff. `@mui/x-date-pickers` leaves `dependencies` only after S3 passes.

### 36.0 Watchdog decision and reachable-surface inventory (2026-11-19)

**Decision (decided-by-watchdog): APPROVED WITH CONDITIONS.**
1. Inventory before S1 (below).
2. The S2 parity matrix is locale × format plus paste, IME, Backspace across sections, invalid/partial input,
   min/max clamp, readOnly/disabled, controlled change mid-edit and the section a11y DOM. Each case is a differential
   vs MUI X, mutation-checked.
3. AdapterMoment stays: the own code talks to one adapter seam, so a later moment swap is one change.
4. S3 desktop/mobile switch on the ported useMediaQuery `(pointer: fine)` incl. the SSR/first-render value. The mobile
   dialog goes on ModalHost only after H16b PASS. Scroll lock and focus restore asserted; Tier P open/close scenario.
5. Stop rule: two behaviour FAILs at a verifier on S2 or S3 → DatePicker stays on MUI X as the one remaining user,
   logged with the evidence.
6. MUI X is MIT: derived-notices entry plus file headers.
7. The cheaper, more reachable @mui/material leftovers go before S2/S3 (§36.1).

**Public API.** `DatePickerProps` is a closed interface with no pass-through:
`value, required, label, minDate, maxDate, disablePast, formconfig, field, index, closeOnCLickAway, onChange, locale`.
Every one of these must be implemented; no MUI X prop is reachable from outside.

**rc-webapp sites (static correction, decided-by-watchdog, 2026-11-19).** At committed
`73673465091`, there are 8 JSX calls in 5 files. The first four files account for seven direct
`<DatePicker>` tags. The composed widget accounts for one tag through a package-top-level alias.

1. GoogleAdsPerformanceDateRange (2): locale "en-GB", label, required, value, minDate, maxDate, onChange, key.
2. BoostDuration (1): locale, disablePast, label, required, value, minDate, onChange.
3. PostCount.step (2): locale, required, disablePast, closeOnCLickAway, value, maxDate/minDate, onChange.
4. EventsSetupFormMain (2): locale, required, disablePast, closeOnCLickAway, value, maxDate/minDate, onChange, label.
5. DatePicker.composed (1) imports `DatePicker as VanguardDatePicker` from `vanguard`. The editable
   tag passes `key`, `value`, `minDate`, `maxDate`, `locale`, `closeOnCLickAway` and `onChange`.
   It uses `toDatePatternLocale(dateLocale)` and publishes the chosen ISO day to the tree state.
   [Composed DatePicker](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/ai-conversations/widgets/ai/ComposedViewConversationWidget/components/inputs/DatePicker.composed.tsx:49).

No formconfig/field use was found at the sites.

**Locales.**
1. The older paths pass dash locales, including the literal `en-GB`. `localeFormatted` converts the
   location locale from underscore to dash (de-DE, de-AT, en-GB, en-IE, en-US, es-ES, …).
2. The older seven calls fall back to `DD.MM.YYYY` and log a console.error because the lookup uses
   keys like `de_DE`. The composed widget converts dash back to underscore with `toDatePatternLocale`,
   so known location locales use their configured date pattern. Accepting dash locales in the shared
   lookup would change the older fields' visible format and remains a separate user decision.
3. The port keeps the lookup as is. The S2 matrix still covers every format the map can produce: MM/DD/YYYY,
   DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY, YYYY-MM-DD, YYYY/MM/DD.
4. Week start: moment's global locale. Vanguard passes no adapterLocale and rc-webapp never calls `moment.locale()`,
   so the reachable case is `en`, week starting Sunday.
5. Digits: Latin only (no ar/fa/hi locales in the map).

**Paired consumer handoff.** Include the existing composed widget spec and the `Data` and `Narrow`
stories. Cover the active location's actual date pattern and the hidden section field's serialized
day. The spec asserts serialized field and replay output and calls the `formatIsoDay` helper
directly. `Data` and `Narrow` render the widget without a play step. Claim publication coverage
only if a guarded synthetic day pick in the eventual pair updates the `asOf` tree state. This is
queued for the consumer handoff.
[Composed spec](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/ai-conversations/widgets/ai/ComposedViewConversationWidget/components/inputs/_DatePicker.spec.tsx:8) ·
[Data and Narrow stories](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/ai-conversations/widgets/ai/ComposedViewConversationWidget/components/inputs/_DatePicker.stories.tsx:17).

**WordPress.** DatePicker is not exported from index-wordpress.ts.

**Reachable MUI X behaviour.** Only through the props above: the DatePicker shell (desktop popper / mobile dialog by
`(pointer: fine)`), DateField sections in the locale pattern, the day/year calendar views, min/max/disablePast, the
toolbar keyboard-view toggle (mobile) and closeOnClickAway (Vanguard's own outside callback).

### 36.1 Order check: what is still on @mui/material after H19 (cac6a6b)

No item below is reached by rc-webapp, the WordPress bundle or another Vanguard component through a modelled prop.
Each remaining import is a type, the last theme step, an unreachable component, or a fallback route for public
props the own core does not model.

1. Types only:
   1. Accordion (`AccordionProps`)
   2. Popover (`TooltipClasses`)
   3. `_internal/mui-legacy-props.ts`, `_internal/mui-slot-compat.ts`

   These go to the types step (§23.12): vendored types.
2. Fallback routes, reachable only with unmodelled public props:
   1. Autocomplete (slots, slotProps, componentsProps, sx, ListboxProps, ListboxComponent, ChipProps,
      PaperComponent, PopperComponent, renderGroup; useThemeProps)
   2. Menu (unmodelled MuiMenuProps; useThemeProps, useRtl) and MenuItem (outside own lists)
   3. Snackbar (slots, slotProps, ContentProps, ClickAwayListenerProps, TransitionProps, componentsProps, sx,
      classes; useThemeProps)
   4. AppBar / Toolbar (sx, component, classes, elevation; useThemeProps)
   5. PopoverPopper / PopoverModal (popper.js modifiers or options the own Popper does not model)
   6. `_internal/InputBase/MuiTextField.tsx` (non-outlined variants, native select, custom inputComponent, MUI slots)
3. Unreachable: FormControl. Reachability map: no runtime importer; rc-webapp only has a `.FormControl-container`
   SCSS selector. It is migrated last, per the user decision.
4. Last: VanguardThemeProvider (`createTheme`/`ThemeProvider`, the source of the 2 `@mui` strings in dist-wordpress).

**Consequence for the order.** None of these is cheaper and more reachable than S2/S3 in rc-webapp terms. The
fallback routes are the "MUI-exit step". Their props are part of the public types, so removing MUI means either
implementing each prop or narrowing the types (a breaking change for a next major). That needs a decision before
MUI can leave `dependencies` (§24). Proposed: (a) types step (vendored, no API change); (b) exit step per fallback,
implement what has any usage evidence and keep MUI as an optional dependency for the rest until the next major.

### 36.2 Watchdog decisions on the locale finding and the MUI-exit step (2026-11-19)

**A. Locale finding: user decision, do NOT fix.**
1. The port keeps `getDatePatternFromLocale` byte-for-byte, including the console.error.
2. Bug-lock spec: `_locale-date-pattern.bug-lock.spec.ts`.
3. The per-locale before/after table is on the user's list.

**B. MUI-exit step, interim rule for this major (identical API is a hard limit; narrowing is not granted).**
1. Types are vendored, no API change.
2. Fallback props get implemented on the own core when either:
   1. they have reachability evidence (rc-webapp, service paths, other Vanguard components), or
   2. they are cheap and exact (`className`, `classes` keys already emitted, `style`, flat `sx` as on ToggleButton).

   Each component declares what remains.
3. The remainder keeps a working MUI fallback, isolated in its own module behind a lazy boundary. The eager import
   graph of every public export (ESM build) must contain zero `@mui/*`; a gate script over the built graph asserts
   this per export and states the count. `@mui/material` stays a regular dependency in this major. Removing it and
   those props goes on a logged list for the next major (user decision).
4. Lazy consequence: a fallback route renders async on first use. That is acceptable only because it is unreachable
   in rc-webapp. Once loaded the fallback renders the same DOM, and the MUI contract specs keep running against it,
   awaiting the chunk.
5. WordPress is a single file, so there are no lazy chunks and nothing is stripped. Deliverable: a table of the WP
   exports that still pull `@mui/*` into dist-wordpress through a fallback route, with the byte cost of each. It goes
   to the user with the question "does the plugin pass any of these props?". Until answered, WP keeps them.
6. FormControl and VanguardThemeProvider go last. VanguardThemeProvider needs a separate proposal to the watchdog
   first, since it is where consumers may theme.

**C. S1.** Refactor onto the adapter interface before the parity spec goes green, so the green proves what ships.

### 36.3 Eager-@mui gate: baseline at 0f9e383 + build (2026-11-19)

The gate has three parts:
1. `config/module-graph.ts` writes `.vg-build/module-graph.<outDir>.json` on every build: chunk → module ids with
   rendered bytes, static and dynamic imports. The directory is gitignored and not packed.
2. `scripts/check-eager-mui.mjs` walks each public export's static closure of dist/index.js.
3. `package.sh` records `eager-mui.txt` and `eager-mui-wordpress.txt`. `--assert-zero` becomes the gate once every
   fallback sits behind a lazy boundary.

**Baseline: 32 of 298 exports.** The eager @mui sources are:
1. DatePicker / DateTimePicker (MUI X, §36 S1–S3).
2. Autocomplete (fallback).
3. MuiTextField fallback in InputBase. This one drags in Input, InputBase, Select, Textarea, SearchableSelect, Table*
   (4), PhoneNumber, RichTextEditor, TextEditDrawer, TimePicker, ColorPicker, DateRangeInput, DateRangePicker,
   DrawerRoot/DrawerService and AIAssistant.
4. Menu (fallback), MenuItem.
5. Snackbar / SnackbarRoot (fallback).
6. PopoverModal (MUI Popper fallback).
7. AppBar / Toolbar (fallback).
8. ProgressBar (B: buffer/query keep MUI LinearProgress).
9. FormControl (unreachable).
10. VanguardThemeProvider.

Fixing the InputBase fallback alone clears most of the list.

**WordPress (deliverable for the user, B.5): 4 of 64 WP exports pull @mui/* through a fallback route.** Bytes are
rendered module sizes before minification; the MUI core is shared, so they do not add up.

| WP export | @mui code in its graph | packages |
| --- | --- | --- |
| Autocomplete | 737,581 B | @mui/material, @mui/system, @mui/styled-engine |
| Input | 531,529 B | same |
| Select | 531,529 B | same |
| Textarea | 531,529 B | same |

Question for the user: does the WordPress plugin pass any of the fallback props to these four (Autocomplete: slots,
slotProps, componentsProps, sx, ListboxProps, ListboxComponent, ChipProps, PaperComponent, PopperComponent,
renderGroup; Input/Select/Textarea: textFieldProps with a non-outlined variant, native select, custom
inputComponent, MUI slots/classes)? Until answered, WordPress keeps them.

**Allow-list (watchdog decision, 2026-11-19).** The gate allows one context module, `@mui/system/RtlProvider`
(MUI's RtlContext, ~1 KB, React-only). A context works by object identity, and `_MenuOwnRouting`'s RtlProvider case
needs MUI's own object. Conditions:
1. 2 KB cap.
2. The module's own eager graph contains no further @mui/@emotion module.
3. The gate output states the allow-listed count separately. Count: N = 1.
4. On the next-major removal list together with Menu's RTL routing.

**MenuItem reachability.** Inside an own-core option host (Menu's own route, Select, SearchableSelect) Vanguard
MenuItem already renders the own MenuOption. rc-webapp's 3 MenuItem sites are all inside Menu (AccountNavMenu), and
TableToolbar / SearchableSelect use it inside own hosts. The MUI MenuItem path is reached only outside an own host
(Menu's MUI route or a standalone MenuItem): not in rc-webapp, and MenuItem is not a WordPress export. So it needs
only the lazy split (done), no new route.

**Intermediate build (bfbe154 + WP fix 764a089): eager @mui 4 of 298 (+1 allow-listed context module).** This
count never described a shippable build. Autocomplete's input was missing on first render while its reachable MUI
TextField loaded. These were the eager paths in that intermediate build:
1. DatePicker / DateTimePicker: MUI X, §36 S1–S3.
2. VanguardThemeProvider: separate proposal to the watchdog first.
3. ProgressBar: B's buffer/query route on MUI LinearProgress; B's to split.

Split into lazy fallback modules: MuiTextField (Input, Select, Textarea, SearchableSelect, Table*, …), Autocomplete,
Menu, MenuItem, Snackbar, AppBar, Toolbar, PopoverPopper/PopoverModal (shared MUI Popper), FormControl. Theme
defaults on the own routes come from `useThemeDefaultProps` (5.3). The initial test setup preloaded the fallbacks.

**WordPress.** The single file inlines the fallbacks. `config/inline-mui-fallbacks.ts` turns them into static imports
for the WP build only. FINDING, fixed before any pack: the WordPress cleanup keeps only index.js and icon/loading
chunks, so lazy chunks there would have been deleted and the bundle broken. The new `check-wordpress-dynamic-imports`
gate catches that. The WP table (4 of 64: Autocomplete, Input, Select, Textarea) is unchanged and remains the user
question.

**Owed for the next package gate.** Consumer-side evidence: a consumer's own MUI ThemeProvider with
`components.MuiTextField.defaultProps` around a packed Vanguard Input, on .472's Vanguard and on the candidate. Does
the default apply? MUI and emotion are both bundled in dist, so the expected answer is no on both.

**Correction (2026-11-19, package smoke on the B.3 build).** The MuiTextField route is REACHABLE, so its lazy split is
reverted to a static import. The trigger is Autocomplete's `renderInput`, which passes `InputProps.ref` (the popper
anchor) and so always routed its text field to MUI's TextField. That covers rc-webapp's 26 Autocomplete sites and
WordPress. IMask inputs passing `inputComponent` take the same route. With the lazy boundary, the packed Autocomplete
rendered no input on first use (smoke: no combobox).

**Packed count at c8e69a2: 24 of 298 eager exports, plus one allow-listed context module.** This count predates the
planner correction below.

**Planner correction (decided-by-watchdog).** The create-event popover passes `centerPopover` and `renderInPortal`
together at `EngagementPlannerCalendar.tsx:298`. The centered flip modifier uses the anchor clipping boundary and the
portaled overflow modifier uses the popper clipping boundary. The own resolver deliberately falls back for that
combination. The c8e69a2 pack omitted the card on first render. `9a0dece` keeps the reachable PopoverModal fallback
eager. After the text-field port and before DatePicker S1, port separate flip and overflow boundaries, with a
popper.js differential across placement, boundary, portal mode and scroll offsets and a paired planner check.

**Corrected packed count at `32a6b93`: 25 of 298 eager exports, plus one allow-listed context module.** This build
includes the restored planner fallback. WordPress reports 4 of 64. The shared H19b / H16c pack's 4,231 dist files match the build
and its WordPress graph reaches 336 files with zero missing targets. The eager reports are in
`/Users/a.kott/vanguard-verify/logs/32a6b93a2683ea766d4406fae4693e918dbd3a93-h19b-h16c/`.
The corrective source spec evidence was green on its scoped checks. The `scripts` project was not run. The
package export scan had two JSDoc false failures since `764a089`, found at the master merge (§36.13).

**ProgressBar integration (decided-by-watchdog).** `f94d932` passed against evidence from the original pack and a
verified rebuild of the same source. The attempted `d4cdc1d`-only follow-up placed the ProgressBar spec at the same
insertion point as the MenuItem story entry. The watchdog approved aborting that attempt, merging `9015f5c` and
retaining both entries. The branch merge at `5405cff` included both entries cleanly. The preload audit found 22
allow-listed files (17 specs, five Storybook files), with zero unexpected or stale entries. Targeted ProgressBar and
MenuItem specs were green, 38/38. The expected post-merge eager count is **24 of 298**, plus the same context module:
the pre-merge list has ProgressBar, and its MUI route is now lazy. The graph on disk still belongs to `32a6b93`;
the H20 package gate will measure the merged graph.

**H19 masked field correction (decided-by-watchdog).** `4d88e97` uses MUI InputAdornment inside DateRangePicker's
masked MUI TextField. The real-picker differential pins its full class attribute. The preset field, DateRangeInput
and FlagAdornment keep their own adornment. Restore the own calendar adornment in the same change as the own
TextField `inputComponent` port.

**H19 closed (decided-by-watchdog).** Verifier 2 passed H19b on exact `32a6b93a2683ea766d4406fae4693e918dbd3a93`
against `9d3b75b`, pack SHA-256 `bd4cc895eb200808677f95d5a28dd644173b59c997f284e1e4a7d6281d2ab6b0`.
In the default Vanguard story, the packed DateRangePicker module and CSS matched the reference's complete calendar
end-adornment class list, flex and 38 px height on 2/2 isolated loads per side. Guard self-tests and fingerprints
passed, with zero blocked destinations during the probes. [Reference capture](/Users/a.kott/vanguard-verify/v2/out/h19b-adornment-9d3b75b-final.json),
[candidate capture](/Users/a.kott/vanguard-verify/v2/out/h19b-adornment-32a6b93.json).
D15 tie #13 was accepted at `73d25d7` for the customer app entry.

H19 brought the running MUI verification tally to **28/31**, before the H16c verdict. It adds AppBar, Toolbar, FocusTrap and the DateRangePicker
dropdown. Drawer (H16c), DatePicker and FormControl remain on that tally. VanguardThemeProvider remains a separate
MUI-exit task. H19 also covers the DateRangeInput/adornment work, the AIAssistant panel and Documents rows within
the exercised scenarios. The AIAssistant generate and tone actions remain undriven, Documents has no rc-webapp
story, and WordPress coverage for H19 is static. The FocusTrap fixture ended on the body on both builds, so it did
not establish restore-to-trigger behavior.

The initial global spec preload hid the first-render failure. `VG_NO_FALLBACK_PRELOAD=1` exposed it. Since `f703205`,
the full spec project runs without global preload by default. The explicit, checked-in allow-list records the spec
files that exercise an unmodelled prop and need a preload.

Audit of the remaining lazy routes (Menu, MenuItem, Snackbar, AppBar, Toolbar, PopoverPopper/PopoverModal, FormControl,
Autocomplete):
1. Every failure without preload uses a deliberately unmodelled prop (`component`, `classes`, `sx`, `slotProps`,
   `transitionDuration`, transition props, a standalone MenuItem).
2. rc-webapp's Menu shape (AccountNavMenu: anchorEl, open, onClose, height, width, `Render`-wrapped MenuItems) takes
   the own route.
3. Popper, PopoverModal and AutocompleteWithAnchor had no failure.

Consequence: the Input family (Input, InputBase, Select, Textarea, SearchableSelect, Table*, PhoneNumber,
RichTextEditor, TextEditDrawer, TimePicker, ColorPicker, DateRange*, DrawerRoot/Service, AIAssistant, Autocomplete)
stays eager on @mui through MuiTextField until the own text field models `InputProps.ref` and `inputComponent`. That
is the next B.2 item ("implement every prop with reachability evidence"), not a lazy split.

### 36.4 Watchdog decision on the B.3 correction (2026-11-19, decided-by-watchdog)

1. **Order.** The own text field modelling `InputProps.ref` (anchor ref on the InputBase root) and `inputComponent`
   (IMask) goes FIRST, before S1–S3. It is reachable: rc-webapp's 26 Autocomplete sites and WordPress render MUI's
   TextField today. DatePicker waits. S1's Codex draft may continue unwired.
2. **Evidence for that port.**
   1. Differential vs MUI TextField for the two shapes.
      1. Autocomplete's renderInput params: `InputProps.ref`, className, start/endAdornment, `inputProps` with the
         combobox ARIA and ref.
      2. IMask via `inputComponent`: inputRef forwarding, value/caret on typing, paste, controlled reset.
   2. Popper anchor rect identical: listbox width and position vs MUI at 3 sizes, plus multiple-with-chips wrapping.
   3. Focus/hover/disabled/error computed styles.
   4. WordPress smoke for Autocomplete and Input.

   Then the MuiTextField route can become lazy for real.
3. **Gate hardening, mandatory before H20.**
   1. An audit-mode run (`VG_NO_FALLBACK_PRELOAD=1`, full spec project) is part of the handoff gate. The
      expected-failure list is checked in as an explicit allow-list with reasons. Any other failure is a reachable
      lazy route.
   2. The packed smoke renders every WordPress export and every ModalHost/Autocomplete/Menu/Snackbar/AppBar shape
      without preload, and asserts first-render content (not "eventually").
   3. The corrected eager-@mui number is stated. The earlier "4 of 298" was never true for a shippable build: it was
      measured on the build with the MuiTextField route lazy, which broke Autocomplete.
4. **H20 handoff.** The verifier checks first render (first-paint capture, no settle wait) on the fingerprinted pack,
   on both builds, for: Autocomplete (26 sites), IMask inputs, AccountNavMenu and every lazy-split component.
5. **Rule.** A future "unreachable" claim for a lazy route needs all three: site scan, audit-mode spec run and packed
   smoke. A site scan alone is not accepted.
6. **Combined call-site audit (decided-by-watchdog).** Enumerate exact prop-key sets and routing-relevant literal
   combinations from rc-webapp, internal Vanguard callers and WordPress export defaults. Review spreads and
   indirect references. Verify the runtime route and synchronous packed content for every reachable combination.
   The planner's centered portal required both props to trigger the fallback.

#### H20 call-site shape inventory

The import-aware TypeScript scan (`72a8633`, `agentic-plans/uisdk-tools-b/shape-audit/scan.cjs`) binds JSX and
`createElement` calls to Vanguard imports. Run it with `--component`, `--routing-props`, `--sha` and `--consumer-root`.
The checked-in [shape fixture](./mui-upgrade-gates/package-fixture/smoke/reachable-route-shapes.json) records the
prop keys and resolved routing combinations used by the source and packed runtime tests. Dynamic non-routing values
use synthetic fixture data. The old `c8e69a2` pack is red for the two centered-portal checks and the same pack's
WordPress smoke is green.

| Component | rc-webapp / Vanguard JSX sites | Shapes | Own | Fallback | Evidence scope |
| --- | ---: | ---: | ---: | ---: | --- |
| Autocomplete | 26 / 1 | 24 | 24 | 0 | 27 packed default replays plus the WordPress default |
| Menu | 14 / 2 | 6 | 6 | 0 | 16 packed replays. Items, JSX children, size, origins and the media menu's class-only `PaperProps` |
| MenuItem | 3 / 3 | 13 | 13 | 0 | 15 packed replays. Account route spread present/absent, SearchableSelect, TableToolbar and `Menu.items` item props |
| Snackbar | 1 / 1 | 2 | 2 | 0 | Two packed replays. AiVisibility and SnackbarRoot, which adds `TransitionComponent` |
| AppBar | 1 / 0 | 1 | 1 | 0 | One packed replay. Navbar ref, class, fixed position, style and children |
| Toolbar | 1 / 0 | 1 | 1 | 0 | One packed replay. Navbar class and children |
| PopoverPopper | 0 / 1 | 1 | 1 | 0 | Private AutocompleteWithAnchor source replay. Absent from both packed public entries |
| FormControl | 0 / 0 | 0 | 0 | 0 | No production caller or WordPress export. Default pack cold control has no first-commit FormControl root |
| PopoverModal | — | 2 | 2 | 0 | Event details and centered create-event portal. Both shapes render synchronously on the own route as of the H22 port. |
| ProgressBar | 34 / 1 | 22 | 22 | 0 | B's verified `f94d932`, 48 same-tick checks and cold buffer/query controls |

Independent replay used `scan.cjs` and `render.cjs` from `72a8633`, exact `32a6b93` packed modules, and read-only
rc-webapp source exported from `73673465091`. The durable `h20-shapes-32a6b93` log directory contains the raw site
scans and first-commit results. All 62 default replays, one WordPress replay and seven opt-out controls were green.
The renderer adapter supplies jsdom's missing canvas/visual APIs and imports Menu and SearchableSelect from the
same packed module as MenuItem to exercise its true context. It does not preload or wait for fallbacks. Opaque
Menu open values are exercised open so a cold empty route can fail the check. The scan includes the Vanguard demo
Menu site in `src/App.tsx`. No unresolved site or indirect use remains in the public replay reports. The other
routes are unchanged across B's merge, and ProgressBar has its own exact-source verifier evidence.

The AccountNavMenu conditional adds only `selected` and `useActiveIcon`. The internal `Menu.items` spread drops the
React key and forwards each config's fields. The configured items were checked for `component` and `href`. The
media menu's `MENU_PAPER_PROPS` contains only `className`. AutocompleteWithAnchor is private and has no production
caller. Its spread has source coverage in the real wrapper. PopoverPopper has source coverage and no public packed
entry. Icon and StatusBadgeIcon's WordPress tests assert their existing empty first commit and then the local SVG
load separately.

#### Own TextField port (approved with conditions, decided-by-watchdog)

1. Keep the legacy slot mapping and theme-default precedence. Address the two reachable outlined-text fallback
   keys separately in the differential. Route `slotProps.input.ref` to the outlined InputBase root. The TextField
   root and native input keep their separate ref contracts. Use Autocomplete's real render-input parameters and
   compare anchor identity, popup width and position at all three consumer sizes and with wrapped multiple chips.
2. Allow `slotProps.input.inputComponent` to provide the native control. Pass the same input props, handlers and
   merged native input refs as the frozen route. MUI's styled boundary filters `ownerState`, `theme`, `sx` and `as`.
   Preserve the native textarea autosize branch and the custom component's behavior when `multiline` is set.
   Compare the actual PhoneNumber and DateRangePicker IMask paths for typing, caret, paste, change callbacks,
   controlled reset and focus. Add the focus/hover/disabled/error browser comparison before switching routes.
3. After the differential, remove only `ref` and `inputComponent` from the outlined-text route restrictions and
   restore the own calendar adornment inside the newly own masked picker frame in the same change. Keep the
   remaining MUI props and routes available. Validate first paint of packed Autocomplete and Input in WordPress
   and rerun the combined shape audit before proposing any change to fallback loading.

Approval conditions for H21:

1. Enumerate every field supplied by Autocomplete's real `renderInput` callbacks in the differential and check
   that the ref, ARIA, DOM attributes, adornments and event handlers survive the legacy bridge.
2. Exercise both actual masks' focusable refs, programmatic value assignment, paste/caret and controlled reset
   against the frozen field. Use the registered input ref in a consumer handler responding to Form validation.
3. Reopen H19b for the actual masked frame on H21. The candidate must keep the exact reference class-token order
   with the single generated `css-<hash>-MuiInputAdornment-root` token removed. Assert exactly one on the reference
   and zero `css-` tokens on the candidate. Check the complete computed adornment box, icon geometry and text start
   in Chromium in the normal, hover, focus and disabled frame states. The H21 declared delta is the absence of the
   Emotion class. The own frame also emits `vg-notched-legend`, pinned separately in the picker timeline.
4. Compare the label shrink state, outline notch width and popup geometry for chips/autofill at the three consumer
   size settings. The MUI fallback remains eager in this change.
5. **WordPress behavior note:** callers that supply `textFieldProps.InputProps.ref` or `inputComponent` with the
   modeled outlined field shape move to the own route. Any proposed escape hatch needs a demonstrated parity gap
   and a user decision before adding a public prop.

Local H21 evidence: the photographed browser conditions were exercised by six scoped, guarded Chromium stories
on port 6031, with zero denied destinations during stories. The full targeted spec set was green, 213/213, and
library tsc exited zero. The mask ref cleanup differential showed an additional native ref contract: React 19
callback cleanups must run even when IMask relays `null` without returning the cleanup to React. The red trace
recorded `null` callbacks where the frozen MUI field ran cleanup functions. The final targeted run includes the
fix. H21 still needs the exact packed WordPress smoke and the independent masked-frame recheck.

**Autocomplete Clear icon (decided-by-watchdog).** The keyboard differential sampled the own side before the
shared asset cache was warm and the frozen MUI side afterwards. Resetting the dynamic-import module before each
side and running both orders gave the same eight samples. Popup and Clear SVGs were absent at the cold synchronous
sample and present after settling. Both were present immediately on warm replays. The `Icon.tsx` difference from
merge-base `99ee34c` is limited to data attributes. H15 remains PASS. The settled differential gives both sides the
same warm asset state and waits for both indicators. The replay used jsdom. Chromium first-frame checks remain part
of H20. The eight original rows were recovered from the saved run output after the reboot and are stored at
`/Users/a.kott/vanguard-verify/logs/autocomplete-cold-icon-traces.jsonl`.

### 36.5 Preload timing samples (2026-11-19)

| Source | Cache | Wall time | Vitest aggregate setup | One-minute host load, start → finish |
| --- | --- | ---: | ---: | ---: |
| `0f71f7f` | Cold | 463 s | 882.31 s | 25.85 → 30.36 |
| `0f71f7f` | Warm | 1,225 s | 2,870.79 s | 30.36 → 53.94 |
| `c8e69a2` | Cold | 446 s | 402.87 s | 53.94 → 34.46 |
| `c8e69a2` | Warm | 497 s | 527.40 s | 34.46 → 29.91 |
| `f703205` | Cold | 1,284 s | 1,612.43 s | 29.91 → 69.96 |

The 12:25 host reboot interrupted the warm `f703205` run. That sample is void. The completed cold run had 20
test failures and the load reached roughly 100 during the run. The five completed samples have different host
conditions and cannot establish a preload speedup or regression. Rule 13 applies to any further wide measurements.
The original scratch timing logs were lost in the reboot. This table preserves the readings recorded before it.

#### Case budgets after the reboot

One Vitest worker at `32a6b93`, one-minute load 25.14–30.22 during the two targeted runs. All nine unique cases
below were green. The timings are Vitest case runtimes, excluding worker setup and transforms. Logs are
`h20-case-budgets-32a6b93*.log` under `/Users/a.kott/vanguard-verify/logs/`.

| Case | Measured runtime | Case timeout |
| --- | ---: | ---: |
| Autocomplete open, type, select by keyboard | 952 ms | 15 s |
| Autocomplete click option, then clear | 777 ms | 5 s |
| Autocomplete multiple: two chips, Backspace | 997 ms | 5 s |
| Autocomplete restrictToOptions, no match text | 734 ms | 5 s |
| Autocomplete loading | 949 ms | 5 s |
| Autocomplete highlightOptions | 671 ms | 5 s |
| DateRangePicker click on start & end date | 2,675 ms, 1,435 ms replay | 5 s → 10 s |
| DateRangePicker should render with some checks | 1,104 ms | 5 s |
| DateRangePicker open calendar, presets, pick, close differential | 9,210 ms | 45 s |

The calendar click case already waits on the actual day buttons before sending the real pointer interactions. Its
first sample exceeded half the default budget. The case now has its own 10 s timeout, over three times that sample,
with identical interactions, assertions and condition waits. The differential stayed below half its existing budget.

### 36.6 H20 declaration fixture correction (decided-by-watchdog)

The H20 pack at `153233cf08baccdb6a290c58f62711e7bef15c4a` has SHA-256
`bc76c32b0eb04808bb300ef01c47b89f79f0001e07fcd956520f1466b1efae89`. Its full source audit was green
(spec project only, 378 files and 2,725 tests). The `scripts` project was not run. The package export scan
had two JSDoc false failures since `764a089`, found at the master merge (§36.13). Both bundles matched 4,233 on-disk build files, and all 156 packed runtime tests were
green. The built eager graph reports **24/298** plus one allowed context module. WordPress reaches 336 files with
zero missing targets. The allow-list has 17 specs and five stories. The original canonical package command exited
1 because the default declaration gate was red. The separate measured declaration diagnostics do not set its exit status.

The same default declaration fixture emitted six identical errors on exact H20, `32a6b93` and the read-only `.472`
copy. `04fca13` deliberately removed the `core/*`, `common/*` and `helpers/*` package exports present at `99ee34c`.
The fixture had been stale since that change. Its TS2307 values came from AIAssistantPanel, VerificationPinInput and
hexToRgba imports using those old prefixes. The three TS2578 directives then saw unresolved error types. The
corrected paths resolve actual declarations through `./dist/*`, preserving the existing checks for required
`pinMask`, invalid `status="sleeping"` and numeric `alpha`.

The committed rc-webapp `73673465091` import scan found four literal Vanguard deep imports, all resolved against
H20 using its alias and ambient declarations. The default fixture now checks the stylesheet, the overlay chunk and
its ambient typing, plus the OverlayStackingService and ModalSplitView declaration paths. It also resolves the two
actual JS/CSS assets from the installed package. The watchdog approved the fixture-only correction. The package
manifest, runtime, declaration files and H20 tarball retain the same bytes. [Baseline diagnostics and consumer scan](/Users/a.kott/vanguard-verify/logs/h20-types-baselines/).

The corrected canonical replay on that same tarball exited **0**. The four consumer cells ran 34/34/44/44 runtime
tests and every gated declaration log was empty. The corrected default declaration and runtime-artifact checks
also exited 0 against a read-only copy of `.472`. One-minute load went from 14.02 to 22.99 during the replay and
sampled free memory stayed at or above 57%. [Replay output](/Users/a.kott/vanguard-verify/logs/h20-types-baselines/replay-bc76c32b/package.log).

Verifier 2 passed the unchanged H20 pack in guarded, fingerprinted rc-webapp `73673465091` shadows. Navbar,
AccountNavMenu, the Autocomplete field and 316-option popup, the IMask calendar and the centered planner portal all
had content in the same sampled first frame as `.472`. The Dashboard reached 6 and then 30 progress bars on the first
two report frames, with no named fallback request. The packed ProgressBar replay passed 48/48 across 22 shapes.
Snackbar first visible frame counts on frames 0/1/2 were 2/8/0 on `.472` and 4/5/1 on H20, with no fallback request
or repeatable candidate loss. The WordPress static walk found 336 files, zero missing targets, no removed exports
and no new bare imports. The independent verification judgment covers sampled DOM and geometry. WordPress runtime
and verifier 1's verdict remain separate. [Paired first-render evidence](/Users/a.kott/vanguard-verify/v2/out/h20-first-paint-comparison.json).

**H20 CLOSED (decided-by-watchdog).** V2 PASS earlier, V1 PASS now on the limited scope I set (chunk 01 40/40 pairs,
39 pixel-exact + BusinessProfile resolved by four byte-identical drawer-ready captures; routes AccountNavMenu,
Navbar, invoice PhoneNumber, masked DateRangePicker, centred planner, both Snackbar paths; Autocomplete 12/26 sites
in the browser, other 14 named gaps covered only by packed shape/WP evidence). One cold `.472` drawer-ready wait
timed out. Chunk 02's `.472` baseline carries forward without a paired H20 candidate run. The count stays 29/31.
[Scoped verdict and caveats](/Users/a.kott/vanguard-verify/v1/logs/h20-chunk01.md) ·
[Autocomplete coverage](/Users/a.kott/vanguard-verify/v1/logs/h20-autocomplete-coverage.md).

### 36.7 H21 top-level TextField routing correction (decided-by-watchdog)

The first three-worker full spec run at `8f4fc95` found a keyboard regression in VerificationPinInput. Frozen MUI
TextField binds top-level key handlers to FormControl. Vanguard put them on the control, where the real IMask drops
them. The existing pin test failed at `onKeyDown`. The new frozen differential also reproduced the missing `onKeyUp`
and identified four root-state differences for explicitly supplied props: `component`, `margin`, `hiddenLabel` and
`focused` on a disabled field. No pack was cut at `8f4fc95`. The corrected H21 keeps the existing public props and
restores those routing contracts. `margin='dense'|'normal'` activates the original MUI form-control spacing,
`component` chooses the requested host, and `hiddenLabel` restores the reference input/adornment tokens. Disabling
the field takes precedence over a forced focus state. These changes only affect fields that supply those props.

The table follows frozen MUI 9.5 `TextField`'s `RootSlot` and `InputElement`, then the `FormControl` context and
`InputBase`'s native control. The last column identifies how the own route matches it.

| Top-level props | Frozen MUI destination | Own outlined-text destination and probe |
| --- | --- | --- |
| `ref`, `component`, `className`, `style`, `sx`, `margin` | FormControl host/ref and its classes or CSS | FormControl host/ref, class and plain CSS style; native has no probe attribute. Dense and normal margin rules are scoped to that root. |
| `aria-*`, `data-*`, `role`, `title`, `tabIndex`, `dir`, `lang` and other HTML div attributes | FormControl `...other` | Same root pass-through. Explicit native overrides use `inputProps`. |
| `onKeyDown`, `onKeyUp`, other keyboard, mouse, pointer, clipboard, input, drag, touch, wheel and inherited DOM handlers, including capture | FormControl `...other` | Same root pass-through. Probe records target and currentTarget and orders them against the native handler, including the masked control that drops its native key handlers. |
| `onChange`, `onBlur`, `onFocus` | InputBase calls the top-level and native callbacks with the control event | Same native event and order. Change calls the HTML input callback first. Focus and blur call the outer API callback first. |
| `autoComplete`, `autoFocus`, `defaultValue`, `value`, `id`, `inputRef`, `name`, `placeholder`, `type` | Native control via InputBase. `id` also supplies label and helper links | Same control properties, native focus/ref, and label/helper identifiers. |
| `multiline`, `rows`, `minRows`, `maxRows` | InputBase and the native autosizing textarea | Same control kind, visible row count and shadow textarea. `rows` provides both row bounds. |
| `color`, `disabled`, `error`, `focused`, `fullWidth`, `hiddenLabel`, `required`, `size` | FormControl context and InputBase, native attributes where applicable, label and helper | Same input state/classes, native required/disabled/invalid attributes, label sizing and FormControl width class. Disabled wins over forced focus. |
| `label`, `helperText` | Label/helper children with IDs derived from the input `id` | Same children and linkage; both kept on the frame and out of the native attributes. |
| `InputProps`, `InputLabelProps`, `inputProps`, `FormHelperTextProps`, `slotProps`, `slots` | OutlinedInput root/control, label, native input and helper respectively. Supported root/input overrides are resolved by MUI | Same modeled slots and legacy aliases. At the key handler boundary, `inputProps` wins over `InputProps` on the native control and neither replaces the FormControl handler. Unsupported shapes still use the eager fallback. |
| `variant`, `select`, `SelectProps`, `children`, `classes` | Variant/selection routing, optional children for select, class overrides | `outlined` text stays on this route. Select uses a separate route, with `SelectProps` and `children` unused in text mode. `classes` uses the eager MUI route. |

The new differential passed the control-identity and propagation probes against both implementations. The original
H20 full run did not inject a process-level network guard. The first H21 run did and blocked three DocumentDisplay
assertions using synthetic `data:` URLs. The revised gate-only guard allows `data:` and denies outbound fetch and
socket connections. The three unchanged DocumentDisplay cases passed with that guard. No exception for HTTP or
HTTPS was added. [Initial differential](/Users/a.kott/vanguard-verify/logs/h21-text-field-prop-routing-red.log) ·
[Targeted pass](/Users/a.kott/vanguard-verify/logs/h21-text-field-prop-routing-green.log).

The import-bound scan of committed rc-webapp `73673465091` found 29 `Input`/`Select`/`Textarea`/`TextField` handler
call sites across 22 files (28 `Input`, one `Textarea`, zero `Select` or `TextField`), plus one masked
`VerificationPinInput` call to `InputBase`. The Vanguard source had three direct sites across three files
(`VerificationCodeInput`, `RteLinkEditor`, and `InputBase`'s `MuiTextField` call), plus three source `InputBase`
sites (`VerificationPinInput`, `Autocomplete` and `SearchableSelect`). The scan retains the unresolved Vanguard
wrapper spreads and separates frozen references. [rc-webapp locations](/Users/a.kott/vanguard-verify/logs/h21-text-field-handler-sites/rc-webapp.json) ·
[Vanguard locations](/Users/a.kott/vanguard-verify/logs/h21-text-field-handler-sites/vanguard.json).

**H21 packed gate.** `8f76287e35e258976afcd19ea922c206d935ad72` passed 2,770 tests in 380 files with no global
fallback preload and three workers in the spec project. The `scripts` project was not run. The package export
scan had two JSDoc false failures since `764a089`, found at the master merge (§36.13). The exact [H21 tarball](/Users/a.kott/vanguard-verify/packs/8f76287e35e258976afcd19ea922c206d935ad72-h21.tgz)
has SHA-256 `63a28ba8dccf058dd3c4f91631411d0b191c44593c49879d371d91192a771e6b`. All 4,233 packed dist files matched
the build on disk. The canonical replay exited zero, with 34/34/44/44 runtime tests and clean gated declarations.
The fallback audit found 22 allow-listed files with zero unexpected or stale entries. The eager graph reached
24/298 public exports plus the allowed `RtlProvider` context. WordPress reached 4/64 exports with MUI and 336 files
with zero missing targets. The exact-pack WordPress smoke passed three same-tick cases: the default Autocomplete
combobox and the Input anchor/custom-control ref paths. [Gate output](/Users/a.kott/vanguard-verify/logs/8f76287e35e258976afcd19ea922c206d935ad72-h21/).

Both verifiers received the pack. The masked-frame H19b recheck is assigned to verifier 2, and the first-render
consumer and keyboard checks are assigned to verifier 1. The six local Chromium cases predate the last routing
correction. The exact packed smoke exercises the WordPress bundle using jsdom.

**H21 FAIL at `8f76287` (decided-by-watchdog).** Verifier 1 reproduced the same invoice PhoneNumber result in three
valid pairs: native 185×43 px in a 617×43 px frame, versus 617×47 px native and frame on `.472`. The remainder of its
focused H21 scope matched, including the DateRange mask, eight consumer keyboard sites, the PIN event path,
margin/hidden-label and chips. The old pack is superseded by H22 and is not re-cut. Verifier 2 separately passed
the H19b recheck on the exact H21 package. The mounted preview measured a 32 px end adornment on both sides under
rc-webapp's border-box reset. The standalone Vanguard story measured 38 px and flex. The two previously declared
class deltas were observed. [V1 verdict](/Users/a.kott/vanguard-verify/v1/logs/h21-8f76287-verdict.md) ·
[V2 paired evidence](/Users/a.kott/vanguard-verify/v2/out/h21-masked-picker-comparison.json).

### 36.8 Planner PopoverModal independent clipping (decided-by-watchdog)

The centered, portaled planner card at rc-webapp `73673465091`, `EngagementPlannerCalendar.tsx:298`, uses
`top` placement and Popper's default absolute strategy. `flip` uses the anchor's clipping parents, the viewport
root boundary and 8 px padding. `preventOverflow` uses the floating element's clipping parents, the default
viewport root and zero padding, with `altAxis` and `tether` enabled. Auto-placement scoring still uses the
floating element's boundary and hide still uses the reference boundary. PopoverModal constructs all its modifiers
internally, so it can render synchronously on the own Popper. The independent PopoverPopper fallback for unsupported
public shapes is preserved.

The new Popper.js 2.11.8 differential was red before production edits. For the planner-shaped case it reproduced
`x=123.4375` on the old own solver when Popper.js gave `226.71875`, `183.71875` and `157.4375` on the initial,
scrolled and resized frames. The corrected port matched the reference on all three and on 240 matrix frames
varying the clipping ancestor, portal, both flags, placement, scroll and viewport. The scoped Chromium fixture
matched frozen MUI on first visible and scrolled geometry with both render orders. Local guarded Chromium passed
9/9, including the existing Popper and PopoverModal contracts. The real rc-webapp coordinates remain the paired
verifier check. The fixture does not target those absolute coordinates. [Red differential](/Users/a.kott/vanguard-verify/logs/dual-boundary-popper-red.log) ·
[Targeted specs](/Users/a.kott/vanguard-verify/logs/dual-boundary-popper-green.log) ·
[Guarded Chromium](/Users/a.kott/vanguard-verify/logs/dual-boundary-popper-browser/guarded-scoped.log).

The watchdog authorized both interim route assertion updates in the same production commit. The option spec went
from one asserted unsupported case to zero. Its replacement requires `supported: true`, an empty unsupported list,
`flipAltBoundary: true`, and `preventOverflowAltBoundary: false` for that exact shape. The first-render spec keeps
the planner content and body-portal assertions, requires `data-vg-core`, and asserts the MUI fallback module was
never requested. The ESM source change is scoped to the planner's former eager PopoverModal fallback. The later packed
first-render and paired rc-webapp evidence still apply. [Recorded planner anchor geometry](/Users/a.kott/vanguard-verify/v1/logs/h20-rc472-planner-clip.json).

Two separate regression cases now pin the remaining fallback classifier. A custom `observePlacement` write modifier
must produce `supported: false` with `['observePlacement']`, and the `document` root boundary must produce
`supported: false` with `['flip.rootBoundary']`. Both checks keep the MUI route reachable for options the own
primitive would otherwise ignore. [Targeted fallback controls](/Users/a.kott/vanguard-verify/logs/dual-boundary-popper-rejection-controls.log).

**H22 shared fixture update (decided-by-watchdog).** The initial full gate at `559be2d` failed the single
PopoverModal shape audit because it still expected the previous centered MUI route. The shared source and package
replay now require the own marker on both shapes, the exact body parent for portals, and zero fallback requests for
the centered shape. The source mock records any original fallback module evaluation. The installed-package fixture
registers a Node resolver observer before importing the pack and checks it with a resolution-only control. Existing
same-tick queries and selectors are unchanged. The search for other negative marker assertions found three unrelated
cases: an intentionally unmodeled Autocomplete route and the frozen AppBar/Toolbar reference nodes.

### 36.9 PROPOSED DatePicker S1 calendar

The S1 deliverable is an internal `DateCalendar` primitive with a frozen DateCalendar differential. `DatePicker`
continues calling its current MUI X renderer through S1 and S2. There is no public export or package dependency
change until a verified S3. Keep the existing `MuiCalendarPicker-root` compatibility hook when the shell switches.

1. Put calendar date operations behind a typed adapter consumed by the primitive before declaring the differential
   green. Use the existing Moment value type and AdapterMoment semantics, including calendar-day comparisons,
   month/year transitions and month-end clamping, locale-aware week starts, and formatted labels. Start with the
   adapter operations the calendar actually uses and reuse the same seam in S2. The MUI X `AdapterMoment` reference
   remains in the test. Before S3 removes the production dependency, run these adapter cases on the Moment-backed
   implementation itself. Keep the existing Moment locale source. Do not route display through the date-pattern
   lookup or change the `getDatePatternFromLocale` bug-lock.
2. Write the reference-first differential under a controlled date and locale. Compare the initial visible month,
   weekday/day/year grid and selection, role, name, `tabIndex`, `aria-selected`, `aria-current`, disabled state and
   ordered class aliases. Use separate controlled and empty-value cases. Pin min/max/disablePast at inclusive
   edges, disabled month/year switches, Today and selected days, adjacent-month navigation, month/year change and
   accepting a day. Compare `onChange` payloads and callback order, month changes, and focus per interaction.
3. Exercise arrows, Home/End, PageUp/PageDown, Enter/Space, and disabled targets with the same actions on both
   sides. Take the exact supported key list and each result from the frozen MUI X calendar. Keep the focus target
   attached and verify a single roving tab stop with the correct month/year transitions after navigation. Include
   root, calendar header/grid and selected/focus/disabled states in Chromium computed parity, including the
   transition longhands. Compare the same settled and first-visible state on both sides. Use a deliberate mutation
   of a roving focus or boundary transition to show the differential goes red.
4. S2 remains a separate unopened route. Its differential matrix covers the six configured format patterns crossed
   with locales, the rc-webapp dash-locale behavior, paste/IME, backspace across sections, invalid and partial
   values, min/max, readOnly/disabled, a controlled change during editing and the accessible section DOM. S3 owns
   the desktop popper and mobile ModalHost on `(pointer: fine)`, SSR/first-render selection, the toolbar and keyboard
   view, and close/focus/body effects. Run the existing DatePicker contracts unchanged before the shell switch is
   packed. Two independent verifier behavior FAILs on S2 or S3 keep DatePicker on MUI X for this major with the
   evidence logged. Record the MIT derived source notices for any adapted implementation.

**Approved with conditions (decided-by-watchdog).** Run the adapter and differential in separate `TZ=UTC` and
`TZ=Europe/Bucharest` processes. Cover both DST transitions, Feb 29 across a year change and Jan 31 → Feb clamping.
For a selected day with a non-midnight value, assert the frozen `onChange` Moment identity, exact time including
sub-second precision, locale, and second selection-state argument. In Chromium sample the month slide's presence,
direction class, duration, and reduced-motion branch as well as the settled grid. The consumer selector scan at
`73673465091` found four story references. Preserve `.MuiDateCalendar-root` on the calendar root, `.MuiPickersPopper-root`
on the S3 portal frame, `.MuiPickersDay-root` on the day, and `.MuiPickersDay-hiddenDaySpacingFiller` / `.Mui-disabled`
on the relevant day states. No production selector for those prefixes was found. The existing `MuiCalendarPicker-root`
alias remains pinned by Vanguard's compatibility contract. [Committed consumer selectors](/Users/a.kott/vanguard-verify/logs/date-picker-s1/consumer-calendar-class-uses.txt).

**S1 complete on the internal route, `5a5d855`.** The frozen differential was red before production code in
UTC and Europe/Bucharest, then passed 8/8 in each. The adapter samples both Bucharest DST transitions at 23/25
hours, Jan 31 → Feb 29 and Feb 29 → Feb 28 in a non-leap year. An inverted PageUp mutation made the navigation
timeline red. The selected day emits a new Moment carrying the source time down to milliseconds and the active
calendar locale, followed by `finish` and `day`. Year selection emits `partial` with an undefined view argument,
then changes view, month and year in that order. The day state aliases and calendar root stay at the consumer
selector positions. The popper selector remains on the existing shell until S3. All DatePicker specs pass
167/167. The guarded replay passed five Chromium stories for settled default/Vanguard theme styles, both slide
orders and reduced motion. Both active directions use 375 ms with
`cubic-bezier(0.35, 0.8, 0.4, 1)`. The plan retains the MUI X reference, public picker route and existing locale
behavior. The derived MUI X MIT notice is recorded in `c07f089`.
[Source evidence](/Users/a.kott/vanguard-verify/logs/date-picker-s1/) ·
[Guarded exact replay](/Users/a.kott/vanguard-verify/logs/master-2.11.0-merge/chromium.log).

### 36.10 PROPOSED FormControl, VanguardThemeProvider and MuiTextField lazy boundary

**FormControl reachability at H21.** Re-running the import-bound scan at `8f76287` on rc-webapp `73673465091`
found zero consumer or Vanguard production call sites, 30 direct test/story calls and one Storybook metadata
reference. The H21 ESM entry still exports FormControl and VanguardThemeProvider. Neither is a named export of
the exact WordPress entry. The public FormControl wrapper is still MUI-backed. H21's default input fields use
their own internal FormControl frame and context. The public wrapper can still be called by external ESM
consumers, with arbitrary children. [Source scan](/Users/a.kott/vanguard-verify/logs/h21-form-control-proposal/FormControl-sites.json) ·
[Exact packed exports](/Users/a.kott/vanguard-verify/logs/h21-form-control-proposal/packed-exports.json).

**FormControl proposal.** Go last as in B.6. Use the existing frame's FormControl layout and context for the
standalone wrapper's proven host/spacing/width/state cases. Freeze the public wrapper first and exercise the
actual nested Input and Select children that ship in its stories. Preserve `FormControl-container`, the overridable
host, required/error/disabled/fullWidth/hiddenLabel/margin and variant/size behavior. Keep the existing lazy
MUI route for unmodeled style callbacks or child trees whose FormControl context contract the own route cannot
prove. Avoid guessing descendant compatibility from DOM tags through arbitrary React wrappers. No public type or
WordPress export change is needed. Leave the public implementation alone if a safe own-route guard would still
alter existing uses. **Decided by watchdog.** FormControl stays last. Unknown external descendants can read
MUI context through arbitrary wrappers. Keep their existing route and retain the public implementation if
there is no conservative guard.

**FormControl guard review (static, during the H24 slot).** The existing evidence supports
keeping the public lazy MUI implementation. The H21 scan found no production caller to
justify a narrower own branch. The exact H24 ESM graph still contains the dynamic
`index-FormControlMuiFallback.js` edge. The WordPress graph contains neither module.
[H24 ESM graph](/Users/a.kott/vanguard-verify/logs/h24-datepicker-milestone/module-graph.dist.json) ·
[H24 WordPress graph](/Users/a.kott/vanguard-verify/logs/h24-datepicker-milestone/module-graph.dist-wordpress.json).

| Existing witness | What a route guard must preserve |
| --- | --- |
| Frozen wrapper tests with empty and native children | The outer `FormControl-container`, inner root alias, custom class, `component="fieldset"` and root ref are observable. The width and dense-margin assertions separately pin 100% and 8 px. An intrinsic-only tree can rule out descendant context readers within that closed tree. Root props, theme defaults and styling would still need their own proof. [Frozen wrapper spec](../src/core/FormControl/_FormControl.mui.spec.tsx:30). |
| Frozen Material descendants and hook probes | The direct OutlinedInput, InputLabel and FormHelperText receive disabled/error/required. Focus forces the label to shrink. A function component that returns `null` reads fullWidth, size and variant via MUI's `useFormControl()`, including filled and the outlined defaults. Preserving only the root DOM or scanning for Material host classes would miss this contract. [Context and focus cases](../src/core/FormControl/_FormControl.mui.spec.tsx:57). |
| Shipped TextField and Select compositions | Default uses Material TextField, which creates its own inner FormControl. Its presence check alone does not prove the outer provider. WithSelect uses Material InputLabel and Select without that inner TextField boundary. Required pins the outer-context asterisk on its sibling label. ErrorState, Disabled and WithHelperText include direct Material labels/helpers while their nested fields either receive explicit props or create their own frame. Those presence checks cannot certify an own outer provider. [Default](../src/core/FormControl/stories/Default.story.tsx) · [WithSelect](../src/core/FormControl/stories/WithSelect.story.tsx) · [Required](../src/core/FormControl/stories/Required.story.tsx) · [ErrorState](../src/core/FormControl/stories/ErrorState.story.tsx) · [Disabled](../src/core/FormControl/stories/Disabled.story.tsx) · [WithHelperText](../src/core/FormControl/stories/WithHelperText.story.tsx). |

A guard sees a wrapper's element type and props before React renders it. The same wrapper
can return a native element or a MUI context consumer based on its own state, and the
existing hook probe demonstrates that a context read may produce no DOM. Fragments and
host wrappers preserve context for their descendants. A direct-child identity or
`muiName` check cannot prove what a composite, memo/lazy wrapper, custom root or portal
will render. The own context has a separate identity and carries only outlined variant,
size and hiddenLabel for own children. It cannot satisfy Material's hook or its focus,
filled and adornment update callbacks. The frozen source contract requires the MUI
provider for descendants using that Material context instance. The archived tests
preload that route intentionally and do not establish context sharing with a separate
host-installed MUI copy. The historical cold pack control establishes that the lazy
root is absent on the first commit for that opt-out, independently of the mounted
context contract. [Own context](../src/primitives/react/TextField/form-control-context.ts:3) ·
[Packed cold control](/Users/a.kott/vanguard-verify/logs/h20-shapes-32a6b93/FormControl-render.json).

Any future guard would have to exclude opaque descendants and custom roots, or provide
the same Material context, and demonstrate the root contract separately. Existing evidence
offers no safe own route for wrapped MUI descendants. Keep the public fallback and leave
FormControl last. The declared-profile packed TextField replay and scope are recorded below.

**VanguardThemeProvider proposal.** The current provider is reachable in four rc-webapp roots (App, RenderRoot,
WidgetImageRender and WidgetPreviewHost). Its own typography context already carries the Vanguard choice into
own components. The MUI provider still creates and supplies the bundled typography theme (16 px font and HTML
font, no uppercase buttons), the MUI/system/styled-engine theme contexts and default theme behavior to MUI
fallbacks and the remaining MUI X tree. Source tests also exercise a direct `useTheme()` descendant. The H21
graph reports 202,673 rendered MUI bytes reachable from this ESM export. It is outside the WordPress public entry.
Measure isolation before changing it. Pair packed `.472` and H21 on a consumer MUI ThemeProvider with a
`components.MuiTextField.defaultProps` marker, and probe a consumer MUI descendant under the Vanguard provider.
Also cover internal fallback typography and default-props behavior with and without the provider, nested roots,
RTL, first render and SSR. A fallback-local MUI theme bridge is worth proposing only if these probes show it
preserves the observed consumer contract. Keep the provider eager if a direct descendant still needs its global
MUI context. The source `useTheme` test remains a requirement. [H21 eager report](/Users/a.kott/vanguard-verify/logs/8f76287e35e258976afcd19ea922c206d935ad72-h21/eager-mui.txt).

**Measured packed boundary.** The committed rc-webapp scan found zero direct `@mui/*` imports. Synthetic
Node/jsdom probes used the read-only installed .472 package and the exact H21 tarball. Both probes loaded
the emitted Input and VanguardThemeProvider chunks, which the package entries re-export. In each build the
five controls (bare, host, Vanguard, host+Vanguard and nested RTL) rendered on the first synchronous commit.
The host Material field saw its own ThemeProvider's input autocomplete and root title markers. Neither the
Vanguard default field nor the forced MUI fallback saw those markers. A host Material descendant read the
default `14|16|uppercase` under the Vanguard provider and `19|17|lowercase` with its own host provider. Nested
Vanguard roots preserved the host's RTL context and DOM direction. The frozen fallback emitted a 1 rem
InputBase font rule without VanguardThemeProvider and 1.1428571428571428 rem with it in both packages.
The H21 default field used the own route. Provider-only server rendering matched all five host witnesses.
Importing the full Input graph in a windowless Node process hits the existing window store on both packages.
The package root client import also hits ApexCharts' SVG initialization in jsdom, so these measurements
use the exact exported chunks. They do not measure Chromium layout or server-rendering of the full package.
[Probe and fingerprints](/Users/a.kott/vanguard-verify/logs/packed-theme-boundary/) ·
[.472 first-render results](/Users/a.kott/vanguard-verify/logs/packed-theme-boundary/base-client.json) ·
[H21 first-render results](/Users/a.kott/vanguard-verify/logs/packed-theme-boundary/h21-client.json).

**Bridge disposition (decided-by-watchdog).** Keep the public provider eager this major. Although the packed host and
bundled MUI copies are isolated, the direct source `useTheme()` descendant is an explicit contract, and the
measurements show that eager MUI fallbacks consume the bundled theme on first render. A fallback-local
prototype can consume the existing Vanguard typography context and supply the exact bundled MUI theme
before each fallback mounts. Keep it on paper until DatePicker and FormControl routing is settled and a reduction
in eager bytes is plausible. Require the source `16|16|none` descendant, both packed isolation directions, nested LTR/RTL, same-tick fallback
and provider SSR to pass, plus a measured decrease in the eager graph. A provider change requires an explicit
decision if retaining synchronous source MUI context consumes the same eager dependencies. No provider
production or public API change is made here.

**MuiTextField proposal.** H21 models the Autocomplete anchor ref and the reachable masks. Remaining eager
branches include non-outlined variants, native Select, unmodeled slots or classes and unsupported InputBase
slot keys. Audit the **combined** resolved prop shapes, including wrapper forwarding, runtime theme defaults and
WordPress defaults. Keep the static fallback if any real shape resolves to it. A lazy ESM proposal needs all
three observed results on its exact source and pack. First, scan all committed rc-webapp and internal sites and
review unresolved spreads, aliases and theme defaults. Second, run each resolved shape against the shared runtime
router in no-global-preload mode and require own first render in the full source audit. Third, render each shape
on the exact installed pack on its first tick, including default WordPress and reachable masked fields, and use
an unsupported cold-route control to prove the harness can see a suspension. WordPress remains a single bundle
with its fallback inlined. External WordPress plugin props remain outside the available source. Preserve the
public props and the unsupported fallback contracts.

**Approved as a measurement-first plan (decided-by-watchdog).** Exact committed rc-webapp `73673465091` has zero
direct `@mui/*` imports, including type and dynamic imports. A wider grep across the tracked JS/TS extensions found
no candidate files. There are therefore no directly imported consumer MUI components under the four provider roots.
Proceed with the prescribed paired measurements before proposing a bridge. FormControl stays last after DatePicker.
Any MuiTextField lazy change has its own decision with three sets of measured evidence. [Direct import scan](/Users/a.kott/vanguard-verify/logs/h21-form-control-proposal/consumer-direct-mui-imports.json).

**MuiTextField reachability witness (decided-by-watchdog).** The fallback stays eager while collecting the
three evidence sets. The existing router's first render for a synthetic outlined `select` with
`slotProps.select: () => ({ native: true })` is an **own** DIV combobox. It calls the callback with `{}`,
then drops `native` in the own Select. Frozen MUI invokes the callback with the TextField owner state
and renders a native SELECT. The literal `slotProps.select: { native: true }` control in the same
router renders a native SELECT through the eager fallback. The committed `73673465091` rc-webapp scan
found no literal TextField `slotProps` use or `native: true` Select shape. Its two `SelectProps` sites in
GoogleAdsCampaignForm configure display ARIA attributes. Dynamic forwarding and external WordPress props
remain unresolved. This witness characterizes the current route and does not earn first-render coverage
for dynamic shapes. [Committed consumer scan](/Users/a.kott/vanguard-verify/logs/packed-theme-boundary/rc-73673465091-text-field-routing-witnesses.txt) ·
[Targeted source witness](/Users/a.kott/vanguard-verify/logs/date-picker-s2/echo-format-green-and-select-route.log).

#### MuiTextField three-criterion evidence matrix

Read-only reconciliation during V1's H24 slot. **Partial evidence for all three criteria.**
Criterion 1 needs an inventory of resolved combined call-site shapes. Criterion 2 needs an own
first render per shape through the source router without global preload. Criterion 3 needs the
same on the exact installed pack plus a TextField-specific cold suspension control. Rendering
an input synchronously is evidence of availability. An inner `.MuiTextField-root[data-vg-core]`
assertion also establishes the own route. Browser witnesses sample visible frames separately.

The committed rc-webapp baseline is `73673465091`. H24 means approved tree
`a327c176c3180f765596d20364db53a1bb606735`, pack SHA-256
`2afc5e74a51389473c5bc19d5b12974affbafe412e61d649a8c9abde73edd755`.
Its source spec gate passed 2,865/2,865 with `VG_NO_FALLBACK_PRELOAD=1`. Its installed
default and WordPress suites passed 34/34 and 44/44 respectively in both dependency profiles.
Earlier runs count at their own fingerprints. [H24 source and package log](/Users/a.kott/vanguard-verify/logs/h24-datepicker-milestone/canonical-package.log) ·
[Installed H24 smoke source](/Users/a.kott/vanguard-verify/logs/h24-datepicker-milestone/fixture/default-declared/smoke/bundle.test.tsx).

| Reachable family | 1. Resolved source shapes | 2. Existing no-preload source evidence | 3. Existing exact-pack first-render evidence and gaps |
| --- | --- | --- | --- |
| Autocomplete-generated outlined field | The [import-bound inventory](/Users/a.kott/vanguard-verify/logs/h20-shapes-32a6b93/Autocomplete-sites.json) records 26 rc-webapp JSX sites and one Vanguard `AutocompleteWithAnchor` site. Both outer Autocomplete routes bridge generated root props and object input, HTML and label slots. The anchor ref, adornments and handlers fit the own inner route. | The [field differential](../src/core/_internal/InputBase/_MuiTextFieldReachability.differential.spec.tsx:232) pins the generated keys, separate refs, handlers, ARIA and inner own marker for its real callback fixture. The [wrapper replay](../src/core/_reachable-lazy-route-shapes.spec.tsx:23) checks the outer marker, including the private anchored parent case separately. | The [32a6b93 replay](/Users/a.kott/vanguard-verify/logs/h20-shapes-32a6b93/Autocomplete-render.json) recorded 27 default renders. H24 replays the [22 manifest rows](/Users/a.kott/vanguard-verify/logs/h24-datepicker-milestone/fixture/default-declared/smoke/reachable-route-shapes.json) and separately checks representative controlled single/multiple DOM. The shared replay checks the outer marker and combobox. The anchored private wrapper and per-shape **inner** marker/ref checks are missing from the packed replay. |
| Ordinary Input, direct InputBase and Textarea | The [committed prop scan](/Users/a.kott/vanguard-verify/logs/packed-theme-boundary/rc-73673465091-text-field-routing-witnesses.txt) shows native attrs such as `maxLength`, ARIA, autocomplete and `type`, plus named and autofocus fields. The [handler scan](/Users/a.kott/vanguard-verify/logs/h21-text-field-handler-sites/rc-webapp.json) is scoped to handler sites, not a complete combined shape inventory. Vanguard's internal verification-code and rich-text-link fields and the public ESM InputBase share the outlined path. | [InputBase contracts](../src/core/_internal/InputBase/_InputBase.mui.spec.tsx:468) and the [top-level routing differential](../src/core/_internal/InputBase/_MuiTextFieldPropRouting.differential.spec.tsx) cover multiline, native props/ref, form wiring and callback targets/order. No combined per-site route assertion. | H24 mounted an Input with native ARIA/maxlength and change, form-bound Input, and a three-row native Textarea in both bundles. These assert representative DOM/behavior. They leave the inner marker, caller combinations and dynamic overrides unasserted. The [H21 exported-chunk probe](/Users/a.kott/vanguard-verify/logs/packed-theme-boundary/h21-client.json) did observe default Input own on the first synchronous commit. |
| Non-native Select and nested search/text fields | The two rc-webapp GoogleAdsCampaignForm `SelectProps` uses supply display ARIA. Vanguard defaults to outlined non-native Select. SearchableSelect conditionally mounts a small outline search with a start adornment; DateRangeInput's trigger, DateRangePicker's right-hand read-only trigger and ColorPicker's text input also pass through this router. | [Select ARIA](../src/primitives/react/TextField/_select-aria-parity.spec.tsx), [SearchableSelect search](../src/core/SearchableSelect/_SearchableSelect.differential.spec.tsx:99), [DateRangeInput](../src/core/DateRangeInput/_DateRangeInput.differential.spec.tsx) and [DateRangePicker](../src/core/DateRangePicker/_DateRangePicker.differential.spec.tsx) cover representative behaviors. No per-site combined replay or equivalent ColorPicker routing assertion was located. | H24 asserts the default own Select trigger on the same turn in both bundles. The default SearchableSelect pack fixture opens a two-option list, below the search field's default ten-option threshold. No packed witness located for that search field, the GoogleAds ARIA shapes, DateRangeInput or ColorPicker. The range-picker mask test queries the left field only. |
| PhoneNumber national mask and separate prefix | Vanguard renders `PhoneNumberIMask` through PhoneNumberBase's outlined InputBase and a separate unmasked prefix. The real invoice form and other committed consumers reach the production wrapper. Prefix, flag and form configuration are part of those shapes. | The [real mask differential](../src/core/_internal/InputBase/_MuiTextFieldReachability.differential.spec.tsx:268) asserts the own frame, edit, caret, paste and reset. [H22 guarded source stories](/Users/a.kott/vanguard-verify/logs/h22-native-mask-browser/frame-selector.log) cover the real invoice and start-flag controls, including the absent native marker case. | H24 default smoke immediately finds the actual GB masked input. It does not assert the inner frame route or cover the combined invoice settings. [Exact H22 invoice](/Users/a.kott/vanguard-verify/v1/logs/h22-focused-rc-webapp.md) supplies paired first viewport-visible geometry, 617×47, and focus/blur. H21's 185×43 was a real box failure, superseded by H22. No real phone mask in the H24 WP graph. |
| DateRangePicker calendar mask | The real left calendar field passes `DateRangePickerIMaskInput`, end adornment and conditional native read-only; the right range selector is a separate unmasked field. rc-webapp calls the wrapper. The public ESM `maskInput` alias also permits external use. | The [real mask and registered-ref differential](../src/core/_internal/InputBase/_MuiTextFieldReachability.differential.spec.tsx) covers own frame, edit, paste, reset and form focus. The real picker timeline and [H22 native-box stories](/Users/a.kott/vanguard-verify/logs/h22-native-mask-browser/frame-selector.log) exercise the mounted calendar frame. | H24 default smoke queries the actual left input immediately for fixed dates. It leaves the own marker and remaining consumer combinations unasserted. The [exact H21 paired real field](/Users/a.kott/vanguard-verify/v2/out/h21-masked-picker-comparison.json) proves sampled masked DOM/adornment style; it is a browser witness. No date-range mask in the H24 WP graph. |
| Verification PIN masks | Vanguard [VerificationPinInput](../src/common/VerificationPinInput/VerificationPinInput.tsx:34) and the committed rc-webapp local copy pass `InputProps.inputComponent`, native `pinMask` and top-level handlers to InputBase. The consumer copy is the sole literal rc-webapp `inputComponent` found and is distinct from the Vanguard source wrapper. | [PIN wrapper specs](../src/common/VerificationPinInput/_VerificationPinInput.mui.spec.tsx) and the [real-mask handler differential](../src/core/_internal/InputBase/_MuiTextFieldPropRouting.differential.spec.tsx:105) cover ref, value and the top-level event route. The consumer-local variants are outside Vanguard's source suite. | [Exact H22 browser PIN fixtures](/Users/a.kott/vanguard-verify/v1/logs/h22-focused-rc-webapp.md) cover actual five/six-digit consumer controls at the first sampled viewport-visible frame and settled states. No packed same-tick PIN route fixture found. The exact H24 default and WP graphs contain no Vanguard PIN mask module. |
| WordPress export defaults | `Input`, `Textarea`, `Select` and `Autocomplete` reach the outlined defaults described above. External plugin props, computed spreads and host theme defaults are unresolved. The default graph cannot stand in for a plugin call-site inventory. [WP static route trace](/Users/a.kott/vanguard-verify/logs/packed-theme-boundary/wordpress-muitextfield-static.md). | Shared wrapper and router tests cover these families. There is no complete WP-default source replay tied to inner route markers for all four exports. | Exact H22 WP [Input probe](/Users/a.kott/vanguard-verify/logs/3d078f3a317e0860176690386f7b85895bcad2e4-h22/Input-wp-first-render.json) has three same-tick inner markers (default, anchor ref, synthetic custom control with native ref). The separate [WP Autocomplete probe](/Users/a.kott/vanguard-verify/logs/3d078f3a317e0860176690386f7b85895bcad2e4-h22/Autocomplete-wp-first-render.json) checks the **inner** marker for one default combo. The H24 canonical WP replay checks the **outer** combo marker, the default own Select trigger and native Textarea DOM. The Textarea inner marker, nested field under outer MUI Autocomplete, and nonfixture external props remain open. |
| Eager variants, native Select, dynamic forwarding and theme | `filled`/`standard`, object `SelectProps.native` or `slotProps.select.native`, and the unsupported outlined-text slot/class/input keys can select the eager fallback. No literal consumer TextField `slotProps` or native Select shape was found. Handler and key scans leave dynamic spreading, external ESM/WordPress props and visible theme defaults unresolved. | InputBase covers literal filled and legacy native. [Theme/slot compatibility](../src/core/_internal/InputBase/_MuiTextFieldCompatibility.spec.tsx) covers precedence. The [separate callback witness](/Users/a.kott/vanguard-verify/logs/date-picker-s2/echo-format-green-and-select-route.log) observes callback-native wrongly staying own and object-native reaching MUI. It is characterization outside the H24 snapshot. | Exact H24 WP renders all three explicit filled overrides immediately through MUI. The H21 exported-chunk probe renders a forced `classes` fallback immediately and measures host theme isolation. There is no exact packed literal/callback-native witness or production inventory of effective dynamic defaults. |
| Unsupported cold control | Use one deliberately unsupported **MuiTextField** shape, for example a filled field or literal native Select, for a future ESM split's cold control. | Existing compatibility tests keep eager fallback behavior intact. The router currently uses a static import, so these cases do not exercise suspension. | **Missing for MuiTextField.** The archived [Autocomplete `sx` opt-out](/Users/a.kott/vanguard-verify/logs/h20-shapes-32a6b93/Autocomplete-render.json) checks the outer component's cold route. The WP filled probes prove synchronous inline MUI. Neither establishes that the harness catches suspension in an unsupported inner TextField route. |

The H24 [ESM graph](/Users/a.kott/vanguard-verify/logs/h24-datepicker-milestone/module-graph.dist.json)
contains the phone and date-range mask modules and the eager TextField fallback. The
[WordPress graph](/Users/a.kott/vanguard-verify/logs/h24-datepicker-milestone/module-graph.dist-wordpress.json)
contains the fallback and none of the three mask modules. These are pack reachability facts.
They leave external forwarding, host defaults and custom controls unresolved. The current evidence
does not satisfy the approved split criteria. Keep MuiTextField eager and FormControl last.

**Partial evidence accepted (decided-by-watchdog).** The isolated packed smoke draft adds
same-turn inner field markers for the two real masks, WordPress Textarea, and the covered
Autocomplete shapes, including the field under the WordPress MUI outer route. The existing
runner and assertions are retained. The draft dry-applies to all four H24 fixture profiles.
The serial, guarded replay against the original H24 pack `2afc5e74…755` passed both declared
profiles (`default` 8/8, `wp` 8/8). The default profile proves the two real masks' inner
markers. The WordPress profile proves the default Textarea inner marker and the own inner
field under outer MUI Autocomplete, and retains the synchronous inline MUI filled checks.
These are fixture-specific same-turn assertions. Dynamic forwarding, external plugin props,
host theme defaults and unsupported cold suspension for a future ESM split remain open.
MuiTextField stays eager. [Default result](/Users/a.kott/vanguard-verify/logs/packed-theme-boundary/packed-smoke-draft/replay.cqEfNJ/default.log) ·
[WordPress result](/Users/a.kott/vanguard-verify/logs/packed-theme-boundary/packed-smoke-draft/replay.cqEfNJ/wp.log) ·
[Fixture patch](/Users/a.kott/vanguard-verify/logs/packed-theme-boundary/packed-smoke-draft/inner-text-field-first-render.patch) ·
[Replay handoff and evidence boundaries](/Users/a.kott/vanguard-verify/logs/packed-theme-boundary/packed-smoke-draft/README.md).

### 36.11 H22 masked native controls (decided-by-watchdog)

The invoice fixture uses the actual `PhoneNumber` with its disabled prefix, configured phone field and synthetic
country/value. Its before-fix Chromium native width/height were 185×43 px versus frozen MUI 616.796875×47 px at
rest, during focus and after blur. PhoneNumberIMask forwards the input class and consumes unknown data/style props.
DateRangePickerIMask forwards the class, the data attributes and style through its remaining props. VerificationPinInputIMask
supplies its own class and drops incoming class/data/style on both routes. It remains unchanged. These are the three
production custom input implementations in Vanguard. Committed rc-webapp's only literal `inputComponent` is its
local VerificationPinInput copy. [Native-box RED](/Users/a.kott/vanguard-verify/logs/h22-native-mask-browser/red.log).

The fix adds a direct `input`/`textarea` alternative within the existing zero-specificity own frame scope. It still
requires `.MuiInputBase-input` and adds no attributes or classes. The base rule and `:where()` variants stay at
specificity `(0,1,0)`, state rules at `(0,2,0)`, and base placeholder pseudo-elements at `(0,1,1)`. The outer label
selector stays at `(0,3,1)`, its placeholder pseudo-elements at `(0,3,2)`, and the focused variants at `(0,4,2)`.
Selector order and all declarations stay in place. Select display has its own rule and is excluded from the new
native-element branch.

Guarded Chromium passed all 16 scoped stories. Removing just the new branch in place produced byte-identical full
computed property maps for ordinary Input, Select display, Textarea and the Autocomplete chip input and frames.
The D15 AiVisibility route, SetupKeywordChipsEditor entry, and Select entry/route fixtures passed. The native-box
checks matched frozen MUI for PhoneNumber, VerificationPinInput and DateRangePicker. They cover a start-flag sibling
on a custom phone mask, an end-adornment sibling on the real DateRange mask, and the Autocomplete start chips.
The invoice's real flag is in the separate prefix input. The exact H21 packed WordPress Input control reran 3/3
first-tick cases including default Input, and will be repeated on H22. [Guarded browser evidence](/Users/a.kott/vanguard-verify/logs/h22-native-mask-browser/frame-selector.log) ·
[WordPress control](/Users/a.kott/vanguard-verify/logs/h22-native-mask-browser/h21-wordpress-input-control.json).

### 36.12 H22 gate and handoff (decided-by-watchdog)

H22 supersedes the H21 pack. Its runtime changes are the masked native-box correction and the independent flip
and overflow boundaries for the centered planner. The DateRangePicker spring follow-up changed tests only.
Both implementations use the same `react-spring` config and 52/185 px targets. The source differential checks both
widths reach their exact targets before serializing, with a 2.5-second ceiling and the observed width in its failure.
The existing five DOM snapshots and comparisons remain intact. The Chromium differential opens the pair on the
same browser frames in each order, samples at 0/100/300/600 ms, and compares first motion, midpoint and exact rest
within two frames. Both routes showed intermediate widths. Serial warm/cold probes had an order-dependent startup
gap and remain archived. [Final guarded browser proof](/Users/a.kott/vanguard-verify/logs/h22-datepicker-spring/same-frames-chromium.log).

Rollup pruned **both private runtime modules** `PopoverPopper.tsx` and `MuiPopperFallback.tsx` from the H22
pack. The source retains that private fallback and its unsupported-option tests. Packed `PopoverModal` uses its
own Popper synchronously for all the modifiers it constructs and has no dynamic import or runtime MUI Popper
fallback. An unmodeled option added to PopoverModal later needs an implementation or a new routing decision.
The first package replay's fallback observer assumed the old re-export filename existed. Fixture-only
`3f82c7c94d514c7941193f97cc937575aab30e2b` checks resolution attempts even when the chunk is absent, via a native
ESM resolution-only control, and replays the same H22 bytes. [Exact module graph extract](/Users/a.kott/vanguard-verify/logs/3d078f3a317e0860176690386f7b85895bcad2e4-h22/private-popper-module-graph.json).

Exact pack source `3d078f3a317e0860176690386f7b85895bcad2e4`, SHA-256
`339f74bd68e070f519d1ff0ff5bbcf850e443f0adf6e9e2cea351418a95d2d72`. Full no-preload source spec 381 files and
2,778 tests, three workers. The `scripts` project was not run. The package export scan had two JSDoc false
failures since `764a089`, found at the master merge (§36.13). The separate canonical package replay exited zero
with 34/34/44/44 passing tests and clean gated declarations.
All 4,232 distribution files matched the build. WordPress reached 336 files with zero missing targets, 4/64 eager
MUI exports and 4/4 same-tick fixture cases. The default packed planner rendered its own body portal on the first
tick. Default eager MUI is **23 of 298** plus the one allowed `RtlProvider` context, down one export from H21.
The fallback preload audit is 22 listed, zero stale and zero unexpected. [H22 tarball](/Users/a.kott/vanguard-verify/packs/3d078f3a317e0860176690386f7b85895bcad2e4-h22.tgz) ·
[Exact gate evidence](/Users/a.kott/vanguard-verify/logs/3d078f3a317e0860176690386f7b85895bcad2e4-h22/).

Verifier 1 checks the real invoice native box first, then planner first-visible absolute geometry and scroll/resize.
Verifier 2 checks the centered portal's first visible content and fallback request count. The wide slot was released
after both handoffs.

**H22 focused PASS (decided-by-watchdog).** H21 FAIL is superseded by H22 PASS for the TextField port +
dual-boundary PopoverModal. V1 focused consumer PASS (invoice PhoneNumber 617×47 with byte-identical PNGs,
real 5/6-digit PIN, planner absolute rect x452/y659/w252.5625/h48 incl. inner/outer scroll + resize, direct body
parent, own Popper). H22-V2 PASS (planner first frame, 10 opens per build, all portaled). Broad sweep chunks
continue on H22 outside this pass. Count stays **29/31**. [V1 focused consumer evidence](/Users/a.kott/vanguard-verify/v1/logs/h22-focused-rc-webapp.md) ·
[V2 guarded planner evidence](/Users/a.kott/vanguard-verify/v2/out/h22-planner-comparison.json).


### 36.13 Master 2.11.0 integration and scripts gate audit (2026-11-19)

Plain merge `55199a37acb04f4e43d3c4b4e6eac06147c32950` integrates master `d4a9116` and VAN-91. The
only conflict was `package.json`. The first-parent manifest diff is one line, `2.10.0` → `2.11.0`. The
other seven merged files take master's changes. H23 declares "from master 2.11.0: Gallery/FileSelect items carry
`originalFile`". The add is beyond the .472 baseline. Browser stories Default and ExposesThePickedFile passed,
with four remote placeholder requests rejected by the loopback guard and zero forwarded. The four file-identity
specs cover cropper, compressor, both in sequence, and the transformed-file fallback for a custom transformer.
All four fail if conversion drops `originalFile`. With real conversion restored, Gallery identity 4/4, Gallery
data slots 5/5 and FileSelect data slots 1/1 passed. [Tests and manifest evidence](/Users/a.kott/vanguard-verify/logs/master-2.11.0-merge/).

The original H19b/H16c, H20, H21 and H22 reports did not include the `scripts` project. Since `764a089`,
`_package-exports.spec.ts` reported two false failures because its lexical pattern interpreted the JSDoc example
`import('./XFallback')` as a real module dependency in both builds. The TypeScript scanner in `2acd189` keeps
the package checks and adds controls for real declaration imports and the four removed keys. It passed **7/7**
on both the current tree's output and the extracted exact H22 pack, with zero unresolved declaration imports
and all four keys absent. H22's SHA is unchanged. [Current tree check](/Users/a.kott/vanguard-verify/logs/master-2.11.0-merge/package-exports-current-green.log) ·
[Exact H22 check](/Users/a.kott/vanguard-verify/logs/master-2.11.0-merge/package-exports-h22-green.log).

The all-scripts baseline at `55199a3` was 70/75 tests in 8/12 green files. In addition to the JSDoc result:

- The notice gate fixture lagged `5d71452` and failed on H20/H21/H22. All six actual ESM and WordPress
  `THIRD_PARTY_NOTICES.txt` files already show `@mui/system@9.5.0 (MIT)`, Call-Em-All copyright and the
  MIT permission text. The fixture now includes that line in the positive and negative examples.
  [Archived notices](/Users/a.kott/vanguard-verify/logs/master-2.11.0-merge/released-notice-witnesses.txt).
- The browser optimizer check first went red with the form-control/adornment reference at `4106a21`. Other
  missing reference entries arrived at `a0a8f56`, `2ad3b3a`, `f1924b5`, `80ed0d2` and `5a5d855`. It was
  red on H19b/H16c and H20 through H22. `206f614` adds all eight referenced entries to Vanguard's Vitest
  browser optimizer. This affects test-runner prebundling and mid-run reloads there. It preserves the production
  bundles and the separate rc-webapp Storybook optimizer configuration.
- The codemod's first type-only test hit 6.557 s against 5 s in the two-worker audit. It passed in 1.376 s
  alone on the same tip and 1.236 s in the serial scripts run. The single case was added at `b69cce8`.
  There is no evidence of a deterministic failure in H20/H21/H22. Its timeout and assertions are unchanged.

The corrected no-preload scripts project passed **77/77 tests, 12/12 files** at one worker. The mandatory
release gate (`8a036eb`, decided-by-watchdog) runs the no-preload spec project, isolated package fixtures,
and then the no-preload serial scripts project against the installed tarball. Its shell controls show red
source and red scripts exits both stop the gate. No H23 package was cut in this audit.
[Initial scripts results](/Users/a.kott/vanguard-verify/logs/master-2.11.0-merge/scripts-before.json) ·
[Corrected scripts results](/Users/a.kott/vanguard-verify/logs/master-2.11.0-merge/scripts-after.json).

**H23 exact-source checklist (decided-by-watchdog).** One integrated wide slot covers A and B. Record the
source identity once for the gate and pack, distinguishing uncommitted DateField and TextField audit work
from any source included in that snapshot. Archive `tsc --noEmit -p tsconfig.lib.json` (or the existing
static gate's `tsc-lib.raw.txt`), no-global-preload spec results, exact fallback audit and installed-pack
scripts. Confirm these B cases collect and pass on that snapshot:

- `src/core/Autocomplete/_Autocomplete.differential.spec.tsx`
- `src/core/DateRangePicker/_DateRangePicker.differential.spec.tsx` and `_DateRangePicker.spec.tsx`
- `src/primitives/react/Modal/_modal-host-order.spec.tsx`, both describe groups
- `src/core/ProgressBar/_ProgressBar.mui.spec.tsx` and `scripts/check-fallback-audit.mjs`, intentional local preload
- `scripts/_agent-docs.spec.ts` and `scripts/_mui-compat-order.spec.ts`, installed-pack scripts

The prior 77/77 scripts result is pre-H23 evidence. The checklist does not release a wide slot.

### 36.14 Tier P Textarea native history (decided-by-watchdog)

The guarded mounted form type-and-clear scenario retained one native Text node per trusted cycle on H22
(+100/+200/+400 at 100/200/400 cycles), .472 (+200 at 200, also measured on H21) and a bare native textarea
(+40 at 40 cycles in two runs per input path). Attached nodes, listeners and Documents had zero per-cycle
slope. The linear increment retired on unmount. Programmatic input plus React updates stayed flat. The bare
native+redo [reproducer](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/tmp/research/vanguard-ui-sdk-visual-baseline/v2/textarea-retention-control.cjs)
in verifier 2's Storybook scratch checkout uses `TEXTAREA_CONTROLS=native-fill TEXTAREA_UNDO_CONTROL=1`. A trusted edit after Undo discarded the redo branch,
dropping native node count 1362 → 1318 while the textarea stayed mounted. V2's snapshots observed 40–41 extra
native Text nodes between cycles 5 and 45 and a predominantly native Window/internal retainer path. Both
autosizers reuse the same visible and hidden measuring textarea over value changes. This is reachable Chromium
Undo/Redo state, bounded by mount lifetime and by the browser's undo stack; not fixed by design. The existing
`_resource-cleanup.spec.tsx` now pins shadow node identity across an edit and removal on unmount.
[Paired retention](/Users/a.kott/vanguard-verify/v2/out/perf/h22-textarea-retention-comparison.json) ·
[Native controls](/Users/a.kott/vanguard-verify/v2/out/perf/h22-textarea-native-controls.json) ·
[Redo reproducer evidence](/Users/a.kott/vanguard-verify/v2/out/perf/h22-textarea-undo-control.json).


### 36.15 S2 internal DateField local handoff

The working-tree DateField is internal and unwired. DatePicker continues using MUI X for its actual field
and calendar. The S2 reference ran first and reached 29 intended missing-candidate failures in both UTC and
Europe/Bucharest. The full internal matrix then passed 31/31 in each time zone. It covers the six numeric
format patterns across four locales, the unchanged dash-locale fallback, accessible section roles and
names, serialization, partial input, synthetic composition, paste, Backspace, disabled/readOnly, controlled
replacement and validation callback order. Payload mutations failed all 24 locale/format cases. Reversed
navigation and discarded validation context each made their own targeted tests red.

The same-object controlled echo reproduced the stale positional sections. After editing 15 March to 20
March and echoing the exact emitted Moment, changing MM/DD/YYYY → DD/MM/YYYY left the old `03/20/2024`
serialization on the own field while the reference showed `20/03/2024`. The own field now rebuilds from the
current value when the format or adapter locale changes, independently of the echoed-value identity.
The format and subsequent locale change preserve focus, section labels and serialization, with no extra
publication. [Controlled-echo red](/Users/a.kott/vanguard-verify/logs/date-picker-s2/echo-format-red-and-select-route.log) ·
[Controlled-echo green](/Users/a.kott/vanguard-verify/logs/date-picker-s2/echo-format-green-and-select-route.log).

Initial Chromium was red in the three style stories and at the first programmatic selection assertion in
both keyboard stories. The isolated trusted follow-up established both reference and own selection, ArrowRight
and ArrowUp on fresh mounts. Both then stopped at fixture ClipboardEvent construction. A real DataTransfer
fixed that fixture. Source styling now matches the disabled label ink, notched legend line height and required
asterisk text-node boundaries. The seven guarded stories pass, including exact computed styles and bounds,
trusted selection on each side, and both paired posting orders. The fixture sent zero outbound requests.
Native OS IME remains outside the Chromium run. This internal development round is not an independent
verifier failure and does not count toward the S2/S3 stop rule.
[Initial Chromium](/Users/a.kott/vanguard-verify/logs/date-picker-s2/chromium.c9Lv6T/chromium.log) ·
[Isolated diagnosis](/Users/a.kott/vanguard-verify/logs/date-picker-s2/chromium.ekFsD3/chromium.log) ·
[Guarded green Chromium](/Users/a.kott/vanguard-verify/logs/date-picker-s2/chromium.VI0Jy0/chromium.log).

The final targeted runs passed 52/52 in UTC (DateField, TextField compatibility and locale lock) and 39/39 in
Europe/Bucharest (DateCalendar and DateField). Targeted TypeScript was clean. The earlier targeted full
DatePicker plus locale pass was 204/204 before the controlled-format follow-up. Port 6031 is closed and released
to V2. The branch tip is `55dc6113c814fd3f198af5a2743ff76b92174612`; S2, the TextField characterization and
the related plan changes are uncommitted. No H23-wide gate or package was run.
[Local handoff](/Users/a.kott/vanguard-verify/logs/date-picker-s2/local-handoff.md).

### 36.16 Scoped development and final verification (decided-by-watchdog, 2026-11-19)

Select development verification case by case. Around ten minutes is illustrative, with no fixed budget,
confidence quota or pass criterion. For H23's SearchableSelect caret, require deterministic red→green on
the changed behavior, the unchanged ModalHost click-return count and order test with cold checks, and
only the immediate consumers touched by the diff. Coordinate one paired caret CSS and markup witness
with V1. Expand development coverage on a concrete signal or a shared-path change.

Run full rc-webapp, WordPress and Tier P sweeps once on the final candidate. Preserve the covered evidence,
saved captures and named flags for final adjudication. The H23 package gate is one milestone after review
of the scoped evidence. The existing final coverage, resource limits and hard constraints still apply.

### 36.17 H23 reviewed snapshot and package result

H23's canonical guarded offline gate passed on `55dc6113c814fd3f198af5a2743ff76b92174612`
plus approved declaration patch `b6d8f443d148…` and SearchableSelect caret patch `e8a4c2b07880…`.
The resulting tree is `1e32b126298c385807290e516a1c4360eee6a8aa`. It excludes the uncommitted S2,
TextField and planning work. Source TypeScript exited 0. The no-preload spec project passed 2,799/2,799
across 385 files, including the original ModalHost count/order cases. The installed-package scripts
project passed 79/79 across 12 files. The four offline consumers passed gated TypeScript and
34/34/44/44 runtime checks, 156 total. Their installed npm resolution graphs are archived.

The exact tar retains all checked public declaration targets, has 817 ESM declarations and 247 WordPress
declarations, and contains zero frozen reference files or declaration references. The 4,218 packed dist
files match the on-disk build. WordPress reached 336 files with zero missing targets. The fallback audit
was 22/22 allow-listed, with zero unexpected or stale entries. Eager MUI is 23/298 ESM exports plus one
allow-listed context module. The WordPress report has 4/64 exports with MUI in their bundled graph.

V1 passed the exact local SearchableSelect pair in eight guarded cycles. Settled size, inset, paths,
ink, hover, focus, body portal and Escape matched. Own shows the up glyph with the first open frame.
The two dark-open screenshot differences are the already approved paper-background delta. The nearest
direct rc-webapp caller, ProductRatePlanSearchCell, has no eligible existing story at `73673465091`.
The broad rc-webapp, WordPress and Tier P sweeps remain assigned to the final candidate.

Pack SHA-256 is `0c5ae6295363e83054ca7eb9be1a89b2e797a971b2fbec9d958fdb828dc65301`.
[H23 pack](/Users/a.kott/vanguard-verify/packs/55dc6113c814fd3f198af5a2743ff76b92174612-h23-b6d8f443-e8a4c2b0.tgz) ·
[Canonical gate](/Users/a.kott/vanguard-verify/logs/55dc6113c814fd3f198af5a2743ff76b92174612-h23-b6d8f443-e8a4c2b0/canonical-package.log) ·
[Provenance](/Users/a.kott/vanguard-verify/logs/55dc6113c814fd3f198af5a2743ff76b92174612-h23-b6d8f443-e8a4c2b0/provenance.txt).

### 36.18 Independent S2 PASS (decided-by-watchdog, 2026-11-19)

V2 passed the private, unwired DateField on `55dc6113c814fd3f198af5a2743ff76b92174612` plus the exact
seven-file patch SHA-256 `c118dc410a9aa26b9b41c118029116b8c2a81c75aa9aac3f2766d564624e27aa`, tree
`836eaf2ce45f8f1deec99eec86888ef49dcda17d`. All seven file fingerprints match before and after.
The unchanged differential passed 31/31 in both UTC and Europe/Bucharest. All five paired Chromium
stories passed, including both trusted edit orders. Native OS IME remains outside the result.
The Chromium proxy self-test passed and its guard log was empty during evidence collection.
Storybook's separate Node telemetry was enabled in that run and delivery was uninstrumented.
Set `STORYBOOK_DISABLE_TELEMETRY=1` for S3 and any replay. V2 closed the slot and released it to A.
The public DatePicker route and dependencies stay at the base during frozen-reference work.
[Exact S2 patch and fingerprints](/Users/a.kott/vanguard-verify/logs/date-picker-s2/independent-v2/provenance.txt) ·
[V2 evidence](/Users/a.kott/vanguard-verify/v2/datefield-s2-evidence).

The H23 packed WordPress entry has no direct DatePicker export or declaration, and its linked graph
contains neither Vanguard DatePicker nor MUI X date-picker modules. That reachability result applies
to the exact packed WordPress entry. Application and consumer-side aliases are outside that check.
[WordPress reachability](/Users/a.kott/vanguard-verify/logs/date-picker-s3/wordpress-reachability.txt).

### 36.19 Reviewed S3 frozen reference (decided-by-watchdog, 2026-11-19)

The unchanged public wrapper at `55dc611` (source blob `f26bce99c36b706d31884be447533dd40ce7cb50`)
passed the two native pointer/hydration Chromium cases, 15 scoped lifecycle/callback specs and the
three focused Chromium placement/keyboard cases. The telemetry-disabled browser runs had empty guard
logs after the guard self-test. First hydration commit uses the desktop field in both contexts.
The settled touch context shows the read-only field. True windowless module import fails at
`src/stores/window.store.ts:2`; it is a separate frozen result.

Live pointer changes swap the mounted overlay type in both directions with a stable public claim value.
The fitting desktop story pins `bottom-end`; the clipped fixture flips to `top-end` and follows the
anchor. The hydration fixture's `bottom-start` is specific to that fixture. Nested mobile stays at
1300. The four nested timer-held close/unmount cases preserve the parent claim, body and ARIA state,
retire the child listeners and drain the pending timers. No observer allocation was observed there.
Published dates are observed while the overlay is present and its claim active, before dismissal.
Keep the current callback signature, public contracts and dependency pins. The reviewed evidence
authorizes paired red→green for the private S3 candidate while the public route remains at the base.
[Frozen outcomes and exact inputs](/Users/a.kott/vanguard-verify/logs/date-picker-s3/frozen-probes/reviewed-reference.md) ·
[Fixture and evidence fingerprints](/Users/a.kott/vanguard-verify/logs/date-picker-s3/frozen-probes/reviewed-files.sha256).

### 36.20 Private S3 candidate and value contract

The four-file S3 patch on the approved S2 tree has SHA-256
`99d7ff0e23f1ad5f2c96765683582e44627ef18fe81900a908c63d506b6a5cb3` and produces tree
`091c7b57b7f741a2d373fe1fc710bb4cd0defe84`. The detached verification tree excludes the H23
declaration and caret changes and the separate TextField work.

The initial paired harness ran the frozen branch in 11 cases and failed when the private shell
was absent. After the shell was added, three more pairs went red on initial and controlled
value replacement. Runtime null wrongly marked the field group invalid, and the serialization
input lacked `aria-invalid` in all three cases. The private shell now treats null and undefined
as empty and valid and NaN as empty and invalid. The pairs also assert that controlled changes
emit no callback. A separate red pair caught a closing mobile portal returning and locking the
body after a fine/coarse round trip. The private shell now clears the pending mobile exit when
the desktop branch takes over.

The final no-preload replay passed 161/161 in each of UTC and Europe/Bucharest, including 15
private shell cases, 31 private DateField cases, 8 calendar cases and 107 unchanged public
DatePicker cases. Scoped TypeScript exited 0. Two guarded Chromium pairs passed with telemetry
disabled and no unexpected denied requests. They cover trusted mouse and touch, hydration, the
field focus ring, Escape focus return and touch backdrop dismissal. The fine pair matched at
`bottom-start` in its narrow fixture. The coarse pair used 1300. Both browser runs shut down
and released port 6031.

Public wiring and types are at the base. The candidate still needs review, including paired
candidate fit/flip, broader visual parity and external value replacement during an open mobile
session. No commit or package was created.
[Private S3 provenance and fingerprints](/Users/a.kott/vanguard-verify/logs/date-picker-s3/private-candidate/provenance.txt) ·
[Red and green evidence](/Users/a.kott/vanguard-verify/logs/date-picker-s3/private-candidate/handoff.md).

### 36.21 Private S3 controls before independent verification (decided-by-watchdog, 2026-11-19)

Freeze the open mobile sequence in which the parent echoes a selected day, then replaces the value
before Cancel. The frozen calendar selects March 20, then selects and displays the parent's March 25.
Cancel republishes the original March 15 while the dialog and claim are active, then closes with the
field displaying March 15. External replacement causes no publication. The private shell matched
the frozen sequence without a source change. The pair asserts the selected day, field value and
exact publications.

Independent V2 handoff follows the guarded private fit/flip and scroll-follow pairs. Keep all 107
public contract tests, public wiring and dependencies at the base, with telemetry disabled and no
commit, package or wide gate.

The watchdog approved the Cancel closure and directed a local desktop paper fix. In the D15
Storybook stylesheet order, the red paper foreground differed in both themes and the dark
background was `rgb(24, 33, 47)` instead of white. The private desktop paper now uses the frozen
white and `rgba(0, 0, 0, 0.87)` from the bundled light palette. Shared Popper and CSS are unchanged.
The clipped fixture uses a fresh scroll container for each branch, resets it to 120 before open
and asserts that both branches stay at 120 through the initial capture.

All four guarded pairs passed in light and dark. The fit popup was `bottom-end` at (236, 133)
and the clipped popup was `top-end` at (858, 489), moving to (858, 497) as the anchor moved 8 px.
Paper, selected day and field dimensions and the asserted computed properties matched.
The captures retain two smaller visual differences outside the paper fix. The field's top outline
stroke sits lower, and the month/year switch uses an 18 px glyph versus 24 px in the frozen route.
The screenshots differ by 291 pixels in each fit pair and 419 in each clipped pair before and after
scroll. Record these as open observations for adjudication. The SearchableSelect paper exception
remains specific to SearchableSelect.

The final private tree is `da94f26e69c3c848a85f1be2761d001cc7bf1962` with S3 patch SHA-256
`3a091e925ccb9dd696fe71593e83ef4c22a0d91626aaecb030f74027e6a83450` on the approved S2 tree.
The guarded no-preload replay passed 162/162 in UTC and Europe/Bucharest, including the 107
unchanged public tests. Scoped TypeScript passed. [V2 handoff and exact evidence](/Users/a.kott/vanguard-verify/logs/date-picker-s3/private-reviewed/handoff.md).

### 36.22 Private S3 desktop visual closure (decided-by-watchdog, 2026-11-19)

Keep `da94f26e69c3c848a85f1be2761d001cc7bf1962` frozen while V2 runs its independent
verification. Two desktop findings must close before public wiring. Match the hidden legacy
legend and the top outline stroke inside DatePicker. Match the month/year switch glyph,
its hit box, centering and keyboard focus. The initial frozen dimensions are 24 px for the
glyph and 34 px for the hit box. Standalone S2, shared styles and primitives stay out of
this change.

The scratch assertions retain the existing placement, paint and scroll checks and compare
the real top-stroke pixels in a straight section of the fitting field. Run the intended red
and guarded green only after V2 directly releases its slot. Use desktop private selectors,
preserve D15 stylesheet order and keep telemetry disabled. Return the exact delta for
review. No duplicate unit sweep, public wiring, commit or package.
[Focused fixture and CSS proposal](/Users/a.kott/vanguard-verify/logs/date-picker-s3/private-visual-draft/design.md).

The watchdog approved both scopes and the focused witnesses. Capture a passing frozen-only
control for the keyboard focus sequence before interpreting any candidate failure. Begin
the control only after direct V2 release and a passing preflight.

V2 released the slot after independently passing scoped behavior, placement and computed
styles on the exact `da94f26e` tree. Both patch paths and all ten hashes matched. UTC and
Europe/Bucharest passed 162/162 each, scoped TypeScript exited 0, and guarded Chromium
passed 4/4 with telemetry disabled. Both visual differences reproduced in both themes:
the top stroke moved from row 86 to 91, and the month/year glyph measured 18 px versus
24 px in the frozen route. The scoped pass makes no pixel parity claim.
[Independent V2 verdict](/Users/a.kott/vanguard-verify/v2/datepicker-s3-evidence/verdict.md).

The frozen-only keyboard control passed 4/4 before comparing the candidate. Shift+Tab
reached the toggle with visible focus inside the calendar, including after clipped scroll.
The paired red failed 4/4 with the candidate legend visible, a stroke at row 91 and an
18 px glyph in a 28 px hit box. The two-file delta scopes the legacy hidden legend to the
private desktop field host and applies the existing medium glyph token inside the private
desktop paper. Both fixes passed the same guarded matrix 4/4 and the outline strip matched
exactly in both themes. The stroke is back at row 86 in the fitting fixture, and the 24 px
glyph is centered in the 34 px hit box before and after keyboard focus. All six sampled
1200×900 RGB frame pairs were pixel-identical, including the clipped post-scroll frames.
Telemetry was disabled, the guard logged zero unexpected requests and port 6031 closed.

The two-file visual patch on the independent tree has SHA-256
`eb655e991cf283fca03db0fabc319f7516d404f7ab5367b998a712d0868e02ce` and produces private
tree `711adf69bb71b03f378f0420da95f004cc296fb3`. No duplicate unit sweep ran. Review this
local delta before public cutover. [Exact patch and evidence](/Users/a.kott/vanguard-verify/logs/date-picker-s3/private-visual-draft/handoff.md).

### 36.23 Proposed frozen-reference split for the public DatePicker switch

**Design approved (decided-by-watchdog, 2026-11-19).** Use the shared type-only import,
the public candidate's own-field marker, the unchanged 107 public contract tests and the
emitted graph checks below. Reuse the H23 exclusion witness. Keep the exact independent
tree `da94f26e69c3c848a85f1be2761d001cc7bf1962` frozen. Public wiring can proceed after
V2's independent pass and guarded green results for both §36.22 visual fixes.

**Test-only split.** Copy the frozen implementation from `55dc6113c814fd3f198af5a2743ff76b92174612`
to `src/core/DatePicker/_DatePicker.mui-reference.tsx`. The input blob is
`f26bce99c36b706d31884be447533dd40ce7cb50`. Keep its executable body, MUI X imports and shared
stylesheet imports intact. Replace the copied props interface with
`import type { DatePickerProps } from './DatePicker'` so there is one public contract. Export the
fixture component as `DatePicker` within that file only. Add no barrel or package export for it.
The split can be checked before the switch by importing the fixture as the reference and keeping
the differential's existing private candidate resolver.
The retained MUI X imports are the package root and its `AdapterMoment`, `DateField`, `DatePicker`,
`dateViewRenderers`, `hooks`, `models` and `PickersLayout` subpaths.

**Imports at cutover.** In `_DatePickerShell.differential.spec.tsx`, use
`import { DatePicker as FrozenDatePicker } from './_DatePicker.mui-reference'` for every frozen
observation and `import { DatePicker, type DatePickerProps } from './DatePicker'` for the
candidate and shared type. Replace the interim `import.meta.glob('./DatePickerShell.tsx')` and
`own()` calls with the public candidate in those same observations. Assert once that the selected
field has the own DateField marker on the candidate and lacks it on the frozen route. This catches
a public export accidentally left pointing to MUI even when behavioral traces agree.
`_DatePicker.mui.spec.tsx` stays byte-identical, including its public `./DatePicker` import, so all
107 assertions exercise the candidate. Other public DatePicker specs and the existing public
contract stories retain their imports. S1 and S2 keep their dedicated references.

For post-switch replay, redirect only the frozen legs of the external scratch stories
`_DatePickerShellPrivate.stories.tsx` and `_DatePickerShellPairedPlacement.stories.tsx` to
`./_DatePicker.mui-reference`, with the candidate leg through `./DatePicker`. Frozen-only
`_DatePickerShellFrozen.stories.tsx`, `_DatePickerShellPlacement.stories.tsx`,
`_DatePickerShellFrozen.spec.tsx`, `_DatePickerShellCallbacks.spec.tsx` and
`_DatePickerShell.windowless.spec.tsx` use that same fixture import if replayed after cutover.
Their shared `s3-reference-helpers.tsx` uses
`@vanguard/DatePicker/_DatePicker.mui-reference` for its reference. Preserve prior evidence files
and update replay copies only.

**Declaration and bundle boundary.** Reuse the H23 `**/*.mui-reference.tsx` exclusions in
`tsconfig.dts.json` and the ESM dts configuration. WordPress also emits declarations from its
entry reachability set. Add the concrete DatePicker reference to the existing
`scripts/_dts-package-imports.spec.ts` exclusion witness when the file is created. Keep
`DatePicker.tsx` in the ESM declaration set and keep all production imports and public entrypoints
free of references to the fixture. An explicit production import can bypass a TypeScript root-file
exclusion. The MUI X package is already a pinned dev dependency and remains available to the
reference fixtures and the existing MUI-installed consumer control. Keep the derived MIT notices.

At the next authorized exact-source package gate, archive both `.vg-build/module-graph.dist.json`
and `.vg-build/module-graph.dist-wordpress.json`. Check every emitted chunk's source module IDs,
then walk static and dynamic imports from the ESM entry and the WordPress entry. Require zero
`.mui-reference` and zero bundled `@mui/x-date-pickers` modules, including lazy chunks. Check
emitted JS import specifiers for an external MUI X edge as well. The ESM public DatePicker must
reach the own shell; WordPress must continue to have no direct or transitive DatePicker route.
The exact extracted tar must contain no frozen reference file or declaration import to one and
no MUI X import in either declaration tree. Verify public ESM `DatePicker` and
`DatePickerProps` resolve through the same exports, keep the D12 subpaths and replay the existing
offline consumer fixtures. `package-fixture/fixtures/components.tsx` already pins the ESM props,
and `package-fixture/fixtures/wp.tsx` pins the absent WordPress export. In the declared-dependencies
ESM smoke, mount the public picker without installed MUI X and assert the own field on first render.
Keep the eager-MUI and WordPress import-closure gates. Use actual module IDs and import
specifiers to distinguish runtime reachability from the retained notice text.

**Public switch and rollback.** Make the public entry a separate reviewable wiring delta
after the private visual fixes and independent evidence are accepted. Keep the exact
`DatePickerProps` definition and the existing barrel paths, and point the public runtime
`DatePicker` binding at `DatePickerShell`. The shell's import of that interface remains type
only. If the public candidate fails the unchanged contract or reaches the §36.0 stop rule,
restore the public `DatePicker.tsx` from blob `f26bce99c36b706d31884be447533dd40ce7cb50`.
Return the differential's candidate leg to the private resolver so it continues comparing two
implementations. The test-only frozen copy and the private S1–S3 work can remain available for
diagnosis. Until a separate cutover is approved, public wiring, source and dependency pins
stay at the current independent checkpoint, with no runtime work during V2's reserved slot.

**Cutover authorized (decided-by-watchdog, 2026-11-19).** The watchdog accepted the exact
two-file visual delta on `711adf69`, including the guarded red and green, the keyboard
control, both outline strips and six sampled pixel-identical pairs. Start the public
switch with a failing own-field marker against the current export. Keep the original
107-test contract byte-identical, use an excluded frozen reference and refresh the paired
replays. Return the exact local diff and scoped evidence for review. Package and wide
gates remain at the milestone.

**Cutover attempt rolled back.** The own-field marker failed against the frozen public export,
then passed on attempted tree `bdd4ed1d0b7432224be4b480426aee55e8f139c9`. The new paired suite
passed 17/17, but the scoped UTC suite passed only 200/215. Six of the 107 unchanged public
contracts failed. Across the run, eight failures involved partial or invalid date editing, two
involved Escape focus restoration, two hit the year-button role, and three involved mobile Enter
and MUI theme defaults. This was a local cutover run. The exact V2 private verdict remains scoped
to its recorded cases.

The §36.23 rollback restored the public file to blob `f26bce99c36b706d31884be447533dd40ce7cb50`.
The post-rollback DatePicker suite passed 214/214 in UTC across 16 files, including all 107 public
contracts. The retained test-only split uses the private candidate resolver and the excluded
frozen executable. Both focused H23 declaration exclusion checks passed. The refreshed external
browser pairs are staged for the next public attempt and have an own-route assertion. The
browser, package and emitted-graph gates did not run on the failed cutover.
[Exact patches, failure output and rollback evidence](/Users/a.kott/vanguard-verify/logs/date-picker-s3/public-cutover/handoff.md).

### 36.24 Private DatePicker section-edit parity (decided-by-watchdog, 2026-11-19)

Keep the verified public rollback in the integration checkout. Reproduce the eight partial
and invalid edit failures against the archived public candidate in the guarded shadow.
Preserve the byte-identical public contract and the independent standalone DateField defaults.
Keep focus, year-role and mobile-theme issues queued. Defer browser and package gates until
the scoped DatePicker contract passes.

The archived candidate failed all eight selected original tests and five of six new paired
traces. The frozen picker publishes `NaN` for each accepted partial section edit, followed
by the exact intermediate date timestamps. A rejected symbol emits nothing. A parent that
echoes an accepted deletion sees an empty field after a single `undefined` callback. With a
retained February 15, typing day 31 publishes `NaN` and restores the accepted field without
another callback.

The shell opts its desktop editor into reporting accepted drafts without treating a parent
`NaN` echo as a new accepted date. Complete edits remain parent-controlled, the numeric
day is parsed against the assembled date, and an acknowledged clear empties the field.
Standalone DateField and the mobile dialog editor keep their existing defaults.

All eight unchanged cases and six traces passed after the fix. All 61 retained differential
assertions passed in UTC and Europe/Bucharest, including 31 standalone DateField cases.
The scoped shadow suite passed 213/220 in UTC. The remaining seven failures are the same
two focus, two year-role and three mobile-theme cases. Integration remains on the frozen
public export. [Exact edit delta and guarded evidence](/Users/a.kott/vanguard-verify/logs/date-picker-s3/edit-parity/handoff.md).

**Edit group approved (decided-by-watchdog).** The delayed external `NaN` pair pins an
ignored initial partial edit, a same-value parent rerender, then an external `NaN`.
Both keep `03/DD/YYYY` and emit exactly one callback, on the first edit. The frozen
shell's `lastEmissionInvalid` survives a same-value rerender and treats the next
`NaN` as an acknowledgment. Keep the candidate's matching behavior and the witness.
The final shadow had 214/221 passing in UTC, with the same seven residual failures.
All 62 differentials passed in both time zones. The final integration picker tree is
`a42502cdd0d3ff1e61c022a1e7a81fc1eeb7f0b7`.

### 36.25 Private DatePicker desktop focus restoration (decided-by-watchdog, 2026-11-19)

Start from the approved edit delta and keep the public rollback. Reproduce the two
unchanged desktop focus failures in the guarded shadow and compare actual focus before
open, inside the calendar, after Escape closes the overlay and after Tab leaves the
editor. Keep year-role and mobile-theme issues queued while the focus delta is verified.

The frozen padding click returned focus to Month on Escape and Tab reached the next
control. The shadow left focus on the body, dropped the field ring and missed the next
control. Clicking a real Day section already restored Day on both routes. Both unchanged
focus tests and the padding-click pair failed on the pre-fix shadow.

The fix is confined to the desktop Escape handler. If its saved opener is outside the
field, it uses the first tabbable date section for the existing delayed restore. A saved
editor target still wins. Both unchanged focus tests and both pairs passed. The scoped UTC
suite now passes 218/223, with only the two year-role and three mobile-theme failures.
Public wiring remains rolled back. [Exact focus delta and traces](/Users/a.kott/vanguard-verify/logs/date-picker-s3/focus-parity/handoff.md).

**Focus group approved (decided-by-watchdog).** The exact private tree `d38d70c263048e5fe18c3e09d40470146cccd20d`
passed 4/4 focused tests, 218/223 scoped UTC with the five prior failures, 64/64 Bucharest
differentials and scoped TypeScript. The desktop Escape-only fallback retains the existing
restore timer lifecycle.

### 36.26 Private DatePicker year-view compatibility (decided-by-watchdog, 2026-11-19)

Start from the approved focus tree with the public rollback in place. Freeze the year
control role, mousedown containment, selection publication and the return to day view.
Keep the correction owned by DatePicker and leave the three mobile-default failures queued.

The paired red isolated the role. The frozen control is a button and the shadow was a
radio. Both kept the popup and its claim on mousedown without publishing. Releasing
published the same March 15, 2026 timestamp once while year view and claim were still
active, then returned to day 15 in the March 2026 grid with the popup open.

DatePicker now requests the button role from its internal calendar. The standalone
calendar retains the radio default. Both unchanged year tests and the paired witness
passed. The scoped UTC suite passed 221/224, including all 107 unchanged public
contracts. Only the same three mobile-theme cases remain. Public wiring stays rolled
back. [Exact year-role patch and evidence](/Users/a.kott/vanguard-verify/logs/date-picker-s3/year-parity/handoff.md).

**Year-view group approved (decided-by-watchdog).** Exact private tree
`6547a2dc75fa4194e700341aa3ae80d699e7411b` passed 3/3 focused, 221/224 scoped UTC,
65/65 Bucharest differentials and scoped TypeScript. The three residual failures
are the mobile theme defaults.

### 36.27 Private DatePicker mobile Enter theme defaults (decided-by-watchdog, 2026-11-19)

Keep the integration public rollback and all existing contract assertions. Compare
the frozen disabled and read-only defaults and the `MuiDateField` consumer key
handler against the shadow before changes. Record the event order and preserve the
no-provider route. Reuse the existing theme-default bridge for the relevant defaults
when supported by the witness. Return this delta and its scoped evidence before a
new public cutover.

The guarded red reproduced all three existing mobile failures and four paired failures.
The no-provider pair already matched. The frozen picker gates opening on disabled and
read-only defaults. Its themed field handler runs on the section list between capture
and outer bubble, after the claim is acquired and before the dialog commits.

The desktop follow-up found that the frozen consumer handler also runs for ArrowUp.
It runs on the same section-list event as the edit, with default prevention set before
publication. A consumer preventDefault still permits the internal edit. A read-only
picker default blocks desktop popup opening while its desktop field remains editable.
The three desktop pairs failed on the mobile-only delta and passed after removing the
desktop gate and composing the handler in the section-list event. The no-provider
field and standalone editor require no theme handler.

The final guarded shadow passed all eleven focused cases together, 232/232 scoped
UTC including the 107 unchanged public contracts, and 73/73 Bucharest differentials.
Exact private tree
`4f61196a6fa521233091d3d1d05317997c0176b5` remains on the public rollback.
[Theme delta and guarded evidence](/Users/a.kott/vanguard-verify/logs/date-picker-s3/mobile-theme-parity/handoff.md).

**Theme group approved (decided-by-watchdog).** The watchdog accepted the three desktop
pairs, 232/232 scoped UTC and 73/73 Bucharest. The final scoped TypeScript check exited
0 on the exact public shadow `5a1ee0156cf31d46b3691d41479b7b25d1fc4868` before wiring.

### 36.28 DatePicker public cutover replay (decided-by-watchdog, 2026-11-19)

Promote the runtime files from the verified shadow and carry the unchanged scoped unit
evidence. Route the differential through the public candidate and its excluded frozen
reference, with the own-field marker from the first cutover. Recheck the changed
differential and run the prepared guarded desktop placement/pixel and pointer/hydration
pairs serially. A contract or visual regression triggers the §36.23 rollback. Package
and wide gates stay at the milestone.

The local public route switched to DatePickerShell on tree
`0af021ac05e86503a9d2a4c613835ee3f3289061`. The production files are byte-identical to the
reviewed shadow. The only tree difference from the shadow is the test-only differential
reroute and own-field marker, which passed 35/35. Carry 232/232 scoped UTC, 73/73 Bucharest
and scoped TypeScript on the unchanged shadow code, including all 107 byte-identical
public contracts. The frozen reference remains excluded.

Guarded desktop replay passed 4/4 with matching outline strips and all six sampled
1200×900 RGB pairs pixel-identical. Fine mouse and coarse touch hydration passed 1/1
each. Both retained the frozen portal mode, field ring, Escape focus return and zero
recoverable hydration errors. The touch witness also closed on a trusted backdrop tap.
Telemetry was disabled, all guard self-tests passed with zero other denied destinations,
and port 6031 closed. No rollback was needed in this scope. The 19 source fingerprints
matched before and after in both worktrees.
[Exact public wiring diff and evidence](/Users/a.kott/vanguard-verify/logs/date-picker-s3/public-cutover-retry/handoff.md).

### 36.29 H24 DatePicker package milestone (decided-by-watchdog, 2026-11-19)

The source inventory found zero production MUI X imports and 16 test-only import edges.
All 19 frozen reference files are absent from the ESM and WordPress source projections
and from the ESM declaration projection. The ESM entry resolves the own DatePicker shell.
The WordPress entry resolves no DatePicker source. The only direct MUI X manifest entry is
`@mui/x-date-pickers@9.17.0` under devDependencies for tests and fixtures. Keep that
dependency, its lockfile entry and the derived MIT notice.
[Static inventory](/Users/a.kott/vanguard-verify/logs/h24-datepicker-milestone/source-boundary.json).

The approved milestone is exact isolated tree `a327c176c3180f765596d20364db53a1bb606735`.
It adds the 13 reviewed DatePicker paths, the additive declaration witness, and the
DateField MIT notice wording to the accepted H23 tree. TextField characterization,
FormControl, theme-provider work and plan notes stay outside the snapshot. The public
API files, 107-test contract and dependency pins retain their exact hashes.
[Milestone source manifest](/Users/a.kott/vanguard-verify/logs/h24-datepicker-milestone/milestone-files.sha256) ·
[Patch provenance](/Users/a.kott/vanguard-verify/logs/h24-datepicker-milestone/provenance.txt).

Use one reserved Rule 13 slot for the guarded offline source TypeScript and canonical
package gate. Verify the actual emitted JS and declaration paths in both bundles, all
static and lazy chunks, both notices, the no-MUI-X consumer's packed DatePicker first
render, and the exact archive checksum. The H23 main Rollup graph is the positive
control with 138 MUI X module IDs and 484,590 rendered bytes. H23 remains the fallback
artifact. A green gate releases the slot and the exact H24 archive directly to V1 for
the focused packed consumer checks. The full consumer and Tier P sweeps stay assigned
to the final candidate.

The emitted audit also parses TypeScript triple-slash type and path references. The
offline synthetic control went red on the original parser, then flagged both directives
while ignoring the MIT notice comment. This audit change stayed outside the approved
source snapshot. [Directive witness](/Users/a.kott/vanguard-verify/logs/h24-datepicker-milestone/audit-directive-green.log).

**H24 package PASS.** The guarded offline source TypeScript check and canonical package
gate both exited 0. No-preload source specs passed 2,865/2,865 across 387 files and the
scripts project passed 79/79 across 12 files. The installed consumer fixtures passed
34/34 in each default install and 44/44 in each WordPress install. The packed default
DatePicker rendered its own field synchronously without an installed MUI X peer
(Vitest 1/1). The supplemental shell wrapper failed while recording the exit status
after Vitest had printed its passing summary. The emitted audit found zero MUI X or
frozen reference edges in both bundles, including lazy chunks and declarations.
Both MIT notices shipped, and all 4,049 packed dist files matched the build on disk.
The eager Material count is 22/298 plus one allow-listed context module. The fallback
audit is 22/22 and the WordPress dynamic import walk reached 336 files with zero missing.
[Gate log](/Users/a.kott/vanguard-verify/logs/h24-datepicker-milestone/canonical-package.log) ·
[First-render log](/Users/a.kott/vanguard-verify/logs/h24-datepicker-milestone/packed-first-render.log) ·
[Emitted graph audit](/Users/a.kott/vanguard-verify/logs/h24-datepicker-milestone/emitted-boundaries.json).

The watchdog's read-only verification matched 4,642/4,642 tracked blobs and file
modes to the approved tree with zero extra non-ignored paths. The temporary-index
approval remains untouched and is unnecessary for this handoff. The exact verified
pack has SHA-256 `2afc5e74a51389473c5bc19d5b12974affbafe412e61d649a8c9abde73edd755`.
[Verified pack sent to V1](/Users/a.kott/vanguard-verify/logs/h24-datepicker-milestone/fixture/pack/rankingcoach-vanguard-2.11.0.tgz) ·
[Durable copy](/Users/a.kott/vanguard-verify/packs/a327c176c3180f765596d20364db53a1bb606735-h24.tgz) ·
[Checksum register](/Users/a.kott/vanguard-verify/packs/SHA256SUMS).

**Direct slot handoff.** V1 received the pack checksum and focused Rule 13 slot for
guarded Storybook and unit-test checks against committed rc-webapp `73673465091`.
Delivery receipt `message:mcp:a6ddd56a-6190-473d-a3ce-f20f19150bac:thread-send:7d297f78-b6ed-4647-b8dd-e88bf41fcdd8`
started V1 run 126. The independent consumer verdict is pending. H23 remains the
fallback artifact and the full consumer and Tier P sweeps remain assigned to the
final candidate.
[Vanguard Architecture and Visual Consistency](t3-thread://v2/e35503e3-cf61-4359-9313-451d57cd87cb/80fcbccb-4649-4a3a-88e7-93c70c8198d6).

**H24 focused browser FAIL on the mobile shell (decided-by-watchdog, 2026-11-20).**
Exact H24 Narrow reached the mobile dialog and focused a calendar gridcell. Two isolated
pairs returned Day on .472 and BODY on H24 after Cancel, sampled after the calendar
became hidden plus two animation frames. The trace ends there. It does not establish
later focus. The sampled rectangles at open are for the **calendar** (320×336 on both,
y280.6875 → y271.5), separate from settled **paper** geometry. At 390×844, the settled
PNG paper fill spans rows 175–668 on .472 and 200–644 on H24 in both repeats. The
115,467 differing open pixels include toolbar typography, native-looking edit and
action buttons, and missing reference elevation. Narrow closed, desktop Data and
legacy dash-locale settled screenshots matched. V1's two H24 nested-modal alias and
hit-test runs passed. The two .472 nested diagnostics reached the scheduling form
without opening a calendar, leaving the paired hit-test witness open.
[Baseline Narrow](/Users/a.kott/vanguard-verify/v1/logs/h24-focused-v1/baseline-20261119T220543/narrow-1.json) ·
[H24 Narrow](/Users/a.kott/vanguard-verify/v1/logs/h24-focused-v1/candidate-20261120T095640/narrow-1.json) ·
[Settled screenshot comparison](/Users/a.kott/vanguard-verify/v1/logs/h24-focused-v1/pixels.json) ·
[V1 verdict and direct release](/Users/a.kott/vanguard-verify/v1/logs/h24-focused-v1/verdict.md).

TDD the focus and presentation gaps independently. Reproduce the trusted Day tap and
Cancel click without pre-focusing the field. Record focus before open and after the
actual dialog portal detaches, including a later bounded observation. Preserve
ModalHost's close, ARIA and scroll-lock lifecycle. For presentation freeze the .472
settled paper rect, height/elevation, header typography and edit/Cancel/OK computed
styles. Scope any production change to DatePickerShell and its mobile stylesheet.
Preserve semantic buttons, keyboard behavior, desktop/legacy-locale parity and aliases.
Use the scoped regression slot after direct V1 release, ahead of the optional packed
TextField marker replay. Keep H24 and H23 artifacts immutable and use the milestone
gate for packages.

**Scoped mobile source replay after V1 release.** At 390×844 the presentation
differential reproduced the packed footprint (frozen paper height 494.390625 px,
unmodified own 445 px) and the recorded typography, control and elevation differences.
The two-file presentation patch in the prior source shadow passes 3/3 guarded Chromium
stories. Frozen and patched paper are both `x35/y174.796875/w320/h494.390625`, with
exact sampled styles and rects. The public and shell unit specs passed 142/142,
including the 107 unchanged public tests. Rule 13 deferred the supplemental desktop
rerun before Chromium launched. Desktop implementation and styles are outside the
patch. With V1's capture-before-Cancel sequence in the scoped source case, Day was
already active on the opening click on both routes and remained focused at detachment,
after two frames and 250 ms later. This leaves the packed focus finding open. No focus
or ModalHost change is justified by that source control. The exact pack digests
were rechecked. [Triage, witness and patch](/Users/a.kott/vanguard-verify/logs/h24-mobile-picker-triage/handoff.md).

**H24 mobile successor (decided-by-watchdog, 2026-11-20).** The exact approved
two-file patch, SHA-256 `0db17a8196e96a5c3946aea574e41f471acecc0660a4549e25e383cc7f663010`,
is applied locally on `feature/ui-sdk-architecture-investigation` without a commit.
Both file digests match the guarded source shadow. The integrated desktop replay
passed 4/4 and all six paired frames matched at every RGB pixel. The standalone
successor source is the approved H24 tree plus only those two mobile shell files.
The read-only manifest checks all 4,642 original paths and modes, with 4,640 unchanged
blobs and zero extra paths. Its computed tree ID is
`2390cb44d97e78d1b39165f79b6f61841ecdd32c`. The single guarded offline milestone is
for that exact snapshot. The exact H24 and H23 packages remain available. The pack-only
focus finding remains open and supplies the hide, detachment and late follow-up checks
for the focused successor consumer handoff. TextField is outside this snapshot.
[Integrated fingerprints](/Users/a.kott/vanguard-verify/logs/h24-mobile-picker-triage/integration-after.sha256) ·
[Desktop replay](/Users/a.kott/vanguard-verify/logs/date-picker-s3/public-cutover-retry/desktop/h24-mobile-style-integrated/placement.log) ·
[Reviewed successor manifest summary](/Users/a.kott/vanguard-verify/logs/h24-mobile-successor/source-before-gate.json).

**H24 mobile successor gate PASS.** The isolated TypeScript check and canonical
offline gate exited 0. Source specs passed 2,865/2,865 without global preload,
scripts passed 79/79, and the four installed consumers passed 156/156. The before
and after source manifests match byte for byte. The verified production diff contains
only `DatePickerShell.tsx` and `DatePickerShell.module.scss`, with the mobile toolbar,
buttons and paper styling. The emitted audit found zero MUI X or frozen-reference
edges in the ESM and WordPress runtime and declaration graphs. Both MIT notices
shipped and all 4,049 packed dist files matched the build on disk. The eager count
is 22/298 plus one allow-listed context module. The fallback audit is 22/22 and all
336 WordPress dynamic-import targets resolve.
[Verified diff](/Users/a.kott/vanguard-verify/logs/h24-mobile-picker-triage/mobile-presentation.patch) ·
[Gate log](/Users/a.kott/vanguard-verify/logs/h24-mobile-successor/canonical-package.log) ·
[Post-build source check](/Users/a.kott/vanguard-verify/logs/h24-mobile-successor/post-build-source-check.log) ·
[Emitted audit](/Users/a.kott/vanguard-verify/logs/h24-mobile-successor/emitted-boundaries.json).

Archive SHA-256 `8206e0603a04e8cb7c3a7ca0197f2a5c43c27fce3c281dcf4588dfba2eca8919`.
The original H24 and H23 digest checks passed. The successor consumer scope is the
guarded Narrow-only pair against .472 at committed rc-webapp `73673465091`. Compare
settled mobile styling and sample Cancel focus at hide plus two frames, portal
detachment and 250 ms later. The exact H24 focus finding remains open.
[Successor pack](/Users/a.kott/vanguard-verify/packs/2390cb44d97e78d1b39165f79b6f61841ecdd32c-h24-mobile.tgz) ·
[Checksum register](/Users/a.kott/vanguard-verify/packs/SHA256SUMS).

The direct handoff started verifier run 129 with the verified archive and Rule 13
slot. Delivery receipt `message:mcp:1211c210-3939-4263-bf58-b3260f020e1c:thread-send:c32d74fc-8c61-49b1-ba15-9236f4a1fa72`.
[Vanguard Architecture and Visual Consistency](t3-thread://v2/e35503e3-cf61-4359-9313-451d57cd87cb/80fcbccb-4649-4a3a-88e7-93c70c8198d6).

**Successor guarded Narrow verdict.** The settled mobile presentation targets
matched .472 in 2/2 pairs, including the 320×494.390625 paper, elevation, distinct
caption and date typography, and all three button styles and rects. Closed PNGs matched.
Open screenshots retain 743 differing pixels at the calendar month label and chevron,
and 14,664 at the highlighted input behind the dialog. Cancel focus failed 2/2.
Both builds entered the dialog after the
trusted Day tap, with the original Day active at the opening click and still connected
and current after close. .472 had Day at Cancel click capture and at all three close
checkpoints. The successor had Cancel through the click, then BODY at detachment,
hide plus two frames and detachment plus 250 ms. The serialized day stayed the same.
Probe transport passed and V1 returned the slot. [V1 verdict](/Users/a.kott/vanguard-verify/v1/logs/h24-mobile-successor-v1/verdict.md).

**Offline focus discriminator.** The committed Narrow caller supplies
`closeOnCLickAway`, which the earlier passing source focus fixture omitted. The
shell's document `mousedown` listener treats Cancel as outside the field wrapper and
calendar allow-list. This can dismiss and clear the live flag before the Cancel click.
ModalHost's restore cleanup follows `open`, while Fade keeps the portal mounted for
exit and schedules no later restore. The exact focus-attempt order remains to be
measured. The drafted trusted-pair test adds the consumer prop and a prop-disabled
control and records focus and the picker claim through mouse events and detachment.
Keep any fix local to the picker after the intended red. The draft is unrun and
the style patch and artifact identities are retained.
[Offline focus evidence and test](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-repro/handoff.md).

**Picker-local mobile focus fix (decided-by-watchdog, 2026-11-20).** The watchdog
authorized production changes only if the exact consumer-prop red confirmed early
outside dismissal. The guarded red passed the frozen and prop-disabled controls.
With the consumer prop on, Cancel `mousedown` started at claim 1101. The claim dropped
to 1100 and Day briefly regained focus, then Cancel retook focus before click.
Detachment, hide plus two frames, and +250 ms all saw BODY. The original Day stayed
mounted. The two added unit regressions independently went red at the premature claim
release for controlled Cancel and keyboard actions. The four outside controls passed.

The fix gives each DatePicker its own mobile paper ref and excludes only that paper
from its outside listener. The green Chromium replay passed 3/3. The own consumer
case kept claim 1101 through click, then restored the original Day at claim 1100 and
held it through all close checkpoints. The two focused unit files passed 148/148,
including the unchanged 107 public contracts, controlled Cancel rollback and
publication order, keyboard editing, ordinary outside, foreign dialog and both
backdrop paths. The production diff is confined to the instance ref, containment
check and binding in `DatePickerShell.tsx`. The other file adds regression coverage.
The mobile styles and ModalHost still match the immutable mobile-style source.
[Exact two-file diff](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-repro/mobile-cancel-focus.patch) ·
[Red and green event summary](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-repro/red-green-event-summary.txt) ·
[Unit red](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-repro/unit-red.log) ·
[Unit green](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-repro/unit-green.log).

The watchdog reviewed the scoped evidence and approved one guarded offline
milestone from the immutable `2390cb44d97e78d1b39165f79b6f61841ecdd32c` source
plus those two files only. The exact focus patch SHA-256 is
`fe39f05b7386db0438fc217c0c6950cdd7c3dee90cf66b2c1f5749eb89e69237`. The isolated
tree ID computed without Git writes is `e90441d30d074f2938187561cab71f061dcd226d`.
All 4,642 paths and modes were verified against the reviewed source. Its public
entry and props, styles, ModalHost, public spec and dependency files are byte-identical
to the immutable base. Preserve the original H23, H24 and mobile-style successor
archives. Hand the verified focus successor and Rule 13 slot directly to V1 for
the focused Narrow consumer comparison after the gate passes.
[Source verification](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/source-before-gate.json).

**Focus successor gate PASS.** Isolated TypeScript and the canonical guarded offline
gate exited 0. The no-preload source specs passed 2,871/2,871, scripts passed 79/79,
and all four installed consumers passed 156/156. The before and after source manifests
match byte for byte. The packed manifest, both CSS files and all 1,067 declaration files
match the mobile-style base byte for byte. The emitted audit found zero MUI X and
frozen-reference edges in either bundle. Both MIT notices shipped and all 4,049 packed
dist files match the build on disk. The fallback audit is 22/22, the eager count is
22/298 plus one allowed context module, and all 336 WordPress dynamic-import targets resolve.
[Gate log](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/canonical-package.log) ·
[Post-gate source verification](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/source-after-gate.json) ·
[Packed API and style comparison](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/packed-boundary-parity.json) ·
[Emitted audit](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/emitted-boundaries.json).

The exact focus successor archive has SHA-256
`c11fd6cac5546602b3703d13ec4715d264722f99e30ab15df59b58c7cd7fcd6f`. The H23, H24,
and mobile-style successor archive digests were independently rechecked. V1's
focused Narrow consumer scope is the trusted Day tap and mouse Cancel against .472,
with original-Day focus at hide plus two frames, portal detachment and +250 ms.
Settled paper and control styling remain part of the comparison. The month-label
and chevron residual and the highlighted background input remain separate observations.
[Focus successor pack](/Users/a.kott/vanguard-verify/packs/e90441d30d074f2938187561cab71f061dcd226d-h24-mobile-focus.tgz) ·
[Checksum register](/Users/a.kott/vanguard-verify/packs/SHA256SUMS).

The direct Rule 13 handoff started verifier run 131. Delivery receipt
`message:mcp:1211c210-3939-4263-bf58-b3260f020e1c:thread-send:bd53afe9-996f-4f05-8945-e996eafdf2f0`.
[Vanguard Architecture and Visual Consistency](t3-thread://v2/e35503e3-cf61-4359-9313-451d57cd87cb/80fcbccb-4649-4a3a-88e7-93c70c8198d6).

**Focus successor Narrow replay inconclusive on resources.** The approved one-shot
preflight cleared for Storybook and its served index matched the qualified saved .472
index byte for byte. The first pre-Chromium interval measured 51.58% CPU idle against
the required 60%. Chromium never started. No live JS fingerprint, story, focus,
value or visual evidence was collected. V1 stopped Storybook, reaped the prior
waiter, removed the one-shot branch and returned the clear slot directly to A.
The package gate remains PASS and the Narrow focus and visual verdict remains open.
[Verifier status and slot closure](/Users/a.kott/vanguard-verify/v1/logs/h24-mobile-focus-v1/status.md).

**Single Narrow retry (decided-by-watchdog).** A verified the ports were clear and
returned the slot directly to V1 for the same staged focus successor and qualified
.472 reference. The sole Storybook may settle before guarded Chromium. The host
check still requires at least 60% CPU idle in each of three two-second readings,
at least 40% free memory, and the exclusive slot. The TextField replay remains queued
until V1 returns the slot. Delivery receipt
`message:mcp:1211c210-3939-4263-bf58-b3260f020e1c:thread-send:11fdf2b2-a6c6-4c13-ba5e-8933b24d8d69`.

**Exact packed Narrow Cancel focus PASS.** The guarded retry compared the focus
successor with both qualified .472 cycles at committed rc-webapp `73673465091`.
Both successor cycles restored the original, still-connected Day immediately after
Cancel and held it at portal detachment, hide plus two animation frames and detachment
plus 250 ms. Hidden value `25/10/2026` remained unchanged. Settled paper,
caption/date and edit/Cancel/OK metrics matched, and closed PNGs were identical.
Each open pair retained 743 changed month-heading/chevron pixels and 14,664 changed
field-underlay pixels, with zero differences elsewhere. The served index was exact,
both live JS fingerprints and the guard passed, and the request audit saw zero
non-GET requests. V1 preserved the prior refusal, stopped Storybook and Chromium,
removed the temporary checksum-specific override and returned the clear slot to A.
[Narrow verdict](/Users/a.kott/vanguard-verify/v1/logs/h24-mobile-focus-v1/verdict.md).

**Accepted, decided-by-watchdog.** The two-file focus patch changes `DatePickerShell.tsx`
and `_DatePickerShell.differential.spec.tsx`, SHA-256
`fe39f05b7386db0438fc217c0c6950cdd7c3dee90cf66b2c1f5749eb89e69237`.
The verified source tree is `e90441d30d074f2938187561cab71f061dcd226d` and the archive
SHA-256 is `c11fd6cac5546602b3703d13ec4715d264722f99e30ab15df59b58c7cd7fcd6f`.
The 743 month-heading/chevron pixels are accepted at this viewport. The 14,664
field-underlay pixels are recorded separately below. [Focus patch](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-repro/mobile-cancel-focus.patch) ·
[Exact archive](/Users/a.kott/vanguard-verify/packs/e90441d30d074f2938187561cab71f061dcd226d-h24-mobile-focus.tgz).

**Scoped underlay diagnosis, decided-by-watchdog.** After the §36.10 replay, one guarded
source-only Chromium session passed 7/7 fresh stories at 390×844. The early-disabled own tap
reproduced the archived dominant blue fill `(96,148,168)`, and every pixel of the 312×47
field differed from the transparent control. That control was pixel-identical to the late
animations-allowed crops on the ordinary tap, keyboard, and frozen legs. The fresh
early-disabled frozen tap had a weaker tint `(116,134,141)`, while the archived .472 Narrow
had neutral dimming. Both own tap legs computed the same open field fill and border and had
backdrop opacity 1 at the early-disabled observation. Only the diagnostic control changed
the opener's tap color. This isolates transient tap highlighting in the source fixture and
supports the packed attribution. The source witness does not establish a post-fix packed
image result. **Closed, decided-by-watchdog.** The transient native tap feedback is
accepted on the verified Chromium fixture. Retain the existing production styling and
archive. [Attribution and protocol](/Users/a.kott/vanguard-verify/logs/h24-mobile-underlay-triage/attribution.md) ·
[Crop metrics](/Users/a.kott/vanguard-verify/logs/h24-mobile-underlay-triage/paired-capture-20261120T134139/crop-comparison.json) ·
[Guarded story result](/Users/a.kott/vanguard-verify/logs/h24-mobile-underlay-triage/paired-capture-20261120T134139/underlay.log).

**Scoped public cutover approved (decided-by-watchdog).** Retain the local public wiring on
exact picker tree `0af021ac05e86503a9d2a4c613835ee3f3289061`. The watchdog independently checked
all 19 manifest hashes in the main and shadow worktrees, the unchanged public contract hash,
the exact mouse and touch traces and both network-guarded pointer launches. The desktop
check passed four placements and found zero differing RGB pixels across all six frames.
[Source manifest](/Users/a.kott/vanguard-verify/logs/date-picker-s3/public-cutover-retry/source-files.sha256) ·
[Main result](/Users/a.kott/vanguard-verify/logs/date-picker-s3/public-cutover-retry/integration-after.txt) ·
[Shadow result](/Users/a.kott/vanguard-verify/logs/date-picker-s3/public-cutover-retry/shadow-after.txt).

### 36.30 Pre–Tier C reconciliation (2026-11-20)

The ready admission input is the accepted H24 mobile focus successor, source tree
`e90441d30d074f2938187561cab71f061dcd226d`, archive SHA-256
`c11fd6cac5546602b3703d13ec4715d264722f99e30ab15df59b58c7cd7fcd6f`.
A fresh read-only comparison matched all 4,642 paths and modes in the isolated
snapshot. The integration worktree matches on 4,640 paths. Its two differences are
this plan and the synthetic callback-native TextField characterization spec, which
records the current routing difference and was kept outside the gate. There are
zero extra non-ignored paths in either comparison. HEAD remains `55dc611` and
includes the master Gallery merge and both B integration commits. All four H23 and
H24-family archive digests match the register. [Source and archive reconciliation](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/pre-tier-c-source-reconciliation.json) ·
[Verified focus successor](/Users/a.kott/vanguard-verify/packs/e90441d30d074f2938187561cab71f061dcd226d-h24-mobile-focus.tgz).

| Item | Before Tier C |
|---|---|
| DatePicker | Scoped source, package, desktop Data/legacy, composed publication and packed Narrow focus evidence recorded in §36.29. Both open-image residuals accepted at Narrow. The `.472` nested-calendar hit-test still has no qualified pair. Keep that gap in the final evidence. No DatePicker source or pack iteration is queued. |
| FormControl | The §36.10 guard review leaves opaque descendants on the existing public implementation to preserve the bundled MUI context contract. The exact successor still emits the FormControl fallback as an ESM dynamic import, and neither FormControl module appears in the linked WordPress graph. Zero known production call sites and no conservative guard for the evidenced wrapped context shape. Retain the existing fallback under the approved compatibility rule. |
| TextField and theme provider | Keep both eager under §36.10. The inner marker replay covers only the two declared profiles of original H24. Dynamic forwarding, external WordPress props, theme defaults and the cold unsupported-inner control remain prerequisites of any future ESM split. The callback-native synthetic case stays outside the release snapshot. |
| Known historical source and pack failures | H23 declaration boundary and SearchableSelect caret are in the successor. Offline source library TypeScript, 2,871 no-preload specs, 79 scripts, 156 installed consumer tests and the 22/22 fallback audit passed on the exact successor. B's ProgressBar and historical case audit are closed. The emitted audit has zero MUI X and frozen-reference edges, and the package preserves the declaration/CSS identity with its mobile-style predecessor. |
| Final source static and coverage evidence | The successor package gate covers library TypeScript, source specs/scripts and installed emitted types. It does not supply fresh `gates.sh` app/all-spec/contract/Biome evidence or the instrumented Storybook coverage result. Keep any final source checks on this exact isolated snapshot and collect the missing evidence in the final reserved slot. |
| Final consumer evidence | V1's prior H22 visual chunks, throughput canary and H24 unit canaries qualify their recorded scopes only. WordPress fixture hits are distinct from final runtime parity and Tier P. Final browser shards, paired full rc-webapp units, WordPress and Tier P are reserved for the single final candidate. Keep the approved production CSS-order and WordPress-plugin input gaps visible. |

**Admitted for Tier C (decided-by-watchdog).** Use the existing source snapshot and
verified archive. A checked the archive digest and released the clear slot directly to
V1 for one standard Rule 13 paired first Storybook shard and exact paired unit guard
canaries. Match committed consumer `73673465091`, recheck served identities at start
and end, require the deliberate denial self-tests, and retain complete paired expected
keys and exclusion/error logs. Use qualified root-only manifests within their approved
scope and discovery for extra targets. Run serially. V1 returns the clean slot directly
to A. Delivery receipt
`message:mcp:1211c210-3939-4263-bf58-b3260f020e1c:thread-send:0826175b-6773-4206-9f94-50579db94d57`.
The full rc-webapp unit pair stays at the end. [Canonical gate evidence](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/canonical-package.log) ·
[Final browser admission](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/tmp/research/vanguard-ui-sdk-visual-baseline/tierc-throughput-canary/README.md) ·
[Paired unit guard](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/tmp/research/vanguard-ui-sdk-visual-baseline/tierc-unit/README.md).

**Final source commands prepared offline.** After handback, run the exact snapshot's
static gate, then combined source and browser coverage with the existing 35-file,
95%-line and 85%-branch thresholds. Verify no outbound network for Node and Chromium,
the two permitted runner ports, the browser denial self-test and fresh standard Rule 13
preflight. Keep static and coverage outputs separate and reuse the accepted package
gate. Commands and guard drafts stayed outside the snapshot. Offline preparation
validated command syntax, Vitest option parsing, all 35 paths and the sandbox profile's
syntax. The guarded transport witness and source gates are still pending.
[Final source command handoff](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/README.md).

**D9 Redux exit remains deferred.** The exact archive still requires
`react-redux >=7.2.6` and `@reduxjs/toolkit >=1.7.1` as peers. The ESM legacy-dispatch
and WordPress runtime still import `react-redux`. The F4/F5 local form path works
without a Redux Provider. A full exit depends on consumer-side dispatch binding and
separate approval. It stays outside the admitted candidate. Final work remains the
source gates, eligible Tier C browser shards and final paired consumer coverage,
including WordPress and Tier P. The historical paired consumer TypeScript verdict
without consumer-installed MUI remains unrecorded for the exact candidate.

### 36.31 Tier C c000 evidence and first diagnostic replay (2026-11-20)

The admitted H24 focus successor was paired with `.472` on committed rc-webapp
`73673465091`. The discovery follow-up passed **4/4 complete pairs**, with valid start and
end served fingerprints and deliberate denial checks on each leg. The fifth discovery
key, Saved Call Asset Details `waiting-for-backend`, has no PNG on either leg and
remains open. The two exact unit guard canaries passed **4/4 each**, with all five
expected deny signatures and the mocked Axios response on both. The full unit pair
remains reserved for the end. V1 closed its runners and returned the clear slot.
[V1 verdict and links to both guard records](/Users/a.kott/vanguard-verify/v1/logs/tierc-c000-20261120T141729/verdict.md) ·
[Status](/Users/a.kott/vanguard-verify/v1/logs/tierc-c000-20261120T141729/status.log) ·
[Discovery accounting](/Users/a.kott/vanguard-verify/v1/logs/tierc-c000-20261120T141729/discovery-accounting.json).

The root manifest comparison is **provisional**. It records 114 PASS, 26 FAIL and one
UNSTABLE among 141/145 complete pairs. The original candidate session had an opening
fingerprint and stopped before the closing fingerprint. Later fingerprints qualify
only their own discovery captures. Four candidate Account Logs style roots are empty
(`loading`, `reports`, `user-logs`, `user-logs-with-ips`). Keep those missing keys apart
from rendered comparisons. [Manifest accounting](/Users/a.kott/vanguard-verify/v1/logs/tierc-c000-20261120T141729/manifest-accounting.json) ·
[Preserved raw comparison](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/tmp/research/vanguard-ui-sdk-visual-baseline/out/tierc-c000-20261120T140506-candidate-manifest/diff-vs-tierc-c000-20261120T135013-baseline-Story.md).

| Group | Provisional evidence and what remains to distinguish |
|---|---|
| Payment Lock Banner, six | Each candidate has the same 17-node added subtree; matched nodes have no reported style differences. Five subtrees contain the declined copy, and `retry-succeeds` contains the settled copy. The committed story seeds account state in `beforeEach` and its retry variants can advance state in `play`. The `SubAccount` candidate contains the declined copy even though the fixture expects the owner-contact copy. Check seed/render phase and variant before assigning a component cause. |
| Animation phase, six plus one unstable | Payment Settings, Widget Comparison and Inventory, Billing Exports `first-load`, and Done and Scheduled loading stories have horizontal offset deltas on the same animated skeleton descendants. Widget Comparison `data` has one analogous unstable offset. Pin the animation timestamp on a diagnostic replay, preserve a normal frame and compare the static skeleton boxes separately. |
| Billing table geometry, eight | The same node counts and table selectors accompany table widths about 0.8–1.2 px greater on the candidate, distributed mostly in the Created column and following Actions offset. The committed fixture uses Vanguard table head/body and a relative-time cell in an auto-layout table. The start-result rows also shift timestamp and status widths, and the selected-IDs story reports a separate 0→23 px type-tile margin. Freeze the story time and fonts before attributing any geometry to the table or the form. |
| Remaining render/geometry, six | Three PartnerApiTester variants have a zero-size candidate root and 60–70 fewer nodes in the manifest. The fingerprinted passive `login-form` pass is a separate variant. Scheduled `all-buckets` redistributes title/trailing-text width by about 2.3–2.5 px, and TaskTray phone/tablet card heights move 92→72 / 72→70 px. Readiness and actual row contents/wrapping remain open. |

**First diagnostic replay proposal.** On a later approved narrow slot, prioritize the
six-row Payment Lock Banner family with `Retryable`, `NotLocked` and `SubAccount` on
both exact builds, Direct Channel light, the original viewport, guarded passive
discovery and start/end fingerprints. Capture the initial frame and the same seeded
settled state on both sides. Use synthetic story state and measure the banner count,
text and controls without clicking or issuing a retry. Expect one declined banner and
one enabled Retry control for `Retryable`, zero banners for `NotLocked`, and one
owner-contact banner with no declined copy or Retry control for `SubAccount`, as pinned
by the committed stories. If the settled pair differs, trace the first divergence in
seed, render and visible state. A proposed fix needs a focused assertion that is green
on `.472`, red on the exact unfixed route for the same seeded state, then green on the
smallest correction with all three controls retained. If the difference appears only at
the initial capture boundary, preserve the timing evidence for the harness review.
This proposal does not adjudicate the 26 flags. [Committed story path](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/account/PaymentLockBanner/_PaymentLockBanner.stories.tsx:24).

**Decided-by-watchdog.** The three Payment Lock Banner controls may run inside V1's
existing family-first replay if the first payment witness cannot establish equivalent
settled state. The discovery and guard results keep their recorded scopes, and the
manifest flags remain provisional. The helper slot contains no separate browser launch.

### 36.32 Exact source static RED and lazy fallback proposal (2026-11-20)

The exact isolated H24 focus successor (`e90441d…`) ran the prepared static phase after
V1 handback. The bounded result was **VALID RED**, raw and reported exit 1. App, lib and
MUI contract TypeScript were clean. All-spec TypeScript reported 21 diagnostics across
six fixture files: DateRangeInput 2, SearchableSelect caret 1, class-junk scan 1, TextField
prop routing 3, TextField reachability 11 and Popper dual-boundary 3. The failures cover
fixture-only extra props, overly narrow select generics, native element/ref types, real
mask slot adapters, the fixture's private registration lookup and modifier inference.
The six local fixture typing edits are saved outside the H24 snapshot. The custom
TypeScript wrapper and terminal request are parked; its setup failures supply no test
result. Later validation uses the existing `tsconfig.spec.json` and Vitest `spec` project.
[Static result](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/static.9jGykx/result.json) ·
[Raw diagnostic log](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/static.9jGykx/static.log) ·
[Parked wrapper setup output](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/types.xiWpO8/tsc.log).

Biome reported six errors and 866 warnings, including 62 warning identities above the
declared `master-ts7` baseline from `f02d3f5`: 37 in frozen references, seven in fixtures
and 18 in shipped source. Those 62 identities add 85 occurrences over their individual
baseline counts. Four errors are fixture component factories, one in TextField
reachability and three in the two media-query specs. The two shipped errors are
`noComponentHookFactories` on `Inner` and `Fallback` in the shared lazy fallback helper.
They are a shipped lint blocker, with no runtime failure inferred from the lint result.
Keep lint rules, declared baseline, frozen behavior, public props and test selection intact.
B's mechanical production-warning proposals remain review-only. **Decided-by-watchdog:**
coverage stays held. Static remains mandatory for final acceptance. The admitted
c000 diagnostic replay may precede static per §36.46.
[Full Biome JSON](/Users/a.kott/vanguard-verify/worktrees/h24-mobile-focus-successor-source/agentic-plans/mui-upgrade-gates/out/tier-c-e90441d-static.9jGykx/lint.json) ·
[Declared baseline provenance](./mui-upgrade-gates/baseline/master-ts7/provenance.json).

**Proposed helper-only fix, review pending.** Move the bodies of `Inner` and `Fallback`
to module-scope render functions, then bind each once inside `lazyFallback` to that
route's state and, for the outer function, its already bound inner component. This
follows the existing module-level render/bind pattern in `withLazy`. Keep `Loaded`,
`pending`, the single registry entry per route and the loader in their current per-route
scope. The route can provide a `readLoaded` getter and the unchanged `preload` function
to the bound render functions. The loaded branch renders the actual component directly.
The cold branch mounts the same `Suspense fallback={null}` and throws the one pending
promise from its inner component. This preserves the first-commit blank on cold ESM,
deduplication across mounts and preloads, and immediate rendering after preload or from
an inline module object. Each route keeps distinct, stable component identities, even
when two routes resolve to the same component. Keep the nine literal import call sites
and the WordPress `inlineMuiFallbacks` rewrite intact. No conversion to `React.lazy`,
external API change or production edit is part of this draft. [Helper](../src/core/_internal/lazy-fallback.tsx) ·
[Existing bind pattern](../src/helpers/with-lazy.tsx) · [WordPress transform](../config/inline-mui-fallbacks.ts).

**Later red/green checks in an authorized slot.** The saved static result is the lint
RED. Run targeted `biome lint src/core/_internal/lazy-fallback.tsx` before and after the
edit, requiring the same two diagnostic identities before and zero after. Use the
guarded existing `spec` project with no global preload for the helper spec, the
Autocomplete cold/own routing spec and the existing preloaded FormControl and
ProgressBar contract specs. Preserve the helper's cold blank, resolve-to-content, warm
fresh mount and inline first-render assertions. An additive helper witness would hold
one loader pending while two instances of the same route mount, assert one loader call
and two initially empty outputs, then resolve and assert that rerender retains the
loaded node while switching to a separate route remounts it. Keep preloading checks
in the existing allow-listed fixtures. Targeted baseline and patched runtime outcomes
should both be green for a lint-only refactor. A deliberately repeated loader or shared
route instance should turn the corresponding additive witness red. Run
`node scripts/check-fallback-audit.mjs` and require the current 22/22 accounting with
zero unexpected or stale entries. Inspect the reference and literal rewrite with no
call site changes. At the later approved packaging milestone, require the existing
WordPress packed smoke to render the `sx` Autocomplete opt-out on the first turn,
retain the inline filled TextField checks, and preserve the ESM/WP import boundaries.
The accepted H24 package result is the reference for that comparison. [Helper spec](../src/core/_internal/_lazy-fallback.spec.tsx) ·
[Autocomplete routing spec](../src/core/Autocomplete/_AutocompleteOwnRouting.spec.tsx) ·
[Preloaded FormControl contract](../src/core/FormControl/_FormControl.mui.spec.tsx) ·
[Preloaded ProgressBar contract](../src/core/ProgressBar/_ProgressBar.mui.spec.tsx) ·
[WordPress packed smoke](./mui-upgrade-gates/package-fixture/smoke/bundle.test.tsx:155).

After direct authorization and fresh Rule 13 preflight, the narrow commands on the
reviewed source would be:

```sh
export NODE_OPTIONS="--max-old-space-size=4096 --require=/Users/a.kott/vanguard-verify/logs/h21-spec-network-guard.cjs"
export npm_config_offline=true STORYBOOK_DISABLE_TELEMETRY=1 VG_NO_FALLBACK_PRELOAD=1
./node_modules/.bin/biome lint src/core/_internal/lazy-fallback.tsx
node node_modules/vitest/vitest.mjs run --project spec --maxWorkers=1 --no-file-parallelism \
  src/core/_internal/_lazy-fallback.spec.tsx \
  src/core/Autocomplete/_AutocompleteOwnRouting.spec.tsx \
  src/core/FormControl/_FormControl.mui.spec.tsx \
  src/core/ProgressBar/_ProgressBar.mui.spec.tsx
node scripts/check-fallback-audit.mjs
```

Capture the pre-edit lint exit independently so the behavior controls can run on the
same revision. The next source acceptance gate compiles the full existing spec project
through `gates.sh`. It carries the saved six test-side typing corrections only after
review and retains the app/lib/contract and full Biome checks. No replacement pack or
browser gate is part of this step.

**Helper-only refactor approved and verified (decided-by-watchdog).** The targeted
pre-edit Biome command exited 1 with exactly `lint/correctness/noComponentHookFactories`
for `Inner` and `Fallback`. The four guarded spec files then passed 38/38 on the original
helper, including its existing cold, warm and inline controls and the additive route
identity and deduplication witness. The helper now binds both module-scope render
functions once per route. The per-route loader, pending promise and registry still
use the original logic. The witness establishes the loaded branch on a parent rerender
before recording the node, then checks warm-to-warm reuse and remount across distinct
routes sharing one default component. It makes no node-identity claim across the
cold-to-warm transition. [Lint RED](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/lazy-fallback.jfRP5D/biome-red.json) ·
[Baseline spec log](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/lazy-fallback.jfRP5D/spec-before.log).

The post-edit helper Biome check exited 0 with zero errors and warnings. The additive
spec also passed targeted lint. The same guarded selections passed **38/38** again:
helper 4, Autocomplete routing 11, FormControl 8 and ProgressBar 15. The guard self-test
passed before each spec run. Post-edit fallback audit was **22/22** with zero unexpected,
stale or reasonless entries. The nine literal caller files and WordPress rewrite file
match their before hashes. This proves module-mode first render at source and preserves
the literal rewrite boundary. Packed runtime remains covered by the existing archive
evidence until a later replacement milestone. The overall static RED remains open and
coverage is held. [Lint GREEN](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/lazy-fallback.jfRP5D/biome-green.json) ·
[Guarded spec result](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/lazy-fallback.jfRP5D/spec-after.log) ·
[Fallback audit](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/lazy-fallback.jfRP5D/fallback-audit.log) ·
[Call-site and rewrite hashes](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/lazy-fallback.jfRP5D/rewrite-after.json).

**Local lazy-fallback PASS accepted (decided-by-watchdog).** The exact two-file Git
diff SHA-256 is `1b9422d05fd9f6041c1c32e866a111c007c7ae9d52f9b06eb9b0fa75b51f7594`.
The 38/38 guarded before/after results, clean helper lint, 22/22 audit and identical
nine call-site and rewrite manifests qualify that local diff. Verification on a
packed successor is pending. The admitted H24 focus archive stays immutable.

### 36.33 Fixture typing and component factories (2026-11-20)

**Decided-by-watchdog.** Use the existing guarded `tsconfig.spec.json` once for the
six saved typing corrections. Before moving the component bodies, the canonical
compiler exited 0 with no diagnostics. The parked wrapper was not used. Targeted
Biome RED reproduced four `noComponentHookFactories` errors: one TextField
reachability harness, one media-query differential probe and two media-query SSR
probes. Each now lives at module scope and receives its original per-run inputs.
The fixtures preserve the same validity, focus, SSR and listener assertions.
[Canonical TypeScript exit](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixtures.luwzq4/tsc-spec-exit.txt) ·
[Biome RED](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixtures.luwzq4/biome-red.json).

The three files had zero lint errors and warnings after extraction. The same
**21/21** tests passed before and after with identical case names: TextField
reachability 6, media-query differential 6 and media-query SSR 9. The Node guard
self-test passed before the canonical compile and both spec runs. Only the three
affected spec files ran. The other five typing correction files also had clean
targeted lint. The canonical compiler was not repeated after extraction.
[Biome GREEN](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixtures.luwzq4/biome-green.json) ·
[Typing-fixture lint](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixtures.luwzq4/typing-fixtures-lint.json) ·
[Spec baseline](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixtures.luwzq4/spec-before.log) ·
[Spec result](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixtures.luwzq4/spec-after.log).

**Outstanding static warnings.** Reconciliation combines the H24 full diagnostic
report for byte-identical paths with the scoped clean checks for edited paths.
All six known Biome errors are cleared locally. The **62 introduced warning
identities** remain, with 85 occurrences above their baseline counts: 18 shipped
source, seven fixtures and 37 frozen references. The plan and separately parked
TextField characterization are outside this candidate reconciliation. The warning
inventory remains a release blocker and the whole static gate is still due on the
next reviewed snapshot. [Exact remaining paths, rules and messages](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixtures.luwzq4/outstanding-static.json).

**Proposed remediation order.** Start with fixture-only warnings whose fixes keep
the same inputs and assertions, such as discarded callback return values. Review
shipped mechanical changes separately. Keep B's proposals review-only. Examine the
ten shipped hook dependency warnings against their actual rerender and cleanup
contracts before editing. Key changes also need list identity evidence. Handle the
37 frozen warnings in their own review, with 28 dependency warnings requiring
particular care to preserve the reference behavior. Keep the lint rules, thresholds,
declared baseline and test selection intact. Coverage remains held pending static
acceptance. This slot produced local fixture edits and evidence only.

**Scoped PASS accepted (decided-by-watchdog).** The accepted three-file Git diff
against HEAD has SHA-256 `b3b69b6b1568d5927c7382ebd1108c89806fe155b86efc8852619368ff321cb9`.
The pre-hoist canonical compile ran on 2026-11-20 at about 14:45:40–14:45:46 EET
(6.06 seconds from opening the compiler log to writing its exit marker), with exit 0.
The four fixture lint errors cleared and the same 21 cases passed before and after.
The full static gate remains pending on the next reviewed snapshot.
[Canonical compile preflight](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixtures.luwzq4/resources-canonical.log) ·
[Compiler exit](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixtures.luwzq4/tsc-spec-exit.txt).

### 36.34 Four-file fixture warning batch and frozen references (2026-11-20)

**Narrow fixture batch (decided-by-watchdog).** The same four files went from 11
Biome warning occurrences to zero diagnostics: one discarded `forEach` callback
result each in the DatePicker shell and error-logging fixtures, seven literal
template-example warnings in junk-class test titles, and two conditional hook
warnings in the theme differential. These account for four introduced warning
identities. The two callback bodies now discard their result explicitly and the
titles escape literal backticks and `${…}` while preserving the exact names.
The theme fixture already creates a fresh output object, wraps and mounts one tree,
and unmounts it per implementation. Separate module-scope probes keep that setup,
the same provider wrappers, hook inputs and output normalization. Existing assertions
are intact. Guarded pre/post spec results were **75/75** with identical full-name and
status inventories: DatePicker 41, error logging 19, junk classes 8 and theme defaults
7. The Node guard self-test passed before both legs. [Lint before](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixture-warnings.UFiWXp/biome-red.json) ·
[Lint after](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixture-warnings.UFiWXp/biome-green.json) ·
[Guarded baseline](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixture-warnings.UFiWXp/spec-before.log) ·
[Guarded result](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixture-warnings.UFiWXp/spec-after.log) ·
[Matched case inventory](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixture-warnings.UFiWXp/matched-case-inventory.json).

Reconciliation against byte-identical paths in the H24 static report leaves **58**
introduced identities and 74 excess occurrences: 18 shipped, three held fixtures
(two Breadcrumbs, one TextHighlighted) and 37 frozen-reference identities.
B's proposals remain review-only. The canonical compiler and full static gate were
not repeated. [Outstanding diagnostic inventory and four path hashes](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixture-warnings.UFiWXp/outstanding-static.json).

**Frozen-reference provenance and current boundaries.** All 13 files behind the 37
identities match their blobs and SHA-256 values in the accepted `e90441d…` snapshot.
The inventory records tracked first-add commits, any documented source anchor and
the exact §36.23 local DatePicker origin, plus direct spec or story imports for every
file. The declared warning baseline remains `f02d3f5…`. Both app and lib TypeScript
configs exclude specs and `.stories.tsx`, and all 13 reference modules remain roots
in both. The spec config includes `_*.spec` as roots, with references loaded through
fixture imports. The shared declaration config and the ESM Vite plugin explicitly
exclude `*.mui-reference.ts[x]`. Three warning-bearing legacy `*.reference.tsx` files
remain declaration roots. WordPress also narrows declaration emit to its entry graph.
Under both filename patterns the exact H24 ESM and WordPress runtime graphs contain
zero frozen reference modules. [Reference blobs, origins and importers](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixture-warnings.UFiWXp/frozen-reference-provenance.json) ·
[Config root membership](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixture-warnings.UFiWXp/tsconfig-root-membership.json).

**Legacy declaration boundary gap.** The prior H24 audit matched only
`*.mui-reference`. Direct archive inspection found eight `*.reference.d.ts` files
in ESM, including the warned Accordion, ListShowMore and Slider references. Those
eight declaration payloads match H23 byte for byte. There are none in the WordPress
archive and no other emitted declaration refers to their stems. The existing
`./dist/*` export pattern covers their paths, so a rename or declaration exclusion
would remove packaged paths. Committed rc-webapp `73673465091` had zero tracked
matches for those stems under `html/react/src`. External consumers are outside that
scan. Preserve the paths and flag any proposed removal for a separate D12 decision.
The read-only pack finding leaves both archives and all exclusion rules unchanged.
[Exact archive membership and SHA-256 values](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixture-warnings.UFiWXp/frozen-reference-provenance.json) ·
[Existing audit detector](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/audit-emitted-boundaries.py:20) ·
[Export pattern](../package.json:81).

**Proposed frozen-reference remediation, review pending.** Preserve the pinned
pre-edit blobs as the comparator and keep each proposed edit in its own fixture
diff. Start with the two narrow type/empty-pattern identities only after proving
identical accepted inputs and, for any packaged path, declaration compatibility.
Handle the prototype and coercion identities with explicit value-domain cases.
Treat all three key identities as replay work over reorder, insertion and removal.
For the 28 dependency identities and two conditional-hook identities, compare the
old and proposed fixture across rerenders and unmounts with exact effect/callback
counts, DOM and cleanup. For example, track `formconfig` presence and identity
changes on the frozen Autocomplete and DateRangeInput paths before deciding whether
the conditional hook can be normalized. Track DateRangePicker ref attachment and
date/data updates before changing an effect trigger. Equivalent setup is unproven
for those transitions and for the Slider's form-binding effects. Leave each such
identity open until its comparator passes. Where an edit would change the old
contract, report the specific dependency or path decision before proceeding.
Run the existing importers, canonical static gate and eventual packed-boundary
checks on the reviewed successor. Keep lint rules, thresholds, baseline and
selection intact. This step changed no frozen references.

**Scoped four-fixture PASS accepted (decided-by-watchdog).** The watchdog verified
all 75 file/fullName/status rows and the 11 targeted warning occurrences dropping to
zero. The exact current SHA-256 values are:

| Fixture | SHA-256 |
|---|---|
| `src/core/DatePicker/_DatePickerShell.differential.spec.tsx` | `dbe85e3d4c51143d33dd20a15537c7a191da7e4f88af0d08621d81cf2dcead6a` |
| `src/core/RcErrorBoundry/_error-logging.spec.tsx` | `21bd107ffa1e64673e2bedf0f93d837c17dcf3fc4fd7d00b834a12513d8acf27` |
| `src/core/_internal/_theme-default-props.differential.spec.tsx` | `9420be62601eaf9efbaec7e438f181c61de620a6ab604d050645b78f48994146` |
| `src/helpers/_junk-class-sites.spec.tsx` | `e1a67665409eda0f94ece8d8c50c25f7a1cd57344fd372497971a65054d718cd` |

The 58 remaining warning identities and 74 excess occurrences are a reconciliation
of the earlier full result with narrowly checked changes. The next canonical static
run will produce a fresh inventory. [Accepted hashes and reconciliation](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixture-warnings.UFiWXp/outstanding-static.json).

### 36.35 Legacy reference declaration projection (2026-11-20)

**D12 scope clarified (decided-by-watchdog).** H23 and H24 are local verification
packs. Saved `.472` and cached `origin/master` have zero legacy reference matches.
The eight first-add commits (`3911192`, `48a8270`, `80cef30`, `5c2630c`, `7c7dc1f`,
`b9f8736`, `ecfabc0`, `62e5747`) are absent from locally known remote-tracking refs
and tags per watchdog inspection. The exact eight current matches are fixture
sources and their direct importers are specs or stories. The committed rc-webapp
scan found zero exact imports. This evidence supports excluding those eight from
the next local artifact, with no claim about every external release. All D12 keys
and ordinary public declaration targets stay in scope for preservation.
[Match and importer inventory](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/declaration-boundary.4IQ4jo/projection-scope.json).

**Scoped projection PASS accepted (decided-by-watchdog).** The three-file Git diff
SHA-256 is `d34d0327c410d2d2da00d7c00bdacb769c0c8892bc90bf621d2ec0aeeb5b2d0f`.
The additive declaration check pins existence of all eight test sources, keeps the
eight paired public component roots, and checks both frozen suffixes. Before the
emit edit, the two projection assertions failed for those eight roots and the ten
other guarded script cases passed. The first GREEN preflight at 14:58 deferred the
launch at 36% memory free (load 3.44). The guarded recheck qualified at 41% free
and load 5.32. The same two script files passed **12/12**. The ESM projection
changed 820→812 roots and the shared WordPress exclusion projection 821→813. Both
deltas consist of exactly the eight fixture source paths, with zero additions.
Fixture bytes, importers and runtime entry points stayed intact. The existing
package export assertions use the accepted installed H24 artifact as their control.
This is a source projection result. [RED log](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/declaration-boundary.4IQ4jo/spec-red.log) ·
[First GREEN preflight](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/declaration-boundary.4IQ4jo/resources-green.log) ·
[Qualifying recheck](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/declaration-boundary.4IQ4jo/resources-green-recheck.log) ·
[GREEN log](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/declaration-boundary.4IQ4jo/spec-green.log) ·
[Exact root-set delta](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/declaration-boundary.4IQ4jo/projection-delta.json).

**One milestone pack proof.** Check both `*.mui-reference` and `*.reference` in
exact ESM/WP archive member paths and runtime module IDs. Use actual parsed
specifiers for static imports/re-exports, literal dynamic imports, import types,
require and triple-slash types/paths. Review the complete archive member delta,
drop exactly the eight ESM declarations, and preserve unrelated declaration bytes.
Retain regular D12 export and resolver checks, runtime graphs, and ordinary
WordPress entry reachability and runtime checks. The scratch input pins the
accepted manifest, full member list, 1,067 declaration hashes and eight exact
expected removals. No candidate artifact check has run.
[Scratch milestone baseline](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/declaration-boundary.4IQ4jo/milestone-declaration-baseline.json).

### 36.36 Two frozen-reference lint designs (2026-11-20)

**Review plan approved (decided-by-watchdog).** Preserve the exact original blobs
and use mounted old-versus-new comparisons. The first two design candidates are
Toolbar's empty destructuring pattern and SnackbarRoot's empty props type.
Dependency, key, conditional-hook, prototype and coercion changes remain held.
Both files are `.mui-reference.tsx` fixtures outside the existing emit projections.
[Pinned source and importer provenance](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixture-warnings.UFiWXp/frozen-reference-provenance.json).

**Toolbar — proposed one-line deletion.** Pin original blob
`131d805c0b23fff7dbb837925adc1c4a0a95d37b`, SHA-256
`d86d3efebbce666bfa6a87e1ef0fd40f55bdc2bb239ced48d72dfb7b64e9e0ec` (header
source `a3f9ab4`, first-add commit `513cb72`). Remove `const {} = props` and keep
the exact `{} & ToolbarProps` signature, outer container, MUI import and complete
props spread. Before and after, the typed input domain is identical. For the
observed mounted domain React supplies a props object, including default,
Navbar `className`, dense/disabled gutters, and `Nav` children. The empty pattern
reads no property on that object. A direct function call with `null` or
`undefined` could throw at the original empty pattern and has no observed
importer. Equivalence for those out-of-fixture direct calls is unproven. If a
direct caller turns up, hold the deletion and review that specific input.

In a later authorized slot, require targeted lint `noEmptyPattern` RED→GREEN
and mount pinned versus proposed Toolbar through the same AppBar/provider tree.
Compare normalized wrapper HTML, `.Toolbar-container`, `.MuiToolbar-root`,
host element, class order, children and inline styles. Keep the existing
AppBar differential's Navbar and dense cases and whole-tree/ref comparisons.
The existing computed parity stories select `[data-side] .MuiToolbar-root`
and `header` through all `data-case` rows, including the Navbar production-order
fixture. Replay those unchanged when browser work is authorized.
[Toolbar reference](../src/core/Toolbar/_Toolbar.mui-reference.tsx:11) ·
[Mounted spec importer](../src/core/AppBar/_AppBar.differential.spec.tsx:27) ·
[Computed style importer](../src/core/AppBar/_AppBarComputedParity.stories.tsx:68).

**SnackbarRoot — proposed type-only replacement.** Pin original blob
`83310836dffe004b6a9fccf9b92368e36287ba81`, SHA-256
`bef9afb0beabad4d17599c788736b658d5f2b36b1a2c114964885d34fec6d8db` (header
source `b0b02c2`, first-add `e56293b`). Replace only `type Props = {}` with
`type Props = NonNullable<unknown>`. The installed TypeScript5 library defines
`NonNullable<T>` as `T & {}`. Intersecting `unknown` with `{}` preserves the
original type expression's domain, including structurally assignable object and
primitive values, and retains the compiler's existing nullability settings.
Under strict null checks both exclude `null` and `undefined`. The mounted importer
uses only `<R />` with its empty React props object. Keep the unused props parameter
and emitted runtime body identical, including pub-sub subscriptions and timers.
Require a later bidirectional `ComponentProps` type witness on the canonical config.

In a later authorized slot, require targeted lint `noBannedTypes` RED→GREEN.
Mount pinned versus proposed roots with independent `vi.resetModules` registries
and fake timers from the existing Snackbar differential. Compare canonical body
markup including body style, `section`, `.MuiSnackbar-root` presence, alert text,
and `onClose` counts through the 3000 ms auto-hide, replacement, and explicit
service-close timelines. Use the existing normalization and assertions and keep
reference subscription/cleanup behavior intact. [SnackbarRoot reference](../src/core/SnackbarRoot/_SnackbarRoot.mui-reference.tsx:9) ·
[Mounted service importer](../src/core/Snackbar/_Snackbar.differential.spec.tsx:173).

**Two-file implementation approved (decided-by-watchdog).** This slot covered
Toolbar's empty pattern and SnackbarRoot's props type. The mounted React props
domain above remains the scope of the Toolbar proof. A direct null or undefined
function call is outside that witness. The two original blobs and exact patch
are preserved. The two-file patch SHA-256 is
`9b58e5279035279963254cd81f79232e166d764fadd6e197f3e0b`.
[Pinned files and exact patch](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/frozen-references.NFRaHp).

**Scoped lint and mounted PASS accepted (decided-by-watchdog).** Biome reproduced
`lint/correctness/noEmptyPattern` at Toolbar line 12 and
`lint/complexity/noBannedTypes` at SnackbarRoot line 9 on the pinned inputs.
Those two warnings went to zero. Each guarded single-worker run passed 27/27
cases (12 AppBar/Toolbar and 15 Snackbar), with identical file, full name and
status inventories and unchanged runtime assertion code. A scratch trace-only
Vite transform captured 53 byte-identical rows, including 22 AppBar/Toolbar
mounts, 24 Snackbar arms, six fresh-module SnackbarRoot arms, and the auto-hide
`onClose` count of one per side. The six root unmount snapshots had empty body
style and markup. The trace SHA-256 is
`f56c4b9da5b4404856209424e4b272be657d8377c161ccbe14f6c72cbce39cb2`.
[Lint RED](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/frozen-references.NFRaHp/lint-before.json) ·
[Lint GREEN](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/frozen-references.NFRaHp/lint-after.json) ·
[Guarded mounted run comparison](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/frozen-references.NFRaHp/comparison.log).

**Type witness staged for the canonical compiler gate.** The Snackbar
differential has a type-only bidirectional `React.ComponentProps` check against
`Record<never, never>`. The guarded TypeScript 5.9.3 single-file proof confirmed
that the witness domain equals the old literal and the new alias in both
directions with strict null checks off and on. Narrowing the alias to `string`
failed the expected constraints in both modes. The old and new SnackbarRoot
emit identical JavaScript in the focused proof. The type-only addition also
leaves the importer's JavaScript identical. The witness is recorded separately
from the approved two-file patch. Canonical compiler validation and packed
checks remain pending.
[Type and runtime proof](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/frozen-references.NFRaHp/type-proof.log).

**Warning reconciliation.** The prior inventory had 58 identities and 74 excess
occurrences. The exact Toolbar and SnackbarRoot identities each had one excess
occurrence and zero baseline occurrences. Removing those two leaves 56
identities and 72 excess occurrences (35 frozen references, 18 shipped source,
and 3 fixtures by identity). This is a reconciliation from scoped lint. The
next static gate will produce a fresh inventory.
[Path-and-rule reconciliation](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/frozen-references.NFRaHp/outstanding-static.json).

### 36.37 ClickAway ref assignment (2026-11-20)

**Scope approved (decided-by-watchdog).** Replace the comma expression in
`ClickAway.handleRef` with a block. The internal node is assigned before the
child ref is updated. Detach still clears the internal node before running
the returned React 19 cleanup or clearing the child ref. The object-ref and
no-ref paths still use the existing `setRef` helper.

**Scoped PASS accepted (decided-by-watchdog).** Targeted Biome reproduced one
`lint/complexity/noCommaOperator` warning at line 140, column 96, before the
change and reported zero diagnostics after it. Before editing production,
an additive witness pinned the object ref's node, its clearing before the
replacement callback attaches to the same node, and one null call when that
callback has no cleanup. The existing React 19 cleanup assertion stayed
byte-identical. Guarded canonical `spec` runs with one worker passed **26/26**
before and after (3 ref, 21 parity, 2 ClickAway resource cleanup). All 45 file,
full-name and status rows matched, including the 19 unrelated cleanup cases
skipped by the identical selector. Two earlier runs are preserved as filter
setup evidence: the first selected only the cleanup cases; the second
missed the colon-bearing parity suite. The two-file patch SHA-256 is
`fe8a96924a60e8ee1905db20a58e2ee3db69bd890936c25914f4903b5a187df3`.
[Lint RED](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/click-away-ref.S98HuM/lint-red.json) ·
[Lint GREEN](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/click-away-ref.S98HuM/lint-green.json) ·
[Guarded comparison](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/click-away-ref.S98HuM/comparison.log) ·
[Initial filter setup](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/click-away-ref.S98HuM/selection-setup-pre.vitest.log) ·
[Suite filter setup](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/click-away-ref.S98HuM/selection-suite-pre.vitest.log) ·
[Exact patch](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/click-away-ref.S98HuM/click-away-ref.patch).

The scoped correction removes one shipped-source warning identity and one
excess occurrence from the §36.36 inventory. The reconciled total is 55
identities and 71 excess occurrences (35 frozen references, 17 shipped
source, and 3 fixtures by identity). The canonical static gate remains pending.
[Updated reconciliation](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/click-away-ref.S98HuM/outstanding-static.json).

### 36.38 Remaining fixture lint warnings (2026-11-20)

**Scope approved (decided-by-watchdog).** The two Breadcrumbs helpers key
each entry by its existing URL fragment. In the parity helper the same
fragment keys the link and text forms of an item. Item order, values, child
nodes, null and stray-text controls, and assertion code stay intact.
TextHighlighted passes the same undefined child through nested JSX.

**Scoped PASS accepted (decided-by-watchdog).** Biome reproduced three warning identities at four locations:
two index keys in the parity fixture, one in the cleanup fixture and one
explicit children prop in TextHighlighted. The three files lint clean after
the edits. The exact three-file patch SHA-256 is
`6dd77930e90ad59f68848c4615dd31efe5e8963c56aff1b8c720cc9f8d466173`.
A guarded one-worker replay passed 8/8 before and after with identical file,
full-name and status rows. The scratch trace transform produced 389
byte-identical Breadcrumbs records across 342 paired matrix rows, 42 timeline
frames and five cleanup/contract observations. The traces include raw DOM,
active element and per-timeline DOM node identities. The trace SHA-256 is
`74b0111fce7a045d983be6a1c218a8eb19f7f031d4e9c871e4ee00d226e4478d`.
Both automatic JSX modes emitted byte-identical TextHighlighted test JavaScript
and produced a React element with its own `children` prop set to `undefined`.
[Lint RED](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/remaining-fixtures.nvEVLJ/lint-red.json) ·
[Lint GREEN](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/remaining-fixtures.nvEVLJ/lint-green.json) ·
[Guarded trace and inventory comparison](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/remaining-fixtures.nvEVLJ/comparison.log) ·
[JSX emit proof](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/remaining-fixtures.nvEVLJ/text-highlighted-emit.log) ·
[Exact patch](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/remaining-fixtures.nvEVLJ/remaining-fixtures.patch).

The fixture group accounts for three identities and four excess occurrences
removed from the §36.37 inventory. The reconciled count is 52 identities and
67 excess occurrences across 35 frozen-reference and 17 shipped-source
identities. Canonical static validation is pending.
[Updated reconciliation](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/remaining-fixtures.nvEVLJ/outstanding-static.json).

### 36.39 DateField selection helper (2026-11-20)

**Scope approved (decided-by-watchdog).** Move `selectContents` to module
scope with its body intact. Retain `[parts, selected, selection]` for selection
after text replacement and leave the layout effect, direct Backspace and input
call sites in place. The production patch SHA-256 is
`f6f6959b0fb5ab74081a7b41459a9b40eb6da036a779b480b1d29e8139540f4d`.
[Exact helper move](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datefield-selection.OEpHPN/datefield-helper-hoist.patch).

**Scoped lint and selection PASS accepted (decided-by-watchdog).** Before the move, Biome reported both the
missing `selectContents` dependency and the extra `parts` dependency on the
selection effect. After the move, the `selectContents` identity is gone and
the behavior-required `parts` trigger still has its lint warning. Removing the
single cleared identity and occurrence from §36.38 gives 51 identities and 66
excess occurrences pending canonical static validation.
[Lint RED](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datefield-selection.OEpHPN/lint-red.json) ·
[Lint after](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datefield-selection.OEpHPN/lint-after.json) ·
[Reconciled inventory](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datefield-selection.OEpHPN/outstanding-static.json).

The additive spec uses actual jsdom focus, `Selection` and `Range`. A
scratch-only transform removed `parts` from the effect. The witness failed
at controlled replacement with the original Day still active, the rendered
value already `22`, and an empty selection with offsets 0→0. The unmodified
effect selected the new text and passed before the move. Pre and post both
passed 32/32 in UTC and Europe/Bucharest, including the 31 original differential
cases. All four inventories and four-frame traces matched. The original Day
stayed active with both range boundaries on it at offsets 0→1, selecting
`15` → `22` → `DD` → `DD` through focus, controlled replacement, controlled
clear and direct empty Backspace.
[Range witness patch](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datefield-selection.OEpHPN/datefield-selection-witness.patch) ·
[Intended mutation RED](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datefield-selection.OEpHPN/mutation-UTC.vitest.log) ·
[Four-run comparison](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datefield-selection.OEpHPN/comparison.log) ·
[Matched selection trace](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datefield-selection.OEpHPN/post-UTC.selection.ndjson).

The first post-UTC preflight deferred at 39% memory free, before Vitest
started.
[Deferred preflight](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datefield-selection.OEpHPN/post-UTC.preflight-deferred.log).

The two admitted post-change GREEN legs qualified at 45% free in UTC and
42% free in Europe/Bucharest.
[UTC GREEN](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datefield-selection.OEpHPN/post-UTC.vitest.log) ·
[Bucharest GREEN](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datefield-selection.OEpHPN/post-Bucharest.vitest.log).

### 36.40 Public DatePicker year keyboard focus (2026-11-20)

**Scope approved (decided-by-watchdog).** Add a frozen-versus-public witness
using `userEvent` for ArrowRight and Enter. The RED starts with 2024 focused
on both routes. ArrowRight moves the sole tab stop to 2025 without publishing
on either route. The frozen route also focuses 2025, publishes March 15, 2025
once on Enter, and returns to its day view. The public route leaves the
actual focus on 2024. Enter consequently returns to March 2024 with zero
publications. [Guarded RED](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datepicker-year-focus.3vzg6y/red-UTC.vitest.log) ·
[Paired RED trace](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datepicker-year-focus.3vzg6y/red-UTC.year-trace.json).

**Scoped PASS accepted (decided-by-watchdog).** The year leg of the existing layout effect now resolves the
tabbable button through the existing `yearGrid` ref. The day selector and
effect triggers stay intact. Both date-picker buttons and standalone calendar
radio buttons use that native button lookup with their established roles.
The prior year role, pointer containment and publication assertions are
byte-identical. The only test addition is the keyboard witness. The exact
two-file patch SHA-256 is
`0dc314d117cee78c97947b852a0a79f07506f351b0b758a2c75dda471b6e78bc`.
[Exact patch](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datepicker-year-focus.3vzg6y/exact-two-file.patch).

Guarded UTC passed 157/157, including 42 shell, eight calendar and all 107
public contract cases. Europe/Bucharest passed 50/50 across the two
differentials with identical file, full-name and status rows. Both final
witnesses match the frozen route through focus, tab stop, publication and
return to the day view. The UTC frozen trace also matches its RED run.
[Comparison](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datepicker-year-focus.3vzg6y/comparison.log) ·
[UTC GREEN trace](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datepicker-year-focus.3vzg6y/green-UTC.year-trace.json) ·
[Bucharest GREEN trace](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datepicker-year-focus.3vzg6y/green-Bucharest.year-trace.json).

The DateCalendar lint identities and counts match the prior reconciliation,
and the shell witness has no lint diagnostics. Integrated static validation
and admission remain pending.
[Scoped lint inventory](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datepicker-year-focus.3vzg6y/lint-current.json).

### 36.41 Frozen DatePicker bound normalization helper (2026-11-20)

**Scope approved (decided-by-watchdog).** Move `ensureUnixInSeconds` from
the in-tree MUI reference to module scope with its body intact. The exact
comparison permits only moving and unindenting that block. The min and max
memo bodies and `[minDate]` and `[maxDate]` dependencies are byte-identical.
The pinned pre-edit fixture SHA-256 is
`4b7243a1189852c6ea9267484a9bc7f4bedb39f8dc00245400d6cf88aa73f879`.
The helper-move patch SHA-256 is
`880dc661cba12058c70b1decf0319b1a1ffea54f42ff33613378d23413f4b045`.
[Pinned fixture](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datepicker-bound-helper.kUCXR0/_DatePicker.mui-reference.tsx) ·
[Exact patch](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datepicker-bound-helper.kUCXR0/ensure-unix-in-seconds-hoist.patch).

**Scoped PASS accepted (decided-by-watchdog).** Biome reproduced both `ensureUnixInSeconds` missing-dependency
occurrences at the bound memos and reported zero diagnostics afterward.
All 42 original shell differential cases and one scratch comparator passed
before and after in UTC and Europe/Bucharest. The original spec hash and
the 42 file, full-name and status rows match the accepted §36.40 inventory.
The comparator captured each memo's actual normalized number, all 31
rendered day buttons and both month-navigation buttons. Pre/post traces
matched byte-for-byte in each timezone. Ten-digit seconds and 13-digit
milliseconds with a subsecond remainder both enabled March 10–20 with
month navigation disabled. Missing, zero and NaN each normalized to undefined
on both sides, enabled March 1–31, and left navigation enabled. The runtime
logs had no library diagnostics in any of the four runs.
[Lint RED](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datepicker-bound-helper.kUCXR0/lint-red.json) ·
[Lint GREEN](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datepicker-bound-helper.kUCXR0/lint-green.json) ·
[Exact guarded comparison](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datepicker-bound-helper.kUCXR0/comparison.log) ·
[UTC trace](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datepicker-bound-helper.kUCXR0/post-UTC.boundary-trace.json) ·
[Bucharest trace](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datepicker-bound-helper.kUCXR0/post-Bucharest.boundary-trace.json).

One frozen-reference identity and two excess occurrences are cleared,
leaving 50 identities and 64 excess occurrences by reconciliation.
Integrated static validation and admission remain pending.
[Updated warning inventory](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datepicker-bound-helper.kUCXR0/outstanding-static.json).

### 36.42 DateCalendar column and filler keys (2026-11-20)

**Scope approved (decided-by-watchdog).** The header represents a numbered
ARIA column. Hold `day.day()` as a key. In Pacific/Apia the guarded mounted
January 2012 calendar in Romanian rendered Monday in the first and seventh
columns after the 2011 skip date. The first-week adapter returned weekday
numbers `[1, 2, 3, 4, 6, 0, 1]`. Use the seven explicit grid columns as the
iteration input and keep their positional node identity. The proposed two
year filler keys name the first and second appended layout slots. Their
existing count formula, order and markup remain the comparison targets.
[Mounted Apia baseline](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datecalendar-keys.ZaQsr5/pre-Apia.key-traces.ndjson) ·
[Targeted lint RED](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datecalendar-keys.ZaQsr5/lint-before.json).

**Scoped PASS accepted (decided-by-watchdog).** The production patch is confined to the two iteration
inputs. The weekday renderer uses explicit columns 1–7 for its key and ARIA
index, and takes the same date from the first week. The year renderer slices
the two named trailing slots using the original filler-count formula. The
markup, day and year focus logic, effect dependencies and original specs
are byte-identical outside these iteration inputs. The exact patch SHA-256 is
`01a38609f25ed9d740ab5a3fd0bcf09e4b752b3792b7d41c0bcef5911d1c3361`.
Both `noArrayIndexKey` occurrences cleared. The existing `dayFocus, yearFocus`
dependency diagnostic remains held.
[Exact patch](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datecalendar-keys.ZaQsr5/datecalendar-keys.patch) ·
[Lint after](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datecalendar-keys.ZaQsr5/lint-after.json).

UTC passed 52/52 pre/post, including all 50 existing Calendar and Shell
differential cases and the two scratch comparators. Eight weekday frames
matched byte-for-byte with identical DOM, roles, order, tab stops and
events. The seven original nodes stayed at their numbered columns across
month and locale changes. The existing focus exit on locale rerender
matched before and after. Seven year frames also matched, including filler
counts 2→1→0→1→2 and the original 2024 and 2025 button nodes. The same 2025
button retained focus and the sole tab stop through the controlled bounds
changes, then Enter published and returned to the day grid. The isolated
Apia pre/post check passed and matched all three frames, with two Mondays
and seven stable columns. The optional Bucharest baseline deferred on
memory before Vitest started.
[Exact trace comparison](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datecalendar-keys.ZaQsr5/comparison.log) ·
[UTC trace](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datecalendar-keys.ZaQsr5/post-UTC.key-traces.ndjson) ·
[Apia trace](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datecalendar-keys.ZaQsr5/post-Apia.key-traces.ndjson) ·
[Bucharest preflight](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datecalendar-keys.ZaQsr5/pre-Bucharest.ready-6.log).

One shipped-source identity and two excess occurrences are cleared, leaving
49 identities and 62 excess occurrences by reconciliation. Integrated static
validation and admission remain pending.
[Updated warning inventory](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datecalendar-keys.ZaQsr5/outstanding-static.json).

### 36.43 MenuPopup paper ref and enter effect (2026-11-20)

**Characterization approved (decided-by-watchdog).** The pinned MenuPopup
source SHA-256 is
`1007095e80875168fd6505bc7254f973db942a3274caf69080c196b99913bd07`.
Biome reports one warning at the enter layout effect on line 94,
`lint/correctness/useExhaustiveDependencies`, for `paperNode`. ModalHost opens
before its delayed portal has a paper. The portal's ref callback updates
`paperRef.current` synchronously, then queues `paperNode` for a later parent
render. The state dependency schedules enter on attachment even when explicit
origins keep `position` stable. The proof compared the existing ref read with
a scratch-only state read, keeping the dependency and the position callback
intact. [Pinned source and inputs](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/menu-popup-paper-node.XjLilF/before.sha256) ·
[Lint identity](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/menu-popup-paper-node.XjLilF/lint-before.json) ·
[Scratch variant](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/menu-popup-paper-node.XjLilF/rejected-state-read.scratch.patch).

**State-node substitution held (decided-by-watchdog).** Both guarded arms passed 3/3 with the unchanged
MUI reopen-during-exit differential and two scratch timelines using callback
and object refs. They matched on delayed mount, opening position and Grow,
resize, focus restoration, early reopen on the original paper, and reopen
after full detachment. The first internal difference occurred on close
detachment. Live ref was null and committed state still named detached
paper 1. The closed guard prevented style writes in both arms.

The first write difference was the replacement commit while open. Both arms
positioned attached paper 3 at top 648 px, left 848 px and origin 52 px by 32 px.
The ref arm measured paper 3 at 104 px and applied Grow there. The state arm
measured detached paper 2 at 96 px and sent the first five Grow writes there,
starting with opacity 0. A subsequent commit let both arms settle on paper 3.
Both ref types showed the same difference, although settled style, consumer
ref order and focus matched. The scratch replacement used a forwarded
`paperProps.key` and emitted the same React key-spread diagnostic in both
arms. The first scratch attempt stopped because its fake timers were missing.
That setup log is separate from the admitted 3/3 results.
[Comparison](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/menu-popup-paper-node.XjLilF/comparison.log) ·
[First divergence](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/menu-popup-paper-node.XjLilF/first-divergence.json) ·
[Current ref trace](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/menu-popup-paper-node.XjLilF/ref-UTC.paper-timeline.ndjson) ·
[State-read trace](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/menu-popup-paper-node.XjLilF/state-UTC.paper-timeline.ndjson) ·
[Matched file, full-name and status rows](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/menu-popup-paper-node.XjLilF/file-fullname-status.json) ·
[Setup attempt](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/menu-popup-paper-node.XjLilF/setup-timers-ref-UTC.vitest.log).

The first Grow write is the hold criterion despite identical settled states
and passing tests. Keep the live read and `paperNode` wakeup together. The
source and persistent test hashes still match the pinned inputs. The
`paperNode` warning remains in the scoped 49 identities and 62 excess
occurrences. Integrated static validation and admission remain pending.

### 36.44 FocusTrap effect lifecycle (2026-11-20)

**Scratch characterization approved (decided-by-watchdog).** The pinned
installed MUI 9.5.0 CJS and ESM FocusTrap sources use `[open]` for restoration
and include both `disableAutoFocus` and `disableRestoreFocus` in containment.
The pinned current source reports two `useExhaustiveDependencies` identities,
missing `disableRestoreFocus` at line 152 and extra `disableAutoFocus,
disableRestoreFocus` at line 175. Both variants change only their respective
dependency array in the Vite scratch transform.
[Pinned source and spec hashes](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/focustrap-lifecycle.WmPIff/before.sha256) ·
[Exact lint identities](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/focustrap-lifecycle.WmPIff/lint-before.json) ·
[Restore variant](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/focustrap-lifecycle.WmPIff/restore.scratch.patch) ·
[Containment variant](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/focustrap-lifecycle.WmPIff/prune.scratch.patch).

**Baseline parity.** Current FocusTrap and installed MUI matched all seven
observed lifecycles and 219 events per side. The guarded baseline passed 13/13,
including all six unchanged parity cases. The seven scratch scenarios cover
close and unmount, StrictMode open mount, both restore-flag directions,
auto-focus and enforcement changes while open, and all three flags changing
on the open-close boundary. StrictMode focused the root, restored the opener,
cleared the first interval and removed both listeners, then focused the root
and registered the second generation. The fixture pinned document focus
availability and recorded real jsdom active elements, listener identities
and clock ticks.
[Baseline raw trace](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/focustrap-lifecycle.WmPIff/current-UTC.lifecycle.ndjson) ·
[Baseline test inventory](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/focustrap-lifecycle.WmPIff/current.file-fullname-status.json).

**Both dependency changes held (decided-by-watchdog).** Adding the restore flag produced 11/13
passing cases. At 20 ms, changing `disableRestoreFocus` from false to true
while open restores the opener before containment releases, then setup
focuses the root. The reference instead starts by clearing containment while
the first child remains active. At close the reference restores the opener
using the opening flag, whereas the candidate leaves focus on the root.
The reverse flag change first diverges at close, where the candidate restores
the opener and the reference keeps the first child focused.
[Restore-arm trace](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/focustrap-lifecycle.WmPIff/restore-UTC.lifecycle.ndjson) ·
[Restore test inventory](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/focustrap-lifecycle.WmPIff/restore.file-fullname-status.json).

Removing the two containment dependencies produced 10/13 passing cases.
The first divergence on a change to either flag at 20 ms is skipped cleanup.
The reference clears interval 1 and removes focusin listener 1 and capture
keydown listener 2, then installs listeners 3 and 4 and interval 2. The
candidate retains the original generation. In the auto-focus case, after
focus re-enters and is blurred to the body, that original interval pulls
focus to the root at 50 ms. The reference stays on the body until its restarted
interval runs at 70 ms. All six original cases still pass in both variants,
and all unmounts release the tracked resources. The lifecycles still differ.
[Containment-arm trace](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/focustrap-lifecycle.WmPIff/prune-UTC.lifecycle.ndjson) ·
[Containment test inventory](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/focustrap-lifecycle.WmPIff/prune.file-fullname-status.json) ·
[First divergences](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/focustrap-lifecycle.WmPIff/first-divergences.json) ·
[Verified comparison](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/focustrap-lifecycle.WmPIff/comparison.log).

The local source, persistent parity spec and installed reference still
match their pinned hashes. Both warning identities remain in the scoped
49 identities and 62 excess occurrences pending integrated static validation.

### 36.45 Frozen Accordion expansion effect (2026-11-20)

**Scratch review approved (decided-by-watchdog).** The in-tree frozen
fixture SHA-256 is
`2b699c4d5c3b0e0d9fbe4ab64b696e9bf235802962895043defde7a25aa5d3be`.
Biome reproduced the missing `isExpanded` dependency warning at line 32.
The separate fragment diagnostic is informational and outside this review.
The one scratch variant moves the same comparison and `expanded ?? false`
fallback inside a pure functional state updater. The `[expanded]` trigger
and other source bytes are fixed. The scratch patch SHA-256 is
`221257a1ceca22f2dd3b1ff65d068a6bc78264f008cf3ef43f23f901d9aea5a2`.
[Pinned inputs](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/accordion-frozen-expansion.YmCvzv/before.sha256) ·
[Exact lint identity](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/accordion-frozen-expansion.YmCvzv/lint-before.json) ·
[Scratch patch](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/accordion-frozen-expansion.YmCvzv/functional-updater.scratch.patch).

**Functional updater held (decided-by-watchdog).** Both guarded arms passed 25/25 with identical
file, full-name and status rows. They include the 12 existing frozen-vs-own
parity tests, three cleanup cases and ten scratch recordings. Nine complete
commit, DOM and timer timelines matched, including omitted, true and false
initial values, ordinary batched prop-and-click delivery, same-value
rerenders, local toggles, control removal and reacquisition, parent echo and
unmount mid-transition. Callback order and unmount/drain checkpoints match
in all ten scenarios.
[Exact runtime comparison](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/accordion-frozen-expansion.YmCvzv/comparison.log) ·
[Matched test inventory](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/accordion-frozen-expansion.YmCvzv/file-fullname-status.json).

The first differing rendered frame is the nested commit after the layout
click. Local expansion is already true while the prop is false. The parent
commits prop true and its layout effect clicks the summary before the
frozen passive effect runs. Both callbacks publish false. The original
effect sees its rendered true equal to the new prop and skips the setter,
letting the queued local false close the accordion and start Collapse
with one timer. The candidate queues the updater anyway. It runs after the
local false, writes true, and leaves `aria-expanded` true with zero collapse
timers. The difference survives the settled checkpoint. The fixture and specs
still match the pinned hashes, and the warning stays in the scoped
49 identities and 62 excess occurrences.
[First rendered divergence](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/accordion-frozen-expansion.YmCvzv/first-divergence.json) ·
[Original trace](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/accordion-frozen-expansion.YmCvzv/original-UTC.expansion.ndjson) ·
[Functional trace](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/accordion-frozen-expansion.YmCvzv/functional-UTC.expansion.ndjson).

### 36.46 Admitted c000 replay and release blockers (2026-11-20)

**Scheduling supersession (decided-by-watchdog after user intervention).**
§36.32's static-first ordering is lifted for diagnostic browser work on the
already admitted immutable c000 candidate. Static remains RED and mandatory
for final acceptance under the same gate, baseline, lint scope, coverage and
tests. V1 has the clear shared slot for the frozen c000 replay only, against
`.472` and rc-webapp `73673465091`. The archive checksum was reverified at
handoff. Verification ports were clear with no scoped runner active, load
2.95 and 43% memory free. The send returned `delivery: started` with receipt
`message:mcp:1211c210-3939-4263-bf58-b3260f020e1c:thread-send:vanguard-a-20261120-c000-admitted-replay-direct-slot` and run ordinal 142.
[VNG_REB Vanguard Architecture and Visual Consistency](t3-thread://v2/e35503e3-cf61-4359-9313-451d57cd87cb/80fcbccb-4649-4a3a-88e7-93c70c8198d6) ·
[Admitted archive](/Users/a.kott/vanguard-verify/packs/e90441d30d074f2938187561cab71f061dcd226d-h24-mobile-focus.tgz).

V1 uses the existing sealed inputs, capsule, guard and fingerprint checks,
ports and cleanup controls. The six high-signal routes can go first only
within the frozen scope and without a duplicate capture or provenance change.
Otherwise the sealed full replay runs as-is. Keep the five open discovery
keys, original raw flags and four prior qualified pairs. V1 returns the clean
slot directly to A with the verdict and first confirmed runtime regression,
if any. This slot ends at c000. c001, the final paired unit suite, coverage,
Tier P, the package gate, all wider or measured work and the warning-by-warning
trials remain held. The new source delta is outside the admitted archive.
[Frozen replay note](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/tmp/research/vanguard-ui-sdk-visual-baseline/tierc-c000-replay.md) ·
[Preserved local source fingerprint](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/c000-handoff.wJwVLo/local-source-fingerprint.json).

**Offline release assessment accepted (decided-by-watchdog).** The watchdog
independently reproduced 34 warning identities and 44 excess occurrences in
historical references, plus 15 identities and 18 excess occurrences in
shipped source. The resulting 49/62 reconciliation is scoped evidence. The
guarded H24 c000 pair remains the diagnostic priority, and the final canonical
check remains open. The final static obligation is the existing app/lib TS7
baseline comparison, zero contract and all-spec TypeScript errors, zero Biome
errors, and no warning identity above its baseline multiplicity. The six
known lint errors and the spec typing corrections have local evidence. The
integrated source gate on the final candidate remains due. After static
acceptance, retain the existing 35-file combined coverage gate at 95% lines
and 85% branches per file, plus the separately scoped final consumer evidence.
[Reconciled warnings](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datecalendar-keys.ZaQsr5/outstanding-static.json) ·
[Canonical static gate](./mui-upgrade-gates/gates.sh) ·
[Coverage gate](./mui-upgrade-gates/coverage.sh).

| Remaining group | Release disposition |
|---|---|
| Shipped, proven trigger holds (5 identities / 5 excess) | DateCalendar and DateField selection/focus, MenuPopup portal attachment, and both FocusTrap effects retain their evidenced behavior. Clearing these warnings requires equivalent source behavior under the existing gate. |
| Shipped, B review-only (10 / 13) | Form index typing, the local Table sorter rename and InlineSvg's local string annotation are mechanical candidates already documented. Pagination, Breadcrumbs and Slider keys need identity/focus evidence. InlineSvg mount effects need lifecycle proof. All remain held. |
| Frozen references (34 / 44) | Preserve the Accordion batched-toggle behavior and the remaining pinned comparisons for form binding, overlays, date ranges, document loading and leaf components. Prototype/coercion, key, hook-order and callback changes need their supported input and effect contracts preserved. B-owned ListShowMore and Slider references stay review-only. |

**Historical comparator bridge held (decided-by-watchdog).** Moving historical
executable inputs outside `biome lint src` would change release-gate coverage.
That requires an explicit user decision before implementation. The current
source, gate, baseline, lint scope and slot constraints remain in force.
Bridge design and implementation work and duplicate gate runs stay paused
while c000 owns the slot.

Any future bridge review must check the exact archive member paths and
SHA-256 bytes for all eight legacy ESM declarations resolved under the
existing `./dist/*` export. Account for each path against the pinned §36.35
inventory and the separately approved declaration projection. Verify the
WordPress graph independently, including both frozen-reference suffixes.
Require unchanged story and spec discovery, transform and module resolution,
compiler coverage, and mounted reference traces. Supported shipped deep paths
and their declaration bytes remain protected. The shipped warning gate stays
in force regardless of the bridge decision.
[Pinned fixture provenance and exact importers](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixture-warnings.UFiWXp/frozen-reference-provenance.json) ·
[Eight-member declaration inventory](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/declaration-boundary.4IQ4jo/milestone-declaration-baseline.json).

#### 36.47 Tier C c000 source response cards

**Payment Lock Banner.** The provisional records show 8 → 25 sampled nodes in
Retryable and SubAccount, starting at the consumer's
`PaymentLockBanner-module__banner` wrapper. Both candidate records show the
declined title. SubAccount's committed play expects the owner-contact title
and rejects the declined one. NotLocked is 8 → 8 with no banner on either side.
The sealed collector can settle on the outer story shell. Its generic waits
do not assert the account variant, successful play or visibility of the
intended subtree, and its style walk skips `display:none` nodes. These
captures establish a question about state at capture, with the cause open.
[Provisional raw comparison](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/tmp/research/vanguard-ui-sdk-visual-baseline/out/tierc-c000-20261120T140506-candidate-manifest/diff-vs-tierc-c000-20261120T135013-baseline-Story.md) ·
[Sealed collector](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/tmp/research/vanguard-ui-sdk-visual-baseline/tierc-c000-replay-prep/capture.cjs:141).

- **State and package boundary.** At consumer `73673465091`, the story
  synchronously dispatches the account thunk's fulfilled action with request
  ID `story` into the decorator's `mainStore` and restores its snapshot at
  teardown. The reducer stores `payload.account` verbatim and marks it fresh.
  Retryable supplies `canRetry=true, isSubAccount=false, isLockedDueToSca=false`;
  NotLocked supplies `lockInfo=null`; SubAccount supplies `canRetry=false,
  isSubAccount=true, isLockedDueToSca=false`. The local selector and string
  variant helper decide the branch before the app-owned wrapper. The retry
  hook starts with `hasPaid=false, isRetrying=false, isRetryOfferedAgain=true`.
  The banner's mount invalidation accepts a valid seed younger than 5 s.
  `SettingsRoot` can separately invalidate on account-ID mismatch and refresh
  via the fixture's same-seed GET. The Storybook alias resolves `vanguard`
  to `@rankingcoach/vanguard`. Both exact package roots resolve to
  `dist/index.js` and export `InfoBox`, `Render`, `Button`/`ButtonTypes`,
  `Text`/`TextTypes` and the action-only `snackbarService` from their
  correspondingly named `dist/index-*.js` modules (`index-SnackBarService.js`
  for the service). `Render` and the service are byte-identical. Both packs
  have `primary="primary"`, `text="text"` and `textHelp="text-help"`.
  `InfoBox`, `Button` and `Text` differ in bytes and can affect rendered
  descendants. Only consumer state selects the wrapper and title prop.
  [Committed story seeds](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/account/PaymentLockBanner/_PaymentLockBanner.stories.tsx:41) ·
  [Account reducer](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/redux-stores/settings/account-settings.store.ts:109) ·
  [Banner branch](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/account/PaymentLockBanner/PaymentLockBanner.tsx:42) ·
  [Vite alias](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/vite.config.ts:176).
- **First discriminator and smallest proposed red.** If a qualified comparison
  confirms a difference, observe the lock tuple on the seed dispatch and
  the same Provider's first banner render, then at the first committed
  wrapper and after any mocked account completion. Include action request
  ID, derived variant, wrapper presence/visibility and the title passed to
  `InfoBox`. The passive red uses the single failing committed seed with
  equal state and equivalent readiness. Retryable must expose one declined
  banner and an enabled retry button. SubAccount must expose one owner-contact
  banner with no declined title or retry. NotLocked must have no banner.
  If state or commit readiness differs, isolate that first discrepancy in
  the harness before proposing a package edit. If the wrapper and title
  prop agree and the descendant fails, narrow to that exact public export:
  for example `InfoBox type="danger" position="start" width="100%"` with
  the SubAccount title and `description={null}`. Prove reference green
  and candidate red on the same semantic assertion first. This witness uses
  synthetic data and no payment action.

**Partner passive render.** The two flagged login stories mount
`PartnerApiTesterLoginForm` directly with `isLoading=true,errorMessage=null`
or `isLoading=false,errorMessage=<fixture rejection>`. The third flag,
`LoggedInWithAdminToken`, renders `PartnerApiTesterSessionCard` directly
with `useAdminTokenForRequests=true`. These stories bypass the production
Redux login branch. Compare resolved args, first connected app-owned root
(`partner-api-tester-login` or `partner-api-tester-session`) and its
visibility, then heading, loading/disabled native fields, rejection text or
admin-mode notice as applicable. Record a render error if the root never
commits. Login uses the barrel's `Input`, `Button`, `Text`, `Alert` and
the button/text enums. The session card also uses `CheckBox`.
`index-Input.js` matches byte-for-byte while its `index-InputBase.js`
dependency still needs inspection if the field diverges. Provisional
captures retain only a zero-size sampled root on the candidate. The
qualified passive `LoginForm` control covers only its default args. If a
flag repeats with matching args and a committed root, assert the first
missing or mis-stated child in the single failing fixture, then isolate its
barrel export if needed. Keep it passive throughout.
[Committed Partner stories](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/admin/PartnerApiTester/_PartnerApiTester.stories.tsx:17) ·
[Login root](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/admin/PartnerApiTester/PartnerApiTesterLoginForm.tsx:44) ·
[Session root](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/admin/PartnerApiTester/PartnerApiTesterSessionCard.tsx:48) ·
[Qualified discovery scope](/Users/a.kott/vanguard-verify/v1/logs/tierc-c000-20261120T141729/verdict.md).

**Billing exports geometry.** The eight provisional history-table flags
share one measured shift. The Created cell grows from 184.375 or 184.797 px
to 185.547 px with its left edge unchanged. The 200 px Actions column keeps
its width and starts 0.8–1.2 px farther right. The saved walk reaches the
cells but records no body leaf text, so it cannot establish equal timestamp
strings or intrinsic text widths. The separate FirstLoad flag contains
skeletons and no table. The two Start stories also show a 246 → 249.4 px
change on identical visible Last start timestamp text. That panel is an
app-owned flex/grid layout with plain Vanguard `Text` and no `RelativeTime`
or table. The selected-IDs form margin is a separate flag.
[Provisional raw comparison](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/tmp/research/vanguard-ui-sdk-visual-baseline/out/tierc-c000-20261120T140506-candidate-manifest/diff-vs-tierc-c000-20261120T135013-baseline-Story.md:377) ·
[Start results header](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/admin/BillingExports/StartResultsPanel/StartResultsPanel.tsx:56).

- **Inputs and shipped path.** At `73673465091`, the committed stories
  build synthetic job ISO timestamps from `Date.now()` before rendering a
  fresh BillingExports store. The list handler returns them unchanged.
  The Start fixtures also generate timestamps during their mocked response;
  the page stamps Last start and uses a 30 s heartbeat for stalled status.
  Created renders the app's browser-locale `formatCreatedAt` through
  `Text translate={false}`, followed by `RelativeTime` for valid dates in a
  nowrap column. The clock-based relative formatter is memoized by ISO.
  The app owns the scroll box and native auto-layout `table` at 100% width,
  passes 150/190 px column minima for Created/Actions through its context,
  and gives Cancel/Download a fixed slot before Delete. The `vanguard`
  alias resolves through both packs' `dist/index.js` to
  `index-TableHeader.js` and `index-TableBody.js`, then
  `index-TableBodyRenderer.js` and `index-TableCell.js`. Both packs forward
  the same column styles. Their table CSS module mappings and matching
  emitted rules are byte-identical. H24 adds table slot attributes with
  no matching table slot selectors in the packed CSS. `index-RelativeTime.js`,
  its clock hook and date/affix helpers are byte-identical. The
  `index-Text.js` dependency differs, so text rendering and effective
  font/cascade remain candidates alongside input timing.
  [Synthetic timestamps and handlers](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/admin/BillingExports/_BillingExports.stories.tsx:41) ·
  [Date formatter](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/admin/BillingExports/BillingExports.helpers.ts:140) ·
  [History columns and cells](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/admin/BillingExports/ExportHistoryTable/ExportHistoryTable.tsx:111) ·
  [Actions slot](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/admin/BillingExports/ExportRowActions/ExportRowActions.module.scss:10).
- **First discriminator and proposed red.** If qualified evidence
  preserves this delta, use the single passive Populated fixture at the
  recorded desktop viewport, same clock from before seed construction,
  locale/time zone, completed list and fonts, and same scroll position.
  Pair visible ISO/row/status and both exact Created strings by job ID.
  Measure the widest Created text run with a DOM Range, including its
  effective font metrics and matched rules. Then compare the native
  header/body widths and Actions offset relative to the table with the
  same container width, padding and border. A repeated difference at the
  text run with equal strings calls for a red at the exact `Text` or
  `RelativeTime` composition. If text runs and box inputs agree but column
  layout diverges, reduce to the width-determining rows and original
  provider/header/body inside the same native-table constraints. Require
  `.472` green and H24 red on the first failing measurement, retaining
  row content and shape. Unequal seeds/readiness need attribution first.
  The Start header, form margin and FirstLoad skeleton each require their
  own witness if confirmed. No submit is needed for the table check.

**Billing disposition (decided-by-watchdog).** Approved for conditional
diagnosis. Freeze the clock before the fixture constructs its seeds and
verify the actual font faces are loaded. Compare intrinsic text widths and
effective styles before column widths. Keep the Start header, FirstLoad
skeleton and form margin separate. The provisional deltas do not warrant a
table change.

**TaskTray pager geometry.** The provisional PhonePager flag is the third
card in the Scheduled stack at its initial scroll position. Its native
button is 257.4 px wide at the same origin in both builds and 92 → 72 px
high. TabletPager uses the same Scheduled data in a wider frame, and the
matching button is 307.8 px wide and 72 → 70 px high. The pager, Scheduled
section and stack layer boxes match in both comparisons, with the same 179
sampled nodes per side. Both flags are geometry-only. The native button is
under a covered, inert stack layer (`data-depth=2`); the saved walk has no
title or caption descendants for this button. A measured height under the
cover does not establish changed visible wrapping.
[Provisional flags](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/tmp/research/vanguard-ui-sdk-visual-baseline/out/tierc-c000-20261120T140506-candidate-manifest/diff-vs-tierc-c000-20261120T135013-baseline-Story.md:574) ·
[Stack layer markup](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/ado/AdoDashboard/tasks/TaskCard/TaskStack.tsx:82) ·
[Stack cover CSS](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/ado/AdoDashboard/tasks/TaskCard/TaskStack.module.scss:97).

- **Fixture and shipped path.** The committed stories at `73673465091`
  set 390/820 px frame widths inside the same 1280×900 browser canvas. The
  tray starts at three columns, then a local `ResizeObserver` reads its
  content width and the story waits for `data-per-view=1/2` and paging.
  CSS sets the page width from that state. The fine-pointer rule controls
  the cursor, and reduced-motion controls animation. The paged tray shows
  the all-buckets Scheduled stack, whose order is derived from synthetic
  `nextRunAt` values. Given the saved Today=2/Tomorrow=1 counts, the
  flagged third row maps to `ado-scheduled-row-3`, “Refresh business
  hours”, with the locally formatted Tomorrow/time caption. Confirm the row
  ID and text directly in any qualified evidence. `TaskCard` owns the native
  button, two-column grid, wrapping title and trailing caption. Its
  action-placement observer does not apply to this trailing-caption row.
  The `vanguard` alias resolves through both packs' `dist/index.js` to
  `Text`/`TextTypes`, `Icon`/`IconNames`, `Render` and `classNames` in
  their matching `dist/index-*.js` modules. `Render` and `IconNames`
  match byte-for-byte. `Text`, `Icon` and `classNames` differ in emitted
  bytes. There is no Vanguard Button or viewport hook on this path.
  [Pager stories](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/ado/AdoDashboard/tasks/TaskTray/_TaskTray.stories.tsx:203) ·
  [Local row measurement](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/ado/AdoDashboard/tasks/TaskTray/TaskTray.tsx:169) ·
  [Scheduled sorting](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/ado/AdoDashboard/tasks/ScheduledSection/ScheduledSection.tsx:65) ·
  [Row text and indicator](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/ado/AdoDashboard/tasks/ScheduledRow/ScheduledRow.tsx:46).
- **First discriminator and disposition.** Hold any red witness until the
  qualified replay repeats the difference. First pair the settled pager
  state, row identity, stack depth/cover and exact title/caption under
  the same clock, locale, loaded fonts and frame metrics. If the first
  difference is still within the card, compare the head's title-line
  rectangles, trailing-caption box and actual icon width against the
  820 px control. Establish visibility or an effect on visible layout
  before treating a covered-card height as a shipping regression.

**TaskTray disposition (decided-by-watchdog).** Approved for conditional
diagnosis. The covered-card height matters only if the difference persists
on the same row under qualified inputs and changes visible geometry or
interaction.

**Skeleton horizontal offsets.** Widget Comparison Loading is the strongest
saved provisional pair. Both sides show the same three overflow-hidden
shells (448×32 and two 1120×320), radii, gradient colors and empty loading
contents. Each large shell starts at x80. Its 2240 px gradient child moves
from x−1770.8 to x589.9 with the same box and y coordinate. The corresponding
inferred `transform` translations are −1850.8 and +509.9 px, or −82.6% and
+22.8% of the child width. The small child independently gives the same
percentages. This is roughly 13% versus 94% of the configured horizontal
travel, measured in space. The saved sampler omits computed `transform`
and frame time, so exact sampled clock phase is unavailable. The exact
`.472` and H24 packed `Skeleton`, spring core/web/shared modules and the
matching emitted Skeleton CSS are byte-identical. The 1500 ms JavaScript
spring loop writes inline `transform: translate(-100%,0)` through
`translate(30%,0)`; the sealed CSS animation override and screenshot
option do not synchronize those JS writes. The control is TaskTraySkeleton
Phone, an app-CSS loading shell with matching sampled geometry and
byte-identical PNGs. Its only saved DOM difference is one class string.
[Widget Comparison loading fixture](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html/react/src/components/admin/agent/WidgetComparison/_WidgetComparisonView.stories.tsx:37) ·
[Animated Skeleton](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/src/core/Skeleton/Skeleton.tsx:43) ·
[Sealed sampling and CSS override](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/tmp/research/vanguard-ui-sdk-visual-baseline/tierc-c000-replay-prep/capture.cjs:141) ·
[Saved offset comparison](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/tmp/research/vanguard-ui-sdk-visual-baseline/out/tierc-c000-20261120T140506-candidate-manifest/diff-vs-tierc-c000-20261120T135013-baseline-Story.md:30).

If the qualified result still needs attribution, use one guarded pair of
the same Loading story. Retain a normal frame with computed matrix and a
timestamp relative to the first spring write. For the supplemental frame,
hold the gradient child at the same measured transform in both pages
(for example −35%, halfway through travel), verify the matrix immediately
before and after the shot, and compare the clipped pixels. Record shell
rects, paint tokens, loading marker and visible content separately. Equal
phase-pinned paint would explain a phase-only flag. Any residual would
identify the first box or paint property that needs investigation. The
held frame measures paint at equal position, with live timing evidence
kept separately. No supplemental run authorized by this card.

**Skeleton disposition (decided-by-watchdog).** Approved only as a conditional
supplemental diagnostic. Keep the normal frame and isolate an equal-transform
frame if attribution still requires it. No runtime admitted for this step.

#### 36.48 c000 qualified replay and Payment handoff

**INCOMPLETE, accepted as provenance-qualified (decided-by-watchdog).** V1
returned the clear slot after the single sealed replay on consumer
`73673465091`, .472 and H24 focus tree
`e90441d30d074f2938187561cab71f061dcd226d` / archive SHA-256
`c11fd6cac5546602b3703d13ec4715d264722f99e30ab15df59b58c7cd7fcd6f`.
Both indexes and all four served fingerprint boundaries qualified. Nine
deliberate-denial self-tests passed and seven request audits had zero
escape attempts. No shipping regression was confirmed.
[V1 verdict and guard evidence](/Users/a.kott/vanguard-verify/v1/logs/tierc-c000-20261120T155742/replay-verdict.md).

| Evidence | Complete | Raw outcomes |
|---|---:|---|
| Candidate manifest vs saved qualified .472 | 141/141 | 115 pass, 25 flags, 1 unstable |
| New paired discovery | 4/5 | 3 pass, 1 flag, 1 missing |
| Prior qualified discovery retained | 4/4 | 4 pass |
| Total | 149/150 | 122 pass, 26 flags, 1 unstable, 1 missing |

All three historical PartnerApiTester flags cleared. The covered TaskTray
phone card repeats 92 → 72 px with no pixel flag. Account Logs Loading
remains a separate 2.947% pixel-only flag confined to skeleton shimmer
shades, with the same 53 sampled nodes and intended pending state. Exact
phase remains unverified. Saved Call Asset Waiting for Backend still has
no root PNG on either side. The `0×0` scaffold and absence of an asset
request support intentional null, with separate semantic coverage pending
evidence about the Storybook error panel outside the sampled root. Keep
the original captures, guard audits and both kinds of accounting.
[Manifest accounting](/Users/a.kott/vanguard-verify/v1/logs/tierc-c000-20261120T155742/manifest-accounting.json) ·
[Discovery accounting](/Users/a.kott/vanguard-verify/v1/logs/tierc-c000-20261120T155742/discovery-accounting.json).

**Next slot released directly A → V1 (decided-by-watchdog).** Delivery
`started`, verifier run 143, receipt
`fc6b47a6-a01c-4374-a21d-47afab9404a2`. The fresh, guarded passive
diagnostic covers only Retryable, SubAccount and NotLocked on the two
exact builds, in committed shadows, Direct Channel light at 1280×900.
Use independent clean iframe state, normal Rule 13 preflight, same-listener
opening/closing fingerprints, deliberate denial and new labeled outputs.
Their existing plays assert only. Compare first and settled wrapper,
title and retry semantics, Storybook errors and any observable seed,
provider or request readiness without mutation. Expected settled outcomes
are declined plus enabled retry, owner-contact with no declined/retry,
and no banner, respectively. No clicks or payment actions.

The saved normal .472 Retryable and SubAccount both have eight sampled
nodes and no banner. The new H24 manifest has 25 nodes and the declined
title in both stories, including SubAccount, whose committed expectation
is owner-contact. This is a capture of a different semantic state. A
fresh pair with unmatched inputs or insufficient readiness remains a
harness gap. Matching inputs and a verified first semantic divergence
would become the scope for A's source TDD proposal. Retain the saved
normal failures and all original files.

After the three priority cases, V1 may take a passive Saved Call Asset
null pair only with the same guarded listeners and without restarting or
widening. Check live index identity, visible Storybook errors inside and
outside the root, `0×0` scaffold, visible descendants and the asset request
audit. Keep raw missing-PNG accounting regardless of the semantic result.
V1 returns the slot and verdict directly. A remains on offline attribution
and integration. c000 rerun, c001, wide or measured work, package and full
units remain held.
[Replay Payment captures](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/tmp/research/vanguard-ui-sdk-visual-baseline/tierc-c000-replay-prep/out/tierc-c000-20261120T155742-candidate-manifest/styles) ·
[V1 diagnostic thread](t3-thread://v2/e35503e3-cf61-4359-9313-451d57cd87cb/80fcbccb-4649-4a3a-88e7-93c70c8198d6).

#### 36.49 Final-candidate verification delta (decided-by-watchdog)

**Pinned comparison.** The 4,642-entry before/after manifest for admitted
H24 focus tree `e90441d30d074f2938187561cab71f061dcd226d` matches byte
for byte, SHA-256
`56be9d764cd0f32c8c3e7861ddcd99855ddf7903c18ee5530b4902406fe700fd`.
Against the preserved integration checkout at base
`55dc6113c814fd3f198af5a2743ff76b92174612`, excluding this plan, 4,611
paths match by blob, SHA-256 and mode. Thirty paths changed bytes, with
no added or removed paths or mode changes. The saved tracked diff
`281124958ee06ba931f44fd044ac68ce6a0d38e195774b5c6a77e4ff0455d0c2`
and 11/11 untracked file hashes match. Git status is relative to HEAD.
The public entries, package export map, dependencies, lockfile, styles
and derived MIT notice source already shipped in admitted H24. All match.
The 30 paths comprise four runtime files, two declaration configs and
24 fixture files including the parked TextField characterization. That
characterization stays outside the release snapshot under §36.30.
[Admitted source manifest](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/file-manifest-before-gate.json) ·
[Preserved integration fingerprint](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/c000-handoff.wJwVLo/local-source-fingerprint.json).

| Delta | Accepted fingerprint and source evidence | Exact-artifact evidence still due and cheapest existing check |
|---|---|---|
| Shared `lazy-fallback.tsx` and its spec | §36.32 two-file SHA-256 `1b9422d05fd9f6041c1c32e866a111c007c7ae9d52f9b06eb9b0fa75b51f7594`, 38/38 guarded pre/post, 22/22 fallback audit, nine identical literal call sites and identical WP rewrite. [Spec result](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/lazy-fallback.jfRP5D/spec-after.log) · [Rewrite inputs](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/lazy-fallback.jfRP5D/rewrite-after.json) | H24's packed results are controls. The default graph reaches the helper and split fallback chunks (including Autocomplete and FormControl); confirm those dynamic edges and intended prunings on the new graph. The existing no-preload source project and audit cover cold suspension, warm/preloaded sync and route identity. The default installed smoke covers immediate audited consumer shapes. WP reaches the helper and the inline MUI Autocomplete implementation in its entry; rerun installed WP same-turn `sx` opt-out and filled Input/Select/Textarea controls plus the graph walk. Source inline tests cannot substitute for the packed rewrite. Keep MuiTextField eager and retain the supported FormControl route. |
| Picker runtime `DateField.tsx`, `DateCalendar.tsx` and additive field/shell witnesses | §36.39 helper/witness SHA-256 `f6f6959b0fb5ab74081a7b41459a9b40eb6da036a779b480b1d29e8139540f4d` / `7baca703f1ae3b846975e5d8cbe8782eee0bd1d1a038c696b0c2745adca10b63`; §36.40 year-focus `0dc314d117cee78c97947b852a0a79f07506f351b0b758a2c75dda471b6e78bc`; §36.42 keys `01a38609f25ed9d740ab5a3fd0bcf09e4b752b3792b7d41c0bcef5911d1c3361`. [Selection trace](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datefield-selection.OEpHPN/comparison.log) · [Year focus comparison](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datepicker-year-focus.3vzg6y/comparison.log) · [Calendar keys comparison](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datecalendar-keys.ZaQsr5/comparison.log) | The H24 ESM picker mount, controlled restore and paired browser results qualify that artifact. Use existing default installed DatePicker contract/smoke, no-installed-MUI-X first render and the final eligible consumer shard for the new one. Both picker modules are reachable in H24 ESM. Retain the WP negative export/type assertion and graph exclusion; there is no WP picker runtime case to repeat. |
| Shared `ClickAway.tsx` and ref witness | §36.37 two-file SHA-256 `fe8a96924a60e8ee1905db20a58e2ee3db69bd890936c25914f4903b5a187df3`, 26/26 matched guarded cases with attach/cleanup ordering. [Patch and comparison](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/click-away-ref.S98HuM) | The H24 linked ESM graph directly uses this helper from DatePickerShell, DropdownMenu and Snackbar's internal module. The matching package/source regression evidence is the existing ClickAway parity/ref/cleanup cases in the no-preload suite plus final consumer overlay checks. H24's linked WP graph does not contain this helper. Verify that boundary in the new graph alongside ordinary WP smoke. |
| Declaration configs and projection spec | §36.35 three-file SHA-256 `d34d0327c410d2d2da00d7c00bdacb769c0c8892bc90bf621d2ec0aeeb5b2d0f`, 2 intended red and 12/12 green. [Projection delta](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/declaration-boundary.4IQ4jo/projection-delta.json) · [Exact old archive members and hashes](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/declaration-boundary.4IQ4jo/milestone-declaration-baseline.json) | The old archive includes the eight test-only `.reference.d.ts` files under `./dist/*`. The source projection does not qualify the new tar. Audit the same eight exact paths against the old bytes, remove exactly those ESM declaration members and compare unrelated declaration bytes. Scan both new graphs and archives for both frozen suffixes and MUI X, including lazy chunks, actual parsed specifiers and triple-slash paths/types. Preserve D12 keys and resolve ordinary targets in installed `_package-exports` and the real consumer deep-path fixture. Check WP declaration roots/graph separately. Retain H23-positive MUI X control and verify the unchanged MIT notice in each new bundle. |
| Remaining verification fixtures | §36.33 typing corrections and three hoists, exact hoist-batch SHA-256 `b3b69b6b1568d5927c7382ebd1108c89806fe155b86efc8852619368ff321cb9`; §36.34 four accepted file hashes (shell spec later stacked with §36.40); §36.36 Toolbar/SnackbarRoot `9b58e5279035279963254cd81f79232e166034d916e766d764fadd6e197f3e0b` plus Snackbar's separate type-domain witness; §36.38 Breadcrumbs/TextHighlighted `6dd77930e90ad59f68848c4615dd31efe5e8963c56aff1b8c720cc9f8d466173`; §36.41 frozen DatePicker `880dc661cba12058c70b1decf0319b1a1ffea54f42ff33613378d23413f4b045`. [Canonical typing evidence](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixtures.luwzq4) · [Four-fixture case inventory](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/fixture-warnings.UFiWXp/matched-case-inventory.json) · [Mounted and type fixtures](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/frozen-references.NFRaHp) · [Fixture patch](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/remaining-fixtures.nvEVLJ/remaining-fixtures.patch) · [Picker comparator patch](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/datepicker-bound-helper.kUCXR0/ensure-unix-in-seconds-hoist.patch) | Old runtime bytes serve as controls while the new exclusion audit proves these paths remain outside both packed graphs. Integrated all-spec TypeScript, no-preload source specs and installed scripts are still due. The narrow typing and mounted evidence covers its saved cases and preserves assertions. The callback-native characterization stays local, with file SHA-256 `02dea1562e620211e463192e139140043d9bc06fbeeca7cbbc0cf90ed4b9e11d` and §36.10 scope. |

The typing/setup group covers the DateRangeInput, SearchableSelect caret,
class junk, TextField prop-routing and reachability, dual-boundary Popper
and both media-query specs. The other generic fixture edits cover error
logging, junk class sites, theme defaults, both Breadcrumbs specs and
TextHighlighted. The three frozen sources and the Snackbar type witness
remain test-only. [H24 ESM module graph](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/module-graph.dist.json) ·
[H24 WP module graph](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/module-graph.dist-wordpress.json) ·
[H24 package evidence](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/canonical-package.log).

| Order and owner | Pending evidence before handoff |
|---|---|
| 1. V1 → A | Receive and classify the authorized Payment diagnostic and optional null witness. Preserve c000 accounting and resolve any actual run blocker or scoped source witness first. Runtime slot remains with V1 until direct handback. |
| 2. A, reviewed exact source | Freeze the source input with plan and parked characterization excluded. Canonical static is still RED per §36.46, with 49 identities/62 excess occurrences as scoped reconciliation only. Require app/lib TS7 baseline comparison, zero contract/all-spec TypeScript errors, zero Biome errors and no warning above baseline multiplicity. Preserve the gate, scope and historical holds. On static PASS run existing guarded 35-file coverage at 95% lines/85% branches per file. |
| 3. A, one authorized offline package milestone | Run the canonical guarded no-global-preload spec, package and installed scripts gate on that same source. Check both installed default and WP consumer profiles, dependency graph, 22/22 fallback audit, eager-MUI accounting, D12, notices and both emitted graph/member boundaries above. Archive the exact manifest, tar SHA and results. This provides the exact artifact for final-candidate designation. |
| 4. A → verifiers after designation | Final paired rc-webapp Storybook and full unit suite, exact paired consumer TypeScript without consumer-installed MUI, WordPress scope and Tier P after Tier C under the existing final sequencing. Prior diagnostic shards, guard canaries and fixture-level WP checks retain their recorded scopes. Redux exit, eager TextField/theme boundary and the FormControl compatibility route stay as decided. |

This is a read-only source comparison and planned order. Static, coverage,
packaging and the final paired checks remain pending. No runtime started.
[Canonical static](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/agentic-plans/mui-upgrade-gates/gates.sh) ·
[Coverage](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/agentic-plans/mui-upgrade-gates/coverage.sh) ·
[Canonical package](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/agentic-plans/mui-upgrade-gates/package.sh).

#### 36.50 Scoped passive closure and final verification entry points

**V1 clean handback.** Payment semantic PASS 3/3 per build on committed
`73673465091` with .472 and exact admitted H24 focus. Fresh matched
Redux seeds, successful Storybook completion and stable settled state
confirmed Retryable declined and enabled, SubAccount owner-contact
without retry or declined, and NotLocked loaded with explicit null and
no banner. Archived blank .472 positives and H24's declined SubAccount
did not recur. Their capture-readiness cause remains unknown. No
Payment source change or TDD proposal.

**Saved Call Asset, separate semantic coverage.** The exact
`ads-google-ads-saved-call-asset-details--waiting-for-backend` fixture
resolved on both live indexes, completed successfully with a 0×0 scaffold,
and had no visible root content, inside/outside error panel or audited
asset request. Raw missing root PNG remains incomplete. c000 stays
INCOMPLETE and retains the original 149/150 screenshot accounting and
flags. Both passive and closing leg exits were 0. All six guard self-tests
and four fingerprint boundaries passed, with GET-only audits. The launcher
exit 75 was an unrelated helper's argument matching the final process-name
search. Executable and listener checks independently confirmed cleanup.
[Passive verdict and evidence](/Users/a.kott/vanguard-verify/v1/logs/c000-passive-20261120T162437/verdict.md).

**Exact input and slot approval (decided-by-watchdog).** A owns the clear
slot for one guarded canonical static-only run. The isolated §36.49
projection retains the H24 plan and parked TextField spec bytes. It has
4,642 paths and 29 changed files against H24. The SHA-256 of the sorted
UTF-8 `mode<TAB>SHA-256<TAB>path<LF>` rows is
`a6d4f2679754434b7334b3058b674c9fef4604f92aa33e9871ff672d2c0bd956`.
The same digest was independently confirmed by the watchdog. Require
matching paths, modes and hashes before and after, fresh Rule 13, clear
listeners and a passing deny-network self-test. Use the unchanged source
gate, scope, rules and master baseline. The old H24-bound phase wrapper
would select the wrong input. The scratch launcher had seven stray
argument tokens corrected before any invocation, with the exact expanded
argument vectors and Bash syntax checked. Direct watchdog ping delivery
`steered`, receipt `8ff27acf-9773-4ff3-8bc8-6fbf13a89421`.
[Pinned projection](/Users/a.kott/vanguard-verify/logs/final-integrated-static-a6d4f267.NQvTml/approved-input.tsv) ·
[Scratch launcher arguments](/Users/a.kott/vanguard-verify/logs/final-integrated-static-a6d4f267.NQvTml/launcher-argv.json).

| Entry point | Pin and scope |
|---|---|
| A static `bash agentic-plans/mui-upgrade-gates/gates.sh final-static-a6d4f267.NQvTml` | Approved once on the projection. App/lib TS7 compare to declared master baseline, contract and all-spec compilers require zero errors, full `biome lint src` retains zero errors and no excess warning multiplicity. Preserve all raw lanes and exits. |
| A combined `coverage.sh <label>` semantics | After static PASS and separate authorization on the same source. Existing guarded transport uses installed Vitest `spec` + `storybook`, V8, 35 exact includes, per-file 95% lines and 85% branches, one worker and explicit loopback 6031/6032 browser/proxy. Keep the two socket witnesses, Chromium denial self-test and ordinary test selection. |
| A `bash agentic-plans/mui-upgrade-gates/package.sh` | One later offline, guarded pack on the same source. Uses no-global-preload spec, one actual pack/build, installed scripts via `VG_PACKAGE_EXPORTS_ROOT`, contents/fallback/WP link/eager-MUI checks. Preserve archive-to-build identity, exact tar and consumer lock/resolution evidence. If offline resolution fails, preserve the tar and resolver output before proposing recovery. |
| Installed D12 `package-fixture/run.sh` under `package.sh` | Installs default-declared/default-mui/wp-declared/wp-mui. The declared-only isolation probe requires `MODULE_NOT_FOUND` for Material, System and X. Default gated config runs `components.tsx`, `subpath.tsx` and both `d12-consumer-paths` files. Type-only tests resolve AIAssistant, PIN, hex, OverlayStacking and ModalSplitView declarations. Postinstall `d12-runtime-paths.log` separately resolves `style.css` and `dist/index-OverlayStackingService.js`, whose ambient declarations alone cannot establish runtime existence. Preserve WP negative DatePicker export and `sx` Autocomplete/filled controls. Full `skipLibCheck:false` output remains measured, not the installed gate. |
| Final consumer on exact designated pack | Use the approved Tier C manifest/discovery harness with live indexes, start/end identity, complete paired keys and guards. Use staged `tierc-unit/stage.sh` then `run.sh canaries` and one `run.sh full` per exact leg at the end. The committed rc-webapp checker points to `html/react/tsconfig.json`. Archive its paired no-consumer-MUI compiler verdict with actual installed graph; the unit runner and installed fixture compile do not produce that verdict. Keep final WordPress runtime and Tier P in the existing sequence. |

**Parked artifact supplement.** The H24 emitted audit accepts triple-slash
type/path directives but recognizes only `.mui-reference` in archive
member names, graph IDs, byte prefilter and parsed specifiers. The installed
exports checker verifies relative import resolution and manifest targets,
so it can pass with orphan test declarations still shipped. For the one
later new tar, §36.35 needs the dual-suffix audit on both bundles, the exact
eight-member removal versus the archived member/hash inventory, unrelated
declaration byte comparison and a separate WordPress entry graph. Preserve
the H23 MUI X positive control and the default declared-only packed
DatePicker same-turn witness. The package smoke's controlled picker replay
and the WP inline fallback checks cover their named behavior. Default ESM
opt-out suspension timing is pinned at source, and packed default own-route
shape smoke and dynamic graph checks have separate scopes. Package and
coverage remain held in this static-only slot.
[Static gate](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/agentic-plans/mui-upgrade-gates/gates.sh) ·
[Guarded coverage protocol](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/run-phase.sh:43) ·
[Package gate](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/agentic-plans/mui-upgrade-gates/package.sh) ·
[Installed isolation and resolution sequence](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/agentic-plans/mui-upgrade-gates/package-fixture/run.sh:53) ·
[Tier C full unit entry](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/tmp/research/vanguard-ui-sdk-visual-baseline/tierc-unit/run.sh) ·
[H24 emitted detector](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/audit-emitted-boundaries.py:20) ·
[Parked eight-member baseline](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/declaration-boundary.4IQ4jo/milestone-declaration-baseline.json).

#### 36.51 Exact integrated static verdict and next bounded scope

**VALID RED.** The first exact integrated gate on the §36.50 projection
ran once at 14:36:32 UTC, fresh Rule 13 load 36.11 and 61% memory free,
with a passing deny-network self-test. The first launcher preflight
deferred at load 44.10 and never invoked the gate. Its separate raw
exit is archived. The admitted gate and its bounded runner exited 1.
All four TypeScript lanes and Biome errors were zero. The complete raw
lint JSON contains 843 warnings. Its path/rule/message multiplicities
relative to the pinned master baseline give 49 introduced identities and
62 excess occurrences, split into 15/18 shipped and 34/44 frozen.
Every identity and multiplicity matches the prior reconciliation. The
canonical run now supplies these counts. The bounded runner classified it
VALID from the paired clocks. The supplemental OS sleep-log query timed out.
[First preflight deferral](/Users/a.kott/vanguard-verify/logs/final-integrated-static-a6d4f267.NQvTml/deferred-1.preflight.log) ·
[Raw gate and diagnostics](/Users/a.kott/vanguard-verify/logs/final-integrated-static-a6d4f267.NQvTml/gate.log) ·
[Raw TypeScript lanes and complete lint JSON](/Users/a.kott/vanguard-verify/worktrees/final-integrated-static-a6d4f267.yT2Na5/agentic-plans/mui-upgrade-gates/out/final-static-a6d4f267.NQvTml) ·
[Exact result](/Users/a.kott/vanguard-verify/logs/final-integrated-static-a6d4f267.NQvTml/gate-result.json) ·
[Pinned classifier inputs and joined warning inventory](/Users/a.kott/vanguard-verify/logs/final-integrated-static-a6d4f267.NQvTml/integrated-static-inventory.json).

**Source postcheck recovered with the gate closed.** The raw launcher
exited 1 when its postcheck saw the single generated
`.tsbuildinfo-app`, declared by the existing incremental app config.
Its bytes were archived out of the isolated projection, SHA-256
`87ed6f632dda0c345a35a1622be8b18a7f5a06347502b7fb66289f280469caaa`.
The unchanged verifier then matched all 4,642 source paths, modes and
hashes byte-for-byte with the precheck. The raw assertion and launcher
exit remain preserved. Executable/process group and all verification
listener checks were clear. No rerun of the canonical gate.
[Raw source-after check](/Users/a.kott/vanguard-verify/logs/final-integrated-static-a6d4f267.NQvTml/source-after.log) ·
[Recovered source verification](/Users/a.kott/vanguard-verify/logs/final-integrated-static-a6d4f267.NQvTml/source-recovery-after.log) ·
[Archived compiler cache hash](/Users/a.kott/vanguard-verify/logs/final-integrated-static-a6d4f267.NQvTml/generated-tsbuildinfo-archive.sha256) ·
[Close evidence](/Users/a.kott/vanguard-verify/logs/final-integrated-static-a6d4f267.NQvTml).

**Clean slot released A → V1 (decided-by-watchdog).** The sole approved
next diagnostic is the fixed-clock, passive BillingExports Populated
pair on .472 and the admitted H24 archive. V1 applies fresh Rule 13
and existing capture guards, and returns the slot directly. Delivery
`steered`, run 146, receipt `05b4eaf1-4d9f-47c8-b8ec-0b705556518f`.
Watchdog start receipt `da784361-84a6-4ebd-827b-22bb0de6158c`, close
receipt `5c62997d-ac89-4185-96ca-c94782ff57ab`. Coverage, c001,
full units, package and Tier P remain held.
[V1](t3-thread://v2/e35503e3-cf61-4359-9313-451d57cd87cb/80fcbccb-4649-4a3a-88e7-93c70c8198d6) ·
[Watchdog](t3-thread://v2/e35503e3-cf61-4359-9313-451d57cd87cb/722326f5-024a-4cef-90a8-b30b19b29ef4).

**Proposed remediation order, review only.** Keep the current rules,
baseline, fixtures and release scope. The integrated result identifies
the same blockers and supplies no authorization for a change.

| Order | Group and minimum evidence |
|---|---|
| 1 | Three low-risk shipped identities (3 excess). Prior proposals are `Form`'s local `idx: number \| undefined`, `Table`'s local sorter rename preserving calls, and `InlineSvg`'s local `inlineSrc: string \| undefined`. If authorized as one batch, first reproduce exactly these three lint diagnostics and capture unchanged guarded case results. Pin array tree-order registration and the scalar absent index, table raw and custom sort value ordering in both directions, and source SVG payload/branch selection for literal, URI and base64 input with the existing guarded cache/fetch control where applicable. Reuse existing tests where they witness the needed behavior. Then require zero of the three identities, unchanged TypeScript/public props and identical case and observable traces. For the annotation-only cases the runtime emit must match. The intended red is the original lint diagnostic, with behavioral assertions green before and after. [Form characterization](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/src/core/Form/_FormCharacterization.spec.tsx) · [Table sort cases](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/src/core/Table/_TableSortPaging.spec.tsx) · [SVG fixture](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/src/core/StyledSVG/_StyledSVG.classNames.spec.tsx). |
| 2 | Shipped list keys (3 identities / 6 excess) and InlineSvg mount effects (4/4). Keys require reorder, insert/remove and focus/active-node retention before a stable identity proposal. Mount dependencies require source-switch, overlap/late completion, callback and listener cleanup equivalence per lifecycle. These are separate from the three mechanical proposals. |
| 3 | Five shipped trigger holds (5/5). DateCalendar/DateField focus and selection, MenuPopup's live paper wakeup, and FocusTrap's two effect lifecycles require a replacement that still satisfies their existing distinguishing witnesses. Preserve the proven focus, timer, ordering and cleanup semantics. |
| 4 | Frozen comparators (34/44). Pin the accepted original blobs and exact spec/story importers. Prove equivalence for each affected rerender/effect, hook order, key identity, prototype or coercion domain before any suggested rewrite. The Accordion batched updater change is a proven mismatch. Moving executable comparators outside `biome lint src` remains held and requires an explicit user decision. Any later proposal must preserve D12, both emitted graphs, discovery, transform coverage and mounted trace behavior per §§36.35, 36.46. |

Only the existing scoped proofs and this inventory are in scope while
V1 owns runtime. No warning trials, source changes or follow-on launch
were made.

#### 36.52 Three mechanical shipped changes, review only

**Approved review order (decided-by-watchdog).** The following is a
proposal on the exact §36.50 input. V1 owns runtime during Billing. Wait
for direct release and an implementation decision before source changes
or validation.

```diff
--- a/src/core/Form/Form.tsx
+++ b/src/core/Form/Form.tsx
@@ -158 +158 @@
-        let idx;
+        let idx: number | undefined;
--- a/src/core/Table/Table.tsx
+++ b/src/core/Table/Table.tsx
@@ -132,3 +132,3 @@
-  const valueOf = (row: TableRowProps) => (column?.sortValue ? column.sortValue(row) : row[sort.key]);
+  const getSortValue = (row: TableRowProps) => (column?.sortValue ? column.sortValue(row) : row[sort.key]);
   const direction = sort.direction === 'asc' ? 1 : -1;
-  return [...rows].sort((left, right) => direction * compareCellValues(valueOf(left), valueOf(right)));
+  return [...rows].sort((left, right) => direction * compareCellValues(getSortValue(left), getSortValue(right)));
--- a/src/core/StyledSVG/InlineSvg.tsx
+++ b/src/core/StyledSVG/InlineSvg.tsx
@@ -106 +106 @@
-    let inlineSrc;
+    let inlineSrc: string | undefined;
```

| Accepted canonical lint red | Focused before/after behavior control on the same inputs |
|---|---|
| Form 158:13–16, `lint/suspicious/noImplicitAnyLet`, “This variable implicitly has the any type.” Baseline 0, observed 1. | Run the existing Form characterization and field-binding specs. The nested scalar edits Name to `Cy`; the legacy two-item array edits only the second label to `X` in tree order. Keep the explicit index binding case as a separate control. Compare DOM, value/state and callback results. The scalar branch still passes undefined to `FormElement`; the existing cases establish scalar behavior, without directly reading the `idx` prop. |
| Table 132:9–16, `lint/suspicious/noShadowRestrictedNames`, “Do not shadow the global `valueOf` property.” Baseline 0, observed 1. | Run the existing SortPaging spec. Preserve raw numeric/text ascending and descending orders and `aria-sort`, controlled custom `sortValue`, the change callback and slice/paging. The diff preserves the same row lookup, argument order and number of call sites. |
| InlineSvg 106:9–18, `lint/suspicious/noImplicitAnyLet`, same message as Form. Baseline 0, observed 1. | Run the existing StyledSVG class-name spec, which already mounts the percent-encoded `data:image/svg+xml;utf8,` fixture and a bundled caret. The selectors and assertions stay intact. This spec does not independently hit raw markup, base64 or the fetch fall-through. If a later narrow slot includes that branch witness, reuse its 24×24 SVG as literal text, percent-encoded text and base64, and one synthetic loader response to a non-inline source. Compare same SVG markup, callback order and fetch count before/after. The three inline legs must use no fetch. Use the same local fixture response and guard in both arms. |

Source SHA-256 values for Form, Table and InlineSvg, in order, are
`30affce3add5649158634fd39a8545ba6cf6653e6c9ea80e9fbd00d41b120223`,
`3c41bc0267f98662faa0ea23c10c50cfe3304cd39f90d832dd1b32aa1c6bf87b` and
`1b7ea995ecaca3fadff38e03155baa93befcc52283499fb4069be4bec4d08890`.
Use the canonical lint JSON, SHA-256
`73485f16bee0c8a69b46cceb329602b636f343946ec1028bb3126523f399595a`,
as RED. The expected focused GREEN is those exact three identities
absent and other findings on the same paths unchanged, including the
four InlineSvg dependency warnings. Counts, case names, status rows and
observable behavior must match pre/post. The annotation-only edits
must erase at emit. Verify library types and unchanged public contracts
within the admitted focused scope.
[Canonical lint JSON](/Users/a.kott/vanguard-verify/worktrees/final-integrated-static-a6d4f267.yT2Na5/agentic-plans/mui-upgrade-gates/out/final-static-a6d4f267.NQvTml/lint.json) ·
[Pinned comparison and baseline digest](/Users/a.kott/vanguard-verify/logs/final-integrated-static-a6d4f267.NQvTml/integrated-static-inventory.json).

**Planned runner inputs, held.** If authorized, pass these four exact
files together to the existing guarded, no-global-preload Vitest
`spec` project with `--maxWorkers=1 --no-file-parallelism`, before and
after the proposed diff. Retain full-name/status inventories. Compare
focused post-edit Biome JSON for exactly the three production paths to
the pinned raw red. Use fresh Rule 13 and the existing deny-network
guard and self-test for each launch. No keys, effect deps, trigger holds
or frozen comparators are part of this proposal. No canonical rerun
or package work is scoped here.
[Form characterization](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/src/core/Form/_FormCharacterization.spec.tsx) ·
[Form binding](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/src/core/Form/_FormFieldBinding.spec.tsx) ·
[Table sort/paging](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/src/core/Table/_TableSortPaging.spec.tsx) ·
[SVG control](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/src/core/StyledSVG/_StyledSVG.classNames.spec.tsx).

**Billing Populated scoped PASS, direct V1 handback.** The single passive
.472/H24 pair on consumer `73673465091` fixed the clock before seed
construction and matched locale, time zone, viewport, scroll and loaded
Inter-Regular. The 20 rows, all 40 Created text rectangles, 137.5 px
widest text run, 153.5 px Created column and 1045.234375 px Actions
offset match. The Created crop had zero differing pixels. All four
fingerprints and six denial self-tests passed, with zero audited
escapes. The old width flag did not recur in this scope. The archived
cause remains unknown and no Table fix is indicated. Keep the sealed
c000 INCOMPLETE and preserve its flags. V1 returned verified clear
listeners and executables. The mechanical batch still awaits its
separate implementation decision.
[Billing verdict and close evidence](/Users/a.kott/vanguard-verify/v1/logs/c000-billing-populated-20261120T164029/verdict.md).

#### 36.53 Deferred ActionBarRoot source witness, review only

The pinned V2 packed draft SHA-256 is
`17cd9fb03806ea400a172b11152b7a0467781499cb5be40d6280d3d7128e224a`.
The current Root, service and pub-sub source blobs match V2's
recorded IDs (`4deeffb9…`, `231fc607…`, `048cf3bf…`). For a future
authorized source leg, the proposed selectable test is
`src/core/ActionBar/ActionBarRoot/_ActionBarRoot.observers.spec.tsx`
under the normal guarded Vitest `spec` project in jsdom, one worker,
no global preload. Use the real aliases
`@vanguard/ActionBar/ActionBarRoot/ActionBarRoot`,
`@vanguard/ActionBar/ActionBar.service` and `@helpers/pub-sub` in
the same isolated source checkout. Reuse V2's two natural detachments,
four mounted +1 checks and aged exact-zero assertions. Record admission,
counts and the intended teardown RED before proposing a source fix.
[Pinned draft](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/tmp/research/vanguard-ui-sdk-visual-baseline/v2/_TierPActionBarObservers.test.jsx) ·
[Source fallback and guarded procedure](/Users/a.kott/PhpstormProjects/mgm/rc-webapp/tmp/research/vanguard-ui-sdk-visual-baseline/v2/tierP-actionbar-observer-admission.md).

The mount-only effect owns the four returned RxJS `Subscription`
handles from `reactActionBarAddMessage`, `reactActionBarRemoveMessage`,
`reactActionBarSetFooter`, and `reactActionBarHideFooter`. The proposed
cleanup unsubscribes only those four handles. Each callback-form
`$sub` registers with the singleton ReplaySubject for its channel.
**Approved isolation (decided-by-watchdog).** Keep both numeric
teardown/remount cycles publish-free on both legs. Collect the complete
two-cycle trace before evaluating the exact-zero assertions. Run the
service replay/hide control only in a separate isolated behavior leg.
`$pub` drops events for channels with no subject yet, so in that leg
first mount then naturally detach a real root. Publish one synthetic
footer through `actionBarService.setFooter` while detached, then mount
a new root and assert the footer button is visible from replay. Call
`hideFooter` while mounted and assert it becomes hidden. Keep the
ReplaySubjects and service state intact. Existing `_ActionBar.dataSlot.spec.tsx`
checks component markup. `ServiceUseCase` supplies existing service
behavior context and is outside this source-only runtime proposal.
No ActionBar test, source edit, staging or runtime was performed.
[Mount registrations](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/src/core/ActionBar/ActionBarRoot/ActionBarRoot.tsx:21) ·
[ReplaySubject and publish behavior](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/src/helpers/pub-sub.ts:65) ·
[Existing slot spec](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/src/core/ActionBar/_ActionBar.dataSlot.spec.tsx:11) ·
[Existing service story](/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/src/core/ActionBar/stories/ServiceUseCase.story.tsx:41).

#### 36.54 Isolated mechanical batch, focused PASS

**Authorized and verified scope (decided-by-watchdog).** Start input was
the exact 4,642-path §36.50 projection. The approved three-file patch is
`cc4a67acb41ab7bf62841b3804355182e9ebfac957cf53bb0af6f78ca05d380e`.
Only the Form index annotation, Table sorter local name and InlineSvg
annotation changed. The final isolated path/mode/hash manifest has
SHA-256 `11419caa67cd84fddb0045aadfd540d3f348eae9c5ff142fe28976d8e369a74d`.
It matches the expected three-file delta after validation. The preserved
A integration fingerprint outside this plan still matches §36.49.
[Exact patch](/Users/a.kott/vanguard-verify/logs/mechanical-shipped-a6d4f267.X6Ob6N/approved-mechanical.patch) ·
[Verified post-edit manifest](/Users/a.kott/vanguard-verify/logs/mechanical-shipped-a6d4f267.X6Ob6N/verified-post.tsv).

- Both guarded no-global-preload legs selected only the same four
  approved files. Each passed 22/22 with identical full-name/status
  rows. The existing SVG cases cover a bundled caret and percent-encoded
  URI. Raw markup, base64 and loader fall-through were outside the
  runtime selection.
  [Before](/Users/a.kott/vanguard-verify/logs/mechanical-shipped-a6d4f267.X6Ob6N/before.spec.json) ·
  [After](/Users/a.kott/vanguard-verify/logs/mechanical-shipped-a6d4f267.X6Ob6N/after.spec.json).
- Against the canonical red, the scoped post-edit lint removed exactly
  the three approved warning identities and occurrences. The other
  16 identities and occurrences on those paths match with zero
  omitted diagnostics or errors. The raw experimental-reporter notice
  is retained and checked explicitly by the offline parser.
  [Raw post-edit lint](/Users/a.kott/vanguard-verify/logs/mechanical-shipped-a6d4f267.X6Ob6N/after.lint.log) ·
  [Exact comparison](/Users/a.kott/vanguard-verify/logs/mechanical-shipped-a6d4f267.X6Ob6N/comparison.json).
- Installed TypeScript 5.9.3 used the library options and checked the
  three paths with zero diagnostics before and after. All three emitted
  declarations match byte for byte. Form and InlineSvg JS match exactly.
  Table JS matches after reversing just the declaration and two calls
  of the local name. This is scoped type and emit evidence.
  [Before types](/Users/a.kott/vanguard-verify/logs/mechanical-shipped-a6d4f267.X6Ob6N/before.type-emit.log) ·
  [After types](/Users/a.kott/vanguard-verify/logs/mechanical-shipped-a6d4f267.X6Ob6N/after.type-emit.log).

All five completed checks were VALID with raw exit 0 and passed the deny
self-test. Rule 13 preserved the separate before-spec load deferral
(60.83) and type/after-spec memory deferrals (33%, 36%, 36%, 39%).
The approved before spec was run once. Owned runners and inhibitors are
reaped and listeners clear. The exact patch is preserved for A's
integration checkout pending its application decision. If integrated
unchanged, the scoped projection would reconcile to 46 identities/59
excess (12/15 shipped and 34/44 frozen). The existing exact canonical
RED remains the verdict on the integration input. No follow-on slot
has been used. The old temporary-index approval remains untouched.
[Deferred preflights and guarded evidence](/Users/a.kott/vanguard-verify/logs/mechanical-shipped-a6d4f267.X6Ob6N) ·
[Clean slot evidence](/Users/a.kott/vanguard-verify/logs/mechanical-shipped-a6d4f267.X6Ob6N/close.log).

**Integrated uncommitted (decided-by-watchdog).** Applied exactly the
verified patch `cc4a67acb41ab7bf62841b3804355182e9ebfac957cf53bb0af6f78ca05d380e`
in A's integration checkout on `feature/ui-sdk-architecture-investigation`.
The three postimages are all mode 100644. Form SHA-256
`7cd9ebf8e91ad03ad91dd09d742c16b6d95a6458f89ff126bb717210fa961f1f`,
Table `c11c9620c867ba0f9e4d9f64134c5ef5de38f7439c4d7c0a2e1663e59e50ae3f`,
and InlineSvg `67ddc115cf05b53273bf3d1148abecd93e56aaf44ee7b9f4a743ca4c07b2d538`.
The 4,639 other working file bytes and modes matched at application.
The 46/59 count remains a scoped estimate against the pinned
canonical RED, with no gate or mechanical rerun.
[Integration preimages](/Users/a.kott/vanguard-verify/logs/mechanical-shipped-a6d4f267.X6Ob6N/integration-before.tsv) ·
[Integration postimages](/Users/a.kott/vanguard-verify/logs/mechanical-shipped-a6d4f267.X6Ob6N/integration-after.tsv).

#### 36.55 Isolated ActionBarRoot observer cleanup

**Qualified source RED (decided-by-watchdog).** The isolated base is
`11419caa67cd84fddb0045aadfd540d3f348eae9c5ff142fe28976d8e369a74d`.
The single added publish-free observer test has SHA-256
`b83096d61e35757483b654de2cf93c19673d6deb666d1dce1be621975e192b4a`.
All 4,643 paths, modes and hashes in its RED projection matched before
and after, manifest
`e1c9a059c7f55ac842db52e1f332d45fb88e18e8142606ab88cbb45b07e44458`.
Fresh Rule 13 admitted load 11.06 with 43% memory free; the guard and
listener checks passed. The single real-alias case reached its
exact-zero assertion and failed with raw exit 1. It had distinct
mounted bars, preserved all four +1 controls, and observed both DOM
detachments. The first teardown and aged sample retained `[1,1,1,1]`;
the second retained `[2,2,2,2]`. The case completed both cycles before
the exact-zero assertion and did not publish.
[RED trace and case](/Users/a.kott/vanguard-verify/logs/actionbar-source-tdd.WCl7JH/qualified-red.json) ·
[Raw RED](/Users/a.kott/vanguard-verify/logs/actionbar-source-tdd.WCl7JH/red.log).

**Isolated patch prepared after qualified RED (decided-by-watchdog).**
Capture the four existing subscription returns and unsubscribe each in
the mount effect cleanup. The callbacks, dependencies, service and
ReplaySubjects stay intact. The production patch SHA-256 is
`ad7d625e782b5e0c9904a637c26f38e2b8695f04b99687d0eb895060103a79eb`.
The observer test keeps its exact RED bytes. The separate replay/hide
fixture has SHA-256
`622d5b5fd0090ee478ef59d2fb8f1636b0e14eddd12c4b874408f9e8e7e2a85f`.
The 4,644-path post-edit manifest is
`ccb1d067de531594167aa056b29e57dbeec2705bc23279553bfa264ef7c3fb14`.
GREEN, existing slot spec and replay/hide each require fresh Rule 13,
deny self-test, clear listeners and their own pinned process. Memory
below 40% defers each launch. A's integration checkout contains only
the approved mechanical batch, with the ActionBar changes held there
pending review.
[Isolated cleanup patch](/Users/a.kott/vanguard-verify/logs/actionbar-source-tdd.WCl7JH/actionbar-cleanup.patch) ·
[Replayed footer fixture](/Users/a.kott/vanguard-verify/logs/actionbar-source-tdd.WCl7JH/_ActionBarRoot.service-replay.spec.tsx) ·
[Pinned post-edit inputs](/Users/a.kott/vanguard-verify/logs/actionbar-source-tdd.WCl7JH/green-before.tsv).

**Identical observer case GREEN.** The fresh isolated run passed 1/1
with all four +1 controls on each mount, distinct detached DOM and
`[0,0,0,0]` at both teardown and aged samples in both cycles. Raw
exit 0, guard and listeners qualified. The existing ActionBar slot
spec deferred at 39% memory free before runtime. Its separate
process and the replay/hide leg remain due. Preserve completed RED
and GREEN. [GREEN trace](/Users/a.kott/vanguard-verify/logs/actionbar-source-tdd.WCl7JH/green.log) ·
[Slots preflight deferral](/Users/a.kott/vanguard-verify/logs/actionbar-source-tdd.WCl7JH/slots.deferred-1.preflight.log).

**Scoped source PASS, ready for review.** The existing ActionBar
slot spec passed 1/1 on the same source. The first separate replay
process exited 1 at `Invalid Chai property: toBeVisible` after the
footer was present at `translateY(0)`. Hide was unobserved. That raw
harness failure and its `ccb1d067…` input manifest remain archived.
The watchdog approved one corrected replay using the established
file-local `@testing-library/jest-dom/vitest` import. Only that spec's
bytes changed, with all 4,644 paths and modes matching the new
`4f4c118a71d27bb720fa191790769e884a03ec39363e953436deef1bf120b80b`
manifest before and after. The production SHA-256 remains
`a361a2bb24b659191d13108f31ec95bb065328ec553e83a42ae7d30a1289a24a`.
The retry used fresh Rule 13 at load 11.83 and 44% memory free,
passed its guard, and exited 0 on the same named case. It observed
no subscriber while detached, a visible replayed footer after
remount, successful hide, and the same subject throughout. The
completed observer and slot legs were reused.
[Existing slot result](/Users/a.kott/vanguard-verify/logs/actionbar-source-tdd.WCl7JH/slots.json) ·
[Original replay harness failure](/Users/a.kott/vanguard-verify/logs/actionbar-source-tdd.WCl7JH/replay.log) ·
[Retry trace](/Users/a.kott/vanguard-verify/logs/actionbar-source-tdd.WCl7JH/replay-retry.log) ·
[Qualified comparison](/Users/a.kott/vanguard-verify/logs/actionbar-source-tdd.WCl7JH/qualified-comparison.json).

The exact review diff including both fixtures has SHA-256
`b31ef69ce65fe754b59ad336c909856e7555c1f49f6b34d0fd079598dbf4df7d`.
The original one-file cleanup patch remains unchanged. All five owned
runner groups and inhibitors closed, and verification listeners are
clear. The ActionBar diff remains isolated pending integration review.
This is source-only cleanup and service evidence.
[Combined review diff](/Users/a.kott/vanguard-verify/logs/actionbar-source-tdd.WCl7JH/actionbar-source-review-qualified.patch) ·
[Final clean slot check](/Users/a.kott/vanguard-verify/logs/actionbar-source-tdd.WCl7JH/close-after-retry.log).

**ActionBar integrated uncommitted (decided-by-watchdog).** Applied
only the qualified three-file patch
`b31ef69ce65fe754b59ad336c909856e7555c1f49f6b34d0fd079598dbf4df7d`.
Mode 100644 is verified for the cleanup source and both new specs.
Their SHA-256 values are the verified cleanup
`a361a2bb24b659191d13108f31ec95bb065328ec553e83a42ae7d30a1289a24a`,
unchanged observer witness
`b83096d61e35757483b654de2cf93c19673d6deb666d1dce1be621975e192b4a`,
and corrected replay fixture
`4644187faec0746dd9b2a1a12df28ec59b031217898346f8f176ef2f54fa7537`.
All 4,641 other working paths kept their bytes and modes, and the
index was byte-identical before and after. The source-only teardown
and replay verdicts carry to this diff. Exact packed evidence remains
held. Completed cases were not repeated.
[Integration postimages](/Users/a.kott/vanguard-verify/logs/actionbar-source-tdd.WCl7JH/integration-after.tsv) ·
[Unmodified index digest](/Users/a.kott/vanguard-verify/logs/actionbar-source-tdd.WCl7JH/integration-index.sha256).

#### 36.56 AIOrb ownership drafts, offline only

During the ActionBar resource hold, drafted the previously reviewed
B design outside both source trees. The publish-free jsdom draft
captures root CSSOM presence, value and priority plus the unrelated
root/body sentinels through a natural orb removal before restoration.
The separate selector map pins real pseudo geometry, motion and color
consumers and both natural removal orders, including the check that
rejects a JS-only change. Its single-instance WordPress gate stays
distinct from the multi-instance source check and the approved smoke
order. All outcomes are predictions. No staging or AIOrb execution.
[CSSOM draft](/Users/a.kott/vanguard-verify/logs/actionbar-source-tdd.WCl7JH/aiorb-offline-review/_AIOrb.root-style.spec.draft.tsx) ·
[Loaded-CSS selectors and WordPress controls](/Users/a.kott/vanguard-verify/logs/actionbar-source-tdd.WCl7JH/aiorb-offline-review/loaded-css-selector-map.md) ·
[Reviewed B proposal](/Users/a.kott/.t3/worktrees/rc-webapp-vanguard-git/feature-ui-sdk-b-data-s-aed05ed8753acf33/agentic-plans/ui-sdk-thread-b-log.md:1531).

**Offline draft approved (decided-by-watchdog).** Positive single-instance
visual/control legs use matching reference theme inputs and record loaded
stylesheet proof for each leg. Seeded inline important host values belong
to the separate ownership control. The CSS-only witness and its JS-only
negative control stay separately selectable. AIOrb execution remains held.

**AIOrb test-first admission and CSS witness (decided-by-watchdog).**
After ActionBar integration, pinned a fresh isolated 4,645-path source
projection with manifest SHA-256
`d264a5be3b5a19814e68d71deb1aa1d562511b8fb4ab0f554b8f5319327b21c1`.
The only addition to the accepted ActionBar source input is the unchanged
two-case CSSOM draft, SHA-256
`3eb648353e984aea66243ac8190986334910e9a3c2d5b8f6f828c8619e4da7be`.
All projected paths, modes and bytes matched and the isolated dependency
entry points resolve locally. Rule 13 deferred the RED leg at load 131.56
and again at 131.81, with 40% free memory in the paired samples. There is
no AIOrb test outcome. The single guarded jsdom RED remains first on fresh
passing preflight.
[Exact projection](/Users/a.kott/vanguard-verify/logs/aiorb-cssom-tdd.Zaqx6y/approved-input.tsv) ·
[First preflight](/Users/a.kott/vanguard-verify/logs/aiorb-cssom-tdd.Zaqx6y/admission-check-1.log) ·
[Second preflight](/Users/a.kott/vanguard-verify/logs/aiorb-cssom-tdd.Zaqx6y/admission-check-2.log).

During the resource hold, preserved the executable CSS witness draft in
the evidence folder. The definition explicitly records the original root
that survives and the original root that detaches in each removal order.
The play captures separate host CSSOM and computed evidence before
asserting either and records per-document loaded style proof. The
additive offline comparator draft addresses the color review finding
without changing the story draft. It requires four independent same-theme
documents and positive unseeded reference controls. It compares actual
radial colors and stops, border, small and large fills, and overlay for
both step-4 and both survivor samples. It separates invalid support,
stylesheet or provenance evidence from a qualified baseline mismatch.
The unchanged source browser baseline and all CSS execution remain held
for separate authorization, as do AIOrb production edits and packed
checks.
[Story draft](/Users/a.kott/vanguard-verify/logs/aiorb-cssom-tdd.Zaqx6y/_AIOrbStyleOwnership.stories.draft.tsx) ·
[Offline comparator draft](/Users/a.kott/vanguard-verify/logs/aiorb-cssom-tdd.Zaqx6y/compare-loaded-css.draft.py) ·
[Review handoff](/Users/a.kott/vanguard-verify/logs/aiorb-cssom-tdd.Zaqx6y/loaded-css-comparator-handoff.md).

**AIOrb jsdom RED split and r2 acceptance (decided-by-watchdog).** The
first sealed run was valid but did not qualify. The pristine case failed at
the ownership assertion as intended. The seeded case failed its precondition
because jsdom 26.1.0 / cssstyle 4.6.0 drops custom-property priority on
readback. Those r1 artifacts are kept unchanged. The watchdog approved
splitting by environment capability. The jsdom spec and qualifier keep both
cases, exact values, resize and natural-detach checkpoints and both
sentinels, but seed ordinary declarations. The `!important` seeds, the
sentinel priority and computed stylesheet parity stay REQUIRED AIOrb
acceptance coverage in the paired Chromium witness. This does not relax any
test, gate or Tier P criterion. The r2 projection differs only in the spec
row, with manifest SHA-256
`aa468c5d4c008293c58d10d75425c9e792f43a01a55e14dbf50c6fdddc65a436`. Its
first attempt aborted on a T3 host restart before any test outcome, and that
evidence is kept. The second attempt was VALID and RED and qualified: both
cases fail at `host root CSSOM ownership before restoration`. Reviewed and
accepted for pristine and ordinary pre-seeded ownership through resize and
natural detach.
[r1 verdict](/Users/a.kott/vanguard-verify/logs/aiorb-cssom-tdd.Zaqx6y/red-verdict.md) ·
[r2 qualified RED](/Users/a.kott/vanguard-verify/logs/aiorb-cssom-tdd-r2.LzcZl3/qualified-red.json).

**AIOrb loaded-CSS Chromium baseline authorized (decided-by-watchdog).** One
bounded unchanged-source run is authorized, using the reviewed four-document
comparator unchanged. The isolated snapshot is the approved r1 projection
plus the verbatim story draft and a scoped `.aiorb-scope` config built on the
H24 pattern. AIOrb.tsx and AIOrb.module.scss are byte-identical, and the
manifest has 4,648 paths. Storybook dev on :6031 runs under the existing H21
deny-by-default Node egress guard. The collector derives from H23 and runs
under the existing Chromium guard, which does a fresh Rule 13 check, routes
through the loopback deny proxy and self-tests. Each leg gets a fresh context
with light theme, 1024×768, DPR 1 and en-US. Served module and index
fingerprints are taken at the start and end of each leg. A per-leg
expectedStyleProof is re-derived from that leg's own loaded CSS-module
response in a collector-owned proof document. The JS-only negative control
stays a separate later leg. No production edits until this baseline
qualifies and its receipt is reviewed.
[Baseline harness](/Users/a.kott/vanguard-verify/logs/aiorb-css-baseline.YpzXP1/run-baseline.sh)

**AIOrb fix conditions (decided-by-watchdog, user decision 3).** V1
confirmed the r2 RED is valid for its stated reason. V1 also confirmed the
defect is pre-existing on .472: `dist/index-AIOrb.js` has the same effect
with deps `[state]` and no cleanup, and `vanguard.css` has the same `:root`
block. The fix ships with the reproducing spec and starts only after the
baseline bundle is sealed and the watchdog has been notified.
1. False-green guard (V1 §1.4, MAJOR). Deleting the effect alone turns the
   jsdom spec green but takes away the inner orbs' inputs. The module's
   `:root {}` block derives `--orb-size-small/large`, both animation delays,
   `--ai-orb-base-color-op` and `--overlay-orbs` from the values the JS
   writes to the root. The jsdom spec is necessary but not sufficient.
   Acceptance needs all three: jsdom GREEN, the four-document Chromium
   comparator matching the unchanged-source single-orb reference per profile
   (computed inner widths, delays, overlay and gradient colours), and the
   JS-only negative control RED.
2. Design. No writes to documentElement and no global `:root` block for
   these names. The 7 inputs live on the orb's own element and the derived
   declarations move into the orb's own scope. Two orbs of different sizes,
   iframes and shadow roots then each resolve their own values. Size changes
   must update. Today the root stays at 40px after Small→Medium because deps
   are `[state]` only. Pin that as its own assertion.
3. Additional proof: a StrictMode double mount (V1 2.6); a portal orb in the
   same document next to an inline orb (2.3); and a host stylesheet rule
   `:root{--container-size:…!important}` (2.7), with its before/after
   behaviour stated and declared as a delta if it changes.
4. Declared delta: Vanguard's stylesheet stops defining the generic names
   (`--container-size`, `--color1/2/3`, …) on `:root`. rc-webapp reads none
   of them; V1 found 0 readers apart from AIOrb's own 15 rules. WordPress
   host themes are not visible to us. The variables are not renamed in this
   fix, to keep the diff minimal; scoping is the fix.
5. rc-webapp exposure: 2 direct sites, both Large and never on screen
   together. The LoadingModal 'ai' variant has 0 callers. No visible impact
   today; the only residue is 7 inline variables left on `<html>`.
No commit.

**AIOrb Chromium baseline attempt 1 not qualified; attempt 2 admitted
(decided-by-watchdog).** Attempt 1 is accepted as not qualified, and its
bundle stays preserved
([receipt](/Users/a.kott/vanguard-verify/logs/aiorb-css-baseline.YpzXP1/baseline-receipt.md)).
1. The scoped `.aiorb-scope/main.ts` viteFinal overrides `esbuild` to
   `drop: ['debugger'], pure: []`. This is harness only, and the production
   config is untouched. The served AIOrb.tsx and AIOrb.module.scss module
   hashes must equal attempt 1's. Any difference stops the run unqualified.
2. Stylesheet-proof predicate (story and collector mirror):
   `root.matches(selector) && width === 'var(--container-size)' &&
   rule.cssText.includes('--animation-duration-rotation')`. If Chromium 131's
   cssText also omits the variable, fall back to the reduced predicate and
   assert exactly one matching rule. The receipt states the observed cssText.
3. The status field is the raw play status, not `storyFinished` (which
   reported "success" while play threw). The collector fails closed on
   `playFunctionThrewException` unless both traces are complete.
4. One run in a new output dir with resealed manifests. Expected diffs from
   attempt 1: story draft, collector and scoped config only. Same guards and
   Chromium build, Rule 13 first. No third attempt without the watchdog.

**AIOrb baseline attempt 2: condition 1 corrected (decided-by-watchdog).** The
original condition 1 was mis-specified. A served-module hash embeds the
absolute snapshot path, so it can never match across attempts. The corrected
condition is "the esbuild override does not change AIOrb's transform", proven
offline with no third run.
1. scss: accepted as proven. The bodies are byte-identical once the snapshot
   root is replaced by a fixed token.
2. tsx, two checks. First, the sealed AIOrb.tsx contains 0 `console.` and
   `debugger`. Second, esbuild transforms it under both option sets
   (`drop:['console','debugger'], pure:['console.log']` and
   `drop:['debugger'], pure:[]`), all other options as resolved, and the
   outputs must be byte-identical.
3. If both pass, run the unchanged comparator offline on the sealed a2
   bundle. The launcher gate and the reduced-single predicate are accepted.
4. Expected reading: on unchanged source the seeded legs throw (the leak,
   observed in Chromium) and the reference legs complete. A qualified
   baseline is exit 1 with the known shared-inner-width signature plus CSSOM
   evidence, or exit 0. Exit 2 means not qualified.
5. Future collectors save served module bodies and compare them with the
   snapshot root tokenized.

**AIOrb fix: successor accepted, control correction (decided-by-watchdog).**
1. Successor accepted. Comparator exit 0 with 0 differences. The host root is
   untouched, including the 312px `!important` seed and `--color1`. The
   single-orb references are byte-identical to the qualified baseline
   (condition 7). The host-stylesheet leg measures 40/40 outer and 4/6 inner
   while the root computes 312px.
   [successor](/Users/a.kott/vanguard-verify/logs/aiorb-css-successor.Qm2eHi/verdict.json)
2. JS-only control: exit 2 is "not qualified" under the comparator's own
   contract, and it is not relabelled. Offline correction: a
   `--references-from <bundle>` option, for `js-only-control` only, takes the
   references from the qualified a2 baseline. Without the option the
   comparator must behave exactly as the pinned one: the successor gives
   exit 0 with the same verdict hash, and the a2 baseline gives exit 1 with
   the same verdict hash. Expected with the option: exit 1,
   known-js-only-mismatch.
3. The lint warning in the new spec file is fixed without touching any
   assertion, then GREEN 7/7 on the formatted file.
4. Step 9: targeted AIOrb + LoadingModal specs, the WP same-tick smoke, and
   the CSS-order check if the emitted rule order changes.
5. Declared deltas: (i) the stylesheet no longer defines `--container-size`,
   `--color1/2/3` or the derived orb variables on `:root`; (ii) a host
   `:root{--container-size:…}` no longer resizes the inner circles (before
   31.2/46.8 from a 312px root, after the orb's own 4/6).

**AIOrb Chromium acceptance closed: ACCEPTED (decided-by-watchdog, option
(i)).** The acceptance tool REJECTED the negative control with exit 2, not
exit 1. With baseline references the references pass, but every seeded orb
frame fails the positive-style precondition (radial `none`, overlay
transparent), because nothing feeds `--ai-orb-base-color` to the root block.
The predicted shared 31.19/46.80 widths at step 4 are present in the raw
trace. The expectation of exit 1 was wrong: the comparator's JS-only
signature assumed only the size inputs are lost. The control's purpose was
to show that a JS-only change cannot pass acceptance, and it is met more
strongly than predicted. The pinned comparator remains the acceptance tool;
the successor's exit 0 came from it (verdict 42112aa4…). The
`--references-from` variant is archived with its diff and three
identical-verdict proofs, and is not promoted.
[control archive](/Users/a.kott/vanguard-verify/logs/aiorb-control-offline/comparator.diff)

**InlineSvg stable `load` dependency (B's draft, admitted by A).** The
mount effect's deps change from `[]` to `[load]`, applied on base sha256
`67ddc115…`. biome useExhaustiveDependencies drops from 4 rows to 3; only the
`load` row goes. The new `_InlineSvg.lifecycle.spec.tsx` is 5/5 GREEN on the
base and on the patch with identical outcomes. B's StrictMode predictions
(T4 one request, T5 late onError once) were observed on the base and pinned.
Discrimination controls on temporary swaps: `[status]` turns T2 and T3 red,
`[handleError]` turns T2 red, `[src]` turns T3 red, `[load]` stays green.
StyledSVG is shared-level, so the full spec project and the junk-token
check are owed before any pack.
[evidence](/Users/a.kott/vanguard-verify/logs/inlinesvg-load-dep/)

#### 36.57 Commit-ready inventory of the working tree (2026-11-23, offline)

Base HEAD `55dc611`. 51 paths: 36 modified, 15 untracked. Each path was
classified by its current SHA-256 against two sealed inputs. The first is the
accepted post-ActionBar integration projection
(`aiorb-cssom-tdd.Zaqx6y/approved-input.tsv`). The second is the c000
untracked fingerprint, which equals admitted H24 focus successor `e90441d…`,
archive `c11fd6ca…`. 46 paths equal the projection byte-for-byte. The other
5 are this plan, AIOrb (3 paths) and InlineSvg `[load]`. One more path, the
parked TextField characterization, equals the projection but stays out of the
release set (§36.30, §36.49). Commits are made by the user. Subjects are
conventional and carry no Co-Authored-By trailer. Status key: VI = verified
independently by a verifier verdict; SV = self-verified (A's runs, watchdog
review only); UV = unverified, not for the release commit set.

| # | Commit subject | Paths | Evidence | Status |
|---|---|---|---|---|
| 1 | `feat(date-picker): replace the MUI X picker with an own field, shell and calendar` | DatePicker.tsx, DatePickerShell.tsx, DatePickerShell.module.scss, DateField.tsx, DateField.scss, date-field-sections.ts, calendar-adapter.ts, DateCalendar.tsx, _DatePicker.mui-reference.tsx, _DateField.mui-reference.tsx, _DateField.differential.spec.tsx, _DatePickerShell.differential.spec.tsx, _DateFieldComputedParity.stories.tsx, config/derived-notices.txt | H24 bytes: S2 independent PASS §36.18, H24 package PASS §36.29, mobile successor PASS, exact packed Narrow Cancel focus PASS, c000 Tier C replay (V1) INCOMPLETE 149/150 §36.46–§36.50. Post-H24 edits to DateField.tsx and DateCalendar.tsx (selection helper §36.39, year focus §36.40, calendar keys §36.42) are in no pack yet. | VI for the H24 bytes; SV for the §36.39/40/42 deltas. The .472 nested-calendar hit-test is still unpaired (§36.30) |
| 2 | `fix(searchable-select): keep the own caret glyph and focus behaviour` | SearchableSelect.tsx, _SearchableSelect.caret.spec.tsx | H23 caret witness, V1 [verdict](/Users/a.kott/vanguard-verify/v1/logs/h23-caret-witness/verdict.md). Carried unchanged in H24 | VI |
| 3 | `build(types): keep frozen reference fixtures out of the declaration build` | tsconfig.dts.json, vite.config.lib.ts, scripts/_dts-package-imports.spec.ts | The `.mui-reference` boundary is H23/H24 (package PASS, emitted audit 0 edges). The `.reference` widening is §36.35: 2 intended RED and 12/12 green, three-file `d34d0327…` | VI for `.mui-reference`; SV for `.reference`. The new-tar eight-member audit is still owed |
| 4 | `fix(lazy-fallback): share one suspension helper across split routes` | src/core/_internal/lazy-fallback.tsx, _lazy-fallback.spec.tsx | §36.32: two-file `1b9422d0…`, 38/38 guarded before/after, 22/22 fallback audit, identical WP rewrite | SV. Packed dynamic-edge and WP same-turn checks are owed (§36.49 row 1) |
| 5 | `fix(click-away): assign the forwarded ref before listeners attach` | src/primitives/react/ClickAway/ClickAway.tsx, _click-away-ref.spec.tsx | §36.37: `fe8a9692…`, 26/26 matched guarded cases | SV |
| 6 | `test: correct fixture typing and frozen-reference setup` | Breadcrumbs (_Breadcrumbs.cleanup, _breadcrumbs-parity), _DateRangeInput.differential, _error-logging, _Snackbar.differential, _SnackbarRoot.mui-reference, _TextHighlighted, _Toolbar.mui-reference, _class-junk-scan, _MuiTextFieldPropRouting.differential, _MuiTextFieldReachability.differential, _theme-default-props.differential, both use-media-query specs, _junk-class-sites, _popper-dual-boundary.differential | §36.33 `b3b69b6b…`, §36.34, §36.36 `9b58e527…`, §36.38 `6dd77930…`, §36.41 `880dc661…`. Exact integrated static gate §36.51: all 4 TypeScript lanes 0 and Biome errors 0 | SV (test-only; not in any packed graph) |
| 7 | `refactor: clear three mechanical lint findings in Form, Table and InlineSvg` | Form.tsx, Table.tsx, InlineSvg.tsx (only the hunk at line 106) | §36.54 patch `cc4a67ac…`: 22/22 identical before/after, lint −3 identities, emitted JS and declarations equal | SV |
| 8 | `fix(action-bar): unsubscribe root observers on unmount` | ActionBarRoot.tsx, _ActionBarRoot.observers.spec.tsx, _ActionBarRoot.service-replay.spec.tsx | §36.55: qualified RED `[1,1,1,1]`/`[2,2,2,2]` → GREEN `[0,0,0,0]`; slot spec 1/1; replay/hide retry PASS; review diff `b31ef69c…`. Fix drafted from V2's Tier P observer finding | SV (watchdog accepted; packed evidence held) |
| 9 | `fix(ai-orb): scope orb variables to the orb element` | AIOrb.tsx, AIOrb.module.scss, _AIOrb.root-style.spec.tsx | r2 qualified RED, jsdom 7/7, Chromium successor comparator exit 0 with reference equality (§36.56). V1 independent offline ACCEPT (reference sha `c6ded95f…`/`3504d0fb…`). Source-level WP smoke 5/5 | VI |
| 10 | `fix(inline-svg): depend on the stable load callback` | InlineSvg.tsx (only the hunk at line 176), _InlineSvg.lifecycle.spec.tsx | Lint 4→3; lifecycle 5/5 on base and patch; controls discriminate (§36.56) | SV (watchdog accepted) |
| 11 | `docs(vanguard): record the rebuild verification log` | agentic-plans/ui-sdk-architecture-investigation.md | — | docs |
| — | NOT in the release set | src/core/_internal/InputBase/_TextFieldV9Compatibility.spec.tsx (`02dea156…`, parked callback-native characterization) | Kept outside every gate input under §36.30/§36.49. It needs an owner decision (keep as a local characterization or drop) and, if kept, a targeted run plus review | UV |

InlineSvg.tsx carries two independent hunks: line 106 (commit 7) and line
176 (commit 10). Commit them separately with `git add -p`, or merge commits 7
and 10 into one. If kept separate, commit 7 must land first because
the [load] patch was based on its postimage `67ddc115…`.
Scoped lint after the integrated deltas: 49/62 at canonical RED, −3 from the
mechanical batch, −1 from InlineSvg `[load]`. That gives 45 identities / 58
excess (shipped 11/14, frozen 34/44). This is an estimate; the canonical
re-run is still owed.
[Projection](/Users/a.kott/vanguard-verify/logs/aiorb-cssom-tdd.Zaqx6y/approved-input.tsv) ·
[c000 fingerprint](/Users/a.kott/vanguard-verify/logs/h24-mobile-focus-successor/final-source-checks/c000-handoff.wJwVLo/local-source-fingerprint.json).

**Inventory accepted as the commit plan (decided-by-watchdog).** It has 11
groups. InlineSvg's two hunks are split with `git add -p`, and group 7 lands
before group 10. (a) `_TextFieldV9Compatibility.spec.tsx` stays local and out
of the release set: it is neither deleted nor staged, and it is revisited
after the release. (b) The commits still wait for the user. Before that, owed
item 2 runs on the exact release input, identified by RELEASE-INPUT-ID.

**Rule 15 (decided-by-watchdog, 2026-11-23).** Host load around 75 with almost
no CPU from our own processes came from macOS indexing and assessing each
freshly created snapshot: Spotlight `mdworker_shared` ×3, `syspolicyd` and
`trustd`. (1) Every NEW snapshot, worktree or shadow directory gets a
`.noindex` suffix (for example `release-input.XXXX.noindex`), which Spotlight
skips. Existing sealed directories keep their names, because their paths are
in seals. (2) After creating a snapshot, wait for the indexing burst to pass
before the Rule 13 check rather than counting deferrals. Admission still
needs load < 40.
RELEASE-INPUT-ID `ee8d38e0d63a6d22fc87b89a8c8ccaef0965122ce54f51f99e3d7e4e87eef1a7`
is recorded, and the parked spec's HEAD blob in the snapshot is accepted.

**Release-input checks accepted; provisional rc1 from the sealed snapshot
(decided-by-watchdog).** RELEASE-INPUT-ID
`ee8d38e0d63a6d22fc87b89a8c8ccaef0965122ce54f51f99e3d7e4e87eef1a7`:
- library tsc: 0 errors;
- spec: 391 files, 2,888 passed, 0 skipped;
- junk-token: 8/8 + 8/8;
- scripts: 63 passed and 16 skipped. All 16 skips need dist and are OWED at
  the pack step; they are recorded as owed, not as passed.

The two harness incidents are no-result attempts.
[run](/Users/a.kott/vanguard-verify/logs/release-input.LNWhSP/run/summary.txt)

The candidate pack is built from the sealed snapshot, not from a commit.
Label `rc1-ee8d38e0d63a`. It is provisional: it becomes the candidate for
commit X only if manifest(X) == RELEASE-INPUT-ID. No commit, tag or push.
Order: (1) the 35-file coverage gate on the snapshot; (2) one guarded package.sh
pack with every §36.49/§36.50 exact-artifact check plus V2's AIOrb wrong-pack
pre-check; (3) gates.sh is not run for a verdict; the static gate stays rc1's
one open gate (warnings, blocked on the user's two lint answers); (4) hand
off to V1 and V2. CPU queue: B, then A, then V2. Rule 13 is strict; stop if
memory drops below 25%.

**FINDING 3: animated Text first frame (decided-by-watchdog).** 768ca96 put
the react-spring word animation behind React.lazy + Suspense with a
first-frame fallback. The measured regression is that the first-commit word spans are
replaced by new spans (about 9 ms in Chromium) and the fade starts about 5–17 ms
later. Over a real network the chunk fetch adds latency that a local run cannot
show. .472 fades the same nodes in at once. CORRECTION (V2 Chromium, H24
positive control, locally served chunks): there is NO 300 ms plateau. The
~310–340 ms figure was B's jsdom reading. The "React Suspense
FALLBACK_THROTTLE_MS = 300" mechanism was an attribution that a browser did not
reproduce. The commit message of 101f5bc overstates it; it is not amended. Decision: option 1,
revert the lazy boundary. "As few visual changes as possible" is a hard limit
and outranks a D10 saving. Under D10: "lazy split of the word animation
withdrawn; a non-Suspense design is a next-step proposal, not this major."
Test change APPROVED. Cases 1 and 2 of `_Text.animateWords.lazy.spec.tsx`
were added by 768ca96 itself. They assert the design being withdrawn (the
animation module is not loaded for plain Text; the fallback equals the first
frame), which is an implementation choice, not a behaviour .472 has. The
revert makes both false or unbuildable. The behaviour they stood for is
replaced by a stricter contract derived from .472, in
`_Text.animateWords.first-frame.spec.tsx`. Case 3 moves byte-for-byte to
`_Text.animateWords.spec.tsx`; only the file name and describe title change.
Its final DOM must stay byte-identical. The deletion goes in the same change
as the revert, and the removed wrapper's biome-ignore goes with it.

**FINDING 3 fixed locally, test first.** 768ca96 is reverted for Text only:
- `Text.tsx` and `text-animate-words-style.tsx` match the pre-768ca96 bytes
  exactly;
- `text-animated-words-lazy.tsx` is deleted, together with its biome-ignore.
  Suppressions in src go from 9 to 8.

Kept from 768ca96, since independent: `Text.types.tsx` imports
`TextAnimationProps` with `import type`, which has no runtime effect. B's
thread log entry stays as history.

RED on the current tree, admitted run: `sameNodesSettle: false`, meaning the
first-commit spans are replaced. `settledInsideWindow` stayed true under fake
timers. In jsdom real time, case 3 took 330 ms on the lazy tree and 40 ms
after the fix (a jsdom reading; see the Chromium correction above). An earlier run without Rule 13 admission
is preserved as `red.unadmitted.log`.

GREEN: Text 4 files, 9/9. Case 3 moves byte-for-byte to
`_Text.animateWords.spec.tsx`. Its pinned final DOM has SHA-256
`2a3d04e154d79e09f7ff9b63f3583864b271e87ce5fbb65354f1bd6fef44eb36`
before and after. The moved file keeps the original's unformatted `WRAP`
line, so biome would only re-wrap that line.

The restored files' 8 warnings are all master-baseline identities at
multiplicity 1, so 0 excess.

Bundle cost, honestly: Text's eager closure returns to roughly B's pre-split
86.9 KB gzip, up from 61.9. B's later paired measurement puts the cost at
~19 KB. Link, Alert and Button return the same way. The exact eager numbers
come with the rc1 pack.

D10: "lazy split of the word animation withdrawn; a non-Suspense design is a
next-step proposal, not this major."

Commit-plan row 12 (after row 10): `fix(text): render the word animation
eagerly again`. Paths: `Text.tsx`, `text-animate-words-style.tsx`,
D `text-animated-words-lazy.tsx`, D `_Text.animateWords.lazy.spec.tsx`
(cases 1 and 2 removed with watchdog approval, case 3 moved),
`_Text.animateWords.spec.tsx`, `_Text.animateWords.first-frame.spec.tsx`.
Status: SV.
[evidence](/Users/a.kott/vanguard-verify/logs/text-animate-words-eager.noindex/)

**USER DECISIONS 2026-11-23 (relayed by the watchdog).**
- U1 COMMITS: "yes you can commit but make sure it's on a branch separate from
  any other code". Commit only on `feature/ui-sdk-architecture-investigation`,
  with no push, tag or merge.
- U2 LINT GATE: "yes, but config changes if really needed, no errors on
  handover". Approved: (a) the SHA-pinned copy budget for frozen-reference
  identities; (b) the 12 justified `biome-ignore` comments covering 14
  occurrences. The Biome config, lint scope and baseline stay untouched.
- U3 VERIFICATION POLICY: "do cheap ones and expand, don't do full
  verifications on any small change". Per fix: targeted specs for the
  component and its direct dependents, plus one focused browser check only
  when the change is visual. Per candidate: one full spec + scripts run, one
  coverage gate, one pack. Verifiers start focused on what changed since the
  last verified pack and expand afterwards; Tier C, the paired full units and
  Tier P run once, on the final candidate.

HARD LIMIT restated: NO database access of any kind (no read, no write, no
bin/console, no PHP, no SQL, no backend). This work is frontend only.

**U2 applied.**
(a) The alias block in `compare-clean-biome.cjs` and
`baseline/master-ts7/frozen-reference-aliases.json` (B's draft: 10 aliases,
34 identities). All 10 frozen SHAs match and all 34 have a master budget.
Unit checks on the compare tool:
- the alias applies → exit 0;
- a changed frozen SHA → "alias void", exit 1;
- a missing master budget → throws;
- control without the alias file → introduced.

(b) 12 comments for 14 occurrences, applied after the mechanical patch and
`[load]`, with B's texts placed by content anchor. Comments 8 (Breadcrumbs
separator) and 12 (Slider thumb) first reported `suppressions/unused`, so they
use B's documented fallback directly above the `key=` attribute, with the
same text. Scoped lint on the 8 files goes from 22 to 8 warnings: exactly the
14 targeted occurrences gone, 0 new diagnostics, 0 unused suppressions,
0 errors. Emitted JS is byte-identical for all 8 files under the build's
minify and under whitespace-only minify. A plain transform keeps statement
comments in three JSX files, but the difference is comment text only.

Full `biome lint src` through the patched compare tool: 0 errors, 823
warnings, 0 introduced identities. This is a prediction for the static
gate's lint lane, not the gate itself. `biome-ignore` comments in src:
8 → 20.
[evidence](/Users/a.kott/vanguard-verify/logs/lint-u2.noindex/)

**rc1 sequence after the commit series (2026-11-23).**
- Step 3: path (A). A verified the user's own message in the watchdog
  thread (position 12772) and committed the 14-group series as 9ba4da5 …
  9a37342 on `feature/ui-sdk-architecture-investigation`. The committed tree
  manifest equals RELEASE-INPUT-ID-3 `a44344e6…`. No push, tag or trailer;
  the parked spec stays unstaged.
- ID-3 full run green. STATIC GATE GREEN at 02:50, the first canonical PASS.
- Coverage RED on ID-3, two causes:
  1. `_ActionBarRoot.observers.spec.tsx` asserted that the H21 preload was
     installed, so it failed in any plain run. The 3 assertions and 2 imports
     were removed with approval (16358c1d) → ID-4 `d6a518b8…`.
  2. Transport: the storybook project ignored the root `--browser.api.port`
     and used Vitest's `defaultBrowserPort` 63315, which the sandbox denies.
     Fixed with a harness-only config copy adding `api: { port: 6031, host:
     '127.0.0.1', strictPort: true }`; the sandbox is unchanged.
- Coverage on ID-4: thresholds 35/35 met with both projects (99.25% lines,
  96.25% branches), but 4 story tests red.
- CLASSIFICATION (decided-by-watchdog):
  - Slider parity is (i)+(ii). It is green alone and red after
    `_DateFieldComputedParity` on both ID-4 and e90441d, with the identical
    diff: the MUI thumb/track in hover colour.
  - The Autocomplete gate failure is (ii), the same leak.
  - Mechanism: `_DateFieldComputedParity` moves the real Playwright mouse
    (`vitest/browser` page click). The next story file measures a real
    `:hover` on the MUI pane, and synthetic events cannot recover it.
  - Not a product regression.
  - Autofill flake, Rule 5 distribution of 20 fresh-browser runs per tree:
    ID-4 0/20 (median 136.5 ms, p90 146), e90441d 0/20 (median 137, p90 147).
    It is a pre-existing rare reference-pane race; lazy-fallback is not
    implicated.
- Fix 63de883f: `parkPointer()` hovers a fixed, topmost neutral element
  before every rest-state read in both parity stories, the same for both
  panes. The Autofill waitFor gets an explicit 3 s ceiling. No assertion
  changed and no file excluded. Targeted on the fixed tree: DateField→Slider
  9/9, DateField→Autocomplete 11/11, each file alone green. The ID-4 control
  reproduced the failure (2 failed). The commit body has 3 lines of 102–105
  characters (commitlint allows 100); hooks are not installed and nothing is
  amended.
- Follow-up proposal, not for rc1: a single real-pointer reset in
  `.storybook/vitest.setup.ts` (beforeEach). It costs about one hover per
  story test (~10–30 s per storybook run). No story relies on hover carried
  over from another file.
- RELEASE-INPUT-ID-5
  `704c3717c90fd0fb3ea5b7dc92319f2dc320d6ee658c446c42d3ac71d1bcc554` is
  commit 63de883f. Delta vs ID-4: the 2 story files.

**rc1 CUT (2026-11-23 04:04).** Pack `rc1-704c3717c90f.tgz`, SHA-256
`c613eb237b33ccc196c43f4e1fea18cdb0aa349ec6b002d8a530160e5f638c8b`, built from
RELEASE-INPUT-ID-5 = commit 63de883f.

| Gate | Result |
|---|---|
| Static | GREEN (on ID-3; ID-4 and ID-5 add test and story deltas only) |
| Coverage | GREEN with both projects; 35/35 at ≥95% lines and ≥85% branches |
| Package | GREEN: spec 2,887; scripts 79/79 (16 dist tests ran); consumers 156/156 on react 19.2.0, react-redux 9.3.1, RTK 2.13.0; fallback 22/22; WP 0 missing; eager MUI 22/298 +1; dist identity 4,038 |
| Dual-suffix emitted audit | GREEN |
| AIOrb wrong-pack check | 0/0, with the H24 control firing |

Declaration deltas vs H24: the 8 `.reference.d.ts` files, plus the lazy Text
wrapper `.d.ts` and its `AnimatedWords` default (neither in .472). CSS delta:
the AIOrb rule move only. Text's eager closure is 84.5 KB gzip.

Redux majors at rc-webapp HEAD 3018e8d9c5a: the peers are satisfied; there are
no removed RTK 2 / react-redux 9 APIs in src (the two hits are byte-identical
to master).

Handed to V1 and V2 in §4 format with the 55-path changed-file list vs
e90441d. The slot is back with V2. Static gate: GREEN. Commit: done.
[artifact checks](/Users/a.kott/vanguard-verify/logs/rc1-704c3717c90f.noindex/artifact-checks.json) ·
[changed files](/Users/a.kott/vanguard-verify/logs/rc1-704c3717c90f.noindex/changed-vs-h24-e90441d.tsv)

## USER HANDOVER DRAFT: rc1 (2026-11-23, written by implementer A, verdicts pending)

**Verdicts so far.** B's paired WordPress smoke PASSED (76 paired green, 0 findings; Text settles in
25 ms without node replacement). V2's focused Chromium check PASSED (wrong-pack 0/0, D6 all
profiles MATCH, host collision PASS in both orders, Text first frame 2/2). V1's focused check PASSED on rc-webapp HEAD 3018e8d (all groups, no candidate-only finding; text
first word visible after 8–42 ms vs .472 6–36 ms). V2's HEAD count lanes: no leak on 9 lanes.

**FINAL CANDIDATE (supersedes rc1 for release).** `/Users/a.kott/vanguard-verify/packs/final-56fde55967ba.tgz`,
SHA-256 `5a8ba1b986ee34f95283dfd7704799f8c52c0632f9426a3c6fd67d7e6e402e83`, commit 76dff3f6, RELEASE-INPUT-ID-7
`56fde55967ba6b6ce13bcecb2d0d4ba2a67cff414ed99cf5c75f204e26416943`. The only source differences from rc1 are the docs
generator, README and one spec comment. Gates on it: scripts 79, static GREEN, storybook GREEN, package GREEN,
audits GREEN. Coverage carries over from rc1, because src is identical apart from that spec comment.
Build is not byte-reproducible (chunk numbering, one hoisted import). Compared with rc1, dist-wordpress, all CSS
and all .d.ts are byte-identical. In dist/ ESM, about 180 files differ only by the numbering of same-named shared
chunks: after normalizing the suffixes, 2,636 of 2,637 JS files are identical. The one remaining difference is
htmlparser2's Parser chunk, where rc1 carries a redundant bare `import "./index-decode.js"` and a different
minified class name. decode is byte-identical and still evaluates once before Parser through the Tokenizer
import. Tier C, the paired units and Tier P run on this final pack.

**Next cut commits (on 76dff3f6, 2026-11-23, owner go).**
1. c04e22e0 fix(drawer): bound the drawer channel replay and unsubscribe DrawerRoot on unmount
2. 2925f005 test(drawer): guard story for drawer portal release
3. e38a48e5 test(date-picker): keep a slow shell differential test from breaking the rest of the file
4. dd65757c fix(date-field): MUI X child order and outlined input class
5. 6a4e95a5 fix(date-picker): MUI X open, close and focus transitions
6. 9fba35ef chore(build): deterministic chunk numbering and no build timestamp
7. the docs commit (plan log, hand-over draft, KNOWN-ISSUES.md; hash in the cut report).
The field's mousedown section resolver landed in dd65757c (staging slip).

**Build determinism (next cut, decided-by-watchdog 2026-11-23; prepared, not yet applied).** From the next cut, two
builds of the same input are byte-identical in dist/ and dist-wordpress/. Same-named chunks are numbered by a fixed
rule (first-party module first, then by module id) instead of build order. `vanguard-asset-analysis.json` carries a
`timestamp` only when the build sets `SOURCE_DATE_EPOCH`. File names change only where they collided before:

| Group | Module | Today (build-order dependent) | Next cut |
|---|---|---|---|
| Arrow | own Arrow component | `index-Arrow.js` | `index-Arrow.js` |
| Arrow | @popperjs/core arrow modifier | `index-arrow2.js` | `index-arrow2.js` |
| classNames | own `helpers/classNames` | `index-classNames.js` | `index-classNames.js` |
| classNames | npm `classnames` | `index-classnames2.js` | `index-classnames2.js` |
| Popper | own primitives Popper | `index-Popper.js` | `index-Popper.js` |
| Popper | MUI Popper | `index-Popper2.js` | `index-Popper2.js` |
| Popper | @popperjs/core popper | `index-popper3.js` | `index-popper3.js` |
| Transition | own `core/transition` helpers | `index-transition.js` or `index-transition2.js` | `index-transition.js` |
| Transition | own primitives Transition | `index-Transition2.js` or `index-Transition.js` | `index-Transition2.js` |
| Transition | react-transition-group Transition | `index-Transition3.js` | `index-Transition3.js` |
| Ripple | MUI ButtonBase Ripple | `index-Ripple.js` | **`index-Ripple2.js`** |
| Ripple | own `primitives/core/ripple` | `index-ripple2.js` | **`index-ripple.js`** |

No consumer imports any of these files directly: rc-webapp `html/react/src` and `nexus`, and the package fixture,
have 0 hits. The release identity also changes scheme with that cut: `agentic-plans/*.md` (plan, logs, hand-overs)
no longer count, so ID-7 and the next ID cannot be compared by manifest hash. Both hashes of the unchanged shipped
set are given once at that cut.

**Test infrastructure (next cut).** `vitest.config.ts` gains five `@mui/x-date-pickers` entries in the Storybook
project's `optimizeDeps.include`. This is the test runner's dependency pre-bundle list, not a product change: the
new DatePicker open/close parity story imports the frozen MUI X reference, and without them Vite re-optimises
mid-run and loads a second React. `_DatePickerShell.differential.spec.tsx` runs with a 15 s test timeout for the
same reason class (a timeout inside an async act() scope breaks the rest of the file).

**What it is.** `@rankingcoach/vanguard@2.11.0` (version not bumped), built
from commit 63de883f on `feature/ui-sdk-architecture-investigation`.
- Pack: `/Users/a.kott/vanguard-verify/packs/rc1-704c3717c90f.tgz`,
  SHA-256 `c613eb237b33ccc196c43f4e1fea18cdb0aa349ec6b002d8a530160e5f638c8b`.
- Release input ID-5:
  `704c3717c90fd0fb3ea5b7dc92319f2dc320d6ee658c446c42d3ac71d1bcc554`.
- Gates: static GREEN, coverage GREEN (spec + storybook, 35/35), package
  GREEN (4 consumers 156/156 on react 19.2.0, react-redux 9.3.1,
  RTK 2.13.0).
- Status: provisional until V1/V2 focused verdicts; then Tier C, the paired
  full units, Tier P and WordPress run once on the final candidate.

**Install (consumer, e.g. rc-webapp `html/react`).**
`pnpm add /Users/a.kott/vanguard-verify/packs/rc1-704c3717c90f.tgz` (or
`npm install <path>`). Check the hash first:
`shasum -a 256 <path>` must print `c613eb23…c8b`. The WordPress bundle is in
the same tarball under `dist-wordpress/`.

**rc1 vs .472, as a consumer sees it.**
1. Most MUI-based components now render on Vanguard's own core: 29 of 31
   are verified. They keep the same public props and the same MUI class
   names. Emotion is not used for migrated components, so their CSS comes
   from `vanguard.css`.
2. Declared visual and behaviour deltas:
   - AIOrb no longer writes `--container-size`, `--color1/2/3` or its
     derived variables onto `<html>`. Vanguard's stylesheet no longer defines
     them on `:root`; they live on `.ai-orb`. Two orbs of different sizes now
     each render correctly, and a resize updates. A host stylesheet
     `:root{--container-size:…}` no longer resizes the orb's inner circles.
     rc-webapp reads none of these names.
   - `sx` on the migrated components applies only flat style objects (D5).
     Theme callbacks, arrays, nested selectors, breakpoints and spacing
     shorthands are ignored with a dev warning. rc-webapp has 0 such uses.
   - The masked DateRangePicker adornment no longer carries the generated
     `css-…-MuiInputAdornment-root` Emotion class (H21).
   - ToggleButtonGroup arrow-key roving ignores events whose target isn't a
     roving item (D6; no visual impact).
   - Animated Text (`animateWords`) behaves as on .472 again: the first-frame
     word spans animate in place. The withdrawn lazy split replaced them with
     new spans and started the fade later; over a real network the chunk
     fetch would add more. react-spring is back in Text's eager graph
     (84.5 KB gzip).
3. Subpath exports: rc1's `exports` map EQUALS .472's (`.`, `./style.css`,
   `./dist/*`, `./package.json`; checked by B against the packed manifests).
   The four wildcard subpaths `./core/*`, `./common/*`, `./components/*` and
   `./helpers/*` stay absent (D12, user-confirmed 2026-11-19). They exist
   only in the master 2.11.0 manifest, which predates the MUI update, so a
   .472 consumer loses nothing.
   `.`, `./style.css` and `./dist/*` stay, including
   `dist/index-OverlayStackingService.js`, the ModalSplitView types,
   `dist/index-es.js` and the `dist/index-<File>.js` naming.
4. Peer ranges: react and react-dom `>=19.2.0`, react-redux `>=7.2.6`,
   @reduxjs/toolkit `>=1.7.1`. rc-webapp HEAD 3018e8d9c5a (19.2.0, 9.3.1,
   2.14.0) satisfies them, and Vanguard src uses no API removed in RTK 2 or
   react-redux 9.

**Declared cost delta (React commits per interaction, V2 HEAD lanes).** Lower than .472 on select
(11→8), datepicker (16→11) and textarea (6→4). About one higher on pagination (11.1→12.8),
dropdown-file (13→14) and dropdown-cover (10→11). No leak and no visible difference; follow-ups below.

**Still yours to decide or check (open items).**
1. FormControl stays on the existing public MUI implementation through its
   lazy fallback (compatibility rule §36.10/§36.30). It is not ported and
   has 0 known production call sites.
2. Theme-provider / TextField bridge: the TextField route and
   VanguardThemeProvider stay eager (§36.10). A future ESM split needs dynamic
   forwarding, external WordPress props, theme defaults and the cold
   unsupported-inner control first.
3. DatePicker locale format table (dash vs underscore keys): pre-existing,
   unchanged, locked by `_locale-date-pattern.bug-lock.spec.ts`. Keep or fix.
4. Before release, check `<head>` CSS order in the built rc-webapp (13 tie
   rules), the pages that import `style.css` statically, and the WordPress
   enqueue order (theme CSS after `vanguard.css` wins ties).
5. Whether the WordPress plugin passes fallback props to
   Autocomplete/Input/Select/Textarea.
6. The .472 nested-calendar hit-test for DatePicker has no qualified pair
   yet.
7. The parked `_TextFieldV9Compatibility.spec.tsx` edit stays local; revisit
   after the release.
8. A docs commit with this plan log is pending. The plan is part of the
   release input, so it waits until the verdicts are in.

**Next-major list (not in this release).** Remove `@mui/material` and the
remaining fallback props, together with the RtlProvider allow-list and RTL
routing. Do the Redux exit (D9): the peers react-redux and RTK stay for now.
Implement the real-pointer reset in the storybook test setup (proposal).
Ship a non-Suspense design for the Text word-animation split (D10).
Follow-up (C): make the ESM build byte-reproducible. Rollup chunk numbering of same-named shared chunks and
one hoisted side-effect import differ between builds of identical source (check `output.hoistTransitiveImports`
and deterministic chunk naming).
Follow-ups (cost only): find the source of the +1 commit on DropdownMenu with a Chromium React profiling run;
consider handing Pagination focus over in the click handler instead of the layout effect (PG1 contract).

**Commits on top of 55dc611 (16).**
1. 9ba4da5 feat(date-picker): own field, shell and calendar (MUI X adapted, MIT credited)
2. 4c9ad36 fix(searchable-select): own caret glyph and focus behaviour
3. 84d0cad chore(types): frozen reference fixtures out of the declaration build
4. f0f8db6 fix(lazy-fallback): one suspension helper across split routes
5. 2fede38 fix(click-away): forwarded ref assigned before listeners attach
6. 3412a43 test: fixture typing and frozen-reference setup
7. cf1d194 refactor: three mechanical lint findings (Form, Table, InlineSvg)
8. d7d1a9d fix(action-bar): root observers unsubscribed on unmount
9. 068687a fix(ai-orb): orb variables scoped to the orb element
10. 62bf3e4 fix(inline-svg): mount effect depends on the stable load callback
11. 101f5bc fix(text): word animation eager again (no node replacement or delayed start; its message overstates a 300 ms gap)
12. a10e7df chore(gates): master lint budgets copied to sha-pinned frozen references
13. 0f92685 chore(lint): 12 justified suppressions for 14 MUI-parity findings
14. 9a37342 chore(vanguard): rebuild verification log
15. 16358c1d test(action-bar): network self-check kept out of the observer spec
16. 63de883f test(parity): real pointer parked before rest-state reads

**Final cut after V1 (decided-by-watchdog, 2026-11-23).** One final cut follows
V1's verdict even if V1 passes, because rc1 ships wrong agent docs. B found:
- 27 component pages claiming "still renders MUI internally" (18 false,
  9 imprecise);
- DatePicker's DOM contract missing date-field and date-calendar;
- 3 README errors: package name, peers, postinstall description.

Final cut = rc1 plus only:
- B's generator/README patch;
- the first-frame spec header comment;
- the plan log and handover draft;
- targeted fixes for any V1 finding.

It is prepared offline and not committed or gated until V1's verdict is in.
Acceptance without re-verification, if no runtime fix is needed: the final
pack's `dist`/`dist-wordpress` JS, CSS and `.d.ts` are byte-identical to rc1
per file; only `docs/`, `skills/`, README and `llms.txt` may differ. Then one
static gate, one spec run and one pack. Coverage is not repeated if src is
byte-identical outside spec-file comments. A reviews B's patch against the
source first, including the 9 imprecise notes.

**Final-cut preparation, uncommitted (A, 2026-11-23).** B's agent-surface patch
is applied to the working tree (`scripts/generate-agent-docs.mjs`,
`README.md`). A reviewed the 9 "imprecise" notes against rc1 source 63de883f:
7 match (AppBar, Toolbar, ProgressBar, Snackbar, Popover, Autocomplete, Menu)
and 2 are corrected.
- InputBase: a custom `inputComponent` is own core, ported in H21/H22 and not
  in `OWN_TEXT_FALLBACK_INPUT_KEYS`. The fallback triggers are
  filled/standard variants, a native select, MUI
  `classes`/`slots`/`sx`/`inputProps` on the input, and function-valued slot
  props.
- FormControl: Vanguard's FormControl is NOT exported by the WordPress entry.
  The MUI FormControl modules in the WP graph are MUI internals of its
  TextField. B's note said "inline in WordPress".

The first-frame spec header comment is corrected (comment only). The handover
D12 line is corrected: rc1's `exports` map equals .472's. Waiting for B's two
missing pages (VanguardStyle, lottieAnimation) and V1's verdict before any
commit, gate or pack.
Update: B's patch v2 (205 lines, which adds the VanguardStyle and
lottieAnimation pages) replaces v1. It was re-applied from the HEAD blobs
with A's two corrections; both new pages match the source exports.
[prep evidence](/Users/a.kott/vanguard-verify/logs/final-cut-prep.noindex/)

**rc1 focused verdicts: all PASS (2026-11-23).** B's WordPress smoke (jsdom), V2 focused (Chromium
D6, Text first frame, wrong-pack), V2's HEAD count lanes (9, no leak) and V1 focused (rc-webapp
HEAD 3018e8d, all groups, no candidate-only finding). GO for the final cut with no runtime
change (decided-by-watchdog).

**+1 commit analysis (no src change; jsdom Profiler, a temporary spec that is archived).**
- Pagination next/prev cycle: own `[5,6]` vs MUI reference `[4,4]` commits per click pair.
  A bare ButtonBase click is equal (own 2 = MUI 2), so it is not ripple or focus-visible.
  Direct page-2/page-1 clicks are equal (`[5,5]` both). The extra appears only when the
  clicked Previous button becomes disabled: Pagination's focus hand-over layout effect
  (`Pagination.tsx:158-166`) moves focus to the `aria-current` page. That costs
  focus-state commits, and the next page-2 click blurs that button for one more. The end
  focus target matches MUI, as pinned by `_pagination-parity.spec.tsx` click and keyboard
  timelines.
  Inherent to the current hand-over implementation, not a leak. A cheaper path (hand over
  in the click handler without the extra layout-effect pass) would touch the PG1 focus
  contract, so it is a follow-up, not low-risk for this cut.
- DropdownMenu: jsdom shows own FEWER (`[4,6]` vs master `[4,7]`), so V2's browser +1 is not
  reproducible without real layout and timing. The candidates are OwnPopper's
  `setPlacement` after a real flip, and own Fade/Transition timing vs
  react-transition-group. Follow-up: attribute with a Chromium React profiling run on the
  FileCard story.
- Both are recorded as a declared cost delta in the handover, not fixed.
  [evidence](/Users/a.kott/vanguard-verify/logs/commit-profile.noindex/)

**V1 note confirmed from source.** Slider (2 `biome-ignore` comments) and Table (local
`valueOf` → `getSortValue`, 2 lines) differ from the H24 source only by lint changes;
Breadcrumbs and Pagination by comments only. Correction: the library build keeps these
comments in dist, so the "emitted JS identical" check, done under minify, did not model the
real dist bytes. Screens match .472.

**Final cut decision (decided-by-watchdog): option (A), with (C) as a follow-up.**
`final-56fde55967ba.tgz` (SHA-256 `5a8ba1b9…`) is THE candidate.
- The byte-identity rule assumed a reproducible build, and the build is not
  reproducible. Option (B) would have shipped an artifact no gate built.
- Carry-over: dist-wordpress, CSS and `.d.ts` are byte-identical, so B's WP
  smoke and V2's D6/Text WordPress legs carry over as they are.
- Under chunk-name normalization, V1's focused pass and V2's 9 count lanes on
  rc1 carry over only as interim evidence. Tier C exercises the final pack's
  ESM in full.
- Evidence:
  - `index-decode.js` is byte-identical in both packs. Its top level runs 4
    TS-enum IIFEs and `o(R); o(_);`, building local decoders only.
  - In the final pack, `index-Parser.js:1` → `index-Tokenizer.js:1` → `index-decode.js`.
  - Parser binds nothing from decode, and rc1's extra import was bare.
- The final-cut fix on the way: `76dff3f6` keeps the `src/` path out of the
  VanguardStyle page.
[pack-vs-pack](/Users/a.kott/vanguard-verify/logs/final-56fde55967ba.noindex/pack-vs-pack.json)

**Drawer leak (Tier P V2), decided-by-watchdog 2026-11-23.**
- V2's CDP probe attributes one retained portal per cycle to a Blink pending
  CSSTransition:
  - Escape path on both builds: the backdrop fade;
  - unmount-while-closing path on FINAL only: the own paper's slide.
- A's reproduction attempts:
  - jsdom: Escape, remount and closeLast paths, with forced GC;
  - Vitest-browser Chromium with `--expose-gc`: WeakRef + GC, 20 cycles per path.
- Both stay bounded (≤ 2 reachable) on the unfixed tree, and `transitioncancel` is dispatched at removal.
  The watchdog treats CDP observer retention as a live hypothesis; V2 runs a no-CDP control.
- Fix B (cancel the portal-root animations at detach in ModalHost) is HELD until then.
  The FINAL "not shippable" verdict is withdrawn to "on hold".
- C applied in the working tree, test-first, uncommitted:
  - drawer channels replay 1 (`pub-sub.ts` `REPLAY_LIMIT`);
  - DrawerRoot keeps both Subscriptions, unsubscribes on unmount, and unregisters its ledger entry if
    unmounted while open.
- RED → GREEN:
  - `_DrawerRoot.retention.spec.tsx` payload growth 8 → 0;
  - `_DrawerRoot.lifecycle.spec.tsx` observers `[6,6]` → stable, and the ledger slot is freed;
  - the late-mount convergence guard is green before and after.
- Targeted: 50 files, 570/570.
- Guard story `_DrawerRootTransitionRelease.stories.tsx`: 2×10 Escape and 20 remount cycles, ≤ 2 reachable
  under GC. The check is skipped when `window.gc` is absent, i.e. in the ordinary storybook project.
[evidence](/Users/a.kott/vanguard-verify/logs/drawer-leak-tdd.noindex/)

### Drawer leak: trusted-input finding and watchdog decisions (2026-11-23)

- Fix B (ModalHost animation cancel at detach) refuted by V2 E1; removed, patch kept as
  `drawer-leak-tdd.noindex/fix-B-modalhost-animation-cancel.REFUTED-by-V2-E1.patch`.
- Fix C (drawer channels replay 1, DrawerRoot unsubscribes + frees ledger slot) works structurally
  (V2: buffers 1, observers 1) but does not change portal retention; kept as a hygiene fix.
- Repo-harness RED (expose-gc Chromium, WeakRef+gc): a single autoFocus Input drawer leaks one portal
  per cycle after TRUSTED input (Playwright hover over the portal, or a trusted Escape key); synthetic
  events with identical focus/selection stay bounded. Same for the MUI 9.5 reference drawer on every
  path (Escape, close-then-unmount, unmount-while-open). Real input elsewhere + 2 s idle does not
  release it; a running page animation neither prevents nor releases it.
- decided-by-watchdog D1: the Escape cell is NOT waived (pre-existing in .472, in production); it does
  not gate the order of work — the FINAL-only remount cell goes first.
- decided-by-watchdog D2: use the repo RED oracle; existence proof against the MUI reference
  (result: MUI leaks the same, so no own-vs-MUI imitation target in this harness); lifetime test
  (result: true leak).
- decided-by-watchdog D3: report after each experiment set; no src commit until a change is GREEN in
  the repo harness AND on V2's oracle.
- Open: why .472 remount = 0 on V2's oracle (MUI version shipped by .472, or no user activation in
  those cells). Evidence: `story-parity-diag.noindex/drawer-{content-bisect,dist-bisect,focus-diag,own-vs-mui}-*`.
- CORRECTION (same day, null controls N1–N5): the hover-based REDs above were a Playwright/Vitest
  tooling artifact (`userEvent.hover(el)` retains even a plain-DOM div; a raw-CDP mouse move does not).
  Re-measured with raw-CDP Escape: plain DOM 1, bare React portal 1, direct Drawer host (own or MUI) 1–2.
  Repo-harness leaking shape: DrawerRoot remounted per cycle + per-cycle opener effect calling
  DrawerService.open + Escape close (synthetic suffices) → 8/8, also with a production React build, and
  equally for a DrawerRoot copy rendering the MUI 9.5 reference drawer. Focus, the opener's second close
  and trusted input are not factors. V2's oracle instead shows .472 0/0/0 vs FINAL 10/10/9 on the
  cleanup path and a direct own `<Drawer open>` unmounted while open = 10/10, so the two harnesses
  reproduce different shapes; next step is heap retainer paths (V2) before any fix.
- RETRACTION (same day): the repo-harness "DrawerService path leaks 8–10/10" results (dev and prod React,
  own and MUI mini roots, trusted and synthetic Escape, and every focus-diag cell built on that harness)
  were a harness bug: the remounted root and the per-cycle opener were sibling elements keyed by the same
  counter, React warned "two children with the same key", never deleted the old roots (cleanup count 0),
  and their pub-sub close subscriptions pinned the old portals (heap path: PubSubService close
  ReplaySubject observers → dispatch closure → dead fiber → ModalHost modalRef → portal). With unique keys
  the same cell is bounded (real root 1, MUI 2). Valid product evidence is V2's oracle only: direct
  `<Drawer open>` + autofocused Input, FINAL remount 10 / Escape 11, .472 remount 0 / Escape 10, retainer
  Pending activities → CSSTransition. Lesson: check harness stderr for React key warnings.
- rules v2026-11-23 adopted (owner-approved VERIFICATION-RULES.md, rc-webapp tmp/research/vanguard-ui-sdk-visual-baseline):
  evidence labels single-source/confirmed/refuted on every result; harness admission (known-bad fails,
  known-good passes, zero console errors/React warnings, non-zero exit gates); gate ports via gate-lock.sh;
  retainer paths before toggles; no fix before the mechanism is shown in the page.
- REFUTED (V2 E3–E7, single-source): "a cancelled transition's queued transitioncancel is never dispatched".
  At removal getAnimations is empty, transitioncancel never fires, cancel/finish/transition-none hooks do not
  release the portal. Holder stays Blink pending activity → CSSTransition → KeyframeEffect (V2 retainer).
- Harness console trap admitted (known-bad fails, known-good passes, runner exit 1): diag-run-trap.sh.
- 4a manifest scope proposal: drop agentic-plans/*.md at depth 1 (32 paths, nothing else); 4b ESM chunk
  determinism: cause = preserveModules basename collisions (355 suffixed names, order-dependent); draft 1
  makes the file set identical but leaves 57 _virtual-reference diffs and renames 480 files (not acceptable).
- decided-by-watchdog (4a): manifest-v2 APPROVED for the next cut, applied with that cut only; its hand-over
  states the identity scheme changed (ID-7 vs next ID not comparable by manifest hash; give both hashes for
  the unchanged shipped set once).
- decided-by-watchdog (4b): one more bounded iteration; acceptance = dist and dist-wordpress byte-identical
  over two builds, zero renames among today's unsuffixed names, package-gate consumers and D12 fixture
  untouched; otherwise cause + proposal go to the follow-up list. Nothing applied without config-diff review.
- decided-by-watchdog (5): drawer transition direction closed; no further drawer work from A until V2
  reports the production run and heap facts.
- 4b iteration 2 result (snapshot only, not applied; awaiting watchdog config-diff review): post-render renumbering of
  colliding chunks by sorted module id, grouped case-insensitively (Rollup dedups case-insensitively), plus
  asset-analyzer timestamp only under SOURCE_DATE_EPOCH → two lib builds byte-identical (3450 files, 0 diffs) and
  two dist-wordpress builds byte-identical (584 files, 0 diffs). Name changes vs today: only the 4 case-collision
  groups (Arrow/arrow, classNames/classnames, Popper/popper, Transition/transition; 8 names). D12 fixture names
  (index-Button.js, index-OverlayStackingService.js) unchanged. Diffs: chunk-determinism-4b.noindex/config-iter2b.diff,
  asset-analyzer.diff.
- decided-by-watchdog (4b): deterministic-build change ACCEPTED for the next cut with conditions (a) no consumer
  deep-imports of the case-collision names, (b) before/after module map in the hand-over, (c) no reader of the
  asset-analysis timestamp, (d) package gate + D12 + two-build comparison at the cut. (a) and (c) done: 0 hits.
  (b) done; proposed first-party-first ranking (config-iter2c.diff): byte-identical, only the Ripple group changes vs
  today (MUI Ripple → index-Ripple2.js, own ripple → index-ripple.js; no consumer); awaiting watchdog nod.
- _DrawerRootContentRelease.stories.tsx: never-admitted (no known-bad); local evidence only, not committed.
- decided-by-watchdog (owner decision): final-56fde55967ba (76dff3f6) FROZEN as the testable build; issues go to
  agentic-plans/KNOWN-ISSUES.md (copied, uncommitted). iter2c approved in place of iter2b. Drawer retention now
  `confirmed` (V2, DEV + production React): pre-existing on Escape, regression on host-unmount.
- Next-cut plan prepared, not run: vanguard-verify/logs/next-cut-plan.noindex (CUT-PLAN.md, cut.sh, commit texts).
- Retention spec gets gc in-file (gates run without --expose-gc); known-bad RED without fix C, GREEN with it.
- BillingExports fieldset 23→0: REFUTED (V1: consumer auto-margin readout + load jitter on both builds).
- 1.12 DateField outlined input (V1 A03 + jsdom differential agree): hidden input precedes the notched fieldset and
  lacks `MuiPickersOutlinedInput-input` (DateField.tsx:406-433, 9ba4da51 oversight; MUI X order fieldset → input).
  No CSS depends on order/class. Fix + 4-state parity spec prepared as patch
  (datefield-outlined-structure.noindex), not applied; DatePickerShell 5 s timing check pending a quiet run.
- DatePicker open/close (V2 behaviour verdict): (a) field click while open and (c) Escape from a section while open
  confirmed (V2 production + jsdom + Chromium differential vs frozen MUI X 9.17); cause DatePickerShell.tsx show()
  early return (:113-114, :212) and Escape only on the popper (:250-260). Fix + jsdom spec + Chromium parity story
  prepared as patch (datepicker-open-close.noindex), not applied. (b) Day-vs-Month focus after Escape from the
  calendar does not reproduce against the in-repo frozen reference in Chromium: single-source (V2).
- Harness: trap config now prebundles @mui/x-date-pickers (root, AdapterMoment, DatePicker, hooks, models).
- decided-by-watchdog: file-level `vi.setConfig({ testTimeout: 15000 })` in _DatePickerShell.differential.spec.tsx
  replaces the per-test timeout and the afterEach idea (mechanism: a timeout inside an async act() scope leaves it
  open; later renders nest and never flush; reproduced 41/42). Follow-up (not this cut): settle() must not be able to
  leave an act scope open (await inside try/finally, or real timers for that test).
- decided-by-watchdog: the five @mui/x-date-pickers optimizeDeps entries in vitest.config.ts join commit 2c
  (test-harness dependency list only; keeps the Chromium open/close parity story, the only focus-target oracle).
- Paired comparison #2 (single-source, load 7–14): HEAD+hygiene 290/290 ×3 vs +1.12+open/close 297/297 ×3,
  0 non-pass, no timeout/cascade, no consistent duration change (datepicker-open-close.noindex/paired-timing-2).
- DatePicker oracle check (single-source, Chromium, dp-pins-1): the in-repo `_DatePicker.mui-reference.tsx` equals
  .472's shipped wrapper (same JSX in dist index-DatePicker.js, same MUI X 9.17 / material 9.5, no consumer theme
  overrides) and reproduces V2's .472 column on day pick, Enter, year-view focus, focus trap and Escape-then-click.
  Own differs there (focus to BODY, no trap, year view focuses the switch). Icon rendered by both (lazy asset).
  Gap = missing differential cases, not a wrong reference.
- Reference check (2): each `*.mui-reference.tsx` diffed against its original source at 9d3b75b (the .472 build
  commit): 16/19 equal apart from imports, export rename, formatting or type-only lint; DateField/DateCalendar
  references are MUI X 9.17 fixtures (no .472 wrapper); Autocomplete and DateRangeInput carry the F3 form binding
  (writeScalar) instead of .472's dispatch(setStateValue) on the formconfig write path (declared F3 delta).
  Evidence: vanguard-verify/logs/reference-vs-472.noindex.

### Transition coverage matrix, own-core overlays and pickers (2026-11-23, decided-by-watchdog lesson: coverage)

Method (single-source, static): pattern scan of each component's `_*.spec.ts(x)` and `_*.stories.tsx` (own core and
its primitives). Cells: ✓ ≥3 matches, · 1–2, — none. A match means the test text names the transition, not that
it is compared against the .472 reference; read it as "where to look", and as a gap list where it shows —.
DatePicker: before the prepared behaviour patch (2c), which adds focus after close, Tab/Shift+Tab and re-open.
V2's behaviour pins for these components get mapped onto this table as they land.

| Component | open: pointer | open: keyboard | close: Escape | close: outside/click-away | close: select/pick | focus on open | focus after close | Tab / Shift+Tab | re-open |
|---|---|---|---|---|---|---|---|---|---|
| Select (4 files) | ✓ | ✓ | ✓ | · | ✓ | · | — | · | — |
| Autocomplete (14 files) | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | · |
| SearchableSelect (6 files) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | — | · |
| Menu (11 files) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| DropdownMenu (3 files) | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | · | — |
| Popover (18 files) | ✓ | — | ✓ | · | — | ✓ | — | · | — |
| Modal (20 files) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | ✓ |
| Drawer (8 files) | ✓ | — | ✓ | ✓ | · | · | ✓ | — | — |
| Pagination (5 files) | ✓ | ✓ | — | — | ✓ | — | — | — | — |
| Breadcrumbs (5 files) | ✓ | · | — | — | — | — | — | — | — |
| DatePicker (21 files) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · | — |
| DateRangePicker (7 files) | ✓ | — | — | ✓ | ✓ | · | — | — | — |
Reference oracles (next to the matrix): 16 `*.mui-reference.tsx` equal the .472 source (9d3b75b); Autocomplete and
DateRangeInput differ by the F3 form binding on the formconfig write path (jsdom check pending);
`_DateField.mui-reference.tsx` and `_DateCalendar.mui-reference.tsx` are MUI X 9.17 fixtures: oracles for MUI X
behaviour, NOT for the .472 Vanguard wrapper (which used them only inside DatePicker).
- F3 write path vs .472 (jsdom, real store): Autocomplete pick / free entry / clear equal (confirmed: F3 binding
  equals .472 dispatch); DateRangeInput incomplete selection equal; complete selection unreachable in jsdom (inputRef
  unattached on both sides), static diff shows only the dispatcher source and the same formconfig object.
- DatePicker re-checks: keyboard year choice reproduced (focus lands on the view switch) and fixed by the year-view
  focus change; Escape from calendar / year view not reproduced from source with V2's fixture (own = frozen, both
  return to the opener section); pending V2's opener log. Behaviour story now 24 cells (15 RED on HEAD, 24/24 fixed).
- DatePicker opener (V2, settled): both builds return focus to the opener section; the difference was the hit target —
  a press on a separator (`sectionAfter`) or the field padding focuses a section in MUI X (useFieldRootProps
  handleMouseDown) and none in the own DateField. Chromium hit-target story 4/4 RED → GREEN with a DateField
  mousedown resolver (separator → its section, padding/blank → first section unless focused, gap → closest by x).
  Folded into 2c (applies on top of 2b; 2a→2b→2c reproduces the tested tree). Full DatePicker + DateRangePicker
  storybook set 76/76 ×2 and jsdom 297/297 with 2a–2c; my stories park the real pointer bottom-right at the end.
- Coverage matrix, declared difference (V2 production, not user-reachable): Select with the listbox open and focus
  moved programmatically to the combobox — own pulls focus back into the list and Escape closes; .472 keeps focus on
  the combobox and Escape does not close. All other V2 behaviour tables (Select, Autocomplete, SearchableSelect, Menu,
  DropdownMenu, Popover hover, PopoverModal, ModalService, Drawer, Pagination, Breadcrumbs) identical across builds.
- Select declared difference, reachability (single-source static, fixture 3018e8d9c5a via git archive): of 97 rc-webapp
  files rendering a Vanguard Select, 1 passes `inputRef` (EditPrimaryCategory, read-only `.value` on save) and 1 has
  focus calls (GoogleAdsPortfolioStrategyCreateModal: form's first input = Name Input, dialog Tab trap, restore), none
  focusing a Select combobox; no reachable caller of the declared cell. Evidence: logs/select-focus-check.noindex.
- Staging slip (2026-11-23, stage 1 of the next cut): DateField.tsx carried both the 2b hunk and 2c's mousedown
  section resolver; staging the whole file put the resolver into dd65757c. decided-by-watchdog (A): no rewrite; 2c
  commits without it and says so. The field's mousedown section resolver landed in dd65757c (staging slip). Rule from
  here: files touched by two planned commits are staged per hunk, and each commit's --stat is checked against its plan.
