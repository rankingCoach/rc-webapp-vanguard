import React from "react";
import { DocumentUpload } from "../DocumentUpload";
import { within, expect } from "storybook/test";
import { Story, mockOnDocumentSelected, mockOnDocumentRemoved } from "./_DocumentUpload.default";

export const Default: Story = {
  args: {
    onDocumentSelected: mockOnDocumentSelected,
    onDocumentRemoved: mockOnDocumentRemoved,
    documentName: "Test Document",
  },
  render: (args) => (
    <div style={{ padding: "20px" }}>
      <DocumentUpload {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId("DocumentUpload");
    await expect(container).toBeInTheDocument();
  },
};