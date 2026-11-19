import useMuiAutocomplete, { createFilterOptions as createMuiFilterOptions } from '@mui/material/useAutocomplete';
import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { createFilterOptions, useAutocomplete } from './useAutocomplete';

/**
 * Differential parity, jsdom (queue 2.5b): MUI 9.5 useAutocomplete vs the own hook. One harness renders every prop
 * getter onto real DOM and logs every callback; the same user timeline runs on both, and after each step the document,
 * the callback log and the returned state must be equal.
 */
type Hook = typeof useMuiAutocomplete;
type Opt = { label: string; group: string; disabled?: boolean };

const FRUITS = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig'];
const GROUPED: Opt[] = [
  { label: 'Apple', group: 'A' },
  { label: 'Apricot', group: 'A' },
  { label: 'Banana', group: 'B', disabled: true },
  { label: 'Blueberry', group: 'B' },
  { label: 'Cherry', group: 'C' },
];

const Harness = ({ hook, props, log }: { hook: Hook; props: Record<string, unknown>; log: string[] }) => {
  const cb =
    (name: string) =>
    (...args: unknown[]) =>
      log.push(`${name}:${JSON.stringify(args.slice(1))}`);
  const ac = hook({
    id: 'ac',
    onChange: cb('change'),
    onInputChange: cb('input'),
    onHighlightChange: cb('highlight'),
    onOpen: cb('open'),
    onClose: cb('close'),
    ...(props as object),
  } as never) as unknown as ReturnType<Hook>;
  const {
    getRootProps,
    getInputLabelProps,
    getInputProps,
    getClearProps,
    getPopupIndicatorProps,
    getListboxProps,
    getOptionProps,
    getItemProps,
    groupedOptions,
    popupOpen,
    value,
    setAnchorEl,
  } = ac as ReturnType<Hook> & { getItemProps: (p: { index: number }) => Record<string, unknown> };
  const label = (o: unknown) => (typeof o === 'string' ? o : ((o as Opt | null)?.label ?? String(o)));
  const optionsFlat = groupedOptions as unknown[];
  const isGrouped = Boolean(props.groupBy);
  let index = -1;
  const renderOption = (option: unknown) => {
    index += 1;
    const { key, ...p } = getOptionProps({ option, index } as never) as unknown as Record<string, unknown>;
    return (
      <li key={String(key)} {...p}>
        {label(option)}
      </li>
    );
  };
  return (
    <div {...getRootProps()} ref={setAnchorEl as never} data-root="">
      <label {...getInputLabelProps()}>{'Fruit'}</label>
      {Array.isArray(value)
        ? (value as unknown[]).map((v, i) => {
            const { key, ...p } = getItemProps({ index: i }) as Record<string, unknown>;
            return (
              <span key={String(key)} {...p}>
                {label(v)}
              </span>
            );
          })
        : null}
      <input {...(getInputProps() as React.InputHTMLAttributes<HTMLInputElement>)} />
      <button {...(getClearProps() as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{'clear'}</button>
      <button {...(getPopupIndicatorProps() as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{'popup'}</button>
      {popupOpen ? (
        <ul {...(getListboxProps() as React.HTMLAttributes<HTMLUListElement>)}>
          {isGrouped
            ? (optionsFlat as { key: number; group: string; options: unknown[] }[]).map((g) => (
                <li key={g.key}>
                  <div>{g.group}</div>
                  <ul>{g.options.map(renderOption)}</ul>
                </li>
              ))
            : optionsFlat.map(renderOption)}
        </ul>
      ) : null}
    </div>
  );
};

type Step =
  | ['focus']
  | ['blur']
  | ['type', string]
  | ['key', string]
  | ['option', number]
  | ['clear']
  | ['popup']
  | ['rerender', Record<string, unknown>]
  | ['hover', number]
  | ['leave'];

const run = async (hook: Hook, props: Record<string, unknown>, steps: Step[]) => {
  const user = userEvent.setup();
  const log: string[] = [];
  const trace: { html: string; log: string[] }[] = [];
  let current = props;
  const view = render(<Harness hook={hook} props={current} log={log} />);
  const input = () => view.container.querySelector('input') as HTMLInputElement;
  for (const step of steps) {
    switch (step[0]) {
      case 'focus':
        await user.click(input());
        break;
      case 'blur':
        await act(async () => {
          input().blur();
        });
        break;
      case 'type':
        await user.type(input(), step[1]);
        break;
      case 'key':
        await user.keyboard(step[1]);
        break;
      case 'option':
        await user.click(view.container.querySelectorAll('[role="option"]')[step[1]] as HTMLElement);
        break;
      case 'clear':
        await user.click(view.getByText('clear'));
        break;
      case 'popup':
        await user.click(view.getByText('popup'));
        break;
      case 'hover':
        await user.hover(view.container.querySelectorAll('[role="option"]')[step[1]] as HTMLElement);
        break;
      case 'leave':
        await user.unhover(view.container.querySelector('[role="listbox"]') as HTMLElement);
        break;
      case 'rerender':
        current = { ...current, ...step[1] };
        view.rerender(<Harness hook={hook} props={current} log={log} />);
        break;
    }
    trace.push({ html: view.container.innerHTML, log: log.splice(0) });
  }
  view.unmount();
  view.container.remove();
  return trace;
};

afterEach(() => {
  document.body.innerHTML = '';
});

const CASES: [string, Record<string, unknown>, Step[]][] = [
  [
    'type, arrow, Enter, reopen, Escape',
    { options: FRUITS },
    [['focus'], ['type', 'b'], ['key', '{ArrowDown}'], ['key', '{Enter}'], ['key', '{ArrowDown}'], ['key', '{Escape}']],
  ],
  [
    'popup indicator, click option, clear',
    { options: FRUITS },
    [['popup'], ['option', 2], ['clear'], ['key', '{ArrowUp}'], ['key', '{ArrowUp}'], ['key', '{Enter}']],
  ],
  ['no match then blur', { options: FRUITS }, [['focus'], ['type', 'zz'], ['blur']]],
  [
    'autoHighlight + autoComplete',
    { options: FRUITS, autoHighlight: true, autoComplete: true },
    [['focus'], ['type', 'ch'], ['key', '{Enter}']],
  ],
  [
    'freeSolo, Enter keeps typed text, autoSelect on blur',
    { options: FRUITS, freeSolo: true, autoSelect: true },
    [['focus'], ['type', 'Kiwi'], ['key', '{Enter}'], ['type', 'x'], ['blur']],
  ],
  [
    'multiple: select two, Backspace removes the last, filterSelectedOptions',
    { options: FRUITS, multiple: true, filterSelectedOptions: true },
    [
      ['focus'],
      ['key', '{ArrowDown}'],
      ['key', '{Enter}'],
      ['key', '{ArrowDown}'],
      ['key', '{Enter}'],
      ['key', '{Backspace}'],
    ],
  ],
  [
    'multiple + disableCloseOnSelect, ArrowLeft into the items',
    { options: FRUITS, multiple: true, disableCloseOnSelect: true },
    [
      ['focus'],
      ['key', '{ArrowDown}'],
      ['key', '{Enter}'],
      ['key', '{ArrowDown}'],
      ['key', '{Enter}'],
      ['key', '{Escape}'],
      ['key', '{ArrowLeft}'],
      ['key', '{ArrowLeft}'],
      ['key', '{Backspace}'],
    ],
  ],
  [
    'groupBy + disabled option skipped, Home/End',
    {
      options: GROUPED,
      groupBy: (o: Opt) => o.group,
      getOptionLabel: (o: Opt) => o.label,
      getOptionDisabled: (o: Opt) => Boolean(o.disabled),
    },
    [
      ['focus'],
      ['key', '{ArrowDown}'],
      ['key', '{ArrowDown}'],
      ['key', '{ArrowDown}'],
      ['key', '{End}'],
      ['key', '{Home}'],
      ['key', '{Enter}'],
    ],
  ],
  [
    'openOnFocus, clearOnEscape, blurOnSelect',
    { options: FRUITS, openOnFocus: true, clearOnEscape: true, blurOnSelect: true },
    [['focus'], ['key', '{ArrowDown}'], ['key', '{Enter}'], ['focus'], ['key', '{Escape}'], ['key', '{Escape}']],
  ],
  [
    'includeInputInList + disableListWrap',
    { options: FRUITS, includeInputInList: true, disableListWrap: true },
    [['focus'], ['key', '{ArrowUp}'], ['key', '{ArrowDown}'], ['key', '{ArrowUp}'], ['key', '{ArrowUp}']],
  ],
  [
    'controlled value and inputValue updated from outside',
    { options: FRUITS, value: 'Banana', inputValue: 'Banana' },
    [
      ['rerender', { value: 'Fig', inputValue: 'Fig' }],
      ['focus'],
      ['key', '{ArrowDown}'],
      ['rerender', { value: null, inputValue: '' }],
    ],
  ],
  ['disabled', { options: FRUITS, disabled: true }, [['focus'], ['key', '{ArrowDown}']]],
  [
    'autoComplete inline completion, Backspace removes the completion',
    { options: FRUITS, autoComplete: true },
    [['focus'], ['type', 'el'], ['key', '{ArrowDown}'], ['key', '{Backspace}'], ['key', '{Enter}']],
  ],
  [
    'mouse highlight, resetHighlightOnMouseLeave, click',
    { options: FRUITS, resetHighlightOnMouseLeave: true },
    [['popup'], ['hover', 3], ['hover', 1], ['leave'], ['hover', 4], ['option', 4]],
  ],
  [
    'clearOnBlur false keeps the typed text',
    { options: FRUITS, clearOnBlur: false },
    [['focus'], ['type', 'Ba'], ['blur'], ['focus']],
  ],
  [
    'custom isOptionEqualToValue + getOptionKey on objects',
    {
      options: GROUPED,
      getOptionLabel: (o: Opt) => o.label,
      isOptionEqualToValue: (o: Opt, v: Opt) => o.label === v.label,
      getOptionKey: (o: Opt) => `k-${o.label}`,
      value: { label: 'Cherry', group: 'C' },
    },
    [['popup'], ['key', '{ArrowDown}'], ['key', '{Enter}']],
  ],
  [
    'controlled open',
    { options: FRUITS, open: false },
    [['focus'], ['key', '{ArrowDown}'], ['rerender', { open: true }], ['key', '{ArrowDown}'], ['key', '{Enter}']],
  ],
  [
    'disabledItemsFocusable',
    {
      options: GROUPED,
      getOptionLabel: (o: Opt) => o.label,
      getOptionDisabled: (o: Opt) => Boolean(o.disabled),
      disabledItemsFocusable: true,
    },
    [['focus'], ['key', '{ArrowDown}'], ['key', '{ArrowDown}'], ['key', '{ArrowDown}'], ['key', '{Enter}']],
  ],
  [
    'autoSelect selects the highlight on blur',
    { options: FRUITS, autoSelect: true },
    [['focus'], ['type', 'd'], ['key', '{ArrowDown}'], ['blur']],
  ],
  [
    'freeSolo multiple: Enter adds typed values, Backspace removes',
    { options: FRUITS, freeSolo: true, multiple: true },
    [['focus'], ['type', 'Kiwi'], ['key', '{Enter}'], ['type', 'Lime'], ['key', '{Enter}'], ['key', '{Backspace}']],
  ],
  [
    'freeSolo with selectOnFocus and handleHomeEndKeys',
    { options: FRUITS, freeSolo: true, selectOnFocus: true, handleHomeEndKeys: true, value: 'Fig' },
    [['focus'], ['key', '{End}'], ['key', '{Home}'], ['type', 'a']],
  ],
  [
    'readOnly',
    { options: FRUITS, readOnly: true, value: 'Date' },
    [['focus'], ['key', '{ArrowDown}'], ['key', '{Enter}']],
  ],
];

describe('own useAutocomplete equals MUI useAutocomplete', () => {
  it.each(CASES)('%s', async (_name, props, steps) => {
    expect(await run(useAutocomplete as unknown as Hook, props, steps)).toEqual(
      await run(useMuiAutocomplete, props, steps),
    );
  });
});

describe('own createFilterOptions equals MUI createFilterOptions', () => {
  const options = ['Ångström', 'apple pie', 'Apple', 'Pineapple', 'Banana split', ...FRUITS];
  it.each([
    [{}, 'app'],
    [{ ignoreCase: false }, 'App'],
    [{ ignoreAccents: false }, 'Ang'],
    [{ ignoreAccents: true }, 'Ang'],
    [{ matchFrom: 'start' as const }, 'app'],
    [{ limit: 2 }, 'a'],
    [{ trim: true }, '  apple  '],
    [{ stringify: (o: string) => o.slice(1) }, 'pple'],
  ])('%j / %s', (config, inputValue) => {
    const state = { inputValue, getOptionLabel: (o: string) => o } as never;
    expect(createFilterOptions(config as never)(options, state)).toEqual(
      createMuiFilterOptions(config as never)(options, state),
    );
  });
});
