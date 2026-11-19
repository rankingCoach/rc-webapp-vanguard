import { TextField as FrozenMuiTextField } from '@mui/material';
import { fireEvent, render } from '@testing-library/react';
import React, { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { VerificationPinInputIMask } from '../../../common/VerificationPinInput/VerificationPinInputIMask/VerificationPinInputIMask';
import type { VanguardTextFieldProps } from '../mui-legacy-props';
import { MuiTextField } from './MuiTextField';

type Props = VanguardTextFieldProps<'outlined'>;
type Field = React.ComponentType<Props>;

const Reference: Field = ({ InputProps, InputLabelProps, inputProps, FormHelperTextProps, slotProps, ...props }) => (
  <FrozenMuiTextField
    {...props}
    slotProps={{
      input: InputProps,
      inputLabel: InputLabelProps,
      htmlInput: inputProps,
      formHelperText: FormHelperTextProps,
      ...slotProps,
    }}
  />
);

// Source: frozen TextField's RootSlot spreads `other`, while InputElement receives the explicit input props.
// Attributes in the public div-prop family use the same `other` spread. These probes cover event families and
// the slot override order independently of any particular consumer's handlers.
const rootEvents = [
  ['onKeyDown', fireEvent.keyDown],
  ['onKeyUp', fireEvent.keyUp],
  ['onKeyDownCapture', fireEvent.keyDown, true],
  ['onClick', fireEvent.click],
  ['onDoubleClick', fireEvent.doubleClick],
  ['onMouseDown', fireEvent.mouseDown],
  ['onMouseUp', fireEvent.mouseUp],
  ['onMouseMove', fireEvent.mouseMove],
  ['onMouseOver', fireEvent.mouseOver],
  ['onMouseOut', fireEvent.mouseOut],
  ['onContextMenu', fireEvent.contextMenu],
  ['onPointerDown', fireEvent.pointerDown],
  ['onPointerUp', fireEvent.pointerUp],
  ['onPointerMove', fireEvent.pointerMove],
  ['onPointerOver', fireEvent.pointerOver],
  ['onPointerOut', fireEvent.pointerOut],
  ['onPointerCancel', fireEvent.pointerCancel],
  ['onCopy', fireEvent.copy],
  ['onCut', fireEvent.cut],
  ['onPaste', fireEvent.paste],
  ['onInput', fireEvent.input],
  ['onFocusCapture', fireEvent.focus, true],
  ['onBlurCapture', fireEvent.blur, true],
  ['onDragStart', fireEvent.dragStart],
  ['onDrop', fireEvent.drop],
  ['onTouchStart', fireEvent.touchStart],
  ['onWheel', fireEvent.wheel],
] as const;

const withField = <T,>(Field: Field, props: Props, inspect: (root: HTMLElement, input: HTMLInputElement) => T): T => {
  const view = render(<Field {...props} />);
  try {
    const root = view.container.querySelector<HTMLElement>('.MuiTextField-root');
    const input = root?.querySelector<HTMLInputElement>('input');
    if (!root || !input) throw new Error('Missing outlined text field or native control');
    expect(root.hasAttribute('data-vg-core')).toBe(Field === MuiTextField);
    return inspect(root, input);
  } finally {
    view.unmount();
  }
};

const locate = (node: EventTarget | null, root: HTMLElement, input: HTMLElement) =>
  node === root ? 'root' : node === input ? 'native' : 'other';

describe('outlined TextField top-level props versus frozen MUI 9.5', () => {
  it.each(rootEvents)(
    '%s is a FormControl event after the native listener unless capturing',
    (prop, dispatch, capture) => {
      const trace = (Field: Field) => {
        const calls: string[] = [];
        let root: HTMLElement;
        let input: HTMLInputElement;
        const record = (source: string) => (event: React.SyntheticEvent) => {
          calls.push(`${source}:${locate(event.currentTarget, root, input)}:${locate(event.target, root, input)}`);
        };
        const nativeProp = capture ? prop.slice(0, -'Capture'.length) : prop;
        return withField(
          Field,
          { variant: 'outlined', [prop]: record('outer'), inputProps: { [nativeProp]: record('slot') } },
          (field, control) => {
            root = field;
            input = control;
            dispatch(input);
            return calls;
          },
        );
      };
      const expected = capture
        ? ['outer:root:native', 'slot:native:native']
        : ['slot:native:native', 'outer:root:native'];
      expect(trace(Reference)).toEqual(expected);
      expect(trace(MuiTextField)).toEqual(expected);
    },
  );

  it('keeps top-level key handlers when the custom control discards both native key handlers', () => {
    const trace = (Field: Field) => {
      const calls: string[] = [];
      const record = (name: string) => () => calls.push(name);
      return withField(
        Field,
        {
          variant: 'outlined',
          onKeyDown: record('root-down'),
          onKeyUp: record('root-up'),
          InputProps: {
            inputComponent: VerificationPinInputIMask,
            onKeyDown: record('input-down'),
            onKeyUp: record('input-up'),
          },
          inputProps: { pinMask: '00000', onKeyDown: record('html-down'), onKeyUp: record('html-up') },
        },
        (_, input) => {
          fireEvent.keyDown(input);
          fireEvent.keyUp(input);
          return calls;
        },
      );
    };
    expect(trace(Reference)).toEqual(['root-down', 'root-up']);
    expect(trace(MuiTextField)).toEqual(trace(Reference));
  });

  it.each(['onFocus', 'onBlur', 'onChange'] as const)(
    '%s sees the native element and preserves MUI callback order',
    (prop) => {
      const trace = (Field: Field) => {
        const calls: string[] = [];
        let input: HTMLInputElement;
        const record = (source: string) => (event: React.SyntheticEvent) => {
          calls.push(`${source}:${event.currentTarget === input}:${event.target === input}`);
        };
        return withField(
          Field,
          { variant: 'outlined', [prop]: record('outer'), inputProps: { [prop]: record('slot') } },
          (_, control) => {
            input = control;
            if (prop === 'onFocus') fireEvent.focus(input);
            else if (prop === 'onBlur') fireEvent.blur(input);
            else fireEvent.change(input, { target: { value: 'typed' } });
            return calls;
          },
        );
      };
      const expected =
        prop === 'onChange' ? ['slot:true:true', 'outer:true:true'] : ['outer:true:true', 'slot:true:true'];
      expect(trace(Reference)).toEqual(expected);
      expect(trace(MuiTextField)).toEqual(expected);
    },
  );

  it.each([false, true])('a native key handler overrides the InputBase slot handler: %s', (override) => {
    const trace = (Field: Field) => {
      const calls: string[] = [];
      const record = (location: string) => (event: React.KeyboardEvent) => {
        calls.push(`${location}:${event.currentTarget.tagName}`);
      };
      return withField(
        Field,
        {
          variant: 'outlined',
          onKeyDown: record('root'),
          InputProps: { onKeyDown: record('outlined') },
          inputProps: override ? { onKeyDown: record('native') } : undefined,
        },
        (_, input) => {
          fireEvent.keyDown(input);
          return calls;
        },
      );
    };
    const expected = [override ? 'native:INPUT' : 'outlined:INPUT', 'root:DIV'];
    expect(trace(Reference)).toEqual(expected);
    expect(trace(MuiTextField)).toEqual(expected);
  });

  it.each([false, true])('routes legacy aliases and modern slot props to the same elements: modern = %s', (modern) => {
    const input = { className: 'probe-outlined' };
    const htmlInput = { className: 'probe-native' };
    const inputLabel = { className: 'probe-label' };
    const formHelperText = { className: 'probe-helper' };
    const slots = { inputLabel: 'span' } as const;
    const slotProps = modern
      ? { slotProps: { input, htmlInput, inputLabel, formHelperText } }
      : { InputProps: input, inputProps: htmlInput, InputLabelProps: inputLabel, FormHelperTextProps: formHelperText };
    const trace = (Field: Field) =>
      withField(
        Field,
        { variant: 'outlined', slots, ...slotProps, label: 'Name', helperText: 'Note' },
        (root, control) => {
          const classes = ['probe-outlined', 'probe-native', 'probe-label', 'probe-helper'];
          return classes.map((className) => {
            const element = root.querySelector(`.${className}`);
            return [element?.tagName, element === control];
          });
        },
      );
    const expected = [
      ['DIV', false],
      ['INPUT', true],
      ['SPAN', false],
      ['P', false],
    ];
    expect(trace(Reference)).toEqual(expected);
    expect(trace(MuiTextField)).toEqual(expected);
  });

  it('routes div attributes, class, style and root ref only to FormControl and input attributes only to the control', () => {
    const trace = (Field: Field) => {
      const ref = createRef<HTMLElement>();
      const inputRef = createRef<HTMLInputElement>();
      const rootAttrs = {
        title: 'Field title',
        tabIndex: -1,
        role: 'group',
        dir: 'ltr',
        lang: 'en',
        'aria-label': 'Group',
        'data-probe': 'frame',
      };
      return withField(
        Field,
        {
          variant: 'outlined',
          ...rootAttrs,
          ref,
          inputRef,
          className: 'root-probe',
          style: { zIndex: 7 },
          id: 'field-probe',
          name: 'native-name',
          type: 'search',
          placeholder: 'Native hint',
          autoComplete: 'off',
          defaultValue: 'default seed',
          label: 'Label',
          helperText: 'Helper',
          children: 'Ignored in text mode',
        },
        (root, input) => {
          const attributes = (node: Element, keys: string[]) => keys.map((key) => node.getAttribute(key));
          const onRoot = ['title', 'tabindex', 'role', 'dir', 'lang', 'aria-label', 'data-probe'];
          const onInput = ['id', 'name', 'type', 'placeholder', 'autocomplete', 'value', 'aria-describedby'];
          return {
            refs: [ref.current === root, inputRef.current === input],
            onRoot: [attributes(root, onRoot), attributes(input, onRoot)],
            onInput: [attributes(root, onInput), attributes(input, onInput)],
            classes: [root.classList.contains('root-probe'), input.classList.contains('root-probe')],
            inline: [root.style.zIndex, input.style.zIndex],
            note: root.querySelector('.MuiFormHelperText-root')?.textContent,
            label: [input.labels?.[0]?.textContent, input.labels?.[0]?.htmlFor],
            renderedChildren: root.textContent?.includes('Ignored in text mode'),
          };
        },
      );
    };
    const expected = {
      refs: [true, true],
      onRoot: [['Field title', '-1', 'group', 'ltr', 'en', 'Group', 'frame'], Array(7).fill(null)],
      onInput: [
        Array(7).fill(null),
        ['field-probe', 'native-name', 'search', 'Native hint', 'off', 'default seed', 'field-probe-helper-text'],
      ],
      classes: [true, false],
      inline: ['7', ''],
      note: 'Helper',
      label: ['Label', 'field-probe'],
      renderedChildren: false,
    };
    expect(trace(Reference)).toEqual(expected);
    expect(trace(MuiTextField)).toEqual(expected);
  });

  it('routes FormControl host and state props to the root and its descendants', () => {
    const trace = (Field: Field) =>
      withField(
        Field,
        {
          variant: 'outlined',
          component: 'section',
          margin: 'dense',
          hiddenLabel: true,
          size: 'small',
          color: 'secondary',
          disabled: true,
          required: true,
          error: true,
          fullWidth: true,
          focused: true,
          value: 'controlled',
          label: 'Label',
          helperText: 'Helper',
          sx: { opacity: 0.8 },
        },
        (root, input) => {
          const outlined = input.closest('.MuiOutlinedInput-root');
          return {
            host: root.tagName,
            margin: root.classList.contains('MuiFormControl-marginDense'),
            full: [
              root.classList.contains('MuiFormControl-fullWidth'),
              outlined?.classList.contains('MuiInputBase-fullWidth'),
            ],
            hiddenLabel: outlined?.classList.contains('MuiInputBase-hiddenLabel'),
            small: [
              outlined?.classList.contains('MuiInputBase-sizeSmall'),
              root.querySelector('label')?.classList.contains('MuiInputLabel-sizeSmall'),
            ],
            color: outlined?.classList.contains('MuiInputBase-colorSecondary'),
            focused: outlined?.classList.contains('Mui-focused'),
            required: input.required,
            disabled: input.disabled,
            invalid: input.getAttribute('aria-invalid'),
            sx: [getComputedStyle(root).opacity, input.style.opacity],
            value: input.value,
          };
        },
      );
    const expected = {
      host: 'SECTION',
      margin: true,
      full: [true, true],
      hiddenLabel: true,
      small: [true, true],
      color: true,
      focused: false,
      required: true,
      disabled: true,
      invalid: 'true',
      sx: ['0.8', ''],
      value: 'controlled',
    };
    expect(trace(Reference)).toEqual(expected);
    expect(trace(MuiTextField)).toEqual(expected);
  });

  it.each([{ rows: 3 }, { minRows: 2, maxRows: 4 }])(
    'routes multiline and its row bounds to the autosizing control: %o',
    (bounds) => {
      const trace = (Field: Field) => {
        const ref = createRef<HTMLTextAreaElement>();
        const view = render(<Field variant="outlined" multiline {...bounds} autoFocus inputRef={ref} />);
        try {
          const native = view.container.querySelector('textarea:not([aria-hidden])');
          return {
            rows: native?.rows,
            focused: document.activeElement === native,
            ref: ref.current === native,
            outlined: native?.closest('.MuiInputBase-multiline') !== null,
            shadow: view.container.querySelectorAll('textarea[aria-hidden]').length,
          };
        } finally {
          view.unmount();
        }
      };
      const expected = { rows: bounds.rows ?? bounds.minRows, focused: true, ref: true, outlined: true, shadow: 1 };
      expect(trace(Reference)).toEqual(expected);
      expect(trace(MuiTextField)).toEqual(expected);
    },
  );
});
