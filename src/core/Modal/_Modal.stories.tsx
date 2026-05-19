import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { Modal } from "@vanguard/Modal/Modal";
import { modalStoriesStore } from "@vanguard/Modal/stories/bootstrap/Modal.stories.slice";
import modalDescription from "./Modal.description.md?raw";
import { Story } from "./stories/_Modal.default";
import { ModalStory as _ModalStory } from "./stories/ModalStory.story";
import { CloseViaService as _CloseViaService } from "./stories/CloseViaService.story";
import { CloseViaHeaderButton as _CloseViaHeaderButton } from "./stories/CloseViaHeaderButton.story";
import { CloseViaOutsideClick as _CloseViaOutsideClick } from "./stories/CloseViaOutsideClick.story";
import { CloseViaCallbacks as _CloseViaCallbacks } from "./stories/CloseViaCallbacks.story";
import { MultipleModalsClosing as _MultipleModalsClosing } from "./stories/MultipleModalsClosing.story";
import { CloseWithResponseData as _CloseWithResponseData } from "./stories/CloseWithResponseData.story";
import { CloseListeners as _CloseListeners } from "./stories/CloseListeners.story";
import { TwoModalsOverlapping as _TwoModalsOverlapping } from "./stories/TwoModalsOverlapping.story";
import { TwoModalsOverlappingDifferentAnimations as _TwoModalsOverlappingDifferentAnimations } from "./stories/TwoModalsOverlappingDifferentAnimations.story";
import {
  StackGrowGrow as _StackGrowGrow,
  StackSlideSlide as _StackSlideSlide,
  StackPopPop as _StackPopPop,
  StackGrowSlide as _StackGrowSlide,
  StackSlideGrow as _StackSlideGrow,
  StackGrowPop as _StackGrowPop,
  StackPopGrow as _StackPopGrow,
  StackSlidePop as _StackSlidePop,
  StackPopSlide as _StackPopSlide,
  StackFullscreenOverNormal as _StackFullscreenOverNormal,
  StackNormalOverFullscreen as _StackNormalOverFullscreen,
  StackFullscreenSlideOverNormalGrow as _StackFullscreenSlideOverNormalGrow,
  StackNormalSlideOverFullscreenGrow as _StackNormalSlideOverFullscreenGrow,
  StackNormalPopOverFullscreenSlide as _StackNormalPopOverFullscreenSlide,
} from "./stories/StackingPermutations.story";

export const ModalStory: Story = { ..._ModalStory };
export const CloseViaService: Story = { ..._CloseViaService };
export const CloseViaHeaderButton: Story = { ..._CloseViaHeaderButton };
export const CloseViaOutsideClick: Story = { ..._CloseViaOutsideClick };
export const CloseViaCallbacks: Story = { ..._CloseViaCallbacks };
export const MultipleModalsClosing: Story = { ..._MultipleModalsClosing };
export const CloseWithResponseData: Story = { ..._CloseWithResponseData };
export const CloseListeners: Story = { ..._CloseListeners };
export const TwoModalsOverlapping: Story = { ..._TwoModalsOverlapping };
export const TwoModalsOverlappingDifferentAnimations: Story = { ..._TwoModalsOverlappingDifferentAnimations };
export const StackGrowGrow: Story = { ..._StackGrowGrow };
export const StackSlideSlide: Story = { ..._StackSlideSlide };
export const StackPopPop: Story = { ..._StackPopPop };
export const StackGrowSlide: Story = { ..._StackGrowSlide };
export const StackSlideGrow: Story = { ..._StackSlideGrow };
export const StackGrowPop: Story = { ..._StackGrowPop };
export const StackPopGrow: Story = { ..._StackPopGrow };
export const StackSlidePop: Story = { ..._StackSlidePop };
export const StackPopSlide: Story = { ..._StackPopSlide };
export const StackFullscreenOverNormal: Story = { ..._StackFullscreenOverNormal };
export const StackNormalOverFullscreen: Story = { ..._StackNormalOverFullscreen };
export const StackFullscreenSlideOverNormalGrow: Story = { ..._StackFullscreenSlideOverNormalGrow };
export const StackNormalSlideOverFullscreenGrow: Story = { ..._StackNormalSlideOverFullscreenGrow };
export const StackNormalPopOverFullscreenSlide: Story = { ..._StackNormalPopOverFullscreenSlide };

export default {
  ...SbDecorator({
    title: "vanguard/Modal",
    component: Modal,
    opts: {
      customStore: modalStoriesStore,
      description: modalDescription,
    },
  }),
};
