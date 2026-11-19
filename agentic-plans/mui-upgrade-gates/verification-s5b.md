# S5b — Material/System9.5.0 checkpoint

S5a accepted by overseer2026-11-06. S5b authorized on retained pickers9.17.0, no Vanguard version bump.

## Accepted S5a before baseline

/tmp/mui-upgrade/s5b-before/accepted-inputs.json records5652tracked+untracked files (git ls-files -c -o
--exclude-standard), including untracked root out/ artifacts. No missing tracked files. ManifestSHA
47951839bf5e15c1a8db012e9e7b2a073b0c4e884211d7c19799afe904b5eaf1. accepted-source-config.tar.gz preserves all non-out baseline members;
root out bytes remain in place and hashed. No original baseline/proof artifact changed or removed.

## Read-only direct npmjs preflight (before any dependency bump)

out/s5b-preflight/installed-mui-inventory.json inventories13physical packages, including duplicate
9.5utils/types already used by picker/x-internals. Registry20exact-version records fetched HTTP200
from registry.npmjs.org directly with ProxyHandler({}) (no proxy), rawJSON preserved. Core9.5 peers:
React/DOM/types^17||^18||^19; optional EmotionReact^11.5, EmotionStyled^11.3, optional pigment-css^9.5.
CurrentReact/DOM19.2,types19.2,Emotion11.14.0/11.14.1 satisfy. Pickers9.17 accepts core/system^7.3||^9.
peer-matrix.json and target-dependency-matrix.json preserve exact ranges and semver evidence.

Core9requires these additional transitive changes, pending explicit overseer OK:
- core-downloads-tracker7.3.11→9.5.0
- private-theming7.3.11→9.5.0
- styled-engine7.3.10→9.5.0
- types root7.4.12→9.5.0 (9.5already nested; dedupe eligible)
- utils root7.3.11→9.5.0 (9.5already nested; dedupe eligible)
- material9requiresreact-is^19.3: use existing19.3.1 for new core/utils branch, preserving styled-components'
  lock-exact19.2.6branch. No directreact-is dependency proposed. Other already-resolved non-MUI versions
  satisfy required ranges; don't silently upgrade them. No Emotion/React/picker/x-internals bump proposed.
Optional pigment-css is not needed and will not be installed.

No worktree package/lock/source/frozen edit or install performed. Dependency bump awaits approval
for the required transitive MUI changes/dedupe. No waiver, force/legacy, codemod/source repair, initial
RED capture, full gates, version bump, commit/push/PR/CR or power change yet. Browser support policy
will be presented as user options; no decision made here.

## Approved bump — immediate lock audit STOP

Overseer approved exactly the five transitive MUI updates/dedupe and react-is19.3.1 only for
core/utils, with styled-components staying lock19.2.6. No extra transitive is a direct dependency.
pnpm11.5.1 add --save-dev --save-exact @mui/material@9.5.0 @mui/system@9.5.0 --ignore-scripts
--registry=https://registry.npmjs.org/ ran raw/reported0/0, sleep-VALID12.161971s (exact process JSON
is authoritative). package-after.json deep-equals package-before except the TWO direct pins.
No lifecycle build/source edit. All lock metadata version changes are approved MUI7→9/dedupe;
no Emotion/React/pickers/x-internals/Babel/runtime/other package version change, no pigment install.

BUT styled-components peer context changed from react-is19.2.6 to19.3.1 and19.2.6 was removed from
lock packages entirely. This violates explicit approved condition4, even though19.3.1 is approved
for the core branch. styled-react-is-constraint-stop.json records exact before/after snapshot keys,
dependency edges and actual installed resolution. lock-diff-audit.json is marked STOP, not GREEN.

Stopped immediately before source/frozen edits, codemods or type/browser/spec captures. The initial
RED phase is pending approval of a valid graph, not skipped after repair. No hand lock edit, direct
react-is dependency, override, resolver retry or workaround applied. Escalated for direction; a
persistent scoped override would itself require package/config approval under the two-pin rule.
No version bump, commit/push/PR/CR/power change. S5a frozen baseline and source remain preserved.

## Overseer resolver-dedupe disposition — approved graph, use lock as-is

Overseer explicitly accepts OptionB: approved resolver dedupe: styled-components peer react-is
19.2.6→19.3.1 (core9.5requires^19.3). styled-components peer>=16.8.0 accepts it; react-is is not
direct and src imports it nowhere. Prior preservation condition is superseded, not silently bypassed.
Evidence styled-react-is-constraint-stop.json and lock-diff-audit.json retained at original STOP;
lock-diff-audit-approved.json records current approval and exact unchanged package/lock SHA values.
No override, lock hand-edit, re-resolve or other dependency change. Final lock-exact check must
show single19.3.1forstyled-components+@mui branches; unrelated16/17/18copies unchanged.

Proceeding to all THREE unchanged initial captures(types/browser/spec) before any source/codemod
edit. Initial failures will be captured exactly; no bug-lock/frozen edit is authorized by capture.

## Complete unchanged initial RED checkpoint — before first production edit

All three captures completed on approved9.5graph, no source/codemod/frozen edits. Types raw1,
app1029errors(28new), lib32(28new), contracts58, lint1318(no worse). Browser1280PASS/12FAIL;
spec1730PASS/25FAIL. Every phase sleep-VALID/no bounded timeout. C1 all3PASS136.561292/
168.677291/148.219791ms (<2500), post-orphan cleanup. Full exact assertion messages and suite
failures retained in out/s5b-initial/{storybook,spec}-exact-red-set.json.37failed assertion records
have installed-source cause mapping in classification-and-causes.json and classification-table.md.
The complete classification table follows this checkpoint (no generic expected-red waiver).

Known public migration causes: Autocomplete.js781–815 supplies slotProps.input/htmlInput rather
than old InputProps; TextField.js231–237 renders non-native Select inputLabel as div; SelectInput.js728
uses labelId alone for aria-labelledby; NativeSelectInput.js100–123 adds28end-adornment px to32caret
reservation (SearchableSelect60vs32); ToggleButtonGroup.js205–219 enables roving and public explicit
childtabIndex remains honored (RovingToggleButton.js27–34). These map to authorized type/label/slot/
style/nativeTab compatibility work, with no frozen behavior edits.

Additional untagged contracts needing disposition beyond the preliminary named browser cases:
Menu focus trap (Menu.js150–154 now disables underlying autoFocus, FocusTrap.js116/244 activation);
ProgressBar rounded aria-valuenow (LinearProgress.js445 now rawvalue, visual transform remainsraw);
ToggleButton disabled non-native click (ButtonBase/useButtonBase.js121–167 now disabled-safe, but
this frozen test was renamed after S4a and is currently untagged). Public-prop repairs appear possible
for Menu defaultdisableAutoFocus=false and ProgressBar explicitroundedaria-valuenow (keepingvisual
fraction). No production change or untagged assertion flip has been made.

