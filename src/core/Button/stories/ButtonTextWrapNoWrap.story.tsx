import React from "react";
import { Button, ButtonTypes } from "../Button";
import { userEvent, within, expect, fn } from "storybook/test";
import { ButtonStory } from "./_Button.default";

const LONG_LABEL = "Very Long Button Text That Should Not Wrap";

// Tests for the Button Text Wrap No Wrap Story
export const ButtonTextWrapNoWrap: ButtonStory = {
  args: {
    type: ButtonTypes.primary,
    children: LONG_LABEL,
    textWrap: "no-wrap",
    testId: "button-text-wrap",
    onClick: fn(),
  },
  render: (props) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "220px", outline: "dotted 2px blue" }}>
      <Button {...props} />
      <Button {...props} testId="button-reference" textWrap={undefined}>
        Short
      </Button>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Verify the button is rendered
    const button = canvas.getByRole("button", { name: LONG_LABEL });
    await expect(button).toBeInTheDocument();

    // The label stays on a single line: same height as a short-label button
    const reference = canvas.getByTestId("button-reference_button");
    await expect(button.getBoundingClientRect().height).toBeCloseTo(reference.getBoundingClientRect().height, 0);
    const label = button.querySelector(".rc-text") as HTMLElement;
    await expect(getComputedStyle(label).whiteSpace).toBe("nowrap");

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    // Verify the button is not disabled
    await expect(button).not.toBeDisabled();
  },
};
