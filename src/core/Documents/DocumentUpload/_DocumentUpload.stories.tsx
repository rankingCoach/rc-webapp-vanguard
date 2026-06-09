import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { baseStore } from "@stores/redux-base.store";
import { DocumentUpload } from "./DocumentUpload";
import { Story } from "./stories/_DocumentUpload.default";
import { Default as _Default } from "./stories/Default.story";
import { WithDocumentName as _WithDocumentName } from "./stories/WithDocumentName.story";
import { WithCustomDimensions as _WithCustomDimensions } from "./stories/WithCustomDimensions.story";

export const Default: Story = { ..._Default };
export const WithDocumentName: Story = { ..._WithDocumentName };
export const WithCustomDimensions: Story = { ..._WithCustomDimensions };

export default {
  ...SbDecorator({
    title: "Vanguard/Documents/DocumentUpload",
    component: DocumentUpload,
    opts: {
      customStore: baseStore,
    },
  }),
};