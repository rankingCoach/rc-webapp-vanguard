import { appScreen, render } from '@test-utils/test-utils';
import { getColorsBasedOnStatus } from '@vanguard/StatusBadge/status-badge-get-colors-based-on-status';
import { StatusBadge } from '@vanguard/StatusBadge/StatusBadge';
import React from 'react';
import { describe, expect, it } from 'vitest';

const getBadge = (text: string) => appScreen.getByText(text).parentElement as HTMLElement;

describe('Vanguard StatusBadge ado status', () => {
  it('maps to the scoped Ado colours', () => {
    const colors = getColorsBasedOnStatus('ado');
    expect(colors.bgColor).toBe('--status-badge-ado-background-color');
    expect(colors.textColor).toBe('--status-badge-ado-text-color');
    expect(colors.iconColor).toBe('--ado-base');
  });

  it('paints the 12% Ado fill and the Ado text colour', async () => {
    await render(<StatusBadge status={'ado'} text={'New'} hideIcon translate={false} />);
    const text = appScreen.getByText('New');
    expect(getBadge('New').style.backgroundColor).toBe('var(--status-badge-ado-background-color)');
    expect(text.style.color).toBe('var(--status-badge-ado-text-color)');
  });
});
