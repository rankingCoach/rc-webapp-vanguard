import '@testing-library/jest-dom/vitest';

import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import { fireEvent, render, screen, waitFor, within } from '../../../test-utils/test-utils';
import { Table, TableColumnProps, TableRowProps } from './Table';

const COLUMNS: TableColumnProps[] = [
  { alias: 'name', text: 'Name', sortable: true },
  { alias: 'calls', text: 'Calls', sortable: true },
  { alias: 'note', text: <em data-testid="node-header">Note</em> },
];
const ROWS: TableRowProps[] = [
  { name: 'beta', calls: 10, note: 'b' },
  { name: 'alpha', calls: 2, note: 'a' },
  { name: 'gamma', calls: 33, note: 'c' },
  { name: 'delta', calls: 4, note: 'd' },
  { name: 'Alpha 10', calls: 1, note: 'e' },
];

/** Text of the first cell of every body row. */
const readFirstColumn = () =>
  Array.from(document.querySelectorAll('tbody tr')).map((row) => row.querySelector('td')?.textContent);
/** Waits for the lazily loaded TableBody (its Suspense fallback is one empty cell). */
const firstColumn = async () => {
  await waitFor(() => expect(readFirstColumn().every((text) => !!text)).toBe(true));
  return readFirstColumn();
};

describe('Table: header rendering, sort, client pagination', () => {
  test('header accepts a string, a ReactNode and a render function; th has scope=col', async () => {
    render(
      <Table
        hideFooter
        data={{
          columns: [...COLUMNS, { alias: 'fn', text: () => <span data-testid="fn-header">Fn</span> }],
          collections: ROWS.slice(0, 1),
        }}
      />,
    );
    expect(screen.getByTestId('node-header')).toBeInTheDocument();
    expect(screen.getByTestId('fn-header')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('scope', 'col');
  });

  test('rerendering with new data shows it in the same render (no state copy lag)', async () => {
    const { rerender } = render(<Table hideFooter data={{ columns: COLUMNS, collections: ROWS.slice(0, 1) }} />);
    expect(await firstColumn()).toEqual(['beta']);
    rerender(<Table hideFooter data={{ columns: COLUMNS, collections: ROWS.slice(1, 2) }} />);
    expect(readFirstColumn()).toEqual(['alpha']);
  });

  test('uncontrolled sort: first click ascending, second descending; numbers numeric, text natural', async () => {
    render(<Table hideFooter data={{ columns: COLUMNS, collections: ROWS }} />);
    expect(await firstColumn()).toEqual(['beta', 'alpha', 'gamma', 'delta', 'Alpha 10']);

    fireEvent.click(screen.getByTestId('table-sort-calls'));
    expect(await firstColumn()).toEqual(['Alpha 10', 'alpha', 'delta', 'beta', 'gamma']);
    expect(screen.getByRole('columnheader', { name: /Calls/ })).toHaveAttribute('aria-sort', 'ascending');

    fireEvent.click(screen.getByTestId('table-sort-calls'));
    expect(await firstColumn()).toEqual(['gamma', 'beta', 'delta', 'alpha', 'Alpha 10']);
    expect(screen.getByRole('columnheader', { name: /Calls/ })).toHaveAttribute('aria-sort', 'descending');
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'none');
    expect(screen.getByRole('columnheader', { name: 'Note' })).not.toHaveAttribute('aria-sort');
  });

  test('controlled sort only changes through onSortChange; sortValue overrides the cell value', async () => {
    const onSortChange = vi.fn();
    render(
      <Table
        hideFooter
        sort={{ key: 'name', direction: 'desc' }}
        onSortChange={onSortChange}
        data={{
          columns: [{ ...COLUMNS[0], sortValue: (row) => row.note }, COLUMNS[1]],
          collections: ROWS,
        }}
      />,
    );
    expect(await firstColumn()).toEqual(['Alpha 10', 'delta', 'gamma', 'beta', 'alpha']);
    fireEvent.click(screen.getByTestId('table-sort-name'));
    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'asc' });
    expect(await firstColumn()).toEqual(['Alpha 10', 'delta', 'gamma', 'beta', 'alpha']);
  });

  test('clientPagination slices the sorted rows and Back/Next page through them', async () => {
    render(
      <Table
        defaultSort={{ key: 'calls', direction: 'asc' }}
        clientPagination={{ pageSize: 2 }}
        data={{ columns: COLUMNS, collections: ROWS }}
      />,
    );
    expect(await firstColumn()).toEqual(['Alpha 10', 'alpha']);
    const footer = document.querySelector('tfoot') as HTMLElement;
    fireEvent.click(within(footer).getByText('Next'));
    expect(await firstColumn()).toEqual(['delta', 'beta']);
    fireEvent.click(within(footer).getByText('Next'));
    expect(await firstColumn()).toEqual(['gamma']);
    fireEvent.click(within(footer).getByText('Back'));
    expect(await firstColumn()).toEqual(['delta', 'beta']);
  });
});
