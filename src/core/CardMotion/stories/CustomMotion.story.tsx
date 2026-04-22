import React from 'react';

import { Story } from './_CardMotion.default';

export const CustomMotion: Story = {
  args: {
    delay: 0,
    hoverAnimation: {
      y: -10,
      scale: 1.03,
    },
    entryAnimation: {
      y: 20,
      blur: 3,
      scale: 0.98,
      duration: 0.28,
    },
    leaveAnimation: {
      y: 14,
      opacity: 0,
      blur: 2,
      duration: 0.18,
    },
    children: (
      <div style={{ padding: 24, borderRadius: 18, background: '#eef6ff', border: '1px solid #93c5fd' }}>
        Custom entry, leave, and hover motion
      </div>
    ),
  },
};
