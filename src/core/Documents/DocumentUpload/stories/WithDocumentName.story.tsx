import { expect, within } from 'storybook/test';
import React from 'react';

import { DocumentUpload } from '../DocumentUpload';
import { mockOnDocumentRemoved, mockOnDocumentSelected, Story } from './_DocumentUpload.default';

export const WithDocumentName: Story = {
  args: {
    onDocumentSelected: mockOnDocumentSelected,
    onDocumentRemoved: mockOnDocumentRemoved,
    documentName: 'Business License',
  },
  render: (args) => (
    <div style={{ padding: '20px' }}>
      <DocumentUpload {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('DocumentUpload')).toBeInTheDocument();
    await expect(canvas.getByText('Business License')).toBeInTheDocument();
    await expect(canvas.getByTestId('UploadDocumentPlaceholder')).toBeInTheDocument();
  },
};
