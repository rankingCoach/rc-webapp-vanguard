import type { StoryObj } from "@storybook/react";
import { SbDecorator } from "@test-utils/get-storybook-decorator";
import React, { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { Text } from "../Text/Text";
import { Chip } from "./Chip";

type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <Chip label="Filled" />
      <Chip label="Outlined" variant="outlined" />
      <Chip label="Small" size="small" />
      <Chip label="Disabled" disabled />
    </div>
  ),
};

const Deletable = () => {
  const [items, setItems] = useState(["seo", "ads", "reviews"]);
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {items.map((item) => (
        <Chip
          key={item}
          testId={`chip-${item}`}
          size="small"
          label={<Text translate={false}>{item}</Text>}
          onDelete={() => setItems((current) => current.filter((entry) => entry !== item))}
        />
      ))}
    </div>
  );
};

export const WithDelete: Story = {
  render: () => <Deletable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId("chip-ads");
    await userEvent.click(within(chip).getByTestId("CancelIcon"));
    await expect(canvas.queryByTestId("chip-ads")).toBeNull();
  },
};

export default {
  ...SbDecorator({
    title: "Vanguard/Chip",
    component: Chip,
  }),
};
