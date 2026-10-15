import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';
import { expect, waitFor, within } from 'storybook/test';

import { Button } from '../Button';
import { ButtonStory } from './_Button.default';
import {
  comboButtonProps,
  expectMutedSurface,
  getButtonByTestId,
  MUTED_COMBOS,
  MUTED_SURFACE_KEYS,
  MUTED_SURFACES,
  Surface,
  waitForIcons,
} from './_mutedSurfaces';

const description = `
Every muted combination (rows) rendered on every reference surface (columns). Use it to judge which combination suits
which background: the intended surface of each row is its first guess, but the matrix shows the others too, including
the ones where the fill intentionally disappears (\`multiply\` on near-black, \`plus-lighter\` on white).
`;

const id = (combo: string, surface: string) => `matrix-${combo}-${surface}`;

// Tests all muted combinations on all surfaces
export const ButtonMutedSurfaceMatrix: ButtonStory = {
  globals: { theme: 'light' },
  parameters: { layout: 'fullscreen', docs: { description: { story: description } } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', overflowX: 'auto' }}>
      {MUTED_COMBOS.map((combo) => (
        <div key={combo.key} style={{ display: 'flex', gap: '8px' }}>
          {MUTED_SURFACE_KEYS.map((surface) => (
            <Surface
              key={surface}
              surface={surface}
              caption={`${combo.label} on ${MUTED_SURFACES[surface].label}`}
              style={{ flex: '0 0 220px', minHeight: '110px' }}
            >
              <Button {...comboButtonProps(combo)} icon={IconNames.add} testId={id(combo.key, surface)}>
                Button
              </Button>
            </Surface>
          ))}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitForIcons(canvasElement, MUTED_COMBOS.length * MUTED_SURFACE_KEYS.length);
    for (const combo of MUTED_COMBOS) {
      for (const surface of MUTED_SURFACE_KEYS) {
        const button = getButtonByTestId(canvasElement, id(combo.key, surface));
        await expectMutedSurface(button, { fg: combo.fg, blend: combo.blend });
      }
    }
    await waitFor(() => expect(canvas.getAllByRole('button')).toHaveLength(24));
  },
};
