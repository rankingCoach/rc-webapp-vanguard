# S4b implementation evidence — in progress

Accepted S4a baseline snapshotted before edits: `/tmp/mui-upgrade/s4b-before/accepted-inputs.tar.gz`, hashes.json, test-hashes.json (5187 files). Only package.json and pnpm-lock.yaml changed initially. Original492 and490 hashes match with the retained three approved exceptions; snapshot-integrity.json records proof. Accepted tar remains untouched.

Picker-only exact pin7.29.4→8.29.5; install raw/reported0,10.373s, legacy peer setting explicitly false. Core unchanged.

Initial unchanged targeted spec:249PASS/136FAIL across15files; raw/reported1,42.844s, no timeout, mach_continuous_time, inhibit=True reaped. C1 all three notincluded. Complete raw JSON: out/s4b-unchanged-picker-spec/vitest.json; exact-red-set.json includes fullName/status/duration/failureMessages. No production edit preceded this run. Initial escalation was sent; overseer clarified initial dependency RED authorizes scoped production repair and is not itself a halt.

Exact initial failed assertions and messages:

```json
[
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: rendering"
    ],
    "fullName": "DatePicker contract: rendering renders a single text input with autocomplete disabled and the calendar closed",
    "status": "failed",
    "title": "renders a single text input with autocomplete disabled and the calendar closed",
    "duration": 38.73091700000077,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: rendering"
    ],
    "fullName": "DatePicker contract: rendering [v5-quirk] input is rendered as type=\"tel\" (numeric keyboard on mobile)",
    "status": "failed",
    "title": "[v5-quirk] input is rendered as type=\"tel\" (numeric keyboard on mobile)",
    "duration": 5.764040999999452,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: rendering"
    ],
    "fullName": "DatePicker contract: rendering renders the Vanguard calendar icon next to the input (not the MUI open-picker button)",
    "status": "failed",
    "title": "renders the Vanguard calendar icon next to the input (not the MUI open-picker button)",
    "duration": 6.0607910000007905,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: rendering"
    ],
    "fullName": "DatePicker contract: rendering [bug-lock] clicking the Vanguard calendar icon does not open the calendar",
    "status": "failed",
    "title": "[bug-lock] clicking the Vanguard calendar icon does not open the calendar",
    "duration": 2.6991250000000946,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: rendering"
    ],
    "fullName": "DatePicker contract: rendering label is rendered with the \"Optional\" suffix when not required",
    "status": "failed",
    "title": "label is rendered with the \"Optional\" suffix when not required",
    "duration": 4.754791999999725,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: rendering"
    ],
    "fullName": "DatePicker contract: rendering required: no \"Optional\" suffix, asterisk in label, input has the required attribute",
    "status": "failed",
    "title": "required: no \"Optional\" suffix, asterisk in label, input has the required attribute",
    "duration": 2.2413329999999405,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: rendering"
    ],
    "fullName": "DatePicker contract: rendering without label no <label> is rendered",
    "status": "failed",
    "title": "without label no <label> is rendered",
    "duration": 9.914999999999964,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern en_US shows 03/15/2024",
    "status": "failed",
    "title": "en_US shows 03/15/2024",
    "duration": 5.046959000000243,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern en_GB shows 15/03/2024",
    "status": "failed",
    "title": "en_GB shows 15/03/2024",
    "duration": 7.341833000000406,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern de_DE shows 15.03.2024",
    "status": "failed",
    "title": "de_DE shows 15.03.2024",
    "duration": 2.1731669999999212,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern de_AT shows 15.03.2024",
    "status": "failed",
    "title": "de_AT shows 15.03.2024",
    "duration": 1.9999580000003334,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern fr_FR shows 15/03/2024",
    "status": "failed",
    "title": "fr_FR shows 15/03/2024",
    "duration": 14.013208000000304,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern nl_NL shows 15-03-2024",
    "status": "failed",
    "title": "nl_NL shows 15-03-2024",
    "duration": 2.5394999999998618,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern es_ES shows 15/03/2024",
    "status": "failed",
    "title": "es_ES shows 15/03/2024",
    "duration": 1.9785000000001673,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern it_IT shows 15/03/2024",
    "status": "failed",
    "title": "it_IT shows 15/03/2024",
    "duration": 1.908542000000125,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern pl_PL shows 2024-03-15",
    "status": "failed",
    "title": "pl_PL shows 2024-03-15",
    "duration": 1.7432920000001104,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern pt_PT shows 15/03/2024",
    "status": "failed",
    "title": "pt_PT shows 15/03/2024",
    "duration": 6.78229199999987,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern ja_JP shows 2024/03/15",
    "status": "failed",
    "title": "ja_JP shows 2024/03/15",
    "duration": 3.1169580000005226,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern id_ID shows 15/03/2024",
    "status": "failed",
    "title": "id_ID shows 15/03/2024",
    "duration": 11.972749999999905,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern fi_FI shows 15.03.2024",
    "status": "failed",
    "title": "fi_FI shows 15.03.2024",
    "duration": 5.632790999999997,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern sk_SK shows 15.03.2024",
    "status": "failed",
    "title": "sk_SK shows 15.03.2024",
    "duration": 2.3736670000007507,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern sv_SE shows 2024-03-15",
    "status": "failed",
    "title": "sv_SE shows 2024-03-15",
    "duration": 1.9882500000003347,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern cs_CZ shows 15.03.2024",
    "status": "failed",
    "title": "cs_CZ shows 15.03.2024",
    "duration": 1.805583999999726,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern el_GR shows 15/03/2024",
    "status": "failed",
    "title": "el_GR shows 15/03/2024",
    "duration": 1.7200830000001588,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern [v5-quirk] en_US empty field placeholder is the lower-case pattern mm/dd/yyyy",
    "status": "failed",
    "title": "[v5-quirk] en_US empty field placeholder is the lower-case pattern mm/dd/yyyy",
    "duration": 1.8340410000000702,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern [v5-quirk] en_GB empty field placeholder is the lower-case pattern dd/mm/yyyy",
    "status": "failed",
    "title": "[v5-quirk] en_GB empty field placeholder is the lower-case pattern dd/mm/yyyy",
    "duration": 25.522875000000568,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern [v5-quirk] de_DE empty field placeholder is the lower-case pattern dd.mm.yyyy",
    "status": "failed",
    "title": "[v5-quirk] de_DE empty field placeholder is the lower-case pattern dd.mm.yyyy",
    "duration": 2.3026669999999285,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern [v5-quirk] nl_NL empty field placeholder is the lower-case pattern dd-mm-yyyy",
    "status": "failed",
    "title": "[v5-quirk] nl_NL empty field placeholder is the lower-case pattern dd-mm-yyyy",
    "duration": 1.6155420000004597,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern [v5-quirk] pl_PL empty field placeholder is the lower-case pattern yyyy-mm-dd",
    "status": "failed",
    "title": "[v5-quirk] pl_PL empty field placeholder is the lower-case pattern yyyy-mm-dd",
    "duration": 1.5838330000005953,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern [v5-quirk] ja_JP empty field placeholder is the lower-case pattern yyyy/mm/dd",
    "status": "failed",
    "title": "[v5-quirk] ja_JP empty field placeholder is the lower-case pattern yyyy/mm/dd",
    "duration": 1.56054099999983,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern [bug-lock] en-US (not in the pattern map) falls back to DD.MM.YYYY and logs an error",
    "status": "failed",
    "title": "[bug-lock] en-US (not in the pattern map) falls back to DD.MM.YYYY and logs an error",
    "duration": 2.1844579999997222,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern [bug-lock] de-DE (not in the pattern map) falls back to DD.MM.YYYY and logs an error",
    "status": "failed",
    "title": "[bug-lock] de-DE (not in the pattern map) falls back to DD.MM.YYYY and logs an error",
    "duration": 1.6585000000004584,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern [bug-lock] fr-FR (not in the pattern map) falls back to DD.MM.YYYY and logs an error",
    "status": "failed",
    "title": "[bug-lock] fr-FR (not in the pattern map) falls back to DD.MM.YYYY and logs an error",
    "duration": 1.6170419999998558,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern [bug-lock] en-GB (not in the pattern map) falls back to DD.MM.YYYY and logs an error",
    "status": "failed",
    "title": "[bug-lock] en-GB (not in the pattern map) falls back to DD.MM.YYYY and logs an error",
    "duration": 1.59283300000061,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: locale format pattern"
    ],
    "fullName": "DatePicker contract: locale format pattern [bug-lock] xx_XX (not in the pattern map) falls back to DD.MM.YYYY and logs an error",
    "status": "failed",
    "title": "[bug-lock] xx_XX (not in the pattern map) falls back to DD.MM.YYYY and logs an error",
    "duration": 1.9038329999993948,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: value"
    ],
    "fullName": "DatePicker contract: value value is interpreted as a millisecond timestamp",
    "status": "failed",
    "title": "value is interpreted as a millisecond timestamp",
    "duration": 11.058500000000095,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: value"
    ],
    "fullName": "DatePicker contract: value [bug-lock] a unix-seconds value is NOT normalised (only minDate/maxDate are)",
    "status": "failed",
    "title": "[bug-lock] a unix-seconds value is NOT normalised (only minDate/maxDate are)",
    "duration": 10.400166999999783,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: value"
    ],
    "fullName": "DatePicker contract: value undefined value renders an empty, valid input",
    "status": "failed",
    "title": "undefined value renders an empty, valid input",
    "duration": 1.8082500000000437,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: value"
    ],
    "fullName": "DatePicker contract: value null value renders an empty, valid input",
    "status": "failed",
    "title": "null value renders an empty, valid input",
    "duration": 1.512166999999863,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: value"
    ],
    "fullName": "DatePicker contract: value invalid value (NaN) renders an empty input flagged aria-invalid",
    "status": "failed",
    "title": "invalid value (NaN) renders an empty input flagged aria-invalid",
    "duration": 1.6205829999998969,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: value"
    ],
    "fullName": "DatePicker contract: value a new value prop re-renders the displayed date",
    "status": "failed",
    "title": "a new value prop re-renders the displayed date",
    "duration": 1.7087090000004537,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: value"
    ],
    "fullName": "DatePicker contract: value [bug-lock] the picker is fully controlled: without a parent updating `value` the input keeps the old date",
    "status": "failed",
    "title": "[bug-lock] the picker is fully controlled: without a parent updating `value` the input keeps the old date",
    "duration": 12.42229099999986,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: onChange payload"
    ],
    "fullName": "DatePicker contract: onChange payload picking a day emits a millisecond timestamp (moment.valueOf()) and keeps the time of the current value",
    "status": "failed",
    "title": "picking a day emits a millisecond timestamp (moment.valueOf()) and keeps the time of the current value",
    "duration": 2.6202089999997042,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: onChange payload"
    ],
    "fullName": "DatePicker contract: onChange payload picking a day with no value emits local midnight of that day (not \"now\" time)",
    "status": "failed",
    "title": "picking a day with no value emits local midnight of that day (not \"now\" time)",
    "duration": 2.615834000000177,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: onChange payload"
    ],
    "fullName": "DatePicker contract: onChange payload typing a full date emits the ms timestamp of local midnight as the last payload",
    "status": "failed",
    "title": "typing a full date emits the ms timestamp of local midnight as the last payload",
    "duration": 1.7827919999999722,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: onChange payload"
    ],
    "fullName": "DatePicker contract: onChange payload [v5-quirk] typing a full date: NaN for every incomplete keystroke, 8 calls for 10 keys",
    "status": "failed",
    "title": "[v5-quirk] typing a full date: NaN for every incomplete keystroke, 8 calls for 10 keys",
    "duration": 1.8492919999998776,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: onChange payload"
    ],
    "fullName": "DatePicker contract: onChange payload typing in de_DE (20.03.2024) emits the same ms timestamp and shows 20.03.2024",
    "status": "failed",
    "title": "typing in de_DE (20.03.2024) emits the same ms timestamp and shows 20.03.2024",
    "duration": 3.9234590000005483,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: onChange payload"
    ],
    "fullName": "DatePicker contract: onChange payload typing in en_GB (20032024) emits the same ms timestamp and shows 20/03/2024",
    "status": "failed",
    "title": "typing in en_GB (20032024) emits the same ms timestamp and shows 20/03/2024",
    "duration": 2.7268749999993815,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: onChange payload"
    ],
    "fullName": "DatePicker contract: onChange payload typing in fr_FR (20/03/2024) emits the same ms timestamp and shows 20/03/2024",
    "status": "failed",
    "title": "typing in fr_FR (20/03/2024) emits the same ms timestamp and shows 20/03/2024",
    "duration": 2.219583000000057,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: onChange payload"
    ],
    "fullName": "DatePicker contract: onChange payload [v5-quirk] typing a partial date emits NaN (invalid moment) and keeps the partial text",
    "status": "failed",
    "title": "[v5-quirk] typing a partial date emits NaN (invalid moment) and keeps the partial text",
    "duration": 2.64416699999947,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: onChange payload"
    ],
    "fullName": "DatePicker contract: onChange payload typing an impossible date keeps the text and marks the input aria-invalid",
    "status": "failed",
    "title": "typing an impossible date keeps the text and marks the input aria-invalid",
    "duration": 3.537666999999601,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: onChange payload"
    ],
    "fullName": "DatePicker contract: onChange payload [v5-quirk] typing an impossible date emits NaN on every keystroke",
    "status": "failed",
    "title": "[v5-quirk] typing an impossible date emits NaN on every keystroke",
    "duration": 2.896042000000307,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: onChange payload"
    ],
    "fullName": "DatePicker contract: onChange payload [v5-quirk] deleting one character of a complete date emits NaN",
    "status": "failed",
    "title": "[v5-quirk] deleting one character of a complete date emits NaN",
    "duration": 5.312707999999475,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: onChange payload"
    ],
    "fullName": "DatePicker contract: onChange payload clearing the input emits undefined (null?.valueOf()), not null",
    "status": "failed",
    "title": "clearing the input emits undefined (null?.valueOf()), not null",
    "duration": 5.238292000000001,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: onChange payload"
    ],
    "fullName": "DatePicker contract: onChange payload without onChange, picking a day does not throw and closes the calendar",
    "status": "failed",
    "title": "without onChange, picking a day does not throw and closes the calendar",
    "duration": 2.0670000000000073,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: open / close"
    ],
    "fullName": "DatePicker contract: open / close click on the input opens the calendar in a portal outside the component, on the month of the value",
    "status": "failed",
    "title": "click on the input opens the calendar in a portal outside the component, on the month of the value",
    "duration": 2.484958000000006,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: open / close"
    ],
    "fullName": "DatePicker contract: open / close click anywhere on the field wrapper (not only the <input>) opens the calendar",
    "status": "failed",
    "title": "click anywhere on the field wrapper (not only the <input>) opens the calendar",
    "duration": 3.918874999999389,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: open / close"
    ],
    "fullName": "DatePicker contract: open / close calendar popper requests placement bottom-end",
    "status": "failed",
    "title": "calendar popper requests placement bottom-end",
    "duration": 5.838624999999411,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: open / close"
    ],
    "fullName": "DatePicker contract: open / close calendar paper carries the Vanguard paper class (shadow + radius)",
    "status": "failed",
    "title": "calendar paper carries the Vanguard paper class (shadow + radius)",
    "duration": 2.804500000000189,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: open / close"
    ],
    "fullName": "DatePicker contract: open / close field is shown as focused while the calendar is open and not focused once it closes",
    "status": "failed",
    "title": "field is shown as focused while the calendar is open and not focused once it closes",
    "duration": 1.8451670000004015,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: open / close"
    ],
    "fullName": "DatePicker contract: open / close Escape closes the calendar without emitting onChange",
    "status": "failed",
    "title": "Escape closes the calendar without emitting onChange",
    "duration": 1.7684580000004644,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: open / close"
    ],
    "fullName": "DatePicker contract: open / close selecting a day closes the calendar",
    "status": "failed",
    "title": "selecting a day closes the calendar",
    "duration": 1.802042000000256,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: open / close"
    ],
    "fullName": "DatePicker contract: open / close month arrows navigate without emitting onChange or closing",
    "status": "failed",
    "title": "month arrows navigate without emitting onChange or closing",
    "duration": 5.252250000000458,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: open / close"
    ],
    "fullName": "DatePicker contract: open / close [v5-quirk] year view: picking a year emits onChange immediately and stays open on the day view",
    "status": "failed",
    "title": "[v5-quirk] year view: picking a year emits onChange immediately and stays open on the day view",
    "duration": 3.384874999999738,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: overlay stacking (OverlayStackingService)"
    ],
    "fullName": "DatePicker contract: overlay stacking (OverlayStackingService) registers a popover slot on open and applies it as the popper z-index",
    "status": "failed",
    "title": "registers a popover slot on open and applies it as the popper z-index",
    "duration": 3.19341600000007,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: overlay stacking (OverlayStackingService)"
    ],
    "fullName": "DatePicker contract: overlay stacking (OverlayStackingService) stacks above a modal that raised the stacking floor",
    "status": "failed",
    "title": "stacks above a modal that raised the stacking floor",
    "duration": 2.5196249999999054,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: overlay stacking (OverlayStackingService)"
    ],
    "fullName": "DatePicker contract: overlay stacking (OverlayStackingService) unregisters on close (Escape) and on close by day selection",
    "status": "failed",
    "title": "unregisters on close (Escape) and on close by day selection",
    "duration": 1.9533329999994749,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: overlay stacking (OverlayStackingService)"
    ],
    "fullName": "DatePicker contract: overlay stacking (OverlayStackingService) unregisters when unmounted while open",
    "status": "failed",
    "title": "unregisters when unmounted while open",
    "duration": 2.1835000000000946,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: minDate / maxDate / disablePast"
    ],
    "fullName": "DatePicker contract: minDate / maxDate / disablePast min/max as unix seconds disable the days outside the range",
    "status": "failed",
    "title": "min/max as unix seconds disable the days outside the range",
    "duration": 3.0672910000002958,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: minDate / maxDate / disablePast"
    ],
    "fullName": "DatePicker contract: minDate / maxDate / disablePast min/max as milliseconds (13 digits, normalised) disable the days outside the range",
    "status": "failed",
    "title": "min/max as milliseconds (13 digits, normalised) disable the days outside the range",
    "duration": 1.939166999999543,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: minDate / maxDate / disablePast"
    ],
    "fullName": "DatePicker contract: minDate / maxDate / disablePast minDate/maxDate = 0 means \"no limit\"",
    "status": "failed",
    "title": "minDate/maxDate = 0 means \"no limit\"",
    "duration": 1.7553750000006403,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: minDate / maxDate / disablePast"
    ],
    "fullName": "DatePicker contract: minDate / maxDate / disablePast minDate/maxDate = NaN means \"no limit\"",
    "status": "failed",
    "title": "minDate/maxDate = NaN means \"no limit\"",
    "duration": 1.8270419999998921,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: minDate / maxDate / disablePast"
    ],
    "fullName": "DatePicker contract: minDate / maxDate / disablePast clicking a disabled day does not emit onChange and keeps the calendar open",
    "status": "failed",
    "title": "clicking a disabled day does not emit onChange and keeps the calendar open",
    "duration": 1.6364999999996144,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: minDate / maxDate / disablePast"
    ],
    "fullName": "DatePicker contract: minDate / maxDate / disablePast [v5-quirk] typing a date after maxDate still emits it, and flags the input aria-invalid",
    "status": "failed",
    "title": "[v5-quirk] typing a date after maxDate still emits it, and flags the input aria-invalid",
    "duration": 1.5553749999999127,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: minDate / maxDate / disablePast"
    ],
    "fullName": "DatePicker contract: minDate / maxDate / disablePast [v5-quirk] typing a date before minDate still emits it, and flags the input aria-invalid",
    "status": "failed",
    "title": "[v5-quirk] typing a date before minDate still emits it, and flags the input aria-invalid",
    "duration": 6.6973339999995005,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: minDate / maxDate / disablePast"
    ],
    "fullName": "DatePicker contract: minDate / maxDate / disablePast disablePast disables the days before today (frozen clock) and the previous-month arrow",
    "status": "failed",
    "title": "disablePast disables the days before today (frozen clock) and the previous-month arrow",
    "duration": 3.0498749999997017,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: minDate / maxDate / disablePast"
    ],
    "fullName": "DatePicker contract: minDate / maxDate / disablePast a past value with disablePast is shown but flagged aria-invalid",
    "status": "failed",
    "title": "a past value with disablePast is shown but flagged aria-invalid",
    "duration": 2.343499999999949,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: formconfig"
    ],
    "fullName": "DatePicker contract: formconfig error from formconfig renders the error message; required comes from formconfig.validation",
    "status": "failed",
    "title": "error from formconfig renders the error message; required comes from formconfig.validation",
    "duration": 1.7039169999998194,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: formconfig"
    ],
    "fullName": "DatePicker contract: formconfig [bug-lock] formconfig error is NOT reflected as aria-invalid (MUI validation state wins)",
    "status": "failed",
    "title": "[bug-lock] formconfig error is NOT reflected as aria-invalid (MUI validation state wins)",
    "duration": 1.988166999999521,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: formconfig"
    ],
    "fullName": "DatePicker contract: formconfig [bug-lock] formconfig._inputRef is NOT bound to the input (MUI inputRef wins)",
    "status": "failed",
    "title": "[bug-lock] formconfig._inputRef is NOT bound to the input (MUI inputRef wins)",
    "duration": 6.522707999999511,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: formconfig"
    ],
    "fullName": "DatePicker contract: formconfig without formconfig error no error text is rendered",
    "status": "failed",
    "title": "without formconfig error no error text is rendered",
    "duration": 1.7792499999995925,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: closeOnCLickAway"
    ],
    "fullName": "DatePicker contract: closeOnCLickAway false (default): mousedown outside keeps the calendar open",
    "status": "failed",
    "title": "false (default): mousedown outside keeps the calendar open",
    "duration": 3.0582079999994676,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: closeOnCLickAway"
    ],
    "fullName": "DatePicker contract: closeOnCLickAway [v5-quirk] false (default): a full click outside still closes it (MUI popper click-away)",
    "status": "failed",
    "title": "[v5-quirk] false (default): a full click outside still closes it (MUI popper click-away)",
    "duration": 2.381083000000217,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: closeOnCLickAway"
    ],
    "fullName": "DatePicker contract: closeOnCLickAway true: mousedown outside closes the calendar and releases the stacking slot",
    "status": "failed",
    "title": "true: mousedown outside closes the calendar and releases the stacking slot",
    "duration": 5.664040999999997,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: closeOnCLickAway"
    ],
    "fullName": "DatePicker contract: closeOnCLickAway true: mousedown on the input (inside the component) keeps it open",
    "status": "failed",
    "title": "true: mousedown on the input (inside the component) keeps it open",
    "duration": 6.155541000000085,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: closeOnCLickAway"
    ],
    "fullName": "DatePicker contract: closeOnCLickAway true: mousedown on a day keeps the calendar open",
    "status": "failed",
    "title": "true: mousedown on a day keeps the calendar open",
    "duration": 2.887749999999869,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: closeOnCLickAway"
    ],
    "fullName": "DatePicker contract: closeOnCLickAway true: mousedown on the month label in the header keeps the calendar open",
    "status": "failed",
    "title": "true: mousedown on the month label in the header keeps the calendar open",
    "duration": 1.824333999999908,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: closeOnCLickAway"
    ],
    "fullName": "DatePicker contract: closeOnCLickAway true: mousedown on the next-month arrow keeps the calendar open",
    "status": "failed",
    "title": "true: mousedown on the next-month arrow keeps the calendar open",
    "duration": 2.431916999999885,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: closeOnCLickAway"
    ],
    "fullName": "DatePicker contract: closeOnCLickAway true: mousedown on a week row keeps the calendar open",
    "status": "failed",
    "title": "true: mousedown on a week row keeps the calendar open",
    "duration": 1.713832999999795,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: closeOnCLickAway"
    ],
    "fullName": "DatePicker contract: closeOnCLickAway true: mousedown on a weekday column header keeps the calendar open",
    "status": "failed",
    "title": "true: mousedown on a weekday column header keeps the calendar open",
    "duration": 1.8155000000006112,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: closeOnCLickAway"
    ],
    "fullName": "DatePicker contract: closeOnCLickAway true: mousedown on the day grid keeps the calendar open",
    "status": "failed",
    "title": "true: mousedown on the day grid keeps the calendar open",
    "duration": 9.163416999999754,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: closeOnCLickAway"
    ],
    "fullName": "DatePicker contract: closeOnCLickAway true: mousedown on a year in the year view keeps the calendar open",
    "status": "failed",
    "title": "true: mousedown on a year in the year view keeps the calendar open",
    "duration": 2.884334000000308,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: closeOnCLickAway"
    ],
    "fullName": "DatePicker contract: closeOnCLickAway [bug-lock] true: mousedown on the paper outside the allow-listed regions closes the calendar",
    "status": "failed",
    "title": "[bug-lock] true: mousedown on the paper outside the allow-listed regions closes the calendar",
    "duration": 1.736374999999498,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: closeOnCLickAway"
    ],
    "fullName": "DatePicker contract: closeOnCLickAway true: picking a day still selects and closes",
    "status": "failed",
    "title": "true: picking a day still selects and closes",
    "duration": 1.7139999999999418,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: mobile variant (pointer not fine)"
    ],
    "fullName": "DatePicker contract: mobile variant (pointer not fine) click on the input opens a modal dialog (portal) with Cancel and OK, on the month of the value",
    "status": "failed",
    "title": "click on the input opens a modal dialog (portal) with Cancel and OK, on the month of the value",
    "duration": 4.314084000000548,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: mobile variant (pointer not fine)"
    ],
    "fullName": "DatePicker contract: mobile variant (pointer not fine) [v5-quirk] the field is a read-only text input labelled \"Choose date, selected date is ...\"",
    "status": "failed",
    "title": "[v5-quirk] the field is a read-only text input labelled \"Choose date, selected date is ...\"",
    "duration": 1.9450000000006185,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: mobile variant (pointer not fine)"
    ],
    "fullName": "DatePicker contract: mobile variant (pointer not fine) [bug-lock] clicking the Vanguard calendar icon does not open the dialog",
    "status": "failed",
    "title": "[bug-lock] clicking the Vanguard calendar icon does not open the dialog",
    "duration": 1.6934579999997368,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: mobile variant (pointer not fine)"
    ],
    "fullName": "DatePicker contract: mobile variant (pointer not fine) picking a day does not close the dialog (waits for OK)",
    "status": "failed",
    "title": "picking a day does not close the dialog (waits for OK)",
    "duration": 1.7261250000001382,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: mobile variant (pointer not fine)"
    ],
    "fullName": "DatePicker contract: mobile variant (pointer not fine) [v5-quirk] picking a day emits onChange and updates the field before OK is pressed",
    "status": "failed",
    "title": "[v5-quirk] picking a day emits onChange and updates the field before OK is pressed",
    "duration": 1.7753750000001673,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: mobile variant (pointer not fine)"
    ],
    "fullName": "DatePicker contract: mobile variant (pointer not fine) OK closes and keeps the picked date (no further onChange)",
    "status": "failed",
    "title": "OK closes and keeps the picked date (no further onChange)",
    "duration": 1.7524169999996957,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: mobile variant (pointer not fine)"
    ],
    "fullName": "DatePicker contract: mobile variant (pointer not fine) Cancel closes and restores the previous value (emitted again)",
    "status": "failed",
    "title": "Cancel closes and restores the previous value (emitted again)",
    "duration": 1.630457999999635,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: mobile variant (pointer not fine)"
    ],
    "fullName": "DatePicker contract: mobile variant (pointer not fine) [v5-quirk] Escape closes and keeps the picked date (no restore)",
    "status": "failed",
    "title": "[v5-quirk] Escape closes and keeps the picked date (no restore)",
    "duration": 1.6399579999997513,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: mobile variant (pointer not fine)"
    ],
    "fullName": "DatePicker contract: mobile variant (pointer not fine) [v5-quirk] backdrop click closes and keeps the picked date (no restore)",
    "status": "failed",
    "title": "[v5-quirk] backdrop click closes and keeps the picked date (no restore)",
    "duration": 1.722583000000668,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: mobile variant (pointer not fine)"
    ],
    "fullName": "DatePicker contract: mobile variant (pointer not fine) [v5-quirk] keyboard view (pen button) lets the user type a date; only the complete date is emitted",
    "status": "failed",
    "title": "[v5-quirk] keyboard view (pen button) lets the user type a date; only the complete date is emitted",
    "duration": 1.6205840000002354,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: mobile variant (pointer not fine)"
    ],
    "fullName": "DatePicker contract: mobile variant (pointer not fine) registers a popover stacking slot on open and releases it on OK, Cancel, backdrop and unmount",
    "status": "failed",
    "title": "registers a popover stacking slot on open and releases it on OK, Cancel, backdrop and unmount",
    "duration": 1.6445409999996627,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: mobile variant (pointer not fine)"
    ],
    "fullName": "DatePicker contract: mobile variant (pointer not fine) [bug-lock] the dialog keeps MUI's static z-index (1300) and paints behind a raised host modal",
    "status": "failed",
    "title": "[bug-lock] the dialog keeps MUI's static z-index (1300) and paints behind a raised host modal",
    "duration": 1.667833999999857,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DatePicker contract: mobile variant (pointer not fine)"
    ],
    "fullName": "DatePicker contract: mobile variant (pointer not fine) [v5-quirk] the Vanguard paper class is not applied to the mobile dialog",
    "status": "failed",
    "title": "[v5-quirk] the Vanguard paper class is not applied to the mobile dialog",
    "duration": 11.063999999999396,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePicker.spec.tsx",
    "ancestorTitles": [
      "DatePicker component tests"
    ],
    "fullName": "DatePicker component tests should render",
    "status": "failed",
    "title": "should render",
    "duration": 39.3438339999999,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx",
    "ancestorTitles": [],
    "fullName": "mobile keyboard respects the locale format when toggled back from calendar",
    "status": "failed",
    "title": "mobile keyboard respects the locale format when toggled back from calendar",
    "duration": 39.65662499999996,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx",
    "ancestorTitles": [],
    "fullName": "mobile keyboard shows the current calendar selection",
    "status": "failed",
    "title": "mobile keyboard shows the current calendar selection",
    "duration": 4.189959000000044,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx",
    "ancestorTitles": [],
    "fullName": "an externally restored previously typed date refreshes the field",
    "status": "failed",
    "title": "an externally restored previously typed date refreshes the field",
    "duration": 3.90945899999997,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx",
    "ancestorTitles": [],
    "fullName": "a locale change reformats a date after controlled typing",
    "status": "failed",
    "title": "a locale change reformats a date after controlled typing",
    "duration": 3.2577499999999873,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx",
    "ancestorTitles": [],
    "fullName": "'{Backspace}' at a separator preserves the date, payload and caret",
    "status": "failed",
    "title": "'{Backspace}' at a separator preserves the date, payload and caret",
    "duration": 6.964666000000079,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx",
    "ancestorTitles": [],
    "fullName": "'{Delete}' at a separator preserves the date, payload and caret",
    "status": "failed",
    "title": "'{Delete}' at a separator preserves the date, payload and caret",
    "duration": 3.614958999999999,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx",
    "ancestorTitles": [],
    "fullName": "[v5-quirk] digit insertion after '{Backspace}' keeps the legacy mask and caret",
    "status": "failed",
    "title": "[v5-quirk] digit insertion after '{Backspace}' keeps the legacy mask and caret",
    "duration": 3.075166999999965,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx",
    "ancestorTitles": [],
    "fullName": "[v5-quirk] digit insertion after '{Delete}' keeps the legacy mask and caret",
    "status": "failed",
    "title": "[v5-quirk] digit insertion after '{Delete}' keeps the legacy mask and caret",
    "duration": 4.163542000000007,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DateTimePicker contract: rendering"
    ],
    "fullName": "DateTimePicker contract: rendering shows the date (unix seconds) in the locale format and the time in the select",
    "status": "failed",
    "title": "shows the date (unix seconds) in the locale format and the time in the select",
    "duration": 38.268916999999874,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DateTimePicker contract: rendering"
    ],
    "fullName": "DateTimePicker contract: rendering de_DE locale formats the date as DD.MM.YYYY",
    "status": "failed",
    "title": "de_DE locale formats the date as DD.MM.YYYY",
    "duration": 3.91537500000004,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DateTimePicker contract: rendering"
    ],
    "fullName": "DateTimePicker contract: rendering default labels \"Start date\"/\"Start time\", both required (asterisk, no \"Optional\")",
    "status": "failed",
    "title": "default labels \"Start date\"/\"Start time\", both required (asterisk, no \"Optional\")",
    "duration": 3.2694159999998647,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DateTimePicker contract: rendering"
    ],
    "fullName": "DateTimePicker contract: rendering custom labels",
    "status": "failed",
    "title": "custom labels",
    "duration": 2.5042920000000777,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DateTimePicker contract: rendering"
    ],
    "fullName": "DateTimePicker contract: rendering empty date and time render an empty date input and an empty time select",
    "status": "failed",
    "title": "empty date and time render an empty date input and an empty time select",
    "duration": 4.799749999999904,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DateTimePicker contract: rendering"
    ],
    "fullName": "DateTimePicker contract: rendering pickerRef is bound to the wrapper that contains both fields",
    "status": "failed",
    "title": "pickerRef is bound to the wrapper that contains both fields",
    "duration": 2.2605000000000928,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DateTimePicker contract: rendering"
    ],
    "fullName": "DateTimePicker contract: rendering showAmPm displays the time as \"hh:mm AM/PM\"",
    "status": "failed",
    "title": "showAmPm displays the time as \"hh:mm AM/PM\"",
    "duration": 2.4187910000000556,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DateTimePicker contract: onChange payload"
    ],
    "fullName": "DateTimePicker contract: onChange payload on mount: (unix seconds of local midnight, \"HH:mm\", combined moment)",
    "status": "failed",
    "title": "on mount: (unix seconds of local midnight, \"HH:mm\", combined moment)",
    "duration": 2.33458399999995,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DateTimePicker contract: onChange payload"
    ],
    "fullName": "DateTimePicker contract: onChange payload on mount with only a date: dateTime is undefined",
    "status": "failed",
    "title": "on mount with only a date: dateTime is undefined",
    "duration": 6.261707999999999,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DateTimePicker contract: onChange payload"
    ],
    "fullName": "DateTimePicker contract: onChange payload on mount with nothing: all three arguments undefined",
    "status": "failed",
    "title": "on mount with nothing: all three arguments undefined",
    "duration": 2.2542920000000777,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DateTimePicker contract: onChange payload"
    ],
    "fullName": "DateTimePicker contract: onChange payload picking a day emits the new day as unix seconds (midnight) and keeps the time",
    "status": "failed",
    "title": "picking a day emits the new day as unix seconds (midnight) and keeps the time",
    "duration": 2.212624999999889,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DateTimePicker contract: onChange payload"
    ],
    "fullName": "DateTimePicker contract: onChange payload picking a day without a time emits (seconds, undefined, undefined)",
    "status": "failed",
    "title": "picking a day without a time emits (seconds, undefined, undefined)",
    "duration": 1.8315000000000055,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DateTimePicker contract: onChange payload"
    ],
    "fullName": "DateTimePicker contract: onChange payload picking a time emits the \"HH:mm\" string and the combined moment",
    "status": "failed",
    "title": "picking a time emits the \"HH:mm\" string and the combined moment",
    "duration": 1.8713330000000497,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DateTimePicker contract: onChange payload"
    ],
    "fullName": "DateTimePicker contract: onChange payload showAmPm: picking \"02:00 PM\" still emits 24h \"14:00\"",
    "status": "failed",
    "title": "showAmPm: picking \"02:00 PM\" still emits 24h \"14:00\"",
    "duration": 1.8588749999998981,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DateTimePicker contract: onChange payload"
    ],
    "fullName": "DateTimePicker contract: onChange payload [bug-lock] typing a partial date or clearing it does not emit (falsy/NaN DatePicker payloads are ignored)",
    "status": "failed",
    "title": "[bug-lock] typing a partial date or clearing it does not emit (falsy/NaN DatePicker payloads are ignored)",
    "duration": 1.9020410000000538,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DateTimePicker contract: onChange payload"
    ],
    "fullName": "DateTimePicker contract: onChange payload typing a full date emits it as unix seconds (midnight)",
    "status": "failed",
    "title": "typing a full date emits it as unix seconds (midnight)",
    "duration": 1.838457999999946,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DateTimePicker contract: onChange payload"
    ],
    "fullName": "DateTimePicker contract: onChange payload without onChange interactions do not throw",
    "status": "failed",
    "title": "without onChange interactions do not throw",
    "duration": 1.8105419999999413,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DateTimePicker contract: limits"
    ],
    "fullName": "DateTimePicker contract: limits minDate/maxDate (unix seconds) disable days outside the range in the calendar",
    "status": "failed",
    "title": "minDate/maxDate (unix seconds) disable days outside the range in the calendar",
    "duration": 2.3532920000000104,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DateTimePicker contract: limits"
    ],
    "fullName": "DateTimePicker contract: limits disablePast disables days before today (frozen clock)",
    "status": "failed",
    "title": "disablePast disables days before today (frozen clock)",
    "duration": 2.7032500000000255,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  },
  {
    "file": "/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx",
    "ancestorTitles": [
      "DateTimePicker contract: limits"
    ],
    "fullName": "DateTimePicker contract: limits half-hour time list; minTime/maxTime disable the options outside the range",
    "status": "failed",
    "title": "half-hour time list; minTime/maxTime disable the options outside the range",
    "duration": 1.7994579999999587,
    "failureMessages": [
      "TypeError: Cannot read properties of undefined (reading 'toLowerCase')\n    at /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/src/core/DatePicker/DatePicker.tsx:94:37\n    at Object.react_stack_bottom_frame (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)\n    at renderWithHooks (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)\n    at updateForwardRef (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:9724:19)\n    at beginWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:12117:18)\n    at runWithFiberInDEV (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)\n    at performUnitOfWork (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)\n    at workLoopSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)\n    at renderRootSync (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11)\n    at performWorkOnRoot (/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/node_modules/react-dom/cjs/react-dom-client.development.js:16583:35)"
    ],
    "meta": {},
    "tags": []
  }
]
```

