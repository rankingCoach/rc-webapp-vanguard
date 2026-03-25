import { disableControls, SbDecorator } from '@test-utils/get-storybook-decorator';
import { TextHighlighted } from './TextHighlighted';

export default {
  ...SbDecorator({
    title: 'vanguard/TextHighlighted',
    component: TextHighlighted,
    extra: {
      ...disableControls(['']),
    },
  }),
};

// All story imports
import { TextHighlightedDefault as _TextHighlightedDefault } from './stories/TextHighlightedDefault.story';
import { TextHighlightedMultiWord as _TextHighlightedMultiWord } from './stories/TextHighlightedMultiWord.story';
import { TextHighlightedWithEmphasis as _TextHighlightedWithEmphasis } from './stories/TextHighlightedWithEmphasis.story';
import { TextHighlightedXSSProtection as _TextHighlightedXSSProtection } from './stories/TextHighlightedXSSProtection.story';
import { TextHighlightedStripsImgTag as _TextHighlightedStripsImgTag } from './stories/TextHighlightedSanitization.story';
import { TextHighlightedStripsScriptTag as _TextHighlightedStripsScriptTag } from './stories/TextHighlightedSanitization.story';
import { TextHighlightedStripsEventAttributes as _TextHighlightedStripsEventAttributes } from './stories/TextHighlightedSanitization.story';
import { TextHighlightedPreservesWhitelistedTags as _TextHighlightedPreservesWhitelistedTags } from './stories/TextHighlightedSanitization.story';
import { TestHighlightModeBackground as _TestHighlightModeBackground } from './stories/TestHighlightModeProp.story';
import { TestHighlightModeText as _TestHighlightModeText } from './stories/TestHighlightModeProp.story';
import { TestHighlightModeBold as _TestHighlightModeBold } from './stories/TestHighlightModeProp.story';
import { TestCaseInsensitiveFalse as _TestCaseInsensitiveFalse } from './stories/TestCaseInsensitiveProp.story';
import { TestCaseInsensitiveTrue as _TestCaseInsensitiveTrue } from './stories/TestCaseInsensitiveProp.story';

// All story exports
export const TextHighlightedDefault = { ..._TextHighlightedDefault };
export const TextHighlightedMultiWord = { ..._TextHighlightedMultiWord };
export const TextHighlightedWithEmphasis = { ..._TextHighlightedWithEmphasis };
export const TextHighlightedXSSProtection = { ..._TextHighlightedXSSProtection };
export const TextHighlightedStripsImgTag = { ..._TextHighlightedStripsImgTag };
export const TextHighlightedStripsScriptTag = { ..._TextHighlightedStripsScriptTag };
export const TextHighlightedStripsEventAttributes = { ..._TextHighlightedStripsEventAttributes };
export const TextHighlightedPreservesWhitelistedTags = { ..._TextHighlightedPreservesWhitelistedTags };
export const TestHighlightModeBackground = { ..._TestHighlightModeBackground };
export const TestHighlightModeText = { ..._TestHighlightModeText };
export const TestHighlightModeBold = { ..._TestHighlightModeBold };
export const TestCaseInsensitiveFalse = { ..._TestCaseInsensitiveFalse };
export const TestCaseInsensitiveTrue = { ..._TestCaseInsensitiveTrue };
