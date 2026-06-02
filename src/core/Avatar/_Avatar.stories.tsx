import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { Avatar } from "./Avatar";
import { Story } from "./stories/_Avatar.default";
import { Default as _Default } from "./stories/Default.story";
import { WithImage as _WithImage } from "./stories/WithImage.story";
import { WithIcon as _WithIcon } from "./stories/WithIcon.story";
import { WithIconGrayScale as _WithIconGrayScale } from "./stories/WithIconGrayScale.story";
import { WithName as _WithName } from "./stories/WithName.story";
import { WithNotifications as _WithNotifications } from "./stories/WithNotifications.story";
import { WithBgColor as _WithBgColor } from "./stories/WithBgColor.story";
import { WithTranslate as _WithTranslate } from "./stories/WithTranslate.story";
import { SizesAndVariations as _SizesAndVariations } from "./stories/SizesAndVariations.story";
import { WithUserIcon as _WithUserIcon } from "./stories/WithUserIcon.story";
import { WithIconThenImage as _WithIconThenImage } from "./stories/WithIconThenImage.story";

export const Default: Story = { ..._Default };
export const WithImage: Story = { ..._WithImage };
export const WithIcon: Story = { ..._WithIcon };
export const WithIconGrayScale: Story = { ..._WithIconGrayScale };
export const WithName: Story = { ..._WithName };
export const WithNotifications: Story = { ..._WithNotifications };
export const WithBgColor: Story = { ..._WithBgColor };
export const WithTranslate: Story = { ..._WithTranslate };
export const SizesAndVariations: Story = { ..._SizesAndVariations };
export const WithUserIcon: Story = { ..._WithUserIcon };
export const WithIconThenImage: Story = { ..._WithIconThenImage };

export default {
  ...SbDecorator({
    title: "Vanguard/Avatar",
    component: Avatar,
  }),
};
