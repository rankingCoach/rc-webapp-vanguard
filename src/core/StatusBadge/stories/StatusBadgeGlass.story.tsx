import React from "react";
import { expect, waitFor, within } from "storybook/test";
import { StatusBadge } from "../StatusBadge";
import styles from "../StatusBadge.module.scss";
import { Story } from "./_StatusBadge.default";

// variant="glass": the dark glass label on photos (the file card's "Image" chip)
export const StatusBadgeGlass: Story = {
  args: {
    variant: "glass",
    status: "neutral",
    text: "Image",
    translate: false,
  },
  render: (args) => (
    <div
      data-testid="glass-photo"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        width: 240,
        height: 160,
        padding: 12,
        borderRadius: 16,
        background: "linear-gradient(135deg, var(--a1-500), var(--s500) 50%, var(--fn-bg) 100%)",
      }}
    >
      <StatusBadge {...args} />
      <StatusBadge {...args} text="Video" />
      <div style={{ width: 64, display: "flex" }}>
        <StatusBadge {...args} text="Presentation" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("Image");
    const badge = label.parentElement as HTMLElement;

    await waitFor(() => {
      expect(badge.classList.contains(styles.glass), "glass class").toBe(true);
      expect(badge.getBoundingClientRect().height, "height").toBe(24);
      expect(getComputedStyle(badge).padding, "padding").toBe("4px 8px");
      expect(getComputedStyle(badge).backdropFilter, "blur").toBe("blur(8px)");
      expect(getComputedStyle(label).fontSize, "font size").toBe("12px");
      expect(getComputedStyle(label).color, "white text").toBe("rgb(255, 255, 255)");
    });

    // a long label in a narrow space: one line, cut with an ellipsis, inside the 24px pill
    const longLabel = canvas.getByText("Presentation");
    const longBadge = longLabel.parentElement as HTMLElement;
    await waitFor(() => {
      expect(longBadge.getBoundingClientRect().height, "long height").toBe(24);
      expect(longBadge.getBoundingClientRect().width, "long stays in its box").toBeLessThanOrEqual(64);
      expect(longLabel.scrollWidth, "long label is cut").toBeGreaterThan(longLabel.clientWidth);
    });
  },
};
