import { sanitizeHTMLToReactNode } from '@helpers/sanitize-html.tsx';
import React, { lazy, Suspense } from 'react';

import type { TextAnimationProps } from './text-animate-words-style';

// react-spring is loaded only when a Text actually animates its words.
const AnimatedWords = lazy(() => import('./text-animate-words-style'));

/**
 * The first frame of the fade-up animation: every word at opacity 0, 20px down, exactly as react-spring renders it
 * before the animation starts. Shown while the animation chunk loads, so nothing shifts or flashes.
 */
export const AnimatedWordsFirstFrame = ({ text }: { text: string }) => {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: same keys as applyWordAnimation
        <span key={index} style={{ marginRight: 4, opacity: 0, transform: 'translateY(20px)' }}>
          {sanitizeHTMLToReactNode(word + (index < words.length - 1 ? ' ' : '')).children}
        </span>
      ))}
    </>
  );
};

export const LazyAnimatedWords = ({ text, animation }: { text: string; animation: TextAnimationProps }) => (
  <Suspense fallback={<AnimatedWordsFirstFrame text={text} />}>
    <AnimatedWords text={text} animation={animation} />
  </Suspense>
);
