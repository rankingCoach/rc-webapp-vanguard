# S0 bounded coverage follow-up — 2026-11-03

**RED. S0 is not accepted; no MUI bump.** Parent review, fresh reviewer and overseer remain required.

Ran exactly once in the existing `release/mui-upgrade` worktree:

```sh
bash agentic-plans/mui-upgrade-gates/coverage.sh s0-bounded
```

Exit **1**; watchdog elapsed **478.58 seconds**; Vitest duration **472.60 seconds**. Process group 32081 was created solely for this run, with a 1740-second watchdog and at most 10 seconds of TERM grace before KILL. Watchdog did not fire; no processes were killed. No other runner or diagnostic retry was started. No production/test or gate script edits, subagents, commits, pushes or external messages.

This fresh run was authorized because the runner changed to `--maxWorkers=1 --no-file-parallelism --coverage.reportOnFailure`. All 35 coverage includes and 95% line / 85% branch per-file thresholds remain unchanged. The prior unbounded run remains RED (12 failed tests, 6 infrastructure errors, no coverage artifact); this result does not reinterpret it.

## Test result

**267 files: 1 failed / 266 passed. 2983 tests: 1 failed / 2982 passed.** No unhandled infrastructure error summary was emitted. A missing `typescript.js.map` ENOENT warning is present in the raw log.

Only failed test: `src/core/DatePicker/_DatePickerMuiContract.stories.tsx > Mobile Dialog Layout`: `expect(element).toBeVisible()` received a non-visible MUI button. Raw stack labels it `ClickAwayDisabledStillClosesOnClick` at source line 133, which does not match the failing story; treat that mapping as unreliable. The actual MobileDialogLayout contains OK/Cancel visibility assertions at lines 236–237. The log does not identify which button failed. This assertion failure is unclassified and remains a blocker; no flake claim or isolated retry was made.

## Coverage

All **35/35 expected source files** are present in JSON summary, with no additional files. Overall lines **98.44% (2662/2704)**, branches **90.64% (2307/2545)**, statements **98.39% (4489/4562)**, functions **99.38% (646/650)**. Aggregate success does not satisfy per-file thresholds. **11 files fail, 12 metric shortfalls.**

The table gives exact reported percentages/counts for every included file. “Additional” means minimum additional covered lines/branches needed to meet 95/85 at the current denominator.

