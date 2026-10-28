import { expect, within } from "storybook/test";
import { ButtonTypes } from "@vanguard/Button/Button";
import { Story, selectors } from "./_ActionBar.default";

/**
 * Buttons in the ActionBar footer share one height whatever their type: buttons without an explicit size get the
 * row size (`extraLarge`), 48px on desktop and 40px on mobile.
 */
export const FooterButtonHeights: Story = {
  args: {
    show: true,
    templateProps: {
      template: "footer",
      buttons: [
        { text: "Back", onClick: () => {} },
        { text: "Skip", onClick: () => {}, props: { type: ButtonTypes.muted } },
        { text: "Save draft", onClick: () => {}, props: { type: ButtonTypes.default } },
        { text: "Publish", onClick: () => {} },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId(selectors.container);
    const heights = within(container)
      .getAllByRole("button")
      .map((button) => Math.round(button.getBoundingClientRect().height));

    // Row height for the current breakpoint (mobile is 767px and below)
    const expectedHeight = window.innerWidth > 767 ? 48 : 40;
    await expect(heights).toEqual([expectedHeight, expectedHeight, expectedHeight, expectedHeight]);
  },
};