## Scoped repair history

Explicit false added only to DatePickerBase, the sole actual MUI picker wrapper (source import audit). DateRange/DateTime use Vanguard composition; TimePicker uses Select. Same targeted run after false249PASS/136FAIL: no initial failures cleared. Cause is NOT accessible DOM alone. Installed useDesktopPicker/useDesktopPicker.js:56–64 passes only field slot/id props; DatePicker.types.d.ts:38 removes value/format generics. PickerProvider.d.ts:33,88,105,129,171 exposes value, variant, triggerRef, fieldFormat, setValue. PickersLayout types:77 removes old forwarded layout props. Production now uses public usePickerContext and corrected internal generic arities; public Vanguard props unchanged.

New context tests initially0PASS/2FAIL (same missing-format TypeError). First context mapping targeted385PASS/2FAIL:135 original failures cleared, one original repeated-invalid callback failure remained. New desktop test also had incorrect click-to-type setup: userEvent.type opened the calendar; fixed setup to focus+keyboard as frozen tests do, no assertion changed. This harness correction is not claimed as production proof. Mobile new regression GREEN after context mapping.

New repeated-invalid test added before publication repair; s4b-field-publication-red retains intended assertion RED. Installed useValueAndOpenStates.js:109–166 deduplicates equal invalid values. Field edits now call wrapper callback directly, retaining per-edit invalid Moment→NaN and null→undefined; mobile keyboard uses setValue(changeImportance:set,source:field). No styled slot replaced; existing custom field/layout/toolbar remain.

