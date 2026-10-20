import { disableControls, SbDecorator } from "@test-utils/get-storybook-decorator";
import { Button } from "@vanguard/Button/Button";
import { buttonArgTypes, BUTTONS_EXCLUDED_CONTROLS_DEFAULT, ButtonStory } from "./stories/_Button.default";

// Import all individual stories
import { ButtonTypePrimary as _ButtonTypePrimary } from "./stories/ButtonTypePrimary.story";
import { ButtonTypeDefault as _ButtonTypeDefault } from "./stories/ButtonTypeDefault.story";
import {
  ButtonDefaultTextColor as _ButtonDefaultTextColor,
  ButtonDefaultTransparentPreview as _ButtonDefaultTransparentPreview,
} from "./stories/ButtonDefaultTextColor.story";
import { ButtonTypeSecondary as _ButtonTypeSecondary } from "./stories/ButtonTypeSecondary.story";
import { ButtonTypeShimmer as _ButtonTypeShimmer } from "./stories/ButtonTypeShimmer.story";
import { ButtonShimmerShowcase as _ButtonShimmerShowcase } from "./stories/ButtonShimmerShowcase.story";
import {
  ButtonTypeInverted as _ButtonTypeInverted,
  ButtonTypeInvertedDarkTheme as _ButtonTypeInvertedDarkTheme,
} from "./stories/ButtonTypeInverted.story";
import { ButtonTypeMutedOnDark as _ButtonTypeMutedOnDark } from "./stories/ButtonTypeMutedOnDark.story";
import { ButtonTypeMutedInvertedOnDark as _ButtonTypeMutedInvertedOnDark } from "./stories/ButtonTypeMutedInvertedOnDark.story";
import { ButtonMutedSurfaceMatrix as _ButtonMutedSurfaceMatrix } from "./stories/ButtonMutedSurfaceMatrix.story";
import { ButtonMutedStates as _ButtonMutedStates } from "./stories/ButtonMutedStates.story";
import { ButtonFocusStates as _ButtonFocusStates } from "./stories/ButtonFocusStates.story";
import { ButtonMutedSizes as _ButtonMutedSizes } from "./stories/ButtonMutedSizes.story";
import { ButtonMutedRounded as _ButtonMutedRounded } from "./stories/ButtonMutedRounded.story";
import { ButtonMutedBlurredCombos as _ButtonMutedBlurredCombos } from "./stories/ButtonMutedBlurredCombos.story";
import { ButtonMutedBlendEdgeCases as _ButtonMutedBlendEdgeCases } from "./stories/ButtonMutedBlendEdgeCases.story";
import { ButtonMutedDarkTheme as _ButtonMutedDarkTheme } from "./stories/ButtonMutedDarkTheme.story";
import { ButtonTypeMuted as _ButtonTypeMuted } from "./stories/ButtonTypeMuted.story";
import { ButtonTypeMutedInverted as _ButtonTypeMutedInverted } from "./stories/ButtonTypeMutedInverted.story";
import { ButtonTypeMutedBlurred as _ButtonTypeMutedBlurred } from "./stories/ButtonTypeMutedBlurred.story";
import { ButtonSecondaryToMuted as _ButtonSecondaryToMuted } from "./stories/ButtonSecondaryToMuted.story";
import { ButtonDisabled as _ButtonDisabled } from "./stories/ButtonDisabled.story";
import { ButtonDebounce as _ButtonDebounce } from "./stories/ButtonDebounce.story";
import { ButtonW100 as _ButtonW100 } from "./stories/ButtonW100.story";
import { ButtonRounded as _ButtonRounded } from "./stories/ButtonRounded.story";
import { ButtonWithIcon as _ButtonWithIcon } from "./stories/ButtonWithIcon.story";
import { ButtonIconOnly as _ButtonIconOnly } from "./stories/ButtonIconOnly.story";
import { ButtonSize as _ButtonSize } from "./stories/ButtonSize.story";
import { ButtonSizeMatrix as _ButtonSizeMatrix } from "./stories/ButtonSizeMatrix.story";
import { ButtonHoverState as _ButtonHoverState } from "./stories/ButtonHoverState.story";
import { ButtonUppercase as _ButtonUppercase } from "./stories/ButtonUppercase.story";
import { ButtonTextWrapNoWrap as _ButtonTextWrapNoWrap } from "./stories/ButtonTextWrapNoWrap.story";
import {
  ButtonTextWrap as _ButtonTextWrap,
  ButtonTextWrapWithIcon as _ButtonTextWrapWithIcon,
  ButtonTextWrapShortLabelUnchanged as _ButtonTextWrapShortLabelUnchanged,
} from "./stories/ButtonTextWrap.story";
import { ButtonIconHasCircle as _ButtonIconHasCircle } from "./stories/ButtonIconHasCircle.story";
import { ButtonWithReplacements as _ButtonWithReplacements } from "./stories/ButtonWithReplacements.story";
import { ButtonNoTranslate as _ButtonNoTranslate } from "./stories/ButtonNoTranslate.story";
import { ButtonOnMouseDown as _ButtonOnMouseDown } from "./stories/ButtonOnMouseDown.story";
import { ButtonDeprecatedProps as _ButtonDeprecatedProps } from "./stories/ButtonDeprecatedProps.story";
import { ButtonTextAlignedCenter as _ButtonTextAlignedCenter } from "./stories/ButtonTextAlignedCenter.story";
import { ButtonTruncate as _ButtonTruncate } from "./stories/ButtonTruncate.story";

