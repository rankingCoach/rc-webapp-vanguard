import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { Gallery } from "./Gallery";
import { Story } from "./stories/_Gallery.default";
import { Default as _Default } from "./stories/Default.story";
import { ExposesThePickedFile as _ExposesThePickedFile } from "./stories/ExposesThePickedFile.story";

export default {
  ...SbDecorator({
    title: "Vanguard/Gallery",
    component: Gallery,
  }),
};

export const Default: Story = { ..._Default };
export const ExposesThePickedFile: Story = { ..._ExposesThePickedFile };