Process deviation: original unchanged pre-edit type probe and browser run were not captured before production edits. Do not infer those results from later GREEN; initial spec RED is complete. No assertion rewrites/retries/timeout raises/frozen edits.

s4b-legacy-false-spec: 249PASS/136FAIL; raw/reported1/1, 32.477s; C1 all3 notincluded. Full failure JSON retained in its out directory.

s4b-context-regression-red: 0PASS/2FAIL; raw/reported1/1, 4.002s; C1 all3 notincluded. Full failure JSON retained in its out directory.

s4b-context-green-spec: 385PASS/2FAIL; raw/reported1/1, 38.330s; C1 all3 notincluded. Full failure JSON retained in its out directory.

s4b-field-publication-red: 2PASS/1FAIL; raw/reported1/1, 3.862s; C1 all3 notincluded. Full failure JSON retained in its out directory.

## Targeted continuation and styled Popper repair

All original136 spec failures cleared by scoped repairs. First browser run194PASS/3FAIL retained, not reclassified: Drawer Modal Date Picker and Fullscreen Modal Fullscreen Modal Date Picker cannot find .MuiPickersPopper-root; following Drawer Modal Popover has aria-hidden canvas. Installed PickerPopper/PickerPopper.js:38/46 now names styled components MuiPickerPopper. New focused regression3PASS/1FAIL expected ancestor nonnull received null, then added only slotProps.popper.className; styled default unchanged. No frozen edits or assertion/timeout changes. See s4b-picker-audit.md for full break map/styled audit and official guidance.

