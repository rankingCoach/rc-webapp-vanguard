import React from 'react';
import { expect, fn, within } from 'storybook/test';

import { Switch } from '../Switch';
import { SwitchStory } from './_Switch.default';
import { disableControls } from '@test-utils/get-storybook-decorator';

export const SwitchSizes: SwitchStory = {
  args: {
    value: false,
    children: 'Switch label',
    onChange: fn(),
  },
  argTypes: {
    ...disableControls(['size']),
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ minWidth: '60px', fontSize: '14px', fontWeight: 500 }}>Small:</span>
        <Switch {...args} size="small" testId="switch-size-small" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ minWidth: '60px', fontSize: '14px', fontWeight: 500 }}>Big:</span>
        <Switch {...args} size="big" testId="switch-size-big" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const smallSwitch = canvas.getByTestId('switch-size-small');
    await expect(smallSwitch).toBeInTheDocument();

    const bigSwitch = canvas.getByTestId('switch-size-big');
    await expect(bigSwitch).toBeInTheDocument();
  },
};
