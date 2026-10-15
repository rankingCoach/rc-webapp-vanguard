import { expect, userEvent, waitFor, within } from 'storybook/test';
import React from 'react';

import { DocumentUpload } from '../DocumentUpload';
import { mockOnDocumentRemoved, mockOnDocumentSelected, Story } from './_DocumentUpload.default';

// 1x1 transparent PNG
const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const createPngFile = () => {
  const bytes = Uint8Array.from(atob(PNG_BASE64), (char) => char.charCodeAt(0));
  return new File([bytes], 'business-license.png', { type: 'image/png' });
};

/**
 * Uploads a document through the file input so the edit group (muted Remove / Change buttons) is shown.
 * Removes it and uploads again, so the story ends with the edit group visible.
 */
export const WithUploadedDocument: Story = {
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
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const fileInput = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    await expect(fileInput).not.toBeNull();

    await userEvent.upload(fileInput as HTMLInputElement, createPngFile());

    const removeButton = await canvas.findByRole('button', { name: /remove/i });
    await waitFor(() => expect(removeButton).toBeVisible());
    await expect(canvas.getByRole('button', { name: /change/i })).toBeVisible();
    await expect(args.onDocumentSelected).toHaveBeenCalled();

    await userEvent.click(removeButton);
    await expect(args.onDocumentRemoved).toHaveBeenCalled();
    await waitFor(() => expect(canvas.getByTestId('UploadDocumentPlaceholder')).toBeInTheDocument());

    await userEvent.upload(fileInput as HTMLInputElement, createPngFile());
    await waitFor(() => expect(canvas.getByRole('button', { name: /remove/i })).toBeVisible());
  },
};