| File | Lines covered/total (%) | Branches covered/total (%) | Additional lines / branches |
|---|---:|---:|---:|
| `src/core/AIAssistant/AIAssistentPanel/AIAssistantPanel.tsx` | 140/142 (98.59%) | 79/110 (71.81%) | 0 / 15 |
| `src/core/Accordion/Accordion.tsx` | 30/30 (100%) | 44/45 (97.77%) | 0 / 0 |
| `src/core/AppBar/AppBar.tsx` | 9/9 (100%) | 0/0 (100%) | 0 / 0 |
| `src/core/Autocomplete/Autocomplete.tsx` | 280/282 (99.29%) | 222/269 (82.52%) | 0 / 7 |
| `src/core/AutocompleteWithAnchor/AutocompleteWithAnchor.tsx` | 48/48 (100%) | 22/24 (91.66%) | 0 / 0 |
| `src/core/Button/Button.tsx` | 293/303 (96.69%) | 388/404 (96.03%) | 0 / 0 |
| `src/core/Collapse/Collapse/Collapse.tsx` | 9/9 (100%) | 0/0 (100%) | 0 / 0 |
| `src/core/DatePicker/DatePicker.tsx` | 77/77 (100%) | 44/44 (100%) | 0 / 0 |
| `src/core/DateRangeInput/DateRangeInput.tsx` | 78/78 (100%) | 36/52 (69.23%) | 0 / 9 |
| `src/core/DateRangePicker/DateRangePicker.tsx` | 360/362 (99.44%) | 311/347 (89.62%) | 0 / 0 |
| `src/core/DateRangePicker/DateRangePickerBase/DateRangePickerBaseInputAdornment/DateRangePickerBaseInputAdornment.tsx` | 11/11 (100%) | 2/4 (50%) | 0 / 2 |
| `src/core/Documents/DocumentDisplay/DocumentDisplay.tsx` | 34/37 (91.89%) | 18/20 (90%) | 2 / 0 |
| `src/core/Documents/DocumentUpload/DocumentUpload.tsx` | 59/60 (98.33%) | 35/42 (83.33%) | 0 / 1 |
| `src/core/Drawer/Drawer.tsx` | 21/21 (100%) | 50/51 (98.03%) | 0 / 0 |
| `src/core/DropdownMenu/DropdownMenu.tsx` | 55/58 (94.82%) | 38/42 (90.47%) | 1 / 0 |
| `src/core/FlagAdornment/FlagAdornment.tsx` | 11/11 (100%) | 0/0 (100%) | 0 / 0 |
| `src/core/FormControl/FormControl.tsx` | 9/9 (100%) | 0/0 (100%) | 0 / 0 |
| `src/core/Input/Input.tsx` | 11/11 (100%) | 6/6 (100%) | 0 / 0 |
| `src/core/List/ListShowMore/ListShowMore.tsx` | 26/26 (100%) | 11/12 (91.66%) | 0 / 0 |
| `src/core/Menu/Menu.tsx` | 27/27 (100%) | 26/26 (100%) | 0 / 0 |
| `src/core/MenuItem/MenuItem.tsx` | 17/17 (100%) | 40/42 (95.23%) | 0 / 0 |
| `src/core/Popover/Popover.tsx` | 68/68 (100%) | 45/50 (90%) | 0 / 0 |
| `src/core/Popover/PopoverPopper/PopoverPopper.tsx` | 6/6 (100%) | 3/4 (75%) | 0 / 1 |
| `src/core/PopoverModal/PopoverModal.tsx` | 104/104 (100%) | 83/99 (83.83%) | 0 / 2 |
| `src/core/ProgressBar/ProgressBar.tsx` | 19/19 (100%) | 26/26 (100%) | 0 / 0 |
| `src/core/SearchableSelect/SearchableSelect.tsx` | 86/86 (100%) | 77/80 (96.25%) | 0 / 0 |
| `src/core/Select/Select.tsx` | 97/101 (96.03%) | 99/110 (90%) | 0 / 0 |
| `src/core/Slider/Slider.tsx` | 50/58 (86.2%) | 32/38 (84.21%) | 6 / 1 |
| `src/core/Snackbar/Snackbar.tsx` | 9/9 (100%) | 0/0 (100%) | 0 / 0 |
| `src/core/SnackbarRoot/SnackbarRoot.tsx` | 33/33 (100%) | 3/4 (75%) | 0 / 1 |
| `src/core/ToggleButton/ToggleButton.tsx` | 9/9 (100%) | 0/0 (100%) | 0 / 0 |
| `src/core/ToggleButtonGroup/ToggleButtonGroup.tsx` | 9/9 (100%) | 0/0 (100%) | 0 / 0 |
| `src/core/Toolbar/Toolbar.tsx` | 9/9 (100%) | 0/0 (100%) | 0 / 0 |
| `src/core/_internal/InputBase/InputBase.tsx` | 552/559 (98.74%) | 567/594 (95.45%) | 0 / 0 |
| `src/helpers/hex-to-rgba.ts` | 6/6 (100%) | 0/0 (100%) | 0 / 0 |

## Uncovered locations and limits

Exact text-reporter uncovered locations for failing files (the text column can include uncovered branch locations even when lines are 100%):

| File | Text reporter uncovered locations | Uncovered branch count |
|---|---|---:|
| AIAssistantPanel.tsx | 39,41 | 31 |
| Autocomplete.tsx | 58–59 | 47 |
| DateRangeInput.tsx | 33–36,44,59–67 | 16 |
| DateRangePickerBaseInputAdornment.tsx | 15 | 2 |
| DocumentDisplay.tsx | 19–21 | 2 |
| DocumentUpload.tsx | 38 | 7 |
| DropdownMenu.tsx | 33–35 | 4 |
| PopoverPopper.tsx | 14 | 1 |
| PopoverModal.tsx | 46–62,67 | 16 |
| Slider.tsx | 19–25,30 | 6 |
| SnackbarRoot.tsx | 35 | 1 |

**Exact individual uncovered branch identities/ranges are unavailable:** configured reporters emitted only `coverage-summary.json` and terminal text, with no branch map or coverage-final JSON. Do not infer branch identities from the combined text location column. Button and InputBase passing-file location strings are truncated by the text reporter; raw table is preserved below. No suite retry was made to obtain another reporter. A future explicitly authorized instrumentation run with a detailed reporter would be needed for complete branch mapping.

## Resources and artifacts

Before: load **3.80 / 8.02 / 14.08**, memory free **59%**. After: load **5.34 / 5.84 / 10.33**, memory free **48%**. Sampled one-minute load peaked at 6.20 (samples are not a continuous peak measurement). Full process snapshots are retained. No unrelated Chromium or shot.mjs process was terminated.

Artifacts relative to this gate directory:

- `out/s0-bounded/coverage-run.log`: complete raw stdout/stderr.
- `out/s0-bounded/coverage-exit.txt`, `coverage-result.json`: exit and elapsed/watchdog result.
- `out/s0-bounded/coverage-process.json`: command, PID/PGID, watchdog limit.
- `out/s0-bounded/coverage-resources-before.txt`, `coverage-resources-after.txt`: date/load/memory/process snapshots.
- `out/s0-bounded/coverage/coverage-summary.json`: exact all-file counts.

