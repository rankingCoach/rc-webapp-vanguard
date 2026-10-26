import React from "react";
import { expect, waitFor, within } from "storybook/test";
import { StatusBadge } from "../StatusBadge";
import styles from "../StatusBadge.module.scss";
import iconStyles from "../StatusBadgeIcon/StatusBadgeIcon.module.scss";
import { Story, statusBadgeGetAllStates } from "./_StatusBadge.default";

const NARROW_TEXT = "Waiting for verification";

// Long labels in a narrow column: one line, cut with an ellipsis, inside the 18px pill
const NARROW_CASES = [
  { key: "no-icon", props: { hideIcon: true } },
  { key: "icon", props: {} },
  { key: "number", props: { numberValue: 22 } },
] as const;

export const StatusBadgeCompact: Story = {
  args: {
    status: "ado",
    size: "compact",
    hideIcon: true,
    text: "New",
  },

  render: (args) => {
    const allStatusBadgeStatusValues = statusBadgeGetAllStates();

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 25 }}>
        <StatusBadge {...args} />
        <div
          data-testid="compact-narrow"
          style={{ display: "flex", flexDirection: "column", gap: 8, width: 120, outline: "1px dashed #c2cad6" }}
        >
          {NARROW_CASES.map(({ key, props }) => (
            <div key={key} data-testid={`compact-narrow-${key}`} style={{ display: "flex" }}>
              <StatusBadge status="pending_verification" text={NARROW_TEXT} size="compact" translate={false} {...props} />
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            width: "90vw",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 25,
          }}
        >
          {allStatusBadgeStatusValues.map((status) => {
            return (
              <div
                key={status}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <StatusBadge status={status} text={status} size="compact" hideIcon translate={false} />
                <StatusBadge status={status} text={status} size="compact" translate={false} />
                <StatusBadge status={status} text={status} size="compact" numberValue={22} translate={false} />
              </div>
            );
          })}
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The "New" badge from the args: 18px tall, 11px bold text, padding 1px 7px
    const newLabel = canvas.getByText("New");
    const newBadge = newLabel.parentElement as HTMLElement;
    await waitFor(() => {
      expect(newBadge.getBoundingClientRect().height, "New height").toBe(18);
      expect(getComputedStyle(newBadge).padding, "New padding").toBe("1px 7px");
      expect(getComputedStyle(newLabel).fontSize, "New font size").toBe("11px");
      expect(getComputedStyle(newLabel).fontWeight, "New font weight").toBe("700");
    });

    // Every compact badge, with an icon, with a number or neither, stays 18px tall; the icon fits inside it
    const compactBadges = Array.from(canvasElement.querySelectorAll<HTMLElement>(`.${styles.compact}`));
    expect(compactBadges.length, "compact badges rendered").toBeGreaterThan(statusBadgeGetAllStates().length);
    await waitFor(() => {
      for (const badge of compactBadges) {
        const label = badge.textContent ?? "";
        expect(badge.getBoundingClientRect().height, `${label} height`).toBe(18);
        const icon = badge.querySelector<HTMLElement>(`.${iconStyles.statusBadgeIcon}`);
        if (icon) {
          expect(icon.getBoundingClientRect().height, `${label} icon height`).toBeLessThanOrEqual(18);
        }
      }
    });

    const column = canvas.getByTestId("compact-narrow").getBoundingClientRect();

    for (const { key } of NARROW_CASES) {
      const row = canvas.getByTestId(`compact-narrow-${key}`);
      const badge = row.firstElementChild as HTMLElement;
      const label = within(row).getByText(NARROW_TEXT);

      await waitFor(() => {
        const rect = badge.getBoundingClientRect();
        expect(rect.height, `${key} height`).toBe(18);
        expect(rect.right, `${key} stays in the column`).toBeLessThanOrEqual(column.right);
        // one line, cut with an ellipsis
        expect(label.getBoundingClientRect().height, `${key} label lines`).toBeLessThanOrEqual(18);
        expect(label.scrollWidth, `${key} label is cut`).toBeGreaterThan(label.clientWidth);
        expect(getComputedStyle(label).textOverflow).toBe("ellipsis");
      });
    }
  },
};
