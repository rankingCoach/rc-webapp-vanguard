import { disableControls } from '@test-utils/get-storybook-decorator';
import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button, ButtonProps, ButtonTypes, MutedButtonProps } from '../Button';
import { BUTTONS_EXCLUDED_CONTROLS_MUTED, ButtonStory, mutedButtonArgTypes } from './_Button.default';
import { expectForeground, expectMutedSurface, FG_DARK, getLayerStyle, Surface } from './_mutedSurfaces';

const description = `
**Inverted + onDark** keeps the inverted \`plus-lighter\` white fill (18 % rest, 28 % hover) but switches the label,
icon and focus ring to the dark \`#263349\` / blue \`#0062ff\`. That makes it legible on **light surfaces and photos**
(pale ripple gradient, bright imagery) where a white label would vanish, while still lifting the surface slightly.

Use it for muted buttons that must stay inverted in treatment (e.g. a frosted pill over imagery) but sit on light
content. Spec decision 15 (inset ring on pale surfaces) is not applied; see the *Blend edge cases* story.
`;

// Story args are the full ButtonProps union: force the muted type and type-check the overrides
const b = (a: ButtonProps, extra: Partial<MutedButtonProps> = {}): MutedButtonProps => ({
  ...(a as MutedButtonProps),
  ...extra,
  type: ButtonTypes.muted,
});

// Tests the headline inverted + onDark variant on pale and photo surfaces
export const ButtonTypeMutedInvertedOnDark: ButtonStory = {
  globals: { theme: 'light' },
  argTypes: {
    ...disableControls(BUTTONS_EXCLUDED_CONTROLS_MUTED),
    ...mutedButtonArgTypes,
  },
  args: {
    type: ButtonTypes.muted,
    inverted: true,
    onDark: true,
    children: 'Click Me',
    onClick: fn(),
  },
  parameters: { docs: { description: { story: description } } },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Surface surface="pale">
        <Button {...b(args)} testId="inv-on-dark-pale" />
        <Button {...b(args, { icon: IconNames.add })} testId="inv-on-dark-pale-icon" />
        <Button {...b(args, { blurred: true })} testId="inv-on-dark-pale-blurred" />
      </Surface>
      <Surface surface="photo">
        <Button {...b(args)} testId="inv-on-dark-photo" />
        <Button {...b(args, { icon: IconNames.add })} testId="inv-on-dark-photo-icon" />
        <Button {...b(args, { blurred: true })} testId="inv-on-dark-photo-blurred" />
      </Surface>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId('inv-on-dark-pale_button');
    await expectMutedSurface(button, { fg: FG_DARK, blend: 'plus-lighter' });
    await expectMutedSurface(canvas.getByTestId('inv-on-dark-photo_button'), { fg: FG_DARK, blend: 'plus-lighter' });
    await expectMutedSurface(canvas.getByTestId('inv-on-dark-pale-blurred_button'), {
      fg: FG_DARK,
      blend: 'plus-lighter',
    });
    await expect(getLayerStyle(canvas.getByTestId('inv-on-dark-pale-blurred_button'), '::before').backdropFilter).toContain('blur(');

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    const icon = await canvas.findByTestId('inv-on-dark-pale-icon_icon');
    await waitFor(() => expect(icon.getBoundingClientRect().width).toBeGreaterThan(0));
    for (const id of ['inv-on-dark-pale', 'inv-on-dark-photo', 'inv-on-dark-pale-blurred']) {
      await expectForeground(canvas.getByTestId(`${id}_button`), FG_DARK);
    }
    await waitFor(() => expectForeground(canvas.getByTestId('inv-on-dark-pale-icon_button'), FG_DARK, true));
  },
};
