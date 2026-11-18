import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { ActionCard } from './ActionCard';
import { ActionCardHeader } from './ActionCardHeader/ActionCardHeader';
import { ActionCardBody } from './ActionCardBody/ActionCardBody';
import { ActionCardInfo } from './ActionCardInfo/ActionCardInfo';
import { ActionCardAction } from './ActionCardActions/ActionCardAction/ActionCardAction';

describe('ActionCard data-slot contract', () => {
  it('slots the card, content, header and actions without wrapping fragments or Text', () => {
    const { container } = render(
      <ActionCard actions={[{ label: 'Go', cta: () => {} }]}>
        <ActionCardHeader>Header</ActionCardHeader>
        <ActionCardBody>Body</ActionCardBody>
        <ActionCardInfo text={'Info'} />
      </ActionCard>,
    );
    for (const slot of ['action-card', 'action-card-content', 'action-card-header', 'action-card-header-menu', 'action-card-actions', 'action-card-action']) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.tagName).toBe('DIV');
    }
    expect(container.querySelector('[data-slot="action-card-body"]')).toBeNull();
    expect(container.querySelector('[data-slot="action-card-info"]')).toBeNull();
  });

  it('tracks action disabled and loading states', () => {
    const { container, rerender } = render(<ActionCardAction label={'Go'} cta={() => {}} />);
    const root = () => container.querySelector('[data-slot="action-card-action"]')!;
    expect(root().hasAttribute('data-disabled')).toBe(false);
    expect(root().hasAttribute('data-loading')).toBe(false);
    rerender(<ActionCardAction label={'Go'} cta={() => {}} disabled loading />);
    expect(root().getAttribute('data-disabled')).toBe('');
    expect(root().getAttribute('data-loading')).toBe('');
    expect(container.querySelector('[data-slot="action-card-action-loader"]')?.tagName).toBe('DIV');
  });
});
