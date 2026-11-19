import type { StoryObj } from '@storybook/react';
import { baseStore } from '@stores/redux-base.store';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import React, { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Table, TableColumnProps, TableRowProps } from './Table';

type Story = StoryObj<typeof Table>;

const COLUMNS: TableColumnProps[] = [
  { alias: 'model', text: 'Model', sortable: true },
  { alias: 'calls', text: 'Calls', sortable: true },
  { alias: 'cost', text: () => <strong>Cost (USD)</strong>, sortable: true, sortValue: (row) => row.costValue },
  { alias: 'vendor', text: 'Vendor' },
];
const ROWS: TableRowProps[] = [
  { model: 'gpt-mini', calls: 1200, cost: '$12.00', costValue: 12, vendor: 'OpenAI' },
  { model: 'claude-haiku', calls: 300, cost: '$4.50', costValue: 4.5, vendor: 'Anthropic' },
  { model: 'claude-sonnet', calls: 90, cost: '$27.10', costValue: 27.1, vendor: 'Anthropic' },
  { model: 'gemini-flash', calls: 15, cost: '$0.40', costValue: 0.4, vendor: 'Google' },
  { model: 'mistral-small', calls: 640, cost: '$3.20', costValue: 3.2, vendor: 'Mistral' },
];

const firstColumn = (canvasElement: HTMLElement) =>
  Array.from(canvasElement.querySelectorAll('tbody tr')).map((row) => row.querySelector('td')?.textContent);
const headers = (canvasElement: HTMLElement) =>
  Array.from(canvasElement.querySelectorAll('thead th')).map((th) => th.textContent?.trim());

/** Without `toolbar` the Table renders exactly as before: no toolbar. */
export const Off: Story = {
  render: () => <Table testId="models" hideFooter data={{ columns: COLUMNS, collections: ROWS }} />,
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(firstColumn(canvasElement)).toHaveLength(5));
    expect(canvasElement.querySelector('[data-testid="models-toolbar"]')).toBeNull();
  },
};

export const Search: Story = {
  render: () => (
    <Table
      testId="models"
      toolbar={{ search: { placeholder: 'Search models' } }}
      clientPagination={{ pageSize: 3 }}
      data={{ columns: COLUMNS, collections: ROWS }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('models-toolbar-search').querySelector('input') as HTMLInputElement;
    await userEvent.type(input, 'anthropic');
    await waitFor(() => expect(firstColumn(canvasElement)).toEqual(['claude-haiku', 'claude-sonnet']));
  },
};

export const Download: Story = {
  render: () => (
    <Table
      testId="models"
      toolbar={{ download: { filename: 'models' } }}
      clientPagination={{ pageSize: 3 }}
      data={{ columns: COLUMNS, collections: ROWS }}
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId('models-toolbar-download')).toBeInTheDocument();
  },
};

export const ColumnPicker: Story = {
  render: () => (
    <Table
      testId="models"
      hideFooter
      toolbar={{ columnPicker: { defaultHiddenColumns: ['vendor'] } }}
      data={{ columns: COLUMNS, collections: ROWS }}
    />
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(headers(canvasElement)).toEqual(['Model', 'Calls', 'Cost (USD)']));
    await userEvent.click(within(canvasElement).getByTestId('models-toolbar-columns'));
    await userEvent.click(await within(document.body).findByTestId('models-toolbar-columns-vendor'));
    await waitFor(() => expect(headers(canvasElement)).toEqual(['Model', 'Calls', 'Cost (USD)', 'Vendor']));
  },
};

/** Every control, with a title and the caller's own action. */
export const Everything: Story = {
  render: () => (
    <Table
      testId="models"
      toolbar={{
        title: 'AI models',
        actions: (
          <Button testId="models-add" type={ButtonTypes.primary} size={ButtonSizes.medium}>
            {'Add model'}
          </Button>
        ),
        search: true,
        download: { filename: 'models' },
        columnPicker: true,
      }}
      defaultSort={{ key: 'calls', direction: 'desc' }}
      clientPagination={{ pageSize: 3 }}
      data={{ columns: COLUMNS, collections: ROWS }}
    />
  ),
};

/** Server-side paging: the caller owns the search text (`onChange`) and loads the matching rows itself. */
const ServerSideSearchDemo = () => {
  const [text, setText] = useState('');
  const rows = ROWS.filter((row) => row.model.includes(text.toLowerCase()));
  return (
    <Table
      testId="models"
      hideFooter
      toolbar={{ search: { value: text, onChange: setText, placeholder: 'Search on the server' }, download: true }}
      data={{ columns: COLUMNS, collections: rows }}
    />
  );
};

export const ServerSideSearch: Story = {
  render: () => <ServerSideSearchDemo />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByTestId('models-toolbar-search').querySelector('input') as HTMLInputElement;
    await userEvent.type(input, 'claude');
    await waitFor(() => expect(firstColumn(canvasElement)).toEqual(['claude-haiku', 'claude-sonnet']));
  },
};

export default {
  ...SbDecorator({
    title: 'Vanguard/Table/Toolbar',
    component: Table,
    // Input and CheckBox (search, column picker) read the Redux store
    opts: { customStore: baseStore },
  }),
};
