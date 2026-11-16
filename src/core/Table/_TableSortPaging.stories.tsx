import type { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Table, TableColumnProps, TableRowProps } from './Table';

type Story = StoryObj<typeof Table>;

const COLUMNS: TableColumnProps[] = [
  { alias: 'model', text: 'Model', sortable: true },
  { alias: 'calls', text: 'Calls', sortable: true },
  { alias: 'cost', text: () => <strong>Cost (USD)</strong>, sortable: true, sortValue: (row) => row.costValue },
];
const ROWS: TableRowProps[] = [
  { model: 'gpt-mini', calls: 1200, cost: '$12.00', costValue: 12 },
  { model: 'claude-haiku', calls: 300, cost: '$4.50', costValue: 4.5 },
  { model: 'claude-sonnet', calls: 90, cost: '$27.10', costValue: 27.1 },
  { model: 'gemini-flash', calls: 15, cost: '$0.40', costValue: 0.4 },
  { model: 'mistral-small', calls: 640, cost: '$3.20', costValue: 3.2 },
];

const firstColumn = (canvasElement: HTMLElement) =>
  Array.from(canvasElement.querySelectorAll('tbody tr')).map((row) => row.querySelector('td')?.textContent);

export const SortAndClientPagination: Story = {
  render: () => (
    <Table
      defaultSort={{ key: 'calls', direction: 'desc' }}
      clientPagination={{ pageSize: 3 }}
      data={{ columns: COLUMNS, collections: ROWS }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(firstColumn(canvasElement)).toEqual(['gpt-mini', 'mistral-small', 'claude-haiku']));
    await userEvent.click(canvas.getByTestId('table-sort-cost'));
    await waitFor(() => expect(firstColumn(canvasElement)).toEqual(['gemini-flash', 'mistral-small', 'claude-haiku']));
    await userEvent.click(canvas.getByText('Next'));
    await waitFor(() => expect(firstColumn(canvasElement)).toEqual(['gpt-mini', 'claude-sonnet']));
  },
};

export default {
  ...SbDecorator({
    title: 'Vanguard/Table/Sort and client pagination',
    component: Table,
  }),
};
