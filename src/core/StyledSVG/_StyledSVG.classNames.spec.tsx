import { render, waitFor } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { Icon } from '../Icon/Icon';
import { IconNames } from '../Icon/IconNames';
import { StyledSVG } from './StyledSVG';

/**
 * StyledSVG's class attribute holds only real class tokens: one per set prop, no `false`/`undefined` tokens and no
 * stray whitespace, whichever props are unset (@helpers/classNames is a plain join, so falsy entries must not reach it).
 */
// Inline data URI: react-inlinesvg parses it without a network request.
const SVG_SRC = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>')}`;
const tokens = (el: Element) => el.getAttribute('class') ?? '';

describe('StyledSVG class attribute', () => {
  it('Icon: no false tokens, no duplicate or empty tokens', async () => {
    const { container } = render(<Icon>{IconNames.caretDown}</Icon>);
    const svg = await waitFor(() => {
      const el = container.querySelector('svg.vg-styled-svg');
      expect(el).not.toBeNull();
      return el as Element;
    });
    const cls = tokens(svg);
    expect(cls.split(' ')).not.toContain('false');
    expect(cls).not.toMatch(/\s{2,}|^\s|\s$/);
    expect(new Set(cls.split(' ')).size).toBe(cls.split(' ').length);
  });

  it('every prop combination: one token per set prop, caller className last', async () => {
    const all = {
      width: 12,
      color: 'red',
      fillOpacity: 0.5,
      backgroundcolor: 'blue',
      backgroundrepeat: 'no-repeat',
      hovercolor: 'green',
    };
    const mod = {
      width: 'size',
      color: 'fill',
      fillOpacity: 'fill-opacity',
      backgroundcolor: 'rect-fill',
      backgroundrepeat: 'repeat',
      hovercolor: 'hover-fill',
    } as const;
    for (const keys of [[], ['width'], ['color', 'hovercolor'], Object.keys(all)] as (keyof typeof all)[][]) {
      for (const className of [undefined, 'mine']) {
        const props = Object.fromEntries(keys.map((k) => [k, all[k]]));
        const { container, unmount } = render(<StyledSVG src={SVG_SRC} className={className} {...props} />);
        const svg = await waitFor(() => {
          const el = container.querySelector('svg');
          expect(el).not.toBeNull();
          return el as Element;
        });
        expect(tokens(svg)).toBe(
          ['vg-styled-svg', ...keys.map((k) => `vg-styled-svg--${mod[k]}`), ...(className ? [className] : [])].join(
            ' ',
          ),
        );
        unmount();
      }
    }
  });
});
