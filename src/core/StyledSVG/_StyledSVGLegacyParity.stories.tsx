import { TRANSITION_LONGHANDS } from '@test-utils/transition-longhands';
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, waitFor } from 'storybook/test';
import superpages from '../../custom-hooks/use-dynamic-import/assets/avatarIcons/listings/superpages.svg?url';
import iconAdo from '../../custom-hooks/use-dynamic-import/assets/icons/Icon-ado.svg?url';
import iconMaps from '../../custom-hooks/use-dynamic-import/assets/icons/Icon-maps.svg?url';
import shieldSecured from '../../custom-hooks/use-dynamic-import/assets/shield_secured.svg?url';
import { StyledSVGLegacy } from './_StyledSVGLegacy.reference';
import { StyledSVG } from './StyledSVG';

/**
 * Watchdog check on 817bf04 (StyledSVG → static SCSS): descendant geometry parity with the former styled-components
 * StyledSVG (verbatim in _StyledSVGLegacy.reference.tsx). In SVG2, CSS width/height are geometry for rect, image,
 * use, foreignObject and nested svg; the old template set them only on `path` (as does the static rule). For
 * rect-, image- and use-bearing assets at 16 and 32 px: computed width/height and getBBox() of the svg and every
 * descendant must be identical, legacy vs current.
 */
const ASSETS = { iconAdo, iconMaps, shieldSecured, superpages };
const SIZES = [16, 32];

const Grid = () => (
  <div>
    {Object.entries(ASSETS).flatMap(([name, src]) =>
      SIZES.map((size) =>
        (['legacy', 'current'] as const).map((impl) => {
          const C = impl === 'legacy' ? StyledSVGLegacy : StyledSVG;
          return (
            <span
              key={`${name}-${size}-${impl}`}
              data-case={`${name}@${size}`}
              data-impl={impl}
              style={{ display: 'inline-block', width: 40, height: 40 }}
            >
              <C src={src} width={size} height={size} color="#c0392b" hovercolor="#2980b9" />
            </span>
          );
        }),
      ),
    )}
  </div>
);

const geometry = (host: Element) =>
  [...host.querySelectorAll('svg, svg *')].map((el) => {
    const cs = getComputedStyle(el);
    let bbox: number[] | null = null;
    try {
      const b = (el as SVGGraphicsElement).getBBox();
      bbox = [b.x, b.y, b.width, b.height].map((v) => +v.toFixed(3));
    } catch {
      /* non-graphics element */
    }
    return {
      tag: el.tagName,
      width: cs.width,
      height: cs.height,
      bbox,
      transition: TRANSITION_LONGHANDS.map((property) => cs.getPropertyValue(property)),
    };
  });

export const DescendantGeometry: StoryObj = {
  render: () => <Grid />,
  play: async ({ canvasElement }) => {
    const cases = [
      ...new Set([...canvasElement.querySelectorAll('[data-case]')].map((e) => e.getAttribute('data-case') as string)),
    ];
    await waitFor(() => expect(canvasElement.querySelectorAll('[data-impl] svg').length).toBe(cases.length * 2), {
      timeout: 10000,
    });
    const tags = new Set<string>();
    for (const c of cases) {
      const get = (impl: string) => canvasElement.querySelector(`[data-case="${c}"][data-impl="${impl}"]`) as Element;
      const legacy = geometry(get('legacy'));
      for (const g of legacy) tags.add(g.tag);
      await expect({ c, geometry: geometry(get('current')) }).toEqual({ c, geometry: legacy });
    }
    // Guard: the assets really carry the SVG2 geometry elements this check is about.
    await expect([...tags].filter((t) => ['rect', 'image', 'use'].includes(t)).sort()).toEqual([
      'image',
      'rect',
      'use',
    ]);
  },
};

export default { ...SbDecorator({ title: 'Vanguard/StyledSVG/LegacyParity', component: StyledSVG }) };
