import { Story } from "./_DateRangePicker.default";
import { within, userEvent, expect, waitFor } from "storybook/test";

/**
 * The picker sits against the right edge of the page. The opened calendar must stay inside the
 * viewport and show all seven weekday columns (it used to spill past the edge and clip Fri/Sat).
 */
export const RightEdgeTest: Story = {
  name: "Right Edge Test",
  args: {
    testId: "daterangepicker-right-edge-test",
  },
  decorators: [
    (StoryFn) => (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <StoryFn />
      </div>
    ),
  ],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const testId = args.testId ?? "";

    await userEvent.click(canvas.getByTestId(`${testId}-left-reference-container`));

    await waitFor(() => {
      const dropdown = document.querySelector<HTMLElement>(".date-range-picker-dropdown");
      expect(dropdown).not.toBeNull();
      const box = dropdown!.getBoundingClientRect();
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(document.documentElement.clientWidth);
      // Nothing hidden behind the dropdown's own scroll area.
      expect(dropdown!.scrollWidth).toBeLessThanOrEqual(dropdown!.clientWidth);
    });
  },
};
