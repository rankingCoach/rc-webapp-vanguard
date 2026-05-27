import React, { useState } from 'react';
import { expect, within } from 'storybook/test';

import { Switch } from '../Switch';
import { SwitchStory } from './_Switch.default';

export const SwitchLoading: SwitchStory = {
  args: {
    value: false,
    children: 'Loading switch',
    size: 'big',
    testId: 'switch-loading',
  },
  render: (args) => {
    const [loading, setLoading] = useState(false);
    return (
      <Switch
        {...args}
        loading={loading}
        onChange={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 2000);
        }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const switchContainer = canvas.getByTestId('switch-loading');
    await expect(switchContainer).toBeInTheDocument();
  },
};
