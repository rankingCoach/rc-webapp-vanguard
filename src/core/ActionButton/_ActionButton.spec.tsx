import { appScreen, render } from '@test-utils/test-utils';
import { ActionButton } from '@vanguard/ActionButton/ActionButton';
import { ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import styles from '@vanguard/Button/Button.module.scss';
import React from 'react';
import { describe, expect, it } from 'vitest';

const TEST_ID = 'action-btn';
const getButton = () => appScreen.getByTestId(`${TEST_ID}_Button_button`) as HTMLButtonElement;

describe('Vanguard action button size', () => {
  it('defaults to extraLarge', async () => {
    await render(<ActionButton testId={TEST_ID}>Add</ActionButton>);
    expect(getButton().classList.contains(styles.sizeExtraLarge)).toBe(true);
  });

  it('defaults to medium when muted', async () => {
    await render(
      <ActionButton testId={TEST_ID} type={ButtonTypes.muted}>
        Add
      </ActionButton>,
    );
    expect(getButton().classList.contains(styles.sizeMedium)).toBe(true);
    expect(getButton().classList.contains(styles.sizeExtraLarge)).toBe(false);
  });

  it('keeps an explicit size', async () => {
    await render(
      <ActionButton testId={TEST_ID} type={ButtonTypes.muted} size={ButtonSizes.large}>
        Add
      </ActionButton>,
    );
    expect(getButton().classList.contains(styles.sizeLarge)).toBe(true);
  });
});
