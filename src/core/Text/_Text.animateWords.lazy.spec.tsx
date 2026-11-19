import { render, waitFor } from '@test-utils/test-utils';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const loaded = vi.hoisted(() => ({ count: 0 }));
vi.mock('./text-animate-words-style', async (importOriginal) => {
  loaded.count++;
  return importOriginal();
});

import { AnimatedWordsFirstFrame } from './text-animated-words-lazy';
import { Text } from './Text';

/**
 * Track f4: Text loads the react-spring word animation only when `animateWords` is set. The fallback while the chunk
 * loads is the animation's first frame; the final DOM is the same as before (captured from the eager code, 98d7bfb).
 */
const WRAP = '<span data-testid="t" data-slot="text" data-type="text" class="paragraph rc-text text text-wrap text-initial notranslate" style="font-weight: normal; display: block;">';
const word = (style: string, html: string) => `<span style="margin-right: 4px; ${style}">${html}</span>`;
const frame = (style: string) => `${word(style, 'Hello ')}${word(style, '<b>big</b> ')}${word(style, 'world')}`;
const FIRST = frame('opacity: 0; transform: translateY(20px);');
const FINAL = `${WRAP}${frame('opacity: 1; transform: translateY(0);')}</span>`;

describe('Text animateWords is lazy', () => {
  it('plain Text never loads the animation module and renders synchronously', () => {
    const before = loaded.count;
    const { container } = render(
      <Text translate={false} testId={'t'}>
        Hello world
      </Text>,
    );
    expect(container.innerHTML).toBe(`${WRAP}Hello world</span>`);
    expect(loaded.count).toBe(before);
  });

  it('the fallback is the animation first frame, word for word', () => {
    const html = renderToStaticMarkup(<AnimatedWordsFirstFrame text={'Hello <b>big</b> world'} />);
    expect(html).toBe(FIRST.replace(/: /g, ':').replace(/; /g, ';').replace(/;"/g, '"'));
  });

  it('animated Text ends in the same DOM as before', async () => {
    const { container } = render(
      <Text translate={false} testId={'t'} animateWords={{ animation: 'fade-up', duration: 5, delay: 0 }}>
        Hello <b>big</b> world
      </Text>,
    );
    await waitFor(() => expect(container.innerHTML).toBe(FINAL), { timeout: 3000 });
  });
});
