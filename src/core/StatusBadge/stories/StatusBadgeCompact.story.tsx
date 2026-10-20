import React from "react";
import { expect, waitFor, within } from "storybook/test";
import { StatusBadge } from "../StatusBadge";
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
