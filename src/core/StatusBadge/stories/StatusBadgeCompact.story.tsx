import React from "react";
import { StatusBadge } from "../StatusBadge";
import { Story, statusBadgeGetAllStates } from "./_StatusBadge.default";

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
};
