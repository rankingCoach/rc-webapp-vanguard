import { disableControls } from '@test-utils/get-storybook-decorator';
import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button, ButtonProps, ButtonSizes, ButtonTypes } from '../Button';
import { BUTTONS_EXCLUDED_CONTROLS_MUTED, ButtonStory, mutedButtonArgTypes } from './_Button.default';
import { expectForeground, expectMutedSurface, FG_WHITE, Surface } from './_mutedSurfaces';

const description = `
\`onDark\` swaps only the **text, icon and focus ring** colour to white. The fill is still the translucent grey-blue
\`multiply\` layer, so it reads as a soft darker pill on mid-tone surfaces such as the Ado bubble teal (\`#00495d\`).

Use it for a default (non-inverted) muted button that sits on a mid-to-dark brand surface. For fully dark or
photographic backgrounds prefer \`inverted\`.
`;

// Tests the muted button on a mid-tone teal surface (Ado bubble)
export const ButtonTypeMutedOnDark: ButtonStory = {
  globals: { theme: 'light' },
  argTypes: {
    ...disableControls(BUTTONS_EXCLUDED_CONTROLS_MUTED),
    ...mutedButtonArgTypes,
  },
  args: {
    type: ButtonTypes.muted,
    onDark: true,
    children: 'Click Me',
    onClick: fn(),
  },
  parameters: { docs: { description: { story: description } } },
  render: (args: ButtonProps) => (
    <Surface surface="teal">
      <Button {...args} testId="on-dark-label" />
      <Button {...args} icon={IconNames.add} iconPosition="left" testId="on-dark-icon" />
      <Button {...args} icon={IconNames.add} iconPosition="right" size={ButtonSizes.large} testId="on-dark-icon-large" />
    </Surface>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId('on-dark-label_button');
    await expectMutedSurface(button, { fg: FG_WHITE, blend: 'multiply' });

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    // Icon follows the foreground colour
    const icon = await canvas.findByTestId('on-dark-icon_icon');
    await waitFor(() => expect(icon.getBoundingClientRect().width).toBeGreaterThan(0));
    await waitFor(() => expectForeground(canvas.getByTestId('on-dark-icon_button'), FG_WHITE, true));
    await expectForeground(canvas.getByTestId('on-dark-label_button'), FG_WHITE);
  },
};
