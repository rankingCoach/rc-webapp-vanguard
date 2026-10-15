import { act, appScreen, fireEvent, render } from '@test-utils/test-utils';
import { Button, ButtonTypes } from '@vanguard/Button/Button';
import styles from '@vanguard/Button/Button.module.scss';
import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';
import { describe, expect, it } from 'vitest';

const getButton = () => appScreen.getByTestId('muted-btn_button') as HTMLButtonElement;
const ARIA_PRESSED = 'aria-pressed';
const hasClass = (el: HTMLElement, className: string) => el.classList.contains(className);

describe('Vanguard muted button surface flags & pressed state', () => {
  it('adds the onDark class', async () => {
    await render(
      <Button testId={'muted-btn'} type={ButtonTypes.muted} onDark>
        Label
      </Button>,
    );
    const btn = getButton();
    expect(hasClass(btn, styles.buttonMuted)).toBe(true);
    expect(hasClass(btn, styles.onDark)).toBe(true);
    expect(hasClass(btn, styles.inverted)).toBe(false);
  });

  it('combines inverted and onDark', async () => {
    await render(
      <Button testId={'muted-btn'} type={ButtonTypes.muted} inverted onDark>
        Label
      </Button>,
    );
    const btn = getButton();
    expect(hasClass(btn, styles.inverted)).toBe(true);
    expect(hasClass(btn, styles.onDark)).toBe(true);
  });

  it('renders aria-pressed="true" when pressed', async () => {
    await render(
      <Button testId={'muted-btn'} type={ButtonTypes.muted} pressed>
        Label
      </Button>,
    );
    expect(getButton().getAttribute(ARIA_PRESSED)).toBe('true');
  });

  it('renders aria-pressed="false" for an unpressed toggle', async () => {
    await render(
      <Button testId={'muted-btn'} type={ButtonTypes.muted} pressed={false}>
        Label
      </Button>,
    );
    expect(getButton().getAttribute(ARIA_PRESSED)).toBe('false');
  });

  it('has no aria-pressed or onDark class by default', async () => {
    await render(
      <Button testId={'muted-btn'} type={ButtonTypes.muted}>
        Label
      </Button>,
    );
    const btn = getButton();
    expect(btn.hasAttribute(ARIA_PRESSED)).toBe(false);
    expect(hasClass(btn, styles.onDark)).toBe(false);
  });

  it('never gives a non-muted button the onDark class or aria-pressed', async () => {
    // Forbidden by the types; cast to check the runtime guard too
    const props = { onDark: true, pressed: true } as unknown as Record<string, never>;
    await render(
      <Button testId={'muted-btn'} type={ButtonTypes.primary} {...props}>
        Label
      </Button>,
    );
    const btn = getButton();
    expect(hasClass(btn, styles.onDark)).toBe(false);
    expect(btn.hasAttribute(ARIA_PRESSED)).toBe(false);
  });

  it('leaves no inline opacity on the disabled button', async () => {
    await render(
      <Button testId={'muted-btn'} type={ButtonTypes.muted} inverted rounded disabled icon={IconNames.close} />,
    );
    const btn = getButton();
    expect(btn.disabled).toBe(true);
    expect(btn.style.opacity).toBe('');
  });

  it('renders the icon', async () => {
    await render(
      <Button testId={'muted-btn'} type={ButtonTypes.muted} icon={IconNames.close}>
        Label
      </Button>,
    );
    expect(await appScreen.findByTestId('muted-btn_icon')).toBeTruthy();
  });

  // The icon colour Button hands to Icon ends up on the svg's `color` attribute
  const findIconSvg = () => appScreen.findByTestId('muted-btn_icon-svg');

  it('keeps explicit iconColor / iconHoverColor', async () => {
    await render(
      <Button
        testId={'muted-btn'}
        type={ButtonTypes.muted}
        icon={IconNames.close}
        iconColor={'--icon-rest'}
        iconHoverColor={'--icon-hover'}
      >
        Label
      </Button>,
    );
    expect((await findIconSvg()).getAttribute('color')).toBe('var(--icon-rest)');
    act(() => {
      fireEvent.mouseOver(getButton());
    });
    expect((await findIconSvg()).getAttribute('color')).toBe('var(--icon-hover)');
  });

  it('defaults the icon colour to currentColor on rest and hover', async () => {
    await render(<Button testId={'muted-btn'} type={ButtonTypes.muted} icon={IconNames.close} />);
    expect((await findIconSvg()).getAttribute('color')).toBe('currentColor');
    act(() => {
      fireEvent.mouseOver(getButton());
    });
    expect((await findIconSvg()).getAttribute('color')).toBe('currentColor');
  });
});
