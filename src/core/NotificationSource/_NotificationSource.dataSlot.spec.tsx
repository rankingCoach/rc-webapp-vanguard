import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { NotificationSource } from './NotificationSource';

const slot = (container: HTMLElement, name: string) => container.querySelector(`[data-slot="${name}"]`) as HTMLElement;

describe('NotificationSource data-slot contract', () => {
  it('slots the existing elements', () => {
    const { container } = render(<NotificationSource source={'own'} />);
    expect(slot(container, 'notification-source').tagName).toBe('DIV');
  });
});
