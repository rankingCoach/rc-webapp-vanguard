import React from "react";
import { Button, ButtonTypes, ButtonProps } from "@vanguard/Button/Button";
import { userEvent, within, expect, fn } from "storybook/test";
import { BUTTONS_EXCLUDED_CONTROLS_MUTED, ButtonStory, mutedButtonArgTypes } from "./_Button.default";
import { disableControls } from "@test-utils/get-storybook-decorator";

// Tests for the Muted Inverted Button Story
export const ButtonTypeMutedInverted: ButtonStory = {
  globals: { theme: 'light' },
  argTypes: {
      ...disableControls(BUTTONS_EXCLUDED_CONTROLS_MUTED),
      ...mutedButtonArgTypes,
    },
  args: {
    type: ButtonTypes.muted,
    inverted: true,
    children: "Click Me",
    onClick: fn(),
  },
  // The Backgrounds addon is disabled in preview.tsx, so the dark surface is explicit
  render: (args: ButtonProps) => {
    return (
      <div style={{ padding: "24px 48px", background: "#263349" }}>
        <Button {...args} />
      </div>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Verify the button is rendered
    const button = canvas.getByRole("button", { name: "Click Me" });
    await expect(button).toBeInTheDocument();

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    // Verify the button is not disabled
    await expect(button).not.toBeDisabled();

    // Only the fill layer blends (plus-lighter when inverted); the button itself must not isolate it
    await expect(getComputedStyle(button, "::after").mixBlendMode).toBe("plus-lighter");
    const buttonStyle = getComputedStyle(button);
    await expect(buttonStyle.mixBlendMode).toBe("normal");
    await expect(buttonStyle.opacity).toBe("1");
    await expect(buttonStyle.backdropFilter).toBe("none");
    await expect(buttonStyle.filter).toBe("none");
  },
};