Tagged changes retain source proof and official v9 guide/changelog evidence pending narrow review:
Menu/MenuItem/ButtonBase event.MouseEvent+bubbling, right-click noAutocomplete toggle, disabled-safe
MenuItem/Select click, backdrop aria-hidden omission, Sliderpointer events, Menurovingtabindex.
Official v9.5CHANGELOG saved in out/s5b-preflight with relevant-line index; MenuList rovinga11y at929,
ToggleGroup266, Slider647, disabled-keyhandlers880. No tagged assertion edited yet.

StandaloneMenuItem: MenuItem.js196 unconditionally calls useMenuListContext; MenuListContext.js19–22
throws withoutprovider. Public MenuList/index.d.ts andMenuItem/index.js do NOT export the provider/hook.
A public realMenuList wrapper could avoidthethrow but cannot publicly detect an existing native
MenuList context; wrapping everyitem would disrupt roving multiitem composition. A context-free
ListItemButton fallback would lose MenuItemregistration/defaultstyling. No private import, DOM/context
hack or prop change implemented; needs scoped public-only design/prototype direction, not a crash
waiver. Existing standalone9stories+2frozen tests must stay unchanged andGREEN.

Official codemod registry latest9.5.0 tar SHA512integrity verified; registryREADME andfileinventory
confirm v9.0.0/system-props anddeprecations/all (no guessed v9preset). Download/read only so far,
no codemod applied or run before captures. Browserbaseline rawupstreamv7/v9Browserslist fetched;
Vanguardbuildtargetes2020, noexplicitBrowserslistpolicy; verifiedproductionconsumerpolicy notyetavailable.
No browser-support decision made. Full finalvalidation notstarted; further initial failures reported
before firstproductionedit as requested.

