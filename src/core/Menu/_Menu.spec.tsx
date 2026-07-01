import { Menu } from '@vanguard/Menu/Menu';
import React from 'react';
import { describe, expect, test } from 'vitest';

import { render } from '../../../test-utils/test-utils';

describe('Menu overlay-stacking z-index', () => {
  test('keeps the OverlayStackingService z-index when caller passes its own slotProps.root', () => {
    const anchorEl = document.createElement('button');
    document.body.appendChild(anchorEl);

    render(
      <Menu
        anchorEl={anchorEl}
        open={true}
        onClose={() => undefined}
        items={[{ key: 'a', children: 'A' }]}
        slotProps={{ root: { style: { color: 'red' } } }}
      />,
    );

    const modalRoot = document.querySelector('.MuiModal-root') as HTMLElement;
    expect(modalRoot).not.toBeNull();
    // Caller-supplied style must be preserved...
    expect(modalRoot.style.color).toBe('red');
    // ...without losing the stacking fix this component is responsible for.
    expect(modalRoot.style.zIndex).not.toBe('');
  });
});
