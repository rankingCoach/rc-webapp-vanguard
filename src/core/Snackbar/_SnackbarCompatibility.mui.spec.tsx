import '@testing-library/jest-dom/vitest';

import { Grow, GrowProps } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';
import { expect, test, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '../../../test-utils/test-utils';
import { AppBar } from '../AppBar/AppBar';
import { Autocomplete } from '../Autocomplete/Autocomplete';
import { Snackbar } from './Snackbar';

const TransitionObserverContext = React.createContext<Partial<Record<'observed' | 'themed' | 'local' | 'mounts' | 'mounted', ReturnType<typeof vi.fn<(...args: unknown[]) => unknown>>>>>({});


const TransitionHarness107 = React.forwardRef<unknown, GrowProps> ((props, ref) => {
  const { observed } = React.useContext(TransitionObserverContext);

      observed(props);
      return <Grow {...props} ref={ref} />;
    
});

const ThemedHarness76 = React.forwardRef<unknown, GrowProps> ((props, ref) => {
  const { themed } = React.useContext(TransitionObserverContext);

    themed();
    return <Grow {...props} ref={ref} />;
  
});

const LocalHarness80 = React.forwardRef<unknown, GrowProps> ((props, ref) => {
  const { local } = React.useContext(TransitionObserverContext);

    local();
    return <Grow {...props} ref={ref} />;
  
});


test('AppBar honors themed sx and explicit consumer sx wins', () => {
  const theme = createTheme({ components: { MuiAppBar: { defaultProps: { sx: { display: 'none' } } } } });
  const { rerender } = render(
    <ThemeProvider theme={theme}>
      <AppBar>Title</AppBar>
    </ThemeProvider>,
  );
  expect(screen.getByText('Title')).not.toBeVisible();
  rerender(
    <ThemeProvider theme={theme}>
      <AppBar sx={{ display: 'block' }}>Title</AppBar>
    </ThemeProvider>,
  );
  expect(screen.getByText('Title')).toBeVisible();
});

test('Autocomplete honors themed input callback and explicit callback wins', () => {
  const themed = vi.fn();
  const local = vi.fn();
  const theme = createTheme({ components: { MuiAutocomplete: { defaultProps: { onInputChange: themed } } } });
  const { rerender } = render(
    <ThemeProvider theme={theme}>
      <Autocomplete label="Fruit" options={['apple']} />
    </ThemeProvider>,
  );
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'a' } });
  expect(themed).toHaveBeenCalledWith(expect.anything(), 'a', 'input');
  themed.mockClear();
  rerender(
    <ThemeProvider theme={theme}>
      <Autocomplete label="Fruit" options={['apple']} onInputChange={local} />
    </ThemeProvider>,
  );
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ap' } });
  expect(local).toHaveBeenCalledWith(expect.anything(), 'ap', 'input');
  expect(themed).not.toHaveBeenCalled();
});

test('Snackbar honors themed close callback and explicit callback wins', () => {
  const themed = vi.fn();
  const local = vi.fn();
  const theme = createTheme({ components: { MuiSnackbar: { defaultProps: { onClose: themed } } } });
  const { rerender } = render(
    <ThemeProvider theme={theme}>
      <Snackbar open message="Hello" />
    </ThemeProvider>,
  );
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(themed).toHaveBeenCalledWith(expect.anything(), 'escapeKeyDown');
  themed.mockClear();
  rerender(
    <ThemeProvider theme={theme}>
      <Snackbar open message="Hello" onClose={local} />
    </ThemeProvider>,
  );
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(local).toHaveBeenCalledWith(expect.anything(), 'escapeKeyDown');
  expect(themed).not.toHaveBeenCalled();
});

test('Snackbar preserves themed transition selection and explicit slot precedence', () => {
  const themed = vi.fn();
  const local = vi.fn();
  const Themed = ThemedHarness76;
  const Local = LocalHarness80;
    const transitionObservers = { themed, local };
  const theme = createTheme({ components: { MuiSnackbar: { defaultProps: { slots: { transition: Themed } } } } });
  const { rerender } = render(
    <TransitionObserverContext.Provider value={transitionObservers}>{<ThemeProvider theme={theme}>
      <Snackbar open message="Hello" />
    </ThemeProvider>}</TransitionObserverContext.Provider>,
  );
  expect(themed).toHaveBeenCalled();
  themed.mockClear();
  rerender(
    <TransitionObserverContext.Provider value={transitionObservers}>{<ThemeProvider theme={theme}>
      <Snackbar open message="Hello" slots={{ transition: Local }} />
    </ThemeProvider>}</TransitionObserverContext.Provider>,
  );
  expect(local).toHaveBeenCalled();
  expect(themed).not.toHaveBeenCalled();
});

for (const functional of [false, true]) {
  test(`Snackbar explicit ${functional ? 'function' : 'object'} transition props win and exit still unmounts`, async () => {
    const observed = vi.fn();
    const legacyEntered = vi.fn();
    const entered = vi.fn();
    const exited = vi.fn();
    const Transition = TransitionHarness107;
    const transitionObservers = { observed };
    const explicit = { timeout: 0, style: { color: 'rgb(4, 5, 6)' }, onEntered: entered, onExited: exited };
    const props = {
      message: 'Hello',
      TransitionComponent: Transition,
      TransitionProps: { timeout: 1000, style: { color: 'red' }, onEntered: legacyEntered },
      slotProps: { transition: functional ? () => explicit : explicit },
    };
    const { rerender } = render(<TransitionObserverContext.Provider value={transitionObservers}>{<Snackbar {...props} open />}</TransitionObserverContext.Provider>);
    expect(observed.mock.lastCall?.[0].timeout).toBe(0);
    expect(observed.mock.lastCall?.[0].style).toEqual(explicit.style);
    await waitFor(() => expect(entered).toHaveBeenCalledTimes(1));
    expect(legacyEntered).not.toHaveBeenCalled();
    rerender(<TransitionObserverContext.Provider value={transitionObservers}>{<Snackbar {...props} open={false} />}</TransitionObserverContext.Provider>);
    await waitFor(() => expect(exited).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });
}
