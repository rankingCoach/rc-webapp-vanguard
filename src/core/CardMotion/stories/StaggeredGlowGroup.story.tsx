import React from 'react';

import { CardMotion } from '../CardMotion';
import { Story } from './_CardMotion.default';

const cards = [
  'Brief',
  'Reviews',
  'Directories',
  'Social KPI',
  'Connections',
];

export const StaggeredGlowGroup: Story = {
  render: () => {
    let delayIdx = 0;

    return (
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        {cards.map((label, cardIndex) => (
          <CardMotion
            key={label}
            delay={delayIdx++ * 0.08}
            glowIn={true}
            hoverable={true}
            index={cardIndex + 1}
            style={{
              minHeight: 148,
              padding: 24,
              background: '#ffffff',
              border: '1px solid #e5e7eb',
            }}
          >
            <>
              <strong>{label}</strong>
              <span>Brief-style staggered glow entry with delayed content resolve.</span>
            </>
          </CardMotion>
        ))}
      </div>
    );
  },
};
