import { appScreen, render } from '@test-utils/test-utils';
import { getColorsBasedOnStatus } from '@vanguard/StatusBadge/status-badge-get-colors-based-on-status';
import { StatusBadge } from '@vanguard/StatusBadge/StatusBadge';
import styles from '@vanguard/StatusBadge/StatusBadge.module.scss';
import { FontWeights } from '@vanguard/Text/Text';
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

describe('Vanguard StatusBadge compact size', () => {
  it('is not compact by default', async () => {
    await render(<StatusBadge status={'ado'} text={'New'} hideIcon translate={false} />);
    const text = appScreen.getByText('New');
    expect(getBadge('New').classList.contains(styles.compact)).toBe(false);
    expect(text.style.fontSize).toBe('');
  });

  it('adds the compact class and renders 11px bold text', async () => {
    await render(<StatusBadge status={'ado'} text={'New'} size={'compact'} hideIcon translate={false} />);
    const text = appScreen.getByText('New');
    expect(getBadge('New').classList.contains(styles.compact)).toBe(true);
    expect(text.style.fontSize).toBe('11px');
    expect(text.style.fontWeight).toBe('bold');
  });

  it('keeps the compact label on one line, ending in an ellipsis', async () => {
    await render(<StatusBadge status={'ado'} text={'New'} size={'compact'} hideIcon translate={false} />);
    const text = appScreen.getByText('New');
    expect(text.classList.contains(styles.compactLabel)).toBe(true);
    expect(text.style.whiteSpace).toBe('nowrap');
    expect(text.style.overflow).toBe('hidden');
    expect(text.style.textOverflow).toBe('ellipsis');
  });

  it('lets the default label wrap', async () => {
    await render(<StatusBadge status={'ado'} text={'New'} hideIcon translate={false} />);
    const text = appScreen.getByText('New');
    expect(text.classList.contains(styles.compactLabel)).toBe(false);
    expect(text.style.textOverflow).toBe('');
  });

  it('keeps an explicit fontWeight', async () => {
    await render(
      <StatusBadge
        status={'ado'}
        text={'New'}
        size={'compact'}
        fontWeight={FontWeights.medium}
        hideIcon
        translate={false}
      />,
    );
    expect(appScreen.getByText('New').style.fontWeight).toBe('500');
  });

  it('is ignored by the big variant', async () => {
    await render(<StatusBadge status={'ado'} text={'New'} size={'compact'} variant={'big'} translate={false} />);
    expect(appScreen.getByText('New').style.fontSize).toBe('');
  });
});
