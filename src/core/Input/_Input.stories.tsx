import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { Input } from "@vanguard/Input/Input";
import { Story } from "./stories/_Input.default";

// Basic Input Stories
import { Default as _Default } from "./stories/Default.story";
import { WithLabel as _WithLabel } from "./stories/WithLabel.story";
import { WithPlaceholder as _WithPlaceholder } from "./stories/WithPlaceholder.story";
import { Disabled as _Disabled } from "./stories/Disabled.story";
import { Required as _Required } from "./stories/Required.story";
import { WithValue as _WithValue } from "./stories/WithValue.story";
import { WithTypeNumber as _WithTypeNumber } from "./stories/WithTypeNumber.story";
import { NumberInvalidChars as _NumberInvalidChars } from "./stories/NumberInvalidChars.story";
import { NumberPasteBlock as _NumberPasteBlock } from "./stories/NumberPasteBlock.story";
import { WithTypeEmail as _WithTypeEmail } from "./stories/WithTypeEmail.story";
import { WithTypePassword as _WithTypePassword } from "./stories/WithTypePassword.story";
import { WithTypeDate as _WithTypeDate } from "./stories/WithTypeDate.story";
import { WithCounter as _WithCounter } from "./stories/WithCounter.story";
import { WithInfoText as _WithInfoText } from "./stories/WithInfoText.story";
import { WithLabelTypes as _WithLabelTypes } from "./stories/WithLabelTypes.story";
import { WithHighlights as _WithHighlights } from "./stories/WithHighlights.story";
import { WithAdornments as _WithAdornments } from "./stories/WithAdornments.story";
import { WithEvents as _WithEvents } from "./stories/WithEvents.story";
import { WithLoading as _WithLoading } from "./stories/WithLoading.story";
import { WithReplacements as _WithReplacements } from "./stories/WithReplacements.story";
import { AllProps as _AllProps } from "./stories/AllProps.story";

// Validation Stories
import { RequiredValidation as _RequiredValidation } from "./stories/validation/stories/RequiredValidation.story";
import { MinLengthValidation as _MinLengthValidation } from "./stories/validation/stories/MinLengthValidation.story";
import { MaxLengthValidation as _MaxLengthValidation } from "./stories/validation/stories/MaxLengthValidation.story";
import { EmailValidation as _EmailValidation } from "./stories/validation/stories/EmailValidation.story";
import { PhoneValidation as _PhoneValidation } from "./stories/validation/stories/PhoneValidation.story";
import { PasswordValidation as _PasswordValidation } from "./stories/validation/stories/PasswordValidation.story";
import { NumberValidationGTE as _NumberValidationGTE } from "./stories/validation/stories/NumberValidationGTE.story";
import { NumberValidationLTE as _NumberValidationLTE } from "./stories/validation/stories/NumberValidationLTE.story";
import { SpecialCharsNotAllowed as _SpecialCharsNotAllowed } from "./stories/validation/stories/SpecialCharsNotAllowed.story";
import { URLNotAllowed as _URLNotAllowed } from "./stories/validation/stories/URLNotAllowed.story";
import { MultipleSpacesNotAllowed as _MultipleSpacesNotAllowed } from "./stories/validation/stories/MultipleSpacesNotAllowed.story";
import { RegexValidation as _RegexValidation } from "./stories/validation/stories/RegexValidation.story";
import { NumberValidationGT as _NumberValidationGT } from "./stories/validation/stories/NumberValidationGT.story";
import { NumberValidationLT as _NumberValidationLT } from "./stories/validation/stories/NumberValidationLT.story";

// Regex Pattern Validation Stories
import { CreditCardValidation as _CreditCardValidation } from "./stories/validation/stories/CreditCardValidation.story";
import { SSNValidation as _SSNValidation } from "./stories/validation/stories/SSNValidation.story";
import { ZipCodeValidation as _ZipCodeValidation } from "./stories/validation/stories/ZipCodeValidation.story";
import { IPAddressValidation as _IPAddressValidation } from "./stories/validation/stories/IPAddressValidation.story";
import { MACAddressValidation as _MACAddressValidation } from "./stories/validation/stories/MACAddressValidation.story";
import { HexColorValidation as _HexColorValidation } from "./stories/validation/stories/HexColorValidation.story";
import { UsernameValidation as _UsernameValidation } from "./stories/validation/stories/UsernameValidation.story";
import { PasswordStrengthValidation as _PasswordStrengthValidation } from "./stories/validation/stories/PasswordStrengthValidation.story";
import { SlugValidation as _SlugValidation } from "./stories/validation/stories/SlugValidation.story";

