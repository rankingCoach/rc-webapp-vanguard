import React from "react";
import { Button, ButtonSizes, ButtonTypes } from "../Button";
import { userEvent, within, expect, fn } from "storybook/test";
import { ButtonStory, testIcons, mutedButtonArgTypes } from "./_Button.default";
import { disableControls } from "@test-utils/get-storybook-decorator";

// Tests for the Button Size Comparison Story
export const ButtonSize: ButtonStory = {
  args: {
    type: ButtonTypes.primary,
    children: "Button Text",
    testId: "button-size",
    onClick: fn(),
  },
  argTypes: {
    ...mutedButtonArgTypes,
    ...disableControls(["size"]), // Disable size control since we're showing all sizes
  },
  render: (args) => (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: "16px", 
      alignItems: "flex-start" 
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ minWidth: "80px", fontSize: "14px", fontWeight: "500" }}>Small:</span>
        <Button 
          {...args} 
          size={ButtonSizes.small}
          testId={`${args.testId}-small`}
        />
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ minWidth: "80px", fontSize: "14px", fontWeight: "500" }}>Medium:</span>
        <Button 
          {...args} 
          size={ButtonSizes.medium}
          testId={`${args.testId}-medium`}
        />
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ minWidth: "80px", fontSize: "14px", fontWeight: "500" }}>Large:</span>
        <Button 
          {...args} 
          size={ButtonSizes.large}
          testId={`${args.testId}-large`}
        />
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ minWidth: "80px", fontSize: "14px", fontWeight: "500" }}>Extra Large:</span>
        <Button 
          {...args} 
          size={ButtonSizes.extraLarge}
          testId={`${args.testId}-extra-large`}
        />
      </div>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test all required button sizes are present
    const smallButton = canvas.getByTestId(`${args.testId}-small`);
    await expect(smallButton).toBeInTheDocument();

    const mediumButton = canvas.getByTestId(`${args.testId}-medium`);
    await expect(mediumButton).toBeInTheDocument();

    const largeButton = canvas.getByTestId(`${args.testId}-large`);
    await expect(largeButton).toBeInTheDocument();

    // Every type supports extraLarge
    const extraLargeButton = canvas.getByTestId(`${args.testId}-extra-large`);
    await expect(extraLargeButton).toBeInTheDocument();

    await userEvent.click(extraLargeButton);
    await expect(args.onClick).toHaveBeenCalled();

    // Test that all buttons have the correct text content
    const allButtons = canvas.getAllByText("Button Text");
    await expect(allButtons).toHaveLength(4); // small, medium, large, extraLarge

    // Test click functionality on the medium button (representative test)
    await userEvent.click(mediumButton);
    await expect(args.onClick).toHaveBeenCalled();

    // Test that all buttons have icons if icon prop is provided
    if (args.icon) {
      const smallIcon = canvas.getByTestId(`${args.testId}-small_icon`);
      await expect(smallIcon).toBeInTheDocument();

      const mediumIcon = canvas.getByTestId(`${args.testId}-medium_icon`);
      await expect(mediumIcon).toBeInTheDocument();

      const largeIcon = canvas.getByTestId(`${args.testId}-large_icon`);
      await expect(largeIcon).toBeInTheDocument();

      const extraLargeIcon = canvas.getByTestId(`${args.testId}-extra-large_icon`);
      await expect(extraLargeIcon).toBeInTheDocument();
    }
  },
};