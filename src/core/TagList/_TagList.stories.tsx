import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { TagList } from "./TagList";
import { Story } from "./stories/_TagList.default";
import { Default as _Default } from "./stories/Default.story";
import { ChipVariant as _ChipVariant } from "./stories/ChipVariant.story";
import { ChipFilledVariant as _ChipFilledVariant } from "./stories/ChipFilledVariant.story";
import { WithDeleteButtons as _WithDeleteButtons } from "./stories/WithDeleteButtons.story";
import { DifferentTypes as _DifferentTypes } from "./stories/DifferentTypes.story";
import { WithPopoverMessages as _WithPopoverMessages } from "./stories/WithPopoverMessages.story";
import { ActiveTags as _ActiveTags } from "./stories/ActiveTags.story";
import { EmptyTagList as _EmptyTagList } from "./stories/EmptyTagList.story";
import { InteractiveDemo as _InteractiveDemo } from "./stories/InteractiveDemo.story";

export default {
  ...SbDecorator({
    title: "Vanguard/TagList",
    component: TagList,
  }),
};

export const Default: Story = { ..._Default };
export const ChipVariant: Story = { ..._ChipVariant };
export const ChipFilledVariant: Story = { ..._ChipFilledVariant };
export const WithDeleteButtons: Story = { ..._WithDeleteButtons };
export const DifferentTypes: Story = { ..._DifferentTypes };
export const WithPopoverMessages: Story = { ..._WithPopoverMessages };
export const ActiveTags: Story = { ..._ActiveTags };
export const EmptyTagList: Story = { ..._EmptyTagList };
export const InteractiveDemo: Story = { ..._InteractiveDemo };