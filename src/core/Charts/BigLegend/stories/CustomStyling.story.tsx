import React from "react";
import { BigLegend } from "../BigLegend";
import { within, expect } from "storybook/test";
import { IconNames } from "@vanguard/Icon/IconNames";
import { FontWeights } from "@vanguard/Text/Text";
import { Story } from "./_BigLegend.default";
import { expectElementValueToBeCssVar } from "@test-utils/expect-element-style-to-be-ccs-var";

export const CustomStyling: Story = {
  args: {
    showBadge: true,
    showPercentage: false,
    showPreviousNumber: true,
    previousNumberText: "previously",
    roundNumbers: true,
    maxWidth: "400px",
    style: { backgroundColor: "var(--n100)", padding: "24px", borderRadius: "8px" },
    testId: "custom-styling-big-legend",
    bigLegendData: [
      {
        currentNumber: 110,
        previousNumber: 105,
        iconName: IconNames.notification,
        iconFillColor: "--p400",
        title: "Website",
        description: "Website clicks made from our Business Profile",
        descriptionColor: "--p400",
        descriptionFont: FontWeights.medium,
      },
      {
        currentNumber: 26000,
        previousNumber: 26000,
        iconName: IconNames.upload,
        iconFillColor: "--s400",
        title: "Directions",
        description: "Direction requests made from your Business Profile",
        descriptionColor: "--s400",
        descriptionFont: FontWeights.medium,
      },
      {
        currentNumber: 28700,
        previousNumber: 29000,
        iconName: IconNames.phone,
        iconFillColor: "--a2900",
        title: "Calls",
        description: "Calls made from your Business Profile",
        descriptionColor: "--a2900",
        descriptionFont: FontWeights.medium,
      },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test that the component is rendered with custom styling
    const component = canvas.getByTestId("custom-styling-big-legend");
    await expect(component).toBeInTheDocument();
    await expectElementValueToBeCssVar(component, "background-color", "--n100");
    await expect(component).toHaveStyle("padding: 24px");
    await expect(component).toHaveStyle("border-radius: 8px");

    // Test that items are rendered
    await expect(canvas.getByText("Website")).toBeInTheDocument();
    await expect(canvas.getByText("Directions")).toBeInTheDocument();
    await expect(canvas.getByText("Calls")).toBeInTheDocument();
  },
};
