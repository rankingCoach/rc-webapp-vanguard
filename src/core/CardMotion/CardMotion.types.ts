import React from 'react';

export type MotionPhase = {
  opacity: number;
  y: number;
  scale: number;
  blur: number;
  duration: number;
  delay: number;
};

export type EntryPresetConfig = {
  kind: 'spring' | 'glow-shell';
  baseStyle?: React.CSSProperties;
  transitionFrom: {
    opacity: number;
    y: number;
    scale: number;
    blur: number;
  };
  transitionEnter: {
    opacity: number;
    y: number;
    scale: number;
    blur: number;
  };
  delayOffset: number;
  duration: number;
  shellStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
};

export type CardMotionEntryPreset = 'fade-up' | 'glow-in';

export type CardMotionAnimation = Partial<
  MotionPhase & {
    skewX: number;
    skewY: number;
    brightness: number;
    glowAlpha: number;
    radiusFrom: number;
    radiusTo: number;
    contentDelay: number;
    contentDuration: number;
  }
>;

export interface CardMotionHoverAnimation {
  y?: number;
  scale?: number;
  tension?: number;
  friction?: number;
}

export interface CardMotionProps {
  delay: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
  hoverable?: boolean;
  glowIn?: boolean;
  index?: number;
  isVisible?: boolean;
  entryPreset?: CardMotionEntryPreset;
  entryAnimation?: CardMotionAnimation | false;
  leaveAnimation?: CardMotionAnimation | false;
  hoverAnimation?: CardMotionHoverAnimation | false;
}
