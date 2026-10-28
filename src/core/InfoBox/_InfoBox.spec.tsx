import { appScreen, fireEvent, render } from '@test-utils/test-utils';
import { ButtonTypes } from '@vanguard/Button/Button';
import buttonStyles from '@vanguard/Button/Button.module.scss';
import { InfoBox, InfoBoxType } from '@vanguard/InfoBox/InfoBox';
import styles from '@vanguard/InfoBox/InfoBox.module.scss';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

const description = 'A short description.';
const ICON_TEST_ID = 'info-box-icon';
const CONTENT_TEST_ID = 'info-box-content';

const getActionButton = (name: string) => appScreen.getByRole('button', { name }) as HTMLButtonElement;
const hasClasses = (el: HTMLElement, ...classNames: string[]) => classNames.every((c) => el.classList.contains(c));

const getCloseSlot = async () => (await appScreen.findByTestId('info-box-cta_button')).closest(`.${styles.firstLine}`);

describe('InfoBox content', () => {
  it('renders the title and the description', async () => {
    await render(<InfoBox title={'Title'} description={description} />);

    expect((await appScreen.findByTestId('info-box-title')).textContent).toBe('Title');
    expect((await appScreen.findByTestId('info-box-description')).textContent).toBe(description);
  });

  it('applies width and maxWidth to the box', async () => {
    await render(<InfoBox description={description} width={'400px'} maxWidth={'300px'} />);

    const box = await appScreen.findByTestId(CONTENT_TEST_ID);
    expect(box.style.width).toBe('400px');
    expect(box.style.maxWidth).toBe('300px');
  });
});

describe('InfoBox icon', () => {
  it.each([
    ['info', 'var(--p100)'],
    ['success', 'var(--s100)'],
    ['danger', 'var(--e100)'],
  ] as const)('fills the %s circle with its colour', async (type, fill) => {
    await render(<InfoBox type={type} description={description} />);

    const iconEl = await appScreen.findByTestId(ICON_TEST_ID);
    expect(iconEl.style.backgroundColor).toBe(fill);
  });

  it('falls back to the info icon for an unknown type', async () => {
    // untyped callers can pass names other InfoBox-like components use, e.g. 'warning'
    await render(<InfoBox type={'warning' as unknown as InfoBoxType} description={description} />);

    const iconEl = await appScreen.findByTestId(ICON_TEST_ID);
    expect(iconEl.style.backgroundColor).toBe('var(--p100)');
  });

  it('draws warn in a filled triangle instead of the circle', async () => {
    await render(<InfoBox type={'warn'} description={description} />);

    const iconEl = await appScreen.findByTestId(ICON_TEST_ID);
    expect(iconEl.classList.contains(styles.warnTriangle)).toBe(true);
    expect(iconEl.style.borderRadius).toBe('');
  });

  it('draws the other types in a filled circle', async () => {
    await render(<InfoBox type={'danger'} description={description} />);

    const iconEl = await appScreen.findByTestId(ICON_TEST_ID);
    expect(iconEl.classList.contains(styles.warnTriangle)).toBe(false);
    expect(iconEl.style.borderRadius).toBe('50%');
  });
});

describe('InfoBox close button', () => {
  it('is a muted button that dismisses', async () => {
    const dismissCallback = vi.fn();
    await render(<InfoBox description={description} dismissible dismissCallback={dismissCallback} />);

    const button = await appScreen.findByTestId('info-box-cta_button');
    expect(button.classList.contains(buttonStyles.buttonMuted)).toBe(true);
    fireEvent.click(button);
    expect(dismissCallback).toHaveBeenCalledTimes(1);
  });

  it('sits in a slot one title line tall when there is a title', async () => {
    await render(<InfoBox title={'Title'} description={description} dismissible />);

    const slot = await getCloseSlot();
    expect(slot).not.toBeNull();
    expect(slot?.classList.contains(styles.noTitle)).toBe(false);
  });

  it('sits in a slot one description line tall when there is no title', async () => {
    await render(<InfoBox description={description} dismissible />);

    const slot = await getCloseSlot();
    expect(slot).not.toBeNull();
    expect(slot?.classList.contains(styles.noTitle)).toBe(true);
  });
});

describe('InfoBox action buttons', () => {
  it('renders a primary positive and a muted negative, both medium, by default', async () => {
    await render(
      <InfoBox
        description={description}
        positive={{ cta: vi.fn(), text: 'Accept' }}
        negative={{ cta: vi.fn(), text: 'Decline' }}
      />,
    );

    expect(hasClasses(getActionButton('Accept'), buttonStyles.buttonPrimary, buttonStyles.sizeMedium)).toBe(true);
    expect(hasClasses(getActionButton('Decline'), buttonStyles.buttonMuted, buttonStyles.sizeMedium)).toBe(true);
  });

  it('keeps both buttons medium whatever their type', async () => {
    await render(
      <InfoBox
        description={description}
        positive={{ cta: vi.fn(), text: 'Accept', type: ButtonTypes.muted }}
        negative={{ cta: vi.fn(), text: 'Decline', type: ButtonTypes.primary }}
      />,
    );

    expect(hasClasses(getActionButton('Accept'), buttonStyles.buttonMuted, buttonStyles.sizeMedium)).toBe(true);
    expect(hasClasses(getActionButton('Decline'), buttonStyles.buttonPrimary, buttonStyles.sizeMedium)).toBe(true);
  });

  it('calls each action when clicked', async () => {
    const accept = vi.fn();
    const decline = vi.fn();
    await render(
      <InfoBox
        description={description}
        positive={{ cta: accept, text: 'Accept' }}
        negative={{ cta: decline, text: 'Decline' }}
      />,
    );

    fireEvent.click(getActionButton('Accept'));
    fireEvent.click(getActionButton('Decline'));
    expect(accept).toHaveBeenCalledTimes(1);
    expect(decline).toHaveBeenCalledTimes(1);
  });
});

describe('InfoBox border radius', () => {
  it('leaves the radius to the styles by default', async () => {
    await render(<InfoBox description={description} />);

    const box = await appScreen.findByTestId(CONTENT_TEST_ID);
    expect(box.classList.contains(styles.InfoBoxComponent)).toBe(true);
    expect(box.style.borderRadius).toBe('');
  });

  it('uses the borderRadius prop when given', async () => {
    await render(<InfoBox description={description} borderRadius={12} />);

    const box = await appScreen.findByTestId(CONTENT_TEST_ID);
    expect(box.style.borderRadius).toBe('12px');
  });
});
