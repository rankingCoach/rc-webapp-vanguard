import React from 'react';

import { Story } from './_CardMotion.default';

export const GlowIn: Story = {
  args: {
    delay: 0,
    glowIn: true,
    index: 1,
    style: {
      padding: 24,
      minHeight: 140,
      background: '#111827',
      border: '1px solid #d7dce3',
    },
    children: (
      <>
        <strong>Glow-in card</strong>
        <span>Background is owned by the animation while content fades in separately.</span>
      </>
    ),
  },
};
