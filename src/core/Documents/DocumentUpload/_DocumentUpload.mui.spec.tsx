/**
 * MUI contract (characterization) tests for DocumentUpload.
 *
 * MUI surface: the Remove/Change edit group sits in an MUI `Collapse` driven by `!!document.fileSrc`
 * (no unmountOnExit), and the selected document is shown through DocumentDisplay (two more Collapses).
 * No Vanguard production code depends on MUI Collapse classes (grep src for "MuiCollapse": none), so
 * shown/hidden is asserted as button visibility.
 *
 * jsdom note: PNG/JPG go through compressorjs (needs canvas), so selection is exercised with PDFs here;
 * the image path is covered by the existing browser story `WithUploadedDocument`.
 */
import '@testing-library/jest-dom/vitest';

import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { snackbarService } from '@vanguard/SnackbarRoot/SnackBarService';
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../test-utils/test-utils';
import { DocumentUpload, DocumentUploadProps } from './DocumentUpload';

const PDF_BYTES = '%PDF-1.4\n%test\n';
const pdfFile = (name = 'license.pdf', size?: number) =>
  new File([size ? new Uint8Array(size) : PDF_BYTES], name, { type: 'application/pdf' });

const renderUpload = (props: Partial<DocumentUploadProps> = {}) => {
  const onDocumentSelected = vi.fn();
  const onDocumentRemoved = vi.fn();
  const utils = render(
    <DocumentUpload onDocumentSelected={onDocumentSelected} onDocumentRemoved={onDocumentRemoved} {...props} />,
  );
  const fileInput = () => utils.container.querySelector('input[type="file"]') as HTMLInputElement;
  // By text: while collapsed (visibility: hidden) the buttons have no accessible name.
  const removeButton = () => screen.getByText('Remove').closest('button') as HTMLButtonElement;
  const changeButton = () => screen.getByText('Change').closest('button') as HTMLButtonElement;
  return { ...utils, onDocumentSelected, onDocumentRemoved, fileInput, removeButton, changeButton };
};

let inputClick: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  // Opening the native picker is not observable in jsdom; spy on it (and keep it inert).
  inputClick = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
});
afterEach(() => {
  inputClick.mockRestore();
});

describe('DocumentUpload MUI contract: initial state', () => {
  test('renders container, placeholder sized by width/height, hidden file input with accept list', () => {
    const { fileInput } = renderUpload({ width: '120px', height: '100px' });
    expect(screen.getByTestId('DocumentUpload')).toBeInTheDocument();
    const placeholder = screen.getByTestId('UploadDocumentPlaceholder');
    expect(placeholder.parentElement!.style.width).toBe('120px');
    expect(placeholder.parentElement!.style.height).toBe('100px');
    expect(screen.getByText('Upload document')).toBeInTheDocument();
    expect(fileInput()).toHaveAttribute('accept', 'application/pdf,image/png,image/jpg,image/jpeg');
    expect(fileInput().style.display).toBe('none');
    expect(fileInput().multiple).toBe(false);
  });

  test('default placeholder size is 192px x 154px', () => {
    renderUpload();
    const box = screen.getByTestId('UploadDocumentPlaceholder').parentElement!;
    expect(box.style.width).toBe('192px');
    expect(box.style.height).toBe('154px');
  });

  test('custom testId', () => {
    renderUpload({ testId: 'MyUpload' });
    expect(screen.getByTestId('MyUpload')).toBeInTheDocument();
  });

  test('documentName is shown as title and used in the upload label', () => {
    renderUpload({ documentName: 'Business License' });
    expect(screen.getByText('Business License')).toBeInTheDocument();
    expect(screen.getByText(/Upload\s.*Business License/)).toBeInTheDocument();
  });

  test('Remove / Change are mounted but not visible before a document is selected', () => {
    const { removeButton, changeButton } = renderUpload();
    expect(removeButton()).toBeInTheDocument();
    expect(removeButton()).not.toBeVisible();
    expect(changeButton()).not.toBeVisible();
  });

  test('clicking the placeholder opens the native file picker', async () => {
    const user = userEvent.setup();
    renderUpload();
    await user.click(screen.getByTestId('UploadDocumentPlaceholder'));
    await waitFor(() => expect(inputClick).toHaveBeenCalledTimes(1));
  });
});

describe('DocumentUpload MUI contract: selection / remove / change', () => {
  test('selecting a PDF calls onDocumentSelected and swaps placeholder for DocumentDisplay', async () => {
    const { fileInput, onDocumentSelected, removeButton, changeButton } = renderUpload({ documentName: 'License' });
    await userEvent.upload(fileInput(), pdfFile());
    await waitFor(() => expect(onDocumentSelected).toHaveBeenCalledTimes(1));
    const doc = onDocumentSelected.mock.calls[0][0];
    expect(doc).toEqual({
      srcIsBase64: true,
      fileSrc: expect.stringMatching(/^data:application\/pdf;base64,/),
      fileName: 'license.pdf',
      fileMimeType: 'application/pdf',
      documentName: 'License',
    });
    expect(await screen.findByTestId('DocumentDisplay_PDF')).toHaveAttribute('src', doc.fileSrc);
    expect(screen.queryByTestId('UploadDocumentPlaceholder')).toBeNull();
    // DocumentDisplay is rendered without the Download button
    expect(screen.queryByRole('button', { name: /download/i })).toBeNull();
    await waitFor(() => expect(removeButton()).toBeVisible());
    expect(changeButton()).toBeVisible();
  });

  test('Remove clears the document, calls onDocumentRemoved and collapses the edit group', async () => {
    const user = userEvent.setup();
    const { fileInput, onDocumentRemoved, removeButton } = renderUpload();
    await user.upload(fileInput(), pdfFile());
    await screen.findByTestId('DocumentDisplay_PDF');
    await waitFor(() => expect(removeButton()).toBeVisible());
    await user.click(removeButton());
    expect(onDocumentRemoved).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('UploadDocumentPlaceholder')).toBeInTheDocument();
    expect(screen.queryByTestId('DocumentDisplay_PDF')).toBeNull();
    await waitFor(() => expect(removeButton()).not.toBeVisible());
  });

  test('Change re-opens the native file picker', async () => {
    const user = userEvent.setup();
    const { fileInput } = renderUpload();
    await user.upload(fileInput(), pdfFile());
    await screen.findByTestId('DocumentDisplay_PDF');
    inputClick.mockClear();
    await user.click(screen.getByRole('button', { name: 'Change' }));
    await waitFor(() => expect(inputClick).toHaveBeenCalledTimes(1));
  });

  test('file over 5MB shows an error snackbar and selects nothing', async () => {
    const snackbar = vi.spyOn(snackbarService, 'openErrorSnackbar').mockImplementation(() => {});
    const { fileInput, onDocumentSelected } = renderUpload();
    await userEvent.upload(fileInput(), pdfFile('big.pdf', 5242881));
    await waitFor(() => expect(snackbar).toHaveBeenCalledWith('File size must be between 10kb and 5MB.'));
    expect(onDocumentSelected).not.toHaveBeenCalled();
    expect(screen.getByTestId('UploadDocumentPlaceholder')).toBeInTheDocument();
    snackbar.mockRestore();
  });

  test('empty selection does nothing', () => {
    const { fileInput, onDocumentSelected } = renderUpload();
    fireEvent.change(fileInput(), { target: { files: [] } });
    expect(onDocumentSelected).not.toHaveBeenCalled();
  });
});
