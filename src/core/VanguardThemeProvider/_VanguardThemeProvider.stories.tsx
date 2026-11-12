import type { StoryObj } from "@storybook/react";
import { SbDecorator } from "@test-utils/get-storybook-decorator";
import React from "react";
import { expect, within } from "storybook/test";

import { Pagination } from "../Pagination/Pagination";
import { VanguardThemeProvider } from "./VanguardThemeProvider";

type Story = StoryObj<typeof VanguardThemeProvider>;

export const Default: Story = {
  render: () => (
    <VanguardThemeProvider>
      <Pagination count={3} page={1} testId="themed-pagination" />
    </VanguardThemeProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = canvas.getByRole("button", { name: "page 1" });
    // fontSize 16 scales MUI pxToRem by 16/14: the 14px item text becomes 16px (default theme: 14px).
    await expect(parseFloat(getComputedStyle(page).fontSize)).toBeGreaterThanOrEqual(15);
  },
};

export default {
  ...SbDecorator({
    title: "Vanguard/VanguardThemeProvider",
    component: VanguardThemeProvider,
  }),
};
