import '@testing-library/jest-dom/vitest';

import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '../../../../test-utils/test-utils';
import { Table, TableColumnProps, TableRowProps } from '../Table';
import { csvField, rowsToCsv } from './table-toolbar-data';

const COLUMNS: TableColumnProps[] = [
  { alias: 'name', text: 'Name', sortable: true },
  { alias: 'calls', text: 'Calls', sortable: true },
  { alias: 'status', text: () => <span>Status</span>, sortValue: (row) => row.statusCode },
];
const ROWS: TableRowProps[] = [
  { name: 'beta', calls: 10, status: <b>Live</b>, statusCode: 'LIVE', owner: 'zoe' },
  { name: 'alpha', calls: 2, status: <b>Paused</b>, statusCode: 'PAUSED', owner: 'max' },
  { name: 'gamma, "g"', calls: 33, status: <b>Live</b>, statusCode: 'LIVE', owner: 'ann' },
];

const readFirstColumn = () =>
  Array.from(document.querySelectorAll('tbody tr')).map((row) => row.querySelector('td')?.textContent);
const firstColumn = async () => {
  await waitFor(() => expect(readFirstColumn().every((text) => !!text)).toBe(true));
  return readFirstColumn();
};
/** A saved file's bytes (jsdom's Blob has no arrayBuffer()). */
const readBlob = (blob: Blob) =>
  new Promise<Uint8Array>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.readAsArrayBuffer(blob);
  });
const headers = () => Array.from(document.querySelectorAll('thead th')).map((th) => th.textContent?.trim());
const typeSearch = (testId: string, text: string) => {
  const input = screen.getByTestId(`${testId}-toolbar-search`).querySelector('input') as HTMLInputElement;
  fireEvent.change(input, { target: { value: text } });
};

