import { useFormConfig } from '@custom-hooks/useFormConfig';
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { Input } from '@vanguard/Input/Input';
import { Select } from '@vanguard/Select/Select';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { Form, FormStatus } from './Form';
import { FormRootState, FormSLice, formStore } from './stories/bootstrap/form.test.slice';

/**
 * F3: inputs bound with `field` through the nearest Form's context. The inputs live two custom components deep;
 * nothing passes `formconfig` down.
 */
export default {
  ...SbDecorator({ title: 'Vanguard/Form/Field Binding', component: Form, opts: { customStore: formStore } }),
};

type Story = StoryObj<typeof Form>;

const Card = (props: { title: string; children: React.ReactNode }) => (
  <section style={{ border: '1px solid var(--fn-brd-gl)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
    <h3 style={{ marginTop: 0 }}>{props.title}</h3>
    {props.children}
  </section>
);

const ProfileFields = () => (
  <Card title="Profile">
    <Input label="Text" field="textValue" testId="text-field" />
  </Card>
);

const CmsFields = () => (
  <Card title="Website">
    <Select
      label="CMS"
      field="selectedCMS"
      translateOptions={false}
      options={[
        { key: 'wp', value: 'WordPress', title: 'WordPress' },
        { key: 'jo', value: 'Joomla', title: 'Joomla' },
      ]}
    />
  </Card>
);

export const DeepNestedFieldsWithoutPropDrilling: Story = {
  render: () => {
    const [status, setStatus] = useState<FormStatus<unknown> | null>(null);
    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((s: FormRootState) => s.form) as never,
      inputs: {
        textValue: { fieldType: 'Input', validation: { required: true, minLength: 3 } },
        selectedCMS: { fieldType: 'Select' },
      },
    });
    const stored = useSelector((s: FormRootState) => s.form);
    return (
      <div style={{ maxWidth: 420 }}>
        <Form config={formConfig} onChange={setStatus}>
          <ProfileFields />
          <CmsFields />
        </Form>
        <p data-testid="stored">{`${stored.textValue}|${stored.selectedCMS}`}</p>
        <p data-testid="status">{`${status?.hasChanges}|${status?.isValid}|${status?.currentConfig?.stateFieldName ?? ''}`}</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvasElement.querySelector<HTMLInputElement>('[data-testid="text-field"] input')!;
    await userEvent.clear(input);
    await userEvent.type(input, 'Hi');
    await waitFor(() => expect(canvas.getByTestId('status')).toHaveTextContent('true|false|textValue'));
    await userEvent.type(input, '!');
    await waitFor(() => expect(canvas.getByTestId('status')).toHaveTextContent('true|true|textValue'));
    await userEvent.click(canvas.getByRole('combobox'));
    await userEvent.click(within(await screen.findByRole('listbox')).getByRole('option', { name: 'Joomla' }));
    await waitFor(() => expect(canvas.getByTestId('stored')).toHaveTextContent('Hi!|Joomla'));
  },
};
