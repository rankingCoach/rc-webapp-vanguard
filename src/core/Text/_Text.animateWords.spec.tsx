import { render, waitFor } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Text } from './Text';

/**
 * The animated Text's final DOM, captured from the eager code (98d7bfb). Moved unchanged from
 * _Text.animateWords.lazy.spec.tsx when the lazy split was withdrawn (FINDING 3); the first frame is pinned in
 * _Text.animateWords.first-frame.spec.tsx.
 */
const WRAP = '<span data-testid="t" data-slot="text" data-type="text" class="paragraph rc-text text text-wrap text-initial notranslate" style="font-weight: normal; display: block;">';
const word = (style: string, html: string) => `<span style="margin-right: 4px; ${style}">${html}</span>`;
const frame = (style: string) => `${word(style, 'Hello ')}${word(style, '<b>big</b> ')}${word(style, 'world')}`;
const FINAL = `${WRAP}${frame('opacity: 1; transform: translateY(0);')}</span>`;

describe('Text animateWords final DOM', () => {
  it('animated Text ends in the same DOM as before', async () => {
    const { container } = render(
      <Text translate={false} testId={'t'} animateWords={{ animation: 'fade-up', duration: 5, delay: 0 }}>
        Hello <b>big</b> world
      </Text>,
    );
    await waitFor(() => expect(container.innerHTML).toBe(FINAL), { timeout: 3000 });
  });
});
