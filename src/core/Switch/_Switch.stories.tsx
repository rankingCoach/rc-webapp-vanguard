import { disableControls, SbDecorator } from '@test-utils/get-storybook-decorator';

import { Switch } from './Switch';
import { SWITCH_EXCLUDED_CONTROLS_DEFAULT, switchArgTypes, SwitchStory } from './stories/_Switch.default';

import { SwitchDefault as _SwitchDefault } from './stories/SwitchDefault.story';
import { SwitchChecked as _SwitchChecked } from './stories/SwitchChecked.story';
import { SwitchDisabled as _SwitchDisabled } from './stories/SwitchDisabled.story';
import { SwitchLabelLeft as _SwitchLabelLeft } from './stories/SwitchLabelLeft.story';
import { SwitchSizes as _SwitchSizes } from './stories/SwitchSizes.story';
import { SwitchLoading as _SwitchLoading } from './stories/SwitchLoading.story';

export const SwitchDefault: SwitchStory = { ..._SwitchDefault };
export const SwitchChecked: SwitchStory = { ..._SwitchChecked };
export const SwitchDisabled: SwitchStory = { ..._SwitchDisabled };
export const SwitchLabelLeft: SwitchStory = { ..._SwitchLabelLeft };
export const SwitchSizes: SwitchStory = { ..._SwitchSizes };
export const SwitchLoading: SwitchStory = { ..._SwitchLoading };

export default {
  ...SbDecorator({
    title: 'Vanguard/Switch',
    component: Switch,
    extra: {
      argTypes: {
        ...disableControls(SWITCH_EXCLUDED_CONTROLS_DEFAULT),
        ...switchArgTypes,
      },
    },
  }),
};
