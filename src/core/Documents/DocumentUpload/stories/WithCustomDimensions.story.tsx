import { expect, within } from 'storybook/test';
import React from 'react';

import { DocumentUpload } from '../DocumentUpload';
import { mockOnDocumentRemoved, mockOnDocumentSelected, Story } from './_DocumentUpload.default';

export const WithCustomDimensions: Story = {
  args: {
    onDocumentSelected: mockOnDocumentSelected,
    onDocumentRemoved: mockOnDocumentRemoved,
    width: '120px',
    height: '100px',
  },
  render: (args) => (
    <div style={{ padding: '20px' }}>
      <DocumentUpload {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('DocumentUpload')).toBeInTheDocument();

    const uploadArea = canvas.getByTestId('UploadDocumentPlaceholder').parentElement!;
    await expect(uploadArea).toHaveStyle({ width: '120px', height: '100px' });
  },
};