describe('Table toolbar', () => {
  let savedBlobs: Blob[];
  let download: { name: string } | null;
  beforeEach(() => {
    savedBlobs = [];
    download = null;
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      savedBlobs.push(blob as Blob);
      return 'blob:csv';
    });
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      download = { name: this.download };
    });
  });
  afterEach(() => vi.restoreAllMocks());

  test('off by default: no toolbar, no container test id', async () => {
    render(<Table hideFooter data={{ columns: COLUMNS, collections: ROWS }} />);
    expect(await firstColumn()).toEqual(['beta', 'alpha', 'gamma, "g"']);
    expect(screen.queryByTestId('table-toolbar')).toBeNull();
    expect(document.querySelector('[data-testid="table"]')).toBeNull();
  });

  test('title and actions render; a string title is a heading', () => {
    render(
      <Table
        testId="t"
        hideFooter
        toolbar={{ title: 'Campaigns', actions: <button data-testid="own-action">Add</button> }}
        data={{ columns: COLUMNS, collections: ROWS }}
      />,
    );
    expect(screen.getByTestId('t-toolbar')).toHaveTextContent('Campaigns');
    expect(screen.getByTestId('own-action')).toBeInTheDocument();
    expect(screen.queryByTestId('t-toolbar-search')).toBeNull();
  });

  describe('search', () => {
    test('filters client side over the visible columns (rendered text and sortValue), case-insensitive', async () => {
      render(<Table testId="t" hideFooter toolbar={{ search: true }} data={{ columns: COLUMNS, collections: ROWS }} />);
      typeSearch('t', 'PAUSED');
      expect(await firstColumn()).toEqual(['alpha']);
      typeSearch('t', 'live');
      expect(await firstColumn()).toEqual(['beta', 'gamma, "g"']);
      typeSearch('t', '');
      expect(await firstColumn()).toHaveLength(3);
    });

    test('works with sort and client pagination, back to the first page on a new search', async () => {
      render(
        <Table
          testId="t"
          toolbar={{ search: true }}
          clientPagination={{ pageSize: 1 }}
          defaultSort={{ key: 'calls', direction: 'desc' }}
          data={{ columns: COLUMNS, collections: ROWS }}
        />,
      );
      expect(await firstColumn()).toEqual(['gamma, "g"']);
      fireEvent.click(screen.getByText('Next'));
      expect(await firstColumn()).toEqual(['beta']);
      typeSearch('t', 'a');
      expect(await firstColumn()).toEqual(['gamma, "g"']);
    });

    test('`fields` searches those row keys instead of the columns', async () => {
      render(
        <Table
          testId="t"
          hideFooter
          toolbar={{ search: { fields: ['owner'], placeholder: 'Owner' } }}
          data={{ columns: COLUMNS, collections: ROWS }}
        />,
      );
      typeSearch('t', 'max');
      expect(await firstColumn()).toEqual(['alpha']);
      typeSearch('t', 'alpha');
      await waitFor(() => expect(document.querySelectorAll('tbody tr td').length).toBeLessThanOrEqual(1));
    });

    test('with onChange the caller owns the search: the text is reported, nothing filtered', async () => {
      const onChange = vi.fn();
      render(
        <Table
          testId="t"
          hideFooter
          toolbar={{ search: { onChange } }}
          data={{ columns: COLUMNS, collections: ROWS }}
        />,
      );
      typeSearch('t', 'alpha');
      expect(onChange).toHaveBeenLastCalledWith('alpha');
      expect(await firstColumn()).toHaveLength(3);
    });
  });

  describe('download', () => {
    test('saves the filtered, sorted rows of every page as UTF-8 CSV with a BOM', async () => {
      render(
        <Table
          testId="t"
          toolbar={{ search: true, download: { filename: 'campaigns' } }}
          clientPagination={{ pageSize: 1 }}
          defaultSort={{ key: 'name', direction: 'asc' }}
          data={{ columns: COLUMNS, collections: ROWS }}
        />,
      );
      typeSearch('t', 'live');
      fireEvent.click(screen.getByTestId('t-toolbar-download'));
      expect(download).toEqual({ name: 'campaigns.csv' });
      const bytes = await readBlob(savedBlobs[0]);
      expect(Array.from(bytes.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf]);
      expect(new TextDecoder().decode(bytes.slice(3))).toBe(
        'Name,Calls,Status\r\nbeta,10,LIVE\r\n"gamma, ""g""",33,LIVE',
      );
    });

    test('`columns` picks the exported columns; hidden ones are left out by default', async () => {
      render(
        <Table
          testId="t"
          hideFooter
          toolbar={{ download: true, columnPicker: { defaultHiddenColumns: ['calls'] } }}
          data={{ columns: COLUMNS, collections: ROWS.slice(0, 1) }}
        />,
      );
      fireEvent.click(screen.getByTestId('t-toolbar-download'));
      expect(download).toEqual({ name: 'table.csv' });
      expect(new TextDecoder().decode((await readBlob(savedBlobs[0])).slice(3))).toBe('Name,Status\r\nbeta,LIVE');
    });

    test('csvField quotes separators, quotes, line breaks and edge spaces', () => {
      expect(csvField('plain')).toBe('plain');
      expect(csvField('a,b')).toBe('"a,b"');
      expect(csvField('say "hi"')).toBe('"say ""hi"""');
      expect(csvField('two\nlines')).toBe('"two\nlines"');
      expect(csvField(' padded')).toBe('" padded"');
      expect(rowsToCsv([{ a: 'Zürich' }], [{ alias: 'a', text: 'City' }])).toBe('City\r\nZürich');
    });
  });

  describe('column picker', () => {
    test('hides and shows columns; the last visible column cannot be hidden', async () => {
      const onHiddenColumnsChange = vi.fn();
      render(
        <Table
          testId="t"
          hideFooter
          toolbar={{ columnPicker: { onHiddenColumnsChange } }}
          data={{ columns: COLUMNS, collections: ROWS }}
        />,
      );
      await firstColumn();
      fireEvent.click(screen.getByTestId('t-toolbar-columns'));
      fireEvent.click(await screen.findByTestId('t-toolbar-columns-calls'));
      expect(headers()).toEqual(['Name', 'Status']);
      expect(onHiddenColumnsChange).toHaveBeenLastCalledWith(['calls']);

      fireEvent.click(screen.getByTestId('t-toolbar-columns-name'));
      expect(headers()).toEqual(['Status']);
      expect(screen.getByTestId('t-toolbar-columns-status')).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(screen.getByTestId('t-toolbar-columns-status'));
      expect(headers()).toEqual(['Status']);

      fireEvent.click(screen.getByTestId('t-toolbar-columns-calls'));
      expect(headers()).toEqual(['Calls', 'Status']);
    });

    test('controlled hiddenColumns only change through the callback', async () => {
      const onHiddenColumnsChange = vi.fn();
      render(
        <Table
          testId="t"
          hideFooter
          toolbar={{ columnPicker: { hiddenColumns: ['status'], onHiddenColumnsChange } }}
          data={{ columns: COLUMNS, collections: ROWS }}
        />,
      );
      await firstColumn();
      expect(headers()).toEqual(['Name', 'Calls']);
      fireEvent.click(screen.getByTestId('t-toolbar-columns'));
      fireEvent.click(await screen.findByTestId('t-toolbar-columns-name'));
      expect(onHiddenColumnsChange).toHaveBeenLastCalledWith(['status', 'name']);
      expect(headers()).toEqual(['Name', 'Calls']);
    });
  });
});
