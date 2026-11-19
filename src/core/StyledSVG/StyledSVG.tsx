import { classNames } from '@helpers/classNames';
import React, { CSSProperties, SVGProps } from 'react';

import SVG from './InlineSvg.tsx';

export type RcSvgProps = SVGProps<unknown> & {
  hovercolor?: string;
  testid?: string;
  src?: string;
  fillOpacity?: string;
  backgroundcolor?: string;
  backgroundrepeat?: string;
  // filter?: number;
};

/**
 * Inline SVG painted by static rules (StyledSVG.compat.scss, appended last to vanguard.css like the runtime styles it
 * replaces) and per-instance custom properties. Each rule carries its own class, added only when its prop is set: the
 * former styled-components template emitted `width: undefinedpx` / `fill: ;` for unset props, which browsers drop, so
 * an unset prop must leave no declaration at all. `filter` was emitted as invalid CSS and never applied; it still
 * reaches the element only as an attribute.
 */
/** Accepted props, as with the former styled(InlineSvg): the InlineSvg props plus RcSvgProps. */
export type StyledSVGProps = React.ComponentProps<typeof SVG> & RcSvgProps;

export const StyledSVG = (props: StyledSVGProps) => {
  const { testid, width, color, fillOpacity, backgroundcolor, backgroundrepeat, hovercolor, className, style } = props;
  const set = (v: unknown) => v !== undefined && v !== null;
  const vars: Record<string, string> = {};
  if (set(width)) vars['--vg-svg-size'] = `${width}px`;
  if (set(color)) vars['--vg-svg-fill'] = String(color);
  if (set(fillOpacity)) vars['--vg-svg-fill-opacity'] = String(fillOpacity);
  if (set(backgroundcolor)) vars['--vg-svg-rect-fill'] = String(backgroundcolor);
  if (set(backgroundrepeat)) vars['--vg-svg-repeat'] = String(backgroundrepeat);
  if (set(hovercolor)) vars['--vg-svg-hover-fill'] = String(hovercolor);
  return (
    <SVG
      {...(props as unknown as React.ComponentProps<typeof SVG>)}
      data-testid={testid}
      className={classNames(
        'vg-styled-svg',
        set(width) && 'vg-styled-svg--size',
        set(color) && 'vg-styled-svg--fill',
        set(fillOpacity) && 'vg-styled-svg--fill-opacity',
        set(backgroundcolor) && 'vg-styled-svg--rect-fill',
        set(backgroundrepeat) && 'vg-styled-svg--repeat',
        set(hovercolor) && 'vg-styled-svg--hover-fill',
        className,
      )}
      style={{ ...(vars as CSSProperties), ...style }}
    />
  );
};
