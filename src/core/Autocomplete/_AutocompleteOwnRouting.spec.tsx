import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '../../../test-utils/test-utils';
import { Autocomplete } from './Autocomplete';

/**
 * Handoff 15 (Codex review): the own Autocomplete render models the props Vanguard and rc-webapp pass; any consumer
 * slot / slotProps / sx / legacy component prop keeps MUI's Autocomplete, so nothing is silently dropped.
 */
const Plain = (p: Record<string, unknown>) => <div {...p} />;
const OPTIONS = [{ key: 0, value: 'apple', title: 'Apple' }];
const isOwn = (props: Record<string, unknown>) => {
  const view = render(<Autocomplete id="ac" testId="ac" options={OPTIONS} optionKey="title" {...props} />);
  const own = view.container.querySelector('.MuiAutocomplete-root')?.hasAttribute('data-vg-core') ?? false;
  view.unmount();
  return own;
};

describe('Autocomplete routing to the own core', () => {
  it('rc-webapp shapes render on the own core', () => {
    expect(isOwn({ label: 'L', placeholder: 'P', restrictToOptions: true, hideCaret: true, size: 'small' })).toBe(true);
    expect(isOwn({ multiple: true, value: [OPTIONS[0]], autoSelect: true, blurOnSelect: true })).toBe(true);
  });

  it.each([
    ['slotProps', { slotProps: { paper: { elevation: 8 } } }],
    ['componentsProps', { componentsProps: { paper: { square: true } } }],
    ['slots', { slots: { listbox: 'div' } }],
    ['sx', { sx: { width: 120 } }],
    ['ListboxProps', { ListboxProps: { style: { maxHeight: 100 } } }],
    ['PaperComponent', { PaperComponent: Plain }],
    ['PopperComponent', { PopperComponent: Plain }],
    ['ListboxComponent', { ListboxComponent: 'div' }],
    ['ChipProps', { ChipProps: { color: 'primary' } }],
    ['renderGroup', { renderGroup: () => null }],
  ])('%s keeps MUI', (_name, props) => {
    expect(isOwn(props as Record<string, unknown>)).toBe(false);
  });
});
