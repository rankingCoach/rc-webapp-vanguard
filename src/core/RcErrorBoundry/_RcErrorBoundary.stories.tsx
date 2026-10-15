import React from "react";
import { StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { ErrorBoundary } from "@vanguard/RcErrorBoundry/RcErrorBoundry";

type Story = StoryObj<typeof ErrorBoundary>;

const Child = (): React.ReactNode => {
  throw new Error("Story error");
};

export const RcErrorBoundary: Story = {
  render: () => (
    <ErrorBoundary onError={() => {}}>
      <Child />
    </ErrorBoundary>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The fallback renders the muted "Reload page" button
    await expect(await canvas.findByRole("button", { name: /Reload page/i })).toBeInTheDocument();
  },
};

export default {
  title: "vanguard/RcErrorBoundary",
  component: ErrorBoundary,
};
