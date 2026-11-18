import { render } from '@test-utils/test-utils';
import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { StatisticsBoard } from './StatisticsBoard';

describe('StatisticsBoard data-slot contract', () => {
  it('slots owned elements and renders with story props', () => {
    const { container } = render(<StatisticsBoard className={'mine'} items={[
      { total: 48, title: 'Posts', description: 'Keep your customers up to date with news', disabled: true, iconName: IconNames.browser, linkText: 'See posts', ctaText: 'Add a post' },
      { total: 24, title: 'Events', description: 'Create events for your customers', disabled: false, iconName: IconNames.calendar, linkText: 'See events', ctaText: 'Create an event' },
      { total: 24, title: 'Chat', description: 'Chat with your friends', disabled: false, iconName: IconNames.mail, iconFillColor: '--e500', linkText: 'See chats', ctaText: 'Start a conversation' },
      { iconName: IconNames.bank, empty: true, title: 'Products', description: 'Promote your latest products', ctaText: 'Add a product' },
    ]} />);
    expect(container.querySelector('[data-slot="statistics-board"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="statistics-board"]')?.classList.contains('mine')).toBe(true);
  });
});
