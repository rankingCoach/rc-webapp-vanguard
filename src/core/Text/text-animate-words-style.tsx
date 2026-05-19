import { sanitizeHTMLToReactNode } from '@helpers/sanitize-html.tsx';
import { animated, useSpring } from '@react-spring/web';
import React from 'react';

type FadeUpTextAnimationProps = {
  duration?: number;
  delay?: number;
  animation: 'fade-up';
  initialDelay?: number;
};
export type TextAnimationProps = FadeUpTextAnimationProps;

// Separate component for animating each word
const AnimatedWord = ({ word, delay, duration }: { word: string; delay: number; duration: number }) => {
  const props = useSpring({
    from: {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
    config: { duration },
    delay,
  });

  return <animated.span style={{ marginRight: 4, ...props }}>{sanitizeHTMLToReactNode(word).children}</animated.span>;
};

export const applyWordAnimation = (text: React.ReactNode, animation?: TextAnimationProps) => {
  if (typeof text !== 'string' || !animation) {
    return text;
  }

  const words = text.split(' ');
  const baseDuration = animation.duration ?? 300; // Duration in milliseconds
  const baseDelay = animation.delay ?? 75; // Initial delay in milliseconds
  const initialDelay = animation.initialDelay ?? 0; // Initial delay before the first word starts

  return (
    <>
      {words.map((word, index) => {
        // Include initialDelay in the delay calculation
        const delay = initialDelay + words.slice(0, index).reduce((acc, word) => acc + baseDuration, baseDelay * index);
        const hasSpace = index < words.length - 1;
        return <AnimatedWord key={index} word={word + (hasSpace ? ' ' : '')} delay={delay} duration={baseDuration} />;
      })}
    </>
  );
};
