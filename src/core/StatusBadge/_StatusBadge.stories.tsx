import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { StatusBadge } from "./StatusBadge";
import { Story } from "./stories/_StatusBadge.default";
import { StatusBadgeInfo as _StatusBadgeInfo } from "./stories/StatusBadgeInfo.story";
import { StatusBadgeNeutral as _StatusBadgeNeutral } from "./stories/StatusBadgeNeutral.story";
import { StatusBadgeRectangle as _StatusBadgeRectangle } from "./stories/StatusBadgeRectangle.story";
import { StatusBadgeAdo as _StatusBadgeAdo } from "./stories/StatusBadgeAdo.story";
import { StatusBadgeAdoReverse as _StatusBadgeAdoReverse } from "./stories/StatusBadgeAdoReverse.story";
import { StatusBadgeAll as _StatusBadgeAll } from "./stories/StatusBadgeAll.story";
import { StatusBadgeCompact as _StatusBadgeCompact } from "./stories/StatusBadgeCompact.story";
import { StatusBadgeAllInverted as _StatusBadgeAllInverted } from "./stories/StatusBadgeAllInverted.story";
import { WithArrowIcons as _WithArrowIcons } from "./stories/WithArrowIcons.story";

export default {
  ...SbDecorator({
    title: "Vanguard/StatusBadge",
    component: StatusBadge,
    extra: {
      argTypes: {
        status: {
          defaultValue: "danger",
        },
        text: {
          defaultValue: "Not listed",
        },
        numberValue: {
          defaultValue: 5,
        },
        icon: {
          defaultValue: "close",
        },
        variant: {
          defaultValue: "big",
        },
      },
    },
  }),
};

export const StatusBadgeInfo: Story = { ..._StatusBadgeInfo };
export const StatusBadgeNeutral: Story = { ..._StatusBadgeNeutral };
export const StatusBadgeRectangle: Story = { ..._StatusBadgeRectangle };
export const StatusBadgeAdo: Story = { ..._StatusBadgeAdo };
export const StatusBadgeAdoReverse: Story = { ..._StatusBadgeAdoReverse };
export const StatusBadgeAll: Story = { ..._StatusBadgeAll };
export const StatusBadgeAllInverted: Story = { ..._StatusBadgeAllInverted };
export const StatusBadgeCompact: Story = { ..._StatusBadgeCompact };
export const WithArrowIcons: Story = { ..._WithArrowIcons };
