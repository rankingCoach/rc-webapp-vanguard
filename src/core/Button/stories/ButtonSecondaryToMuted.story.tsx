import React from "react";
import { Button, ButtonSizes, ButtonTypes } from "../Button";
import { within, expect } from "storybook/test";
import { ButtonStory } from "./_Button.default";
import { disableControls } from "@test-utils/get-storybook-decorator";

// Secondary -> muted replacement sizes (VAN-82). Muted is bumped one size so the height stays the same.
const SIZE_MAP: { secondary: Exclude<ButtonSizes, ButtonSizes.extraLarge>; muted: ButtonSizes; height: string }[] = [
  { secondary: ButtonSizes.small, muted: ButtonSizes.medium, height: "32px / 40px" },
  { secondary: ButtonSizes.medium, muted: ButtonSizes.extraLarge, height: "48px / 40px" },
  { secondary: ButtonSizes.large, muted: ButtonSizes.extraLarge, height: "60px → 48px / 48px → 40px" },
];

const labelStyle: React.CSSProperties = { minWidth: "220px", fontSize: "14px", fontWeight: 500 };

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
          "`ButtonTypes.secondary` is being replaced by `ButtonTypes.muted`. Bump the size one step when swapping so the " +
          "height stays the same: secondary `small` → muted `medium` (32px), secondary `medium` (default) → muted " +
          "`extraLarge` (48px), secondary `large` → muted `extraLarge` (closest, 12px shorter). Heights shown as desktop / mobile. " +
          "Text gets smaller for small (16px → 12px) and large (20px → 16px); use `inverted` on dark or coloured backgrounds.",
      },
    },
  },
  render: ({ children }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
      {SIZE_MAP.map(({ secondary, muted, height }) => (
        <div key={secondary} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={labelStyle}>
            {secondary} → {muted} ({height})
          </span>
          <Button type={ButtonTypes.secondary} size={secondary} testId={`secondary-${secondary}`}>
            {children}
          </Button>
          <Button type={ButtonTypes.muted} size={muted} testId={`muted-${secondary}`}>
            {children}
          </Button>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const { secondary } of SIZE_MAP) {
      await expect(canvas.getByTestId(`secondary-${secondary}`)).toBeInTheDocument();
      await expect(canvas.getByTestId(`muted-${secondary}`)).toBeInTheDocument();
    }
  },
};
