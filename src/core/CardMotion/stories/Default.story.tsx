import React from 'react';

import styles from './CardMotionStories.module.scss';
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
      <div className={`${styles.cardSurface} ${styles.surfaceNeutral}`}>Default card content</div>
    ),
  },
};
