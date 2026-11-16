# Lint cleanup change sets

User requested zero Biome errors, including master's 42 pre-existing errors. No commits were created. This inventory separates those fixes from the upgrade's 24 test-harness errors and introduced warnings.

Baseline: clean detached f02d3f5, Biome 2.6.4. Master errors: 42; upgrade errors: 24. Current: 0 errors, 846 warnings, 0 introduced warning identities. No suppressions or biome.json changes.

## Master-only error cleanup (separate staging/commit group)

Patch: `mui-upgrade-gates/out/lint-zero-work/master-42-lint-only.patch`.

The patch is relative to the synchronized pre-lint upgrade candidate. Some files also contain earlier MUI edits; use the listed hunks to stage this cleanup separately. It is not a claim that the whole candidate diff is a standalone master-only commit.

| File | Master errors | Lint-only hunks | Earlier MUI candidate changes in same file |
|---|---:|---|---|
| src/App.tsx | 3 | @@ -31,6 +31,50 @@<br>@@ -78,48 +122,9 @@ | No |
| src/common/LocationCard/LocationCard.tsx | 1 | @@ -39,6 +39,30 @@<br>@@ -93,28 +117,7 @@ | No |
| src/common/OpeningTimes/OpeningTimesItem/OpeningTimesItem.tsx | 1 | @@ -9,18 +9,7 @@<br>@@ -58,6 +47,20 @@ | No |
| src/common/Tutorial/TutorialStep/TutorialStep.tsx | 2 | @@ -15,6 +15,28 @@<br>@@ -27,26 +49,9 @@ | No |
| src/core/ActionBar/ActionBar.tsx | 1 | @@ -6,6 +6,26 @@<br>@@ -55,24 +75,7 @@ | No |
| src/core/Autocomplete/Autocomplete.tsx | 1 | @@ -213,7 +213,7 @@<br>@@ -363,7 +363,7 @@<br>@@ -555,7 +555,7 @@ | Yes; pre-lint snapshot isolates the cleanup |
| src/core/Button/Button.spec.tsx | 2 | @@ -3,9 +3,21 @@<br>@@ -14,6 +26,11 @@<br>@@ -30,19 +47,7 @@ | No |
| src/core/Button/_ButtonInverted.spec.tsx | 1 | @@ -99,7 +99,7 @@<br>@@ -134,3 +134,5 @@ | No |
| src/core/DateRangePicker/_DateRangePicker.spec.tsx | 1 | @@ -7,6 +7,22 @@<br>@@ -100,20 +116,7 @@ | No |
| src/core/Modal/ModalRoot/_ModalRootRender.spec.tsx | 2 | @@ -11,6 +11,14 @@<br>@@ -368,10 +376,7 @@<br>@@ -385,7 +390,7 @@ | No |
| src/core/Modal/ModalStepper/ModalStepper.spec.tsx | 12 | @@ -13,162 +13,135 @@<br>@@ -177,25 +150,7 @@<br>@@ -204,25 +159,7 @@<br>@@ -236,25 +173,7 @@<br>@@ -268,47 +187,114 @@<br>@@ -339,20 +325,8 @@<br>@@ -383,6 +357,268 @@<br>@@ -518,34 +754,7 @@<br>@@ -563,119 +772,10 @@<br>@@ -691,46 +791,7 @@<br>@@ -740,41 +801,7 @@ | No |
| src/core/Modal/_ModalCompact.spec.tsx | 1 | @@ -4,6 +4,9 @@<br>@@ -266,7 +269,7 @@ | No |
| src/core/Modal/_ModalServiceStandard.spec.tsx | 2 | @@ -8,6 +8,11 @@<br>@@ -369,7 +374,7 @@<br>@@ -394,7 +399,7 @@ | No |
| src/core/Modal/_ModalServiceWindowing.spec.tsx | 1 | @@ -5,6 +5,9 @@<br>@@ -52,7 +55,7 @@ | No |
| src/core/Select/Select.tsx | 1 | @@ -83,7 +83,7 @@<br>@@ -126,7 +126,7 @@<br>@@ -175,7 +175,7 @@ | No |
| src/core/Table/TableCell/TableCell.tsx | 1 | @@ -10,6 +10,9 @@<br>@@ -53,9 +56,7 @@ | No |
| src/core/Table/common/CtaWithIcon/CtaWithIcon.tsx | 1 | @@ -5,6 +5,21 @@<br>@@ -26,19 +41,7 @@ | No |
| src/core/TogglerWithText/TogglerWithText.spec.tsx | 3 | @@ -8,9 +8,7 @@<br>@@ -20,6 +18,33 @@<br>@@ -37,16 +62,7 @@<br>@@ -64,16 +80,7 @@ | No |
| src/core/_internal/InputBase/InputBase.tsx | 4 | @@ -27,6 +27,93 @@<br>@@ -518,30 +605,30 @@<br>@@ -556,91 +643,7 @@ | Yes; pre-lint snapshot isolates the cleanup |
| src/helpers/with-lazy.tsx | 1 | @@ -1,13 +1,16 @@ | No |

