import type { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React, { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Autocomplete } from './Autocomplete';

type Story = StoryObj<typeof Autocomplete>;
type Purpose = { name: string; description?: string };

const PURPOSES: Purpose[] = [
  { name: 'onboarding', description: 'First steps' },
  { name: 'seo', description: 'Rankings and keywords' },
  { name: 'reviews' },
];
const SETTLE = { timeout: 5000 };
const findOption = (name: string) => within(document.body).findByRole('option', { name }, SETTLE);

const MultiWithCheckboxes = () => {
  const [value, setValue] = useState<Purpose[]>([PURPOSES[1]]);
  return (
    <div style={{ width: 360 }}>
      <Autocomplete
        testId={'purposes'}
        controlled
        multiple
        disableCloseOnSelect
        showOptionCheckbox
        chipSize={'small'}
        inputAriaLabel={'Purposes'}
        options={PURPOSES}
        value={value}
        getOptionLabel={(purpose: Purpose) => purpose.name}
        isOptionEqualToValue={(option: Purpose, selected: Purpose) => option.name === selected.name}
        onChange={(_event, next) => setValue(next as Purpose[])}
      />
    </div>
  );
};

export const ControlledMultiWithCheckboxes: Story = {
  render: () => <MultiWithCheckboxes />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Purposes' });
    await userEvent.click(input);
    await userEvent.click(await findOption('onboarding'));
    await expect(await findOption('onboarding')).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByTestId('purposes-chip-1')).toHaveTextContent('onboarding');
  },
};

const CustomRows = () => {
  const [value, setValue] = useState<Purpose | null>(null);
  return (
    <div style={{ width: 360 }}>
      <Autocomplete
        testId={'purpose'}
        controlled
        options={PURPOSES}
        value={value}
        getOptionLabel={(purpose: Purpose) => purpose.name}
        isOptionEqualToValue={(option: Purpose, selected: Purpose) => option.name === selected.name}
        renderOption={(optionProps, purpose: Purpose) => (
          <li {...optionProps} key={purpose.name}>
            <div style={{ display: 'grid' }}>
              <strong>{purpose.name}</strong>
              <small>{purpose.description ?? '—'}</small>
            </div>
          </li>
        )}
        onChange={(_event, next) => setValue(next as Purpose | null)}
      />
    </div>
  );
};

export const ControlledSingleWithCustomRows: Story = {
  render: () => <CustomRows />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox') as HTMLInputElement;
    await userEvent.click(input);
    await userEvent.click(await findOption('seo Rankings and keywords'));
    await expect(input.value).toBe('seo');
  },
};

export const Loading: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Autocomplete testId={'loading'} options={[]} loading loadingText={'Loading API accounts…'} openOnFocus />
    </div>
  ),
};

export default {
  ...SbDecorator({
    title: 'Vanguard/Autocomplete/Controlled',
    component: Autocomplete,
    opts: { withRedux: true },
  }),
};