| ID | File / test | Classification | Installed source / cause |
|---|---|---|---|
| storybook-1 | `src/core/Menu/_MenuMuiContract.stories.tsx:178` — [v5-quirk] tabindex does not follow focus while arrowing | tagged baseline quirk — upstream proof/approval required | `node_modules/@mui/material/MenuList/MenuList.js:117-129,260-267` intentional roving tabindex model; upstream proof pending |
| storybook-2 | `src/core/MenuItem/_MenuItem.stories.tsx:17` — Default | standalone public runtime crash — production compatibility required | `node_modules/@mui/material/MenuItem/MenuItem.js:196; MenuList/MenuListContext.js:19-22; MenuItem/index.js; MenuList/index.d.ts` context required unconditionally; provider/hook not public exports |
| storybook-3 | `src/core/MenuItem/_MenuItem.stories.tsx:23` — Disabled | standalone public runtime crash — production compatibility required | `node_modules/@mui/material/MenuItem/MenuItem.js:196; MenuList/MenuListContext.js:19-22; MenuItem/index.js; MenuList/index.d.ts` context required unconditionally; provider/hook not public exports |
| storybook-4 | `src/core/MenuItem/_MenuItem.stories.tsx:30` — Selected | standalone public runtime crash — production compatibility required | `node_modules/@mui/material/MenuItem/MenuItem.js:196; MenuList/MenuListContext.js:19-22; MenuItem/index.js; MenuList/index.d.ts` context required unconditionally; provider/hook not public exports |
| storybook-5 | `src/core/MenuItem/_MenuItem.stories.tsx:37` — Dense | standalone public runtime crash — production compatibility required | `node_modules/@mui/material/MenuItem/MenuItem.js:196; MenuList/MenuListContext.js:19-22; MenuItem/index.js; MenuList/index.d.ts` context required unconditionally; provider/hook not public exports |
| storybook-6 | `src/core/MenuItem/_MenuItem.stories.tsx` — With Divider | standalone public runtime crash — production compatibility required | `node_modules/@mui/material/MenuItem/MenuItem.js:196; MenuList/MenuListContext.js:19-22; MenuItem/index.js; MenuList/index.d.ts` context required unconditionally; provider/hook not public exports |
| storybook-7 | `src/core/MenuItem/_MenuItem.stories.tsx` — With Icon Before | standalone public runtime crash — production compatibility required | `node_modules/@mui/material/MenuItem/MenuItem.js:196; MenuList/MenuListContext.js:19-22; MenuItem/index.js; MenuList/index.d.ts` context required unconditionally; provider/hook not public exports |
| storybook-8 | `src/core/MenuItem/_MenuItem.stories.tsx` — With Icon After | standalone public runtime crash — production compatibility required | `node_modules/@mui/material/MenuItem/MenuItem.js:196; MenuList/MenuListContext.js:19-22; MenuItem/index.js; MenuList/index.d.ts` context required unconditionally; provider/hook not public exports |
| storybook-9 | `src/core/MenuItem/_MenuItem.stories.tsx` — With Heading Text | standalone public runtime crash — production compatibility required | `node_modules/@mui/material/MenuItem/MenuItem.js:196; MenuList/MenuListContext.js:19-22; MenuItem/index.js; MenuList/index.d.ts` context required unconditionally; provider/hook not public exports |
| storybook-10 | `src/core/MenuItem/_MenuItem.stories.tsx` — With Caption Text | standalone public runtime crash — production compatibility required | `node_modules/@mui/material/MenuItem/MenuItem.js:196; MenuList/MenuListContext.js:19-22; MenuItem/index.js; MenuList/index.d.ts` context required unconditionally; provider/hook not public exports |
| storybook-11 | `src/core/SearchableSelect/_SearchableSelectMuiContract.stories.tsx` — Trigger Style Contract | untagged contract — production repair, no assertion edit | `node_modules/@mui/material/NativeSelect/NativeSelectInput.js:100-123; src/core/SearchableSelect/SearchableSelect.scss:20-22` end-adornment reservation adds28px to32px caret padding, producing60px |
| storybook-12 | `src/core/ToggleButtonGroup/_ToggleButtonGroupMuiContract.stories.tsx` — Keyboard Toggles In Real Browser | untagged contract — production repair, no assertion edit | `node_modules/@mui/material/ToggleButtonGroup/ToggleButtonGroup.js:205-219; ToggleButton/RovingToggleButton.js:27-34` roving tab stops; explicit child tabIndex can restore per-button native Tab |
| spec-1 | `src/core/Autocomplete/_Autocomplete.mui.spec.tsx:245` — Autocomplete MUI contract open / close and combobox aria [v5-quirk] a right-button mousedown on the input toggles the listbox | tagged baseline quirk — upstream proof/approval required | `node_modules/@mui/material/Autocomplete/Autocomplete.js:781-815; useAutocomplete/useAutocomplete.js:1164-1170` renderInput now passes slotProps.input/htmlInput; right-button is excluded explicitly |
| spec-2 | `src/core/Autocomplete/_Autocomplete.mui.spec.tsx:888` — Autocomplete MUI contract adornment options render their adornment[option.key]; selecting puts it into the input start adornment | untagged contract — production repair, no assertion edit | `node_modules/@mui/material/Autocomplete/Autocomplete.js:781-815; useAutocomplete/useAutocomplete.js:1164-1170` renderInput now passes slotProps.input/htmlInput; right-button is excluded explicitly |
| spec-3 | `src/core/Autocomplete/_Autocomplete.mui.spec.tsx:900` — Autocomplete MUI contract adornment clearing removes the start adornment | untagged contract — production repair, no assertion edit | `node_modules/@mui/material/Autocomplete/Autocomplete.js:781-815; useAutocomplete/useAutocomplete.js:1164-1170` renderInput now passes slotProps.input/htmlInput; right-button is excluded explicitly |
| spec-4 | `src/core/Autocomplete/_Autocomplete.mui.spec.tsx:920` — Autocomplete MUI contract formconfig integration hydrates from stateValue, binds refs, marks required and dispatches setStateValue on change | untagged contract — production repair, no assertion edit | `node_modules/@mui/material/Autocomplete/Autocomplete.js:781-815; useAutocomplete/useAutocomplete.js:1164-1170` renderInput now passes slotProps.input/htmlInput; right-button is excluded explicitly |
| spec-5 | `src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx:76` — DateTimePicker contract: rendering default labels "Start date"/"Start time", both required (asterisk, no "Optional") | untagged contract — production repair, no assertion edit | `node_modules/@mui/material/TextField/TextField.js:231-237` non-native Select inputLabel component is now div |
| spec-6 | `src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx:83` — DateTimePicker contract: rendering custom labels | untagged contract — production repair, no assertion edit | `node_modules/@mui/material/TextField/TextField.js:231-237` non-native Select inputLabel component is now div |
| spec-7 | `src/core/Menu/_Menu.mui.spec.tsx:150` — Menu (MUI Menu) contract render and structure focus is trapped: focusing an element outside the open menu pulls focus back into the menu | untagged contract — production repair, no assertion edit | `node_modules/@mui/material/Menu/Menu.js:95-104,150-154; MenuList/MenuList.js:117-129; Unstable_TrapFocus/FocusTrap.js:116,244` Menu manages initial focus and disables underlying autoFocus; roving tabindex; ButtonBase click normalization |
| spec-8 | `src/core/Menu/_Menu.mui.spec.tsx:513` — Menu (MUI Menu) contract tabindex (v9 switches to roving tabindex) [v5-quirk] tabindex does NOT follow focus while arrowing (not roving) | tagged baseline quirk — upstream proof/approval required | `node_modules/@mui/material/Menu/Menu.js:95-104,150-154; MenuList/MenuList.js:117-129; Unstable_TrapFocus/FocusTrap.js:116,244` Menu manages initial focus and disables underlying autoFocus; roving tabindex; ButtonBase click normalization |
| spec-9 | `src/core/Menu/_Menu.mui.spec.tsx:639` — Menu (MUI Menu) contract item activation (v9: onClick gets MouseEvent for keyboard + click bubbles) [v5-quirk] Enter: onClick receives the keydown event and no click reaches ancestors | tagged baseline quirk — upstream proof/approval required | `node_modules/@mui/material/Menu/Menu.js:95-104,150-154; MenuList/MenuList.js:117-129; Unstable_TrapFocus/FocusTrap.js:116,244` Menu manages initial focus and disables underlying autoFocus; roving tabindex; ButtonBase click normalization |
| spec-10 | `src/core/Menu/_Menu.mui.spec.tsx:661` — Menu (MUI Menu) contract item activation (v9: onClick gets MouseEvent for keyboard + click bubbles) [v5-quirk] Space: onClick receives the keyup event and no click reaches ancestors | tagged baseline quirk — upstream proof/approval required | `node_modules/@mui/material/Menu/Menu.js:95-104,150-154; MenuList/MenuList.js:117-129; Unstable_TrapFocus/FocusTrap.js:116,244` Menu manages initial focus and disables underlying autoFocus; roving tabindex; ButtonBase click normalization |
| spec-11 | `src/core/MenuItem/_MenuItem.mui.spec.tsx:34` — MenuItem (MUI MenuItem) contract standalone render (outside Menu/MenuList; v9 throws) [v5-quirk] renders an <li role="menuitem" tabindex="-1"> without a Menu/MenuList and logs no error | standalone public runtime crash — production compatibility required | `node_modules/@mui/material/MenuItem/MenuItem.js:196; MenuList/MenuListContext.js:19-22; ButtonBase/ButtonBase.js:230-301` mandatory unexported MenuList context, disabled-handler gating and native click activation |
| spec-12 | `src/core/MenuItem/_MenuItem.mui.spec.tsx:49` — MenuItem (MUI MenuItem) contract standalone render (outside Menu/MenuList; v9 throws) [v5-quirk] click on a standalone item calls onClick with the click event | standalone public runtime crash — production compatibility required | `node_modules/@mui/material/MenuItem/MenuItem.js:196; MenuList/MenuListContext.js:19-22; ButtonBase/ButtonBase.js:230-301` mandatory unexported MenuList context, disabled-handler gating and native click activation |
| spec-13 | `src/core/MenuItem/_MenuItem.mui.spec.tsx:149` — MenuItem (MUI MenuItem) contract state props [v5-quirk] disabled: a dispatched click still reaches onClick | tagged baseline quirk — upstream proof/approval required | `node_modules/@mui/material/MenuItem/MenuItem.js:196; MenuList/MenuListContext.js:19-22; ButtonBase/ButtonBase.js:230-301` mandatory unexported MenuList context, disabled-handler gating and native click activation |
| spec-14 | `src/core/MenuItem/_MenuItem.mui.spec.tsx:252` — MenuItem (MUI MenuItem) contract keyboard activation inside MenuList [v5-quirk] Enter: onClick receives the keydown KeyboardEvent; no click bubbles to ancestors | tagged baseline quirk — upstream proof/approval required | `node_modules/@mui/material/MenuItem/MenuItem.js:196; MenuList/MenuListContext.js:19-22; ButtonBase/ButtonBase.js:230-301` mandatory unexported MenuList context, disabled-handler gating and native click activation |
| spec-15 | `src/core/MenuItem/_MenuItem.mui.spec.tsx:272` — MenuItem (MUI MenuItem) contract keyboard activation inside MenuList [v5-quirk] Space: onClick receives the keyup KeyboardEvent; no click bubbles to ancestors | tagged baseline quirk — upstream proof/approval required | `node_modules/@mui/material/MenuItem/MenuItem.js:196; MenuList/MenuListContext.js:19-22; ButtonBase/ButtonBase.js:230-301` mandatory unexported MenuList context, disabled-handler gating and native click activation |
| spec-16 | `src/core/PopoverModal/_PopoverModal.mui.spec.tsx:200` — PopoverModal (MUI Popper/Backdrop/Portal) contract Backdrop (dimRestOfPage) [v5-quirk] the backdrop element carries aria-hidden="true" | tagged baseline quirk — upstream proof/approval required | `node_modules/@mui/material/Backdrop/Backdrop.js:94-107` root no longer supplies aria-hidden by default; documented upstream change |
| spec-17 | `src/core/ProgressBar/_ProgressBar.mui.spec.tsx:28` — ProgressBar (MUI LinearProgress contract) determinate (default variant) rounds a fractional progressValue in aria-valuenow | untagged contract — production repair, no assertion edit | `node_modules/@mui/material/LinearProgress/LinearProgress.js:430-447` aria-valuenow uses unrounded value independently of bar transform |
| spec-18 | `src/core/Select/_Select.mui.spec.tsx:40` — Select: render and a11y renders a collapsed combobox named by its <label> | untagged contract — production repair, no assertion edit | `node_modules/@mui/material/TextField/TextField.js:231-237; Select/SelectInput.js:728` select label is div and aria-labelledby now labelId alone; ButtonBase disabled event gate |
| spec-19 | `src/core/Select/_Select.mui.spec.tsx:168` — Select: menu [bug-lock] a synthetic click on a disabled option still selects it | tagged baseline quirk — upstream proof/approval required | `node_modules/@mui/material/TextField/TextField.js:231-237; Select/SelectInput.js:728` select label is div and aria-labelledby now labelId alone; ButtonBase disabled event gate |
| spec-20 | `src/core/Slider/_Slider.mui.spec.tsx:249` — Slider (MUI Slider contract) drag [v5-quirk] onChange/onChangeCommitted receive MUI v5 mouse events (mousedown, mousemove, mouseup) | tagged baseline quirk — upstream proof/approval required | `node_modules/@mui/material/Slider/useSlider.js:607,656-659` drag binds pointerdown/pointermove/pointerup |
| spec-21 | `src/core/ToggleButton/_ToggleButton.mui.spec.tsx:170` — ToggleButton (MUI ToggleButton/ButtonBase contract) keyboard activation (non-native component="div") [v5-quirk] Enter calls onChange with the keydown event and does not dispatch a click to ancestors | tagged baseline quirk — upstream proof/approval required | `node_modules/@mui/material/ButtonBase/ButtonBase.js:230-301` non-native keyboard activation emits native click; disabled blocks handlers |
| spec-22 | `src/core/ToggleButton/_ToggleButton.mui.spec.tsx:195` — ToggleButton (MUI ToggleButton/ButtonBase contract) keyboard activation (non-native component="div") [v5-quirk] Space calls onChange with the keyup event and does not dispatch a click to ancestors | tagged baseline quirk — upstream proof/approval required | `node_modules/@mui/material/ButtonBase/ButtonBase.js:230-301` non-native keyboard activation emits native click; disabled blocks handlers |
| spec-23 | `src/core/ToggleButton/_ToggleButton.mui.spec.tsx:251` — ToggleButton (MUI ToggleButton/ButtonBase contract) disabled non-native disabled element: a dispatched click still fires onChange, Enter and Space do not | untagged contract — production repair, no assertion edit | `node_modules/@mui/material/ButtonBase/ButtonBase.js:230-301` non-native keyboard activation emits native click; disabled blocks handlers |
| spec-24 | `src/core/ToggleButtonGroup/_ToggleButtonGroup.mui.spec.tsx:223` — ToggleButtonGroup (MUI ToggleButtonGroup contract) keyboard Tab moves between buttons and Space/Enter toggle with a click event | untagged contract — production repair, no assertion edit | `node_modules/@mui/material/ToggleButtonGroup/ToggleButtonGroup.js:205-219; ToggleButton/RovingToggleButton.js:27-34` roving tab stops; explicit public child tabIndex is honored |
| spec-25 | `src/core/_internal/InputBase/_InputBase.mui.spec.tsx:999` — InputBase: select mode (MUI Select via TextField select) renders a combobox labelled by the <label> and the display node | untagged contract — production repair, no assertion edit | `node_modules/@mui/material/Select/SelectInput.js:728` aria-labelledby excludes display node id |

