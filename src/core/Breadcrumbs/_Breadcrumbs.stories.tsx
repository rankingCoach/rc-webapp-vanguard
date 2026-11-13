import type { StoryObj } from "@storybook/react";
import { SbDecorator } from "@test-utils/get-storybook-decorator";
import React from "react";
import { expect, within } from "storybook/test";

import { Text } from "../Text/Text";
import { Breadcrumbs } from "./Breadcrumbs";

type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  render: () => (
    <Breadcrumbs separator="→">
      <a href="#home">Home</a>
      <a href="#admin">Admin</a>
      <Text translate={false}>Users</Text>
    </Breadcrumbs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("navigation", { name: "breadcrumb" })).toBeInTheDocument();
    await expect(canvas.getAllByText("→")).toHaveLength(2);
  },
};

export const Collapsed: Story = {
  render: () => (
    <Breadcrumbs maxItems={3}>
      <a href="#1">One</a>
      <a href="#2">Two</a>
      <a href="#3">Three</a>
      <a href="#4">Four</a>
      <Text translate={false}>Five</Text>
    </Breadcrumbs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("Three")).toBeNull();
  },
};

export default {
  ...SbDecorator({
    title: "Vanguard/Breadcrumbs",
    component: Breadcrumbs,
  }),
};
