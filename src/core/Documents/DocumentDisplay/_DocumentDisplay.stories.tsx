import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { baseStore } from "@stores/redux-base.store";
import { DocumentDisplay } from "./DocumentDisplay";
import { Story } from "./stories/_DocumentDisplay.default";
import { Default as _Default } from "./stories/Default.story";
import { WithImage as _WithImage } from "./stories/WithImage.story";
import { WithoutDownload as _WithoutDownload } from "./stories/WithoutDownload.story";
import { CustomDimensions as _CustomDimensions } from "./stories/CustomDimensions.story";

export const Default: Story = { ..._Default };
export const WithImage: Story = { ..._WithImage };
export const WithoutDownload: Story = { ..._WithoutDownload };
export const CustomDimensions: Story = { ..._CustomDimensions };

export default {
  ...SbDecorator({
    title: "Vanguard/Documents/DocumentDisplay",
    component: DocumentDisplay,
    opts: {
      customStore: baseStore,
    },
  }),
};