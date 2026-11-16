/**
 * MUI upgrade contract (S0): Select = InputBase(select) -> MUI TextField select -> MUI Select + Menu +
 * MenuItem. Locks the combobox/listbox a11y surface, menu portal + OverlayStackingService slot, option
 * rendering, onChange argument shape and the controlled/uncontrolled split.
 *
 * MUI class names are only queried where Vanguard SCSS depends on them (Select.module.scss:
 * `.MuiPaper-root .MuiList-root .MuiMenuItem-root.Mui-selected`).
 */
import userEvent from '@testing-library/user-event';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { fireEvent, render, screen, waitFor, within } from '../../../test-utils/test-utils';
import { Select, SelectOptionProp, SelectOptionsComponentProps } from './Select';

const LintCustom277 = (p: SelectOptionsComponentProps) => <i data-testid="in-render">{`${p.title}|${p.value}`}</i>;


const options: SelectOptionProp[] = [
  { key: 0, value: 'apple', title: 'Apple', description: 'Red fruit' },
  { key: 1, value: 'banana', title: 'Banana', disabled: true },
  { key: 2, value: 'cherry', title: 'Cherry', leftImageUrl: 'https://example.com/c.png' },
];

const nextOverlayZ = () => {
  const z = OverlayStackingService.register('probe', 'modal');
  OverlayStackingService.unregister('probe');
  return z;
};

const open = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('combobox'));
  return { user, listbox: await screen.findByRole('listbox', {}, { timeout: 5000 }) };
};

afterEach(() => {
  OverlayStackingService.__resetForTests();
});

describe('Select: render and a11y', () => {
  test('renders a collapsed combobox named by its <label>', () => {
    render(<Select id="fruit" label="Fruit" options={options} />);
    const combo = screen.getByRole('combobox', { name: /Fruit/ });
    expect(combo.getAttribute('aria-expanded')).toBe('false');
    expect(combo.getAttribute('aria-haspopup')).toBe('listbox');
    // MUI v5 renders the select label as <label> (v9: <div>)
    const label = document.getElementById('fruit-label') as HTMLElement;
    expect(label.tagName).toBe('LABEL');
    expect(combo.getAttribute('aria-labelledby')).toBe('fruit-label fruit');
  });

  test('[bug-lock] className goes on the container; testId is duplicated on container AND MUI root', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): `testId` is applied to ComponentContainer and, via {...props},
    // to the TextField root, so getByTestId throws (two matches).
    const { container } = render(<Select options={options} className="my-select" testId="sel" />);
    expect((container.firstElementChild as HTMLElement).className).toBe('my-select');
    const matches = screen.getAllByTestId('sel');
    expect(matches).toHaveLength(2);
    expect(matches[0]).toBe(container.firstElementChild);
    // second match is the MUI TextField root wrapping label + combobox
    expect(matches[1].contains(screen.getByRole('combobox'))).toBe(true);
    expect(matches[1].parentElement?.classList.contains('vanguard-input')).toBe(true);
  });

  test('disabled marks the combobox aria-disabled and does not open', async () => {
    const user = userEvent.setup();
    render(<Select options={options} disabled />);
    const combo = screen.getByRole('combobox');
    expect(combo.getAttribute('aria-disabled')).toBe('true');
    await user.click(combo);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  test('required hides the Optional hint and marks the hidden native input required', () => {
    const { container } = render(<Select id="r" label="Req" options={options} required />);
    expect(document.getElementById('r-label')?.textContent).not.toContain('Optional');
    const native = container.querySelector('input') as HTMLInputElement;
    expect(native.required).toBe(true);
    expect(native.getAttribute('aria-hidden')).toBe('true');
    expect(native.tabIndex).toBe(-1);
  });

  test('shows the selected option title (translated) in the combobox', () => {
    render(<Select options={options} value="cherry" />);
    expect(screen.getByRole('combobox').textContent).toBe('Cherry');
  });

  test('no value shows an empty display (zero-width space)', () => {
    render(<Select options={options} />);
    expect(screen.getByRole('combobox').textContent).toBe('​');
  });

  test('without options the display is empty', () => {
    render(<Select value="x" />);
    expect(screen.getByRole('combobox').textContent).toBe('​');
  });

  test('value not in options renders nothing unless freeSolo', () => {
    const { rerender } = render(<Select options={options} value="durian" valueAsDefaultValue={false} />);
    expect(screen.getByRole('combobox').textContent).toBe('​');
    rerender(<Select options={options} value="durian" valueAsDefaultValue={false} freeSolo />);
    expect(screen.getByRole('combobox').textContent).toBe('durian');
  });

  test('translateOptions=false shows the raw title', () => {
    render(<Select options={[{ key: 0, value: 7, title: 'Seven' }]} value={7} translateOptions={false} />);
    expect(screen.getByRole('combobox').textContent).toBe('Seven');
  });
});