S5 false-field removal limitation sent to root and overseer; current official guide exact text: “The `enableAccessibleFieldDOMStructure` prop has been removed in v9.” No runtime legacy-false warning observed in retained logs. No policy or S5 graph choice.

s4b-publication-green-spec: 388PASS/0FAIL; raw/reported0/0, 38.317s; C1 all3 notincluded; no timeout.

s4b-picker-stories: 194PASS/3FAIL; raw/reported1/1, 97.463s; C1 all3 notincluded; no timeout.

s4b-popper-class-red: 3PASS/1FAIL; raw/reported1/1, 4.255s; C1 all3 notincluded; no timeout.

s4b-final-picker-spec: 389PASS/0FAIL; raw/reported0/0, 39.169s; C1 all3 notincluded; no timeout.

## Reconstructed post-hoc initial RED (authorized once)

The missed original browser/type capture remains a process deviation. At overseer authorization, extracted saved pre-edit source to /tmp/mui-upgrade/s4b-reconstructed-initial; dependencies resolve to current8.29.5, with scratch-local node_modules configs. No Git checkout/worktree/thread or production edits. This is **reconstructed post-hoc initial RED**, never original chronological pre-edit evidence.

Contract compiler raw/reported2,8.685s: four actual DatePicker generic-arity errors at52,154,162,180. Browser reconstruction raw/reported1,15.223s: two failed suites/zero tests due Storybook setup-file dynamic-import URL outside scratch root. This is a reconstruction HARNESS FAILURE, not behavioral RED. No retry or further reconstruction. Full logs/JSON/resources retained in out/s4b-reconstructed-{types,browser}. C1 all three notincluded. Scratch not used for GREEN proof.

