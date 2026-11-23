import { act, render } from '@test-utils/test-utils';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Text } from './Text';

/**
 * Word animation must start on the first commit, as on .472: the spans rendered first are the spans that fade in,
 * and the fade settles inside the animation's own window. A Suspense fallback (first-commit spans replaced by new
 * spans and a later fade start; over a real network the chunk fetch adds more) is a visible regression (FINDING 3).
 */
const words = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>(':scope > span'));
const frame = (spans: HTMLElement[]) => spans.map((span) => [span.style.opacity, span.style.transform]);

afterEach(() => {
  vi.useRealTimers();
});

describe('Text animateWords first frame', () => {
  it('animates the first-commit spans in place and settles within the animation window (rc-webapp fade-up 20/10)', async () => {
    vi.useFakeTimers({
      toFake: [
        'setTimeout',
        'clearTimeout',
        'setInterval',
        'clearInterval',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'performance',
        'Date',
      ],
    });
    const view = render(
      <Text translate={false} testId={'t'} animateWords={{ animation: 'fade-up', duration: 20, delay: 10 }}>
        Hello big world
      </Text>,
    );
    const root = view.getByTestId('t');
    const first = words(root);
    const firstFrame = frame(first);

    // Word delays 0/30/60 ms + 20 ms duration: the last word settles at 80 ms. A fallback plateau needs >= 300 ms.
    let settledAt = -1;
    for (let elapsed = 10; elapsed <= 600 && settledAt < 0; elapsed += 10) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10);
      });
      const current = words(root);
      if (
        current.length === 3 &&
        current.every((span) => span.style.opacity === '1' && span.style.transform === 'translateY(0)')
      ) {
        settledAt = elapsed;
      }
    }
    const final = words(root);

    expect({
      firstCommitWords: first.length,
      firstFrame,
      sameNodesSettle:
        final.length === 3 &&
        final.every((span, index) => span === first[index]) &&
        first.every((span) => span.isConnected),
      settledInsideWindow: settledAt > 0 && settledAt <= 150,
    }).toEqual({
      firstCommitWords: 3,
      firstFrame: [
        ['0', 'translateY(20px)'],
        ['0', 'translateY(20px)'],
        ['0', 'translateY(20px)'],
      ],
      sameNodesSettle: true,
      settledInsideWindow: true,
    });
  });
});
