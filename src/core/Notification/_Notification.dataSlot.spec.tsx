import { fireEvent, render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Notification } from './Notification';
import { NotificationReview } from './NotificationReview/NotificationReview';
import { NotificationSocialPost } from './NotificationSocialPost/NotificationSocialPost';

vi.mock('react-twitter-widgets', () => ({ Tweet: () => null }));
vi.mock('@custom-hooks/use-dynamic-import/use-dynamic-import', () => ({
  useDynamicImport: () => ({ SvgIcon: 'svg', loading: false, error: null }),
}));
vi.mock('@vanguard/StyledSVG/StyledSVG', () => ({ StyledSVG: () => null }));

const slot = (container: HTMLElement, name: string) => container.querySelector(`[data-slot="${name}"]`) as HTMLElement;

describe('Notification data-slot contract', () => {
  it('slots the notification, header, placeholder and actions', () => {
    const { container } = render(<Notification isCompetitor={false} title={'Title'} date={'2026-01-01'} actions={[{ label: 'Action', cb: () => {} }]} />);
    for (const name of ['notification', 'notification-header', 'notification-header-title',
      'notification-header-meta', 'notification-content', 'notification-actions', 'content-placeholder', 'notification-action']) {
      expect(slot(container, name).tagName).toBe('DIV');
    }
  });

  it('slots review and quote parts', () => {
    const { container } = render(<NotificationReview />);
    for (const name of ['notification-review', 'notification-review-text', 'notification-review-stars',
      'notification-review-author', 'notification-quote', 'notification-quote-content', 'notification-quote-marks']) {
      expect(slot(container, name).tagName).toBe('DIV');
    }
  });

  it('slots both existing social post roots', () => {
    const { container } = render(<NotificationSocialPost postSource={'twitter'} twitterPostId={'123'} />);
    expect(slot(container, 'notification-social-post').tagName).toBe('IMG');
    fireEvent.click(slot(container, 'notification-social-post'));
    expect(slot(container, 'notification-social-post').tagName).toBe('DIV');
  });
});
