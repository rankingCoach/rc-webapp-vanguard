import { SbDecorator } from "@test-utils/get-storybook-decorator.tsx";
import { Icon } from "@vanguard/Icon/Icon";
import { Story } from "./stories/_Icon.default";
import { Default as _Default } from "./stories/Default.story";
import { WithColor as _WithColor } from "./stories/WithColor.story";
import { WithHoverColor as _WithHoverColor } from "./stories/WithHoverColor.story";
import { WithCircle as _WithCircle } from "./stories/WithCircle.story";
import { WithSpin as _WithSpin } from "./stories/WithSpin.story";
import { WithFill as _WithFill } from "./stories/WithFill.story";
import { WithClassName as _WithClassName } from "./stories/WithClassName.story";
import { WithSvgClassName as _WithSvgClassName } from "./stories/WithSvgClassName.story";
import { WithCircleSize as _WithCircleSize } from "./stories/WithCircleSize.story";
import { WithStyle as _WithStyle } from "./stories/WithStyle.story";
import { WithOnClick as _WithOnClick } from "./stories/WithOnClick.story";
import { WithTestId as _WithTestId } from "./stories/WithTestId.story";
import { WithForceSize as _WithForceSize } from "./stories/WithForceSize.story";
import { WithFillOpacity as _WithFillOpacity } from "./stories/WithFillOpacity.story";
import { WithFillOpacityRgba as _WithFillOpacityRgba } from "./stories/WithFillOpacityRgba.story";
import { WithFillOpacityCssVar as _WithFillOpacityCssVar } from "./stories/WithFillOpacityCssVar.story";
import { WithOnMouseEnter as _WithOnMouseEnter } from "./stories/WithOnMouseEnter.story";
import { WithOnMouseLeave as _WithOnMouseLeave } from "./stories/WithOnMouseLeave.story";
import { WithRole as _WithRole } from "./stories/WithRole.story";
import { WithSizeLarge as _WithSizeLarge } from "./stories/WithSizeLarge.story";
import { FileManagerIcons as _FileManagerIcons } from "./stories/FileManagerIcons.story";

export const Default: Story = { ..._Default };
export const WithColor: Story = { ..._WithColor };
export const WithHoverColor: Story = { ..._WithHoverColor };
export const WithCircle: Story = { ..._WithCircle };
export const WithSpin: Story = { ..._WithSpin };
export const WithFill: Story = { ..._WithFill };
export const WithClassName: Story = { ..._WithClassName };
export const WithSvgClassName: Story = { ..._WithSvgClassName };
export const WithCircleSize: Story = { ..._WithCircleSize };
export const WithStyle: Story = { ..._WithStyle };
export const WithOnClick: Story = { ..._WithOnClick };
export const WithTestId: Story = { ..._WithTestId };
export const WithForceSize: Story = { ..._WithForceSize };
export const WithFillOpacity: Story = { ..._WithFillOpacity };
export const WithFillOpacityRgba: Story = { ..._WithFillOpacityRgba };
export const WithFillOpacityCssVar: Story = { ..._WithFillOpacityCssVar };
export const WithOnMouseEnter: Story = { ..._WithOnMouseEnter };
export const WithOnMouseLeave: Story = { ..._WithOnMouseLeave };
export const WithRole: Story = { ..._WithRole };
export const WithSizeLarge: Story = { ..._WithSizeLarge };

export default {
  ...SbDecorator({
    title: "Vanguard/Icon",
    component: Icon,
  }),
};
export const FileManagerIcons: Story = { ..._FileManagerIcons };