export const ButtonTypePrimary: ButtonStory = { ..._ButtonTypePrimary }
export const ButtonTypeDefault: ButtonStory = { ..._ButtonTypeDefault }
export const ButtonDefaultTextColor: ButtonStory = { ..._ButtonDefaultTextColor }
export const ButtonDefaultTransparentPreview: ButtonStory = { ..._ButtonDefaultTransparentPreview }
export const ButtonTypeSecondary: ButtonStory = { ..._ButtonTypeSecondary }
export const ButtonTypeShimmer: ButtonStory = { ..._ButtonTypeShimmer }
export const ButtonShimmerShowcase: ButtonStory = { ..._ButtonShimmerShowcase }
export const ButtonTypeInverted: ButtonStory = { ..._ButtonTypeInverted }
export const ButtonTypeInvertedDarkTheme: ButtonStory = { ..._ButtonTypeInvertedDarkTheme }
export const ButtonTypeMutedOnDark: ButtonStory = { ..._ButtonTypeMutedOnDark }
export const ButtonTypeMutedInvertedOnDark: ButtonStory = { ..._ButtonTypeMutedInvertedOnDark }
export const ButtonMutedSurfaceMatrix: ButtonStory = { ..._ButtonMutedSurfaceMatrix }
export const ButtonMutedStates: ButtonStory = { ..._ButtonMutedStates }
export const ButtonFocusStates: ButtonStory = { ..._ButtonFocusStates }
export const ButtonMutedSizes: ButtonStory = { ..._ButtonMutedSizes }
export const ButtonMutedRounded: ButtonStory = { ..._ButtonMutedRounded }
export const ButtonMutedBlurredCombos: ButtonStory = { ..._ButtonMutedBlurredCombos }
export const ButtonMutedBlendEdgeCases: ButtonStory = { ..._ButtonMutedBlendEdgeCases }
export const ButtonMutedDarkTheme: ButtonStory = { ..._ButtonMutedDarkTheme }
export const ButtonTypeMuted: ButtonStory = { ..._ButtonTypeMuted }
export const ButtonTypeMutedInverted: ButtonStory = { ..._ButtonTypeMutedInverted }
export const ButtonTypeMutedBlurred: ButtonStory = { ..._ButtonTypeMutedBlurred }
export const ButtonSecondaryToMuted: ButtonStory = { ..._ButtonSecondaryToMuted }
export const ButtonDisabled: ButtonStory = { ..._ButtonDisabled }
export const ButtonDebounce: ButtonStory = { ..._ButtonDebounce }
export const ButtonW100: ButtonStory = { ..._ButtonW100 }
export const ButtonRounded: ButtonStory = { ..._ButtonRounded }
export const ButtonWithIcon: ButtonStory = { ..._ButtonWithIcon }
export const ButtonIconOnly: ButtonStory = { ..._ButtonIconOnly }
export const ButtonSize: ButtonStory = { ..._ButtonSize }
export const ButtonSizeMatrix: ButtonStory = { ..._ButtonSizeMatrix }
export const ButtonHoverState: ButtonStory = { ..._ButtonHoverState }
export const ButtonUppercase: ButtonStory = { ..._ButtonUppercase }
export const ButtonTextWrapNoWrap: ButtonStory = { ..._ButtonTextWrapNoWrap }
export const ButtonTextWrap: ButtonStory = { ..._ButtonTextWrap }
export const ButtonTextWrapWithIcon: ButtonStory = { ..._ButtonTextWrapWithIcon }
export const ButtonTextWrapShortLabelUnchanged: ButtonStory = { ..._ButtonTextWrapShortLabelUnchanged }
export const ButtonIconHasCircle: ButtonStory = { ..._ButtonIconHasCircle }
export const ButtonWithReplacements: ButtonStory = { ..._ButtonWithReplacements }
export const ButtonNoTranslate: ButtonStory = { ..._ButtonNoTranslate }
export const ButtonOnMouseDown: ButtonStory = { ..._ButtonOnMouseDown }
export const ButtonDeprecatedProps: ButtonStory = { ..._ButtonDeprecatedProps }
export const ButtonTextAlignedCenter: ButtonStory = { ..._ButtonTextAlignedCenter }
export const ButtonTruncate: ButtonStory = { ..._ButtonTruncate }

export default {
  ...SbDecorator({
    title: "Vanguard/Button",
    component: Button,
    extra: {
      argTypes: {
        ...disableControls(BUTTONS_EXCLUDED_CONTROLS_DEFAULT),
        ...buttonArgTypes,
      },
    },
  }),
};