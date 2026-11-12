import type { StoryObj } from "@storybook/react";
import { SbDecorator } from "@test-utils/get-storybook-decorator";
import React, { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { Pagination } from "./Pagination";

type Story = StoryObj<typeof Pagination>;

const Controlled = (props: { shape?: "circular" | "rounded"; size?: "small" | "medium" | "large" }) => {
  const [page, setPage] = useState(1);
  return <Pagination count={10} page={page} onChange={(_event, next) => setPage(next)} {...props} />;
};

export const Default: Story = {
  render: () => <Controlled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Go to page 2" }));
    await expect(canvas.getByRole("button", { name: "page 2" })).toHaveAttribute("aria-current", "page");
  },
};

export const RoundedSmall: Story = {
  render: () => <Controlled shape="rounded" size="small" />,
};

export const Disabled: Story = {
  render: () => <Pagination count={5} page={3} disabled />,
};

export default {
  ...SbDecorator({
    title: "Vanguard/Pagination",
    component: Pagination,
  }),
};
