import { fireEvent, type RenderResult } from '@testing-library/react';
import { createRef, type ElementType, type ReactElement, type ReactNode } from 'react';
import { expect } from 'vitest';
import scannedShapes from './reachable-route-shapes.json';

type Shape = {
  keys: string[];
  values?: Record<string, unknown>;
  host?: 'SearchableSelect' | 'Menu items';
};
type RouteName = keyof typeof scannedShapes;
type Components = Partial<Record<RouteName | 'Render' | 'SearchableSelect', ElementType>>;
type Render = (view: ReactElement) => RenderResult;

const shapes = scannedShapes as Record<RouteName, Shape[]>;
export const sourceRoutes = (Object.keys(shapes) as RouteName[]).filter((name) => shapes[name].length > 0);
export const packedRoutes = sourceRoutes.filter((name) => name !== 'PopoverPopper');
const options = [
  { key: 'apple', value: 'apple', title: 'Apple' },
  { key: 'plum', value: 'plum', title: 'Plum' },
];
const menuLabel = 'Fixture menu item';
const noop = () => {};
const PassThrough = ({ children }: { children: ReactNode }) => <>{children}</>;

function valuesFor(anchor: HTMLButtonElement) {
  return {
    anchorEl: anchor,
    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
    transformOrigin: { vertical: 'top', horizontal: 'left' },
    PaperProps: { className: 'fixture-media-menu-paper' },
    autoHideDuration: 3000,
    children: 'Fixture content',
    className: 'fixture',
    content: 'Fixture popover',
    id: 'fixture',
    'aria-checked': false,
    key: 'fixture',
    label: 'Fruit',
    'data-testid': 'fixture',
    testId: 'fixture',
    size: 'small',
    chipSize: 'small',
    disabled: false,
    controlled: true,
    fullWidth: true,
    open: true,
    isOpen: true,
    onClose: noop,
    onClick: noop,
    onChange: noop,
    onInputChange: noop,
    onBlur: noop,
    onKeyDown: noop,
    filterOptions: (entries: typeof options) => entries,
    getOptionLabel: (entry: (typeof options)[number]) => entry.title,
    isOptionEqualToValue: (entry: (typeof options)[number], value: (typeof options)[number]) => entry.key === value?.key,
    renderOption: (props: Record<string, unknown>, entry: (typeof options)[number]) => (
      <li {...props}>{entry.title}</li>
    ),
    noOptionsText: 'No fruit',
    loading: false,
    loadingText: 'Loading fruit',
    placeholder: 'Pick fruit',
    inputAriaLabel: 'Fruit input',
    optionKey: 'title',
    options,
    value: null,
    formconfig: { _inputRef: createRef<HTMLInputElement>(), _autocompleteRef: createRef<HTMLInputElement>() },
    ref: createRef<HTMLElement>(),
    inputRef: createRef<HTMLInputElement>(),
    inputValue: '',
    style: { top: 10 },
    height: 200,
    width: 280,
    zIndex: 7,
    position: 'fixed',
    popoverPosition: 'top',
    popoverMessage: 'Fixture help',
    adornment: [],
    replacements: {},
    labelType: 'static',
    infoText: 'Fixture help',
    icon: 'settings',
    iconPosition: 'before',
    iconProps: { forceSize: 16 },
    selected: true,
    useActiveIcon: true,
    role: 'menuitemcheckbox',
    items: [{ key: 'fixture', children: menuLabel }],
    TransitionComponent: PassThrough,
    clearText: 'Clear',
    closeText: 'Close',
    openText: 'Open',
    autoHighlight: true,
    autoSelect: true,
    blurOnSelect: true,
    clearOnBlur: true,
    disableBackdropClick: true,
    disableCloseOnSelect: true,
    hideCaret: true,
    hideClearButton: true,
    multiple: true,
    openOnFocus: true,
    required: true,
    restrictToOptions: true,
    splitCommaTag: true,
  } satisfies Record<string, unknown>;
}

