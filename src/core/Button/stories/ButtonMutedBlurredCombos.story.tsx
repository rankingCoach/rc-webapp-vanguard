import React from 'react';
import { expect } from 'storybook/test';

import { Button } from '../Button';
import { ButtonStory } from './_Button.default';
import {
  comboButtonProps,
  expectMutedSurface,
  getButtonByTestId,
  getLayerStyle,
  MUTED_COMBOS,
  Surface,
} from './_mutedSurfaces';

const description = `
\`blurred\` combined with every muted combination, over a photo and a gradient, plus a blurred disabled button.

The blur lives on the button's \`::before\` layer (\`backdrop-filter: blur(...)\`), not on the button itself, so the
\`::after\` fill layer still blends (\`multiply\` / \`plus-lighter\`) with what is behind it. When the button is
disabled, only the layers fade; the blur stays.
`;

const SURFACES = ['photo', 'warm'] as const;
const id = (combo: string, surface: string, extra = '') => `blurred-${combo}-${surface}${extra}`;

// Tests blurred x all combos over photo and gradient
export const ButtonMutedBlurredCombos: ButtonStory = {
  globals: { theme: 'light' },
  parameters: { docs: { description: { story: description } } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {SURFACES.map((surface) => (
        <Surface key={surface} surface={surface}>
          {MUTED_COMBOS.map((combo) => (
            <div key={combo.key} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Button {...comboButtonProps(combo, { blurred: true })} testId={id(combo.key, surface)}>
                {combo.label}
              </Button>
              <Button
                {...comboButtonProps(combo, { blurred: true, disabled: true })}
                testId={id(combo.key, surface, '-disabled')}
              >
                disabled
              </Button>
            </div>
          ))}
        </Surface>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const surface of SURFACES) {
      for (const combo of MUTED_COMBOS) {
        const button = getButtonByTestId(canvasElement, id(combo.key, surface));
        await expectMutedSurface(button, { fg: combo.fg, blend: combo.blend });
        await expect(getLayerStyle(button, '::before').backdropFilter).toContain('blur(');

        const disabled = getButtonByTestId(canvasElement, id(combo.key, surface, '-disabled'));
        await expect(disabled).toBeDisabled();
        await expectMutedSurface(disabled, { fg: combo.fg, blend: combo.blend });
        await expect(getLayerStyle(disabled, '::before').backdropFilter).toContain('blur(');
        await expect(getLayerStyle(disabled, '::after').opacity).toBe('0.4');
      }
    }
  },
};
