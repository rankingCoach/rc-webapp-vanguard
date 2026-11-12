import type { StoryObj } from "@storybook/react";
import { SbDecorator } from "@test-utils/get-storybook-decorator";
import React from "react";
import { expect, userEvent, within } from "storybook/test";

import { FocusTrap } from "./FocusTrap";

type Story = StoryObj<typeof FocusTrap>;

export const Default: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8 }}>
      <button type="button">Outside (unreachable)</button>
      <FocusTrap open>
        <div role="dialog" aria-label="trapped panel" tabIndex={-1} style={{ display: "flex", gap: 8 }}>
          <button type="button">First</button>
          <button type="button">Last</button>
        </div>
      </FocusTrap>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("dialog")).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "First" })).toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    await expect(canvas.getByRole("dialog").contains(document.activeElement)).toBe(true);
  },
};

export default {
  ...SbDecorator({
    title: "Vanguard/FocusTrap",
    component: FocusTrap,
  }),
};
