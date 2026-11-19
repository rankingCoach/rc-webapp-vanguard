import { Tooltip as MuiTooltip } from '@mui/material';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { Tooltip } from './Tooltip';

/**
 * Same as the H15 id finding: MUI Tooltip's useId(idProp) on React 19 is React's bare id (the trigger's
 * aria-describedby / the tooltip's id); the own Tooltip must not prefix `mui-`.
 */
const describedBy = (impl: 'mui' | 'own') => {
  const C = (impl === 'mui' ? MuiTooltip : Tooltip) as React.ElementType;
  const view = render(
    <C title="Hint" open describeChild disablePortal>
      <button type="button">{'Trigger'}</button>
    </C>,
  );
  const value = view.container.querySelector('button')?.getAttribute('aria-describedby') ?? '';
  view.unmount();
  return value;
};

describe('own Tooltip generated id equals MUI 9.5 on React 19', () => {
  it('no mui- prefix', () => {
    const strip = (s: string) => s.replace(/_r_[0-9a-z]+_/g, 'ID');
    expect(strip(describedBy('own'))).toBe(strip(describedBy('mui')));
  });
});