Final targeted browser197PASS/0FAIL,raw/reported0,96.813s. C1 all three notincluded. Dedicated types0 (4.862s). Initial lint1 due import sorting/new-test formatting, corrected using scoped eslint --fix0 (2.745s); warning only sonarjs duplicated date literal. No frozen edits. Formatting/import-only after behavioral GREEN; no semantics changed.

## Implementation ready for root read-only review — no acceptance

Only baseline production change is DatePicker.tsx; only manifest pin change pickers7.29.4→8.29.5, lock updated. All other accepted production/config/test bytes preserved. Final snapshot proof: {"changed_baseline_files": ["src/core/DatePicker/DatePicker.tsx", "pnpm-lock.yaml", "package.json"], "accepted_current_test_count": 485, "accepted_test_mismatches": [], "frozen": {"original492": {"count": 492, "mismatches": []}, "original490": {"count": 490, "mismatches": []}}, "new_test_sha256": "201e93dd8f60b1f111bfcfef08f266a0a68d7f6b9676ed29830d67f80274cb7f"}

All final source389PASS and targeted browser197PASS; dedicated source/new-regression types and full contract compiler0. Lint scoped fix/check0 with one new-test duplicate-string warning. No runtime semantics changed after final target runs; only import sorting/formatting. Source public DatePickerProps body byte-identical.

Packed S2 DatePicker probe against preserved accepted S4a installed consumer:1PASS/4unrelatedSKIPPED,raw/reported0,7.668s; accepted tarSHA94410ac82b6319080361f5a46138684b4887127987f0b559e678e25813b43d0c unchanged,5719 default dist files byte-match. Honest old GREEN; no behavioral RED fabricated. New fresh isolated strict npm11 consumer:1PASS/4unrelatedSKIPPED,raw/reported0,10.064s.5711 default dist files byte-match fresh tar, packed manifest pickers8.29.5/core7.3.11. Root pins JSON includes exact React/DOM19.2.0,Emotion11.14.0/11.14.1,Moment2.30.1,date-fns2.30.0. Pickers bundled; no external MUI in declared-only consumer by design. This target-only tar uses fresh default build and retained S4a WordPress build; NOT full fresh package proof.

