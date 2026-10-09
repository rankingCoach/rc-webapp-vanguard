import React from "react";
import { Button, ButtonTypes } from "../Button";
import { userEvent, within, expect, fn } from "storybook/test";
import { useToggle } from "@custom-hooks/useToggle";
import { ButtonStory } from "./_Button.default";

// Tests for Shimmer Button
export const ButtonTypeShimmer: ButtonStory = {
  args: {
    type: ButtonTypes.shimmer,
    children: "Shimmering",
    onClick: fn(),
  },
  render: (args) => {
    const [disabled, toggleDisabled] = useToggle(false);

    return (
      <Button
        {...args}
        disabled={disabled}
        onClick={(e) => {
          toggleDisabled();
          args.onClick!(e);
        }}
      />
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Verify the button is rendered
    let button = canvas.getByRole("button", { name: "Shimmering" });
    await expect(button).toBeInTheDocument();

    // Verify the shimmer sweep is applied to the button itself
    let computedStyle = window.getComputedStyle(button);
    await expect(computedStyle.backgroundImage).toContain("linear-gradient");
    await expect(computedStyle.animationName).toContain("adoShimmer");

    // Verify the old pseudo-element layer is gone
    await expect(window.getComputedStyle(button, "::before").content).toBe("none");

    await userEvent.click(button); // Clicking should not trigger any action
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    await expect(button).toBeDisabled();

    await userEvent.click(button); // Clicking should not trigger any action

    // Verify the shimmer effect is removed when the button is disabled
    await expect(button).toBeDisabled();
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    computedStyle = window.getComputedStyle(button);
    await expect(computedStyle.backgroundImage).toBe("none");
    await expect(computedStyle.animationName).toBe("none");
  },
};
