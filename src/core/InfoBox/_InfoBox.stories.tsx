import { SbDecorator } from "@test-utils/get-storybook-decorator.tsx";
import { InfoBox } from "./InfoBox";
import { Story } from "./stories/_InfoBox.default";
import { Default as _Default } from "./stories/Default.story";
import { WithTitle as _WithTitle } from "./stories/WithTitle.story";
import { Danger as _Danger } from "./stories/Danger.story";
import { Warn as _Warn } from "./stories/Warn.story";
import { Success as _Success } from "./stories/Success.story";
import { Info as _Info } from "./stories/Info.story";
import { Dismissible as _Dismissible } from "./stories/Dismissible.story";
import { WithPosition as _WithPosition } from "./stories/WithPosition.story";
import { WithMaxWidth as _WithMaxWidth } from "./stories/WithMaxWidth.story";
import { WithWidth as _WithWidth } from "./stories/WithWidth.story";
import { WithPositiveButton as _WithPositiveButton } from "./stories/WithPositiveButton.story";
import { WithNegativeButton as _WithNegativeButton } from "./stories/WithNegativeButton.story";
import { WithBorderRadius as _WithBorderRadius } from "./stories/WithBorderRadius.story";
import { WithLinks as _WithLinks } from "./stories/WithLinks.story";
import { WithReplacements as _WithReplacements } from "./stories/WithReplacements.story";
import { WithDescriptionArray as _WithDescriptionArray } from "./stories/WithDescriptionArray.story";
import { WithDescriptionReactNode as _WithDescriptionReactNode } from "./stories/WithDescriptionReactNode.story";
import { AllProps as _AllProps } from "./stories/AllProps.story";
import { AllCases as _AllCases } from "./stories/AllCases.story";

export const Default: Story = { ..._Default };
export const WithTitle: Story = { ..._WithTitle };
export const Danger: Story = { ..._Danger };
export const Warn: Story = { ..._Warn };
export const Success: Story = { ..._Success };
export const Info: Story = { ..._Info };
export const Dismissible: Story = { ..._Dismissible };
export const WithPosition: Story = { ..._WithPosition };
export const WithMaxWidth: Story = { ..._WithMaxWidth };
export const WithWidth: Story = { ..._WithWidth };
export const WithPositiveButton: Story = { ..._WithPositiveButton };
export const WithNegativeButton: Story = { ..._WithNegativeButton };
export const WithBorderRadius: Story = { ..._WithBorderRadius };
export const WithLinks: Story = { ..._WithLinks };
export const WithReplacements: Story = { ..._WithReplacements };
export const WithDescriptionArray: Story = { ..._WithDescriptionArray };
export const WithDescriptionReactNode: Story = { ..._WithDescriptionReactNode };
export const AllProps: Story = { ..._AllProps };
export const AllCases: Story = { ..._AllCases };

export default {
  ...SbDecorator({
    title: "Vanguard/InfoBox",
    component: InfoBox,
  }),
};