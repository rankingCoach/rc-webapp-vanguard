import type { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, within } from 'storybook/test';

import { DataTable, DataTableBody, DataTableCell, DataTableHead, DataTableRow } from './DataTable';

type Story = StoryObj<typeof DataTable>;

const WEEKS = Array.from({ length: 24 }, (_, index) => ({
  week: `2026-W${String(index + 1).padStart(2, '0')}`,
  adopters: 1000 + index * 37,
  reactivated: 80 + index,
  churned: 40 + (index % 7),
}));

export const DenseStatsSticky: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <DataTable size="small" stickyHeader stickyFirstColumn maxHeight="260px" minWidth="560px" aria-label="Cohorts">
        <DataTableHead>
          <DataTableRow>
            <DataTableCell>Week</DataTableCell>
            <DataTableCell numeric>New adopters</DataTableCell>
            <DataTableCell numeric>Reactivated</DataTableCell>
            <DataTableCell numeric>Churned</DataTableCell>
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {WEEKS.map((row) => (
            <DataTableRow key={row.week} hover>
              <DataTableCell header>{row.week}</DataTableCell>
              <DataTableCell numeric>{row.adopters.toLocaleString('en-US')}</DataTableCell>
              <DataTableCell numeric>{row.reactivated}</DataTableCell>
              <DataTableCell numeric>{row.churned}</DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole('columnheader', { name: 'Week' });
    await expect(getComputedStyle(header).position).toBe('sticky');
    const container = canvas.getByTestId('data-table-container');
    container.scrollTop = 200;
    container.scrollLeft = 100;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    // Header row and first column stay pinned to the scroll box.
    await expect(Math.round(header.getBoundingClientRect().top)).toBe(Math.round(container.getBoundingClientRect().top));
    const rowHeader = canvas.getByRole('rowheader', { name: '2026-W10' });
    await expect(Math.round(rowHeader.getBoundingClientRect().left)).toBe(
      Math.round(container.getBoundingClientRect().left),
    );
  },
};

export const EmptyState: Story = {
  render: () => (
    <DataTable size="small">
      <DataTableHead>
        <DataTableRow>
          <DataTableCell>Week</DataTableCell>
          <DataTableCell numeric>New adopters</DataTableCell>
        </DataTableRow>
      </DataTableHead>
      <DataTableBody>
        <DataTableRow>
          <DataTableCell colSpan={2} align="center">
            No complete-week cohort data yet.
          </DataTableCell>
        </DataTableRow>
      </DataTableBody>
    </DataTable>
  ),
};

export const NestedKeyValue: Story = {
  render: () => (
    <DataTable size="small" aria-label="Reseller">
      <DataTableBody>
        <DataTableRow>
          <DataTableCell header muted>
            name
          </DataTableCell>
          <DataTableCell>Example Reseller</DataTableCell>
        </DataTableRow>
        <DataTableRow>
          <DataTableCell header muted>
            settings
          </DataTableCell>
          <DataTableCell>
            <DataTable size="small" testId="nested">
              <DataTableBody>
                <DataTableRow>
                  <DataTableCell header muted>
                    locale
                  </DataTableCell>
                  <DataTableCell>de_DE</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell header muted>
                    currency
                  </DataTableCell>
                  <DataTableCell>EUR</DataTableCell>
                </DataTableRow>
              </DataTableBody>
            </DataTable>
          </DataTableCell>
        </DataTableRow>
      </DataTableBody>
    </DataTable>
  ),
  play: async ({ canvasElement }) => {
    const nested = within(canvasElement).getByTestId('nested');
    await expect(within(nested).getAllByRole('rowheader')).toHaveLength(2);
  },
};

export default {
  ...SbDecorator({
    title: 'Vanguard/DataTable',
    component: DataTable,
  }),
};
