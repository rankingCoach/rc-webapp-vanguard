import { useFormStore } from '@custom-hooks/use-form-store';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from '@vanguard/Form/Form';
import { Input } from '@vanguard/Input/Input';
import React from 'react';
import { useFormStatus } from 'react-dom';
import { describe, expect, it, vi } from 'vitest';

/** F5: React 19 actions on the useFormStore path only (no react-redux Provider in these renders). */
type Values = { name: string };

const PendingProbe = () => {
  const { pending } = useFormStatus();
  return <span data-testid="pending">{pending ? 'pending' : 'idle'}</span>;
};

let release: (() => void) | undefined;
const action = vi.fn(async (values: Values, previous: string | undefined) => {
  await new Promise<void>((resolve) => {
    release = resolve;
  });
  return `saved ${values.name} after ${previous ?? 'nothing'}`;
});

const ActionForm = (props: { minLength?: number }) => {
  const form = useFormStore<Values, string>({
    initialValues: { name: 'Ann' },
    inputs: { name: { fieldType: 'Input', validation: { minLength: props.minLength ?? 1 } } },
    action,
  });
  return (
    <Form config={form.formConfig as never} action={form.formAction}>
      <div>
        <Input label="Name" field="name" />
      </div>
      <PendingProbe />
      <button type="submit">{'Save'}</button>
      <output data-testid="result">{form.result ?? ''}</output>
    </Form>
  );
};

const LegacyForm = () => (
  <Form>
    <span>{'legacy'}</span>
  </Form>
);

describe('Form action (F5)', () => {
  it('keeps the legacy host: no <form> element without an action', () => {
    const { container } = render(<LegacyForm />);
    expect(container.querySelector('form')).toBeNull();
    expect(container.firstElementChild?.classList.contains('Form-container')).toBe(true);
  });

  it('submits typed store values to the action, then returns the result', async () => {
    action.mockClear();
    const user = userEvent.setup();
    const { container } = render(<ActionForm />);
    expect(container.querySelector('.Form-container > form')).not.toBeNull();
    await user.type(screen.getByRole('textbox', { name: /^Name/ }), 'e');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(action).toHaveBeenCalledTimes(1);
    expect(action.mock.calls[0][0]).toEqual({ name: 'Anne' });
    // Pending (useFormStatus) is asserted in a real browser: _FormAction.stories.tsx. jsdom does not commit the
    // form's host-transition state reliably.
    await act(async () => release?.());
    expect(screen.getByTestId('result').textContent).toBe('saved Anne after nothing');
  });

  it('does not run the action while a field is invalid', async () => {
    action.mockClear();
    const user = userEvent.setup();
    render(<ActionForm minLength={5} />);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(action).not.toHaveBeenCalled();
  });
});
