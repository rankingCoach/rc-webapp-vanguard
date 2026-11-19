import React from "react";
import { DocumentDisplay } from "../DocumentDisplay";
import { within, expect } from "storybook/test";
import { Story, testImageData } from "./_DocumentDisplay.default";

export const WithImage: Story = {
  args: testImageData,
  render: (args) => (
    <div style={{ padding: "20px" }}>
      <DocumentDisplay {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId("DocumentDisplay");
    await expect(container).toBeInTheDocument();
    const imageDiv = canvas.getByTestId("DocumentDisplay_IMAGE");
    await expect(imageDiv).toBeInTheDocument();
  },
};