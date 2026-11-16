import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen, within } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import { DataTable, DataTableBody, DataTableCell, DataTableFoot, DataTableHead, DataTableRow } from './DataTable';

describe('DataTable', () => {
  test('head cells are th scope=col, body row labels are th scope=row, data cells td', () => {
    render(
      <DataTable size="small" aria-label="Cohorts">
        <DataTableHead>
          <DataTableRow>
            <DataTableCell>Week</DataTableCell>
            <DataTableCell numeric>New adopters</DataTableCell>
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          <DataTableRow hover testId="row-1">
            <DataTableCell header>2026-11-02</DataTableCell>
            <DataTableCell numeric testId="value">
              1,204
            </DataTableCell>
          </DataTableRow>
        </DataTableBody>
        <DataTableFoot>
          <DataTableRow>
            <DataTableCell header>Total</DataTableCell>
            <DataTableCell numeric>1,204</DataTableCell>
          </DataTableRow>
        </DataTableFoot>
      </DataTable>,
    );
    const table = screen.getByRole('table', { name: 'Cohorts' });
    const columnHeaders = within(table).getAllByRole('columnheader');
    expect(columnHeaders.map((cell) => cell.textContent)).toEqual(['Week', 'New adopters']);
    for (const cell of columnHeaders) expect(cell).toHaveAttribute('scope', 'col');
    const rowHeader = within(table).getByRole('rowheader', { name: '2026-11-02' });
    expect(rowHeader.tagName).toBe('TH');
    expect(rowHeader).toHaveAttribute('scope', 'row');
    expect(screen.getByTestId('value').tagName).toBe('TD');
    expect(within(table).getByRole('rowheader', { name: 'Total' })).toBeInTheDocument();
  });

  test('colSpan / rowSpan / align / className reach the cell', () => {
    render(
      <DataTable>
        <DataTableBody>
          <DataTableRow>
            <DataTableCell colSpan={4} align="center" className="state-box" testId="empty">
              No data yet.
            </DataTableCell>
          </DataTableRow>
        </DataTableBody>
      </DataTable>,
    );
    const cell = screen.getByTestId('empty');
    expect(cell).toHaveAttribute('colspan', '4');
    expect(cell).toHaveClass('state-box');
  });

  test('sticky options and maxHeight land on the table and its scroll wrapper', () => {
    render(<DataTable stickyHeader stickyFirstColumn maxHeight="320px" minWidth="720px" testId="stats" />);
    expect(screen.getByTestId('stats-container')).toHaveStyle({ maxHeight: '320px' });
    expect(screen.getByTestId('stats')).toHaveStyle({ minWidth: '720px' });
    expect(screen.getByTestId('stats').className).toMatch(/stickyHeader/);
    expect(screen.getByTestId('stats').className).toMatch(/stickyFirstColumn/);
  });

  test('rows can be clickable and selected', () => {
    const onClick = vi.fn();
    render(
      <DataTable>
        <DataTableBody>
          <DataTableRow onClick={onClick} selected testId="row">
            <DataTableCell>A</DataTableCell>
          </DataTableRow>
        </DataTableBody>
      </DataTable>,
    );
    fireEvent.click(screen.getByTestId('row'));
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByTestId('row')).toHaveAttribute('aria-selected', 'true');
  });

  test('a nested key/value table keeps its own header semantics', () => {
    render(
      <DataTable testId="outer">
        <DataTableBody>
          <DataTableRow>
            <DataTableCell header muted>
              settings
            </DataTableCell>
            <DataTableCell>
              <DataTable size="small" testId="inner">
                <DataTableBody>
                  <DataTableRow>
                    <DataTableCell header muted>
                      locale
                    </DataTableCell>
                    <DataTableCell>de_DE</DataTableCell>
                  </DataTableRow>
                </DataTableBody>
              </DataTable>
            </DataTableCell>
          </DataTableRow>
        </DataTableBody>
      </DataTable>,
    );
    const inner = screen.getByTestId('inner');
    expect(within(inner).getByRole('rowheader', { name: 'locale' })).toHaveAttribute('scope', 'row');
    expect(within(inner).getByRole('cell', { name: 'de_DE' })).toBeInTheDocument();
  });
});
