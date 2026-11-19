// Test-only reference: StyledSVG as it rendered before 817bf04, when it was `styled(InlineSvg)` (styled-components,
// since removed from the dependencies). Reproduces what styled-components did at runtime: one generated class per
// instance and the former template's CSS, interpolated the styled-components way (a falsy interpolation renders as
// '', so e.g. `width: px` / `fill: ;` are invalid and dropped by the browser), injected as a <style> at the END of
// <head> (where styled-components inserted). Used by _StyledSVGLegacyParity.stories.tsx; not exported.
import React, { SVGProps, useId, useLayoutEffect } from 'react';
import SVG from './InlineSvg.tsx';

type RcSvgProps = SVGProps<unknown> & {
  hovercolor?: string;
  testid?: string;
  src?: string;
  fillOpacity?: string;
  backgroundcolor?: string;
  backgroundrepeat?: string;
};

/** styled-components interpolation: false / null / undefined / '' render as '' (0 renders as 0). */
const i = (v: unknown) => (v === undefined || v === null || v === false || v === '' ? '' : String(v));

/** The former template (817bf04^ StyledSVG.tsx), verbatim apart from `&` → the instance class. */
const template = (c: string, p: RcSvgProps) => `
.${c} {
  width: ${i(p.width)}px;
  filter: (${i(p.filter)}px);
  height: ${i(p.width)}px;
  vertical-align: baseline;
  background-repeat: ${i(p.backgroundrepeat)};
}
.${c} path {
  width: ${i(p.width)}px;
  height: ${i(p.width)}px;
  fill: ${i(p.color)};
  fill-opacity: ${i(p.fillOpacity)};
  background-repeat: ${i(p.backgroundrepeat)};
}
.${c} rect {
  fill: ${i(p.backgroundcolor)};
  background-repeat: ${i(p.backgroundrepeat)};
}
.${c}:hover path {
  fill: ${i(p.hovercolor)};
}
.${c}.hover path {
  fill: ${i(p.hovercolor)};
}
`;

export const StyledSVGLegacy = (props: RcSvgProps & React.ComponentProps<typeof SVG>) => {
  const cls = `sc-legacy-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const css = template(cls, props);
  useLayoutEffect(() => {
    const style = document.createElement('style');
    style.setAttribute('data-styled-legacy', cls);
    style.textContent = css;
    document.head.appendChild(style);
    return () => style.remove();
  }, [cls, css]);
  const { testid, className } = props;
  return (
    <SVG
      {...(props as unknown as React.ComponentProps<typeof SVG>)}
      data-testid={testid}
      className={[cls, className].filter(Boolean).join(' ')}
    />
  );
};
