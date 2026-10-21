import { act, appScreen, fireEvent, render } from '@test-utils/test-utils';
import { Button, ButtonProps, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import styles from '@vanguard/Button/Button.module.scss';
import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';
import { describe, expect, it } from 'vitest';

const getButton = () => appScreen.getByTestId('inverted-btn_button') as HTMLButtonElement;
// The icon colour Button hands to Icon ends up on the svg's `color` attribute
const findIconSvg = () => appScreen.findByTestId('inverted-btn_icon-svg');
const hasClass = (el: HTMLElement, className: string) => el.classList.contains(className);

describe('Vanguard inverted primary & shimmer buttons', () => {
  it.each([
    ['primary', ButtonTypes.primary, styles.buttonPrimary],
    ['shimmer', ButtonTypes.shimmer, styles.buttonShimmer],
  ] as const)('adds the inverted class to %s', async (_, type, typeClass) => {
    await render(
      <Button testId={'inverted-btn'} type={type} inverted>
        Label
      </Button>,
    );
    const btn = getButton();
    expect(hasClass(btn, typeClass)).toBe(true);
    expect(hasClass(btn, styles.inverted)).toBe(true);
  });

  it('applies to the default type (primary)', async () => {
    await render(
      <Button testId={'inverted-btn'} inverted>
        Label
      </Button>,
    );
    const btn = getButton();
    expect(hasClass(btn, styles.buttonPrimary)).toBe(true);
    expect(hasClass(btn, styles.inverted)).toBe(true);
  });

  it('has no inverted class by default', async () => {
    await render(
      <Button testId={'inverted-btn'} type={ButtonTypes.shimmer}>
        Label
      </Button>,
    );
    expect(hasClass(getButton(), styles.inverted)).toBe(false);
  });

  it.each([
    ['default', ButtonTypes.default],
    ['secondary', ButtonTypes.secondary],
  ] as const)('ignores inverted on %s', async (_, type) => {
    await render(
      <Button testId={'inverted-btn'} type={type} inverted>
        Label
      </Button>,
    );
    expect(hasClass(getButton(), styles.inverted)).toBe(false);
  });

  it('never gives a primary button the muted-only flags', async () => {
    // Forbidden by the types; cast to check the runtime guard too
    const props = { onDark: true, pressed: true } as unknown as Record<string, never>;
    await render(
      <Button testId={'inverted-btn'} type={ButtonTypes.primary} inverted {...props}>
        Label
      </Button>,
    );
    const btn = getButton();
    expect(hasClass(btn, styles.onDark)).toBe(false);
    expect(btn.hasAttribute('aria-pressed')).toBe(false);
  });

  it('keeps the icon on the text colour at rest, on hover and when disabled', async () => {
    const { rerender } = await render(
      <Button testId={'inverted-btn'} type={ButtonTypes.shimmer} inverted icon={IconNames.add}>
        Label
      </Button>,
    );
    expect((await findIconSvg()).getAttribute('color')).toBe('currentColor');
    act(() => {
      fireEvent.mouseOver(getButton());
    });
    expect((await findIconSvg()).getAttribute('color')).toBe('currentColor');

    rerender(
      <Button testId={'inverted-btn'} type={ButtonTypes.shimmer} inverted icon={IconNames.add} disabled>
        Label
      </Button>,
    );
    expect((await findIconSvg()).getAttribute('color')).toBe('currentColor');
  });

  it('keeps the theme icon colour on a regular primary button', async () => {
    await render(<Button testId={'inverted-btn'} type={ButtonTypes.primary} icon={IconNames.add} />);
    expect((await findIconSvg()).getAttribute('color')).toBe('var(--button-primary-text-color)');
  });
});

/**
 * Type-level checks: compiled by `tsc -p tsconfig.spec.json`, never run.
 */
export const invertedTypeChecks = () => {
  const ok: ButtonProps[] = [
    { inverted: true },
    // allowed by the types (so spreading ButtonProps over a fixed type keeps compiling), ignored at runtime
    { type: ButtonTypes.secondary, inverted: true },
    { type: ButtonTypes.primary, inverted: true },
    { type: ButtonTypes.shimmer, inverted: false },
    // every type shares one size set, extraLarge included
    { inverted: true, size: ButtonSizes.extraLarge },
    { type: ButtonTypes.muted, inverted: true, onDark: true },
  ];

  // Existing call sites keep compiling: a type picked at runtime, or ButtonProps spread over a fixed type
  const condition = ok.length > 0;
  const anyType = ButtonTypes.default as ButtonTypes;
  const spread = ok[0];
  const existing = [
    <Button key={1} type={condition ? ButtonTypes.default : ButtonTypes.primary} />,
    <Button key={2} type={condition ? ButtonTypes.shimmer : ButtonTypes.muted} />,
    <Button key={3} type={anyType} />,
    <Button key={4} type={ButtonTypes.default} {...spread} />,
    <Button key={5} type={ButtonTypes.shimmer} inverted={condition} />,
  ];

  const invalid = [
    // @ts-expect-error onDark stays muted-only
    <Button key={1} type={ButtonTypes.primary} inverted onDark />,
    // @ts-expect-error blurred stays muted-only
    <Button key={2} type={ButtonTypes.shimmer} inverted blurred />,
    // @ts-expect-error pressed stays muted-only
    <Button key={3} inverted pressed />,
  ];

  return [ok, existing, invalid];
};
