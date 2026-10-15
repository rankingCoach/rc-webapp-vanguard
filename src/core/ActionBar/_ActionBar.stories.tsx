import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { ActionBar } from "./ActionBar";
import { Story } from "./stories/_ActionBar.default";
import { Default as _Default } from "./stories/Default.story";
import { MessageTemplate as _MessageTemplate } from "./stories/MessageTemplate.story";
import { FooterTemplate as _FooterTemplate } from "./stories/FooterTemplate.story";
import { Hidden as _Hidden } from "./stories/Hidden.story";
import { MessageInfo as _MessageInfo } from "./stories/MessageInfo.story";
import { MessageSuccess as _MessageSuccess } from "./stories/MessageSuccess.story";
import { MessageError as _MessageError } from "./stories/MessageError.story";
import { MessageWithTitle as _MessageWithTitle } from "./stories/MessageWithTitle.story";
import { MessageWithButton as _MessageWithButton } from "./stories/MessageWithButton.story";
import { FooterSingleButton as _FooterSingleButton } from "./stories/FooterSingleButton.story";
import { FooterMultipleButtons as _FooterMultipleButtons } from "./stories/FooterMultipleButtons.story";
import { FooterButtonHeights as _FooterButtonHeights } from "./stories/FooterButtonHeights.story";
import { ServiceUseCase as _ServiceUseCase } from "./stories/ServiceUseCase.story";

export const Default: Story = { ..._Default };
export const MessageTemplate: Story = { ..._MessageTemplate };
export const FooterTemplate: Story = { ..._FooterTemplate };
export const Hidden: Story = { ..._Hidden };
export const MessageInfo: Story = { ..._MessageInfo };
export const MessageSuccess: Story = { ..._MessageSuccess };
export const MessageError: Story = { ..._MessageError };
export const MessageWithTitle: Story = { ..._MessageWithTitle };
export const MessageWithButton: Story = { ..._MessageWithButton };
export const FooterSingleButton: Story = { ..._FooterSingleButton };
export const FooterMultipleButtons: Story = { ..._FooterMultipleButtons };
export const FooterButtonHeights: Story = { ..._FooterButtonHeights };
export const ServiceUseCase: Story = { ..._ServiceUseCase };

export default {
  ...SbDecorator({
    title: "Vanguard/ActionBar",
    component: ActionBar,
    extra: {
      args: {
        show: true,
        templateProps: {
          template: "message",
          description: "This is a test message",
          type: "info",
        },
      },
    },
  }),
};