import React from "react";
import { AiGlow } from "../AiGlow";
import { within, expect } from "storybook/test";
import { Story } from "./_AiGlow.default";

export const WithBlurWidth: Story = {
  args: {
    blurWidth: 40,
    borderRadius: 16,
    baseColor: "#ff4500",
    children: (
      <div
        style={{
          width: 180,
          height: 100,
          backgroundColor: "#fff5f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "16px",
          padding: "15px",
          textAlign: "center",
        }}
        data-testid="blur-width-content"
      >
        Custom Blur Width
      </div>
    ),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test that the component renders
    const glowContainer = canvasElement.querySelector('[class*="grad"]');
    await expect(glowContainer).toBeTruthy();

    // Test that children are rendered
    const content = canvas.getByTestId("blur-width-content");
    await expect(content).toBeInTheDocument();
    await expect(content).toHaveTextContent("Custom Blur Width");

    // Test that blurWidth prop is passed and applied
    await expect(args.blurWidth).toBe(40);

    // Test that the CSS custom properties are set with the correct values
    await expect(glowContainer).toHaveStyle({
      "--ai-blur-width": "40px",
      "--ai-border-radius": "16px",
      "--ai-base-color": "#ff4500",
    });

    // Test that only the base colour is set inline; the other stops are derived from it
    const glowElement = glowContainer as HTMLElement;
    await expect(glowElement.style.getPropertyValue("--ai-start-color")).toBe("");
    await expect(glowElement.style.getPropertyValue("--ai-end-color")).toBe("");
    await expect(getComputedStyle(glowElement).getPropertyValue("--ai-glow-light-color")).toContain("#ff4500");
  },
};