Packing history: system npm10 pack --ignore-scripts unexpectedly invoked prepare. Stopped ONLY owned group32446; raw/reported-15/-15,46.725s, inhibitor reaped. No config/production/test drift. Pinned npm11.6.2 pack --ignore-scripts0,9.709s without prepare. Target default build0,84.813s; new strict install0,34.564s; explicit consumer cleanup lifecycle0. All bounded with mach_continuous_time/inhibit=True/resources/raw exits. No timeout/C1 threshold trigger; every targeted suite marks3 watched tests notincluded. Reconstruction browser harness failure retained, no retry.

Root NEXT: fresh read-only review, then ONE sequential full final validation: selftests/resolution/count guards/static+extra types/spec/scripts20/storybook/coverage35files95%lines85%branches BY PROJECT spec+storybook only; canonical package.sh four strict consumers counts5/5/4/4 aggregate18 plus types/pins/bytes. No full final gates, coverage or canonical package gate were run by this worker. No stage acceptance, S5, delegates, checkout, commit, push, PR, CR or ticket placeholder. Retain all earlier S4a RED history and release limitations listed in audit.

Future-only user decision relayed: after S4b acceptance, S5a pickers9.17 on core7.3 with authorized accessible DOM characterization/AST proof, then S5b core9.5 after S5a acceptance. No S5 work performed; no Vanguard version bump. Major version recommended for future DOM migration.

Raw process ledger (suite JSON in corresponding directory):

|Run|raw/reported|continuous seconds|
|---|---|---|
|s4b-context-green-spec|1/1|38.330|
|s4b-context-regression-red|1/1|4.002|
|s4b-contract-types|0/0|7.925|
|s4b-dedicated-lint|1/1|3.300|
|s4b-dedicated-types|0/0|4.862|
|s4b-field-publication-red|1/1|3.862|
|s4b-final-picker-spec|0/0|39.169|
|s4b-final-picker-stories|0/0|96.813|
|s4b-legacy-false-spec|1/1|32.477|
|s4b-lint-fix|0/0|2.745|
|s4b-new-packed-datepicker|0/0|10.064|
|s4b-old-packed-datepicker|0/0|7.668|
|s4b-picker-stories|1/1|97.463|
|s4b-popper-class-red|1/1|4.255|
|s4b-publication-green-spec|0/0|38.317|
|s4b-reconstructed-browser|1/1|15.223|
|s4b-reconstructed-types|2/2|8.685|
|s4b-target-build-lib|0/0|84.813|
|s4b-target-consumer-install|0/0|34.564|
|s4b-target-consumer-lifecycle|0/0|0.151|
|s4b-target-pack|-15/-15|46.725|
|s4b-target-pack-npm11|0/0|9.709|
|s4b-unchanged-picker-spec|1/1|42.844|


## ONE full fresh S4b final validation — 2026-11-05

Output: `agentic-plans/mui-upgrade-gates/out/s4b-final-584ea692985b4883ac983874672b6c03`. Fresh package: `/tmp/mui-upgrade/s4b-final-package` (asserted absent before execution). Fresh review-s4b.md CLEAN/no findings read with README, picker audit, canonical gates and retained136-record initial RED history. Historical node-final-validation.py was copied/adapted only under out/controller; no frozen gate edits.

Final result: **READY for root/overseer handoff, not S4b acceptance.** All13 serialized gates raw/reported0, timeout=false, timeout bound1800 seconds each, mach_continuous_time, inhibit=True, owned inhibitor reaped. No retries, deadline extensions or timeout increases. Start load/process inventory is start-resources.txt; each gate retains its raw log, process JSON and nonempty resources JSON. Orphans84651/85414/85417, unrelated processes and global power settings untouched.

|Gate|raw/reported|continuous seconds|
|---|---|---|
|selftest|0/0|2.473|
|suite-selftest|0/0|1.241|
|coverage-selftest|0/0|0.662|
|scripts-project-selftest|0/0|2.181|
|runner-selftest|0/0|2.735|
|package-count-selftest|0/0|0.910|
|static|0/0|65.798|
|extra-types|0/0|7.828|
|spec|0/0|191.278|
|scripts|0/0|12.615|
|storybook|0/0|327.297|
|coverage|0/0|467.805|
|package|0/0|526.195|

Exact executed gate commands (process JSON contains command arrays, PIDs, owned groups, inhibitor cleanup and resources references):

```sh
bash /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/selftest.sh
bash /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/suite-selftest.sh
bash /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/coverage-selftest.sh
node /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/scripts-project-selftest.mjs
/opt/homebrew/opt/python@3.14/bin/python3.14 -m unittest discover -s /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates -p test_bounded_runner.py
/opt/homebrew/opt/python@3.14/bin/python3.14 -m unittest discover -s /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates -p test_package_counts.py
bash /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/gates.sh s4b-final-584ea692985b4883ac983874672b6c03
node node_modules/typescript/bin/tsc -p /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s4b-final-584ea692985b4883ac983874672b6c03/controller/extra-types.json
node node_modules/vitest/vitest.mjs run --project spec --maxWorkers=1 --no-file-parallelism --reporter=default --reporter=json --outputFile.json=/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s4b-final-584ea692985b4883ac983874672b6c03/spec-vitest.json
node node_modules/vitest/vitest.mjs run --project scripts --maxWorkers=1 --no-file-parallelism --reporter=default --reporter=json --outputFile.json=/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s4b-final-584ea692985b4883ac983874672b6c03/scripts-vitest.json
node node_modules/vitest/vitest.mjs run --project storybook --maxWorkers=1 --no-file-parallelism --reporter=default --reporter=json --outputFile.json=/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s4b-final-584ea692985b4883ac983874672b6c03/storybook-vitest.json
env VANGUARD_V8_COVERAGE=1 node node_modules/vitest/vitest.mjs run --project spec --project storybook --maxWorkers=1 --no-file-parallelism --coverage --coverage.provider=v8 --coverage.include=src/core/AIAssistant/AIAssistentPanel/AIAssistantPanel.tsx --coverage.include=src/core/Accordion/Accordion.tsx --coverage.include=src/core/AppBar/AppBar.tsx --coverage.include=src/core/Autocomplete/Autocomplete.tsx --coverage.include=src/core/AutocompleteWithAnchor/AutocompleteWithAnchor.tsx --coverage.include=src/core/Button/Button.tsx --coverage.include=src/core/Collapse/Collapse/Collapse.tsx --coverage.include=src/core/DatePicker/DatePicker.tsx --coverage.include=src/core/DateRangeInput/DateRangeInput.tsx --coverage.include=src/core/DateRangePicker/DateRangePicker.tsx --coverage.include=src/core/DateRangePicker/DateRangePickerBase/DateRangePickerBaseInputAdornment/DateRangePickerBaseInputAdornment.tsx --coverage.include=src/core/Documents/DocumentDisplay/DocumentDisplay.tsx --coverage.include=src/core/Documents/DocumentUpload/DocumentUpload.tsx --coverage.include=src/core/Drawer/Drawer.tsx --coverage.include=src/core/DropdownMenu/DropdownMenu.tsx --coverage.include=src/core/FlagAdornment/FlagAdornment.tsx --coverage.include=src/core/FormControl/FormControl.tsx --coverage.include=src/core/Input/Input.tsx --coverage.include=src/core/List/ListShowMore/ListShowMore.tsx --coverage.include=src/core/Menu/Menu.tsx --coverage.include=src/core/MenuItem/MenuItem.tsx --coverage.include=src/core/Popover/Popover.tsx --coverage.include=src/core/Popover/PopoverPopper/PopoverPopper.tsx --coverage.include=src/core/PopoverModal/PopoverModal.tsx --coverage.include=src/core/ProgressBar/ProgressBar.tsx --coverage.include=src/core/SearchableSelect/SearchableSelect.tsx --coverage.include=src/core/Select/Select.tsx --coverage.include=src/core/Slider/Slider.tsx --coverage.include=src/core/Snackbar/Snackbar.tsx --coverage.include=src/core/SnackbarRoot/SnackbarRoot.tsx --coverage.include=src/core/ToggleButton/ToggleButton.tsx --coverage.include=src/core/ToggleButtonGroup/ToggleButtonGroup.tsx --coverage.include=src/core/Toolbar/Toolbar.tsx --coverage.include=src/core/_internal/InputBase/InputBase.tsx --coverage.include=src/helpers/hex-to-rgba.ts --coverage.reportOnFailure --coverage.reporter=json --coverage.reporter=json-summary --coverage.reporter=text --coverage.reportsDirectory=/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s4b-final-584ea692985b4883ac983874672b6c03/coverage --coverage.thresholds.perFile --coverage.thresholds.lines=95 --coverage.thresholds.branches=85 --reporter=default --reporter=json --outputFile.json=/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/out/s4b-final-584ea692985b4883ac983874672b6c03/coverage-vitest.json
env PATH=/Users/a.kott/.npm/_npx/778e2a9d4b99c7e3/node_modules/.bin:/Users/a.kott/.nvm/versions/node/v22.16.0/bin:/opt/homebrew/bin:/opt/homebrew/sbin:/Library/Frameworks/Python.framework/Versions/3.9/bin:/usr/local/bin:/System/Cryptexes/App/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/local/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/appleinternal/bin:/Users/a.kott/.nvm/versions/node/v22.16.0/bin:/Users/a.kott/.vite-plus/bin:/Users/a.kott/.codex/packages/standalone/releases/0.166.0-aarch64-apple-darwin/codex-path:/Users/a.kott/.codex/tmp/arg0-macos/codex-arg0oqPK4K:/Users/a.kott/.local/bin:/Users/a.kott/Library/pnpm/bin:/usr/local/sbin:/Users/a.kott/.serverless/bin:/opt/homebrew/bin:/opt/homebrew/sbin:/Library/Frameworks/Python.framework/Versions/3.9/bin:/usr/local/share/npm/bin PACKAGE_FIXTURE_OUT=/tmp/mui-upgrade/s4b-final-package bash /Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade/agentic-plans/mui-upgrade-gates/package.sh
```

