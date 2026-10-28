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

export const CustomTexts: Story = {
  render: () => (
    <ErrorBoundary
      onError={() => {}}
      title="rankingCoach was updated"
      description="A newer version is ready. Reload the page to carry on where you were."
    >
      <Child />
    </ErrorBoundary>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText("rankingCoach was updated")).toBeInTheDocument();
    await expect(canvas.queryByText("Aw, snap!")).not.toBeInTheDocument();
  },
};

export default {
  title: "vanguard/RcErrorBoundary",
  component: ErrorBoundary,
};