## Upgrade test-harness cleanup

Patch: `mui-upgrade-gates/out/lint-zero-work/upgrade-lint-and-static-hygiene.patch`.

| File | Upgrade errors | Scope |
|---|---:|---|
| src/core/AIAssistant/AIAssistentPanel/_AIAssistantPanel.mui.spec.tsx | 0 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/Autocomplete/_Autocomplete.mui.spec.tsx | 0 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/Autocomplete/_AutocompleteSlotCompatibility.spec.tsx | 0 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/DatePicker/_DatePicker.mui.spec.tsx | 0 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx | 4 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/DatePicker/_DatePickerControlledSync.spec.tsx | 2 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/DatePicker/_DatePickerKeyboardSync.spec.tsx | 1 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/DatePicker/_DatePickerV8Context.spec.tsx | 1 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/DateRangePicker/_DateRangePicker.mui.spec.tsx | 0 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/Drawer/_Drawer.mui.spec.tsx | 0 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/FormControl/_FormControl.mui.spec.tsx | 2 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/Menu/_MenuV9Compatibility.spec.tsx | 0 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/Popover/PopoverPopper/_PopoverPopper.mui.spec.tsx | 0 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/PopoverModal/_PopoverModal.mui.spec.tsx | 0 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/ProgressBar/_ProgressBar.mui.spec.tsx | 0 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/SearchableSelect/_SearchableSelect.mui.spec.tsx | 0 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/Select/_Select.mui.spec.tsx | 1 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/Slider/_Slider.mui.spec.tsx | 1 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/Snackbar/_Snackbar.mui.spec.tsx | 1 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/Snackbar/_SnackbarCompatibility.mui.spec.tsx | 3 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/Snackbar/_SnackbarRemaining.spec.tsx | 3 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/Snackbar/_SnackbarSlotCompatibility.spec.tsx | 0 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/ToggleButtonGroup/_ToggleButtonGroup.mui.spec.tsx | 1 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/_internal/InputBase/_InputBase.mui.spec.tsx | 2 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/_internal/InputBase/_MuiTextFieldCompatibility.spec.tsx | 0 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/_internal/_mui-slot-compat.spec.ts | 2 | Harness hoist / unchanged fixture typing / equivalent warning rewrite |
| src/core/_internal/mui-slot-compat.ts | 0 | Object.hasOwn equivalent lookup |

No error-origin file contains both master and upgrade errors: the groups are separate by file. Earlier MUI migration edits in a master-error file are explicitly marked above and are outside the cleanup patch.

## Proof and remaining stage work

Before images and hashes: `mui-upgrade-gates/out/lint-zero-work/before/` and `before-manifest.json`. Whole-file AST proofs: `final-ast-proofs/`; each expect node and decoded title is byte-identical, with no test removals. The two Unicode title spellings preserve exact decoded title/fullName bytes.

Related runtime preservation: 808 PASS / 4 unchanged known S5b FAIL, identical fullNames/statuses to the post-sync capture. Refactored harness cases and all five legacy-theme fixture cases pass. Four known quirk failures and Slider uncaught exceptions are pending the separately authorized S5b repairs; they are not accepted final test results. C1 recorded in `runtime-all-refactors/c1.json`. No full stage attempt or GREEN manifest was promoted.

Typed theme fixtures use Vanguard-owned compatibility props or the approved Autocomplete intersection. Five byte-identical defaultProps object literals remain unchanged through createTheme; runtime JSON and function-reference identities are proven in `theme-types/runtime-data-proof.json`. No any/unknown double casts, ts-expect-error directives, or global MUI augmentation.

Private production helpers are moved to module scope with typed bound values. Binding preserves the original new-component-per-parent-render identity and captured value/object references; ordinary directly called render helpers use lowercase names. Existing public signatures and JSX/event bodies are retained. Module-scope test forwardRef components use per-render-tree contexts for observers, avoiding shared mutable test mocks. Existing mount/ref/callback assertions pass unchanged.

Known lint items for team decision: the old 24-error allowance is CLOSED by the user-requested cleanup, with no policy override. The remaining 846 baseline warnings are outside this task; no warning cleanup policy was chosen.

Final S5b closure: the later authorized C/D quirk changes and pointer-capture setup are GREEN in the full3069-case runtime/coverage evidence. They remain outside these lint-only patches. See `mui-upgrade-gates/handoff-s5b.md` for final evidence and text-only commit recommendations. No commits were made.
