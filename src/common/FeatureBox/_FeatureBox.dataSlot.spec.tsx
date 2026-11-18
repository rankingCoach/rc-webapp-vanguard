import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { FeatureBox } from './FeatureBox';
import { IconNames } from '@vanguard/Icon/IconNames';
import animation from '../../core/LottieAnimationLoader/LottieBase/mock/mock-anim.json';

vi.mock('@vanguard/LottieAnimationLoader/LottieAnimationLoader', () => ({ LottieAnimationLoader: () => null }));

describe('FeatureBox data-slot contract', () => {
  it('slots the consumer root and owned parts with the story props', () => {
    const featuresList = [
      { content: 'Brand insights feed. Know everything happening online that affects your business', iconName: IconNames.arrowLeft, iconColor: 'var(--s100)', iconBackgroundColor: 'var(--s500)' },
      { content: 'Competitor tracking. Monitor your competitors’ online activity', iconName: IconNames.arrowLeft, iconColor: 'var(--s100)', iconBackgroundColor: 'var(--s500)' },
      { content: 'Email alerts. Be notified immediately with mentions & reviews', iconName: IconNames.arrowLeft, iconColor: 'var(--s100)', iconBackgroundColor: 'var(--s500)' },
    ];
    const { container } = render(
      <FeatureBox
        title={'Brand Monitoring. Protect your business'}
        subtitle={'rankingCoach scans the internet and alerts you when it finds references to your business and brand.'}
        featuresList={featuresList}
        animation={animation as unknown as string}
        onClick={() => {}}
        className={'mine'}
      />,
    );
    const root = container.querySelector('[data-slot="feature-box"]');
    expect(root?.tagName).toBe('DIV');
    expect(root?.classList.contains('mine')).toBe(true);
    for (const part of ['content', 'title', 'features', 'media', 'animation']) {
      expect(root?.querySelector(`[data-slot="feature-box-${part}"]`)?.tagName).toBe('DIV');
    }
    expect(root?.textContent).toContain('Brand Monitoring. Protect your business');
    for (const feature of featuresList) expect(root?.textContent).toContain(feature.content);
  });
});