## Official codemod tool peer conflict — no bypass

Before dry-run, downloaded official@mui/codemod9.5.0 tarball and verified registrySHA512; README
confirms authorizedv9.0.0/system-props anddeprecations/all. Existing cache contains7.3.10only,
so it was not substituted for9.5. Two isolated tooling installations (toolmanifest root, then normal
consumer dependingon exact@mui/codemod9.5.0) withnpm11.6.2strict peers bothERESOLVE: toolrequires
jscodeshift^17.4.0 whilejscodeshift-add-imports1.0.11declarespeer>=0.7<1. Logs retained in
out/s5b-codemods/tool-install.log andconsumer-tool-install.log. No --force/legacy/no-strict override,
no workspace dependency/lock change, no tool transform or production edit. Escalated before bypass;
this is a tooling peer conflict, not a new product peer failure. Other authorized work remains pending
codemod-first step; standaloneMenuItemstillpendinguser anduntouched.

## Authorized isolated tool installed; official CLI wrapper fails before transform

Overseer explicitly authorized TOOL-ONLY npm11install@mui/codemod9.5.0 --legacy-peer-deps
--ignore-scripts outsideworktree, no metadata patch. Completed0 VALID; npm ls --all recorded1 with
known invalid stalepeer metadata, not a product graph result. Toolversion9.5/READMEverified;
worktreepackage/lock SHAs unchanged. No product install usedlegacyflags.
Firstauthorizedsystem-props dryrun exits1beforeanytransform: officialcodemod.js125 calls
require('yargs').command, butresolvedyargs18exportsnamespace/factory. RegistrytarCLIbytes exactly
match installedfile. No transformed source output, allsource+package/lock hashes unchanged;
deprecations/all notrun. Exactlogandcli-wrapper-failure.json saved. Proposed invocation is bundled
jscodeshiftCLI directly with unchangedofficialtransformmodules andsameflags, no tool/dependencypatch
or hand migration. Escalated before proceeding. StandaloneMenuItem remains untouched pendinguser.

## Authorized direct official transforms: argv derivation and first dry result

The isolated tool root jscodeshift 17.4.0 invokes the verified official 9.5.0 transform modules unchanged. `out/s5b-codemods/derived-argv.json` records the exact wrapper-derived argv, defaults and codemod.js line citations; explicit code-file inputs are exclusively under src/. Parser tsx, extensions js/ts/jsx/tsx/json, node_modules/CSS ignores, packageName @mui/material and the requested in-band passthrough are retained. Both --dry and --print are used. A canonical-path guard first rejected /tmp versus /private/tmp before execution; no transform ran in that guard failure.

