import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import type { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React, { useMemo, useRef } from 'react';
import { expect, waitFor } from 'storybook/test';
import { VerificationPinInput } from '../../common/VerificationPinInput/VerificationPinInput';
import { InputBase } from '../_internal/InputBase/InputBase';
import { Autocomplete } from '../Autocomplete/Autocomplete';
import { DateRangePickerMuiReference } from '../DateRangePicker/_DateRangePicker.mui-reference';
import { DateRangePicker } from '../DateRangePicker/DateRangePicker';
import { FlagAdornment } from '../FlagAdornment/FlagAdornment';
import { Input } from '../Input/Input';
import { Select } from '../Select/Select';
import { Textarea } from '../Textarea/Textarea';
import { PhoneNumber } from './PhoneNumber';
import { PhoneNumberIMask } from './PhoneNumberIMask/PhoneNumberIMask';

export default {
  ...SbDecorator({ title: 'Vanguard/PhoneNumber/Masked native box parity', component: PhoneNumber }),
};

type Story = StoryObj<typeof PhoneNumber>;
type Mask = 'phone' | 'phone-with-flag' | 'pin' | 'date-range';

// Preserve the containing typography theme and force only TextField to take its frozen MUI path. The real phone
// and pin wrappers construct their own legacy inputComponent props, so the two panes use the exact same wrappers.
function FrozenTextField({ children }: { children: React.ReactNode }) {
  const parent = useTheme();
  const theme = useMemo(
    () => createTheme(parent, { components: { MuiTextField: { defaultProps: { classes: {} } } } }),
    [parent],
  );
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

function InvoicePhoneNumber() {
  // EditAccountInvoiceAddress.tsx:366 and its form config on rc-webapp 73673465091, with synthetic field data.
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 1044 }}>
      <span>{'Phone'}</span>
      <PhoneNumber
        formConfig={{ _inputRef: ref, stateValue: '', validation: { maxLength: 50 } }}
        id="phone"
        phoneNumberBase=""
        countryCode="DE"
        prefixNumberDisabled
      />
    </div>
  );
}

function MaskPair({ mask }: { mask: Mask }) {
  const renderMask = (reference: boolean) => {
    if (mask === 'date-range') {
      const Picker = reference ? DateRangePickerMuiReference : DateRangePicker;
      return <Picker testId="native-box-picker" />;
    }
    const view =
      mask === 'phone' ? (
        <InvoicePhoneNumber />
      ) : mask === 'phone-with-flag' ? (
        <InputBase
          adornment={<FlagAdornment countryCode="de" />}
          textFieldProps={{
            InputProps: { inputComponent: PhoneNumberIMask as React.ElementType },
            inputProps: { phoneMask: '000 0000' },
          }}
        />
      ) : (
        <VerificationPinInput pinMask="00000" adornment={null} />
      );
    return reference ? <FrozenTextField>{view}</FrozenTextField> : view;
  };
  return (
    <div style={{ width: 1044 }}>
      <div data-testid="reference-mask">{renderMask(true)}</div>
      <div data-testid="own-mask">{renderMask(false)}</div>
    </div>
  );
}

const nativeProperties = [
  'width',
  'height',
  'box-sizing',
  'display',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'min-width',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
];

function readMask(pane: HTMLElement, mask: Mask) {
  const selector =
    mask === 'phone' || mask === 'phone-with-flag'
      ? 'input[placeholder*="#"]'
      : mask === 'pin'
        ? 'input'
        : '[data-testid="datepicker-reference"]';
  const input = pane.querySelector<HTMLInputElement>(selector);
  const frame = input?.closest('.MuiOutlinedInput-root');
  const root = frame?.closest('.MuiTextField-root');
  if (!input || !frame || !root) throw new Error(`Missing ${mask} native input or outlined frame`);
  return { input, frame, isOwn: root.hasAttribute('data-vg-core') };
}

function measure({ input, frame }: ReturnType<typeof readMask>) {
  const inputRect = input.getBoundingClientRect();
  const frameRect = frame.getBoundingClientRect();
  const computed = getComputedStyle(input);
  return {
    native: [inputRect.x - frameRect.x, inputRect.y - frameRect.y, inputRect.width, inputRect.height],
    frame: [frameRect.width, frameRect.height],
    style: Object.fromEntries(nativeProperties.map((property) => [property, computed.getPropertyValue(property)])),
  };
}

