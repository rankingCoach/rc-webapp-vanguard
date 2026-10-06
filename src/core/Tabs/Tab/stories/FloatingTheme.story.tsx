import React from "react";
import { within, expect, userEvent } from "storybook/test";
import { Story, InteractiveTabsDemo } from "./_Tab.default";

const labels = ["General settings", "Agent phone settings", "Contact channels", "Scheduled tasks", "Chronicle", "AI Budget"];

export const FloatingTheme: Story = {
  render: () => (
    <InteractiveTabsDemo
      tabConfig={{ theme: "floating" }}
      tabs={labels.map((label, index) => ({
        label,
        component: (
          <div style={{ padding: "24px" }}>
            <h3>{label} Tab</h3>
            <p>This demonstrates the floating theme for tabs.</p>
          </div>
        ),
        value: index,
      }))}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const tabElements = canvas.getAllByRole("tab");
    await expect(tabElements).toHaveLength(labels.length);

    await userEvent.click(tabElements[2]);
    await expect(canvas.getByText("Contact channels Tab")).toBeInTheDocument();
  },
};
