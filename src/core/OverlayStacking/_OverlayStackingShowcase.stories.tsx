import { baseStore } from '@stores/redux-base.store';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { Modal } from '@vanguard/Modal/Modal';

import { DrawerModalAnchoredAutocomplete as _DrawerModalAnchoredAutocomplete } from './stories/DrawerModalAnchoredAutocomplete.story';
import { DrawerModalAutocomplete as _DrawerModalAutocomplete } from './stories/DrawerModalAutocomplete.story';
import { DrawerModalDatePicker as _DrawerModalDatePicker } from './stories/DrawerModalDatePicker.story';
import { DrawerModalDateRangePicker as _DrawerModalDateRangePicker } from './stories/DrawerModalDateRangePicker.story';
import { DrawerModalMenu as _DrawerModalMenu } from './stories/DrawerModalMenu.story';
import { DrawerModalPopover as _DrawerModalPopover } from './stories/DrawerModalPopover.story';
import { DrawerModalSearchableSelect as _DrawerModalSearchableSelect } from './stories/DrawerModalSearchableSelect.story';
import { DrawerModalSelect as _DrawerModalSelect } from './stories/DrawerModalSelect.story';
import { DrawerOverFullscreenModal as _DrawerOverFullscreenModal } from './stories/DrawerOverFullscreenModal.story';
import { FullscreenModalDrawerModal as _FullscreenModalDrawerModal } from './stories/FullscreenModalDrawerModal.story';
import { FullscreenModalDrawerModalPopover as _FullscreenModalDrawerModalPopover } from './stories/FullscreenModalDrawerModalPopover.story';
import { FullscreenModalFullscreenModalDatePicker as _FullscreenModalFullscreenModalDatePicker } from './stories/FullscreenModalFullscreenModalDatePicker.story';
import { ModalOverDrawer as _ModalOverDrawer } from './stories/ModalOverDrawer.story';
import { ModalOverDrawerWithHighlightInput as _ModalOverDrawerWithHighlightInput } from './stories/ModalOverDrawerWithHighlightInput.story';
import { Story } from './stories/_OverlayStacking.default';

export const ModalOverDrawer: Story = { ..._ModalOverDrawer };
export const ModalOverDrawerWithHighlightInput: Story = { ..._ModalOverDrawerWithHighlightInput };
export const DrawerOverFullscreenModal: Story = { ..._DrawerOverFullscreenModal };
export const FullscreenModalDrawerModal: Story = { ..._FullscreenModalDrawerModal };
export const FullscreenModalDrawerModalPopover: Story = { ..._FullscreenModalDrawerModalPopover };
export const DrawerModalSelect: Story = { ..._DrawerModalSelect };
export const DrawerModalDatePicker: Story = { ..._DrawerModalDatePicker };
export const DrawerModalPopover: Story = { ..._DrawerModalPopover };
export const DrawerModalMenu: Story = { ..._DrawerModalMenu };
export const DrawerModalAutocomplete: Story = { ..._DrawerModalAutocomplete };
export const DrawerModalAnchoredAutocomplete: Story = { ..._DrawerModalAnchoredAutocomplete };
export const DrawerModalSearchableSelect: Story = { ..._DrawerModalSearchableSelect };
export const DrawerModalDateRangePicker: Story = { ..._DrawerModalDateRangePicker };
export const FullscreenModalFullscreenModalDatePicker: Story = { ..._FullscreenModalFullscreenModalDatePicker };

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
