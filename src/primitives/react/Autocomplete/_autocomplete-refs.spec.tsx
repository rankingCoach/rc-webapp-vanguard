import { Autocomplete as MuiAutocomplete, TextField } from '@mui/material';
import { act, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import OwnAutocomplete from './Autocomplete';

/**
 * React 19 callback-ref cleanups (Codex review, handoff 15): a ref callback that returns a cleanup is called once with
 * the node and its cleanup runs on unmount, for the root and the listbox slot, like MUI's useForkRef.
 */
const go = async (impl: 'mui' | 'own') => {
  const log: string[] = [];
  const track = (name: string) => (node: HTMLElement | null) => {
    log.push(`${name}:${node ? 'attach' : 'null'}`);
    return () => {
      log.push(`${name}:cleanup`);
    };
  };
  const C = (impl === 'mui' ? MuiAutocomplete : OwnAutocomplete) as React.ElementType;
  const rootRef = track('root');
  const listboxRef = track('listbox');
  const view = render(
    <C
      ref={rootRef}
      open
      disablePortal
      options={['Apple', 'Banana']}
      slotProps={{ listbox: { ref: listboxRef } }}
      renderInput={(params: Record<string, unknown>) => <TextField {...params} />}
    />,
  );
  await act(async () => {
    await Promise.resolve();
  });
  view.rerender(
    <C
      ref={rootRef}
      open={false}
      disablePortal
      options={['Apple', 'Banana']}
      slotProps={{ listbox: { ref: listboxRef } }}
      renderInput={(params: Record<string, unknown>) => <TextField {...params} />}
    />,
  );
  view.unmount();
  return log;
};

describe('own Autocomplete ref cleanups equal MUI', () => {
  it('root and listbox refs: attach once, cleanup on unmount / close', async () => {
    expect(await go('own')).toEqual(await go('mui'));
  });
});
