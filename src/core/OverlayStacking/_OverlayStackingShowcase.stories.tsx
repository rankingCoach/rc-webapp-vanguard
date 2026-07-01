import { baseStore } from '@stores/redux-base.store';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { Modal } from '@vanguard/Modal/Modal';

import { DrawerModalSelect as _DrawerModalSelect } from './stories/DrawerModalSelect.story';
import { DrawerOverFullscreenModal as _DrawerOverFullscreenModal } from './stories/DrawerOverFullscreenModal.story';
import { FullscreenModalDrawerModal as _FullscreenModalDrawerModal } from './stories/FullscreenModalDrawerModal.story';
import { FullscreenModalDrawerModalPopover as _FullscreenModalDrawerModalPopover } from './stories/FullscreenModalDrawerModalPopover.story';
import { ModalOverDrawer as _ModalOverDrawer } from './stories/ModalOverDrawer.story';
import { Story } from './stories/_OverlayStacking.default';

export const ModalOverDrawer: Story = { ..._ModalOverDrawer };
export const DrawerOverFullscreenModal: Story = { ..._DrawerOverFullscreenModal };
export const FullscreenModalDrawerModal: Story = { ..._FullscreenModalDrawerModal };
export const FullscreenModalDrawerModalPopover: Story = { ..._FullscreenModalDrawerModalPopover };
export const DrawerModalSelect: Story = { ..._DrawerModalSelect };

export default {
  ...SbDecorator({
    title: 'Vanguard/OverlayStacking/Showcase',
    component: Modal,
    // Input (and other form components used in showcase modals) read from
    // Redux via `useSelector` — without a Provider in the tree they throw
    // "could not find react-redux context value". Wiring up `baseStore`
    // matches what MUIComponentsShowcase does for the same reason.
    opts: {
      customStore: baseStore,
    },
  }),
};
