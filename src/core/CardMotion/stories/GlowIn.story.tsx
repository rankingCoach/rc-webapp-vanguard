import React from 'react';

import styles from './CardMotionStories.module.scss';
import { Story } from './_CardMotion.default';

export const GlowIn: Story = {
  args: {
    delay: 0,
    glowIn: true,
    index: 1,
    className: `${styles.glowRoot} ${styles.cardSurface} ${styles.surfaceGlow}`,
    children: (
      <div className={styles.contentPadding}>
        <strong>Glow-in card</strong>
        <span>Background is owned by the animation while content fades in separately.</span>
      </div>
    ),
  },
};
