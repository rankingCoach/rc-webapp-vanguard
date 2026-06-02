import React from 'react';

import { CardMotion } from '../CardMotion';
import styles from './CardMotionStories.module.scss';
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
      <div className={styles.group}>
        {cards.map((label, cardIndex) => (
          <CardMotion
            key={label}
            delay={delayIdx++ * 0.08}
            glowIn={true}
            hoverable={true}
            index={cardIndex + 1}
            className={`${styles.cardSurface} ${styles.groupCardSurface} ${styles.surfaceGlowGroup}`}
          >
            <div className={styles.groupCardContent}>
              <div className={styles.groupCardHeader}>
                <strong className={styles.groupCardTitle}>{label}</strong>
                <span className={styles.groupCardDescription}>
                  Brief-style staggered glow entry with delayed content resolve.
                </span>
              </div>
            </div>
          </CardMotion>
        ))}
      </div>
    );
  },
};
