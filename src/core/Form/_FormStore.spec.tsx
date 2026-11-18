import { useFormStore } from '@custom-hooks/use-form-store';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckBox } from '@vanguard/CheckBox/CheckBox';
import { Form } from '@vanguard/Form/Form';
import { Input } from '@vanguard/Input/Input';
import React from 'react';
import { describe, expect, it } from 'vitest';

/**
 * F4: a Redux-free per-form store behind the F1 seam. No react-redux Provider anywhere in these renders (plain
 * @testing-library render, not the redux-wrapped test-utils one).
 */
type Values = { name: string; agree: boolean; tags: string[] };
const initialValues: Values = { name: 'Ann', agree: false, tags: ['a', 'b'] };

let api: ReturnType<typeof useFormStore<Values>> | undefined;

const FieldForm = () => {
  const form = useFormStore<Values>({
    initialValues,
    inputs: {
      name: { fieldType: 'Input', validation: { required: true, minLength: 2 } },
      agree: { fieldType: 'Checkbox' },
    },
  });
  api = form;
  return (
    <Form config={form.formConfig as never}>
      <div>
        <Input label="Name" field="name" />
        <CheckBox label="Agree" field="agree" />
      </div>
      <output data-testid="values">{JSON.stringify(form.values)}</output>
    </Form>
  );
};

const LegacyChildForm = () => {
  const form = useFormStore<Values>({ initialValues, inputs: { name: { fieldType: 'Input' } } });
  api = form;
  return (
    <Form config={form.formConfig as never}>
      <Input label="Name" formconfig={form.formConfig.name} />
      <output data-testid="values">{JSON.stringify(form.values)}</output>
    </Form>
  );
};

const ArrayForm = () => {
  const form = useFormStore<Values>({ initialValues, inputs: { tags: { fieldType: 'Input', isArray: true } } });
  api = form;
  return (
    <Form config={form.formConfig as never}>
      <Input label="Tag 1" formconfig={form.formConfig.tags} />
      <Input label="Tag 2" formconfig={form.formConfig.tags} />
      <output data-testid="values">{JSON.stringify(form.values)}</output>
    </Form>
  );
};

const ArrayFieldForm = () => {
  const form = useFormStore<Values>({ initialValues, inputs: { tags: { fieldType: 'Input', isArray: true } } });
  api = form;
  return (
    <Form config={form.formConfig as never}>
      <div>
        <Input label="Tag 2" field="tags" index={1} />
      </div>
      <output data-testid="values">{JSON.stringify(form.values)}</output>
    </Form>
  );
};

const values = () => JSON.parse(screen.getByTestId('values').textContent ?? '{}') as Values;

describe('useFormStore (F4)', () => {
  it('binds a field-path Input to the store without any react-redux Provider', async () => {
    const user = userEvent.setup();
    render(<FieldForm />);
    const input = screen.getByRole('textbox', { name: /^Name/ }) as HTMLInputElement;
    expect(input.value).toBe('Ann');
    await user.clear(input);
    await user.type(input, 'Bob');
    expect(values().name).toBe('Bob');
    expect(api?.getData().name).toBe('Bob');
  });

  it('CheckBox on the field path stores a boolean', async () => {
    const user = userEvent.setup();
    render(<FieldForm />);
    await user.click(screen.getByRole('checkbox'));
    expect(values().agree).toBe(true);
  });

  it('isValid runs the field validation; getChangedData returns only dirty fields', async () => {
    const user = userEvent.setup();
    render(<FieldForm />);
    const input = screen.getByRole('textbox', { name: /^Name/ });
    await user.clear(input);
    await user.type(input, 'B');
    expect(api?.isValid()).toBe(false);
    await user.type(input, 'o');
    expect(api?.isValid()).toBe(true);
    expect(api?.getChangedData()).toEqual({ name: 'Bo' });
  });

  it('works with an explicit formconfig child (legacy child-walking path)', async () => {
    const user = userEvent.setup();
    render(<LegacyChildForm />);
    await user.type(screen.getByRole('textbox', { name: /^Name/ }), '!');
    expect(values().name).toBe('Ann!');
  });

  it.each([
    ['legacy isArray children', ArrayForm],
    ['F3 field + index', ArrayFieldForm],
  ])('array fields write one element through setStateValueArray (%s)', async (_name, Component) => {
    const user = userEvent.setup();
    render(<Component />);
    const input = screen.getByRole('textbox', { name: /Tag 2/ }) as HTMLInputElement;
    expect(input.value).toBe('b');
    await user.type(input, '2');
    expect(values().tags).toEqual(['a', 'b2']);
  });

  it('resetForm restores the initial values', async () => {
    const user = userEvent.setup();
    render(<FieldForm />);
    await user.type(screen.getByRole('textbox', { name: /^Name/ }), 'x');
    expect(values().name).toBe('Annx');
    api?.resetForm();
    await screen.findByText(/"name":"Ann"/);
  });
});
