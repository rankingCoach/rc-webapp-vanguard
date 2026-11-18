import React from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OwnPopper } from './Popper';

/** Review finding (Codex, handoff 10): server-rendering an open popper must not touch `document`. */
describe('OwnPopper on the server', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('renders nothing instead of throwing when there is no document', () => {
    vi.stubGlobal('document', undefined);
    expect(
      renderToString(
        <OwnPopper open anchorEl={null}>
          {'content'}
        </OwnPopper>,
      ),
    ).toBe('');
  });
});
