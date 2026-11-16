import React from "react";
import { within, expect, waitFor } from "storybook/test";
import { Story } from "./_Icon.default";
import { Icon, IconSize } from "../Icon";
import { IconNames } from "../IconNames";

const FILE_MANAGER_ICONS = [IconNames.bookmark, IconNames.bookmarkActive, IconNames.folder];

// The File vault's icons: the favourite bookmark (outline, and filled once on) and the folder, at 16px and 24px
export const FileManagerIcons: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      {FILE_MANAGER_ICONS.map((name) => (
        <React.Fragment key={name}>
          <Icon testId={`${name}-small`} color={"var(--fn-fg)"}>
            {name}
          </Icon>
          <Icon testId={`${name}-large`} type={IconSize.large} color={"var(--fn-fg)"}>
            {name}
          </Icon>
        </React.Fragment>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of FILE_MANAGER_ICONS) {
      await waitFor(() => {
        expect(canvas.getByTestId(`${name}-small-svg`), `${name} 16px`).toHaveAttribute("width", "16");
        expect(canvas.getByTestId(`${name}-large-svg`), `${name} 24px`).toHaveAttribute("width", "24");
      });
    }
  },
};
