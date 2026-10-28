import React from "react";
import { AiGlow } from "../AiGlow";
import { within, expect } from "storybook/test";
import { Story } from "./_AiGlow.default";

export const TwoAiGlowComponents: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "40px", padding: "20px", justifyContent: "center" }}>
      <AiGlow
        borderRadius={12}
        baseColor="#4a00e0"
        blurWidth={16}
        data-testid="first-glow-container"
      >
        <div
          style={{
            width: 180,
            height: 120,
            backgroundColor: "#f8f9fa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            padding: "15px",
            textAlign: "center",
            color: "#333",
          }}
          data-testid="first-glow-content"
        >
          <p>
            Purple AI Glow
            <br />
            with custom blur
          </p>
        </div>
      </AiGlow>

      <AiGlow
        borderRadius={20}
        baseColor="#00b09b"
        borderWidth={4}
        blurWidth={32}
        data-testid="second-glow-container"
      >
        <div
          style={{
            width: 180,
            height: 120,
            backgroundColor: "#f0f9f4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "20px",
            padding: "15px",
            textAlign: "center",
            color: "#333",
          }}
          data-testid="second-glow-content"
        >
          <p>
            Green AI Glow
            <br />
            with border width
          </p>
        </div>
      </AiGlow>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test that both glow containers render
    const glowContainers = canvasElement.querySelectorAll('[class*="grad"]');
    await expect(glowContainers.length).toBe(2);

    // Test first AiGlow component
    const firstContent = canvas.getByTestId("first-glow-content");
    await expect(firstContent).toBeInTheDocument();
    await expect(firstContent).toHaveTextContent("Purple AI Glow");
    await expect(firstContent).toHaveTextContent("with custom blur");

    // Test second AiGlow component
    const secondContent = canvas.getByTestId("second-glow-content");
    await expect(secondContent).toBeInTheDocument();
    await expect(secondContent).toHaveTextContent("Green AI Glow");
    await expect(secondContent).toHaveTextContent("with border width");

    // Test CSS custom properties for first AiGlow
    const firstGlowContainer = firstContent.parentElement;
    await expect(firstGlowContainer).toHaveStyle({
      "--ai-border-radius": "12px",
      "--ai-base-color": "#4a00e0",
      "--ai-blur-width": "16px",
    });

    // Test CSS custom properties for second AiGlow
    const secondGlowContainer = secondContent.parentElement;
    await expect(secondGlowContainer).toHaveStyle({
      "--ai-border-radius": "20px",
      "--ai-base-color": "#00b09b",
      "--ai-border-size-outside": "4px",
      "--ai-blur-width": "32px",
    });

    // Test that each glow derives its accent colour from its own base
    await expect(
      getComputedStyle(firstGlowContainer as HTMLElement).getPropertyValue("--ai-glow-accent-color"),
    ).toContain("#4a00e0");
    await expect(
      getComputedStyle(secondGlowContainer as HTMLElement).getPropertyValue("--ai-glow-accent-color"),
    ).toContain("#00b09b");
  },
};