import { screen, fireEvent, within } from '@testing-library/react';
import { Button, Form, Input, Select, Textarea, useFormConfig } from '@rankingcoach/vanguard';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { entryFile, installedBundle, isFromNodeModules } from './installed-package';
import { renderWithProviders } from './providers';

describe('installed Vanguard bundle', () => {
  it('resolves the expected packed entry', () => {
    expect(isFromNodeModules).toBe(true);
    expect(entryFile).toContain('/node_modules/@rankingcoach/vanguard/dist/');
    expect(installedBundle).toBe(process.env.BUNDLE === 'wp' ? 'wordpress' : 'default');
  });
  it('renders Button and forwards click events', () => {
    const click = vi.fn();
    renderWithProviders(<Button onClick={click}>Save fixture</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Save fixture' }));
    expect(click).toHaveBeenCalledTimes(1);
  });
  it('renders real Input and forwards native input props and change events', () => {
    const change = vi.fn();
    renderWithProviders(<Input value="before" onChange={change} textFieldProps={{ inputProps: { 'aria-label': 'Fixture input', maxLength: 12 } }} />);
    const input = screen.getByRole('textbox', { name: 'Fixture input' });
    expect(input.getAttribute('maxlength')).toBe('12');
    fireEvent.change(input, { target: { value: 'after' } });
    expect(change).toHaveBeenCalled();
  });
  it('renders Textarea from the installed bundle', () => {
    renderWithProviders(<Textarea value="Fixture biography" rows={3} />);
    expect(screen.getByDisplayValue('Fixture biography').tagName).toBe('TEXTAREA');
  });
  // F3 (both bundles): an Input bound with `field` two components deep, no formconfig prop drilling.
  it('binds an installed Input to the nearest Form by field name', async () => {
    const user = userEvent.setup();
    const slice = createSlice({
      name: 'fixtureForm',
      initialState: { name: '', initialState: { name: '' } },
      reducers: { setName: (s, a: { payload: string }) => ({ ...s, name: a.payload }) },
    });
    const store = configureStore({ reducer: { fixtureForm: slice.reducer } });
    const Row = () => (
      <section>
        <Input field="name" textFieldProps={{ inputProps: { 'aria-label': 'Fixture name' } }} />
      </section>
    );
    const Fixture = () => {
      const { formConfig } = useFormConfig({
        slice: slice.actions as never,
        reducer: ((s: { fixtureForm: { name: string } }) => s.fixtureForm) as never,
        inputs: { name: { fieldType: 'Input' } },
      });
      return (
        <Form config={formConfig}>
          <Row />
        </Form>
      );
    };
    render(
      <Provider store={store}>
        <Fixture />
      </Provider>,
    );
    await user.type(screen.getByRole('textbox', { name: 'Fixture name' }), 'Ann');
    expect(store.getState().fixtureForm.name).toBe('Ann');
  });
  // Select runs on Vanguard's own core in both bundles (WordPress exports it): open, pick an option, read it back.
  it('opens the installed Select and picks an option', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const options = [
      { key: 'a', value: 'apple', title: 'Apple' },
      { key: 'b', value: 'banana', title: 'Banana' },
    ];
    renderWithProviders(<Select options={options} value="apple" translateOptions={false} onChange={change} />);
    const combo = screen.getByRole('combobox');
    expect(combo.getAttribute('data-slot')).toBe('select-trigger');
    await user.click(combo);
    const listbox = await screen.findByRole('listbox');
    await user.click(within(listbox).getByRole('option', { name: 'Banana' }));
    expect(change).toHaveBeenCalledTimes(1);
    expect(change.mock.calls[0][1]).toMatchObject({ value: 'banana' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getByRole('combobox').textContent).toBe('Banana');
  });
});

// WordPress intentionally has no DatePicker export; verify the default installed implementation.
if (process.env.BUNDLE !== 'wp') {
  it('keeps the packed DatePicker synchronized with controlled restores and locale changes', async () => {
    const { DatePicker } = await import('@rankingcoach/vanguard');
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = (query: string) => ({
      matches: query.includes('pointer: fine'), media: query, onchange: null,
      addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
      dispatchEvent: () => false,
    });
    const date = (day: number) => new Date(2024, 2, day).getTime();
    const Controlled = () => {
      const [value, setValue] = useState<number | null | undefined>(date(15));
      const [locale, setLocale] = useState('en_US');
      return <>
        <DatePicker value={value ?? undefined} locale={locale} onChange={setValue} />
        <button onClick={() => setValue(date(22))}>External date</button>
        <button onClick={() => setValue(date(20))}>Restore typed date</button>
        <button onClick={() => setLocale('de_DE')}>Change locale</button>
      </>;
    };
    try {
      const { container } = renderWithProviders(<Controlled />);
      const group = screen.getByRole('group');
      const [month, day] = within(group).getAllByRole('spinbutton');
      expect(within(group).getAllByRole('spinbutton')).toHaveLength(3);
      const input = container.querySelector<HTMLInputElement>('input[aria-hidden="true"]')!;
      expect(input).not.toBeNull();
      month.focus();
      await userEvent.keyboard('/{ArrowRight}');
      expect(input.value).toBe('03/15/2024');
      expect(document.activeElement).toBe(day);
      await userEvent.keyboard('{ArrowLeft}');
      expect(input.value).toBe('03/15/2024');
      expect(document.activeElement).toBe(month);
      fireEvent.paste(month, { clipboardData: { getData: () => '03/20/2024' } });
      expect(input.value).toBe('03/20/2024');
      fireEvent.click(screen.getByRole('button', { name: 'External date' }));
      expect(input.value).toBe('03/22/2024');
      fireEvent.click(screen.getByRole('button', { name: 'Restore typed date' }));
      expect(input.value).toBe('03/20/2024');
      fireEvent.click(screen.getByRole('button', { name: 'Change locale' }));
      expect(input.value).toBe('20.03.2024');
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
}
