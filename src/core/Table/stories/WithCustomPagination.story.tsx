import { Button, ButtonTypes } from '@vanguard/Button';
import { Select, SelectOnChange, SelectOptionProp } from '@vanguard/Select';
import React, { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Table } from '../Table';
import { mockColumns, Story, tableTest } from './_Table.default';

const totalRows = 45;

const customPaginationRows = Array.from({ length: totalRows }, (_, index) => ({
  name: `User ${index + 1}`,
  email: `user${index + 1}@example.com`,
  role: index % 3 === 0 ? 'Developer' : index % 3 === 1 ? 'Designer' : 'Manager',
  status: index % 4 === 0 ? 'Inactive' : 'Active',
  age: String(22 + (index % 25)),
}));

const rowsPerPageOptions: SelectOptionProp[] = [
  { key: 5, value: 5, title: '5' },
  { key: 10, value: 10, title: '10' },
  { key: 25, value: 25, title: '25' },
];

const CustomPaginationTable = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const total = customPaginationRows.length;
  const maxPage = Math.max(1, Math.ceil(total / rowsPerPage));
  const safePage = Math.min(page, maxPage);
  const offset = (safePage - 1) * rowsPerPage;
  const visibleRows = customPaginationRows.slice(offset, offset + rowsPerPage);
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + rowsPerPage, total);

  const handleRowsPerPageChange: SelectOnChange = (event) => {
    const nextRowsPerPage = Number(event.target.value);
    setRowsPerPage(nextRowsPerPage);
    setPage(1);
  };

  return (
    <div style={{ width: '100%' }}>
      <Table
        hideFooter
        data={{
          columns: mockColumns,
          collections: visibleRows,
        }}
        pagination={{
          total,
          limit: rowsPerPage,
          offset,
          page: safePage,
          minPage: 1,
          maxPage,
          step: 1,
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px',
          marginTop: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: '140px' }}>
          <Select
            label={'Rows per page'}
            labelType={'outer'}
            options={rowsPerPageOptions}
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            translateOptions={false}
          />
        </div>

        <span aria-label="pagination-range">
          {from}-{to} of {total}
        </span>

        <Button
          type={ButtonTypes.secondary}
          disabled={safePage === 1}
          onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
        >
          Back
        </Button>

        <Button
          type={ButtonTypes.secondary}
          disabled={safePage === maxPage}
          onClick={() => setPage((currentPage) => Math.min(currentPage + 1, maxPage))}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export const WithCustomPagination: Story = {
  render: () => <CustomPaginationTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await tableTest({
      canvasElement,
      expectedRows: 10,
      expectedColumns: mockColumns.length,
    });

    await expect(canvas.getByText('1-10 of 45')).toBeInTheDocument();
    await expect(canvas.getByText('User 1')).toBeInTheDocument();
    await expect(canvas.queryByText('User 11')).toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));

    await expect(canvas.getByText('11-20 of 45')).toBeInTheDocument();
    await expect(canvas.getByText('User 11')).toBeInTheDocument();
    await expect(canvas.queryByText('User 1')).toBeNull();
  },
};

export default WithCustomPagination;
