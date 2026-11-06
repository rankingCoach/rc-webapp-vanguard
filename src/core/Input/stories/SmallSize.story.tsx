import React from "react";
import { Input } from "../Input";
import { within, expect, userEvent, waitFor } from "storybook/test";
import { Icon } from "@vanguard/Icon/Icon";
import { IconNames } from "@vanguard/Icon/IconNames";
import { Story, testPlaceholders } from "./_Input.default";

const searchIcon = (
  <Icon color={"var(--fn-fg-light)"}>{IconNames.search}</Icon>
);

// size="small": the compact 32px filled search field (muted fill, no outline at rest, 13px text, leading icon)
export const SmallSize: Story = {
  args: {
    size: "small",
    labelType: "hidden",
    placeholder: testPlaceholders.search,
    adornment: searchIcon,
    testId: "small-input",
  },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 240 }}>
      <Input {...args} />
      <Input {...args} testId="small-input-value" value="Storefront" />
      <Input {...args} testId="small-input-disabled" disabled />
      <Input size="small" labelType="hidden" placeholder="No icon" testId="small-input-plain" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByTestId("small-input");
    const root = field.querySelector<HTMLElement>(".MuiOutlinedInput-root")!;
    const input = root.querySelector<HTMLInputElement>("input")!;
    const outline = root.querySelector<HTMLElement>("fieldset")!;

    await waitFor(() => {
      expect(root.getBoundingClientRect().height, "height").toBe(32);
      expect(getComputedStyle(root).borderRadius, "radius").toBe("4px");
      expect(getComputedStyle(outline).borderTopWidth, "no outline at rest").toBe("0px");
      expect(getComputedStyle(input).fontSize, "font size").toBe("13px");
      expect(getComputedStyle(root).backgroundColor, "filled").not.toBe("rgba(0, 0, 0, 0)");
    });

    // the leading icon sits 10px in, the text 32px in (10 + 16 + 6)
    await waitFor(() => expect(root.querySelector("svg"), "icon loaded").not.toBeNull());
    const rootLeft = root.getBoundingClientRect().left;
    const adornment = root.firstElementChild as HTMLElement;
    expect(adornment.getBoundingClientRect().left - rootLeft, "icon inset").toBe(10);
    expect(Math.round(input.getBoundingClientRect().left - rootLeft), "text inset").toBe(32);

    // no icon: the text keeps a 12px side
    const plain = canvas.getByTestId("small-input-plain").querySelector<HTMLElement>(".MuiOutlinedInput-root")!;
    expect(getComputedStyle(plain.querySelector("input")!).paddingLeft, "plain padding").toBe("12px");

    // focus: an inset 2px ring, still no outline border
    await userEvent.click(input);
    await waitFor(() => {
      expect(getComputedStyle(root).boxShadow, "focus ring").toContain("inset");
      expect(getComputedStyle(outline).borderTopWidth, "no outline when focused").toBe("0px");
    });
  },
};
