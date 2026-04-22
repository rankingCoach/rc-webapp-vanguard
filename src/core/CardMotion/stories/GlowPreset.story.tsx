import React from 'react';

import { Story } from './_CardMotion.default';

export const GlowPreset: Story = {
  args: {
    delay: 0,
    entryPreset: 'glow-in',
    style: {
      padding: 24,
      minHeight: 140,
      background: '#111827',
      border: '1px solid #d7dce3',
    },
    children: (
      <>
        <strong>Glow preset card</strong>
        <span>Explicit preset path for future entry animation variants.</span>
      </>
    ),
  },
};
