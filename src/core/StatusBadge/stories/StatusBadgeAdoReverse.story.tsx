import React from "react";
import { expect, waitFor, within } from "storybook/test";
import { StatusBadge } from "../StatusBadge";
import { StatusBadgeIcon } from "../StatusBadgeIcon/StatusBadgeIcon";
import { Story } from "./_StatusBadge.default";

const TRANSPARENT = ["", "transparent", "rgba(0, 0, 0, 0)"];

// Reversed Ado: the standalone icon resolves its own fill variable, and the big badge keeps its glow
export const StatusBadgeAdoReverse: Story = {
  args: {
    status: "ado",
    variant: "big",
    iconVariant: "reverse",
    text: "New",
    translate: false,
  },

  render: (args) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 40 }}>
      <div data-testid="ado-standalone-icon">
        <StatusBadgeIcon status="ado" hasIconReverse />
      </div>
      <div data-testid="ado-standalone-big-icon">
        <StatusBadgeIcon status="ado" variant="big" hasIconReverse />
      </div>
      <div data-testid="ado-big-reverse">
        <StatusBadge {...args} />
      </div>
    </div>
  ),

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const testId of ["ado-standalone-icon", "ado-standalone-big-icon"]) {
      await waitFor(() => {
        const icon = canvas.getByTestId(testId).firstElementChild as HTMLElement;
        expect(icon, `${testId} rendered`).toBeTruthy();
        const { backgroundColor, borderTopColor } = getComputedStyle(icon);
        expect(TRANSPARENT, `${testId} background`).not.toContain(backgroundColor);
        expect(TRANSPARENT, `${testId} border`).not.toContain(borderTopColor);
      });
    }

    const glow = canvas.getByTestId("ado-big-reverse").querySelector("[style*='box-shadow']") as HTMLElement;
    expect(getComputedStyle(glow).boxShadow).not.toBe("none");
  },
};