System-props dry run: raw/reported 0/0, VALID, 0 errors, 3585 unmodified and 8 printer-only proposals. Each full per-file diff was reviewed in system-props-per-file-review.json and rejected as unrelated formatting, including every test proposal. No apply occurred; all source/package/lock hashes unchanged. The historical ESCALATE-transform.json belongs to the prior official wrapper failure, not this successful direct transform. Deprecations/all direct dry run remains in progress; no production or frozen edits have been made.

## Deprecations/all semantic STOP — no apply

The direct dry run proposed replacing Autocomplete renderTags={null!} with renderValue={null!} next to the existing renderValue={multiple ? renderValue : consumerRenderValue}. This creates a duplicate JSX attribute and loses the deliberate legacy theme sentinel. Per the explicit stop condition, the transform was stopped immediately once reviewed: SIGTERM only its owned process group 65037. No proposal was applied, no transform code was modified, no hand migration was presented as codemod output. Full proposal diff and zero source/package/lock drift audit are in out/s5b-codemods/deprecations-semantic-stop.json. Partial dry output is retained; this is not a completed clean transform. Escalated for disposition before repairs. Standalone MenuItem remains untouched.

### S5b codemod disposition: rejected duplicate JSX attribute

Codemod output rejected: duplicate JSX attribute. The deprecations/all proposal renamed Autocomplete's renderTags={null!} sentinel to renderValue={null!} beside its existing renderValue. Nothing was applied. system-props is a reviewed no-op: all eight printer-only proposals were rejected. Overseer authorized a fresh complete deprecations/all dry run with identical derived argv plus only an ignore pattern for src/core/Autocomplete/Autocomplete.tsx; its argv is saved in out/s5b-codemods/deprecations-excluded-derived-argv.json. The separately authorized removal of the obsolete renderTags sentinel will be labelled MANUAL compatibility repair and tested against existing Autocomplete contracts and legacy-slot regressions. Standalone MenuItem and master-sync timing remain pending user direction.

## Authorized single-exclusion rerun: parse-error STOP

Identical derived argv plus ONLY the absolute ignore pattern for src/core/Autocomplete/Autocomplete.tsx was used. Before completion, official deprecations/all raised SyntaxError at src/core/StyledSVG/global.d.ts:3:15: `export declare` must be followed by an ambient declaration. The file is pre-existing, starts //@ts-nocheck and contains only an exported global Window augmentation with two REACT_INLINESVG cache fields; no @mui reference. No declaration/source/parser/transform edits were made. Immediately stopped ONLY owned PGID65909; raw/reported -15/-15, sleep-VALID, no timeout; group absence verified. Source/package/lock drift=[] and excluded Autocomplete absent from file-status output. No proposal applied, no manual production repair started. Evidence: deprecations-excluded-parse-stop.json, deprecations-excluded-dry-{process,status}.json, full dry log and ambient-declaration-readonly-audit.json in out/s5b-codemods/. Remaining proposals are still unknown. Escalated before any further attempt.

During the unchanged dry run, added documentation only: core-v9 consumer migration examples (draft, not accepted) and s5b-master-sync-gates.md recording TypeScript5.9.3/ESLint9.37.0-dependent checks plus the existing separate native-preview Storybook checker. No master sync performed. Prepared regression files only under /tmp; they have not been copied to src or run.

## Inherited legacy public-prop audit (read-only)

The verified MUI7 type inventory also follows Menu→Popover→Modal inheritance. Besides the direct
removed properties recorded earlier, Vanguard Menu historically accepts components, componentsProps
and disableEscapeKeyDown through ModalProps. These need deprecated Vanguard-owned aliases and
public compatibility mapping (including Escape onClose filtering), rather than a silent public type
loss. Source chain and plan are retained in out/s5b-preflight/inherited-menu-api-audit.json. No source
edit or extra waiver is implied; new targeted regressions will precede implementation after the
codemod step. Standalone MenuItem is separate and remains untouched pending user disposition.

## Official codemod step complete, no changes applied

Two-exclusion rerun raw/reported0/0, VALID, 0 errors, 3578 unmodified,13 proposals; both exact ignores honored; source/package/lock drift=[]. No non-blocking parse errors occurred. Every hunk reviewed and rejected in out/s5b-codemods/deprecations-two-exclusions-per-file-review.json:8 printer-only proposals,4 proposals replacing legacy compatibility test inputs with modern slots,1 Snackbar proposal discarding composed slot callbacks via an explicit empty transition slot. No semantically correct migration hunk remained to apply. Official transforms were not modified. Post-codemod contract type recapture remains expected RED, raw2 VALID, before manual repairs; exact diagnostics retained. New non-frozen compatibility regressions are now added for the five public TextField aliases, label association/slot precedence, fractional progress and inherited Menu aliases/Escape behavior. Production repairs have not yet begun.

## Stable pre-sync checkpoint (master sync now prioritized)

Official v9 codemods: no applicable output. Two exact ignores, zero parse errors, all13 proposals reviewed/rejected; system-props8printer-only no-op. Manual repairs restore legacy Vanguard TextField/Input/Menu/Snackbar/Accordion types, generated Autocomplete field prop/adornment/ref mapping, labels/aria associations, rounded ProgressBar ARIA while preserving its fraction, Menu trap/Escape/Modal alias handling and native ToggleButton Tab. Compatible labels render the real InputLabel/FormLabel; nested Modal mapping retains portal, focus trap and invisible backdrop.

New regressions18PASS with source/type RED→GREEN logs in out/s5b-manual-compat; broader contract-only check384PASS (tagged flips explicitly excluded), C1=130.664625/153.382958/131.574166ms. The backdrop matcher initially used transparent against computed RGBA; corrected serialization, then a temporary missing-default negative control fails rgba(0,0,0,0.5) versus rgba(0,0,0,0), candidate restored byte-exact, GREEN retained. Static second: app1001/lib4 baseline equal, contracts0, lint1318/no new. First static RED for Input's redeclared MUI type and new layout findings is preserved; owned compatibility type and layout-only fixes restore GREEN.

Initial targeted browser4FAIL/4errors occurred after Vite optimized the new material/utils entry mid-run and reloaded, with duplicate React/Emotion and a null preview dispatcher. Overseer accepted harness classification. Root/utils mergeSlotProps identity proved in BOTH ESM/CJS before source edit; equivalent public root import applied. Exactly one authorized browser revalidation:12PASS/0FAIL (SearchableSelect4, Select3, ToggleGroup5), raw0 VALID, no timeout, no config/cache/assertion change. All483 previously accepted source spec/story hashes unchanged.

