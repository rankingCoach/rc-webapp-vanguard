import { render } from '@test-utils/test-utils';
import { Text } from '@vanguard/Text/Text';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { HoverableCard } from './HoverableCard';

describe('HoverableCard data-slot contract', () => {
  it('slots owned elements and renders with story props', () => {
    const { container } = render(<HoverableCard title={'Descriptions'} subtitles={['3 added', '2 remaining']} onClick={() => {}} className={'mine'}><Text>This is a text children</Text></HoverableCard>);
    expect(container.querySelector('[data-slot="hoverable-card"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="hoverable-card-header"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="hoverable-card-subtitles"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="hoverable-card-subtitles-separator"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="hoverable-card-content"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="hoverable-card"]')?.classList.contains('mine')).toBe(true);
  });

  it('data-disabled tracks the disabled class', () => {
    const props = { onClick: () => {}, children: 'Content' };
    const { container, rerender } = render(<HoverableCard {...props} disabled={false} />);
    const root = () => container.querySelector('[data-slot="hoverable-card"]');
    expect(root()?.hasAttribute('data-disabled')).toBe(false);
    rerender(<HoverableCard {...props} disabled />);
    expect(root()?.getAttribute('data-disabled')).toBe('');
    rerender(<HoverableCard {...props} disabled={false} />);
    expect(root()?.hasAttribute('data-disabled')).toBe(false);
  });

  it('renders the single subtitle used in the story', () => {
    const { container } = render(
      <HoverableCard title={'Descriptions'} subtitles={['3 added']} onClick={() => {}}>
        <Text>This is a text children</Text>
      </HoverableCard>,
    );
    expect(container.querySelector('[data-slot="hoverable-card-subtitles"]')?.textContent).toContain('3 added');
  });
});
