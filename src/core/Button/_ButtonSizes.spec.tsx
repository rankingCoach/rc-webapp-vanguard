import { appScreen, render } from '@test-utils/test-utils';
import { Button, ButtonProps, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import styles from '@vanguard/Button/Button.module.scss';
import React from 'react';
import { describe, expect, it } from 'vitest';

const SIZE_CLASSES: Record<ButtonSizes, string> = {
  [ButtonSizes.small]: styles.sizeSmall,
  [ButtonSizes.medium]: styles.sizeMedium,
  [ButtonSizes.large]: styles.sizeLarge,
  [ButtonSizes.extraLarge]: styles.sizeExtraLarge,
};

const getButton = () => appScreen.getByTestId('sized-btn_button') as HTMLButtonElement;

describe('Vanguard button sizes', () => {
  describe.each(Object.values(ButtonTypes))('%s', (type) => {
    it.each(Object.values(ButtonSizes))('applies the %s size class', async (size) => {
      await render(
        <Button testId={'sized-btn'} {...({ type, size } as ButtonProps)}>
          Label
        </Button>,
      );
      const btn = getButton();
      expect(btn.classList.contains(SIZE_CLASSES[size])).toBe(true);
      Object.values(ButtonSizes)
        .filter((other) => other !== size)
        .forEach((other) => expect(btn.classList.contains(SIZE_CLASSES[other])).toBe(false));
    });

    it('defaults to medium', async () => {
      await render(
        <Button testId={'sized-btn'} {...({ type } as ButtonProps)}>
          Label
        </Button>,
      );
      expect(getButton().classList.contains(styles.sizeMedium)).toBe(true);
    });
  });

  it('accepts extraLarge on the non-muted types', async () => {
    await render(
      <Button testId={'sized-btn'} type={ButtonTypes.primary} size={ButtonSizes.extraLarge}>
        Label
      </Button>,
    );
    expect(getButton().classList.contains(styles.sizeExtraLarge)).toBe(true);
  });
});
