# Consumer styles that tie with Vanguard

[Consumer stylesheet inventory](./ui-sdk-rc-webapp-consumer-notes.md) covers the earlier D15 rules.

## Tie rule 13 · Navbar AppBar transition

`Navbar.module.scss:7` declares `background 0.3s ease, box-shadow 0.3s ease`. Its module class and Vanguard's
`.MuiAppBar-root:where([data-vg-core])` rule each have specificity `(0,1,0)`. Vanguard declares
`box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)`, as does the MUI Paper root.

Verifier 2 captured the tie in the guarded `NavbarDefault` story. On `.472`, the Navbar rule was sheet 87
and MUI's Emotion rule was sheet 506. The later MUI rule won. On `cac6a6b`, the Vanguard rule was sheet 5
and the Navbar rule was sheet 88. The later Navbar rule won and Chromium animated the background on scroll.
Both bars settled at opaque white. Evidence is `v2/out/h19-navbar-transition-css.json`.

The customer app reaches the Navbar stylesheet through this static chain:

```text
html/react/index.html:12
  src/app/main.tsx:4
  src/app/App.tsx:25
  src/app/initialize-router.ts:3
  src/routeTree.gen.ts:16
  src/app/routes/customer.tsx:4
  src/components/layout/CustomerLayout/CustomerLayout.tsx:13
  src/components/layout/Navbar/Navbar.tsx:2
  src/components/layout/Navbar/Navbar.module.scss
```

The inspected `app-build/index.html` links `index-1795001545481.css`, the only one of 185 emitted CSS files
containing a Navbar app-bar selector. `main.tsx:25` imports `@rankingcoach/vanguard/style.css` separately.
The built JS lists `assets/vanguard-DJT1fxmk.css` at dependency slot 474 for that import. No lazy Navbar
stylesheet was found. `RenderRoot.tsx` has its own loader and sits outside this entry chain.

`NavbarInProductionStylesheetOrder` in
[_AppBarComputedParity.stories.tsx](../src/core/AppBar/_AppBarComputedParity.stories.tsx) places the entry CSS
before Vanguard. At rest and scrolled, both headers compute `box-shadow`, `0.3s`,
`cubic-bezier(0.4, 0, 0.2, 1)` and `0s`. The fixture is green locally at `73d25d7`.
Verifier 2 independently ran that exact SHA twice, 3/3 stories each time, and accepted tie #13 for the customer
entry. The guarded raw results are `v2/out/par/h19-d15-73d25d7-port-{1,2}.json`.

Before release, confirm the built customer app puts the entry CSS before Vanguard CSS in `<head>` and check
that the bar changes background immediately on scroll. The built app itself was inspected as files.