Remaining: resolve/classify the DatePicker visibility assertion and cover the 12 metric shortfalls without weakening tests or thresholds; obtain detailed branch mapping if required for remediation. Parent must review results and arrange fresh reviewer/overseer before S0 acceptance. No completion CR draft is possible yet: S0 remains incomplete and no ticket/PR exists in the plan.

## Raw final result and coverage text

```text
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |storybook (chromium)| src/core/DatePicker/_DatePickerMuiContract.stories.tsx > Mobile Dialog Layout
Error: 
Click to debug the error directly in Storybook: http://localhost:6006/?path=/story/datepicker-datepickermuicontract--mobile-dialog-layout&addonPanel=storybook/interactions/panel

expect(element).toBeVisible()

Received element is not visible:
  <button
  class="MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-colorPrimary MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-colorPrimary css-1e6y48t-MuiButtonBase-root-MuiButton-root"
  tabindex="0"
  type="button"
/>
 ❯ ClickAwayDisabledStillClosesOnClick src/core/DatePicker/_DatePickerMuiContract.stories.tsx:133:13
    131| export const StackingZIndex: Story = {
    132|   render: () => <Stage value={MARCH_15_2024} />,
    133|   play: async ({ canvasElement }) => {
       |             ^
    134|     OverlayStackingService.__resetForTests();
    135|     const { popper } = await openCalendar(canvasElement);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 266 passed (267)
      Tests  1 failed | 2982 passed (2983)
   Start at  19:53:11
   Duration  472.60s (transform 8.78s, setup 159.54s, import 41.46s, tests 312.42s, environment 25.14s)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   98.39 |    90.64 |   99.38 |   98.44 |                   
 ...AssistentPanel |   98.92 |    71.81 |     100 |   98.59 |                   
  ...tantPanel.tsx |   98.92 |    71.81 |     100 |   98.59 | 39,41             
 core/Accordion    |     100 |    97.77 |     100 |     100 |                   
  Accordion.tsx    |     100 |    97.77 |     100 |     100 | 6                 
 core/Autocomplete |   98.76 |    82.52 |     100 |   99.29 |                   
  Autocomplete.tsx |   98.76 |    82.52 |     100 |   99.29 | 58-59             
 ...leteWithAnchor |     100 |    91.66 |     100 |     100 |                   
  ...ithAnchor.tsx |     100 |    91.66 |     100 |     100 | 36,48             
 core/Button       |   95.98 |    96.03 |     100 |   96.69 |                   
  Button.tsx       |   95.98 |    96.03 |     100 |   96.69 | ...72-173,178-183 
 ...DateRangeInput |     100 |    69.23 |     100 |     100 |                   
  ...angeInput.tsx |     100 |    69.23 |     100 |     100 | 33-36,44,59-67    
 ...ateRangePicker |   99.35 |    89.62 |   98.82 |   99.44 |                   
  ...ngePicker.tsx |   99.35 |    89.62 |   98.82 |   99.44 | 442,490           
 ...InputAdornment |     100 |       50 |     100 |     100 |                   
  ...Adornment.tsx |     100 |       50 |     100 |     100 | 15                
 ...ocumentDisplay |   90.16 |       90 |    90.9 |   91.89 |                   
  ...ntDisplay.tsx |   90.16 |       90 |    90.9 |   91.89 | 19-21             
 ...DocumentUpload |   96.93 |    83.33 |     100 |   98.33 |                   
  ...entUpload.tsx |   96.93 |    83.33 |     100 |   98.33 | 38                
 core/Drawer       |     100 |    98.03 |     100 |     100 |                   
  Drawer.tsx       |     100 |    98.03 |     100 |     100 | 41                
 core/DropdownMenu |   95.23 |    90.47 |     100 |   94.82 |                   
  DropdownMenu.tsx |   95.23 |    90.47 |     100 |   94.82 | 33-35             
 ...t/ListShowMore |     100 |    91.66 |     100 |     100 |                   
  ListShowMore.tsx |     100 |    91.66 |     100 |     100 | 17                
 core/MenuItem     |     100 |    95.23 |     100 |     100 |                   
  MenuItem.tsx     |     100 |    95.23 |     100 |     100 | 7-10              
 core/Popover      |     100 |       90 |     100 |     100 |                   
  Popover.tsx      |     100 |       90 |     100 |     100 | 39,57,82,107      
 .../PopoverPopper |     100 |       75 |     100 |     100 |                   
  ...verPopper.tsx |     100 |       75 |     100 |     100 | 14                
 core/PopoverModal |     100 |    83.83 |     100 |     100 |                   
  PopoverModal.tsx |     100 |    83.83 |     100 |     100 | 46-62,67          
 ...archableSelect |     100 |    96.25 |     100 |     100 |                   
  ...bleSelect.tsx |     100 |    96.25 |     100 |     100 | 45,95,108         
 core/Select       |   96.71 |       90 |     100 |   96.03 |                   
  Select.tsx       |   96.71 |       90 |     100 |   96.03 | 28,46,50,156      
 core/Slider       |   84.52 |    84.21 |     100 |    86.2 |                   
  Slider.tsx       |   84.52 |    84.21 |     100 |    86.2 | 19-25,30          
 core/SnackbarRoot |     100 |       75 |     100 |     100 |                   
  SnackbarRoot.tsx |     100 |       75 |     100 |     100 | 35                
 ...rnal/InputBase |   99.06 |    95.45 |   98.26 |   98.74 |                   
  InputBase.tsx    |   99.06 |    95.45 |   98.26 |   98.74 | ...82-183,899-900 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 98.39% ( 4489/4562 )
Branches     : 90.64% ( 2307/2545 )
Functions    : 99.38% ( 646/650 )
Lines        : 98.44% ( 2662/2704 )
================================================================================
ERROR: Coverage for branches (69.23%) does not meet global threshold (85%) for src/core/DateRangeInput/DateRangeInput.tsx
ERROR: Coverage for branches (71.81%) does not meet global threshold (85%) for src/core/AIAssistant/AIAssistentPanel/AIAssistantPanel.tsx
ERROR: Coverage for branches (82.52%) does not meet global threshold (85%) for src/core/Autocomplete/Autocomplete.tsx
ERROR: Coverage for branches (50%) does not meet global threshold (85%) for src/core/DateRangePicker/DateRangePickerBase/DateRangePickerBaseInputAdornment/DateRangePickerBaseInputAdornment.tsx
ERROR: Coverage for lines (91.89%) does not meet global threshold (95%) for src/core/Documents/DocumentDisplay/DocumentDisplay.tsx
ERROR: Coverage for branches (83.33%) does not meet global threshold (85%) for src/core/Documents/DocumentUpload/DocumentUpload.tsx
ERROR: Coverage for lines (94.82%) does not meet global threshold (95%) for src/core/DropdownMenu/DropdownMenu.tsx
ERROR: Coverage for branches (75%) does not meet global threshold (85%) for src/core/Popover/PopoverPopper/PopoverPopper.tsx
ERROR: Coverage for lines (86.2%) does not meet global threshold (95%) for src/core/Slider/Slider.tsx
ERROR: Coverage for branches (84.21%) does not meet global threshold (85%) for src/core/Slider/Slider.tsx
ERROR: Coverage for branches (83.83%) does not meet global threshold (85%) for src/core/PopoverModal/PopoverModal.tsx
ERROR: Coverage for branches (75%) does not meet global threshold (85%) for src/core/SnackbarRoot/SnackbarRoot.tsx

```

