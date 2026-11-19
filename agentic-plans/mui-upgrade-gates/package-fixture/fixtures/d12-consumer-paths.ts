import '@rankingcoach/vanguard/style.css';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from 'vanguard/dist/index-OverlayStackingService.js';
import type { SplitViewElement } from 'vanguard/dist/types/core/Modal/ModalSplitView/ModalSplitView';
import type {
  OVERLAY_BASE_Z_INDEX as DeclaredBaseZIndex,
  OverlayStackingService as DeclaredOverlayService,
} from 'vanguard/dist/types/core/OverlayStacking/OverlayStackingService';
import type { Equal, Expect, NotAny } from './_helpers';

export type ConsumerDeepImportChecks = [
  Expect<Equal<typeof OVERLAY_BASE_Z_INDEX, typeof DeclaredBaseZIndex>>,
  Expect<Equal<typeof OverlayStackingService, typeof DeclaredOverlayService>>,
  Expect<NotAny<typeof DeclaredBaseZIndex>>,
  Expect<NotAny<typeof DeclaredOverlayService>>,
  Expect<NotAny<SplitViewElement>>,
];
