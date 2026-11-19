// Test-only reference: StyledSVG as it was before 817bf04 (styled-components), verbatim apart from this header.
// Used by _StyledSVGLegacyParity.stories.tsx to lock descendant geometry parity; not exported from the package.
import { SVGProps } from 'react';
import styled from 'styled-components';
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

export const StyledSVGLegacy = styled(SVG).attrs<RcSvgProps>(({ testid }) => ({
  'data-testid': testid,
}))<RcSvgProps>`
  width: ${({ width }) => width}px;
  filter: (${({ filter }) => filter}px);
  height: ${({ width }) => width}px;
  vertical-align: baseline;
  background-repeat: ${({ backgroundrepeat }) => backgroundrepeat};

  & path {
    width: ${({ width }) => width}px;
    height: ${({ width }) => width}px;
    fill: ${({ color }) => color};
    fill-opacity: ${({ fillOpacity }) => fillOpacity};
    background-repeat: ${({ backgroundrepeat }) => backgroundrepeat};
  }

  & rect {
    fill: ${({ backgroundcolor }) => backgroundcolor};
    background-repeat: ${({ backgroundrepeat }) => backgroundrepeat};
  }

  &:hover {
    & path {
      fill: ${({ hovercolor }) => hovercolor};
    }
  }

  &.hover {
    & path {
      fill: ${({ hovercolor }) => hovercolor};
    }
  }
`;
