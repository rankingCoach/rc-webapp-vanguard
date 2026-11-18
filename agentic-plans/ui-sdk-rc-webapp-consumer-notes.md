# rc-webapp: what the own-core Vanguard expects from its consumer

## Stylesheet order (D15)

Vanguard's MUI-ported CSS no longer comes from emotion at runtime. It is the last block of
`@rankingcoach/vanguard/style.css` and decides equal-specificity ties by position, exactly as emotion did in the
built app. That only holds while the head order stays:

1. entry-chunk CSS (`<link>` in `app-build/index.html`),
2. `@rankingcoach/vanguard/style.css`,
3. route-chunk CSS (lazy routes, appended by Vite's preload helper on navigation).

Today `html/react/src/app/main.tsx:25` guarantees step 2: `import("@rankingcoach/vanguard/style.css")` runs after
`createRoot(...).render(...)` (line 17) and its `<link>` is appended to `<head>` during that call, after the static
entry link and before any route chunk loads. Keep that line (or an equivalent that loads the Vanguard CSS after the
entry CSS and before route CSS). Moving the import into a route chunk, or turning it into a static import that Vite
bundles into the entry CSS ahead of app modules, changes which side wins ties.

Rules that tie today are listed in `tmp/research/vanguard-ui-sdk-visual-baseline/consumer-overrides.md`
("Built CSS: entry vs lazy"). Entry-chunk rules lose ties to Vanguard; route-chunk rules win them.

Storybook dev (`.storybook/preview.tsx` imports `style.css` statically, CSS modules follow) has a different order,
so colour/border-only differences on entry-rule ties in rc-webapp stories are dev-order artefacts; Vanguard's
production-order fixtures (`src/test-utils/consumer-css.tsx`) are the reference.
