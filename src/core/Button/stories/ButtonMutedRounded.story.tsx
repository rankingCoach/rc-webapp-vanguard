import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';
import { expect } from 'storybook/test';

import { Button, ButtonSizes } from '../Button';
import { ButtonStory } from './_Button.default';
import { comboButtonProps, expectMutedSurface, getButtonByTestId, MUTED_COMBOS, Surface, waitForIcons } from './_mutedSurfaces';

const description = `
\`rounded\` muted buttons, icon only, in every size, on a light and a dark surface. This is the shape used for the close
buttons of Modal, Drawer and NavigationModal. The fill layer inherits the button's border radius (\`border-radius:
inherit\`), so it stays a perfect circle.
`;

const SIZES = [ButtonSizes.small, ButtonSizes.medium, ButtonSizes.large, ButtonSizes.extraLarge] as const;
const ROWS = [
  { combo: MUTED_COMBOS[0], surface: 'pale' as const },
  { combo: MUTED_COMBOS[3], surface: 'pale' as const },
  { combo: MUTED_COMBOS[1], surface: 'teal' as const },
  { combo: MUTED_COMBOS[2], surface: 'dark' as const },
];

const id = (combo: string, surface: string, size: string) => `rounded-${combo}-${surface}-${size}`;

// Tests rounded icon-only buttons across sizes on light and dark surfaces
export const ButtonMutedRounded: ButtonStory = {
  globals: { theme: 'light' },
  parameters: { docs: { description: { story: description } } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {ROWS.map(({ combo, surface }) => (
        <Surface key={`${combo.key}-${surface}`} surface={surface} caption={`rounded - ${combo.label}`}>
          {SIZES.map((size) => (
            <Button
              key={size}
              {...comboButtonProps(combo, { rounded: true, size, icon: IconNames.close })}
              testId={id(combo.key, surface, size)}
            />
          ))}
        </Surface>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitForIcons(canvasElement, ROWS.length * SIZES.length);
    for (const { combo, surface } of ROWS) {
      for (const size of SIZES) {
        const button = getButtonByTestId(canvasElement, id(combo.key, surface, size));
        await expectMutedSurface(button, { fg: combo.fg, blend: combo.blend });
        const rect = button.getBoundingClientRect();
        await expect(Math.abs(rect.width - rect.height)).toBeLessThan(1);
        // The fill layer follows the round shape
        await expect(getComputedStyle(button, '::after').borderRadius).toBe(getComputedStyle(button).borderRadius);
      }
    }
  },
};
