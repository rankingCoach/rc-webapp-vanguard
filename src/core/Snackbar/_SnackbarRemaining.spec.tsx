import '@testing-library/jest-dom/vitest';

import { Grow, GrowProps } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { expect, test, vi } from 'vitest';

import { Snackbar } from './Snackbar';
import { snackbarSlotProps } from './snackbar-slot-compat';
import type { VanguardSnackbarProps } from '../_internal/mui-legacy-props';


const TransitionObserverContext = React.createContext<Partial<Record<'observed' | 'themed' | 'local' | 'mounts' | 'mounted', ReturnType<typeof vi.fn<(...args: unknown[]) => unknown>>>>>({});


const ThemedHarness76 = React.forwardRef<unknown, GrowProps> ((props, forwarded) => {
  const { themed } = React.useContext(TransitionObserverContext);

    themed();
    return <Grow {...props} ref={forwarded} />;
  
});

const LocalHarness80 = React.forwardRef<unknown, GrowProps> ((props, forwarded) => {
  const { local, mounted } = React.useContext(TransitionObserverContext);

    local();
    React.useEffect(() => {
      mounted();
    }, [mounted]);
    return <Grow {...props} ref={forwarded} />;
  
});

const TransitionHarness22 = React.forwardRef<unknown, GrowProps> ((props, forwarded) => {
  const { mounts, observed } = React.useContext(TransitionObserverContext);

      React.useEffect(() => {
        mounts();
      }, [mounts]);
      observed(props);
      return <Grow {...props} ref={forwarded} />;
    
});


for (const mode of ['undefined', 'function', 'object'] as const) {
  test(`legacy transition callbacks preserve ${mode} slot precedence and stable state`, async () => {
    const enter = vi.fn();
    const entered = vi.fn();
    const exit = vi.fn();
    const exited = vi.fn();
    const explicit = vi.fn();
    const mounts = vi.fn();
    const observed = vi.fn();
    const ref = React.createRef<unknown>();
    const Transition = TransitionHarness22;
    const transitionObservers = { mounts, observed };
    const legacyThemeDefaults1: Partial<VanguardSnackbarProps> = {
            TransitionComponent: Transition,
            TransitionProps: { onEnter: enter, onEntered: entered, onExit: exit, onExited: exited },
          };
  const theme = createTheme({
      components: {
        MuiSnackbar: {
          defaultProps: legacyThemeDefaults1,
        },
      },
    });
    const transition =
      mode === 'undefined'
        ? undefined
        : mode === 'function'
          ? () => ({ onEntered: explicit })
          : { onEntered: explicit };
    const props = {
      message: 'Remaining',
      transitionDuration: 0,
      TransitionComponent: undefined,
      slotProps: { transition },
      TransitionProps: { ref, onEnter: enter, onEntered: entered, onExit: exit, onExited: exited },
    };
    const view = (open: boolean) => (
      <ThemeProvider theme={theme}>
        <Snackbar {...props} open={open} />
      </ThemeProvider>
    );
    const { rerender } = render(<TransitionObserverContext.Provider value={transitionObservers}>{view(true)}</TransitionObserverContext.Provider>);
    await waitFor(() => expect(mode === 'undefined' ? entered : explicit).toHaveBeenCalledTimes(1));
    expect(enter).toHaveBeenCalledTimes(1);
    if (mode !== 'undefined') expect(entered).not.toHaveBeenCalled();
    rerender(<TransitionObserverContext.Provider value={transitionObservers}>{view(true)}</TransitionObserverContext.Provider>);
    expect(mounts).toHaveBeenCalledTimes(1);
    rerender(<TransitionObserverContext.Provider value={transitionObservers}>{view(false)}</TransitionObserverContext.Provider>);
    await waitFor(() => expect(exited).toHaveBeenCalledTimes(1));
    expect(exit).toHaveBeenCalledTimes(mode === 'undefined' ? 1 : 0);
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(observed).toHaveBeenCalled();
  });
}

test('local legacy component overrides theme without remount and retains transition ref', async () => {
  const themed = vi.fn();
  const local = vi.fn();
  const mounted = vi.fn();
  const ref = React.createRef<unknown>();
  const Themed = ThemedHarness76;
  const Local = LocalHarness80;
    const transitionObservers = { themed, local, mounted };
  const legacyThemeDefaults2: Partial<VanguardSnackbarProps> = { TransitionComponent: Themed };
  const theme = createTheme({ components: { MuiSnackbar: { defaultProps: legacyThemeDefaults2 } } });
  const legacyTransitionProps = { ref, timeout: 0 };
  const view = (slots = {}) => (
    <ThemeProvider theme={theme}>
      <Snackbar
        open
        message="Local"
        TransitionComponent={Local}
        TransitionProps={legacyTransitionProps}
        slots={slots}
        transitionDuration={0}
      />
    </ThemeProvider>
  );
  const { rerender } = render(<TransitionObserverContext.Provider value={transitionObservers}>{view()}</TransitionObserverContext.Provider>);
  await waitFor(() => expect(ref.current).not.toBeNull());
  rerender(<TransitionObserverContext.Provider value={transitionObservers}>{view()}</TransitionObserverContext.Provider>);
  expect(mounted).toHaveBeenCalledTimes(1);
  expect(local).toHaveBeenCalled();
  expect(themed).not.toHaveBeenCalled();
  local.mockClear();
  rerender(<TransitionObserverContext.Provider value={transitionObservers}>{view({ transition: undefined })}</TransitionObserverContext.Provider>);
  expect(local).not.toHaveBeenCalled();
});

test('mapped props do not forward the legacy transition component', () => {
  const component = React.forwardRef<unknown, GrowProps>((props, ref) => <Grow {...props} ref={ref} />);
  expect(snackbarSlotProps({ TransitionComponent: component })).not.toHaveProperty('TransitionComponent');
});
