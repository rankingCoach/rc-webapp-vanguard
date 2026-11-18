import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { DataTable, DataTableBody, DataTableCell, DataTableFoot, DataTableHead, DataTableRow } from './DataTable';

const table = (selected: boolean, size?: 'small' | 'medium') => (
  <DataTable size={size}>
    <DataTableHead>
      <DataTableRow>
        <DataTableCell>H</DataTableCell>
      </DataTableRow>
    </DataTableHead>
    <DataTableBody>
      <DataTableRow selected={selected} testId={'r'}>
        <DataTableCell>B</DataTableCell>
      </DataTableRow>
    </DataTableBody>
    <DataTableFoot>
      <DataTableRow>
        <DataTableCell>F</DataTableCell>
      </DataTableRow>
    </DataTableFoot>
  </DataTable>
);

describe('DataTable data-slot contract', () => {
  it('slots every part', () => {
    const { container } = render(table(false));
    expect(container.querySelector('.vanguard-data-table-container')?.getAttribute('data-slot')).toBe(
      'data-table-container',
    );
    expect(container.querySelector('table')?.getAttribute('data-slot')).toBe('data-table');
    expect(container.querySelector('thead')?.getAttribute('data-slot')).toBe('data-table-head');
    expect(container.querySelector('tbody')?.getAttribute('data-slot')).toBe('data-table-body');
    expect(container.querySelector('tfoot')?.getAttribute('data-slot')).toBe('data-table-foot');
    expect(container.querySelectorAll('tr[data-slot="data-table-row"]')).toHaveLength(3);
    expect(container.querySelectorAll('th[data-slot="data-table-cell"], td[data-slot="data-table-cell"]')).toHaveLength(
      3,
    );
  });

  it('data-size and data-selected track props', () => {
    const { container, rerender } = render(table(false));
    expect(container.querySelector('table')?.getAttribute('data-size')).toBe('medium');
    expect(container.querySelector('[data-testid="r"]')?.hasAttribute('data-selected')).toBe(false);
    rerender(table(true, 'small'));
    expect(container.querySelector('table')?.getAttribute('data-size')).toBe('small');
    expect(container.querySelector('[data-testid="r"]')?.getAttribute('data-selected')).toBe('');
  });
});
