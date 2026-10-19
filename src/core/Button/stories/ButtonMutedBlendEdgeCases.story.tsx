import React from 'react';
import { expect } from 'storybook/test';

import { Button, ButtonProps, ButtonTypes } from '../Button';
import { ButtonStory } from './_Button.default';
import {
  expectMutedSurface,
  FG_DARK,
  FG_WHITE,
  getButtonByTestId,
  getFillAlpha,
  MUTED_SURFACES,
  Surface,
} from './_mutedSurfaces';

const description = `
Edge cases of the blend-layer approach.

**(a) Ancestors that create stacking contexts.** The fill blends with whatever is painted inside the nearest isolated
group. Inside an ancestor with \`z-index\`, \`transform\` or \`opacity\` the button still renders and the layers stay
intact, but it blends only with that ancestor's own backdrop, not with the page behind it.

**(b) Fill that vanishes by design (spec decision 14).** A 60 % black glass over near-black is near-black, and
a 60 % white glass over white is white. The fill is present but invisible; the label stays legible. Pick the
combination for the surface.

**(c) onDark on mid teal (spec decision 11).** \`onDark\` is a dark glass: black 60 % (70 % on hover), blended
normally. The spec's 80 % proposal is not applied.

**(d) inverted + onDark on a pale surface (spec decision 15).** The spec proposes an inset ring to give the white
glass an edge on pale surfaces; this implementation does **not** add one, so on a near-white surface the 60 % white
fill barely shows and the label carries the button.
`;

const muted = (extra: Record<string, unknown>): ButtonProps => ({ type: ButtonTypes.muted, ...extra }) as ButtonProps;

// Tests blend edge cases: stacking-context ancestors, vanishing fills, undecided spec items
export const ButtonMutedBlendEdgeCases: ButtonStory = {
  globals: { theme: 'light' },
  parameters: { docs: { description: { story: description } } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Surface surface="pale" caption="(a) inside ancestors with z-index / transform / opacity">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Button {...muted({})} testId="edge-zindex">
            z-index
          </Button>
        </div>
        <div style={{ transform: 'translateZ(0)' }}>
          <Button {...muted({})} testId="edge-transform">
            transform
          </Button>
        </div>
        <div style={{ opacity: 0.9 }}>
          <Button {...muted({})} testId="edge-opacity">
            opacity
          </Button>
        </div>
      </Surface>
      <Surface surface="dark" caption="(b) default on near-black: multiply fill vanishes">
        <Button {...muted({ onDark: true })} testId="edge-default-on-black">
          default (onDark label)
        </Button>
      </Surface>
      <Surface surface="white" caption="(b) inverted + onDark on white: white glass vanishes">
        <Button {...muted({ inverted: true, onDark: true })} testId="edge-inverted-on-white">
          inverted on white
        </Button>
      </Surface>
      <Surface surface="teal" caption="(c) onDark on teal: 60% dark glass (80%, decision 11, not applied)">
        <Button {...muted({ onDark: true })} testId="edge-ondark-teal">
          onDark on teal
        </Button>
      </Surface>
      <Surface surface="pale" caption={`(d) inverted + onDark on ${MUTED_SURFACES.pale.label}: no inset ring (decision 15)`}>
        <Button {...muted({ inverted: true, onDark: true })} testId="edge-inv-ondark-pale">
          inverted + onDark
        </Button>
      </Surface>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const get = (id: string) => getButtonByTestId(canvasElement, id);

    // (a) layers intact inside stacking-context ancestors
    for (const id of ['edge-zindex', 'edge-transform', 'edge-opacity']) {
      await expectMutedSurface(get(id), { fg: FG_DARK, blend: 'multiply' });
    }

    // (b)
    await expectMutedSurface(get('edge-default-on-black'), { fg: FG_WHITE, blend: 'normal' });
    await expectMutedSurface(get('edge-inverted-on-white'), { fg: FG_DARK, blend: 'normal' });

    // (c) 60% dark glass, not 80%
    await expectMutedSurface(get('edge-ondark-teal'), { fg: FG_WHITE, blend: 'normal' });
    await expect(getFillAlpha(get('edge-ondark-teal'))).toBeCloseTo(0.6, 3);

    // (d) no inset ring (box-shadow) on the pale surface
    const pale = get('edge-inv-ondark-pale');
    await expectMutedSurface(pale, { fg: FG_DARK, blend: 'normal' });
    await expect(getComputedStyle(pale).boxShadow).toBe('none');
  },
};
