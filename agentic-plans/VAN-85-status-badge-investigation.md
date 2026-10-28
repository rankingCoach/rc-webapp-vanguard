# StatusBadge for the webapp's "New" badge: investigation (VAN-85)

**Ticket:** [VAN-85](https://rankingcoach.atlassian.net/browse/VAN-85), StatusBadge part.
**Goal:** a StatusBadge in the Ado colour (12% Ado fill, `--ado-text` text) and a compact size (18px tall, 11px bold,
padding 1px 7px), for the webapp's "New" badge.
**Verdict:** additive, not breaking. Only one theme token (`--ado-text`) is missing, and it has a safe fallback, so the
work is not blocked. The token request is in `VAN-85-status-badge-theme-request.md`.

---

## 1. Tokens

| Token | Vanguard (`theming/direct-channel/direct-channel.min.css`, `.storybook/theming.css`) | Webapp (`html/theming/default-theme.scss:174`, `html/theming/definitions/*`) |
|---|---|---|
| `--ado-base` | `#006a85`, same in both colour schemes | `oklch(0.4868 0.0909 223.33)` (= `#006a85`) |
| `--ado-base-rgb` | `0, 106, 133` | present |
| `--ado-text` | **missing** | **missing** (no match anywhere in `html/`) |

`agentic-plans/ado-styling-spec.md` only covers the glow and shimmer (`--ai-base-color` and derived colours). It does
not define a text token.

### Fill: no theme token needed

The fill is `color-mix(in srgb, var(--ado-base) 12%, transparent)`. It is derived from an existing token, so it does
not need its own theme token. `getColorsBasedOnStatus` returns token **names**, which StatusBadge, StatusBadgeIcon and
Icon then wrap in `var(...)`. To keep that contract, StatusBadge's SCSS module declares two component-scoped custom
properties on the badge root. These are component variables, not theme tokens:

```scss
--status-badge-ado-background-color: color-mix(in srgb, var(--ado-base) 12%, transparent);
--status-badge-ado-text-color: var(--ado-text, var(--ado-base));
```

The helper returns those names. Children (Text, Icon) inherit them. Icon's `parseColor` tries to resolve a variable
on the document root first; these variables are not on the root, so it falls back to `var(...)` and resolves on the
element, as intended.

### Text: `--ado-text` is requested

- Until the token ships, the text falls back to `--ado-base`. In light mode that is `#006a85` on the 12% fill over
  white (≈ `#e0edf0`), a contrast of ≈ 5.2:1, which passes AA for 11px bold.
- In the dark scheme, `#006a85` on a 12% teal over a dark surface does **not** have enough contrast. This is why the
  token is needed (see the request). Once the webapp ships `--ado-text`, nothing changes in Vanguard.

## 2. API decisions

### Status name: `'ado'`

- Added to `StatusBadgeStatus` next to `'ai'`, to `statusBadgeGetAllStates()` (both copies), and to the colour helper.
- Why not restyle `'ai'`? It uses `--a1100` / `--a1500` (the purple AI accent) and has two literal users in the webapp
  (`MediaItemDetails.tsx:70`, `ReviewCardReply.tsx:78`) plus `media-display.ts:107,132`. Ado is a different brand
  colour (teal), so a separate status keeps `'ai'` unchanged.
- The `'ado'` colours:
  - icon: `IconNames.ado`, in `--ado-base` with a white glyph
  - `reverseColor`: `--ado-base`
  - big variant glow: `--ado-base-rgb`

### Size: new `size?: 'default' | 'compact'` prop (not a new `variant`)

- `variant` already switches between two different layouts: `small` is the pill, and `big` is a stacked icon over an
  intro-sized title with a glow. "Compact" is a smaller **pill**, so it is a size of `small`, not a third layout.
  Adding `variant="compact"` would make `variant` mean two things.
- `size` only affects `variant="small"` (the default) and is ignored for `big`. The default `'default'` renders
  exactly as today.
- Compact means:
  - 18px tall (`box-sizing: border-box`)
  - padding `1px 7px`
  - text at 11px, bold unless `fontWeight` is passed (Text `fontSize={11}` with the caption's 16px line height:
    1 + 16 + 1 = 18)
  - when an icon is shown: the circle icon is shrunk to `forceSize={10}` (10 + 2×2 padding + 2×2 border = 18px), and
    the padding becomes `0 7px 0 0`, so the height stays 18
  - with `iconVariant="none"`, the 16px fixed height of the none-icon class is overridden by the compact rules
- The "New" badge then reads:
  `<StatusBadge status="ado" size="compact" hideIcon text="New" />`.

### Breaking?

No. The change adds a union member, an optional prop and two scoped CSS variables. The default render is byte-identical.
The duplicated `.status-badge-none-icon` block in `StatusBadge.module.scss` is removed. Both copies were identical, so
there is no visual change.

## 3. Webapp sweep (`/Users/alex/Documents/rc-webapp/html/react/src`)

- **No "New" badge exists yet.** There are no matches for `NewBadge`, `NewTag`, `new-pill`, `new-label`, `badge.new`,
  `newFeature` or a "New" translation key.
  - `isNew` in `components/agent/helpers/open-agent-window.tsx:59`, `use-open-agent.ts:131` and
    `admin/agent/Conversations/AgentLoadedCapabilities.tsx:163-206` means "newly opened" or "newly loaded", not a badge.
  - The literal "New" in `partner/ResellerAccounts/ResellerAccountsColumns.tsx:63` is a filter option.
  - The only git hit is an old 2020 PHP commit, `4e0a1d3cdac A060-23 - Hide new badge for GMB globally`, which has no
    React counterpart.
  - The badge is therefore still to be built, and should use the new API directly.
- **Closest existing pattern:** `components/_common/ComingSoonCard/ComingSoonCard.tsx:56-60`,
  `<StatusBadge hideIcon status="scheduled" text="Coming soon" />`. That is the same shape as the planned "New" badge.
- **Hand-rolled compact pills that could migrate to `size="compact"`.** These are optional follow-ups for the webapp, not
  part of VAN-85:

  | File | Class | Styles | Notes |
  |---|---|---|---|
  | `components/admin/AiUsageKpis/AiUsageKpis.module.scss:218` | `.partialTag` | 10px/600, `--w500` on `--w100`, pill | The closest status chip; could become `status="warning" size="compact"` |
  | `components/ai-conversations/widgets/presence/engagement/CampaignSeriesConversationWidget/CampaignSeriesWidget/CampaignSeriesWidget.module.scss:31,125` | `.countPill`, `.indexPill` | 11px/600, `2px 8px` | |
  | `components/_common/GeneratedWithAIPill/GeneratedWithAIPill.module.scss:1` | `.aiPill` | `a1100` / `a1-500`, `2px 12px` | A re-implementation of `status="ai"` |
  | `components/agent/Agent/AgentChatAdminSettings/AgentChatAdminSettings.module.scss:61` | `.badge` | 16px | A counter dot, not a status badge; leave as is |
  | `components/admin/website-builder/Info/WebsiteBuilderInfoDiagramPrimitives.module.scss:91` | `.chip` | monospace | Admin-only; leave |

- **StatusBadge usage in the webapp:**
  - 112 `<StatusBadge` across 65 files, all imported from `"vanguard"`.
  - `variant`: `small` 51, `big` 4.
  - `status="ai"`: 2 literal uses.
  - None of these change.
- **Ado + badge:** nothing yet. `src/styles/_ado-surface.scss:6` maps `--ai-base-color: var(--ado-base)` on Ado
  surfaces. That does not affect StatusBadge, which never reads `--ai-base-color`.

## 4. Pending

- The webapp theme generator adds `--ado-text` (see `VAN-85-status-badge-theme-request.md`). Vanguard works without
  it, falling back to `--ado-base`, which is readable in light mode only.
