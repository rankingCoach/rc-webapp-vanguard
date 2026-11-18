import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Avatar } from './Avatar';

describe('Avatar data-slot contract', () => {
  it('name and image avatars carry the slot, size and notification part', async () => {
    const { findByTestId, rerender } = render(<Avatar name={'Jane Doe'} size={'large'} hasNotifications />);
    const named = await findByTestId('avatar-name-test-id');
    expect(named.getAttribute('data-slot')).toBe('avatar');
    expect(named.getAttribute('data-size')).toBe('large');
    expect(named.querySelector('[data-slot="avatar-notification"]')).not.toBeNull();
    rerender(<Avatar image={'https://example.invalid/a.png'} size={'small'} />);
    const img = await findByTestId('avatar-image-test-id');
    expect(img.getAttribute('data-slot')).toBe('avatar');
    expect(img.getAttribute('data-size')).toBe('small');
  });

  it('icon avatar carries the slot', async () => {
    const { findByTestId } = render(<Avatar icon={'gmb'} />);
    const icon = await findByTestId('avatar-icon-test-id');
    expect(icon.getAttribute('data-slot')).toBe('avatar');
    expect(icon.getAttribute('data-size')).toBe('medium');
  });
});
