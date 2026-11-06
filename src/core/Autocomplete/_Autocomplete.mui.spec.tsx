/**
 * MUI upgrade contract (v5 -> v9) for the vanguard Autocomplete.
 *
 * Locks the CURRENT observable behaviour on MUI v5 so that the unchanged tests go red where MUI changes
 * behaviour (see agentic-plans/mui-upgrade-breaking-changes.md). Real MUI, no mocks.
 *
 * MUI classes asserted here are only those Vanguard production code depends on (grep hits):
 * - `.MuiAutocomplete-inputRoot` Autocomplete.scss:13, `.MuiAutocomplete-input` Autocomplete.scss:20,
 *   `.MuiAutocomplete-endAdornment` Autocomplete.scss:52, `.MuiAutocomplete-clearIndicator` Autocomplete.scss:67,
 *   `.MuiAutocomplete-popupIndicator` Autocomplete.scss:73
 * - `.MuiAutocomplete-option` + `Mui-focused` Autocomplete.tsx:290,294 (detectFocusedOption)
 * - `.MuiAutocomplete-paper` root-components.scss:63, `.MuiAutocomplete-listbox` root-components.scss:72
 * - `.MuiOutlinedInput-root` InputBase.scss:106, `.MuiOutlinedInput-input` InputBase.scss:118,
 *   `.MuiFormControl-root` InputBase.scss:12
 * Everything else (chips, popper, no-options node, root modifier classes, data-tag-index, aria-owns) is asserted
 * through observable outcomes only. Class checks use expect.soft so a rename never hides a behaviour result.
 */
import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import React, { createRef } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { act, fireEvent, render, screen, waitFor, within } from '../../../test-utils/test-utils';
import { Autocomplete, AutocompleteProps } from './Autocomplete';

const FRUITS = ['apple', 'banana', 'cherry'];

type Country = { key: number; value: string };
const COUNTRIES: Country[] = [
  { key: 0, value: 'Germany' },
  { key: 1, value: 'France' },
];

const renderAc = (props: Partial<AutocompleteProps> = {}) =>
  render(<Autocomplete testId={'ac'} label={'Fruit'} options={FRUITS} {...props} />);

const getInput = () => screen.getByRole('combobox') as HTMLInputElement;
const optionLabels = () => screen.queryAllByRole('option').map((o) => o.textContent);
/** MUI Autocomplete root (the element vanguard hands `testId` to). */
const getRoot = () => screen.getByTestId('ac');
/** Vanguard wrapper (ComponentContainer) that carries the vanguard-autocomplete-* modifier classes. */
const getContainer = () => getRoot().closest('.vanguard-autocomplete') as HTMLElement;
/** Top-level body child (portal root) holding `el`; structural, no MUI class. */
const portalRoot = (el: Element): HTMLElement => {
  let node = el as HTMLElement;
  while (node.parentElement && node.parentElement !== document.body) node = node.parentElement;
  return node;
};
/** Portals mounted in body next to the RTL container (the popup, when open). */
const bodyPortals = (container: HTMLElement) =>
  Array.from(document.body.children).filter((el) => el !== container) as HTMLElement[];
/** Chips = role=button children of the vanguard `.vanguard-input-tags` wrapper (Autocomplete.tsx:202). */
const getChips = () => {
  const tags = getRoot().querySelector('.vanguard-input-tags') as HTMLElement | null;
  return tags ? (within(tags).queryAllByRole('button') as HTMLElement[]) : [];
};
const chipLabels = () => getChips().map((c) => c.textContent);
/** The chip's delete "x" is its only svg. */
const chipDeleteIcon = (chip: HTMLElement) => chip.querySelector('svg') as SVGElement;
/** aria-activedescendant -> the option element it points at. */
const activeOption = () => {
  const id = getInput().getAttribute('aria-activedescendant');
  return id ? document.getElementById(id) : null;
};