export function replayRouteShapes(
  name: RouteName,
  components: Components,
  render: Render,
  wordpress = false,
  assertNoMuiPopperRequest?: () => void,
) {
  const cases: Shape[] = wordpress ? [{ keys: ['options'] }] : shapes[name];
  const { Menu, MenuItem, Render, SearchableSelect } = components;
  const Component = components[name];
  if (!Component) throw new Error(`Missing ${name} in the fixture's component entry`);

  for (const shape of cases) {
    const description = `${name} (${shape.keys.join(', ')})`;
    const anchor = document.createElement('button');
    document.body.append(anchor);
    const defaults: Record<string, unknown> = valuesFor(anchor);
    for (const key of shape.keys) {
      expect(key in defaults || Object.hasOwn(shape.values ?? {}, key), `${description}: fixture value for ${key}`).toBe(true);
    }
    const props = Object.fromEntries(shape.keys.map((key) => [key, shape.values?.[key] ?? defaults[key]]));
    if (name === 'Autocomplete' && shape.keys.includes('value') && props.multiple) props.value = [];
    if (name === 'Snackbar') {
      props.children = <span>Fixture snackbar</span>;
      props.anchorOrigin = shape.keys.includes('TransitionComponent')
        ? { vertical: 'top', horizontal: 'right' }
        : { vertical: 'bottom', horizontal: 'center' };
    }

    let view: RenderResult | undefined;
    try {
      if (name === 'Menu' && props.children && MenuItem && Render) {
        props.children = <Render if><MenuItem>{menuLabel}</MenuItem></Render>;
      }
      if (name === 'MenuItem' && shape.host === 'SearchableSelect' && SearchableSelect) {
        view = render(<SearchableSelect options={options} value="apple" />);
        fireEvent.mouseDown(view.getByRole('combobox'), { button: 0 });
        const option = view.getByRole('option', { name: 'Plum' });
        expect(option.hasAttribute('data-vg-core'), description).toBe(true);
        continue;
      }
      if (name === 'MenuItem' && Menu) {
        props.children = menuLabel;
        view = render(
          shape.host === 'Menu items' ? (
            <Menu anchorEl={anchor} open items={[props]} />
          ) : (
            <Menu anchorEl={anchor} open><Component {...props} /></Menu>
          ),
        );
        const option = view.getByText(menuLabel).closest('.MuiMenuItem-root');
        expect(option?.hasAttribute('data-vg-core'), description).toBe(true);
        continue;
      }

      view = render(<Component {...props} />);
      const selectors = {
        Autocomplete: '.MuiAutocomplete-root[data-vg-core] input[role="combobox"]',
        Menu: '.MuiMenu-root[data-vg-core] [role="menu"]',
        Snackbar: '.MuiSnackbar-root[data-vg-core]',
        AppBar: 'header.MuiAppBar-root[data-vg-core]',
        Toolbar: '.MuiToolbar-root[data-vg-core]',
        PopoverModal: '[role="tooltip"].MuiPopper-root',
        PopoverPopper: '.vanguard-popover[data-slot="popper"]',
      };
      const selector = selectors[name as keyof typeof selectors];
      const content = document.body.querySelector(selector);
      expect(content, description).not.toBeNull();
      if (name === 'PopoverModal') {
        expect(content?.hasAttribute('data-vg-core'), description).toBe(true);
        if (props.renderInPortal) expect(content?.parentElement, description).toBe(document.body);
        if (props.centerPopover) {
          if (!assertNoMuiPopperRequest) throw new Error('The planner fixture requires a fallback request observer');
          assertNoMuiPopperRequest();
        }
      }
      if (name === 'Menu') expect(view.getByText(menuLabel), description).toBeDefined();
    } catch (cause) {
      throw new Error(description, { cause });
    } finally {
      view?.unmount();
      anchor.remove();
    }
  }
}
