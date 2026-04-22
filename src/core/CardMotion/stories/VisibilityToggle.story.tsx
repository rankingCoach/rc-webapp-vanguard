import React, { useEffect, useState } from 'react';

import { CardMotion } from '../CardMotion';
import styles from './CardMotionStories.module.scss';
import { Story } from './_CardMotion.default';

export const VisibilityToggle: Story = {
  render: (args) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      const hideTimeout = window.setTimeout(() => setIsVisible(false), 1200);
      const showTimeout = window.setTimeout(() => setIsVisible(true), 2200);

      return () => {
        window.clearTimeout(hideTimeout);
        window.clearTimeout(showTimeout);
      };
    }, []);

    return (
      <CardMotion
        {...args}
        isVisible={isVisible}
        leaveAnimation={{
          y: 18,
          opacity: 0,
          duration: 0.22,
        }}
      >
        <div className={`${styles.cardSurface} ${styles.surfaceAccent}`}>Visibility-driven leave animation</div>
      </CardMotion>
    );
  },
  args: {
    delay: 0,
    entryAnimation: {
      y: 18,
      duration: 0.24,
    },
  },
};
