import React from 'react';

import { Story } from './_CardMotion.default';

export const Default: Story = {
  args: {
    delay: 0,
    entryPreset: 'fade-up',
    entryAnimation: {
      y: 16,
      duration: 0.24,
    },
    children: (
      <div style={{ padding: 24, borderRadius: 18, background: '#ffffff', border: '1px solid #d7dce3' }}>
        Default card content
      </div>
    ),
  },
};