const check =
  (mask: Mask): Story['play'] =>
  async ({ canvasElement }) => {
    const pane = (name: 'reference' | 'own') => {
      const element = canvasElement.querySelector<HTMLElement>(`[data-testid="${name}-mask"]`);
      if (!element) throw new Error(`Missing ${name} mask pane`);
      return element;
    };
    await document.fonts.ready;
    const reference = await waitFor(() => readMask(pane('reference'), mask));
    const own = await waitFor(() => readMask(pane('own'), mask));
    expect(reference.isOwn).toBe(false);
    expect(own.isOwn).toBe(true);
    if (mask === 'phone-with-flag') {
      const adornment = own.input.previousElementSibling;
      expect(
        Boolean(
          adornment?.matches('.MuiInputAdornment-positionStart') ||
            adornment?.querySelector('.MuiInputAdornment-positionStart'),
        ),
      ).toBe(true);
      expect(own.input.parentElement).toBe(own.frame);
    }
    if (mask === 'date-range') {
      expect(own.input.nextElementSibling?.matches('.MuiInputAdornment-positionEnd')).toBe(true);
      expect(own.input.parentElement).toBe(own.frame);
    }
    const sampleStates = (member: ReturnType<typeof readMask>) => {
      const resting = measure(member);
      member.input.focus();
      expect(member.input.ownerDocument.activeElement).toBe(member.input);
      const focused = measure(member);
      member.input.blur();
      return { resting, focused, afterBlur: measure(member) };
    };
    const expected = sampleStates(reference);
    const actual = sampleStates(own);
    if (mask === 'phone') {
      expect(expected.resting.native[2]).toBe(expected.resting.frame[0]);
      expect(expected.resting.native[2]).toBeGreaterThan(500);
    }
    expect(actual).toEqual(expected);
  };

export const InvoicePhone: Story = { render: () => <MaskPair mask="phone" />, play: check('phone') };
export const PhoneWithStartFlag: Story = {
  render: () => <MaskPair mask="phone-with-flag" />,
  play: check('phone-with-flag'),
};
export const VerificationPin: Story = { render: () => <MaskPair mask="pin" />, play: check('pin') };
export const DateRange: Story = { render: () => <MaskPair mask="date-range" />, play: check('date-range') };

const fruit = [{ key: 'a', value: 'a', title: 'Apple' }];
const addedScope = ', [data-vg-core][data-slot="text-field-input"] > :is(input, textarea)';

const scopedRules = (rules: CSSRuleList): CSSStyleRule[] =>
  Array.from(rules).flatMap((rule) => {
    if (rule instanceof CSSStyleRule && rule.selectorText.includes(addedScope)) return [rule];
    return rule instanceof CSSGroupingRule ? scopedRules(rule.cssRules) : [];
  });

const computedBytes = (elements: Element[]) =>
  JSON.stringify(
    elements.map((element) => {
      const computed = getComputedStyle(element);
      return Array.from(computed, (name) => [name, computed.getPropertyValue(name)]);
    }),
  );

export const OrdinaryControlsRetainH21Styles: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <div data-testid="ordinary-input">
        <Input label="Name" />
      </div>
      <div data-testid="ordinary-select">
        <Select options={fruit} />
      </div>
      <div data-testid="ordinary-textarea">
        <Textarea label="Note" />
      </div>
      <div data-testid="chips">
        <Autocomplete options={fruit} optionKey="title" multiple controlled value={fruit} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await document.fonts.ready;
    const controls = [
      '[data-testid="ordinary-input"] input.MuiInputBase-input',
      '[data-testid="ordinary-select"] .MuiSelect-select',
      '[data-testid="ordinary-textarea"] textarea:not([aria-hidden])',
      '[data-testid="chips"] input[role="combobox"]',
    ].map((selector) => {
      const control = canvasElement.querySelector(selector);
      if (!control) throw new Error(`Missing ${selector}`);
      expect(control.closest('.MuiFormControl-root')?.hasAttribute('data-vg-core')).toBe(true);
      return control;
    });
    const chip = controls[3].parentElement?.querySelector('.MuiAutocomplete-tag');
    expect(chip).not.toBeNull();
    expect(Boolean(chip && chip.compareDocumentPosition(controls[3]) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    const rules = Array.from(document.styleSheets).flatMap((sheet) => scopedRules(sheet.cssRules));
    expect(rules.length).toBeGreaterThan(0);
    const previous = rules.map((rule) => rule.selectorText);
    const elements = controls.flatMap((control) => [control, control.closest('.MuiOutlinedInput-root') ?? control]);
    const revised = computedBytes(elements);
    try {
      // Restore the exact H21 selector in place so neither order nor declarations move.
      rules.forEach((rule, i) => {
        rule.selectorText = previous[i].replace(addedScope, '');
      });
      expect(computedBytes(elements)).toBe(revised);
    } finally {
      rules.forEach((rule, i) => {
        rule.selectorText = previous[i];
      });
    }
  },
};
