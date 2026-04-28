import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { Text } from '@vanguard/Text/Text';
import { TEXT_STORY_CONTROLS, Story } from './stories/_Text.default';
import { HighlightModeBackground as _HighlightModeBackground } from './stories/HighlightModeBackground.story';
import { HighlightModeText as _HighlightModeText } from './stories/HighlightModeText.story';
import { HighlightModeBold as _HighlightModeBold } from './stories/HighlightModeBold.story';
import { HighlightCaseInsensitiveFalse as _HighlightCaseInsensitiveFalse } from './stories/HighlightCaseInsensitive.story';
import { HighlightCaseInsensitiveTrue as _HighlightCaseInsensitiveTrue } from './stories/HighlightCaseInsensitive.story';
import { HighlightDefault as _HighlightDefault } from './stories/HighlightDefault.story';
import { HighlightWithEmphasis as _HighlightWithEmphasis } from './stories/HighlightWithEmphasis.story';

export const HighlightDefault: Story = { ..._HighlightDefault };
export const HighlightWithEmphasis: Story = { ..._HighlightWithEmphasis };
export const HighlightModeBackground: Story = { ..._HighlightModeBackground };
export const HighlightModeText: Story = { ..._HighlightModeText };
export const HighlightModeBold: Story = { ..._HighlightModeBold };
export const HighlightCaseInsensitiveFalse: Story = { ..._HighlightCaseInsensitiveFalse };
export const HighlightCaseInsensitiveTrue: Story = { ..._HighlightCaseInsensitiveTrue };

export default {
  ...SbDecorator({
    title: 'Vanguard/Text Highlight',
    component: Text,
    extra: TEXT_STORY_CONTROLS,
  }),
};
