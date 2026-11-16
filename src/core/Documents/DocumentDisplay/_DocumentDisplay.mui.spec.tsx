/**
 * MUI contract (characterization) tests for DocumentDisplay.
 *
 * MUI surface: two `Collapse` sections (document name on top, file name below), each driven by `!!prop`,
 * no unmountOnExit. No Vanguard production code depends on MUI Collapse classes (grep src for "MuiCollapse":
 * none), so shown/hidden is asserted as text visibility.
 * The rest (content type switch, download) is locked so regressions from the bump are attributable.
 */
import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../test-utils/test-utils';
import { DocumentDataType } from '../Document.types';
import { DocumentDisplay, DocumentDisplayProps } from './DocumentDisplay';

const PNG_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const PDF_DATA_URL = 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK';
const TXT_DATA_URL = 'data:text/plain;base64,aGVsbG8gd29ybGQ=';

const pdfDoc: DocumentDataType = {
  fileName: 'contract.pdf',
  fileSrc: PDF_DATA_URL,
  fileMimeType: 'application/pdf',
  documentName: 'Contract',
};

const renderDisplay = (props: Partial<DocumentDisplayProps> = {}) => {
  return render(<DocumentDisplay {...pdfDoc} {...props} />);
};

describe('DocumentDisplay MUI contract: name / file name Collapses', () => {
  test('documentName and fileName set: both texts visible', () => {
    renderDisplay();
    expect(screen.getByText('Contract')).toBeVisible();
    expect(screen.getByText('contract.pdf')).toBeVisible();
  });

  test('file name wrapper is limited to the display width', () => {
    renderDisplay({ width: '210px' });
    const wrapper = screen.getByText('contract.pdf').closest('div[style*="max-width"]') as HTMLElement;
    expect(wrapper.style.maxWidth).toBe('210px');
  });

  test('adding a documentName later reveals it', async () => {
    const { rerender } = renderDisplay({ documentName: undefined });
    expect(screen.queryByText('Later')).toBeNull();
    rerender(<DocumentDisplay {...pdfDoc} documentName="Later" />);
    await waitFor(() => expect(screen.getByText('Later')).toBeVisible());
  });

  test('clearing fileName removes the file name text', () => {
    const { rerender } = renderDisplay();
    rerender(<DocumentDisplay {...pdfDoc} fileName="" />);
    expect(screen.queryByText('contract.pdf')).toBeNull();
    // the documentName area is unaffected
    expect(screen.getByText('Contract')).toBeVisible();
  });
});

describe('DocumentDisplay MUI contract: content by mime type', () => {
  test('pdf: <embed> with src/type and default 192px x 154px', () => {
    renderDisplay();
    const embed = screen.getByTestId('DocumentDisplay_PDF');
    expect(embed.tagName).toBe('EMBED');
    expect(embed).toHaveAttribute('src', PDF_DATA_URL);
    expect(embed).toHaveAttribute('type', 'application/pdf');
    expect(embed).toHaveAttribute('width', '192px');
    expect(embed).toHaveAttribute('height', '154px');
  });

  test.each(['image/png', 'image/jpg', 'image/jpeg'] as const)(
    '%s: image box with <img> sized by width/height',
    (mime) => {
      renderDisplay({ fileMimeType: mime, fileSrc: PNG_DATA_URL, width: '50px', height: '40px' });
      const box = screen.getByTestId('DocumentDisplay_IMAGE');
      expect(box.style.width).toBe('50px');
      expect(box.style.height).toBe('40px');
      expect(box.querySelector('img')).toHaveAttribute('src', PNG_DATA_URL);
    },
  );

  test('unknown mime: sniffs the magic number of fileSrc (png -> image)', async () => {
    renderDisplay({ fileMimeType: 'unknown', fileSrc: PNG_DATA_URL });
    await waitFor(() => expect(screen.getByTestId('DocumentDisplay_IMAGE').querySelector('img')).not.toBeNull());
  });

  test('unknown mime: sniffs pdf', async () => {
    renderDisplay({ fileMimeType: 'unknown', fileSrc: PDF_DATA_URL });
    expect(await screen.findByTestId('DocumentDisplay_PDF')).toBeInTheDocument();
  });

  test('unknown mime that stays unknown: placeholder card without <img>', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    renderDisplay({ fileMimeType: 'unknown', fileSrc: TXT_DATA_URL });
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    const box = screen.getByTestId('DocumentDisplay_IMAGE');
    expect(box.querySelector('img')).toBeNull();
    expect(screen.queryByTestId('DocumentDisplay_PDF')).toBeNull();
    fetchSpy.mockRestore();
  });

  test('[bug-lock] changing fileMimeType without changing fileSrc does not update the view', () => {
    // Baseline characterization: not a promised contract.
    const { rerender } = renderDisplay();
    rerender(<DocumentDisplay {...pdfDoc} fileMimeType="image/png" />);
    // CURRENT BEHAVIOUR (suspected bug): the format effect depends on [fileSrc] only.
    expect(screen.getByTestId('DocumentDisplay_PDF')).toBeInTheDocument();
  });

  test('changing fileSrc picks up the new fileMimeType', async () => {
    const { rerender } = renderDisplay();
    rerender(<DocumentDisplay {...pdfDoc} fileSrc={PNG_DATA_URL} fileMimeType="image/png" />);
    expect(await screen.findByTestId('DocumentDisplay_IMAGE')).toBeInTheDocument();
  });

  test('custom testId prefixes container and content ids', () => {
    renderDisplay({ testId: 'Doc' });
    expect(screen.getByTestId('Doc')).toBeInTheDocument();
    expect(screen.getByTestId('Doc_PDF')).toBeInTheDocument();
  });
});

describe('DocumentDisplay MUI contract: download', () => {
  // jsdom has no URL.createObjectURL: install a mock for the test and restore the original state afterwards.
  const originalCreateObjectURL = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
  let createObjectURL: ReturnType<typeof vi.fn>;
  let anchorClick: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    createObjectURL = vi.fn(() => 'blob:mock');
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true, writable: true });
    anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });
  afterEach(() => {
    anchorClick.mockRestore();
    if (originalCreateObjectURL) {
      Object.defineProperty(URL, 'createObjectURL', originalCreateObjectURL);
    } else {
      delete (URL as unknown as Record<string, unknown>).createObjectURL;
    }
  });

  test('Download button is shown by default and triggers a file download with fileName', async () => {
    const user = userEvent.setup();
    renderDisplay();
    await user.click(screen.getByRole('button', { name: /download/i }));
    await waitFor(() => expect(anchorClick).toHaveBeenCalledTimes(1));
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('application/pdf');
    const link = anchorClick.mock.contexts[0] as HTMLAnchorElement;
    expect(link.download).toBe('contract.pdf');
  });

  test('showDownload=false hides the Download button', () => {
    renderDisplay({ showDownload: false });
    expect(screen.queryByRole('button', { name: /download/i })).toBeNull();
  });
});
