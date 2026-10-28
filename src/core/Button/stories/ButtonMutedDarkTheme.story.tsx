import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';
import { expect, waitFor } from 'storybook/test';

import { Button } from '../Button';
import { ButtonStory } from './_Button.default';
import { comboButtonProps, expectForeground, getButtonByTestId, MUTED_COMBOS, Surface } from './_mutedSurfaces';

const description = `
The four muted combinations with the Storybook **dark theme** global (\`light-dark()\` tokens resolve to their dark
values). Surfaces are painted explicitly: the surface, not the theme, decides which combination to use, and the default
combination keeps its own foreground token.

**Known issue (dark theme):** the default fill resolves to white at 10% under \`multiply\`, which leaves the surface
unchanged, so the default pill has no visible fill or hover feedback in the dark theme. Accepted for now; the fix
belongs in the theme (e.g. \`--button-muted-blend-mode: plus-lighter\` in the dark scheme blocks).
`;

const FG_DARK_THEME = 'rgb(246, 249, 252)';

// Tests the muted combinations under the dark theme global
export const ButtonMutedDarkTheme: ButtonStory = {
  globals: { theme: 'dark' },
  parameters: { docs: { description: { story: description } } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {MUTED_COMBOS.map((combo) => (
        <Surface key={combo.key} surface={combo.surface} caption={`${combo.label} (dark theme)`}>
          <Button {...comboButtonProps(combo, { icon: IconNames.add })} testId={`dark-${combo.key}`}>
            {combo.label}
          </Button>
        </Surface>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const combo of MUTED_COMBOS) {
      const button = getButtonByTestId(canvasElement, `dark-${combo.key}`);
      await waitFor(() => expect(button.querySelector('svg path')).not.toBeNull(), { timeout: 5000 });
      const style = getComputedStyle(button);
      await expect(getComputedStyle(button, '::after').mixBlendMode).toBe(combo.blend);
      await expect(style.mixBlendMode).toBe('normal');
      await expect(style.opacity).toBe('1');
      // default follows the theme (#263349 in light, #f6f9fc in dark); the glasses sit on a known surface, so
      // inverted + onDark keeps its dark text on the white glass and the others stay white
      const fg = combo.key === 'default' ? FG_DARK_THEME : combo.fg;
      await expectForeground(button, fg, true);
      if (combo.key === 'invertedOnDark') {
        await expect(style.getPropertyValue('--muted-ring').trim()).toMatch(/^(#0062ff|rgb\(0,\s*98,\s*255\))$/i);
      }
    }
  },
};
