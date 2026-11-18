# OverlayStackingService

Shared z-index ledger for modals, drawers and popovers. Call register(id, kind, baseZIndex) when an app overlay shows to get a z-index above every open vanguard overlay, and unregister(id) when it hides.

- Kind: helper
- Import: `import { OverlayStackingService } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/OverlayStacking/OverlayStackingService.ts`
- Keywords: overlay, z-index, stacking, layer, modal, drawer, popover, service
