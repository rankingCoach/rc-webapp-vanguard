import { expect, test } from 'vitest';

import { mapLegacySlots } from './mui-slot-compat';

const LintExplicit26 = () => null;

const LintLegacy25 = () => null;


test('legacy values map to slots and are removed from the underlying props', () => {
  const input = { InputProps: { readOnly: true }, inputProps: { id: 'input' }, label: 'Name' };
  expect(mapLegacySlots(input, { InputProps: 'input', inputProps: 'htmlInput' })).toEqual({
    label: 'Name',
    slotProps: { input: { readOnly: true }, htmlInput: { id: 'input' } },
  });
  expect(input.InputProps).toEqual({ readOnly: true });
});

test('explicit object/function slots replace legacy values, including undefined like MUI', () => {
  const fn = () => ({ id: 'explicit' });
  const result = mapLegacySlots(
    { inputProps: { id: 'legacy' }, slotProps: { htmlInput: fn, input: undefined } },
    { inputProps: 'htmlInput' },
  );
  expect(result.slotProps.htmlInput).toBe(fn);
  expect(result.slotProps).toHaveProperty('input', undefined);
});

test('component aliases move into slots with explicit undefined and component precedence', () => {
  const Legacy = LintLegacy25;
  const Explicit = LintExplicit26;
  const input = { TransitionComponent: Legacy, slots: { transition: Explicit } };
  expect(mapLegacySlots(input, {}, { TransitionComponent: 'transition' })).toEqual({
    slots: { transition: Explicit },
    slotProps: {},
  });
  expect(mapLegacySlots({ TransitionComponent: Legacy }, {}, { TransitionComponent: 'transition' })).toEqual({
    slots: { transition: Legacy },
    slotProps: {},
  });
  expect(
    mapLegacySlots(
      { TransitionComponent: Legacy, slots: { transition: undefined } },
      {},
      { TransitionComponent: 'transition' },
    ),
  ).toEqual({ slots: { transition: undefined }, slotProps: {} });
  expect(input.TransitionComponent).toBe(Legacy);
});
