import { act, fireEvent, render, renderHook, waitFor } from '@test-utils/test-utils';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as XLSX from 'xlsx';

import { ExportXLS, useExportXLS } from './ExportXLS';

const saveAs = vi.fn();
// The real package is CommonJS: under plain ESM interop its namespace has only `default` (checked in node).
vi.mock('file-saver', () => ({ default: { saveAs: (...a: unknown[]) => saveAs(...a) } }));

/** Characterization (track f): the XLSX export writes the same workbook and saves it under the same name, also once xlsx loads lazily. */
const rows = [
  { name: 'Ann', score: 3 },
  { name: 'Bob', score: 5 },
];
const readSaved = async () => {
  const [blob, name] = saveAs.mock.calls[0] as [Blob, string];
  const buf = await new Promise<ArrayBuffer>((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as ArrayBuffer);
    r.readAsArrayBuffer(blob);
  });
  const wb = XLSX.read(new Uint8Array(buf), { type: 'array' });
  return { name, type: blob.type, sheet: XLSX.utils.sheet_to_json(wb.Sheets.data) };
};

describe('ExportXLS', () => {
  afterEach(() => saveAs.mockReset());

  it('button click saves rows as data sheet in <fileName>.xlsx', async () => {
    const { getByRole } = render(<ExportXLS rows={rows} fileName={'scores'} />);
    act(() => {
      fireEvent.click(getByRole('button'));
    });
    await waitFor(() => expect(saveAs).toHaveBeenCalledTimes(1));
    const saved = await readSaved();
    expect(saved.name).toBe('scores.xlsx');
    // Blob normalises the type to lower case.
    expect(saved.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8');
    expect(saved.sheet).toEqual(rows);
  });

  it('useExportXLS handler returns nothing and saves the same file', async () => {
    const { result } = renderHook(() => useExportXLS(rows, 'hook'));
    expect(result.current.exportHndlerFn()).toBeUndefined();
    await waitFor(() => expect(saveAs).toHaveBeenCalledTimes(1));
    expect((await readSaved()).name).toBe('hook.xlsx');
  });
});
