import React from 'react';

import styles from './CardMotionStories.module.scss';
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
    children: <div className={`${styles.cardSurface} ${styles.surfaceInfo}`}>Custom entry, leave, and hover motion</div>,
  },
};
