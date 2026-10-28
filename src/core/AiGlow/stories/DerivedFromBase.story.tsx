import React from "react";
import { AiGlow } from "../AiGlow";
import { within, expect } from "storybook/test";
import { Story } from "./_AiGlow.default";

// Expected values from the Ado styling spec's formulas (sRGB-clipped)
const bases = [
  { testId: "teal", baseColor: "#006a85", label: "Prototype teal", accent: "#00ace7", light: "#3df3f0" },
  { testId: "blue", baseColor: "#0062ff", label: "Direct channel", accent: "#008bff", light: "#66e6ff" },
  { testId: "violet", baseColor: "#3920c8", label: "--a1500", accent: "#467cff", light: "#84dfff" },
  { testId: "theme", baseColor: undefined, label: "Theme --ai-base-color", accent: undefined, light: undefined },
];

const swatchStyle = (background: string): React.CSSProperties => ({
  width: 24,
  height: 24,
  borderRadius: 4,
  background,
});

const SwatchRow = ({ title, actual, expected }: { title: string; actual: string; expected?: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
    <span style={{ minWidth: 48 }}>{title}</span>
    <span style={swatchStyle(actual)} title="Derived" />
    {expected ? <span style={swatchStyle(expected)} title="Expected" /> : null}
    <code>{expected ?? "from theme"}</code>
  </div>
);

export const DerivedFromBase: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The glow takes one colour. The accent (0 %, 55 %) and light (33.3–49 %, 100 %) stops are derived from it in " +
          "OKLCH. Each row shows the derived colour next to the value the spec expects. The last glow has no " +
          "`baseColor`, so it derives from the theme's `--ai-base-color`. The expected values are sRGB-clipped, so on " +
          "a wide-gamut display the derived accent and light colours can look more saturated than their hex swatches.",
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "48px", padding: "32px", justifyContent: "center" }}>
      {bases.map(({ testId, baseColor, label, accent, light }) => (
        <AiGlow key={testId} baseColor={baseColor} borderWidth={2} blurWidth={6}>
          <div
            style={{
              width: 200,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: 16,
              backgroundColor: "#ffffff",
              color: "#333",
            }}
            data-testid={`derived-${testId}-content`}
          >
            <strong>{label}</strong>
            <SwatchRow title="Base" actual="var(--ai-base-color)" expected={baseColor} />
            <SwatchRow title="Accent" actual="var(--ai-glow-accent-color)" expected={accent} />
            <SwatchRow title="Light" actual="var(--ai-glow-light-color)" expected={light} />
          </div>
        </AiGlow>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test that all four glows render
    const glowContainers = canvasElement.querySelectorAll('[class*="grad"]');
    await expect(glowContainers.length).toBe(4);

    // Test that each glow with a baseColor derives its stops from its own base
    for (const { testId, baseColor } of bases.filter(({ baseColor }) => baseColor)) {
      const glowContainer = canvas.getByTestId(`derived-${testId}-content`).parentElement as HTMLElement;
      const computedStyle = getComputedStyle(glowContainer);

      await expect(glowContainer).toHaveStyle({ "--ai-base-color": baseColor });
      await expect(computedStyle.getPropertyValue("--ai-glow-accent-color")).toContain(baseColor);
      await expect(computedStyle.getPropertyValue("--ai-glow-light-color")).toContain(baseColor);
    }

    // Test that the glow without a baseColor does not set one inline
    const themeGlowContainer = canvas.getByTestId("derived-theme-content").parentElement as HTMLElement;
    await expect(themeGlowContainer.style.getPropertyValue("--ai-base-color")).toBe("");
  },
};