// Internationalization Validation Stories
import { UnicodeValidation as _UnicodeValidation } from "./stories/validation/stories/UnicodeValidation.story";
import { MultiByteCharacterCounting as _MultiByteCharacterCounting } from "./stories/validation/stories/MultiByteCharacterCounting.story";
import { RightToLeftLanguages as _RightToLeftLanguages } from "./stories/validation/stories/RightToLeftLanguages.story";
import { MixedScriptValidation as _MixedScriptValidation } from "./stories/validation/stories/MixedScriptValidation.story";
import { EmojiValidation as _EmojiValidation } from "./stories/validation/stories/EmojiValidation.story";
import { DiacriticsAndAccents as _DiacriticsAndAccents } from "./stories/validation/stories/DiacriticsAndAccents.story";

// Input Type Validation Stories
import { RangeValidation as _RangeValidation } from "./stories/validation/stories/RangeValidation.story";

import { SearchValidation as _SearchValidation } from "./stories/validation/stories/SearchValidation.story";
import { TelValidation as _TelValidation } from "./stories/validation/stories/TelValidation.story";
import { UrlValidation as _UrlValidation } from "./stories/validation/stories/UrlValidation.story";

// Basic Input Stories Exports
export const Default: Story = { ..._Default };
export const WithLabel: Story = { ..._WithLabel };
export const WithPlaceholder: Story = { ..._WithPlaceholder };
export const Disabled: Story = { ..._Disabled };
export const Required: Story = { ..._Required };
export const WithValue: Story = { ..._WithValue };
export const WithTypeNumber: Story = { ..._WithTypeNumber };
export const NumberInvalidChars: Story = { ..._NumberInvalidChars };
export const NumberPasteBlock: Story = { ..._NumberPasteBlock };
export const WithTypeEmail: Story = { ..._WithTypeEmail };
export const WithTypePassword: Story = { ..._WithTypePassword };
export const WithTypeDate: Story = { ..._WithTypeDate };
export const WithCounter: Story = { ..._WithCounter };
export const WithInfoText: Story = { ..._WithInfoText };
export const WithLabelTypes: Story = { ..._WithLabelTypes };
export const WithHighlights: Story = { ..._WithHighlights };
export const WithAdornments: Story = { ..._WithAdornments };
export const WithEvents: Story = { ..._WithEvents };
export const WithLoading: Story = { ..._WithLoading };
export const WithReplacements: Story = { ..._WithReplacements };
export const AllProps: Story = { ..._AllProps };

// Validation Stories Exports
export const RequiredValidation = { ..._RequiredValidation };
export const MinLengthValidation = { ..._MinLengthValidation };
export const MaxLengthValidation = { ..._MaxLengthValidation };
export const EmailValidation = { ..._EmailValidation };
export const PhoneValidation = { ..._PhoneValidation };
export const PasswordValidation = { ..._PasswordValidation };
export const NumberValidationGTE = { ..._NumberValidationGTE };
export const NumberValidationLTE = { ..._NumberValidationLTE };
export const SpecialCharsNotAllowed = { ..._SpecialCharsNotAllowed };
export const URLNotAllowed = { ..._URLNotAllowed };
export const MultipleSpacesNotAllowed = { ..._MultipleSpacesNotAllowed };
export const RegexValidation = { ..._RegexValidation };
export const NumberValidationGT = { ..._NumberValidationGT };
export const NumberValidationLT = { ..._NumberValidationLT };

// Regex Pattern Validation Exports
export const CreditCardValidation = { ..._CreditCardValidation };
export const SSNValidation = { ..._SSNValidation };
export const ZipCodeValidation = { ..._ZipCodeValidation };
export const IPAddressValidation = { ..._IPAddressValidation };
export const MACAddressValidation = { ..._MACAddressValidation };
export const HexColorValidation = { ..._HexColorValidation };
export const UsernameValidation = { ..._UsernameValidation };
export const PasswordStrengthValidation = { ..._PasswordStrengthValidation };
export const SlugValidation = { ..._SlugValidation };

// Internationalization Validation Exports
export const UnicodeValidation = { ..._UnicodeValidation };
export const MultiByteCharacterCounting = { ..._MultiByteCharacterCounting };
export const RightToLeftLanguages = { ..._RightToLeftLanguages };
export const MixedScriptValidation = { ..._MixedScriptValidation };
export const EmojiValidation = { ..._EmojiValidation };
export const DiacriticsAndAccents = { ..._DiacriticsAndAccents };

// Input Type Validation Exports
export const RangeValidation = { ..._RangeValidation };

export const SearchValidation = { ..._SearchValidation };
export const TelValidation = { ..._TelValidation };
export const UrlValidation = { ..._UrlValidation };

export default {
  ...SbDecorator({
    title: "Vanguard/Input",
    component: Input,
    extra: {
      args: {
        testId: "validation-input",
      },
    },
    opts: {
      withRedux: true,
    },
  }),
};

