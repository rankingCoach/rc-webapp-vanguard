import { ToggleButton } from '@vanguard/ToggleButton/ToggleButton';
import { VanguardThemeProvider } from '@vanguard/VanguardThemeProvider/VanguardThemeProvider';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '../../../test-utils/test-utils';

/** Typography the button shipped with: MUI default theme outside the provider, the Vanguard MUI theme inside it. */
describe('ToggleButton typography', () => {
  it('outside VanguardThemeProvider: 0.875rem uppercase', () => {
    render(<ToggleButton value="a">{'A'}</ToggleButton>);
    const s = getComputedStyle(screen.getByRole('button'));
    expect(s.fontSize).toBe('0.875rem');
    expect(s.textTransform).toBe('uppercase');
  });

  it('inside VanguardThemeProvider: 1rem, no uppercase; small 13/14rem', () => {
    render(
      <VanguardThemeProvider>
        <ToggleButton value="a">{'A'}</ToggleButton>
        <ToggleButton value="b" size="small">
          {'B'}
        </ToggleButton>
      </VanguardThemeProvider>,
    );
    const a = getComputedStyle(screen.getByRole('button', { name: 'A' }));
    expect(a.fontSize).toBe('1rem');
    expect(a.textTransform).toBe('none');
    expect(getComputedStyle(screen.getByRole('button', { name: 'B' })).fontSize).toBe('0.9285714285714285rem');
  });
});
