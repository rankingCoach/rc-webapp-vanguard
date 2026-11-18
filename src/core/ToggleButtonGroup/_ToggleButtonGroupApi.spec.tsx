import { ToggleButton } from '@vanguard/ToggleButton/ToggleButton';
import { ToggleButtonGroup } from '@vanguard/ToggleButtonGroup/ToggleButtonGroup';
import React, { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '../../../test-utils/test-utils';
import type { ButtonBaseActions, TouchRippleActions } from '../../primitives/react/ButtonBase/ButtonBase';

/**
 * Public API parity after MUI removal. Type level (checked by `tsc -p tsconfig.spec.json` in gates.sh): every prop
 * shape the MUI-backed components accepted, and every shape used in Vanguard / rc-webapp, still compiles.
 * Runtime: the ButtonBase passthroughs and `classes` keys still take effect.
 */
const muiEraShapes = (
  <>
    {/* rc-webapp call-site shapes (15 files): value, onChange, exclusive, size, disabled, orientation, variant,
        rounded, segmentedSize, className, aria-label, data-testid; buttons: value, selected, onChange, key */}
    <ToggleButtonGroup
      value={['a']}
      exclusive={false}
      onChange={(_e: React.MouseEvent<HTMLElement>, _v: string[]) => undefined}
      size="small"
      disabled
      orientation="vertical"
      variant="segmented"
      rounded
      segmentedSize="large"
      className="c"
      aria-label="g"
      data-testid="g"
      color="primary"
      fullWidth
      classes={{ root: 'r', grouped: 'g', firstButton: 'f', middleButton: 'm', lastButton: 'l', selected: 's' }}
      sx={{ width: 1 }}
      ref={createRef<HTMLDivElement>()}
    >
      <ToggleButton key="a" value="a" selected onChange={() => undefined} aria-label="a" className="b" data-testid="b">
        {'A'}
      </ToggleButton>
    </ToggleButtonGroup>
    {/* MUI SxProps shapes still type-check */}
    <ToggleButtonGroup sx={(theme: unknown) => ({ theme })} />
    <ToggleButtonGroup sx={[{ m: 1 }, false]} />
    <ToggleButton value="x" sx={{ '&:hover': { color: 'red' }, p: 2 }} />
    {/* ButtonBase passthroughs */}
    <ToggleButton
      value="x"
      component="div"
      href="/x"
      LinkComponent="a"
      disableRipple
      disableFocusRipple
      disableTouchRipple
      centerRipple
      focusVisibleClassName="fv"
      onFocusVisible={() => undefined}
      TouchRippleProps={{ className: 't', classes: { root: 'tr', child: 'tc' } }}
      touchRippleRef={createRef<TouchRippleActions>()}
      action={createRef<ButtonBaseActions>()}
      classes={{
        root: 'r',
        selected: 's',
        disabled: 'd',
        sizeSmall: 'ss',
        fullWidth: 'fw',
        standard: 'st',
        primary: 'p',
      }}
      size="large"
      color="secondary"
      tabIndex={-1}
      testId="t"
      ref={createRef<HTMLElement>()}
    />
  </>
);

describe('ToggleButton(Group) API parity', () => {
  it('the MUI-era shapes render', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(muiEraShapes);
    expect(screen.getAllByRole('group').length).toBe(3);
  });

  it('classes keys are applied (button, size, colour, group root/grouped/position)', () => {
    render(
      <ToggleButtonGroup value="a" classes={{ root: 'gr', grouped: 'gg', firstButton: 'gf', lastButton: 'gl' }}>
        <ToggleButton value="a" classes={{ root: 'br', selected: 'bs', sizeMedium: 'bm', standard: 'bst' }}>
          {'A'}
        </ToggleButton>
        <ToggleButton value="b">{'B'}</ToggleButton>
      </ToggleButtonGroup>,
    );
    expect(screen.getByRole('group').classList.contains('gr')).toBe(true);
    const a = screen.getByRole('button', { name: 'A' });
    for (const c of ['br', 'bs', 'bm', 'bst', 'gg', 'gf']) {
      expect(a.classList.contains(c)).toBe(true);
    }
    expect(screen.getByRole('button', { name: 'B' }).classList.contains('gl')).toBe(true);
  });

  it('action.focusVisible() focuses and marks focus-visible; touchRippleRef exposes start/stop/pulsate', () => {
    const action = createRef<ButtonBaseActions>();
    const ripple = createRef<TouchRippleActions>();
    render(
      <ToggleButton value="a" action={action} touchRippleRef={ripple} focusVisibleClassName="fv">
        {'A'}
      </ToggleButton>,
    );
    act(() => action.current?.focusVisible());
    const button = screen.getByRole('button');
    expect(document.activeElement).toBe(button);
    expect(button.classList.contains('Mui-focusVisible')).toBe(true);
    expect(button.classList.contains('fv')).toBe(true);
    expect(typeof ripple.current?.start).toBe('function');
    act(() => ripple.current?.pulsate());
    expect(button.querySelector('.MuiTouchRipple-root')).not.toBeNull();
  });

  it('a callback ref is not re-invoked on re-render', () => {
    const calls: (HTMLElement | null)[] = [];
    const cb = (n: HTMLElement | null) => {
      calls.push(n);
    };
    const { rerender } = render(
      <ToggleButton value="a" ref={cb}>
        {'A'}
      </ToggleButton>,
    );
    rerender(
      <ToggleButton value="a" ref={cb} selected>
        {'A'}
      </ToggleButton>,
    );
    expect(calls).toHaveLength(1);
  });

  it('a flat sx object applies as inline style', () => {
    render(
      <ToggleButton value="a" sx={{ width: 40 }}>
        {'A'}
      </ToggleButton>,
    );
    expect(screen.getByRole('button').style.width).toBe('40px');
  });
});
