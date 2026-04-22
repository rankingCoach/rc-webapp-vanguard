import React, { useMemo, useState } from 'react';
import { animated, to, useSpring, useTransition } from 'react-spring';

import { GENERIC_LEAVE, getEntryPresetConfig, HOVER_DEFAULTS } from './CardMotion.config';
import styles from './CardMotion.module.scss';
import { CardMotionProps } from './CardMotion.types';

export function CardMotion({
  delay,
  style,
  children,
  hoverable = false,
  glowIn = false,
  index,
  isVisible = true,
  entryPreset,
  entryAnimation,
  leaveAnimation,
  hoverAnimation,
}: CardMotionProps) {
  const [isHovered, setIsHovered] = useState(false);

  const resolvedEntryPreset = entryPreset ?? (glowIn ? 'glow-in' : 'fade-up');

  const resolvedHover = useMemo(() => {
    if (hoverAnimation === false || (!hoverable && hoverAnimation === undefined)) {
      return {
        ...HOVER_DEFAULTS,
        y: 0,
      };
    }

    return {
      ...HOVER_DEFAULTS,
      ...(hoverable ? {} : { y: 0 }),
      ...hoverAnimation,
    };
  }, [hoverAnimation, hoverable]);

  const hoverStyle = useSpring({
    hoverY: isHovered ? resolvedHover.y : 0,
    hoverScale: isHovered ? resolvedHover.scale : 1,
    config: {
      tension: resolvedHover.tension,
      friction: resolvedHover.friction,
    },
  });

  const presetConfig = useMemo(
    () => getEntryPresetConfig(resolvedEntryPreset, delay, style, index, entryAnimation),
    [resolvedEntryPreset, delay, style, index, entryAnimation],
  );

  const genericLeave = useMemo(
    () => ({
      ...GENERIC_LEAVE,
      ...(leaveAnimation === false
        ? { ...GENERIC_LEAVE, opacity: 1, y: 0, scale: 1, blur: 0, duration: 0, delay: 0 }
        : leaveAnimation),
    }),
    [leaveAnimation],
  );

  const transitions = useTransition(isVisible ? ['visible'] : [], {
    keys: (item) => item,
    from: presetConfig.transitionFrom,
    enter: presetConfig.transitionEnter,
    leave:
      leaveAnimation === false
        ? {
            opacity: 1,
            y: 0,
            scale: 1,
            blur: 0,
          }
        : {
            opacity: genericLeave.opacity,
            y: genericLeave.y,
            scale: genericLeave.scale,
            blur: genericLeave.blur,
          },
    delay: isVisible ? (delay + presetConfig.delayOffset) * 1000 : genericLeave.delay * 1000,
    config: {
      duration: (isVisible ? presetConfig.duration : genericLeave.duration) * 1000,
    },
    expires: true,
  });

  if (!isVisible && leaveAnimation === false) {
    return null;
  }

  return transitions((transitionStyle) => (
    <animated.div
      onMouseEnter={hoverable || hoverAnimation ? () => setIsHovered(true) : undefined}
      onMouseLeave={hoverable || hoverAnimation ? () => setIsHovered(false) : undefined}
      style={{
        ...(presetConfig.baseStyle ?? {}),
        opacity: transitionStyle.opacity,
        filter: transitionStyle.blur.to((value) => `blur(${value}px)`),
        transform: to(
          [transitionStyle.y, transitionStyle.scale, hoverStyle.hoverY, hoverStyle.hoverScale],
          (motionY, motionScale, hoverY, hoverScale) =>
            `translate3d(0, ${motionY + hoverY}px, 0) scale(${motionScale * hoverScale})`,
        ),
      }}
    >
      {presetConfig.kind === 'glow-shell' ? (
        <div className={styles.glowShell} style={presetConfig.shellStyle} data-card-motion-index={index}>
          <div className={styles.contentIn} style={presetConfig.contentStyle}>
            {children}
          </div>
        </div>
      ) : (
        children
      )}
    </animated.div>
  ));
}
