import { useFormStore } from '@custom-hooks/use-form-store';
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { Input } from '@vanguard/Input/Input';
import React from 'react';
import { useFormStatus } from 'react-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Form } from './Form';

/**
 * F5: a new form on useFormStore with a React 19 action. The Save button reads `useFormStatus()` (no props), the
 * result comes from useActionState through the hook. No react-redux in the form's own code.
 */
export default {
  ...SbDecorator({ title: 'Vanguard/Form/Action (F5)', component: Form }),
};

type Story = StoryObj<typeof Form>;
type Values = { name: string };

const gate: { release?: () => void } = {};

const SaveButton = () => {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} data-pending={pending ? 'true' : 'false'}>
      {pending ? 'Saving…' : 'Save'}
    </button>
  );
};

const ActionForm = () => {
  const form = useFormStore<Values, string>({
    initialValues: { name: 'Ann' },
    inputs: { name: { fieldType: 'Input', validation: { required: true } } },
    action: async (values, previous) => {
      await new Promise<void>((resolve) => {
        gate.release = resolve;
      });
      return `saved ${values.name}${previous ? ` (before: ${previous})` : ''}`;
    },
  });
  return (
    <Form config={form.formConfig as never} action={form.formAction}>
      <div>
        <Input label="Name" field="name" />
      </div>
      <SaveButton />
      <output data-testid="result">{form.result ?? ''}</output>
    </Form>
  );
};

export const SubmitsTypedValuesWithPendingAndResult: Story = {
  render: () => <ActionForm />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByRole('textbox', { name: /^Name/ }), 'e');
    await userEvent.click(c.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(c.getByRole('button').getAttribute('data-pending')).toBe('true'));
    await expect(c.getByRole('button').textContent).toBe('Saving…');
    gate.release?.();
    await waitFor(() => expect(c.getByTestId('result').textContent).toBe('saved Anne'));
    await expect(c.getByRole('button').getAttribute('data-pending')).toBe('false');
  },
};
