import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { INPUT_BASE_STORY_CONTROLS } from "@vanguard/_internal/InputBase/stories/helpers/InoutBase.tests.constants";
import { InputBase } from "@vanguard/_internal/InputBase/InputBase";
import { inputBaseStore } from "@vanguard/_internal/InputBase/stories/bootstrap/InputBase.slice";

// Individual story imports with underscore aliases
import { IdTest as _IdTest } from "./IdTest.story";
import { ClassNameTest as _ClassNameTest } from "./ClassNameTest.story";
import { TextTypeTest as _TextTypeTest } from "./TextTypeTest.story";
import { NumberTypeTest as _NumberTypeTest } from "./NumberTypeTest.story";
import { NumberTypeInteractionTest as _NumberTypeInteractionTest } from "./NumberTypeInteractionTest.story";
import { PasswordTypeTest as _PasswordTypeTest } from "./PasswordTypeTest.story";
import { PasswordTypeInteractionTest as _PasswordTypeInteractionTest } from "./PasswordTypeInteractionTest.story";
import { RoundedNumericCTATypeTest as _RoundedNumericCTATypeTest } from "./RoundedNumericCTATypeTest.story";
import { ValueTest as _ValueTest } from "./ValueTest.story";
import { DefaultValueTest as _DefaultValueTest } from "./DefaultValueTest.story";
import { ValueAsDefaultValueTest as _ValueAsDefaultValueTest } from "./ValueAsDefaultValueTest.story";
import { PlaceholderTest as _PlaceholderTest } from "./PlaceholderTest.story";
import { DisabledTest as _DisabledTest } from "./DisabledTest.story";
import { LabelTest as _LabelTest } from "./LabelTest.story";
import { LabelTypeTest as _LabelTypeTest } from "./LabelTypeTest.story";
import { InputBaseWithUrlMask as _InputBaseWithUrlMask } from "./InputBaseWithUrlMask.story";
import { InputBaseWithUrlMaskPositive as _InputBaseWithUrlMaskPositive } from "./InputBaseWithUrlMaskPositive.story";
import { InputBaseWithUrlMaskInfo as _InputBaseWithUrlMaskInfo } from "./InputBaseWithUrlMaskInfo.story";
import { AutoFocusTest as _AutoFocusTest } from "./AutoFocusTest.story";
import { TestReplacementsProp as _TestReplacementsProp } from "./TestReplacementsProp.story";
import { TestThemeProp as _TestThemeProp } from "./TestThemeProp.story";
import { TestThemePropForSelect as _TestThemePropForSelect } from "./TestThemePropForSelect.story";
import { OnInputTest as _OnInputTest } from "./OnInputTest.story";
import { OnClickTest as _OnClickTest } from "./OnClickTest.story";
import { OnChangeTest as _OnChangeTest } from "./OnChangeTest.story";
import { OnStepUpNumericClickTest as _OnStepUpNumericClickTest } from "./OnStepUpNumericClickTest.story";
import { OnStepDownNumericClickTest as _OnStepDownNumericClickTest } from "./OnStepDownNumericClickTest.story";
import { HelperLinkTest as _HelperLinkTest } from "./HelperLinkTest.story";
import { InputBaseWithRedux as _InputBaseWithRedux } from "./InputBaseWithRedux.story";
import { WithTheme as _WithTheme } from "./WithTheme.story";
import { XSS as _XSS } from "./XSS.story";
import { HighlightWordsTest as _HighlightWordsTest } from "./HighlightWordsTest.story";
import { HighlightLengthExceededTest as _HighlightLengthExceededTest } from "./HighlightLengthExceededTest.story";
import { HighlightUrlTest as _HighlightUrlTest } from "./HighlightUrlTest.story";

// Decorate stories with provided settings
export default {
  ...SbDecorator({
    title: "Vanguard/InputBase",
    component: InputBase,
    extra: INPUT_BASE_STORY_CONTROLS,
    opts: {
      withRedux: true,
      customStore: inputBaseStore,
    },
  }),
};

// Export stories using object spread pattern
export const IdTest = { ..._IdTest };
export const ClassNameTest = { ..._ClassNameTest };
export const TextTypeTest = { ..._TextTypeTest };
export const NumberTypeTest = { ..._NumberTypeTest };
export const NumberTypeInteractionTest = { ..._NumberTypeInteractionTest };
export const PasswordTypeTest = { ..._PasswordTypeTest };
export const PasswordTypeInteractionTest = { ..._PasswordTypeInteractionTest };
export const RoundedNumericCTATypeTest = { ..._RoundedNumericCTATypeTest };
export const ValueTest = { ..._ValueTest };
export const DefaultValueTest = { ..._DefaultValueTest };
export const ValueAsDefaultValueTest = { ..._ValueAsDefaultValueTest };
export const PlaceholderTest = { ..._PlaceholderTest };
export const DisabledTest = { ..._DisabledTest };
export const LabelTest = { ..._LabelTest };
export const LabelTypeTest = { ..._LabelTypeTest };
export const InputBaseWithUrlMask = { ..._InputBaseWithUrlMask };
export const InputBaseWithUrlMaskPositive = { ..._InputBaseWithUrlMaskPositive };
export const InputBaseWithUrlMaskInfo = { ..._InputBaseWithUrlMaskInfo };
export const AutoFocusTest = { ..._AutoFocusTest };
export const TestReplacementsProp = { ..._TestReplacementsProp };
export const TestThemeProp = { ..._TestThemeProp };
export const TestThemePropForSelect = { ..._TestThemePropForSelect };
export const OnInputTest = { ..._OnInputTest };
export const OnClickTest = { ..._OnClickTest };
export const OnChangeTest = { ..._OnChangeTest };
export const OnStepUpNumericClickTest = { ..._OnStepUpNumericClickTest };
export const OnStepDownNumericClickTest = { ..._OnStepDownNumericClickTest };
export const HelperLinkTest = { ..._HelperLinkTest };
export const InputBaseWithRedux = { ..._InputBaseWithRedux };
export const WithTheme = { ..._WithTheme };

export const XSS = { ..._XSS };

export const HighlightWordsTest = { ..._HighlightWordsTest };
export const HighlightLengthExceededTest = { ..._HighlightLengthExceededTest };
export const HighlightUrlTest = { ..._HighlightUrlTest };

// TODO: The following stories still need to be extracted to individual files:
// - InputBaseWithReduxDefaultValue
// - InputBaseWithReduxValidation  
// - InputBaseFormClearAndUpdate
// - InputBaseFormStateSynchronization
// - InputBaseFormRapidStateChanges
// - InputBaseFormSpecialCharacters
// - InputBaseFormWhitespaceHandling
// - InputBaseFormEventIntegration
// - InputBaseFormSubmissionTest
// - InputBaseFormAccessibilityTest
// - InputBaseFormPerformanceTest