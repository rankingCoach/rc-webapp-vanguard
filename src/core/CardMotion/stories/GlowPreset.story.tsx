import React from 'react';

import styles from './CardMotionStories.module.scss';
import { Story } from './_CardMotion.default';

export const GlowPreset: Story = {
  args: {
    delay: 0,
    entryPreset: 'glow-in',
    className: `${styles.glowRoot} ${styles.cardSurface} ${styles.surfaceGlow}`,
    children: (
      <div className={styles.contentPadding}>
        <strong>Glow preset card</strong>
        <span>Explicit preset path for future entry animation variants.</span>
      </div>
    ),
  },
};