describe('Select: menu', () => {
  test('opens a listbox in a body portal with one option per item', async () => {
    render(<Select options={options} />);
    const { listbox } = await open();
    expect(listbox.closest('.MuiMenu-root')?.parentElement).toBe(document.body);
    expect(screen.getByRole('combobox', { hidden: true }).getAttribute('aria-expanded')).toBe('true');
    const items = within(listbox).getAllByRole('option');
    expect(items.map((i) => i.getAttribute('data-value'))).toEqual(['apple', 'banana', 'cherry']);
  });

  test('renders title, description, left image and disabled state per option', async () => {
    render(<Select options={options} />);
    const { listbox } = await open();
    const [apple, banana, cherry] = within(listbox).getAllByRole('option');
    expect(within(apple).getByText('Apple')).toBeTruthy();
    expect(within(apple).getByText('Red fruit')).toBeTruthy();
    expect(banana.getAttribute('aria-disabled')).toBe('true');
    expect(banana.classList.contains('Mui-disabled')).toBe(true);
    expect((cherry.querySelector('img') as HTMLImageElement).getAttribute('src')).toBe('https://example.com/c.png');
  });

  test('marks the current option selected (Select.module.scss targets .MuiMenuItem-root.Mui-selected)', async () => {
    render(<Select options={options} value="cherry" />);
    const { listbox } = await open();
    const cherry = within(listbox).getByRole('option', { name: /Cherry/ });
    expect(cherry.getAttribute('aria-selected')).toBe('true');
    expect(cherry.classList.contains('MuiMenuItem-root')).toBe(true);
    expect(cherry.classList.contains('Mui-selected')).toBe(true);
    expect(cherry.closest('.MuiList-root')?.closest('.MuiPaper-root')).not.toBeNull();
    // the selected option receives focus on open
    await waitFor(() => expect(document.activeElement).toBe(cherry));
  });

  test('clicking an option closes the menu and calls onChange(event, option)', async () => {
    const seen: string[] = [];
    const onChange = vi.fn<(e: React.ChangeEvent<HTMLInputElement>, item?: SelectOptionProp) => number>((e) =>
      seen.push(e.target.value),
    );
    render(<Select options={options} onChange={onChange} />);
    const { user, listbox } = await open();
    await user.click(within(listbox).getByRole('option', { name: /Cherry/ }));
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(seen).toEqual(['cherry']);
    expect(onChange.mock.calls[0][1]).toEqual(options[2]);
    expect(screen.getByRole('combobox').textContent).toBe('Cherry');
  });

  test('disabled options are aria-disabled and not pointer-clickable', async () => {
    render(<Select options={options} />);
    const { listbox } = await open();
    const banana = within(listbox).getByRole('option', { name: /Banana/ });
    expect(banana.getAttribute('aria-disabled')).toBe('true');
    // MUI disables pointer interaction on disabled MenuItems
    expect(getComputedStyle(banana).pointerEvents).toBe('none');
  });

  test("[bug-lock] a synthetic click cannot select a disabled option (v9)", async () => {
    // Baseline characterization: not a promised contract.
    // Approved v9 ButtonBase fix: disabled items reject synthetic activation.
    // Historical v5 selection and its expected migration RED remain in the evidence.
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} />);
    const { listbox } = await open();
    fireEvent.click(within(listbox).getByRole('option', { name: /Banana/ }));
    expect(onChange).not.toHaveBeenCalled();
    expect(within(listbox).getByRole('option', { name: /Banana/ }).getAttribute('aria-selected')).toBe('false');
  });

  test('keyboard: Enter opens, ArrowDown skips disabled, Enter selects; Escape closes without change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} />);
    const combo = screen.getByRole('combobox');
    combo.focus();
    await user.keyboard('{Enter}');
    const listbox = await screen.findByRole('listbox');
    const items = within(listbox).getAllByRole('option');
    await waitFor(() => expect(document.activeElement).toBe(items[0]));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(items[2]);
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(onChange.mock.calls[0][1]).toEqual(options[2]);
    expect(document.activeElement).toBe(combo);

    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(combo);
  });

  test('Tab out of the open menu closes it', async () => {
    render(<Select options={options} />);
    const { user } = await open();
    await user.tab();
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  });

  test('registers an OverlayStackingService popover slot while open', async () => {
    render(<Select options={options} />);
    const { user, listbox } = await open();
    // `.MuiMenu-root` is targeted by src/app-loaders/load-component/root-components.scss:64
    const menuRoot = listbox.closest('.MuiMenu-root') as HTMLElement;
    expect(Number(getComputedStyle(menuRoot).zIndex)).toBe(OVERLAY_BASE_Z_INDEX + 1);
    expect(nextOverlayZ()).toBe(OVERLAY_BASE_Z_INDEX + 2);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(nextOverlayZ()).toBe(OVERLAY_BASE_Z_INDEX + 1);
  });

  test('menu paper is capped to 7 rows of 36px by default and respects overrides', async () => {
    const { unmount } = render(<Select options={options} />);
    let { listbox } = await open();
    expect((listbox.closest('.MuiPaper-root') as HTMLElement).style.maxHeight).toBe('252px');
    unmount();
    render(<Select options={options} menuItemHeight={20} maxMenuItemsUntilScroll={2} />);
    ({ listbox } = await open());
    expect((listbox.closest('.MuiPaper-root') as HTMLElement).style.maxHeight).toBe('40px');
  });

  test('descriptionUnderTitle / containToSelectWidth / ellipsis shape the option content', async () => {
    render(<Select options={options} descriptionUnderTitle containToSelectWidth ellipsis />);
    const { listbox } = await open();
    const apple = within(listbox).getAllByRole('option')[0];
    // jsdom clientWidth is 0, so the max-width is pinned to 0
    expect(apple.style.maxWidth).toBe('0');
    const descWrapper = within(apple).getByText('Apple').parentElement as HTMLElement;
    expect(descWrapper.className).toMatch(/desc/i);
  });
});

