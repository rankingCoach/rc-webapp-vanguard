import React from 'react';
import { Form, FormStatus } from '@vanguard/Form/Form';
import { Select, SelectOptionProp } from '@vanguard/Select/Select';
import { useFormConfig } from '@custom-hooks/useFormConfig';
import { within, expect, userEvent } from 'storybook/test';
import { FormRootState, FormSLice } from './bootstrap/form.test.slice';
import { Story, waitForFormUpdate } from './_Form.default';

const cmsOptions: SelectOptionProp[] = [
  { key: 0, value: 'WordPress', title: 'WordPress' },
  { key: 1, value: 'Drupal', title: 'Drupal' },
  { key: 2, value: 'Wix', title: 'Wix' },
];

export const SelectChangeDetection: Story = {
  render: () => {
    const [lastStatus, setLastStatus] = React.useState<FormStatus<any> | null>(null);

    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((s: FormRootState) => s.form) as any,
      inputs: {
        selectedCMS: {
          fieldType: 'Select',
        },
      },
    });

    const handleFormChange = (status: FormStatus<any>) => {
      setLastStatus(status);
    };

    return (
      <div data-testid="select-change-detection-test">
        <Form config={formConfig} onChange={handleFormChange}>
          <div data-testid="cms-select-wrapper">
            <Select
              label="CMS Platform"
              options={cmsOptions}
              value="WordPress"
              formconfig={formConfig.selectedCMS}
              translateOptions={false}
            />
          </div>
        </Form>
        <div data-testid="status-display" style={{ marginTop: 16, fontFamily: 'monospace', fontSize: 13 }}>
          <p>
            hasChanges: <span data-testid="has-changes">{lastStatus?.hasChanges?.toString() ?? 'null'}</span>
          </p>
          <p>
            isValid: <span data-testid="is-valid">{lastStatus?.isValid?.toString() ?? 'null'}</span>
          </p>
          <p>
            currentConfig stateFieldName:{' '}
            <span data-testid="current-field">{lastStatus?.currentConfig?.stateFieldName ?? 'null'}</span>
          </p>
          <p>
            currentConfig stateValue:{' '}
            <span data-testid="status-value">{lastStatus?.currentConfig?.stateValue ?? 'null'}</span>
          </p>
          <p>
            currentConfig getValue():{' '}
            <span data-testid="get-value">{lastStatus?.currentConfig?.getValue?.() ?? 'null'}</span>
          </p>
          <p>
            currentConfig getInitialValue():{' '}
            <span data-testid="get-initial-value">{lastStatus?.currentConfig?.getInitialValue?.() ?? 'null'}</span>
          </p>
          <p>
            inputsChanges:{' '}
            <span data-testid="inputs-changes">{JSON.stringify(lastStatus?.inputsChanges ?? {})}</span>
          </p>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for initial render and form mount
    await waitForFormUpdate(300);

    // Verify initial state - hasChanges should be false or null before any interaction
    const initialHasChanges = canvas.getByTestId('has-changes').textContent;
    console.log('[Test] Initial hasChanges:', initialHasChanges);

    // --- FIRST CHANGE: WordPress → Drupal ---
    const selectWrapper = canvas.getByTestId('cms-select-wrapper');
    const selectButton = within(selectWrapper).getByRole('combobox');
    await userEvent.click(selectButton);
    await waitForFormUpdate(200);

    const drupalListbox = await within(canvasElement.ownerDocument.body).findByRole('listbox');
    const drupalOption = await within(drupalListbox).findByText('Drupal');
    await userEvent.click(drupalOption);
    await waitForFormUpdate(500);

    // Assert after first change
    const hasChangesAfterFirst = canvas.getByTestId('has-changes').textContent;
    const getValueAfterFirst = canvas.getByTestId('get-value').textContent;
    const getInitialValueAfterFirst = canvas.getByTestId('get-initial-value').textContent;
    const statusValueAfterFirst = canvas.getByTestId('status-value').textContent;

    console.log('[Test] After 1st change (WordPress → Drupal):');
    console.log('  hasChanges:', hasChangesAfterFirst);
    console.log('  getValue():', getValueAfterFirst);
    console.log('  getInitialValue():', getInitialValueAfterFirst);
    console.log('  stateValue:', statusValueAfterFirst);

    // This assertion is expected to FAIL if the bug is in Vanguard's Form
    await expect(canvas.getByTestId('has-changes')).toHaveTextContent('true');

    // --- SECOND CHANGE: Drupal → Wix ---
    await userEvent.click(selectButton);
    await waitForFormUpdate(200);

    const listbox = await within(canvasElement.ownerDocument.body).findByRole('listbox');
    const wixOption = await within(listbox).findByText('Wix');
    await userEvent.click(wixOption);
    await waitForFormUpdate(500);

    // Assert after second change
    const hasChangesAfterSecond = canvas.getByTestId('has-changes').textContent;
    const getValueAfterSecond = canvas.getByTestId('get-value').textContent;
    const statusValueAfterSecond = canvas.getByTestId('status-value').textContent;

    console.log('[Test] After 2nd change (Drupal → Wix):');
    console.log('  hasChanges:', hasChangesAfterSecond);
    console.log('  getValue():', getValueAfterSecond);
    console.log('  stateValue:', statusValueAfterSecond);

    await expect(canvas.getByTestId('has-changes')).toHaveTextContent('true');
  },
};