describe('Autocomplete MUI contract', () => {
  afterEach(() => {
    OverlayStackingService.__resetForTests();
    vi.restoreAllMocks();
  });

  describe('render and DOM structure', () => {
    test('testId / className / `\u0024{testId}-input` QA ids land on the root, the wrapper and the text field', () => {
      renderAc({ className: 'my-ac' });

      expect(getContainer()).toHaveClass('vanguard-autocomplete', 'my-ac');
      expect(getContainer().contains(getRoot())).toBe(true);
      const field = screen.getByTestId('ac-input');
      expect(getRoot().contains(field)).toBe(true);
      expect(within(field).getByRole('combobox')).toBe(getInput());
      expect(within(getRoot()).getByRole('button', { name: 'Open' })).toBeInTheDocument();
    });

    test('closed: the MUI classes Vanguard SCSS targets are on the expected elements', () => {
      renderAc();
      const input = getInput();
      const field = screen.getByTestId('ac-input');
      expect.soft(field).toHaveClass('MuiFormControl-root');
      expect.soft(input).toHaveClass('MuiAutocomplete-input', 'MuiOutlinedInput-input');
      expect.soft(input.parentElement).toHaveClass('MuiAutocomplete-inputRoot', 'MuiOutlinedInput-root');
      const popupIndicator = screen.getByRole('button', { name: 'Open' });
      expect.soft(popupIndicator).toHaveClass('MuiAutocomplete-popupIndicator');
      expect.soft(popupIndicator.parentElement).toHaveClass('MuiAutocomplete-endAdornment');
    });

    test('open: the MUI classes Vanguard SCSS / runtime code target are on the expected elements', async () => {
      const user = userEvent.setup();
      renderAc();
      await user.click(getInput());
      const listbox = screen.getByRole('listbox');
      expect.soft(listbox).toHaveClass('MuiAutocomplete-listbox');
      expect.soft(listbox.parentElement).toHaveClass('MuiAutocomplete-paper');
      screen.getAllByRole('option').forEach((o) => { expect.soft(o).toHaveClass('MuiAutocomplete-option'); });
    });

    test('input carries the html attributes MUI passes via renderInput params.inputProps', () => {
      renderAc();
      const input = getInput();

      expect(input).toHaveAttribute('role', 'combobox');
      expect(input).toHaveAttribute('autocomplete', 'off');
      expect(input).toHaveAttribute('autocapitalize', 'none');
      expect(input).toHaveAttribute('spellcheck', 'false');
      expect(input).toHaveAttribute('aria-autocomplete', 'both');
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(input).not.toHaveAttribute('aria-controls');
      expect(input).not.toHaveAttribute('aria-activedescendant');
    });

    test('autoComplete=false switches aria-autocomplete to "list"', () => {
      renderAc({ autoComplete: false });
      expect(getInput()).toHaveAttribute('aria-autocomplete', 'list');
    });

    test('label is linked to the input and shows the "Optional" marker when not required', () => {
      renderAc();
      const input = getInput();
      const label = document.querySelector(`label[for="${input.id}"]`) as HTMLLabelElement;
      expect(label).not.toBeNull();
      expect(label.textContent).toBe('FruitOptional');
      expect(label.id).toBe(`${input.id}-label`);
    });

    test('`required` marks the input as required and drops the "Optional" marker', () => {
      renderAc({ required: true });
      expect(getInput()).toBeRequired();
      expect(document.querySelector('.vanguard-input-label-optional')).toBeNull();
    });

    test('`id` becomes the input id; the open listbox is named by the label and referenced by aria-controls', async () => {
      const user = userEvent.setup();
      renderAc({ id: 'fruit-ac' });
      const input = getInput();
      expect(input.id).toBe('fruit-ac');

      await user.click(input);
      const listbox = screen.getByRole('listbox');
      expect(input).toHaveAttribute('aria-controls', listbox.id);
      expect(listbox).toHaveAccessibleName('Fruit Optional');
      // option ids are unique, so aria-activedescendant can reference them
      const ids = screen.getAllByRole('option').map((o) => o.id);
      expect(new Set(ids).size).toBe(3);
      ids.forEach((id) => { expect(id).not.toBe(''); });
    });

    test('placeholder is forwarded to the input', () => {
      renderAc({ placeholder: 'Pick a fruit' });
      expect(getInput()).toHaveAttribute('placeholder', 'Pick a fruit');
    });

    test('`inputRef` receives the native input element', () => {
      const inputRef = createRef<HTMLInputElement>();
      renderAc({ inputRef: inputRef as any });
      expect(inputRef.current).toBe(getInput());
    });

    test('isLoading renders the vanguard skeleton', () => {
      renderAc({ isLoading: true });
      expect(screen.getByTestId('ac').querySelector('.vanguard-input-loading .vanguard-input-skeleton')).not.toBeNull();
    });
  });

  describe('modifier classes (caret / clear button)', () => {
    // CURRENT BEHAVIOUR (suspected bug): `hideCaret || value !== null` is true when `value` is undefined, so the
    // popup caret is hidden by default for every uncontrolled Autocomplete. Only `value={null}` shows it.
    test('[bug-lock] without a `value` prop the container gets vanguard-autocomplete-no-caret', () => {
      // Baseline characterization: not a promised contract.
      renderAc();
      expect(getContainer()).toHaveClass('vanguard-autocomplete-no-caret');
    });

    test('`value={null}` keeps the caret visible (no no-caret class)', () => {
      renderAc({ value: null });
      expect(getContainer()).not.toHaveClass('vanguard-autocomplete-no-caret');
    });

    test('`hideCaret` adds the no-caret class even when value is null', () => {
      renderAc({ value: null, hideCaret: true });
      expect(getContainer()).toHaveClass('vanguard-autocomplete-no-caret');
    });

    test('`hideClearButton` adds vanguard-autocomplete-no-clear-btn', () => {
      renderAc({ hideClearButton: true });
      expect(getContainer()).toHaveClass('vanguard-autocomplete-no-clear-btn');
    });
  });

  describe('open / close and combobox aria', () => {
    test('clicking the input opens the listbox in a body portal and wires aria-expanded / aria-controls', async () => {
      const user = userEvent.setup();
      const { container } = renderAc();
      const input = getInput();

      await user.click(input);

      expect(input).toHaveAttribute('aria-expanded', 'true');
      const listbox = screen.getByRole('listbox');
      expect(input).toHaveAttribute('aria-controls', listbox.id);
      expect(optionLabels()).toEqual(FRUITS);
      // portalled to body, outside the render container
      expect(container.contains(listbox)).toBe(false);
      expect(portalRoot(listbox).parentElement).toBe(document.body);
    });

    test('popup indicator toggles the listbox and flips its aria-label Open/Close', async () => {
      const user = userEvent.setup();
      renderAc();
      const input = getInput();

      await user.click(screen.getByRole('button', { name: 'Open' }));
      expect(input).toHaveAttribute('aria-expanded', 'true');
      const closeBtn = screen.getByRole('button', { name: 'Close' });
      // not in the Tab order
      expect(closeBtn).toHaveAttribute('tabindex', '-1');

      await user.click(closeBtn);
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    test('Escape closes the open listbox', async () => {
      const user = userEvent.setup();
      renderAc();
      await user.click(getInput());
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');
      expect(getInput()).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    // v9: "right-click on input no longer toggles listbox"
    test("[v5-quirk] right-button mousedown leaves the listbox closed (v9)", () => {
      // Baseline characterization: not a promised contract.
      renderAc();
      const input = getInput();
      input.focus();
      fireEvent.mouseDown(input, { button: 2 });
      expect(input).toHaveAttribute('aria-expanded', 'false');
      fireEvent.mouseDown(input, { button: 2 });
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    test('controlled `open` renders the listbox without interaction', () => {
      renderAc({ open: true });
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(getInput()).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('keyboard navigation', () => {
    test('ArrowDown highlights the first option via aria-activedescendant and inline-completes', async () => {
      const user = userEvent.setup();
      renderAc();
      const input = getInput();
      await user.click(input);

      await user.keyboard('{ArrowDown}');
      expect(activeOption()?.textContent).toBe('apple');
      // autoComplete=true (vanguard default) -> inline completion of the highlighted label
      expect(input.value).toBe('apple');
      // Autocomplete.tsx:294 detectFocusedOption reads `Mui-focused` off `.MuiAutocomplete-option`
      expect.soft(activeOption()).toHaveClass('MuiAutocomplete-option', 'Mui-focused');

      await user.keyboard('{ArrowDown}');
      expect(activeOption()?.textContent).toBe('banana');
    });

    test('[v5-quirk] ArrowUp from closed only opens; a second ArrowUp highlights the last option', async () => {
      // Baseline characterization: not a promised contract.
      const user = userEvent.setup();
      renderAc();
      const input = getInput();
      await user.click(input);
      await user.keyboard('{Escape}');

      await user.keyboard('{ArrowUp}');
      expect(input).toHaveAttribute('aria-expanded', 'true');
      expect(input).not.toHaveAttribute('aria-activedescendant');

      await user.keyboard('{ArrowUp}');
      expect(activeOption()?.textContent).toBe('cherry');
    });

    test('Enter selects the highlighted option and closes the listbox', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      renderAc({ onChange });
      const input = getInput();
      await user.click(input);
      await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(expect.anything(), 'banana', 'selectOption', { option: 'banana' });
      expect(input.value).toBe('banana');
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    test('Tab with a highlighted option auto-selects it (autoSelect default) with reason "blur"', async () => {
      const onChange = vi.fn();
      const onInputChange = vi.fn();
      const user = userEvent.setup();
      renderAc({ onChange, onInputChange });
      await user.click(getInput());
      await user.keyboard('{ArrowDown}');
      await user.tab();

      expect(onChange).toHaveBeenCalledWith(expect.anything(), 'apple', 'blur', { option: 'apple' });
      expect(onInputChange.mock.calls.map((c) => [c[1], c[2]])).toEqual([['apple', 'reset']]);
      expect(getInput().value).toBe('apple');
    });

    test('autoSelect=false: Tab with a highlighted option does not select it', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      renderAc({ onChange, autoSelect: false });
      await user.click(getInput());
      await user.keyboard('{ArrowDown}');
      await user.tab();

      expect(onChange).not.toHaveBeenCalled();
      expect(getInput().value).toBe('');
    });

    test('forwards onKeyDown and onKeyUp', async () => {
      const onKeyDown = vi.fn();
      const onKeyUp = vi.fn();
      const user = userEvent.setup();
      renderAc({ onKeyDown, onKeyUp });
      await user.click(getInput());
      await user.keyboard('x');

      expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: 'x' }));
      expect(onKeyUp).toHaveBeenCalledWith(expect.objectContaining({ key: 'x' }));
    });

    test('autoHighlight highlights the first match while typing', async () => {
      const user = userEvent.setup();
      renderAc({ autoHighlight: true });
      await user.type(getInput(), 'ch');
      expect(activeOption()?.textContent).toBe('cherry');
      expect(optionLabels()).toEqual(['cherry']);
    });
  });

  describe('filtering and option rendering', () => {
    const highlightParts = (name: string) =>
      // found by textContent: the split <span>s make the computed accessible name unreliable in jsdom
      (
        Array.from(
          screen
            .getAllByRole('option')
            .find((o) => o.textContent === name)!
            .querySelectorAll('.option-style > span > span'),
        ) as HTMLElement[]
      ).map((p) => [p.textContent, p.style.fontWeight]);

    test('typing filters options (MUI default: case-insensitive "contains")', async () => {
      const user = userEvent.setup();
      renderAc();
      await user.type(getInput(), 'AN');
      expect(optionLabels()).toEqual(['banana']);
    });

    test('[v5-quirk] a mid-word match is not bolded (autosuggest-highlight matches word starts only)', async () => {
      // Baseline characterization: not a promised contract.
      const user = userEvent.setup();
      renderAc();
      await user.type(getInput(), 'AN');
      expect(highlightParts('banana')).toEqual([['banana', '400']]);
    });

    test('a word-start match is bolded (fontWeight 700) in the option', async () => {
      const user = userEvent.setup();
      renderAc();
      await user.type(getInput(), 'ba');
      expect(highlightParts('banana')).toEqual([
        ['ba', '700'],
        ['nana', '400'],
      ]);
    });

    test('highlightOptions=false renders the plain label without option-style markup', async () => {
      const user = userEvent.setup();
      renderAc({ highlightOptions: false });
      await user.click(getInput());

      const option = screen.getByRole('option', { name: 'apple' });
      expect(option.querySelector('.option-style')).toBeNull();
      expect(option.innerHTML).toBe('<div>apple</div>');
    });

    test('custom filterOptions is honoured', async () => {
      const user = userEvent.setup();
      renderAc({ filterOptions: (opts: string[]) => opts.filter((o) => o.startsWith('c')) });
      await user.click(getInput());
      expect(optionLabels()).toEqual(['cherry']);
    });

    test('[v5-quirk] no match with default noOptionsText opens an empty popup (no listbox, no text)', async () => {
      // Baseline characterization: not a promised contract.
      const user = userEvent.setup();
      const { container } = renderAc();
      await user.type(getInput(), 'zz');

      expect(screen.queryByRole('listbox')).toBeNull();
      const portals = bodyPortals(container);
      expect(portals).toHaveLength(1);
      expect(portals[0].textContent).toBe('');
    });

    test('string noOptionsText goes through the translation service and shows in the popup', async () => {
      const user = userEvent.setup();
      const { container } = renderAc({ noOptionsText: 'No fruit found' });
      await user.type(getInput(), 'zz');
      const text = screen.getByText('No fruit found');
      expect(container.contains(text)).toBe(false);
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    test('ReactNode noOptionsText is rendered untouched in the popup', async () => {
      const user = userEvent.setup();
      const { container } = renderAc({ noOptionsText: <span data-testid={'no-opts'}>{'nothing'}</span> });
      await user.type(getInput(), 'zz');
      const node = screen.getByTestId('no-opts');
      expect(node.textContent).toBe('nothing');
      expect(container.contains(node)).toBe(false);
    });
  });

  describe('single selection callbacks', () => {
    test('clicking an option: onChange(value, "selectOption", {option}) and onInputChange reasons input -> reset', async () => {
      const onChange = vi.fn();
      const onInputChange = vi.fn();
      const user = userEvent.setup();
      renderAc({ onChange, onInputChange });
      const input = getInput();

      await user.type(input, 'an');
      await user.click(screen.getByRole('option', { name: 'banana' }));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }), 'banana', 'selectOption', {
        option: 'banana',
      });
      // v6 reports 'selectOption' instead of 'reset' for the post-selection input sync
      expect(onInputChange.mock.calls.map((c) => [c[1], c[2]])).toEqual([
        ['a', 'input'],
        ['an', 'input'],
        ['banana', 'reset'],
      ]);
      expect(input.value).toBe('banana');
      // a value makes the clear button available
      expect(screen.getByTitle('Clear')).toBeInTheDocument();
    });

    test('blur with unmatched text clears the input with onInputChange reason "reset" and no onChange', async () => {
      const onChange = vi.fn();
      const onInputChange = vi.fn();
      const user = userEvent.setup();
      renderAc({ onChange, onInputChange });

      await user.type(getInput(), 'zz');
      await user.tab();

      expect(onChange).not.toHaveBeenCalled();
      // v6 reports 'blur' here
      expect(onInputChange.mock.calls.map((c) => [c[1], c[2]])).toEqual([
        ['z', 'input'],
        ['zz', 'input'],
        ['', 'reset'],
      ]);
      expect(getInput().value).toBe('');
    });

    test('clear button: hidden until focused, click clears with reason "clear" for both callbacks', async () => {
      const onChange = vi.fn();
      const onInputChange = vi.fn();
      const user = userEvent.setup();
      renderAc({ onChange, onInputChange });
      const input = getInput();
      await user.click(input);
      await user.click(screen.getByRole('option', { name: 'cherry' }));
      await user.tab();

      // MUI hides the clear indicator (visibility: hidden) unless the root is focused/hovered
      const clearBtn = screen.getByTitle('Clear');
      expect(clearBtn.tagName).toBe('BUTTON');
      expect(clearBtn).toHaveAttribute('aria-label', 'Clear');
      expect(clearBtn).toHaveAttribute('tabindex', '-1');
      expect(getComputedStyle(clearBtn).visibility).toBe('hidden');
      expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();
      // Autocomplete.scss:52,67 target these
      expect.soft(clearBtn).toHaveClass('MuiAutocomplete-clearIndicator');
      expect.soft(clearBtn.parentElement).toHaveClass('MuiAutocomplete-endAdornment');

      act(() => input.focus());
      // (focused => visible is asserted in the browser story; jsdom's cascade does not resolve that rule)
      onChange.mockClear();
      onInputChange.mockClear();
      await user.click(screen.getByTitle('Clear'));

      expect(onChange).toHaveBeenCalledWith(expect.anything(), null, 'clear', undefined);
      expect(onInputChange.mock.calls.map((c) => [c[1], c[2]])).toEqual([['', 'clear']]);
      expect(input.value).toBe('');
      // nothing left to clear -> the clear button is gone
      expect(screen.queryByTitle('Clear')).toBeNull();
    });

    test('blurOnSelect blurs the input after selection', async () => {
      const user = userEvent.setup();
      renderAc({ blurOnSelect: true });
      const input = getInput();
      await user.click(input);
      await user.click(screen.getByRole('option', { name: 'apple' }));
      expect(input).not.toHaveFocus();
      expect(input.value).toBe('apple');
    });

    test('forwards onFocus and onBlur', async () => {
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      const user = userEvent.setup();
      renderAc({ onFocus, onBlur });
      await user.click(getInput());
      await user.tab();
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    test('works without an onChange callback', async () => {
      const user = userEvent.setup();
      renderAc();
      await user.click(getInput());
      await user.click(screen.getByRole('option', { name: 'apple' }));
      expect(getInput().value).toBe('apple');
    });
  });

  describe('value prop (controlled vs uncontrolled)', () => {
    // CURRENT BEHAVIOUR (suspected bug): initial state is `(value ?? multiple) ? [] : null`, so a provided
    // `value` turns into `[]` and is never synced afterwards -> the `value` prop does not show in the input.
    test('[bug-lock] a provided single `value` is NOT reflected in the input', () => {
      // Baseline characterization: not a promised contract.
      renderAc({ value: 'banana' });
      expect(getInput().value).toBe('');
    });

    test('uncontrolled: selection is kept internally', async () => {
      const user = userEvent.setup();
      renderAc();
      await user.click(getInput());
      await user.click(screen.getByRole('option', { name: 'apple' }));
      await user.click(getInput());
      expect(screen.getByRole('option', { name: 'apple' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('option', { name: 'banana' })).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('freeSolo (restrictToOptions=false)', () => {
    test('Enter on free text creates a value with reason "createOption"', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      renderAc({ restrictToOptions: false, onChange });
      await user.type(getInput(), 'kiwi{Enter}');

      expect(onChange).toHaveBeenCalledWith(expect.anything(), 'kiwi', 'createOption', { option: 'kiwi' });
      expect(getInput().value).toBe('kiwi');
    });

    test('freeSolo does not open a no-options popup and keeps free text on blur', async () => {
      const user = userEvent.setup();
      const { container } = renderAc({ restrictToOptions: false, noOptionsText: 'never shown' });
      await user.type(getInput(), 'zz');
      expect(screen.queryByText('never shown')).toBeNull();
      expect(screen.queryByRole('listbox')).toBeNull();
      bodyPortals(container).forEach((portal) => { expect(portal.textContent).toBe(''); });
      await user.tab();
      expect(getInput().value).toBe('zz');
    });
  });

  describe('disabled', () => {
    test('disables the input and the popup indicator; clicking does not open', async () => {
      const user = userEvent.setup();
      renderAc({ disabled: true });
      const input = getInput();
      expect(input).toBeDisabled();
      expect(screen.getByTitle('Open')).toBeDisabled();
      await user.click(input);
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });

  describe('multiple + chips (renderTags)', () => {
    const selectTwo = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(getInput());
      await user.click(screen.getByRole('option', { name: 'apple' }));
      await user.click(getInput());
      await user.click(screen.getByRole('option', { name: 'banana' }));
    };

    test('selected values render as deletable chips (vanguard renderTags) before the input', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      renderAc({ multiple: true, onChange });
      await selectTwo(user);

      expect(onChange).toHaveBeenLastCalledWith(expect.anything(), ['apple', 'banana'], 'selectOption', {
        option: 'banana',
      });
      expect(getInput().value).toBe('');

      // v9 removes renderTags (-> renderValue): the vanguard wrapper, the <Text> label and the inline height vanish
      const tags = getRoot().querySelector('.vanguard-input-tags') as HTMLElement;
      expect(tags).not.toBeNull();
      expect(tags.compareDocumentPosition(getInput()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(chipLabels()).toEqual(['apple', 'banana']);
      getChips().forEach((chip, index) => {
        // not in the Tab order; reachable with ArrowLeft (see below)
        expect(chip).toHaveAttribute('tabindex', '-1');
        expect(chip.style.height).toBe('100%');
        expect(within(chip).getByText(FRUITS[index])).toHaveClass('rc-text');
        expect(chipDeleteIcon(chip)).not.toBeNull();
      });
    });

    test('selected options are marked aria-selected in the open listbox', async () => {
      const user = userEvent.setup();
      renderAc({ multiple: true });
      await selectTwo(user);
      await user.click(getInput());
      expect(screen.getAllByRole('option').map((o) => [o.textContent, o.getAttribute('aria-selected')])).toEqual([
        ['apple', 'true'],
        ['banana', 'true'],
        ['cherry', 'false'],
      ]);
    });

    test('clicking a chip delete icon removes it with reason "removeOption"', async () => {
      const onChange = vi.fn();
      const onInputChange = vi.fn();
      const user = userEvent.setup();
      renderAc({ multiple: true, onChange, onInputChange });
      await selectTwo(user);
      onChange.mockClear();
      onInputChange.mockClear();

      await user.click(chipDeleteIcon(getChips()[0]));

      expect(onChange).toHaveBeenCalledWith(expect.anything(), ['banana'], 'removeOption', { option: 'apple' });
      expect(onInputChange).not.toHaveBeenCalled();
      expect(chipLabels()).toEqual(['banana']);
    });

    test('Backspace in the empty input removes the last chip with reason "removeOption"', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      renderAc({ multiple: true, onChange });
      await selectTwo(user);
      onChange.mockClear();

      getInput().focus();
      await user.keyboard('{Backspace}');

      expect(onChange).toHaveBeenCalledWith(expect.anything(), ['apple'], 'removeOption', { option: 'banana' });
      expect(chipLabels()).toEqual(['apple']);
    });

    test('ArrowLeft from the empty input moves focus to the last chip, then the previous one', async () => {
      const user = userEvent.setup();
      renderAc({ multiple: true });
      await selectTwo(user);
      getInput().focus();

      await user.keyboard('{ArrowLeft}');
      expect(document.activeElement).toBe(getChips()[1]);
      await user.keyboard('{ArrowLeft}');
      expect(document.activeElement).toBe(getChips()[0]);
      await user.keyboard('{ArrowRight}{ArrowRight}');
      expect(getInput()).toHaveFocus();
    });

    test('typing then Enter on the highlighted option adds it; onInputChange resets to "" with reason "reset"', async () => {
      const onChange = vi.fn();
      const onInputChange = vi.fn();
      const user = userEvent.setup();
      renderAc({ multiple: true, onChange, onInputChange });
      await user.type(getInput(), 'ch');
      await user.keyboard('{ArrowDown}{Enter}');

      expect(onChange).toHaveBeenCalledWith(expect.anything(), ['cherry'], 'selectOption', { option: 'cherry' });
      expect(onInputChange.mock.calls.map((c) => [c[1], c[2]])).toEqual([
        ['c', 'input'],
        ['ch', 'input'],
        ['', 'reset'],
      ]);
    });

    test('chip labels use option[optionKey] for object options', async () => {
      const user = userEvent.setup();
      renderAc({ multiple: true, optionKey: 'value', options: COUNTRIES });
      await user.click(getInput());
      await user.click(screen.getByRole('option', { name: 'France' }));
      expect(chipLabels()).toEqual(['France']);
    });

    test('renderTags returns nothing for single mode (no tags wrapper)', async () => {
      const user = userEvent.setup();
      renderAc();
      await user.click(getInput());
      await user.click(screen.getByRole('option', { name: 'apple' }));
      expect(getRoot().querySelector('.vanguard-input-tags')).toBeNull();
      expect(within(screen.getByTestId('ac-input')).queryByText('apple')).toBeNull();
    });
  });

  describe('splitCommaTag', () => {
    test('Enter splits comma separated free text into tags with reason "selectOption"', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      renderAc({ multiple: true, splitCommaTag: true, onChange });
      await user.type(getInput(), 'kiwi,lime');
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(expect.anything(), ['kiwi', 'lime'], 'selectOption', undefined);
      expect(chipLabels()).toEqual(['kiwi', 'lime']);
    });

    test('with optionKey the split parts become objects keyed by optionKey', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      renderAc({ multiple: true, splitCommaTag: true, optionKey: 'value', options: COUNTRIES, onChange });
      await user.type(getInput(), 'Spain,Italy');
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith(
        expect.anything(),
        [{ value: 'Spain' }, { value: 'Italy' }],
        'selectOption',
        undefined,
      );
    });

    // CURRENT BEHAVIOUR (suspected bug): splitOnEnter runs on every Enter (detectFocusedOption never flips
    // optionFocused to true), so Enter with an empty input re-emits onChange with the unchanged array.
    test('[bug-lock] Enter on an empty input re-emits onChange with the unchanged tags', async () => {
      // Baseline characterization: not a promised contract.
      const onChange = vi.fn();
      const user = userEvent.setup();
      renderAc({ multiple: true, splitCommaTag: true, onChange });
      await user.type(getInput(), 'kiwi{Enter}');
      onChange.mockClear();

      await user.keyboard('{Enter}');
      expect(onChange).toHaveBeenCalledWith(expect.anything(), ['kiwi'], 'selectOption', undefined);
    });

    // CURRENT BEHAVIOUR (suspected bug): with an option highlighted, Enter is handled by splitOnEnter (which
    // stops propagation so MUI never selects); the tag comes from the inline-completed input text.
    test('[bug-lock] Enter on a highlighted option adds the inline-completed input text via the split path', async () => {
      // Baseline characterization: not a promised contract.
      const onChange = vi.fn();
      const user = userEvent.setup();
      renderAc({ multiple: true, splitCommaTag: true, onChange });
      await user.type(getInput(), 'ban');
      await user.keyboard('{ArrowDown}{Enter}');

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(expect.anything(), ['banana'], 'selectOption', undefined);
    });

    test('single mode + splitCommaTag: Enter starts a fresh array from the split text', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      renderAc({ splitCommaTag: true, restrictToOptions: false, onChange });
      await user.type(getInput(), 'a,b');
      await user.keyboard('{Enter}');
      expect(onChange).toHaveBeenCalledWith(expect.anything(), ['a', 'b'], 'selectOption', undefined);
    });
  });

  describe('object options: optionKey / getOptionLabel / isOptionEqualToValue', () => {
    test('labels come from option[optionKey]; selecting sets the input to that label', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      renderAc({ optionKey: 'value', options: COUNTRIES, onChange });
      await user.click(getInput());
      expect(optionLabels()).toEqual(['Germany', 'France']);

      await user.click(screen.getByRole('option', { name: 'France' }));
      expect(onChange).toHaveBeenCalledWith(expect.anything(), COUNTRIES[1], 'selectOption', {
        option: COUNTRIES[1],
      });
      expect(getInput().value).toBe('France');

      await user.click(getInput());
      // equality by optionKey, not identity
      expect(screen.getByRole('option', { name: 'France' })).toHaveAttribute('aria-selected', 'true');
    });

    test('object options without optionKey render empty labels and warn', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const user = userEvent.setup();
      renderAc({ options: COUNTRIES });
      await user.click(getInput());
      expect(optionLabels()).toEqual(['', '']);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("Autocomplete: 'optionKey' = undefined"));
    });

    test('with optionKey set, objects carrying `objectType` (but not optionKey) do not warn and get an empty label', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const user = userEvent.setup();
      renderAc({ optionKey: 'value', options: [{ objectType: 'x', name: 'A' }] });
      await user.click(getInput());
      expect(optionLabels()).toEqual(['']);
      expect(warn).not.toHaveBeenCalledWith(expect.stringContaining("Autocomplete: 'optionKey' = "));
    });

    test('an option missing optionKey warns in getOptionLabel and isOptionEqualToValue', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const user = userEvent.setup();
      renderAc({ optionKey: 'value', options: [...COUNTRIES, { key: 2, name: 'Spain' }] });
      await user.click(getInput());
      await user.click(screen.getByRole('option', { name: 'Germany' }));
      await user.click(getInput());

      expect(warn).toHaveBeenCalledWith(expect.stringContaining("Autocomplete: 'optionKey' = value doesn't match"));
      expect(warn).toHaveBeenCalledWith("Autocomplete: 'optionKey' doesn't match options properties!", 'value');
    });

    test('object options without optionKey compare by identity once selected', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const onChange = vi.fn();
      const user = userEvent.setup();
      renderAc({ options: COUNTRIES, onChange });
      await user.click(getInput());
      await user.click(screen.getAllByRole('option')[1]);
      expect(onChange).toHaveBeenCalledWith(expect.anything(), COUNTRIES[1], 'selectOption', { option: COUNTRIES[1] });

      await user.click(getInput());
      expect(screen.getAllByRole('option').map((o) => o.getAttribute('aria-selected'))).toEqual(['false', 'true']);
    });

    // CURRENT BEHAVIOUR (suspected bug): getOptionLabel returns '' when Object.keys(option) is empty, which is
    // true for every number -> numeric options render empty labels; isOptionEqualToValue(_, 0) is always false.
    test('[bug-lock] numeric options render empty labels and a selected 0 is never marked selected', async () => {
      // Baseline characterization: not a promised contract.
      const onChange = vi.fn();
      const user = userEvent.setup();
      renderAc({ options: [0, 1] as any, onChange });
      await user.click(getInput());
      expect(optionLabels()).toEqual(['', '']);

      await user.keyboard('{ArrowDown}{Enter}');
      expect(onChange).toHaveBeenCalledWith(expect.anything(), 0, 'selectOption', { option: 0 });
      expect(getInput().value).toBe('');

      await user.click(getInput());
      expect(screen.getAllByRole('option').map((o) => o.getAttribute('aria-selected'))).toEqual(['false', 'false']);
    });

    test('empty object options get an empty label', async () => {
      const user = userEvent.setup();
      renderAc({ optionKey: 'value', options: [{}] });
      await user.click(getInput());
      expect(optionLabels()).toEqual(['']);
    });
  });

  describe('adornment', () => {
    const adornment = [<span key={'0'} data-testid={'flag-0'} />, <span key={'1'} data-testid={'flag-1'} />];

    test('options render their adornment[option.key]; selecting puts it into the input start adornment', async () => {
      const user = userEvent.setup();
      renderAc({ optionKey: 'value', options: COUNTRIES, adornment });
      await user.click(getInput());
      expect(within(screen.getByRole('option', { name: 'France' })).getByTestId('flag-1')).toBeInTheDocument();

      await user.click(screen.getByRole('option', { name: 'France' }));
      const flag = within(screen.getByTestId('ac-input')).getByTestId('flag-1');
      // start adornment: rendered before the input
      expect(flag.compareDocumentPosition(getInput()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    test('clearing removes the start adornment', async () => {
      const user = userEvent.setup();
      renderAc({ optionKey: 'value', options: COUNTRIES, adornment });
      await user.click(getInput());
      await user.click(screen.getByRole('option', { name: 'Germany' }));
      expect(screen.getByTestId('flag-0')).toBeInTheDocument();
      await user.click(screen.getByTitle('Clear'));
      expect(screen.queryByTestId('flag-0')).toBeNull();
    });
  });

  describe('formconfig integration', () => {
    const makeFormconfig = (stateValue: any) => ({
      _autocompleteRef: { current: null as any },
      _inputRef: { current: null as any },
      stateValue,
      setStateValue: vi.fn((v: unknown) => ({ type: 'mui-contract/noop', payload: v })),
      validation: { required: true },
    });

    test('hydrates from stateValue, binds refs, marks required and dispatches setStateValue on change', async () => {
      const formconfig = makeFormconfig(COUNTRIES[1]);
      const user = userEvent.setup();
      render(
        <Autocomplete
          testId={'ac'}
          label={'Country'}
          optionKey={'value'}
          options={COUNTRIES}
          formconfig={formconfig as any}
          adornment={[<span key={'0'} data-testid={'flag-0'} />, <span key={'1'} data-testid={'flag-1'} />]}
        />,
      );
      const input = getInput();

      await waitFor(() => expect(input.value).toBe('France'));
      expect(input).toBeRequired();
      expect(formconfig._inputRef.current).toBe(input);
      // MUI Autocomplete root receives the `_autocompleteRef`
      expect(formconfig._autocompleteRef.current).toBe(getRoot());
      expect(formconfig._autocompleteRef.current.value).toEqual(COUNTRIES[1]);
      expect(screen.getByTestId('flag-1')).toBeInTheDocument();

      await user.click(input);
      await user.click(screen.getByRole('option', { name: 'Germany' }));
      expect(formconfig.setStateValue).toHaveBeenCalledWith(COUNTRIES[0]);
    });

    test('works with a formconfig lacking _autocompleteRef / setStateValue', async () => {
      const onChange = vi.fn();
      const formconfig = { _inputRef: { current: null as any }, stateValue: null };
      const user = userEvent.setup();
      render(
        <Autocomplete testId={'ac'} label={'X'} options={FRUITS} formconfig={formconfig as any} onChange={onChange} />,
      );
      await user.click(getInput());
      await user.click(screen.getByRole('option', { name: 'apple' }));
      expect(onChange).toHaveBeenCalledWith(expect.anything(), 'apple', 'selectOption', { option: 'apple' });
      expect(formconfig._inputRef.current).toBe(getInput());
    });

    test('validation.required=false overrides the `required` prop', () => {
      const formconfig = { ...makeFormconfig(null), validation: { required: false } };
      render(<Autocomplete testId={'ac'} label={'X'} options={FRUITS} required formconfig={formconfig as any} />);
      expect(getInput()).not.toBeRequired();
    });

    test('a stateValue object without optionKey warns from isOptionEqualToValue', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const formconfig = makeFormconfig({ other: 'x' });
      const user = userEvent.setup();
      render(
        <Autocomplete
          testId={'ac'}
          label={'X'}
          optionKey={'value'}
          options={COUNTRIES}
          formconfig={formconfig as any}
        />,
      );
      await waitFor(() => expect(formconfig._autocompleteRef.current?.value).toEqual({ other: 'x' }));
      await user.click(getInput());
      await waitFor(() =>
        expect(warn).toHaveBeenCalledWith("Autocomplete: 'optionKey' doesn't match value's properties!", 'value'),
      );
    });
  });

  describe('popper stacking (OverlayStackingService)', () => {
    test('opening registers a popover slot applied as popper z-index (sx); closing releases it', async () => {
      const user = userEvent.setup();
      renderAc();
      expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX);

      await user.click(getInput());
      expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX + 1);
      const popper = portalRoot(screen.getByRole('listbox'));
      // sx (emotion class), not inline style: MUI keeps its own inline width style
      expect(popper.style.zIndex).toBe('');
      expect(getComputedStyle(popper).zIndex).toBe(String(OVERLAY_BASE_Z_INDEX + 1));

      await user.keyboard('{Escape}');
      expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX);
    });

    test('stacks above a modal that raised the floor', async () => {
      const modalZ = OverlayStackingService.register('host-modal', 'modal', 5000);
      const user = userEvent.setup();
      renderAc();
      await user.click(getInput());
      const popper = portalRoot(screen.getByRole('listbox'));
      expect(Number(getComputedStyle(popper).zIndex)).toBeGreaterThan(modalZ);
    });

    test('unmounting while open releases the slot', async () => {
      const user = userEvent.setup();
      const { unmount } = renderAc();
      await user.click(getInput());
      expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX + 1);
      unmount();
      expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX);
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    test('controlled open=true registers on mount and survives MUI close callbacks; open=false releases', async () => {
      const user = userEvent.setup();
      const { rerender } = renderAc({ open: true });
      expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX + 1);

      getInput().focus();
      await user.keyboard('{Escape}');
      expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX + 1);

      rerender(<Autocomplete testId={'ac'} label={'Fruit'} options={FRUITS} open={false} />);
      expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX);
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });
});
