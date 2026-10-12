import React from "react";
import { AiGlow } from "../AiGlow";
import { expect, waitFor } from "storybook/test";
import { Story } from "./_AiGlow.default";

export const AmbientPaused: Story = {
  args: {
    borderRadius: 16,
    children: (
      <div
        style={{
          width: 220,
          height: 100,
          backgroundColor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "16px",
        }}
      >
        Frozen while the host is idle
      </div>
    ),
  },
  decorators: [
    (StoryComponent) => (
      <div style={{ "--ambient-play-state": "paused", padding: 24 } as React.CSSProperties}>
        <StoryComponent />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const glowContainer = canvasElement.querySelector('[class*="grad"]') as HTMLElement;
    await expect(glowContainer).toBeTruthy();

    await waitFor(() => {
      const glowAnimations = glowContainer.getAnimations({ subtree: true });
      expect(glowAnimations.length).toBeGreaterThan(0);
      glowAnimations.forEach((animation) => expect(animation.playState).toBe("paused"));
    });
  },
};
