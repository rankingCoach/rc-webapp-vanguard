import { useFormStore } from '@custom-hooks/use-form-store';
import { TextField as FrozenMuiTextField } from '@mui/material';
import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { createRef, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { OwnAutocomplete } from '../../../primitives/react/Autocomplete/Autocomplete';
import { DateRangePickerIMaskInput } from '../../DateRangePicker/DateRangePickerIMaskInput';
import { Form } from '../../Form/Form';
import { Input } from '../../Input/Input';
import { PhoneNumberIMask } from '../../PhoneNumber/PhoneNumberIMask/PhoneNumberIMask';
import type { VanguardTextFieldProps } from '../mui-legacy-props';
import { MuiTextField } from './MuiTextField';

// The reference imports MUI 9.5 directly and receives the v9 slots. It never uses the Vanguard router.
const Reference = ({ InputProps, inputProps, InputLabelProps, ...props }: VanguardTextFieldProps) => (
  <FrozenMuiTextField
    {...props}
    slotProps={{ input: InputProps, htmlInput: inputProps, inputLabel: InputLabelProps }}
  />
);

type Field = React.ComponentType<VanguardTextFieldProps>;
type CustomInput = NonNullable<NonNullable<VanguardTextFieldProps['InputProps']>['inputComponent']>;
// The reachable wrappers supply these named mask controls through the legacy MUI input slot.
const DateMask = DateRangePickerIMaskInput as unknown as CustomInput;
const PhoneMask = PhoneNumberIMask as unknown as CustomInput;

type MaskHarnessProps = {
  kind: 'phone' | 'date';
  onCheck: (invalid: boolean, focusedControl: Element | null) => void;
};

const RegisteredMaskHarness = ({ kind, onCheck }: MaskHarnessProps) => {
  const form = useFormStore({
    initialValues: { mask: '' },
    inputs: { mask: { fieldType: 'Input', validation: { required: true, minLength: 20 } } },
  });
  const focusInvalid = () => {
    const invalid = !form.isValid();
    if (!invalid) {
      onCheck(false, null);
      return;
    }
    // FormElement registers its own bound ref, separate from the seed config's ref.
    const config = form.formConfig as typeof form.formConfig & {
      _internalInputs?: { current: { mask?: { _inputRef?: { current: HTMLInputElement | null } } } };
    };
    const control = config._internalInputs?.current.mask?._inputRef?.current;
    control?.focus();
    onCheck(true, document.activeElement);
  };

  return (
    <Form config={form.formConfig}>
      <Input
        field="mask"
        label="Masked field"
        textFieldProps={{
          InputProps: { inputComponent: kind === 'date' ? DateMask : PhoneMask },
          inputProps: kind === 'phone' ? { phoneMask: '(000)000-0000' } : {},
        }}
      />
      <button type="button" onClick={focusInvalid}>
        Check form
      </button>
    </Form>
  );
};

const autocompleteKeys = {
  root: ['disabled', 'fullWidth', 'id', 'size', 'slotProps'],
  slotProps: ['htmlInput', 'input', 'inputLabel'],
  InputProps: ['className', 'endAdornment', 'onMouseDown', 'ref', 'startAdornment'],
  InputLabelProps: ['htmlFor', 'id'],
  inputProps: [
    'aria-activedescendant',
    'aria-autocomplete',
    'aria-controls',
    'aria-expanded',
    'autoCapitalize',
    'autoComplete',
    'className',
    'disabled',
    'id',
    'onBlur',
    'onChange',
    'onFocus',
    'onMouseDown',
    'readOnly',
    'ref',
    'role',
    'spellCheck',
    'value',
  ],
};

async function autocompleteTrace(Field: Field) {
  const nativeRef = createRef<HTMLInputElement>();
  const handlerCalls: string[] = [];
  let anchor: HTMLDivElement | null = null;
  let slotRef: HTMLInputElement | null = null;
  const view = render(
    <OwnAutocomplete
      id="reachability-autocomplete"
      options={['Apple', 'Pear']}
      openOnFocus
      size="small"
      renderInput={(params) => {
        const { slotProps, ...props } = params;
        // Fail if the hook gains a generated key without a backing observation in this differential.
        expect({
          root: Object.keys(params).sort(),
          slotProps: Object.keys(slotProps).sort(),
          InputProps: Object.keys(slotProps.input).sort(),
          InputLabelProps: Object.keys(slotProps.inputLabel).sort(),
          inputProps: Object.keys(slotProps.htmlInput).sort(),
        }).toEqual(autocompleteKeys);
        const observe =
          <E extends React.SyntheticEvent>(key: string, original: (event: E) => void) =>
          (event: E) => {
            handlerCalls.push(key);
            original(event);
          };
        return (
          <Field
            {...props}
            label="Fruit"
            inputRef={nativeRef}
            InputLabelProps={slotProps.inputLabel}
            InputProps={{
              ...slotProps.input,
              ref: (node: HTMLDivElement | null) => {
                anchor = node;
                slotProps.input.ref(node);
              },
              onMouseDown: observe('root:onMouseDown', slotProps.input.onMouseDown),
            }}
            inputProps={{
              ...slotProps.htmlInput,
              ref: (node: HTMLInputElement | null) => {
                slotRef = node;
                const htmlRef = slotProps.htmlInput.ref;
                if (typeof htmlRef === 'function') htmlRef(node);
                else if (htmlRef) htmlRef.current = node;
              },
              onFocus: observe('input:onFocus', slotProps.htmlInput.onFocus),
              onBlur: observe('input:onBlur', slotProps.htmlInput.onBlur),
              onChange: observe('input:onChange', slotProps.htmlInput.onChange),
              onMouseDown: observe('input:onMouseDown', slotProps.htmlInput.onMouseDown),
            }}
          />
        );
      }}
    />,
  );
  try {
    const input = view.getByRole('combobox', { name: 'Fruit' });
    if (!(input instanceof HTMLInputElement)) throw new Error('Expected an Autocomplete input');
    const root = input.closest<HTMLElement>('.MuiOutlinedInput-root');
    const field = input.closest('.MuiTextField-root');
    if (!root || !field) throw new Error('Missing outlined TextField frame');
    const user = userEvent.setup();
    fireEvent.mouseDown(root);
    await user.click(input);
    const listbox = view.getByRole('listbox');
    const popup = {
      controls: input.getAttribute('aria-controls') === listbox.id,
      expanded: input.getAttribute('aria-expanded'),
      optionNames: view.getAllByRole('option').map((option) => option.textContent),
    };
    await user.keyboard('{ArrowDown}');
    const highlighted = view.getByRole('option', { name: 'Apple' });
    const active = input.getAttribute('aria-activedescendant') === highlighted.id;
    await user.type(input, 'Pe');
    const value = input.value;
    fireEvent.blur(input);
    return {
      controlledByOwnField: field.hasAttribute('data-vg-core'),
      contract: {
        actualInput: nativeRef.current === input && slotRef === input,
        actualAnchor: anchor === root,
        autocompleteRootClass: root.classList.contains('MuiAutocomplete-inputRoot'),
        inputClass: input.classList.contains('MuiAutocomplete-input'),
        endAdornment: Boolean(view.getByRole('button', { name: 'Open' })),
        fieldFullWidth: field.classList.contains('MuiFormControl-fullWidth'),
        sizeSmall: root.classList.contains('MuiInputBase-sizeSmall'),
        controlId: input.id,
        labelId: input.labels?.[0]?.id,
        labelFor: input.labels?.[0]?.htmlFor,
        autoComplete: input.autocomplete,
        autoCapitalize: input.getAttribute('autocapitalize'),
        ariaAutocomplete: input.getAttribute('aria-autocomplete'),
        role: input.getAttribute('role'),
        spellCheck: input.getAttribute('spellcheck'),
        disabled: input.disabled,
        readOnly: input.readOnly,
        popup,
        active,
        value,
        handlerCalls,
      },
    };
  } finally {
    view.unmount();
  }
}

async function maskedTrace(Field: Field, variant: 'phone' | 'date') {
  const nativeRef = createRef<HTMLInputElement>();
  const changes: string[] = [];
  const date = variant === 'date';
  const label = date ? 'Date range' : 'Telephone';
  const type = date ? '08111511' : '2125551234';
  const paste = date ? '12 Nov - 15 Nov' : '6505550102';
  const Range = () => {
    const [value, setValue] = useState('');
    return (
      <>
        <Field
          id={`reachability-${variant}`}
          name={variant}
          label={label}
          value={date ? value : undefined}
          inputRef={nativeRef}
          InputProps={{ inputComponent: date ? DateMask : PhoneMask }}
          inputProps={date ? {} : { phoneMask: '(000)000-0000' }}
          onChange={(event) => {
            const next = event.target?.value ?? event.currentTarget.value;
            changes.push(next);
            if (date) setValue(next);
          }}
        />
        <button type="button" onClick={() => setValue('05 Nov - 11 Nov')}>
          Reset date
        </button>
      </>
    );
  };
  const view = render(<Range />);
  try {
    const input = view.container.querySelector('input');
    if (!input) throw new Error(`Missing native ${variant} input`);
    const user = userEvent.setup();
    const read = () => ({ value: input.value, caret: [input.selectionStart, input.selectionEnd] });
    await user.type(input, type);
    const typed = read();
    input.setSelectionRange(0, input.value.length);
    await user.paste(paste);
    const pasted = read();
    input.blur();
    const control = nativeRef.current;
    if (!control || typeof control.focus !== 'function')
      throw new Error('Masked field did not forward its focusable ref');
    const assigned = date ? '08 Nov - 14 Nov' : '(415)555-0130';
    control.value = assigned;
    control.focus();
    const imperative = { value: control.value, focused: document.activeElement === input };
    if (date) await user.click(view.getByRole('button', { name: 'Reset date' }));
    return {
      controlledByOwnField: input.closest('.MuiTextField-root')?.hasAttribute('data-vg-core'),
      contract: {
        actualInput: nativeRef.current === input,
        ownOutlinedClass: input.classList.contains('MuiOutlinedInput-input'),
        placeholder: input.placeholder,
        typed,
        pasted,
        imperative,
        finalValue: input.value,
        changes,
      },
    };
  } finally {
    view.unmount();
  }
}

describe('reachable outlined TextField routes versus frozen MUI 9.5', () => {
  it('keeps the Autocomplete anchor and native input refs on distinct elements', async () => {
    const reference = await autocompleteTrace(Reference);
    const candidate = await autocompleteTrace(MuiTextField);
    expect(reference.contract).toMatchObject({
      actualInput: true,
      actualAnchor: true,
      autocompleteRootClass: true,
      inputClass: true,
      endAdornment: true,
      fieldFullWidth: true,
      sizeSmall: true,
      controlId: 'reachability-autocomplete',
      labelId: 'reachability-autocomplete-label',
      labelFor: 'reachability-autocomplete',
      autoComplete: 'off',
      autoCapitalize: 'none',
      ariaAutocomplete: 'list',
      role: 'combobox',
      spellCheck: 'false',
      disabled: false,
      readOnly: false,
      popup: { controls: true, expanded: 'true', optionNames: ['Apple', 'Pear'] },
      active: true,
      value: 'Pe',
    });
    expect(reference.contract.handlerCalls).toEqual(
      expect.arrayContaining([
        'root:onMouseDown',
        'input:onMouseDown',
        'input:onFocus',
        'input:onChange',
        'input:onBlur',
      ]),
    );
    expect(candidate.contract).toEqual(reference.contract);
    expect(candidate.controlledByOwnField).toBe(true);
  });

  it.each(['phone', 'date'] as const)(
    'preserves the %s IMask native control, caret, paste and change trace',
    async (kind) => {
      const reference = await maskedTrace(Reference, kind);
      const candidate = await maskedTrace(MuiTextField, kind);
      expect(reference.contract.actualInput).toBe(true);
      expect(reference.contract.ownOutlinedClass).toBe(true);
      expect(reference.contract.imperative).toEqual({
        value: kind === 'date' ? '08 Nov - 14 Nov' : '(415)555-0130',
        focused: true,
      });
      expect(reference.contract.changes.length).toBeGreaterThan(0);
      expect(reference.contract.typed.value).not.toEqual(reference.contract.pasted.value);
      if (kind === 'phone') expect(reference.contract.pasted.value).toBe('(650)555-0102');
      else expect(reference.contract.finalValue).toBe('05 Nov - 11 Nov');
      expect(candidate.contract).toEqual(reference.contract);
      expect(candidate.controlledByOwnField).toBe(true);
    },
  );

  it('runs the cleanup returned by each native ref on a custom mask control', () => {
    const trace = (Field: Field) => {
      const events: string[] = [];
      const observe = (name: string) => (input: HTMLInputElement | null) => {
        events.push(`${name}:${input ? 'attached' : 'null'}`);
        return () => {
          events.push(`${name}:cleaned`);
        };
      };
      const view = render(
        <Field
          InputProps={{ inputComponent: PhoneMask }}
          inputProps={{ ref: observe('htmlInput'), phoneMask: '(000)000-0000' }}
          inputRef={observe('inputRef')}
        />,
      );
      view.unmount();
      return events;
    };
    const reference = trace(Reference);
    expect(reference).toEqual(['inputRef:attached', 'htmlInput:attached', 'inputRef:cleaned', 'htmlInput:cleaned']);
    expect(trace(MuiTextField)).toEqual(reference);
  });

  it.each(['phone', 'date'] as const)(
    'focuses the registered %s control when the consumer rejects an invalid Form',
    async (kind) => {
      let invalid: boolean | undefined;
      let focusedControl: Element | null = null;
      const onCheck = (nextInvalid: boolean, nextFocusedControl: Element | null) => {
        invalid = nextInvalid;
        focusedControl = nextFocusedControl;
      };

      const view = render(<RegisteredMaskHarness kind={kind} onCheck={onCheck} />);
      try {
        const input = view.container.querySelector('input.MuiOutlinedInput-input');
        expect(input).not.toBeNull();
        await userEvent.setup().click(view.getByRole('button', { name: 'Check form' }));
        expect(invalid).toBe(true);
        expect(focusedControl).toBe(input);
        expect(input.closest('.MuiTextField-root')?.hasAttribute('data-vg-core')).toBe(true);
      } finally {
        view.unmount();
      }
    },
  );
});
