import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { AvatarStack } from './AvatarStack';

const slot = (container: HTMLElement, name: string) => container.querySelector(`[data-slot="${name}"]`) as HTMLElement;

describe('AvatarStack data-slot contract', () => {
  it('slots the existing elements', () => {
    const { container } = render(<AvatarStack className={'mine'} items={[{ image: 'avatar.png' }]} />);
    expect(slot(container, 'avatar-stack').tagName).toBe('DIV');
    expect(slot(container, 'avatar-stack-item').tagName).toBe('DIV');
    expect(slot(container, 'avatar-stack-avatar').tagName).toBe('DIV');
    expect(slot(container, 'avatar-stack-image').tagName).toBe('IMG');
    expect(slot(container, 'avatar-stack').classList.contains('mine')).toBe(true);
  });
});
