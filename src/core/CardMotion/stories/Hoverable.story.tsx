import React from 'react';

import { Story } from './_CardMotion.default';

export const Hoverable: Story = {
  args: {
    delay: 0,
    hoverable: true,
    children: (
      <div style={{ padding: 24, borderRadius: 18, background: '#fff7ed', border: '1px solid #fdba74' }}>
        Hover to lift
      </div>
    ),
  },
};
