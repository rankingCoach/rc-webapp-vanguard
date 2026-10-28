import { SbDecorator } from "@test-utils/get-storybook-decorator.tsx";
import { Textarea } from "@vanguard/Textarea/Textarea.tsx";
import { TEXTAREA_STORY_CONTROLS } from "@vanguard/Textarea/stories/helpers/Textarea.tests.constants.tsx";

// Storybook configuration
export default {
  ...SbDecorator({
    title: "Vanguard/Textarea",
    component: Textarea,
    extra: TEXTAREA_STORY_CONTROLS,
    opts: {
      withRedux: true,
    },
  }),
};

// All story imports
import { TestDisabledProp as _TestDisabledProp } from "./stories/TestDisabledProp.story";
import { TestRequiredProp as _TestRequiredProp } from "./stories/TestRequiredProp.story";
import { TestCounterProp as _TestCounterProp } from "./stories/TestCounterProp.story";
import { TestPlaceholderProp as _TestPlaceholderProp } from "./stories/TestPlaceholderProp.story";
import { TestValueProp as _TestValueProp } from "./stories/TestValueProp.story";
import { TestInfoTextProp as _TestInfoTextProp } from "./stories/TestInfoTextProp.story";
import { TestWriteInsideInput as _TestWriteInsideInput } from "./stories/TestWriteInsideInput.story";
import { WithPlaceholderTextarea as _WithPlaceholderTextarea } from "./stories/WithPlaceholderTextarea.story";
import { TextareaWithUrlMask as _TextareaWithUrlMask } from "./stories/TextareaWithUrlMask.story";
import { TextareaWithUrlMaskPositive as _TextareaWithUrlMaskPositive } from "./stories/TextareaWithUrlMaskPositive.story";
import { TextareaWithUrlMaskInfo as _TextareaWithUrlMaskInfo } from "./stories/TextareaWithUrlMaskInfo.story";
import { TextareaHighlightUrlsTest as _TextareaHighlightUrlsTest } from "./stories/TextareaHighlightUrlsTest.story";
import { TextareaHighlightUrlsBackdropGrowSync as _TextareaHighlightUrlsBackdropGrowSync } from "./stories/TextareaHighlightUrlsBackdropGrowSync.story";
import { TextareaHighlightUrlsScrollSync as _TextareaHighlightUrlsScrollSync } from "./stories/TextareaHighlightUrlsScrollSync.story";
import { TextareaHighlightUrlsSpecialCharsSync as _TextareaHighlightUrlsSpecialCharsSync } from "./stories/TextareaHighlightUrlsSpecialCharsSync.story";
import { TextareaHighlightUrlsShortenSync as _TextareaHighlightUrlsShortenSync } from "./stories/TextareaHighlightUrlsShortenSync.story";
import { TextareaHighlightUrlsLoadingCycleSync as _TextareaHighlightUrlsLoadingCycleSync } from "./stories/TextareaHighlightUrlsLoadingCycleSync.story";
import { TestAdornmentProp as _TestAdornmentProp } from "./stories/TestAdornmentProp.story";
import { TestAutoFocusProp as _TestAutoFocusProp } from "./stories/TestAutoFocusProp.story";
import { TestLabelProp as _TestLabelProp } from "./stories/TestLabelProp.story";
import { TestHighlightWordsProp as _TestHighlightWordsProp } from "./stories/TestHighlightWordsProp.story";

// All story exports
export const TestDisabledProp = { ..._TestDisabledProp };
export const TestRequiredProp = { ..._TestRequiredProp };
export const TestCounterProp = { ..._TestCounterProp };
export const TestPlaceholderProp = { ..._TestPlaceholderProp };
export const TestValueProp = { ..._TestValueProp };
export const TestInfoTextProp = { ..._TestInfoTextProp };
export const TestWriteInsideInput = { ..._TestWriteInsideInput };
export const WithPlaceholderTextarea = { ..._WithPlaceholderTextarea };
export const TextareaWithUrlMask = { ..._TextareaWithUrlMask };
export const TextareaWithUrlMaskPositive = { ..._TextareaWithUrlMaskPositive };
export const TextareaWithUrlMaskInfo = { ..._TextareaWithUrlMaskInfo };
export const TextareaHighlightUrlsTest = { ..._TextareaHighlightUrlsTest };
export const TextareaHighlightUrlsBackdropGrowSync = { ..._TextareaHighlightUrlsBackdropGrowSync };
export const TextareaHighlightUrlsScrollSync = { ..._TextareaHighlightUrlsScrollSync };
export const TextareaHighlightUrlsSpecialCharsSync = { ..._TextareaHighlightUrlsSpecialCharsSync };
export const TextareaHighlightUrlsShortenSync = { ..._TextareaHighlightUrlsShortenSync };
export const TextareaHighlightUrlsLoadingCycleSync = { ..._TextareaHighlightUrlsLoadingCycleSync };
export const TestAdornmentProp = { ..._TestAdornmentProp };
export const TestAutoFocusProp = { ..._TestAutoFocusProp };
export const TestLabelProp = { ..._TestLabelProp };
export const TestHighlightWordsProp = { ..._TestHighlightWordsProp };
