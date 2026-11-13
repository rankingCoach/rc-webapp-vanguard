import type { StoryObj } from "@storybook/react";
import { SbDecorator } from "@test-utils/get-storybook-decorator";
import React, { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Fade } from "./Fade";

type Story = StoryObj<typeof Fade>;

const Toggle = () => {
  const [visible, setVisible] = useState(true);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button type="button" onClick={() => setVisible((value) => !value)}>
        Toggle
      </button>
      <Fade in={visible}>
        <div data-testid="faded">Fading content (stays mounted)</div>
      </Fade>
    </div>
  );
};

export const Default: Story = {
  render: () => <Toggle />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Toggle" }));
    await waitFor(() => expect(canvas.getByTestId("faded")).toHaveStyle({ visibility: "hidden" }));
    await expect(canvas.getByTestId("faded")).toBeInTheDocument();
  },
};

export default {
  ...SbDecorator({
    title: "Vanguard/Fade",
    component: Fade,
  }),
};