## Parent mapping diagnosis and focused fixes

The 11-file shortfall list above is superseded as an acceptance measurement pending corrected mapping. Several
reported locations were erased TypeScript types/imports. No tests were added to chase those locations.

Focused existing Slider spec + browser stories reproduced the mapping problem: 86.20% lines, with uncovered
statements mapped into `SliderProps`. Disabling Istanbul alone still gave 89.36% and invalid type locations.
The inherited `vite-plugin-ts` transpiles TypeScript before generating its Babel map; coverage mapped the erased
output back to original TS lines. V8 gate mode now omits both Istanbul plugins and that legacy TS plugin, allowing
Vite's TS transform to preserve original locations. Normal Storybook mode retains the existing configuration.
`coverage.sh` selects this mode explicitly and now also emits detailed JSON branch maps.

Red/green evidence: coverage selftest first rejected the missing V8-only environment flag (exit94), then passed
when the gate set it. Existing Slider behavioral coverage failed the95% assertion before the mapping correction.
A first corrected combined run had a browser runner initialization error (retained in `slider-mapping-corrected`),
so its partial100% spec result was not accepted. Focused browser diagnostic then passed10/10 with valid locations
58–63,70,78,91. Final combined Slider spec/stories + DatePicker contract stories passed65/65, Slider100% lines
(26/26) and branches(19/19), exit0 with unchanged95/85 thresholds. Raw transcript:
`/tmp/mui-upgrade/mapping-and-mobile-fixed.log`; JSON/maps under `out/mapping-and-mobile-fixed/`.

Mobile picker: replaced the paper element's computed-opacity wait with observable dialog visibility, because
its fading ancestor determines whether action buttons are visible. The focused instrumented DatePicker stories
now pass. Original bounded failure remains in the raw history. Full corrected coverage gate still required.