New entrypoint rule added to the public-import guard. TDD stub RED5/1, an over-strict per-file policy implementation RED24/1 on an already accepted styles entry, corrected to module-entrypoint identity; final scripts25/25 across3 mandatory node files, raw0 VALID. Existing public-import assertion body byte-identical. Five new tests; no timeout raise, no UI setup, component coverage still by project. Baseline records28 runtime-use provenance rows from the accepted S5a snapshot.

MenuItem user decision OPTION A received: document standalone usage as a break, public MenuList wrappers for9stories, narrow spec flips plus wrapped Render regression. Not implemented yet. No C/D frozen edits yet. No new full final suite/coverage/package or review performed. Master-sync instruction now takes priority. Current tests/gates are finished; source candidate stable.

## Priority master sync checkpoint — implementation and clean-master baselines

User authorized immediate sync before further MenuItem/C/D work. No gate was
running at stabilization. Full pre-sync binary patch, verified scratch apply,
untracked tar excluding root out/, file hashes and old HEAD are preserved in
`/tmp/mui-upgrade/pre-sync-20261106T122630Z/`. Fast-forward to f02d3f5 completed;
only the two authorized package/lock conflicts occurred. See `sync-git-operations.json`,
`package-field-merge-table.json`, `lock-diff-audit.json`, `sync-reapply-integrity.json`.
No commits or pushes. Version 2.9.1 is inherited directly from master.

The resolver ran pnpm 11.5.1 against registry.npmjs.org; package fields unchanged
except the 12 approved replay deltas. No hand lock edits. 17 added/37 removed
resolutions all belong to the approved upgrade/retired closure. The initial audit
false stop treated a styled-components peer-context suffix as a package-version
change; corrected validator recognizes the already explicitly approved react-is
dedupe. The rejected audit remains retained. Hook and pnpmfile checksum match master.

Frozen provenance: 486 pre-sync source specs/stories, 484 byte-identical and 2 exact
master-owned updates (`_DatePicker.spec.tsx`, `_ModalServiceStandard.spec.tsx`).
These are separately inventoried in `master-sync-frozen-changes.json`, registered
with the existing approved list, and never attributed to an upstream MUI quirk.
527 prior root-out files are unchanged; historical archives/manifests untouched.

Detached f02 master frozen install and baseline captures are under
`master-baseline/`: TS7 7.0.2 app/lib/tracked-spec each exit 0; Biome 42 errors,
848 warnings, 111 infos with zero suppressed diagnostics. The old contract config
first failed TS5102 because baseUrl is removed; corrected invocation-only config
passes (full candidate contracts must independently pass). Build exit 0, zero TS
blocks, unchanged-form WP move error; 720 use-client occurrences / 360 identities.
`build-diagnostics.json` preserves identities. Scratch package/lock/hook SHAs unchanged.

Tool invocation/schema adaptations are documented in `s5b-master-sync-gates.md`.
Old TS5.9/ESLint inventories remain preserved; fresh master data is separate in
`baseline/master-ts7/`. Updated mock selftest first rejected unchanged old-tool
gate, then all eight existing crash/healthy/diagnostic/missing/malformed checks
passed after invocation adaptation (`tool-adaptation/`). All assertion conditions
retained. Three API scanner imports use master's typescript5 alias; no test bodies
changed. Root frozen install passes with unchanged package/lock/hook SHAs and one
react-is 19.3.1 for styled-components/core/utils; graph evidence under
`root-clean-install/`. Synchronized candidate static/scoped checks are pending.

### Sync static STOP — real new Biome findings, no frozen edits

Sleep-valid static process: raw/reported 1/1, 22.830 s, no timeout/Sleep events.
Production app/lib each 0 TS7 errors. Contract initially produced 69 TS6059 harness
errors because TS7 infers rootDir from the config's node_modules location. The
invocation-only config now explicitly sets rootDir to the repository. A separate
contract-only rerun passes 0/0 in 3.894 s, sleep-VALID. Includes, path aliases and
assertions are unchanged; no source fix was required.

Biome reports 66 errors vs clean master 42: exactly 24 extra noComponentHookFactories
findings across 13 test-file/rule pairs. All extra findings are in characterization/
regression spec files (nested React test harness components); no production file
has a worse pair. Exact locations/messages are preserved in
`root-sync-validation/biome-new-diagnostics.json`. No rule suppression, baseline
allowance, frozen test refactor or production change was made to conceal them.
This blocks the synchronized static gate and is escalated for disposition before
scoped suites. Final frozen audit: 486 files, 484 unchanged and only the 2 exact
master-owned updates; no unapproved changes. git diff --check passes.

S5a/S5b scoped runtime sets, new candidate build warning reconciliation, fresh review,
and full final gates have NOT run on the synchronized candidate. No S5b acceptance
or sync-validation GREEN claim. No runners remain active.

## Post-sync full capture, continuation and authorized transport diagnostic

The exact lint-cap/static GREEN and metadata-validator stop were accepted by
the overseer. The user's later lint-zero direction supersedes that allowance.
Full spec capture: 1758 PASS /15 known FAIL, C1 143.242/170.227/155.582 ms;
12 hasPointerCapture uncaught exceptions match the initial capture and must be
removed before final. Failed-file validation now uses testResults, not nested
numFailedTestSuites; a nested-describe fixture proves one failing file.
The same capture then continued ONLY scripts (25/25 PASS) and Storybook. Spec
was not rerun. Storybook 1249 PASS /10 known FAIL, with one NEW TextHighlighted
browser connection closed/birpc error, 33 tests missing. It is sleep-valid RED;
no source change or retry disguised the original failure.

Authorized isolated diagnostic: TextHighlighted contains 3 tests, not all 33 missing
tests. All3 pass alone (9.716 process seconds), then all3 pass inside the ONE
authorized default-worker full Storybook diagnostic (63.796 process seconds).
That diagnostic collects all1292:1282 PASS /10 known FAIL, zero transport exceptions.
The original disconnect is classified as host/resource transport flake under the
overseer's explicit two-pass disposition, without claiming a proven hardware or
process cause. vm_stat/memory_pressure before/after, Playwright browser stderr,
per-test start/end progress and crash-report inventories are retained under
`out/s5b-transport-diagnostic/`. No new crash dump; memory free before alone56%,
before default48%. Configured default maxWorkers is unset and fileParallelism true;
resolved project options and observed test concurrency are recorded. The final
Tier3 must collect all1292 Storybook tests with no failed/uncaught/unexpected skip.

## Smarter selection policy — implementation and proof

`tiered-tests.py` and `selection-policy.mjs` implement SHA manifests, real installed
Vitest related resolution, explicit failing-file reruns, component-folder plus
related dependent selection, and a deduplicated Tier3 plan/runner. Shared source,
config/dependency and deleted input changes require Tier3. Scripts are added to
inner selection only when scripts/ changes; stage scripts stay mandatory.
Tier3 uses combined V8 coverage as the full spec/Storybook pass, with ONLY the
three C1 cases uninstrumented, and conditional package5/5/4/4. Stage-specific
build/frozen/bytes/pin audit remains mandatory. No final stage attempt has run.

