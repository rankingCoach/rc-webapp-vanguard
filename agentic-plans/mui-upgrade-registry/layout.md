# Registry: layout/misc group (S0)

Files (all under src/core/):
AIAssistant/AIAssistentPanel/_AIAssistantPanel.mui.spec.tsx, _AIAssistantPanelMuiContract.stories.tsx;
Accordion/_Accordion.mui.spec.tsx, _AccordionMuiContract.stories.tsx; AppBar/_AppBar.mui.spec.tsx, _AppBarMuiContract.stories.tsx;
Toolbar/_Toolbar.mui.spec.tsx, _ToolbarMuiContract.stories.tsx; Collapse/Collapse/_Collapse.mui.spec.tsx, _CollapseMuiContract.stories.tsx;
List/ListShowMore/_ListShowMore.mui.spec.tsx, _ListShowMoreMuiContract.stories.tsx;
Documents/DocumentDisplay/_DocumentDisplay.mui.spec.tsx; Documents/DocumentUpload/_DocumentUpload.mui.spec.tsx.

S2 (pickers7): no reds predicted (no pickers in this group).

Kept MUI-class assertions (all have a production dependency):
`.MuiAccordion-root` Accordion.scss:1, `.MuiAccordionSummary-root` Accordion.scss:16, `.MuiAccordionSummary-content`
Accordion.scss:24, `.MuiAccordionDetails-root` Accordion.scss:30. No other MUI class is asserted (grep src for MuiCollapse,
MuiAppBar, MuiToolbar, MuiPaper-elevation/outlined/rounded, mui-fixed, MuiAccordion-region/-gutters, expandIconWrapper,
Mui-expanded, Mui-focusVisible: no production hit).

## A. Expected reds

