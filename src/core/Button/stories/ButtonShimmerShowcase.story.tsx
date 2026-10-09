import React from "react";
import { AiGlow } from "@vanguard/AiGlow/AiGlow";
import { IconNames } from "@vanguard/Icon/IconNames";
import { within, expect } from "storybook/test";
import { Button, ButtonProps, ButtonSizes, ButtonTypes } from "../Button";
import { ButtonStory } from "./_Button.default";

const rowStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "16px" };
const labelStyle: React.CSSProperties = { minWidth: "160px", fontSize: "14px", fontWeight: "500" };

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={rowStyle}>
    <span style={labelStyle}>{label}</span>
    {children}
  </div>
);

const description = `
The shimmer is a 110° gradient in \`--ai-base-color\` with a band of the derived light colour sweeping across it in a
seamless 6 s loop. Hover darkens it with a \`filter\` on hover-capable devices only. Under
\`prefers-reduced-motion: reduce\` the sweep stands still. A disabled shimmer button keeps its disabled look and does
not animate.

**Contrast.** White label contrast drops at the band's peak (55 % base mixed with 45 % light), below WCAG AA's 4.5 : 1.
Design decides whether to cap the peak.

| Base | Plain base | Band peak |
|---|---|---|
| \`#006a85\` | 6.18 : 1 | 2.96 : 1 |
| \`#0062ff\` (direct channel) | 5.01 : 1 | 2.72 : 1 |
| \`#093c97\` (IONOS) | 9.98 : 1 | 3.80 : 1 |
| \`#3920c8\` (\`--a1500\`) | 9.48 : 1 | 3.67 : 1 |
`;

export const ButtonShimmerShowcase: ButtonStory = {
  args: {
    type: ButtonTypes.shimmer,
    children: "Ask Ado",
  },
  parameters: {
    docs: {
      description: {
        story: description,
      },
    },
  },
  render: (args) => {
    // rc-webapp's round send button: small, rounded, icon only
    const iconOnlyArgs: ButtonProps = {
      type: ButtonTypes.shimmer,
      size: ButtonSizes.small,
      icon: IconNames.arrowUp,
      rounded: true,
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "stretch", maxWidth: "640px" }}>
        <Row label="Sizes">
          <Button {...args} size={ButtonSizes.small} testId="shimmer-small" />
          <Button {...args} size={ButtonSizes.medium} testId="shimmer-medium" />
          <Button {...args} size={ButtonSizes.large} testId="shimmer-large" />
        </Row>
        <Row label="Rounded icon-only">
          <Button {...iconOnlyArgs} testId="shimmer-icon-only" />
        </Row>
        <Row label="Disabled">
          <Button {...args} disabled testId="shimmer-disabled" />
        </Row>
        <Row label="Loading">
          <Button {...args} isLoading testId="shimmer-loading" />
        </Row>
        <Row label="Full width (w100)">
          <div style={{ flex: 1 }}>
            <Button {...args} w100 testId="shimmer-w100" />
          </div>
        </Row>
        <Row label="Inside AiGlow (#006a85)">
          <AiGlow baseColor="#006a85" borderRadius={30} borderWidth={2} blurWidth={6}>
            <div
              style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 16px", background: "#fff" }}
            >
              <span style={{ fontSize: "14px", color: "#333" }}>Ask anything</span>
              <Button {...iconOnlyArgs} testId="shimmer-in-glow" />
            </div>
          </AiGlow>
        </Row>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify the enabled variants all carry the sweep
    for (const testId of ["shimmer-small", "shimmer-medium", "shimmer-large", "shimmer-icon-only", "shimmer-loading"]) {
      const button = canvas.getByTestId(`${testId}_button`);
      await expect(window.getComputedStyle(button).animationName).toContain("adoShimmer");
    }

    // Verify the disabled button does not
    const disabledButton = canvas.getByTestId("shimmer-disabled_button");
    await expect(disabledButton).toBeDisabled();
    await expect(window.getComputedStyle(disabledButton).backgroundImage).toBe("none");
    await expect(window.getComputedStyle(disabledButton).animationName).toBe("none");

    // Verify the button inside the glow inherits the glow's base colour
    const glowButton = canvas.getByTestId("shimmer-in-glow_button");
    await expect(window.getComputedStyle(glowButton).getPropertyValue("--ai-base-color").trim()).toBe("#006a85");
  },
};