Selftest TDD: initial stub fails leaf-change selection (red-process); fixture-root
and /var vs /private/var resolution errors were preserved as further REDs, then
canonical real paths produce the intended exact own/dependent spec/story list and
shared-module escalation (green-canonical-process0, sleep-VALID). Evidence is at
`out/smarter-selection-proof/`. It runs in the existing selftest.sh. Estimated
saving547 s of duplicate full passes is documented as an estimate, not measured
new host performance.

Lint-zero source work begins only after the authorized capture/diagnostic. Before
images of44 files and diagnostics are in `out/lint-zero-work/`. First batch hoists
29 capture-free harness components in16 test files, using local aliases to preserve
existing render/actions. Whole-file AST proof preserves all expect node bytes,
decoded title bytes and test counts. Seventeen introduced warnings are being fixed
without suppressions: forEach block bodies, equivalent literal title encoding and
Object.hasOwn. Runtime/static verification of these lint edits is still pending.

## Lint-zero / static-hygiene checkpoint (not S5b acceptance)

User superseded the exact24 allowance and required master42 plus upgrade24 errors
fixed. `pnpm lint:err`: raw/reported0, sleep-VALID. Native app/lib/contracts/spec
all0; strict warning comparator:0 errors,846 warnings,0 introduced identities.
The old cap is not called by the active gate. New strict gate TDD and selftests
prove baseline errors and extra/different warnings are rejected; compiler crash,
stale/missing/malformed output, nested-suite file counts and real related graph
protections remain green. See `out/lint-zero-work/*-process.json` and logs.

All48 nested test render/hook definitions and17 production helpers are corrected
(plus the retained non-exported Button type checks). The first forwardRef lifting
strategy remained lint-RED7, retained as evidence; actual module-scope forwardRef
components now use per-render-tree observer contexts. Existing transition mount,
callback and ref assertions pass unchanged. Private production closure lifting
uses bound typed values to preserve per-parent component identity and reference
capture; directly called helpers are lowercase. No public prop/type change.

All introduced warnings are fixed:17 original occurrences plus the3 lifting
side-effects, yielding846 vs master848 with no new identity. The5 legacy-theme
typing repairs were explicitly approved; native spec types now0 and permanently
required. `theme-types/fixture-ledger.json`, AST proofs and runtime-data-proof.json
prove unchanged object/data bytes, JSON/function identity before/after actual
createTheme. Current typed mock annotations use unknown rather than any; four
source-only refinements after the runtime check emit byte-identical JS and match
the runtime-tested source hashes by exact reversal (`unknown-type-erasure-proof.json`).

Targeted related runtime preservation:808PASS /4 unchanged knownFAIL in812 tests;
all fullNames and statuses match the accepted post-sync capture, no drift or
unexpected skip. C1 passed154.463/157.559/154.585ms. The existing Slider uncaught
exceptions and4 quirk failures remain pending authorized S5b work; this is no
GREEN manifest or final-test waiver.

Separate changesets and hunks: `../lint-cleanup-changeset.md`; master42 patch vs
upgrade static-hygiene patch under `out/lint-zero-work/`.47 changed source files,
35 spec files with whole-file assertion/title proofs in final-ast-proofs. The
approved list appends this user-authorized step while retaining every prior
approval chain and the two exact master-sync blobs. No commits/pushes/version
commands, Biome policy edits, suppressions, installs or power changes.

## MenuItem Option A — required context, scoped GREEN

User approved documenting the break, no fallback/private import/new export. The
precise public boundary was escalated and approved: Vanguard bundles MUI, so an
external consumer MUI Menu/MenuList cannot share its context, even at matching
versions. Use Vanguard Menu or its internal menu builders. The migration draft
now gives Vanguard Menu / items examples, impact results and the possible future
inline Vanguard MenuList follow-up, not implemented here.

New real consumer-pattern characterization (plain/conditional Render children,
focus arrows across both, Enter/click callbacks, hidden exclusion) passes1/1
before any MenuItem repair; not a fabricated RED. Existing standalone failures
from initial/post-sync captures provide intended RED for this break. Only the
two approved standalone test cases/comments changed; all other spec bytes are
identical. Nine stories keep names/args byte-identical, only public MenuList
import and metadata render wrapper added. Production MenuItem is unchanged.
Proof: `out/s5b-menuitem-option-a/ast-proof.json`. The first helper attempt hit a
CommonJS exports-name collision; its source is retained, corrected proof passes
without weakened checks.

Two filtered standalone/support cases pass2/2 (others explicitly filtered, not
waived), raw0 sleep-VALID. Nine stories pass9/9, raw0 sleep-VALID, no uncaught
errors, with diagnostic tracing only in an external temporary config. Original
vitest.config.ts is unchanged. Trace screencast frames lag the story, so they
are NOT visual proof. Accurate post-render screenshots are queued with component
Tier2 after the remaining C/D cases, rather than repeating this GREEN now. The
approved frozen registry appends exact source hashes/proofs and retains chains.


## C/D upstream fixes and jsdom pointer-capture closure

All 14 authorized C/D cases (13 spec cases plus the roving Menu story) have
installed-source and tagged official-guide intent citations, exact old/new nodes
and whole-file AST proofs in `out/s5b-v9-quirk-flips/`. Only explicitly allowed
nodes/comments changed; test/expect counts remain unchanged. The registry preserves
prior approvals, including the original S4a disabled ToggleButton bug-lock provenance.

Two new Select guard mistakes remain RED history: the first queried an aria-hidden
host after opening a modal; the second used an unavailable Chai matcher. The
approved native `within(listbox)` / `getAttribute('aria-selected')` guard passes:
full Select file **26/26**, raw/reported0/0, sleep-VALID, 7.276s. No production or
existing no-onChange assertion changed for these corrections.

Pointer-capture RED was captured before implementation (1 pass/2 fail and uncaught
errors), sleep-VALID. Process deviation: it started before inspecting the previous
Select failure; overseer retained it as valid TDD evidence. Corrective rule: inspect
each dependent status before starting another action. No recapture or timeout change.
The minimal missing-method-only bookkeeping is installed only for jsdom, never
real browsers; existing native functions are preserved. New pointer cases plus the
full Slider file pass **47/47**, 0 uncaught errors, 7.087s. After the explicit jsdom
guard, all 13 C/D spec cases plus 3 pointer tests pass **16/16**, 0 uncaught errors,
17.374s, raw/reported0/0, sleep-VALID. C1 explicitly not included in these filters.
Shared setup changed, so stage-end TIER3 remains mandatory. Evidence:
`out/s5b-pointer-capture/{red,green,guarded-cases}-*`; no full final attempt yet.


