import React from 'react';

import { CardMotionAnimation, CardMotionEntryPreset, EntryPresetConfig, MotionPhase } from './CardMotion.types';

export const SPRING_EASE_CSS =
  'linear(0, 0.024, 0.087, 0.194, 0.352, 0.604, 0.789, 0.923, 1.012, 1.04, 1.027, 1.008, 1)';

export const GENERIC_ENTRY: MotionPhase = {
  opacity: 0,
  y: 20,
  scale: 1,
  blur: 0,
  duration: 0.32,
  delay: 0,
};

export const GENERIC_LEAVE: MotionPhase = {
  opacity: 0,
  y: 12,
  scale: 0.985,
  blur: 2,
  duration: 0.2,
  delay: 0,
};

export const GLOW_ENTRY_DEFAULTS = {
  y: -8,
  scale: 0.7,
  skewX: 4,
  skewY: 8,
  brightness: 1.08,
  glowAlpha: 1,
  radiusFrom: 24,
  radiusTo: 12,
  duration: 1,
  delay: 0,
  contentDelay: 0.25,
  contentDuration: 0.35,
};

export const HOVER_DEFAULTS = {
  y: -4,
  scale: 1,
  tension: 400,
  friction: 40,
};

export const stripGlowBackground = (style?: React.CSSProperties) => {
  if (!style) {
    return style;
  }

  const { background, backgroundColor, ...rest } = style;
  return rest;
};

export const getGlowSkewValues = (index?: number) => {
  if (index === undefined) {
    return {
      skewX: GLOW_ENTRY_DEFAULTS.skewX,
      skewY: GLOW_ENTRY_DEFAULTS.skewY,
    };
  }

  const factor = 1 / Math.max(1, index);

  return {
    skewX: 8 * factor,
    skewY: 12 * factor,
  };
};

export const getEntryPresetConfig = (
  preset: CardMotionEntryPreset,
  delay: number,
  style: React.CSSProperties | undefined,
  index: number | undefined,
  entryAnimation: CardMotionAnimation | false | undefined,
): EntryPresetConfig => {
  if (preset === 'glow-in') {
    const glowEntry = {
      ...GLOW_ENTRY_DEFAULTS,
      ...getGlowSkewValues(index),
      ...(entryAnimation === false
        ? {
            ...GLOW_ENTRY_DEFAULTS,
            y: 0,
            scale: 1,
            skewX: 0,
            skewY: 0,
            brightness: 1,
            glowAlpha: 0,
            radiusFrom: 12,
            radiusTo: 12,
            duration: 0,
            delay: 0,
            contentDelay: 0,
            contentDuration: 0,
          }
        : entryAnimation),
    };

    return {
      kind: 'glow-shell',
      transitionFrom: {
        opacity: 1,
        y: 0,
        scale: 1,
        blur: 0,
      },
      transitionEnter: {
        opacity: 1,
        y: 0,
        scale: 1,
        blur: 0,
      },
      delayOffset: 0,
      duration: 0,
      shellStyle: {
        ...stripGlowBackground(style),
        '--card-motion-delay': `${delay + glowEntry.delay}s`,
        '--card-motion-duration': `${glowEntry.duration}s`,
        '--card-motion-content-delay': `${delay + glowEntry.contentDelay}s`,
        '--card-motion-content-duration': `${glowEntry.contentDuration}s`,
        '--card-motion-ease': SPRING_EASE_CSS,
        '--card-motion-y-from': `${glowEntry.y}px`,
        '--card-motion-scale-from': glowEntry.scale,
        '--card-motion-skew-x-from': `${glowEntry.skewX}deg`,
        '--card-motion-skew-y-from': `${glowEntry.skewY}deg`,
        '--card-motion-radius-from': `${glowEntry.radiusFrom}px`,
        '--card-motion-radius-to': `${glowEntry.radiusTo}px`,
        '--card-motion-brightness-from': glowEntry.brightness,
        '--card-motion-glow-alpha-from': glowEntry.glowAlpha,
      } as React.CSSProperties,
      contentStyle: {
        animationDelay: `${delay + glowEntry.contentDelay}s`,
        animationDuration: `${glowEntry.contentDuration}s`,
      },
    };
  }

  const genericEntry = {
    ...GENERIC_ENTRY,
    ...(entryAnimation === false
      ? { ...GENERIC_ENTRY, opacity: 1, y: 0, scale: 1, blur: 0, duration: 0, delay: 0 }
      : entryAnimation),
  };

  return {
    kind: 'spring',
    baseStyle: style,
    transitionFrom: {
      opacity: genericEntry.opacity,
      y: genericEntry.y,
      scale: genericEntry.scale,
      blur: genericEntry.blur,
    },
    transitionEnter: {
      opacity: 1,
      y: 0,
      scale: 1,
      blur: 0,
    },
    delayOffset: genericEntry.delay,
    duration: genericEntry.duration,
  };
};