Static: app1001/lib4 existing baseline errors, contract0, lint1318/no worsened file-rule pairs. Extra types config unions latest dedicated S4a new-tests/popover and S4b configs, includes new DatePickerV8Context regression; no old-only omission. All selftests including3 runner integration tests and canonical package-count selftest passed.

spec: 1726PASS/0FAIL/0pending. JSON test reports use fresh absolute paths; default+JSON reporters, one worker/no file parallelism.

scripts: 20PASS/0FAIL/0pending. JSON test reports use fresh absolute paths; default+JSON reporters, one worker/no file parallelism.

storybook: 1292PASS/0FAIL/0pending. JSON test reports use fresh absolute paths; default+JSON reporters, one worker/no file parallelism.

coverage: 3018PASS/0FAIL/0pending. JSON test reports use fresh absolute paths; default+JSON reporters, one worker/no file parallelism.

Scripts: exact3 files20 tests, Node environment, empty UI setup, default5000ms timeout independently verified by read-only resolved-config audit (timeout-audit-corrected.log/process JSON); Node isolation/file selection verified by scripts-project-selftest. Excluded from component coverage by project. Coverage is ONLY full spec+storybook projects with no file filters; VANGUARD_V8_COVERAGE=1, V8 json/json-summary/text, reportOnFailure and perFile95lines/85branches.

C1 records (fullName/status/duration in retained *-c1.json; scripts and storybook record all3 notincluded):
```json
{
  "spec": [
    {
      "ancestorTitles": [
        "Autocomplete MUI contract",
        "multiple + chips (renderTags)"
      ],
      "fullName": "Autocomplete MUI contract multiple + chips (renderTags) clicking a chip delete icon removes it with reason \"removeOption\"",
      "status": "passed",
      "title": "clicking a chip delete icon removes it with reason \"removeOption\"",
      "duration": 198.6173749999989,
      "failureMessages": [],
      "meta": {},
      "tags": []
    },
    {
      "ancestorTitles": [
        "Autocomplete MUI contract",
        "multiple + chips (renderTags)"
      ],
      "fullName": "Autocomplete MUI contract multiple + chips (renderTags) ArrowLeft from the empty input moves focus to the last chip, then the previous one",
      "status": "passed",
      "title": "ArrowLeft from the empty input moves focus to the last chip, then the previous one",
      "duration": 276.5542919999989,
      "failureMessages": [],
      "meta": {},
      "tags": []
    },
    {
      "ancestorTitles": [
        "Autocomplete MUI contract",
        "splitCommaTag"
      ],
      "fullName": "Autocomplete MUI contract splitCommaTag Enter splits comma separated free text into tags with reason \"selectOption\"",
      "status": "passed",
      "title": "Enter splits comma separated free text into tags with reason \"selectOption\"",
      "duration": 240.60770799999955,
      "failureMessages": [],
      "meta": {},
      "tags": []
    }
  ],
  "scripts": [
    {
      "fullName": "Autocomplete MUI contract multiple + chips (renderTags) clicking a chip delete icon removes it with reason \"removeOption\"",
      "status": "notincluded"
    },
    {
      "fullName": "Autocomplete MUI contract multiple + chips (renderTags) ArrowLeft from the empty input moves focus to the last chip, then the previous one",
      "status": "notincluded"
    },
    {
      "fullName": "Autocomplete MUI contract splitCommaTag Enter splits comma separated free text into tags with reason \"selectOption\"",
      "status": "notincluded"
    }
  ],
  "storybook": [
    {
      "fullName": "Autocomplete MUI contract multiple + chips (renderTags) clicking a chip delete icon removes it with reason \"removeOption\"",
      "status": "notincluded"
    },
    {
      "fullName": "Autocomplete MUI contract multiple + chips (renderTags) ArrowLeft from the empty input moves focus to the last chip, then the previous one",
      "status": "notincluded"
    },
    {
      "fullName": "Autocomplete MUI contract splitCommaTag Enter splits comma separated free text into tags with reason \"selectOption\"",
      "status": "notincluded"
    }
  ],
  "coverage": [
    {
      "ancestorTitles": [
        "Autocomplete MUI contract",
        "multiple + chips (renderTags)"
      ],
      "fullName": "Autocomplete MUI contract multiple + chips (renderTags) clicking a chip delete icon removes it with reason \"removeOption\"",
      "status": "passed",
      "title": "clicking a chip delete icon removes it with reason \"removeOption\"",
      "duration": 200.35308299999997,
      "failureMessages": [],
      "meta": {},
      "tags": []
    },
    {
      "ancestorTitles": [
        "Autocomplete MUI contract",
        "multiple + chips (renderTags)"
      ],
      "fullName": "Autocomplete MUI contract multiple + chips (renderTags) ArrowLeft from the empty input moves focus to the last chip, then the previous one",
      "status": "passed",
      "title": "ArrowLeft from the empty input moves focus to the last chip, then the previous one",
      "duration": 230.8108340000008,
      "failureMessages": [],
      "meta": {},
      "tags": []
    },
    {
      "ancestorTitles": [
        "Autocomplete MUI contract",
        "splitCommaTag"
      ],
      "fullName": "Autocomplete MUI contract splitCommaTag Enter splits comma separated free text into tags with reason \"selectOption\"",
      "status": "passed",
      "title": "Enter splits comma separated free text into tags with reason \"selectOption\"",
      "duration": 244.17870800000037,
      "failureMessages": [],
      "meta": {},
      "tags": []
    }
  ]
}
```
No C1>2500ms, timeout or escalation trigger.

All35 mapped files present, each individually checked:

|File|Lines %|Branches %|
|---|---|---|
|src/core/AIAssistant/AIAssistentPanel/AIAssistantPanel.tsx|100|94.54|
|src/core/Accordion/Accordion.tsx|100|100|
|src/core/AppBar/AppBar.tsx|100|100|
|src/core/Autocomplete/Autocomplete.tsx|96.68|94.55|
|src/core/AutocompleteWithAnchor/AutocompleteWithAnchor.tsx|100|91.66|
|src/core/Button/Button.tsx|100|97.29|
|src/core/Collapse/Collapse/Collapse.tsx|100|100|
|src/core/DatePicker/DatePicker.tsx|100|96|
|src/core/DateRangeInput/DateRangeInput.tsx|100|100|
|src/core/DateRangePicker/DateRangePicker.tsx|98.99|93.37|
|src/core/DateRangePicker/DateRangePickerBase/DateRangePickerBaseInputAdornment/DateRangePickerBaseInputAdornment.tsx|100|100|
|src/core/Documents/DocumentDisplay/DocumentDisplay.tsx|100|100|
|src/core/Documents/DocumentUpload/DocumentUpload.tsx|100|85.71|
|src/core/Drawer/Drawer.tsx|100|100|
|src/core/DropdownMenu/DropdownMenu.tsx|100|100|
|src/core/FlagAdornment/FlagAdornment.tsx|100|100|
|src/core/FormControl/FormControl.tsx|100|100|
|src/core/Input/Input.tsx|100|100|
|src/core/List/ListShowMore/ListShowMore.tsx|100|100|
|src/core/Menu/Menu.tsx|100|100|
|src/core/MenuItem/MenuItem.tsx|100|100|
|src/core/Popover/Popover.tsx|100|96|
|src/core/Popover/PopoverPopper/PopoverPopper.tsx|100|100|
|src/core/PopoverModal/PopoverModal.tsx|100|100|
|src/core/ProgressBar/ProgressBar.tsx|100|100|
|src/core/SearchableSelect/SearchableSelect.tsx|100|100|
|src/core/Select/Select.tsx|100|92.72|
|src/core/Slider/Slider.tsx|100|100|
|src/core/Snackbar/Snackbar.tsx|100|94.11|
|src/core/SnackbarRoot/SnackbarRoot.tsx|100|100|
|src/core/ToggleButton/ToggleButton.tsx|100|100|
|src/core/ToggleButtonGroup/ToggleButtonGroup.tsx|100|100|
|src/core/Toolbar/Toolbar.tsx|100|100|
|src/core/_internal/InputBase/InputBase.tsx|99.24|98.34|
|src/helpers/hex-to-rgba.ts|100|100|

Only three approved dead PopoverModal ignore regions affect the35-file coverage set. The pre-existing StyledSVG helper c8 annotation is outside this mapped set; no coverage ignore added.

