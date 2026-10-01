import React from "react";
import { AiGlow } from "../AiGlow";
import { within, expect } from "storybook/test";
import { Story } from "./_AiGlow.default";
import styles from "./AiGlowStories.module.scss";

const contentStyle: React.CSSProperties = {
  width: 200,
  height: 100,
  backgroundColor: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  color: "#333",
};

export const WithParityOptions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The parity options are custom properties that a consumer sets through `className`: " +
          "`--ai-glow-angle-offset` (default `0deg`), `--ai-glow-background-size` (default `300%`) and " +
          "`--ai-glow-after-blend-mode` (default `overlay`). The right glow uses the rc-webapp composer's values " +
          "(`8.487deg`, `200%`, `normal`); the left glow uses the defaults.",
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: "48px", padding: "32px", justifyContent: "center" }}>
      <AiGlow baseColor="#006a85" borderRadius={30} borderWidth={2} blurWidth={6}>
        <div style={contentStyle} data-testid="default-glow-content">
          Defaults
        </div>
      </AiGlow>
      <AiGlow baseColor="#006a85" borderRadius={30} borderWidth={2} blurWidth={6} className={styles.parityOptions}>
        <div style={contentStyle} data-testid="parity-glow-content">
          Parity options
        </div>
      </AiGlow>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const defaultGlow = canvas.getByTestId("default-glow-content").parentElement as HTMLElement;
    const parityGlow = canvas.getByTestId("parity-glow-content").parentElement as HTMLElement;

    // Test that the defaults render the standard glow
    const defaultAfter = getComputedStyle(defaultGlow, "::after");
    await expect(defaultAfter.mixBlendMode).toBe("overlay");
    await expect(defaultAfter.backgroundSize).toBe("300% 300%");

    // Test that the className overrides the options
    const parityAfter = getComputedStyle(parityGlow, "::after");
    await expect(parityAfter.mixBlendMode).toBe("normal");
    await expect(parityAfter.backgroundSize).toBe("200% 200%");
    await expect(getComputedStyle(parityGlow).getPropertyValue("--ai-glow-angle-offset").trim()).toBe("8.487deg");
  },
};
