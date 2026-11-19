// Mirrors the committed rc-webapp ambient declarations for Vanguard's stylesheet and overlay chunk.
declare module '*.css' {}

declare module 'vanguard/dist/index-OverlayStackingService.js' {
  export {
    OVERLAY_BASE_Z_INDEX,
    OverlayStackingService,
  } from 'vanguard/dist/types/core/OverlayStacking/OverlayStackingService';
}
