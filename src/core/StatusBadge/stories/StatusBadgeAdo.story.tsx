import React from "react";
import { expect, waitFor, within } from "storybook/test";
import { StatusBadge } from "../StatusBadge";
import iconStyles from "../StatusBadgeIcon/StatusBadgeIcon.module.scss";
import { Story } from "./_StatusBadge.default";

// Computes a CSS colour the way the browser paints it, so it can be compared with getComputedStyle()
const resolveColor = (host: HTMLElement, value: string) => {
  const probe = document.createElement("span");
  probe.style.color = value;
  host.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved;
};

// The 'ado' status: a 12% Ado fill, the Ado text colour, and an icon circle in --ado-base
export const StatusBadgeAdo: Story = {
  args: {
    status: "ado",
    hideIcon: true,
    text: "New",
    translate: false,
  },

  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div data-testid="ado-no-icon">
        <StatusBadge {...args} />
      </div>
      <div data-testid="ado-icon">
        <StatusBadge {...args} hideIcon={false} />
      </div>
    </div>
  ),

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fill = resolveColor(canvasElement, "color-mix(in srgb, var(--ado-base) 12%, transparent)");
    const text = resolveColor(canvasElement, "var(--ado-text, var(--ado-base))");
    const base = resolveColor(canvasElement, "var(--ado-base)");

    for (const testId of ["ado-no-icon", "ado-icon"]) {
      const wrapper = canvas.getByTestId(testId);
      const label = within(wrapper).getByText("New");
      const badge = label.parentElement as HTMLElement;

      await waitFor(() => {
        expect(getComputedStyle(badge).backgroundColor, `${testId} fill`).toBe(fill);
        expect(getComputedStyle(label).color, `${testId} text`).toBe(text);
      });
    }

    await waitFor(() => {
      const icon = canvas.getByTestId("ado-icon").querySelector(`.${iconStyles.statusBadgeIcon}`) as HTMLElement;
      expect(icon, "icon rendered").toBeTruthy();
      expect(getComputedStyle(icon).backgroundColor, "icon circle").toBe(base);
    });
  },
};
