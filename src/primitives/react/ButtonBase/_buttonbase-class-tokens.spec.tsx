import MuiButtonBase from '@mui/material/ButtonBase';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { ButtonBase } from './ButtonBase';

/**
 * Junk class tokens (B finding, track h): MUI's clsx emits only real tokens separated by single spaces. The own
 * ButtonBase must not emit empty entries (stray spaces) and must carry MUI's token set, per state.
 */
const tokens = (cls: string) =>
  cls
    .split(' ')
    .filter((t) => t !== '' && !/^css-/.test(t))
    .sort();

describe('ButtonBase class attribute', () => {
  const cases: [string, Record<string, unknown>, boolean][] = [
    ['plain', {}, false],
    ['disabled', { disabled: true }, false],
    ['className', { className: 'extra' }, false],
    ['focus visible + focusVisibleClassName', { focusVisibleClassName: 'fv' }, true],
  ];
  for (const [name, props, focus] of cases) {
    it(`${name}: no empty tokens, MUI's token set`, () => {
      const own = render(<ButtonBase {...props}>{'x'}</ButtonBase>).container.firstElementChild as HTMLElement;
      const mui = render(<MuiButtonBase {...props}>{'x'}</MuiButtonBase>).container.firstElementChild as HTMLElement;
      if (focus) {
        fireEvent.keyDown(document.body, { key: 'Tab' });
        fireEvent.focus(own);
        fireEvent.focus(mui);
      }
      const cls = own.getAttribute('class') ?? '';
      expect(cls).toBe(cls.trim());
      expect(cls.includes('  ')).toBe(false);
      expect(tokens(cls)).toEqual(tokens(mui.getAttribute('class') ?? ''));
    });
  }
  it("callers' className with empty parts: single spaces, order kept (MenuItem/ToggleButton/Chip/AccordionSummary)", () => {
    const own = render(<ButtonBase className=" MuiMenuItem-root   MuiMenuItem-gutters  extra ">{'x'}</ButtonBase>)
      .container.firstElementChild as HTMLElement;
    expect(own.getAttribute('class')).toBe('MuiButtonBase-root MuiMenuItem-root MuiMenuItem-gutters extra');
  });
});
