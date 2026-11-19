import * as Vanguard from '@rankingcoach/vanguard';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Accordion, Autocomplete, Button, Form, InfoBox, Input, Popover, Select, Textarea, useFormConfig, useFormStore } from '@rankingcoach/vanguard';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { type ReactElement, useState } from 'react';
import userEvent from '@testing-library/user-event';
import { entryFile, installedBundle, isFromNodeModules } from './installed-package';
import { renderWithProviders } from './providers';
import { packedRoutes, replayRouteShapes } from './replay-route-shapes';

const muiPopperRequests = await vi.hoisted(async () => {
  if (process.env.BUNDLE === 'wp') return undefined;
  const { createRequire, registerHooks } = await import('node:module');
  const { pathToFileURL } = await import('node:url');
  const entry = createRequire(`${process.cwd()}/package.json`).resolve('@rankingcoach/vanguard/dist/index.js');
  const controlUrl = new URL('./index-MuiPopperFallback.js', pathToFileURL(entry));
  // Run import.meta.resolve in the native ESM loader. Vitest rewrites its own import.meta, while require.resolve
  // does not traverse the ESM hook on Node 22.
  const nativeResolver = await import('data:text/javascript,export const resolve = url => import.meta.resolve(url)');
  const requests: string[] = [];
  const isFallback = (id: string) => /(?:^|\/)index-MuiPopperFallback\d*\.js(?:$|[?#])/.test(id);
  const hook = registerHooks({
    resolve(specifier, context, nextResolve) {
      const requestedFallback = isFallback(specifier);
      if (requestedFallback) requests.push(specifier);
      const result = nextResolve(specifier, context);
      if (!requestedFallback && isFallback(result.url)) requests.push(result.url);
      return result;
    },
  });
  // Resolving a file URL verifies the observer even when the build prunes the private fallback chunk.
  nativeResolver.resolve(controlUrl.href);
  const sawControl = requests.length === 1;
  requests.length = 0;
  return { requests, sawControl, stop: () => hook.deregister() };
});
afterAll(() => muiPopperRequests?.stop());

const fixtureOptions = [
  { key: 'apple', value: 'apple', title: 'Apple' },
  { key: 'plum', value: 'plum', title: 'Plum' },
];
const noop = () => {};

// Immediate queries deliberately run in the same turn as render or the opening event.
// Waiting for a selector here would let a reachable lazy route resolve and hide the regression.
describe('first render from the installed bundle', () => {
  const wordpress = process.env.BUNDLE === 'wp';
  it.each(wordpress ? ['Autocomplete'] as const : packedRoutes)('replays audited %s shapes without preloading', (name) => {
    replayRouteShapes(name, Vanguard, renderWithProviders, wordpress, () => {
      expect(muiPopperRequests?.sawControl).toBe(true);
      expect(muiPopperRequests?.requests).toEqual([]);
    });
  });

  it('mounts ModalRoot and provides the modal context', () => {
    const ContextProbe = () => {
      const { modalRootState } = Vanguard.useModalContext();
      return <output>{modalRootState.growModals.length} queued modals</output>;
    };
    renderWithProviders(
      <Vanguard.ModalProvider>
        <Vanguard.ModalRoot />
        <ContextProbe />
      </Vanguard.ModalProvider>,
    );
    expect(screen.getByTestId('modal-root')).toBeDefined();
    expect(screen.getByText('0 queued modals')).toBeDefined();
  });

  it('mounts controlled multiple Autocomplete with its selected chip and combobox', () => {
    renderWithProviders(
      <Autocomplete id="fruit-multiple" options={fixtureOptions} optionKey="title" controlled multiple value={[fixtureOptions[0]]} />,
    );
    expect(screen.getByText('Apple')).toBeDefined();
    expect(screen.getByRole('combobox').getAttribute('id')).toBe('fruit-multiple');
  });
});

if (process.env.BUNDLE === 'wp') {
  describe('WordPress first render', () => {
    type RenderCase = readonly [ReactElement, string | { selector: string }];
    const cases = {
      AIOrb: [<Vanguard.AIOrb />, { selector: '[data-slot="ai-orb"]' }],
      CheckBox: [<Vanguard.CheckBox checked label="Fixture checkbox" />, 'Fixture checkbox'],
      ComponentContainer: [<Vanguard.ComponentContainer>Fixture container</Vanguard.ComponentContainer>, 'Fixture container'],
      EditModal: [
        <Vanguard.EditModal title="Fixture editor" savingInProgress={false} savable close={noop} saveCallback={noop} cancelCallback={noop}>
          Fixture editor body
        </Vanguard.EditModal>,
        'Fixture editor body',
      ],
      EditableCard: [<Vanguard.EditableCard title="Fixture card" editCallback={noop}>Fixture card body</Vanguard.EditableCard>, 'Fixture card body'],
      FormElement: [
        <Vanguard.FormElement childConfig={{}} formConfig={{}} onChange={noop} onBlur={noop}>Fixture form element</Vanguard.FormElement>,
        'Fixture form element',
      ],
      GeneratedWithAIPill: [<Vanguard.GeneratedWithAIPill text="Fixture AI pill" />, 'Fixture AI pill'],
      Link: [<Vanguard.Link href="#fixture-link">Fixture link</Vanguard.Link>, { selector: 'a[href="#fixture-link"]' }],
      LottieAnimationLoader: [
        <Vanguard.LottieAnimationLoader src={{ v: '5.7.0', fr: 30, ip: 0, op: 1, w: 1, h: 1, layers: [] }} renderer="svg" />,
        { selector: 'svg[viewBox="0 0 1 1"]' },
      ],
      PageSection: [<Vanguard.PageSection title="Fixture section">Fixture section body</Vanguard.PageSection>, 'Fixture section body'],
      PageSectionLoading: [<Vanguard.PageSectionLoading title="Fixture loading" description="Fixture loading description" />, 'Fixture loading description'],
      Render: [<Vanguard.Render if>Fixture conditional</Vanguard.Render>, 'Fixture conditional'],
      Skeleton: [<Vanguard.Skeleton noAnimation>Fixture skeleton</Vanguard.Skeleton>, 'Fixture skeleton'],
      SlideTransition: [<Vanguard.SlideTransition><span key="first">Fixture first slide</span><span key="second">Fixture second slide</span></Vanguard.SlideTransition>, 'Fixture first slide'],
      StatusBadge: [<Vanguard.StatusBadge status="success" text="Fixture badge" />, 'Fixture badge'],
      Switch: [<Vanguard.Switch value={false}>Fixture switch</Vanguard.Switch>, 'Fixture switch'],
      Tabs: [<Vanguard.Tabs tabs={[{ label: 'Fixture first tab', component: <div>Fixture tab content</div> }]} value={0} />, 'Fixture tab content'],
      Tag: [<Vanguard.Tag text="Fixture tag" />, 'Fixture tag'],
      TagList: [<Vanguard.TagList tags={[{ id: 'first', text: 'Fixture tag list item' }]} />, 'Fixture tag list item'],
      Text: [<Vanguard.Text>Fixture text</Vanguard.Text>, 'Fixture text'],
      TextHighlighted: [<Vanguard.TextHighlighted highlightWords={['fixture']}>Highlighted fixture</Vanguard.TextHighlighted>, 'Highlighted fixture'],
      TextIcon: [<Vanguard.TextIcon icon={Vanguard.IconNames.save}>Fixture text icon</Vanguard.TextIcon>, 'Fixture text icon'],
      TextWrapBalancer: [<Vanguard.TextWrapBalancer balanced>Fixture balanced text</Vanguard.TextWrapBalancer>, 'Fixture balanced text'],
      TogglerWithText: [<Vanguard.TogglerWithText left="Fixture left" right="Fixture right" togglerState="left" />, 'Fixture left'],
    } satisfies Record<string, RenderCase>;

    it.each(Object.entries(cases))('renders %s synchronously', (_name, [view, content]) => {
      const { container } = renderWithProviders(view);
      if (typeof content === 'string') {
        expect(container.textContent).toContain(content);
      } else {
        expect(container.querySelector(content.selector)).not.toBeNull();
      }
    });

    it.each([
      ['Icon', <Vanguard.Icon key="icon">{Vanguard.IconNames.save}</Vanguard.Icon>],
      ['StatusBadgeIcon', <Vanguard.StatusBadgeIcon key="badge" status="success" />],
    ] as const)('keeps %s empty until its packaged SVG loads', async (_name, view) => {
      const { container } = renderWithProviders(view);
      expect(container.firstChild).toBeNull();
      await waitFor(() => expect(container.querySelector('[data-slot="icon"]')).not.toBeNull());
    });

    it('accounts for every runtime export in the installed WordPress entry', () => {
      // Other components are covered by the shared smoke cases. Services, hooks, constants and helpers have no UI.
      expect(Object.keys(Vanguard).sort()).toEqual([
        ...Object.keys(cases),
        'Accordion', 'Autocomplete', 'Button', 'Form', 'InfoBox', 'Input', 'ModalProvider', 'ModalRoot',
        'Popover', 'Select', 'Textarea', 'Icon', 'StatusBadgeIcon',
        'AIOrbSize', 'AIOrbStatus', 'ButtonSizes', 'ButtonTextColors', 'ButtonTypes', 'FontWeights', 'IconNames',
        'IconSize', 'ModalService', 'OVERLAY_BASE_Z_INDEX', 'OverlayStackingService', 'PageSectionBackground',
        'PageSectionRoundedEdges', 'SkeletonTypes', 'TagType', 'TextTypes', 'VanguardStyle', 'applyWordAnimation',
        'childToString', 'childrenAsText', 'classNames', 'extractErrorScopes', 'extractSetErrorsFromConfig',
        'parseFullLinks', 'setVanguardErrorLogger', 'useFormConfig', 'useFormStore', 'useModalContext',
      ].sort());
    });

    it('renders the retained inline MUI Autocomplete route on its first render', () => {
      renderWithProviders(<Autocomplete id="wp-mui-fruit" options={fixtureOptions} optionKey="title" sx={{ maxWidth: 280 }} />);
      const input = screen.getByRole('combobox');
      expect(input.closest('.MuiAutocomplete-root')?.hasAttribute('data-vg-core')).toBe(false);
    });

    it('renders retained inline MUI TextField routes from Input, Select and Textarea', () => {
      const { container } = renderWithProviders(
        <>
          <Input value="Fixture filled input" textFieldProps={{ variant: 'filled' }} />
          <Select options={fixtureOptions} value="apple" textFieldProps={{ variant: 'filled' }} />
          <Textarea value="Fixture filled textarea" textFieldProps={{ variant: 'filled' }} />
        </>,
      );
      expect(screen.getByDisplayValue('Fixture filled input').closest('.MuiFilledInput-root')).not.toBeNull();
      expect(screen.getByRole('combobox').closest('.MuiFilledInput-root')).not.toBeNull();
      expect(screen.getByDisplayValue('Fixture filled textarea').closest('.MuiFilledInput-root')).not.toBeNull();
      expect(container.querySelectorAll('.MuiFilledInput-root')).toHaveLength(3);
    });
  });
} else {
  describe('default bundle first render', () => {
    it.each(['temporary', 'persistent', 'permanent'] as const)('renders the open %s Drawer', (variant) => {
      renderWithProviders(
        <Vanguard.ModalProvider>
          <Vanguard.ModalRoot />
          <Vanguard.Drawer open variant={variant}>Fixture drawer body</Vanguard.Drawer>
        </Vanguard.ModalProvider>,
      );
      expect(screen.getByText('Fixture drawer body').closest('.MuiDrawer-paper')).not.toBeNull();
      if (variant === 'temporary') expect(document.body.style.overflow).toBe('hidden');
    });

    it.each([false, true])('renders centered PopoverModal with renderInPortal=%s', (renderInPortal) => {
      const { unmount } = render(<button type="button">Fixture popover anchor</button>);
      try {
        const anchor = screen.getByRole('button', { name: 'Fixture popover anchor' });
        renderWithProviders(
          <Vanguard.PopoverModal
            anchorEl={anchor}
            isOpen
            centerPopover
            renderInPortal={renderInPortal}
            disableBackdropClick
            content={<p>Fixture popover card</p>}
            onClose={noop}
            zIndex={7}
          />,
        );
        const card = screen.getByText('Fixture popover card').closest('[role="tooltip"]');
        expect(card).not.toBeNull();
        if (renderInPortal) expect(card?.parentElement).toBe(document.body);
      } finally {
        unmount();
      }
    });

    it('renders the controlled single Autocomplete value synchronously', () => {
      renderWithProviders(
        <Autocomplete controlled id="single-fruit" options={fixtureOptions} optionKey="title" value={fixtureOptions[0]} />,
      );
      const input = screen.getByRole('combobox') as HTMLInputElement;
      expect(input.id).toBe('single-fruit');
      expect(input.value).toBe('Apple');
    });

    it('opens AccountNavMenu-shaped JSX items on the own menu route', () => {
      const AccountMenu = () => {
        const [anchor, setAnchor] = useState<HTMLElement | null>(null);
        return (
          <>
            <button type="button" onClick={(event) => setAnchor(event.currentTarget)}>Fixture account</button>
            <Vanguard.Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} height={420} width={280}>
              <Vanguard.Render if><Vanguard.MenuItem>Fixture settings</Vanguard.MenuItem></Vanguard.Render>
              <Vanguard.Render if={false}><Vanguard.MenuItem>Fixture hidden setting</Vanguard.MenuItem></Vanguard.Render>
            </Vanguard.Menu>
          </>
        );
      };
      renderWithProviders(<AccountMenu />);
      fireEvent.click(screen.getByRole('button', { name: 'Fixture account' }));
      const menu = screen.getByRole('menu');
      expect(menu.closest('[data-vg-core]')).not.toBeNull();
      expect(within(menu).getByRole('menuitem', { name: 'Fixture settings' })).toBeDefined();
      expect(within(menu).queryByText('Fixture hidden setting')).toBeNull();
    });

    it('opens the item-config Menu and SearchableSelect on their own routes', () => {
      const view = renderWithProviders(<button type="button">Fixture menu anchor</button>);
      const anchor = screen.getByRole('button', { name: 'Fixture menu anchor' });
      const menu = renderWithProviders(<Vanguard.Menu anchorEl={anchor} open items={[{ key: 'fixture', children: 'Fixture item' }]} />);
      expect(screen.getByRole('menuitem', { name: 'Fixture item' })).toBeDefined();
      menu.unmount();
      view.rerender(<Vanguard.SearchableSelect options={fixtureOptions} value="apple" />);
      fireEvent.mouseDown(screen.getByRole('combobox'), { button: 0 });
      expect(within(screen.getByRole('listbox')).getByRole('option', { name: 'Plum' })).toBeDefined();
    });

    it('renders PhoneNumber and DateRangePicker masked inputs', () => {
      const { container } = renderWithProviders(
        <>
          <Vanguard.PhoneNumber countryCode="GB" />
          <Vanguard.DateRangePicker testId="fixture-range" startDate={new Date(2025, 0, 1)} endDate={new Date(2025, 0, 15)} />
        </>,
      );
      expect(within(screen.getByTestId('phoneNumberComponent')).getByPlaceholderText('##-####-####').tagName).toBe('INPUT');
      expect(container.querySelector('[data-testid="fixture-range-left-reference-container"] input')).not.toBeNull();
    });

    it('renders the Navbar AppBar and Toolbar shapes', () => {
      renderWithProviders(
        <Vanguard.AppBar className="fixture-navbar" position="fixed" style={{ top: 10 }}>
          <Vanguard.Toolbar className="fixture-toolbar">Fixture toolbar</Vanguard.Toolbar>
        </Vanguard.AppBar>,
      );
      expect(screen.getByRole('banner').classList.contains('fixture-navbar')).toBe(true);
      expect(screen.getByText('Fixture toolbar').classList.contains('fixture-toolbar')).toBe(true);
    });

    it('renders Snackbar message and children shapes synchronously', () => {
      renderWithProviders(
        <>
          <Vanguard.Snackbar open message="Fixture message snackbar" />
          <Vanguard.Snackbar open><span>Fixture children snackbar</span></Vanguard.Snackbar>
        </>,
      );
      expect(screen.getByText('Fixture message snackbar').closest('.MuiSnackbar-root')).not.toBeNull();
      expect(screen.getByText('Fixture children snackbar').closest('.MuiSnackbar-root')).not.toBeNull();
    });

    it('renders SnackbarRoot on the service open tick without waiting for a chunk', () => {
      vi.useFakeTimers();
      try {
        renderWithProviders(<Vanguard.SnackbarRoot />);
        act(() => {
          Vanguard.snackbarService.openSuccessSnackbar('Fixture service snackbar');
        });
        act(() => vi.advanceTimersByTime(0));
        expect(screen.getByText('Fixture service snackbar').closest('.MuiSnackbar-root')).not.toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });
  });
}

describe('installed Vanguard bundle', () => {
  it('resolves the expected packed entry', () => {
    expect(isFromNodeModules).toBe(true);
    expect(entryFile).toContain('/node_modules/@rankingcoach/vanguard/dist/');
    expect(installedBundle).toBe(process.env.BUNDLE === 'wp' ? 'wordpress' : 'default');
  });
  it('renders Button and forwards click events', () => {
    const click = vi.fn();
    renderWithProviders(<Button onClick={click}>Save fixture</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Save fixture' }));
    expect(click).toHaveBeenCalledTimes(1);
  });
  it('renders real Input and forwards native input props and change events', () => {
    const change = vi.fn();
    renderWithProviders(<Input value="before" onChange={change} textFieldProps={{ inputProps: { 'aria-label': 'Fixture input', maxLength: 12 } }} />);
    const input = screen.getByRole('textbox', { name: 'Fixture input' });
    expect(input.getAttribute('maxlength')).toBe('12');
    fireEvent.change(input, { target: { value: 'after' } });
    expect(change).toHaveBeenCalled();
  });
  it('renders Textarea from the installed bundle', () => {
    renderWithProviders(<Textarea value="Fixture biography" rows={3} />);
    expect(screen.getByDisplayValue('Fixture biography').tagName).toBe('TEXTAREA');
  });
  // F3 (both bundles): an Input bound with `field` two components deep, no formconfig prop drilling.
  it('binds an installed Input to the nearest Form by field name', async () => {
    const user = userEvent.setup();
    const slice = createSlice({
      name: 'fixtureForm',
      initialState: { name: '', initialState: { name: '' } },
      reducers: { setName: (s, a: { payload: string }) => ({ ...s, name: a.payload }) },
    });
    const store = configureStore({ reducer: { fixtureForm: slice.reducer } });
    const Row = () => (
      <section>
        <Input field="name" textFieldProps={{ inputProps: { 'aria-label': 'Fixture name' } }} />
      </section>
    );
    const Fixture = () => {
      const { formConfig } = useFormConfig({
        slice: slice.actions as never,
        reducer: ((s: { fixtureForm: { name: string } }) => s.fixtureForm) as never,
        inputs: { name: { fieldType: 'Input' } },
      });
      return (
        <Form config={formConfig}>
          <Row />
        </Form>
      );
    };
    render(
      <Provider store={store}>
        <Fixture />
      </Provider>,
    );
    await user.type(screen.getByRole('textbox', { name: 'Fixture name' }), 'Ann');
    expect(store.getState().fixtureForm.name).toBe('Ann');
  });
  // F4 (both bundles): a Redux-free form. Plain render: no react-redux Provider and no store anywhere.
  it('runs a Form on useFormStore without react-redux or a Provider', async () => {
    const user = userEvent.setup();
    let data: () => { city?: string } = () => ({});
    const StoreForm = () => {
      const form = useFormStore({ initialValues: { city: 'Rome' }, inputs: { city: { fieldType: 'Input' } } });
      data = form.getData;
      return (
        <Form config={form.formConfig as never}>
          <div>
            <Input field="city" textFieldProps={{ inputProps: { 'aria-label': 'City' } }} />
          </div>
          <output data-testid="city">{form.values.city}</output>
        </Form>
      );
    };
    render(<StoreForm />);
    const input = screen.getByRole('textbox', { name: 'City' }) as HTMLInputElement;
    expect(input.value).toBe('Rome');
    await user.type(input, 'x');
    expect(screen.getByTestId('city').textContent).toBe('Romex');
    expect(data().city).toBe('Romex');
  });
  // Select runs on Vanguard's own core in both bundles (WordPress exports it): open, pick an option, read it back.
  it('opens the installed Select and picks an option', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const options = [
      { key: 'a', value: 'apple', title: 'Apple' },
      { key: 'b', value: 'banana', title: 'Banana' },
    ];
    renderWithProviders(<Select options={options} value="apple" translateOptions={false} onChange={change} />);
    const combo = screen.getByRole('combobox');
    expect(combo.getAttribute('data-slot')).toBe('select-trigger');
    await user.click(combo);
    const listbox = await screen.findByRole('listbox');
    await user.click(within(listbox).getByRole('option', { name: 'Banana' }));
    expect(change).toHaveBeenCalledTimes(1);
    expect(change.mock.calls[0][1]).toMatchObject({ value: 'banana' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getByRole('combobox').textContent).toBe('Banana');
  });
  // Autocomplete runs on Vanguard's own core in both bundles (WordPress exports it): open, filter, pick, read back.
  it('opens the installed Autocomplete, filters and picks an option', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const options = [
      { key: 0, value: 'apple', title: 'Apple' },
      { key: 1, value: 'plum', title: 'Plum' },
    ];
    renderWithProviders(<Autocomplete id="fruit" testId="fruit" options={options} optionKey="title" onChange={change} />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.closest('.MuiAutocomplete-root')?.hasAttribute('data-vg-core')).toBe(true);
    await user.click(input);
    await user.type(input, 'pl');
    const listbox = await screen.findByRole('listbox');
    // Matching splits the label into highlight spans, whose accessible name reads "Pl um": pick the option by text.
    const plum = within(listbox)
      .getAllByRole('option')
      .find((o) => o.textContent === 'Plum') as HTMLElement;
    await user.click(plum);
    expect(change).toHaveBeenCalled();
    expect(input.value).toBe('Plum');
  });
  // Popover runs on Vanguard's own Tooltip in both bundles (WordPress exports it): hover opens, leave closes.
  it('opens the installed Popover on hover with an own-core tooltip', async () => {
    renderWithProviders(
      <Popover message="Fixture tip">
        <button type="button">Fixture trigger</button>
      </Popover>,
    );
    const wrapper = document.querySelector('[data-slot="popover-trigger"]') as HTMLElement;
    expect(wrapper).not.toBeNull();
    fireEvent.mouseEnter(wrapper);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.hasAttribute('data-vg-core')).toBe(true);
    expect(tooltip.textContent).toContain('Fixture tip');
    expect(wrapper.getAttribute('aria-labelledby')).toBe(tooltip.id);
    fireEvent.mouseLeave(wrapper);
    expect(wrapper.getAttribute('aria-labelledby')).toBeNull();
  });

  // Collapse runs on Vanguard's own transition in both bundles; WordPress reaches it through InfoBox. Real timers:
  // the WordPress bundle's transition timers are not reached by vi fake timers, so the settle is awaited.
  it('collapses an installed dismissible InfoBox with the own-core Collapse', async () => {
    renderWithProviders(<InfoBox title="Fixture info" description="Fixture body" dismissible />);
    const root = document.querySelector('[data-slot="collapse"]') as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.hasAttribute('data-vg-core')).toBe(true);
    expect(root.classList.contains('MuiCollapse-root')).toBe(true);
    expect(root.hasAttribute('data-open')).toBe(true);
    fireEvent.click(screen.getByTestId('info-box-cta_button'));
    expect(root.hasAttribute('data-open')).toBe(false);
    await waitFor(() => expect(root.classList.contains('MuiCollapse-hidden')).toBe(true), { timeout: 2000 });
  });

  // Accordion renders MUI's Accordion DOM on own core (ButtonBase primitive + own Collapse, timeout 'auto').
  it('toggles an installed Accordion on the own core', async () => {
    const onExpandedChange = vi.fn();
    renderWithProviders(
      <Accordion
        accordionId="fx-acc"
        summaryChildren={<span>Fixture summary</span>}
        detailsChildren={<p>Fixture details</p>}
        onExpandedChange={onExpandedChange}
      />,
    );
    const root = document.querySelector('[data-slot="accordion"]') as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.hasAttribute('data-vg-core')).toBe(true);
    expect(root.classList.contains('MuiAccordion-root')).toBe(true);
    const summary = screen.getByRole('button', { name: 'Fixture summary' });
    expect(summary.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(summary);
    expect(summary.getAttribute('aria-expanded')).toBe('true');
    expect(root.classList.contains('Mui-expanded')).toBe(true);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    await waitFor(
      () =>
        expect(
          screen.getByRole('region').closest('.MuiCollapse-root')?.classList.contains('MuiCollapse-entered'),
        ).toBe(true),
      { timeout: 2000 },
    );
  });

  // Button's hover icon swap (iconLargeOnHover) runs on Vanguard's own Grow in both bundles (no MUI Grow). Real timers:
  // the WordPress bundle's transition timers are not reached by vi fake timers.
  it('swaps the enlarged hover icon of an installed Button on the own Grow', async () => {
    renderWithProviders(
      <Button icon={'caret-down' as never} iconLargeOnHover>
        Fixture grow
      </Button>,
    );
    const button = screen.getByRole('button', { name: /Fixture grow/ });
    const wrappers = () =>
      [...button.querySelectorAll('div > div > span')].filter(
        (s) => s.parentElement?.parentElement?.children.length === 2,
      ) as HTMLElement[];
    const [small, large] = wrappers();
    expect(small.style.opacity).toBe('1');
    expect(large.style.opacity).toBe('0');
    fireEvent.mouseOver(button.parentElement as HTMLElement);
    await waitFor(
      () => {
        expect(small.style.opacity).toBe('0');
        expect(large.style.opacity).toBe('1');
      },
      { timeout: 2000 },
    );
    expect(button.getAttribute('class')?.split(' ')).not.toContain('false');
  });
});

