import {StoryObj} from '@storybook/react';
import {Table, TableProps, TableDataProps, TableColumnProps, TableRowProps} from '../Table';
import {fn, within, expect, waitFor} from 'storybook/test';


// Story type
export type Story = StoryObj<typeof Table>;

// Mock data

export const mockColumns: TableColumnProps[] = [
  {alias: 'name', text: 'Name', styles: {minWidth: 160}},
  {alias: 'email', text: 'Email', styles: {minWidth: 160}},
  {alias: 'role', text: 'Role', styles: {minWidth: 160}},
  {alias: 'status', text: 'Status', styles: {minWidth: 160}},
  {alias: 'age', text: 'Age', styles: {minWidth: 160}},
];

export const mockRows: TableRowProps[] = [
  {name: 'John Doe', email: 'john@example.com', role: 'Developer', status: 'Active', age: "23"},
  {name: 'Jane Smith', email: 'jane@example.com', role: 'Designer', status: 'Active', age: "42"},
  {name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager', status: 'Inactive', age: "34"},
  {name: 'Alice Brown', email: 'alice@example.com', role: 'Developer', status: 'Active', age: "26"},
  {name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Designer', status: 'Active', age: "54"},
];

export const mockData: TableDataProps = {
  columns: mockColumns,
  collections: mockRows,
};

export const manyRows: TableRowProps[] = [
  ...mockRows,
  {name: 'David Lee', email: 'david@example.com', role: 'Developer', status: 'Active', age: "25"},
  {name: 'Eva Garcia', email: 'eva@example.com', role: 'Designer', status: 'Active', age: "37"},
  {name: 'Frank Miller', email: 'frank@example.com', role: 'Manager', status: 'Inactive', age: "45"},
  {name: 'Grace Taylor', email: 'grace@example.com', role: 'Developer', status: 'Active', age: "23"},
  {name: 'Henry Davis', email: 'henry@example.com', role: 'Designer', status: 'Active', age: "23"},
];

export const manyRowsData: TableDataProps = {
  columns: mockColumns,
  collections: manyRows,
};

// Default props
export const defaultProps: TableProps = {
  data: mockData,
};

// Mock functions for pagination
export const mockOnNextPage = fn();
export const mockOnPrevPage = fn();
export const mockOnShowMore = fn();
export const mockOnShowLess = fn();

/**
 * Generic table test
 */
export const tableTest =
  async ({
           canvasElement,
           expectedRows,
           expectedColumns,
           exactRowCount = true,
         }: {
    canvasElement: HTMLElement;
    expectedRows: number;
    expectedColumns: number;
    exactRowCount?: boolean;
  }) => {
    const canvas = within(canvasElement);

    // Wait for table to appear
    const table = await canvas.findByRole('table');
    await expect(table).toBeInTheDocument();

    // Wait for headers
    const headers = await canvas.findAllByRole('columnheader');
    await expect(headers).toHaveLength(expectedColumns);

    // Now wait for the real body rows (not the Suspense fallback)
    await waitFor(() => {
      const bodyRows = table.querySelectorAll('tbody tr');

      if (exactRowCount) {
        expect(bodyRows.length).toBe(expectedRows);
      } else {
        expect(bodyRows.length).toBeGreaterThanOrEqual(expectedRows);
      }
    }, { timeout: 5000 });
  };