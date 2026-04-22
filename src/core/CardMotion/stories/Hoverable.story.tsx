import React from 'react';

import styles from './CardMotionStories.module.scss';
import { Story } from './_CardMotion.default';

export const Hoverable: Story = {
  args: {
    delay: 0,
    hoverable: true,
    children: <div className={`${styles.cardSurface} ${styles.surfaceWarm}`}>Hover to lift</div>,
  },
};
