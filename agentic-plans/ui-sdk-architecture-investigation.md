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
   rc-webapp passes dash locales (`localeFormatted`), but `getDatePatternFromLocale` is keyed by underscores, so
   every DatePicker shows DD.MM.YYYY and logs a console.error. Fixing the lookup (accepting `-`) would show:

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
   stayed the same size. Popper now updates on a font event when its own layout size changes. The targeted
   recheck is with verifier 1 on `c8e69a2`, pack `pkg-20b`, against `.472`.

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

**rc-webapp sites.** 8 sites in 4 files:
1. GoogleAdsPerformanceDateRange (2): locale "en-GB", label, required, value, minDate, maxDate, onChange, key.
2. BoostDuration (1): locale, disablePast, label, required, value, minDate, onChange.
3. PostCount.step (2): locale, required, disablePast, closeOnCLickAway, value, maxDate/minDate, onChange.
4. EventsSetupFormMain (2+): locale, required, disablePast, closeOnCLickAway, value, maxDate/minDate, onChange, label.

No formconfig/field use was found at the sites.

**Locales.**
1. `localeFormatted` is the location's locale with `_` → `-` (de-DE, de-AT, en-GB, en-IE, en-US, es-ES, …).
2. FINDING, pre-existing, not changed: `getDatePatternFromLocale` keys are `de_DE`-style. Every rc-webapp locale
   misses, so all production sites use the fallback `DD.MM.YYYY` and log a console.error. Fixing it would change the
   visible format per locale (en-US → MM/DD/YYYY). That is a behaviour change for the user to decide, not part of the
   port.
3. The port keeps the lookup as is. The S2 matrix still covers every format the map can produce: MM/DD/YYYY,
   DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY, YYYY-MM-DD, YYYY/MM/DD.
4. Week start: moment's global locale. Vanguard passes no adapterLocale and rc-webapp never calls `moment.locale()`,
   so the reachable case is `en`, week starting Sunday.
5. Digits: Latin only (no ar/fa/hi locales in the map).

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

**Corrected packed count at c8e69a2: 24 of 298 eager exports, plus one allow-listed context module.** The ProgressBar
split is expected to reduce this to 23 after its exact-SHA verification and merge. WordPress remains at 4 of 64.

**Planner correction (decided-by-watchdog).** The create-event popover passes `centerPopover` and `renderInPortal`
together at `EngagementPlannerCalendar.tsx:298`. The centered flip modifier uses the anchor clipping boundary and the
portaled overflow modifier uses the popper clipping boundary. The own resolver deliberately falls back for that
combination. The c8e69a2 pack omitted the card on first render. `9a0dece` keeps the reachable PopoverModal fallback
eager. After the text-field port and before DatePicker S1, port separate flip and overflow boundaries, with a
popper.js differential across placement, boundary, portal mode and scroll offsets and a paired planner check.

**H19 masked field correction (decided-by-watchdog).** `4d88e97` uses MUI InputAdornment inside DateRangePicker's
masked MUI TextField. The real-picker differential pins its full class attribute. The preset field, DateRangeInput
and FlagAdornment keep their own adornment. Restore the own calendar adornment in the same change as the own
TextField `inputComponent` port.

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

| Component | Shapes | Own | Fallback | Evidence scope |
| --- | ---: | ---: | ---: | --- |
| Autocomplete | 24 | 24 | 0 | 26 rc-webapp calls produce 22 shapes, plus the WordPress default and one private source wrapper |
| Menu | 6 | 6 | 0 | Items, JSX children, size, origins and the media menu's class-only `PaperProps` |
| MenuItem | 13 | 13 | 0 | Account route spread present/absent, SearchableSelect, TableToolbar and `Menu.items` item props |
| Snackbar | 2 | 2 | 0 | AiVisibility and SnackbarRoot, which adds `TransitionComponent` |
| AppBar | 1 | 1 | 0 | Navbar ref, class, fixed position, style and children |
| Toolbar | 1 | 1 | 0 | Navbar class and children |
| PopoverPopper | 1 | 1 | 0 | Source-only path through private AutocompleteWithAnchor |
| FormControl | 0 | 0 | 0 | No production caller or WordPress export |
| PopoverModal | 2 | 1 | 1 eager | Event details and centered create-event portal |
| ProgressBar | 22 | 22 | 0 | B's separate exact `f94d932` pack, 48 same-tick checks and cold buffer/query controls |

The AccountNavMenu conditional adds only `selected` and `useActiveIcon`. The internal `Menu.items` spread drops the
React key and forwards each config's fields. The configured items were checked for `component` and `href`. The
media menu's `MENU_PAPER_PROPS` contains only `className`. AutocompleteWithAnchor is private and has no production
caller. Its spread has source coverage in the real wrapper. PopoverPopper has source coverage and no public packed
entry. Icon and StatusBadgeIcon's WordPress tests assert their existing empty first commit and then the local SVG
load separately.

**Autocomplete Clear icon (decided-by-watchdog).** The keyboard differential sampled the own side before the
shared asset cache was warm and the frozen MUI side afterwards. Resetting the dynamic-import module before each
side and running both orders gave the same eight samples. Popup and Clear SVGs were absent at the cold synchronous
sample and present after settling. Both were present immediately on warm replays. The `Icon.tsx` difference from
merge-base `99ee34c` is limited to data attributes. H15 remains PASS. The settled differential gives both sides the
same warm asset state and waits for both indicators. The replay used jsdom. Chromium first-frame checks remain part
of H20.

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