// WordPress intentionally has no DatePicker export; verify the default installed implementation.
if (process.env.BUNDLE !== 'wp') {
  it('keeps the packed DatePicker synchronized with controlled restores and locale changes', async () => {
    const { DatePicker } = await import('@rankingcoach/vanguard');
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = (query: string) => ({
      matches: query.includes('pointer: fine'), media: query, onchange: null,
      addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
      dispatchEvent: () => false,
    });
    const date = (day: number) => new Date(2024, 2, day).getTime();
    const Controlled = () => {
      const [value, setValue] = useState<number | null | undefined>(date(15));
      const [locale, setLocale] = useState('en_US');
      return <>
        <DatePicker value={value ?? undefined} locale={locale} onChange={setValue} />
        <button onClick={() => setValue(date(22))}>External date</button>
        <button onClick={() => setValue(date(20))}>Restore typed date</button>
        <button onClick={() => setLocale('de_DE')}>Change locale</button>
      </>;
    };
    try {
      const { container } = renderWithProviders(<Controlled />);
      const group = screen.getByRole('group');
      const [month, day] = within(group).getAllByRole('spinbutton');
      expect(within(group).getAllByRole('spinbutton')).toHaveLength(3);
      const input = container.querySelector<HTMLInputElement>('input[aria-hidden="true"]')!;
      expect(input).not.toBeNull();
      month.focus();
      await userEvent.keyboard('/{ArrowRight}');
      expect(input.value).toBe('03/15/2024');
      expect(document.activeElement).toBe(day);
      await userEvent.keyboard('{ArrowLeft}');
      expect(input.value).toBe('03/15/2024');
      expect(document.activeElement).toBe(month);
      fireEvent.paste(month, { clipboardData: { getData: () => '03/20/2024' } });
      expect(input.value).toBe('03/20/2024');
      fireEvent.click(screen.getByRole('button', { name: 'External date' }));
      expect(input.value).toBe('03/22/2024');
      fireEvent.click(screen.getByRole('button', { name: 'Restore typed date' }));
      expect(input.value).toBe('03/20/2024');
      fireEvent.click(screen.getByRole('button', { name: 'Change locale' }));
      expect(input.value).toBe('20.03.2024');
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
}