describe('Select: adornments and custom renderers', () => {
  test('[bug-lock] adornment[i] is shown in option i, and adornment[selected.key] as start adornment', async () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): the input start adornment is picked by `Number(option.key)`,
    // while the menu uses the option index. They only agree when keys equal indexes.
    const adornment = [<span key="a">A0</span>, <span key="b">A1</span>, <span key="c">A2</span>];
    const keyed: SelectOptionProp[] = [
      { key: 1, value: 'one', title: 'One' },
      { key: 2, value: 'two', title: 'Two' },
    ];
    const { container } = render(<Select options={keyed} adornment={adornment} value="one" />);
    const inputRoot = container.querySelector('.MuiOutlinedInput-root') as HTMLElement;
    expect(inputRoot.firstElementChild?.textContent).toBe('A1');
    expect(inputRoot.firstElementChild?.nextElementSibling).toBe(screen.getByRole('combobox'));
    const { listbox } = await open();
    const items = within(listbox).getAllByRole('option');
    expect(items[0].textContent).toContain('A0');
    expect(items[1].textContent).toContain('A1');
  });

  test('customOptionsRenderer replaces option content and receives option + selectedItem', async () => {
    const Custom = vi.fn((p: SelectOptionsComponentProps) => <b data-testid={`opt-${p.value}`}>{p.title}!</b>);
    render(<Select options={options} customOptionsRenderer={Custom} value="apple" />);
    await open();
    expect(screen.getByTestId('opt-apple').textContent).toBe('Apple!');
    const lastProps = Custom.mock.calls.at(-1)?.[0] as SelectOptionsComponentProps;
    expect(lastProps.selectedItem).toEqual(options[0]);
    expect(screen.queryByText('Red fruit')).toBeNull();
  });

  test('customInputRenderer renders the combobox content, with an empty item when no match', () => {
    const Custom = LintCustom277;
    const { rerender } = render(
      <Select options={options} customInputRenderer={Custom} value="banana" valueAsDefaultValue={false} />,
    );
    expect(screen.getByTestId('in-render').textContent).toBe('Banana|banana');
    rerender(<Select options={options} customInputRenderer={Custom} value="zzz" valueAsDefaultValue={false} />);
    expect(screen.getByTestId('in-render').textContent).toBe('|');
  });
});

describe('Select: controlled vs uncontrolled', () => {
  test('[v5-quirk] default (valueAsDefaultValue=true) is uncontrolled: later value props do not change the display', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR: the prop is stored in state and forwarded as MUI defaultValue, which MUI reads
    // only on mount.
    const { rerender } = render(<Select options={options} value="apple" />);
    expect(screen.getByRole('combobox').textContent).toBe('Apple');
    rerender(<Select options={options} value="cherry" />);
    expect(screen.getByRole('combobox').textContent).toBe('Apple');
  });

  test('valueAsDefaultValue=false is controlled: display follows the value prop', () => {
    const { rerender } = render(<Select options={options} value="apple" valueAsDefaultValue={false} />);
    rerender(<Select options={options} value="cherry" valueAsDefaultValue={false} />);
    expect(screen.getByRole('combobox').textContent).toBe('Cherry');
  });

  test('[bug-lock] formconfig.stateValue echoes through onChange with the matching option', () => {
    // Baseline characterization: not a promised contract.
    const onChange = vi.fn();
    const formconfig = {
      _inputRef: { current: null },
      stateValue: 'banana',
      setStateValue: vi.fn((p: unknown) => ({ type: 'mui-contract/noop', payload: p })),
    };
    render(<Select options={options} formconfig={formconfig} onChange={onChange} valueAsDefaultValue={false} />);
    expect(onChange).toHaveBeenCalledWith({ target: { value: 'banana' } }, options[1]);
    // CURRENT BEHAVIOUR (suspected bug): Select's own `[value]` effect runs after InputBase's echo and
    // resets innerValue to the default '' so the display stays empty.
    expect(screen.getByRole('combobox').textContent).toBe('\u200B');
  });
});
