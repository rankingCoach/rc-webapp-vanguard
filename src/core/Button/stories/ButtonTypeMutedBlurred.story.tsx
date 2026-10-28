import React from "react";
import { Button, ButtonTypes, ButtonProps } from "@vanguard/Button/Button";
import { userEvent, within, expect, fn } from "storybook/test";
import { ButtonStory, mutedButtonArgTypes, BUTTONS_EXCLUDED_CONTROLS_MUTED } from "./_Button.default";
import { disableControls } from "@test-utils/get-storybook-decorator";

// Tests for the Muted Blurred Button Story
export const ButtonTypeMutedBlurred: ButtonStory = {
  globals: { theme: 'light' },
  argTypes: {
    ...disableControls(BUTTONS_EXCLUDED_CONTROLS_MUTED),
    ...mutedButtonArgTypes,
  },
  args: {
    type: ButtonTypes.muted,
    blurred: true,
    inverted: true,
    children: "Click Me",
    onClick: fn(),
  },
  render: (args: ButtonProps) => {
    return <div style={{
        padding: '24px 48px',
        backgroundImage: "url('https://plus.unsplash.com/premium_photo-1666580543682-c70e62b3d337?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        backgroundSize: "cover",
        backgroundPosition: "left",
      }}>
        <Button {...args} />
      </div>;
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

    // The blur sits on its own ::before layer, the fill on ::after keeps blending
    await expect(getComputedStyle(button, "::before").backdropFilter).toContain("blur(");
    await expect(getComputedStyle(button, "::after").mixBlendMode).toBe("plus-lighter");

    // The button itself must not isolate the blend
    const buttonStyle = getComputedStyle(button);
    await expect(buttonStyle.mixBlendMode).toBe("normal");
    await expect(buttonStyle.opacity).toBe("1");
    await expect(buttonStyle.backdropFilter).toBe("none");
    await expect(buttonStyle.filter).toBe("none");
  },
};