## Component completion and review

MenuItem folder + wrapped-child Menu regression + MenuMuiContract browser stories:
**40/40 PASS**, raw/reported0/0, sleep-VALID,20.700s, zero uncaught errors.
`out/s5b-menuitem-option-a/visual/` contains nine accurate post-render screenshots
awaited through the public Vitest screenshot API, all inspected. Default, disabled,
selected, dense, divider, both icon positions, heading and caption remain intact.
The original config/story source was unchanged; a temporary external config added
only screenshot observation. No pixel-equality claim against a missing standalone
v9 baseline. Earlier lagging trace frames remain explicitly invalid visual proof.

Latest static gate after pointer/setup/approved assertions: raw0,VALID,12.790s;
app/lib/contracts/spec0 and Biome0 errors/846 warnings/0 introduced identities.
Fresh read-only `review-s5b.md` reports no actionable findings and independently
checks all14 C/D classification entries against exact diffs, source intent and
approval chains. Final build reconciliation, lock-exact install and ONE TIER3
remain pending. No stage acceptance or final release-policy waiver.


## Accepted core9 build inventory and final audit guard

Target build raw/reported0/0, sleep-VALID112.936s. Exact inventory595 occurrences /
338 identities; every source resolves under node_modules and contains a literal
use-client directive (license comments may precede it). S5a584/337 comparison and
current-base clean-master720/360 comparison both retained in
`out/s5b-build-reconciliation/reconciliation.json`; dependency-only delta accepted
by overseer. TS declaration diagnostics0 matches clean master. Exact existing WP
move diagnostic and other esbuild warning identities match clean master. No filters.

Final stage audit adds completeness/diagnostic negative controls and package-count
selftests to Tier3. Initial audit selftest hit /tmp→/private/tmp canonicalization,
fixed by canonicalizing the supplied root, no assertion weakened. Both selftests
then pass. No final full attempt has started. Final audit requires exact595/338
map plus complete projects,0 uncaught/skips/failures,35 thresholds and packed
bytes/pins/type evidence. Browser policy remains a user choice.


## Final preflight closure

Overseer accepts current build595/338 and its exact identity inventory versus both
S5a584/337 and clean-master720/360. Master comparison:593 added/718 removed warning
occurrences (337 added/359 removed identities); .js→.mjs paths are distinct identities.
No source warning/filter changes. Frozen pnpm11.5.1 install raw0, sleep-VALID0.991s;
package/lock/hook/workspace SHAs unchanged. Approved MUI9.5/pickers9.17 pins and
single shared react-is19.3.1 through MUI and styled-components confirmed by realpaths
and full pnpm-ls output in `out/s5b-lock-exact-install/`. Frozen preflight486 hashes
match exact approved chains/master blobs. Browser report is final technical analysis;
its support-policy options remain for the user. Consumer migration draft includes
core9 shims/events/disabled/roving/Backdrop/right-click/MenuItem boundary.

The final package uses the already accepted cached npm11.6.2 CLI explicitly through
a task-local PATH shim, avoiding the recorded npm10 prepare/ignore-scripts issue.
No dependency resolution, package scripts, assertions or thresholds changed for it.
ONE fresh Tier3 is next; any stop will escalate without retry.

Final diff-check found two whitespace-only blank lines in the lint-refactored
ModalStepper spec. They were trimmed; original expect/title/fullName bytes are
unchanged, with pre/post and original-prelint AST proofs retained. Approved hash
and master-only lint patch updated. A bulk legacy doc-generator attempt correctly
refused the later intentional C/D changes; no registry reset was performed. The
single whitespace file was refreshed explicitly. Final full run supplies the same
fullName runtime check; no assertions or production behavior changed.


## Superseding user directive: narrow build-warning silence

The first final attempt402484... was in coverage when the new directive arrived.
Only verified task-owned PGID36345 was terminated; controller stopped, inhibited
process cleaned up.13 preceding gates passed; incomplete coverage is not final
evidence and package was never reached. Artifact retained as superseded history,
not a failed/used final attempt (overseer acknowledgment).

Filter RED before implementation:6PASS/3 intendedFAIL, raw1 VALID3.814s. GREEN:
9PASS, raw0 VALID3.484s. Exact warning code, quoted message and dependency path
are required together. Source/virtual/missing IDs, other directives/codes and
existing-handler composition have explicit negative controls. No silent counters.
Library+WP and equivalent app onwarn paths compose the previous handlers.
`out/s5b-use-client-filter/` retains logs/reports. The595/338 inventory is history;
final baseline now expects0 visible directives, other master warnings unchanged,
0 TS errors and exact WP move diagnostic. Four Node files/34 cases now mandatory;
source/browser counts and35 coverage thresholds are unchanged.

Onwarn static recheck raw0 VALID11.935s; all four native type gates0, Biome0
errors/no new warnings. New frozen install raw0 VALID1.422s with package/lock/hook/
workspace hashes unchanged and the approved single shared react-is19.3.1/MUI graph
verified. Evidence `out/s5b-onwarn-lock-exact-install/`. The helper/config change
is covered by its9 node cases; the existing fresh review predates this later user
directive, which explicitly authorizes TDD→frozen install→one final run.


## S5b validated handoff (awaiting overseer acceptance)

Full runtime3069 (1777 spec+1292 stories),35 mapped thresholds, separate C1 and
static/selftests reused with explicit authority. Helper12PASS and source/runtime
hash boundary documented. Original build763d2e raw0 VALID150.964s and full text
warning audit PASS:0 directives/annotations, other complete warning identities
master-equal,0 TS errors and exact WP move baseline. Observer-wrapper ESM failure
retained as infra history. Worktree-nested package proof763d2e REJECTED for ancestor
MUI leakage; only its separately accepted build/static/bytes/integrity stand.

Isolation guard TDD raw1 intended worktree rejection failure→5/5 raw0. Five controls
cover inside root, clean external root, ancestor contamination, owned/absent and
missing MUI. Future runner uses/tmp; preflight before pack plus actual post-install
createRequire probes. MUI-present fixtures explicitly install material/system/
x-date-pickers exact pins. Final package e89bf566 raw0 VALID183.470s in fresh/tmp:
5/5/4/4, required types0, all3 declared-only MODULE_NOT_FOUND / present own paths,
8 byte comparisons/pins0 drift. Optional declarations are baseline-like; exact
counts/removals/additions in its declaration-measurements.json, not waived.

Tarball SHA256 66585135b37947c67850edac7ef6852b780ab31be997f4d1998523a60297c284.
Full evidence index, browser options/recommendation, migration note, lint split,
suggested commits(text only), all deviations and remaining release limitations:
`handoff-s5b.md`. No commits/pushes/version bump/power changes.
