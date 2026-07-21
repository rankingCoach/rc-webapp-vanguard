import { Story } from "./_Textarea.default";
import { testTextareaExpectMaskBackgroundColor } from "@vanguard/Textarea/stories/helpers/test-textarea-expect-mask-background-color";

export const TextareaWithUrlMaskInfo: Story = {
  args: {
    placeholder: "Test placeholder",
    highlightUrl: true,
    value: "Test www.google.ro",
    valueAsDefaultValue: true,
    highlightUrlType: "info",
  },
  play: async ({ canvasElement }) => {
    await testTextareaExpectMaskBackgroundColor(canvasElement, "--i100", "www.google.ro");
  },
};
