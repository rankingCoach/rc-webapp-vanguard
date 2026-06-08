import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { Button } from "@vanguard/Button/Button";
import { Story } from "./stories/_ModalService.default";
import { OpenConfirmModal as _OpenConfirmModal } from "./stories/OpenConfirmModal.story";
import { OpenConfirmModalObject as _OpenConfirmModalObject } from "./stories/OpenConfirmModalObject.story";
import { OpenAcceptModal as _OpenAcceptModal } from "./stories/OpenAcceptModal.story";
import { OpenAcceptModalObject as _OpenAcceptModalObject } from "./stories/OpenAcceptModalObject.story";
import { OpenLoadingModal as _OpenLoadingModal } from "./stories/OpenLoadingModal.story";
import { OpenLoadingModalObject as _OpenLoadingModalObject } from "./stories/OpenLoadingModalObject.story";
import { CloseConfirmModalViaHeader as _CloseConfirmModalViaHeader } from "./stories/CloseConfirmModalViaHeader.story";

export const OpenConfirmModal: Story = { ..._OpenConfirmModal };
export const OpenConfirmModalObject: Story = { ..._OpenConfirmModalObject };
export const OpenAcceptModal: Story = { ..._OpenAcceptModal };
export const OpenAcceptModalObject: Story = { ..._OpenAcceptModalObject };
export const OpenLoadingModal: Story = { ..._OpenLoadingModal };
export const OpenLoadingModalObject: Story = { ..._OpenLoadingModalObject };
export const CloseConfirmModalViaHeader: Story = { ..._CloseConfirmModalViaHeader };

export default {
  ...SbDecorator({
    title: "Vanguard/ModalService",
    component: Button,
    opts: {},
  }),
};