| file | test title | expected red at | production dependency (file:line) | observable contract | planned production fix to return it to green |
|---|---|---|---|---|---|
| _Accordion.mui.spec.tsx | [v5-quirk] summary is not exposed as a heading (v6 wraps it in an <h3>) | S3 core6 | Accordion.tsx:73 `<AccordionSummary>` (MUI v6 wraps it in `AccordionHeading` h3) | no heading role in the accordion | Decide: either pass `slots={{ heading: 'div' }}`/`slotProps.heading` (UNVERIFIED API name) in Accordion.tsx to keep no-heading, or approve the h3 as an intentional contract change (better a11y). Not a test edit. |
| _AccordionMuiContract.stories.tsx | ScssOnCollapsed | S3 core6 (6.3), POSSIBLE | Accordion.tsx:73 (summary root becomes native `<button>`); Accordion.scss:16-27 | summary computed layout (justify-content flex-start, padding 0, min-height 48px, content align/margins) | If UA button styles leak (width/text-align/font): add resets to `.MuiAccordionSummary-root` in Accordion.scss (e.g. `width: 100%; text-align: inherit; font: inherit`). |
| _Accordion.mui.spec.tsx | Enter on the focused summary toggles once / Space on the focused summary toggles once | S3 core6 (6.3) or S5 core9, POSSIBLE (UNVERIFIED) | Accordion.tsx:74 `onClick={handleAccordionToggle}` | one toggle + one onExpandedChange per key press | If native-button click + ButtonBase key handling double-fires: guard in handleAccordionToggle or move toggle to Accordion `onChange`. |
| _AIAssistantPanel.mui.spec.tsx | (whole file: fails to import) | S4 core7 | AIAssistantPanel.tsx:15 `@mui/material/Collapse/Collapse`, :16 `@mui/material/Fade/Fade` | all panel status / callback behaviour | Change to `@mui/material/Collapse`, `@mui/material/Fade` (or named imports from `@mui/material`). |
| _AIAssistantPanelMuiContract.stories.tsx | (whole file: fails to import) | S4 core7 | AIAssistantPanel.tsx:15-16 | Grow/Fade/Collapse end states per status | same import fix |
| (tsc, not a runtime test) AppBar.tsx / Toolbar.tsx type-check, Tier C fixtures | n/a | S4 core7 | AppBar.tsx:4 `@mui/material/AppBar/AppBar`, Toolbar.tsx:4 `@mui/material/Toolbar/Toolbar` (type-only imports; erased at runtime, so the specs stay green) | public prop types | `import { AppBarProps, ToolbarProps } from '@mui/material'` (or `@mui/material/AppBar`). Specs derive props via `React.ComponentProps<typeof X>`, so they do not need editing. |
| _Accordion.mui.spec.tsx | [bug-lock] TransitionProps.unmountOnExit is ignored: details stay mounted while collapsed | S5 core9 (tsc only; runtime stays green) | Accordion.tsx:27 `Omit<BaseProps, 'children'>` (public type inherits MUI's TransitionProps) | public type accepts TransitionProps | Add `TransitionProps?` (mapped to `slotProps.transition`) to Vanguard AccordionProps explicitly, or approve its removal as a contract change. Fixing the bug (forwarding) is separate. |

No reds predicted for Collapse, ListShowMore, DocumentDisplay, DocumentUpload, AppBar/Toolbar stories (assertions are visibility /
computed geometry / default-theme colors). UNVERIFIED: MUI default theme values (AppBar palette, Toolbar mixins, Collapse
300ms easeInOut) are assumed unchanged through v9; if one moves, the story goes red and the decision is theme override vs
approved change.

## B. Baseline characterization

| file | test title | tag | what it locks | why it is suspect |
|---|---|---|---|---|
| _Accordion.mui.spec.tsx | [v5-quirk] summary is not exposed as a heading (v6 wraps it in an <h3>) | v5-quirk | no heading role | MUI v5 default, not a Vanguard decision; WAI-ARIA accordion pattern wants a heading |
| _Accordion.mui.spec.tsx | [bug-lock] summary and region both get id=accordionId; aria-controls points at the summary itself | bug-lock | duplicate id; aria-controls -> summary | Accordion.tsx passes `id` and `aria-controls` the same value |
| _Accordion.mui.spec.tsx | [bug-lock] click still toggles while expanded prop is fixed (internal state wins) | bug-lock | `expanded` acts as initial/sync value only | not a real controlled prop |
| _Accordion.mui.spec.tsx | [bug-lock] MUI onChange is never called | bug-lock | onChange dropped | in public type, not forwarded |
| _Accordion.mui.spec.tsx | [bug-lock] disabled does not disable the summary | bug-lock | disabled ignored | in public type, not forwarded |
| _Accordion.mui.spec.tsx | [bug-lock] TransitionProps.unmountOnExit is ignored: details stay mounted while collapsed | bug-lock | TransitionProps ignored | in public type, not forwarded |
| _Accordion.mui.spec.tsx | [bug-lock] className and defaultExpanded are ignored | bug-lock | className/defaultExpanded ignored | in public type, not forwarded |
| _Accordion.mui.spec.tsx | [v5-quirk] ref is not attached to any element | v5-quirk | ref ignored | plain function component, no forwarding |
| _AccordionMuiContract.stories.tsx | [bug-lock] SCSS icon margin never applies | bug-lock | `.Accordion-icon` margin-left 0px | Accordion.scss `&-icon` compiles to `.MuiAccordion-root.Accordion-icon`, matches nothing |
| _AIAssistantPanel.mui.spec.tsx | [bug-lock] forbiddenAjustOptions ["expand"] hides Expand AND Change tone | bug-lock | Change tone gated on 'expand' | AIAssistantPanel.tsx Change tone `<Render if={!forbiddenAjustOptions?.includes('expand')}>` |
| _AIAssistantPanel.mui.spec.tsx | [bug-lock] forbiddenAjustOptions ["changeTone"] does NOT hide Change tone | bug-lock | 'changeTone' has no effect | same |
| _AIAssistantPanel.mui.spec.tsx | [v5-quirk] Enter while open / writing logs "status not supported" | v5-quirk | console.error on Enter in open/writing | document-level listener runs for every status |
| _ListShowMore.mui.spec.tsx | [bug-lock] onShowMore / onShowLess are never called | bug-lock | callbacks ignored | in ListProps, ListShowMore never calls them |
| _DocumentDisplay.mui.spec.tsx | [bug-lock] changing fileMimeType without changing fileSrc does not update the view | bug-lock | stale format | effect deps `[fileSrc]` only |
| _Toolbar.mui.spec.tsx | [v5-quirk] has no implicit role (not role="toolbar") | v5-quirk | no role on Toolbar | MUI default, not a Vanguard decision |
| _Collapse.mui.spec.tsx | [v5-quirk] ref is not forwarded (Vanguard Props have no ref) | v5-quirk | ref ignored | wrapper does not forward ref |
