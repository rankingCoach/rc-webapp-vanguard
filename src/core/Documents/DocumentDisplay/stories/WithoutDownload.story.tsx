import React from 'react';
import { expect, within } from 'storybook/test';
import { DocumentDisplay } from '../DocumentDisplay';
import { Story, testDocumentData } from './_DocumentDisplay.default';

export const WithoutDownload: Story = {
  args: {
    ...testDocumentData,
    showDownload: false,
  },
  render: (args) => (
    <div style={{ padding: '20px' }}>
      <DocumentDisplay {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('DocumentDisplay');
    await expect(container).toBeInTheDocument();
    const pdfEmbed = canvas.getByTestId('DocumentDisplay_PDF');
    await expect(pdfEmbed).toBeInTheDocument();
    // Should not have download button
    const downloadButton = canvas.queryByRole('button', { name: /download/i });
    await expect(downloadButton).not.toBeInTheDocument();
  },
};
