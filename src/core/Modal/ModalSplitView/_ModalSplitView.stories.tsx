import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { ModalSplitView } from '@vanguard/Modal/ModalSplitView/ModalSplitView';
import { Story } from './stories/_ModalSplitView.default';
import { LeftOverlay as _LeftOverlay } from './stories/LeftOverlay.story';
import { LeftOverlayWithCollapseToggle as _LeftOverlayWithCollapseToggle } from './stories/LeftOverlayWithCollapseToggle.story';
import { RightOverlay as _RightOverlay } from './stories/RightOverlay.story';
import { RightOverlayWithCollapseToggle as _RightOverlayWithCollapseToggle } from './stories/RightOverlayWithCollapseToggle.story';
import { RightOverlayWithBottomMargin as _RightOverlayWithBottomMargin } from './stories/RightOverlayWithBottomMargin.story';
import { RightOverlayFullCover as _RightOverlayFullCover } from './stories/RightOverlayFullCover.story';
import { Responsive as _Responsive } from './stories/Responsive.story';

export const LeftOverlay: Story = { ..._LeftOverlay };
export const LeftOverlayWithCollapseToggle: Story = { ..._LeftOverlayWithCollapseToggle };
export const RightOverlay: Story = { ..._RightOverlay };
export const RightOverlayWithCollapseToggle: Story = { ..._RightOverlayWithCollapseToggle };
export const RightOverlayWithBottomMargin: Story = { ..._RightOverlayWithBottomMargin };
export const RightOverlayFullCover: Story = { ..._RightOverlayFullCover };
export const Responsive: Story = { ..._Responsive };

export default {
  ...SbDecorator({
    title: 'Vanguard/Modal/ModalSplitView',
    component: ModalSplitView,
  }),
};
