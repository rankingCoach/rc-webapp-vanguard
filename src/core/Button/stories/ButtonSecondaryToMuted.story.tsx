import React from "react";
import { Button, ButtonSizes, ButtonTypes } from "../Button";
import { within, expect } from "storybook/test";
import { ButtonStory } from "./_Button.default";
import { disableControls } from "@test-utils/get-storybook-decorator";

// Secondary -> muted replacement (VAN-82). Both types share one size set, so the size stays the same.
const SIZES = [ButtonSizes.small, ButtonSizes.medium, ButtonSizes.large, ButtonSizes.extraLarge] as const;

const labelStyle: React.CSSProperties = { minWidth: "120px", fontSize: "14px", fontWeight: 500 };

export const ButtonSecondaryToMuted: ButtonStory = {
  name: "Secondary To Muted",
  args: {
    children: "Edit",
  },
  argTypes: {
    ...disableControls(["type", "size"]),
  },
  parameters: {
    docs: {
      description: {
        story:
          "`ButtonTypes.secondary` is being replaced by `ButtonTypes.muted`. Every type shares one size set, so swap the " +
          "type and keep the size: the button keeps its footprint. Muted has no border and a see-through fill; use " +
          "`inverted` on dark or coloured backgrounds.",
      },
    },
  },
  render: ({ children }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
      {SIZES.map((size) => (
        <div key={size} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={labelStyle}>{size}</span>
          <Button type={ButtonTypes.secondary} size={size} testId={`secondary-${size}`}>
            {children}
          </Button>
          <Button type={ButtonTypes.muted} size={size} testId={`muted-${size}`}>
            {children}
          </Button>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const height = (testId: string) =>
      Math.round(canvas.getByTestId(testId).querySelector("button")!.getBoundingClientRect().height);

    for (const size of SIZES) {
      await expect(height(`secondary-${size}`)).toBe(height(`muted-${size}`));
    }
  },
};
