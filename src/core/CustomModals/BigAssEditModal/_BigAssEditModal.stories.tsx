import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { BigAssEditModal } from "./BigAssEditModal";
import { Story } from "./stories/_BigAssEditModal.default";
import { Default as _Default } from "./stories/Default.story";
import { SavingState as _SavingState } from "./stories/SavingState.story";
import { NotSavable as _NotSavable } from "./stories/NotSavable.story";
import { CloseOnSaveDisabled as _CloseOnSaveDisabled } from "./stories/CloseOnSaveDisabled.story";
import { WithCustomContent as _WithCustomContent } from "./stories/WithCustomContent.story";
import { CancelFlow as _CancelFlow } from "./stories/CancelFlow.story";
import { WithTestId as _WithTestId } from "./stories/WithTestId.story";
import { WithBodyClassName as _WithBodyClassName } from "./stories/WithBodyClassName.story";
import { CompactMode as _CompactMode, CompactModeNotEnabled as _CompactModeNotEnabled } from "./stories/CompactMode.story";

export const Default: Story = { ..._Default };
export const SavingState: Story = { ..._SavingState };
export const NotSavable: Story = { ..._NotSavable };
export const CloseOnSaveDisabled: Story = { ..._CloseOnSaveDisabled };
export const WithCustomContent: Story = { ..._WithCustomContent };
export const CancelFlow: Story = { ..._CancelFlow };
export const WithTestId: Story = { ..._WithTestId };
export const WithBodyClassName: Story = { ..._WithBodyClassName };
export const CompactMode: Story = { ..._CompactMode };
export const CompactModeNotEnabled: Story = { ..._CompactModeNotEnabled };

export default {
  ...SbDecorator({
    title: "vanguard/BigAssEditModal",
    component: BigAssEditModal,
  }),
};
