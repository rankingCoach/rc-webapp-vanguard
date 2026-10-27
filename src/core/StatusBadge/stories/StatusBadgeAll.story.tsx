import React from "react";
import { expect, waitFor } from "storybook/test";
import { StatusBadge } from "../StatusBadge";
import styles from "../StatusBadge.module.scss";
import { Story, statusBadgeGetAllStates } from "./_StatusBadge.default";

export const StatusBadgeAll: Story = {
  args: {
    status: "neutral",
    hideIcon: true,
    text: "Internal text",
  },

  render: () => {
    const allStatusBadgeStatusValues = statusBadgeGetAllStates();

    return (
      <div
        style={{
          display: "grid",
          width: "90vw",
          // padding: 40,
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 25,
        }}
      >
        {allStatusBadgeStatusValues.map((status) => {
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <StatusBadge status={status} text={status} />
              <StatusBadge status={status} text={status} numberValue={22} />
              <StatusBadge status={status} text={status} variant="big" />
            </div>
          );
        })}
      </div>
    );
  },

  // Badges without a size keep the default look: no compact class, the original padding, and every big variant renders
  play: async ({ canvasElement }) => {
    const statuses = statusBadgeGetAllStates();

    await waitFor(() => {
      expect(canvasElement.querySelectorAll(`.${styles.compact}`).length, "compact badges").toBe(0);

      const smallBadges = Array.from(canvasElement.querySelectorAll<HTMLElement>(`.${styles.statusBadge}`));
      expect(smallBadges.length, "small badges").toBe(statuses.length * 2);
      for (const badge of smallBadges) {
        expect(getComputedStyle(badge).padding, `${badge.textContent} padding`).toBe("2px 12px 2px 2px");
      }

      expect(canvasElement.querySelectorAll(`.${styles.statusIcon}`).length, "big badges").toBe(statuses.length);
    });
  },
};
