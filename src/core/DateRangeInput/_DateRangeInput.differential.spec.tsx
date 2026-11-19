import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { DateRangePickerBaseInputAdornmentMuiReference } from '../DateRangePicker/DateRangePickerBase/DateRangePickerBaseInputAdornment/_DateRangePickerBaseInputAdornment.mui-reference';
import { DateRangePickerBaseInputAdornment } from '../DateRangePicker/DateRangePickerBase/DateRangePickerBaseInputAdornment/DateRangePickerBaseInputAdornment';
import { DateRangeInputMuiReference } from './_DateRangeInput.mui-reference';
import { DateRangeInput } from './DateRangeInput';

/**
 * Differential parity, jsdom: DateRangeInput's calendar end adornment and DateRangePickerBaseInputAdornment on the own
 * InputAdornment vs the frozen MUI ones. Declared delta (as FlagAdornment, handoff 18): inside the own TextField frame
 * the own InputAdornment reads the frame's form-control context and carries MuiInputAdornment-outlined / -sizeMedium,
 * as MUI's adornment did inside MUI's FormControl before the frame went own (MUI styles neither for outlined).
 */
const normalize = (html: string) =>
  html
    .replace(/ ?\bcss-[a-z0-9]+(-[A-Za-z0-9]+)*/g, '')
    .replace(/ class=""/g, '')
    .replace(/ data-vg-core=""/g, '')
    .replace(/ data-slot="input-adornment"/g, '')
    .replace(/ (id|for|aria-labelledby|aria-describedby)="[^"]*"/g, ' $1="ID"');

const withFrameContext = (html: string) =>
  html.replace(
    /class="MuiInputAdornment-root MuiInputAdornment-positionEnd/g,
    'class="MuiInputAdornment-root MuiInputAdornment-positionEnd MuiInputAdornment-outlined MuiInputAdornment-sizeMedium',
  );

const html = (el: React.ReactElement) => {
  const view = render(el);
  const out = normalize(view.container.innerHTML);
  view.unmount();
  return out;
};

describe('date-range adornments on the own InputAdornment', () => {
  it('DateRangeInput (end adornment inside the own frame: declared delta)', () => {
    const own = html(<DateRangeInput name="range" label="Range" />);
    const mui = html(<DateRangeInputMuiReference name="range" label="Range" />);
    expect(own).toBe(withFrameContext(mui));
  });
  it('DateRangePickerBaseInputAdornment standalone (no frame: identical)', () => {
    expect(html(<DateRangePickerBaseInputAdornment />)).toBe(html(<DateRangePickerBaseInputAdornmentMuiReference />));
  });
});