Fresh canonical package.sh ran full build of both variants, normal npm11.6.2 pack and all4 strict npm11 consumers, no legacy/force/baseline/source aliases or supplied tar. Runtime structured counts: {"consumers": {"default-declared": 5, "default-mui": 5, "wp-declared": 4, "wp-mui": 4}, "aggregate": 18, "expected_aggregate": 18}. Four required gated type logs and default-mui probe empty/0; broader type measurements remain limitations.

Package pins/byte/SHA audit:
```json
{
  "packed": {
    "dist/index.js": {
      "bytes": 22791,
      "sha256": "e2aaa75039d8d46f2ade9bd865ef081db84779f5a8f8475a42eaa9dd83147c51"
    },
    "dist/types/index.d.ts": {
      "bytes": 24831,
      "sha256": "61d4328b626b87e55a03037dd546f09bb34448eb7a3c2bdb008bf3912dc46ee4"
    },
    "dist-wordpress/index.js": {
      "bytes": 2555410,
      "sha256": "7a68296162bb5deb2def439b0b04a4eac333151eb95fa763e9f2c25a9a6f8f7e"
    },
    "dist-wordpress/types/index.d.ts": {
      "bytes": 6814,
      "sha256": "5ccd44b8606ffa334ff7cc77aa3d1076b07f90df156906265c470b3d030579b6"
    }
  },
  "installed": {
    "default-declared": {
      "index.js": {
        "bytes": 22791,
        "sha256": "e2aaa75039d8d46f2ade9bd865ef081db84779f5a8f8475a42eaa9dd83147c51"
      },
      "types/index.d.ts": {
        "bytes": 24831,
        "sha256": "61d4328b626b87e55a03037dd546f09bb34448eb7a3c2bdb008bf3912dc46ee4"
      }
    },
    "default-mui": {
      "index.js": {
        "bytes": 22791,
        "sha256": "e2aaa75039d8d46f2ade9bd865ef081db84779f5a8f8475a42eaa9dd83147c51"
      },
      "types/index.d.ts": {
        "bytes": 24831,
        "sha256": "61d4328b626b87e55a03037dd546f09bb34448eb7a3c2bdb008bf3912dc46ee4"
      }
    },
    "wp-declared": {
      "index.js": {
        "bytes": 2555410,
        "sha256": "7a68296162bb5deb2def439b0b04a4eac333151eb95fa763e9f2c25a9a6f8f7e"
      },
      "types/index.d.ts": {
        "bytes": 6814,
        "sha256": "5ccd44b8606ffa334ff7cc77aa3d1076b07f90df156906265c470b3d030579b6"
      }
    },
    "wp-mui": {
      "index.js": {
        "bytes": 2555410,
        "sha256": "7a68296162bb5deb2def439b0b04a4eac333151eb95fa763e9f2c25a9a6f8f7e"
      },
      "types/index.d.ts": {
        "bytes": 6814,
        "sha256": "5ccd44b8606ffa334ff7cc77aa3d1076b07f90df156906265c470b3d030579b6"
      }
    }
  },
  "pins": {
    "default-declared": {
      "react-dom": "19.2.0",
      "@emotion/react": "11.14.0",
      "@emotion/styled": "11.14.1"
    },
    "default-mui": {
      "react-dom": "19.2.0",
      "@emotion/react": "11.14.0",
      "@emotion/styled": "11.14.1",
      "@mui/material": "7.3.11",
      "@mui/system": "7.3.11"
    },
    "wp-declared": {
      "react-dom": "19.2.0",
      "@emotion/react": "11.14.0",
      "@emotion/styled": "11.14.1"
    },
    "wp-mui": {
      "react-dom": "19.2.0",
      "@emotion/react": "11.14.0",
      "@emotion/styled": "11.14.1",
      "@mui/material": "7.3.11",
      "@mui/system": "7.3.11"
    }
  },
  "tar": "/tmp/mui-upgrade/s4b-final-package/pack/rankingcoach-vanguard-2.8.0.tgz",
  "tar_sha256": "3f7d7c0b17f70f1a84a0e5d5c86f6d849d64cc52d3c689bc820f4e15dfa62eed",
  "source_and_packed_pins": {
    "@mui/material": "7.3.11",
    "@mui/system": "7.3.11",
    "@mui/x-date-pickers": "8.29.5"
  },
  "runtime": {
    "consumers": {
      "default-declared": 5,
      "default-mui": 5,
      "wp-declared": 4,
      "wp-mui": 4
    },
    "aggregate": 18,
    "expected_aggregate": 18
  }
}
```
Pickers8.29.5 verified in installed root source and packed manifest devDependencies, with fresh builds from those unchanged candidate inputs; pickers bundled, external pickers intentionally absent in all consumers. Declared-only consumers intentionally have no external Material/System; MUI-present consumers have Material/System7.3.11. All4 ReactDOM19.2.0, EmotionReact11.14.0/Styled11.14.1. Current root JS/declarations match tar for both bundles, with8 installed consumer comparisons including WordPress.

Independent integrity (no reset; separate reread/hash implementation):
```json
{
  "492": {
    "count": 492,
    "approved_differences": [
      "src/core/ToggleButton/_ToggleButton.mui.spec.tsx"
    ]
  },
  "490": {
    "count": 490,
    "approved_differences": [
      "src/core/DatePicker/_DatePickerCompatibility.mui.spec.tsx",
      "src/core/DatePicker/_DatePickerKeyboardLayoutMuiContract.stories.tsx",
      "src/core/ToggleButton/_ToggleButton.mui.spec.tsx"
    ]
  },
  "accepted485": {
    "count": 485,
    "mismatches": []
  },
  "candidate_inputs": {
    "count": 5669,
    "changed": [],
    "added": []
  },
  "generated_drift": {
    "dynamic-import-analysis-simple.json": {
      "before": "f55092f8cb9c3b88d3f80b54cb4ced3655cd649d9a490df3a08cfb8499ed3582",
      "after": "58b157d6167d4636d0c2d49f50933b233bbeca9702ae42ddaaaace606a8bdd76"
    },
    "dynamic-import-analysis.json": {
      "before": "9390b9ced9444178f1d8733675641cfcf1f87856f4805ddb3a4ba9aaf9ea4c9a",
      "after": "24597b61c014c5ceecbbc4c889bf31af0f34f9e512267b1d64554b5f96ca6dd2"
    },
    "dist/vanguard-asset-analysis.json": {
      "before": "8b794f89a57df6219341940bc79a210c66b696fc85a5c3a97b50378a0e12d6cb",
      "after": "1ac0597d5fd0d623fd1b3c74427cead55d0b8b8271dc1069345be7c8b077b24f"
    },
    ".tsbuildinfo-app": {
      "before": "c1aaa9fe009356d5b2a34b43ca66b726999fa87cc5936a4a587f136f111fd1b9",
      "after": "9328bebb9ca295d5bbb22bfcf8ccb89770534276ba3462f76f1c874bc538bc9d"
    }
  }
}
```
Candidate inputs unchanged before/after; expected generated build drift recorded separately, including the two dynamic-import analysis JSON outputs and generated build/tsbuildinfo artifacts. Original492 allows only approved ToggleButton difference; original490 allows exactly3 approved SHA changes. All485 accepted tests including S2 remain identical; new S4b tests were never silently substituted for baseline tests.

All earlier history above is preserved: initial136RED, false-only136RED, new regression REDs, browser3RED, reconstructed4 generic errors plus browser HARNESS FAILURE/process deviation, npm10 pack stop, and honest old/new S2 public behavior GREEN. The earlier target-only tar remains insufficient full-package proof; this fresh canonical run supplies both current builds.

Carried limitations remain explicit: root peer baseline, undeclared broader MUI types, WordPress declarations, public runtime subpaths and browser policy; no large waiver. False-field DOM option is removed in v9; no v8 runtime warning invented. User S5 decision remains recorded for after the S4b verdict; no S5 started. No acceptance, source/test/config/dependency/tooling edits, subagents, checkout, commit, push, PR or CR.

Read-only supplementary timeout audit: first raw/reported1 in0.154s from an incorrect controller-local Vitest import path (ERR_MODULE_NOT_FOUND); retained timeout-audit.log/process/resources. No test ran. Corrected only that read-only controller import to vitest/node; corrected audit raw/reported0/0 in0.878s, mach_continuous_time/inhibit=True/inhibitor reaped, timeout1800 unchanged. This audit path failure is not a product gate failure; all13 final gates remain raw/reported0. Exact audit command is recorded in both process JSONs.

## Root final handoff inspection

Root read fresh review-s4b.md (no actionable findings), complete final report/audit, and independently checked all13 actual final process records: raw/reported0, including coverage467.805s and fresh package526.195s. Independently rehashed tar SHA2563f7d7c0b17f70f1a84a0e5d5c86f6d849d64cc52d3c689bc820f4e15dfa62eed; all recorded post-run candidate input hashes remain current with zero differences. git diff --check0. C1 normal198.617/276.554/240.608ms and coverage200.353/230.811/244.179ms, all passed and below2500ms. Report-only root append does not require rerun.

Ready for overseer final S4b verdict; no acceptance or S5 start yet. All limitations/history remain above, with no commits/pushes/PRs/posted CR.
