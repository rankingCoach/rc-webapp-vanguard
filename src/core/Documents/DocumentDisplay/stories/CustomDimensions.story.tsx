import React from 'react';
import { expect, within } from 'storybook/test';
import { DocumentDisplay } from '../DocumentDisplay';
import { Story, testDocumentData } from './_DocumentDisplay.default';

export const CustomDimensions: Story = {
  args: {
    ...testDocumentData,
    width: '300px',
    height: '200px',
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
    await expect(pdfEmbed).toHaveAttribute('width', '300px');
    await expect(pdfEmbed).toHaveAttribute('height', '200px');
  },
};
