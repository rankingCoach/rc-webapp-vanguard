import { useHover } from '@custom-hooks/use-hover';
import { classNames } from '@helpers/classNames';
import React, { useEffect, useRef } from 'react';

import styles from './FadeCarouselAuto.module.scss';

export interface FadeCarouselAutoProps<T = any> {
  items: T[];
  ItemType: React.FC<T>;
  gap?: number;
  speed?: number;
  interval?: number;
}

export const FadeCarouselAuto = <T extends {}>(props: FadeCarouselAutoProps<T>): React.ReactElement => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { items, ItemType, gap = 0, speed = 0, interval = 5 } = props;
  const isTriggerHovered = useHover(scrollRef);

  const beforeStyle: React.CSSProperties = {
    content: '""',
    // position: "absolute",
    // border: "1px solid red",
    top: 0,
    left: 0,
    padding: 10,
    height: '100%',
    // width: "35%", // Adjust the width as needed
    // background: `linear-gradient(to right, ${gradientColor}, rgba(245, 247, 249, 0))`,
    maskImage: 'linear-gradient(90deg, rgba(0,0,0,0) 5%, rgba(0,0,0,1) 25%)',
    // pointerEvents: "none", // Allows interactions with underlying content
    zIndex: 2,
  };

  useEffect(() => {
    const container = scrollRef.current;
    let intervalId: NodeJS.Timeout;
    let lastTime = performance.now(); // Use high precision time

    if (container && !isTriggerHovered) {
      intervalId = setInterval(() => {
        const currentTime = performance.now();
        const timeDiff = currentTime - lastTime;

        // Calculate the distance to scroll based on the time difference
        const distanceToScroll = (speed * timeDiff) / interval;

        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        } else {
          container.scrollLeft += distanceToScroll;
        }

        lastTime = currentTime;
      }, interval);
    }

    return () => clearInterval(intervalId);
  }, [scrollRef.current, isTriggerHovered]);

  return (
    <div data-slot={'fade-carousel-auto'} className={styles.carousel}>
      {/*<div style={beforeStyle} />*/}
      <div
        data-slot={'fade-carousel-auto-scroll'}
        className={classNames(styles.scrollContainer)}
        style={{ display: 'flex', gap, ...beforeStyle }}
        ref={scrollRef}
      >
        {[...items, ...items].map((item, index) => (
          <div data-slot={'fade-carousel-auto-item'} key={index} className={styles.carouselItem}>
            <ItemType {...item} />
          </div>
        ))}
      </div>
    </div>
  );
};
