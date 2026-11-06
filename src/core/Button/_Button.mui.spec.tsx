import userEvent from '@testing-library/user-event';
import { Button, ButtonSizes, ButtonTextColors, ButtonTypes } from '@vanguard/Button/Button';
import { IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { FontWeights, TextTypes } from '@vanguard/Text/Text';
import React, { createRef, RefObject } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { act, fireEvent, render, screen } from '../../../test-utils/test-utils';

/**
 * MUI contract for Button. Button is NOT built on MUI ButtonBase: it renders a native <button> inside a <span>
 * that owns the click/mouse-down handlers, and its only MUI piece is `Grow` (icon swap for `iconLargeOnHover`).
 * The ButtonBase changes (v6 async ripple, v9 Enter/Space click + disabled handlers) therefore must NOT change
 * anything here: these tests pin the native semantics so the bump proves Button is unaffected, and pin the Grow
 * styles that DO come from MUI.
 */

const getSpan = (id = 'btn') => screen.getByTestId(id);
const getButton = (id = 'btn') => screen.getByTestId(`${id}_button`) as HTMLButtonElement;
// The icon colour Button hands to Icon ends up on the svg's `color` attribute
const findIconSvgs = (id = 'btn') => screen.findAllByTestId(`${id}_icon-svg`);
const iconColor = async (id = 'btn') => (await findIconSvgs(id))[0].getAttribute('color');
const hover = (id = 'btn') =>
  act(() => {
    fireEvent.mouseOver(getButton(id));
  });

describe('Button (native button + MUI Grow contract)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('render', () => {
    it('renders a native <button> inside a testId <span>, with the CSS ripple class', () => {
      render(<Button testId="btn">{'Save'}</Button>);

      const button = screen.getByRole('button', { name: 'Save' });
      expect(button).toBe(getButton());
      expect(button.parentElement).toBe(getSpan());
      expect(getSpan().tagName).toBe('SPAN');
      // `material-ripple` is a Vanguard CSS ripple (src/styles/_material-ripple.scss:4), not MUI TouchRipple
      expect(button.classList.contains('material-ripple')).toBe(true);
    });

    it('without testId: no data-testid on the span and "button" on the <button>', () => {
      const { container } = render(<Button>{'Plain'}</Button>);

      expect((container.firstElementChild as HTMLElement).hasAttribute('data-testid')).toBe(false);
      expect(screen.getByRole('button').getAttribute('data-testid')).toBe('button');
    });

    it('visible=false renders nothing', () => {
      const { container } = render(
        <Button testId="btn" visible={false}>
          {'Hidden'}
        </Button>,
      );

      expect(container.innerHTML).toBe('');
    });

    it('targetRef receives the wrapper span', () => {
      const ref = createRef<HTMLSpanElement>() as RefObject<HTMLSpanElement>;
      render(
        <Button testId="btn" targetRef={ref}>
          {'Ref'}
        </Button>,
      );

      expect(ref.current).toBe(getSpan());
    });

    it('className, rounded/shape and w100 add classes; icon-only hides the label', () => {
      render(
        <>
          <Button testId="a" className="consumer" rounded w100>
            {'A'}
          </Button>
          <Button testId="b" shape="round" icon={IconNames.save} ariaLabel="B" />
        </>,
      );

      expect(getButton('a').classList.contains('consumer')).toBe(true);
      expect(getButton('a').className).toMatch(/shapeRound/);
      expect(getSpan('a').className).toMatch(/buttonContainerFullWidth/);
      expect(getButton('b').className).toMatch(/shapeRound/);
      expect(getButton('b').className).toMatch(/buttonLabelHidden/);
      expect(screen.getByRole('button', { name: 'B' })).toBe(getButton('b'));
    });

    it('muted blurred + textWrap wrap add their classes; textType/fontWeight reach the label', () => {
      render(
        <Button
          testId="btn"
          type={ButtonTypes.muted}
          blurred
          textWrap="wrap"
          textType={TextTypes.textCaption}
          fontWeight={FontWeights.bold}
        >
          {'Glass'}
        </Button>,
      );

      expect(getButton().className).toMatch(/blurred/);
      expect(getButton().className).toMatch(/buttonTextWrap/);
      expect(screen.getByText('Glass').style.fontWeight).not.toBe('500');
    });

    it.each([
      [ButtonTypes.default, /buttonDefault/],
      [ButtonTypes.secondary, /buttonSecondary/],
      [ButtonTypes.primary, /buttonPrimary/],
      [ButtonTypes.shimmer, /buttonShimmer/],
      ['unknown' as ButtonTypes, /buttonPrimary/],
    ])('type %s -> class %s', (type, cls) => {
      render(
        <Button testId="btn" type={type as ButtonTypes.primary}>
          {'T'}
        </Button>,
      );

      expect(getButton().className).toMatch(cls);
    });

    it('an unknown size falls back to the medium class', () => {
      render(
        <Button testId="btn" size={'huge' as ButtonSizes}>
          {'S'}
        </Button>,
      );

      expect(getButton().className).toMatch(/sizeMedium/);
    });
  });

  describe('activation and event propagation', () => {
    it('mouse click calls onClick once with a React MouseEvent of type click and bubbles to ancestors', async () => {
      const user = userEvent.setup();
      let currentTarget: EventTarget | null = null;
      const onClick = vi.fn((e: React.MouseEvent) => {
        currentTarget = e.currentTarget;
      });
      const onAncestorClick = vi.fn();
      render(
        <div onClick={onAncestorClick}>
          <Button testId="btn" onClick={onClick}>
            {'Go'}
          </Button>
        </div>,
      );

      await user.click(screen.getByRole('button', { name: 'Go' }));

      expect(onClick).toHaveBeenCalledTimes(1);
      const [event] = onClick.mock.calls[0];
      expect(event.type).toBe('click');
      expect(event.nativeEvent).toBeInstanceOf(MouseEvent);
      // the handler lives on the wrapper span, not on the <button>
      expect(currentTarget).toBe(getSpan());
      expect(onAncestorClick).toHaveBeenCalledTimes(1);
    });

    it.each([['{Enter}'], [' ']])(
      'keyboard %s on the focused <button> fires a click that reaches onClick and ancestors',
      async (key) => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        const onAncestorClick = vi.fn();
        render(
          <div onClick={onAncestorClick}>
            <Button testId="btn" onClick={onClick}>
              {'Go'}
            </Button>
          </div>,
        );

        await user.tab();
        expect(document.activeElement).toBe(getButton());
        await user.keyboard(key);

        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onClick.mock.calls[0][0].type).toBe('click');
        expect(onClick.mock.calls[0][0].nativeEvent).toBeInstanceOf(MouseEvent);
        expect(onAncestorClick).toHaveBeenCalledTimes(1);
      },
    );

    it('blurs the <button> after a click', async () => {
      const user = userEvent.setup();
      render(
        <Button testId="btn" onClick={() => undefined}>
          {'Go'}
        </Button>,
      );

      await user.click(getButton());

      expect(document.activeElement).not.toBe(getButton());
    });

    it('onMouseDown fires on press, before click', async () => {
      const user = userEvent.setup();
      const order: string[] = [];
      render(
        <Button testId="btn" onMouseDown={(e) => order.push(`down:${e.type}`)} onClick={() => order.push('click')}>
          {'Go'}
        </Button>,
      );

      await user.click(getButton());

      expect(order).toEqual(['down:mousedown', 'click']);
    });

    it('a mouse press (CSS ripple) does not swallow the click; repeated clicks all land', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Button testId="btn" onClick={onClick}>
          {'Go'}
        </Button>,
      );

      await user.click(getButton());
      await user.click(getButton());
      await user.click(getButton());

      expect(onClick).toHaveBeenCalledTimes(3);
    });

    it('debounce drops clicks inside the window and accepts the next one after it', () => {
      vi.useFakeTimers();
      vi.setSystemTime(10_000);
      const onClick = vi.fn();
      render(
        <Button testId="btn" debounce={500} onClick={onClick}>
          {'Go'}
        </Button>,
      );

      fireEvent.click(getButton());
      fireEvent.click(getButton());
      expect(onClick).toHaveBeenCalledTimes(1);
      vi.setSystemTime(10_600);
      fireEvent.click(getButton());
      expect(onClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('disabled and loading', () => {
    it('disabled: native disabled attribute; a click on the wrapper reaches ancestors but not onClick/onMouseDown', () => {
      const onClick = vi.fn();
      const onMouseDown = vi.fn();
      const onAncestorClick = vi.fn();
      render(
        <div onClick={onAncestorClick}>
          <Button testId="btn" disabled onClick={onClick} onMouseDown={onMouseDown}>
            {'Go'}
          </Button>
        </div>,
      );

      expect(getButton().disabled).toBe(true);
      // the wrapper span still bubbles; Button's own handlers bail out
      fireEvent.mouseDown(getSpan());
      fireEvent.click(getSpan());
      expect(onMouseDown).not.toHaveBeenCalled();
      expect(onClick).not.toHaveBeenCalled();
      expect(onAncestorClick).toHaveBeenCalledTimes(1);
    });

    it('disabled: Tab skips the button', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Button testId="btn" disabled>
            {'Off'}
          </Button>
          <button>{'next'}</button>
        </>,
      );

      await user.tab();

      expect(document.activeElement).toBe(screen.getByText('next'));
    });

    it('isLoading: enabled <button> but onClick/onMouseDown are skipped; default save icon spins', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onMouseDown = vi.fn();
      render(
        <Button testId="btn" isLoading onClick={onClick} onMouseDown={onMouseDown}>
          {'Saving'}
        </Button>,
      );

      expect(getButton().disabled).toBe(false);
      expect(getButton().className).toMatch(/hasIconLeft/);
      await user.click(getButton());
      expect(onClick).not.toHaveBeenCalled();
      expect(onMouseDown).not.toHaveBeenCalled();
      const icon = await screen.findByTestId('btn_icon');
      expect(icon.className).toMatch(/loaderSpinner/);
      expect((await findIconSvgs())[0].innerHTML).toContain('path');
    });

    it('isLoading with an explicit iconColor keeps no default icon', () => {
      render(
        <Button testId="btn" isLoading iconColor="#123456">
          {'Saving'}
        </Button>,
      );

      expect(getButton().className).not.toMatch(/hasIcon/);
    });
  });

  describe('MUI Grow icon swap (iconLargeOnHover)', () => {
    // Grow styles below come from MUI v5 `Grow` (scale(0.75, 0.5625) + visibility hidden when out).
    const growWrappers = () => Array.from(getButton().querySelectorAll<HTMLElement>('[class*="buttonIconContainer"]'));

    it.each([
      ['left', { iconLeft: IconNames.save }],
      ['right', { iconRight: IconNames.save }],
    ])('%s icon: small icon Grow is in, large icon Grow is out; hover swaps them', async (_, iconProps) => {
      render(
        <Button testId="btn" iconLargeOnHover {...iconProps}>
          {'Grow'}
        </Button>,
      );

      const [small, large] = growWrappers();
      // appear: entering scale(1, 1) -> entered none
      await vi.waitFor(() => expect(small.style.transform).toBe('none'));
      expect(small.style.opacity).toBe('1');
      expect(large.style.opacity).toBe('0');
      expect(large.style.transform).toBe('scale(0.75, 0.5625)');
      expect(large.style.visibility).toBe('hidden');

      hover();
      await vi.waitFor(() => {
        expect(small.style.visibility).toBe('hidden');
        expect(small.style.transform).toBe('scale(0.75, 0.5625)');
        expect(large.style.opacity).toBe('1');
        expect(large.style.transform).toBe('none');
      });
      expect(getButton().className).toMatch('iconLeft' in iconProps ? /hasIconLeft/ : /hasIconRight/);

      act(() => {
        fireEvent.mouseOut(getButton());
      });
      await vi.waitFor(() => expect(small.style.opacity).toBe('1'));
    });

    it('renders the small (16px) and large (24px) svgs', async () => {
      render(
        <Button testId="btn" icon={IconNames.save} iconLargeOnHover>
          {'Grow'}
        </Button>,
      );

      await vi.waitFor(async () =>
        expect((await findIconSvgs()).map((svg) => svg.getAttribute('width'))).toEqual(['16', '24']),
      );
    });

    it.each([
      ['iconSize large', { iconSize: IconSize.large }],
      ['disabled', { disabled: true }],
      ['isLoading', { isLoading: true }],
    ])('%s: no Grow, a single icon', async (_, extra) => {
      render(
        <Button testId="btn" icon={IconNames.save} iconLargeOnHover {...extra}>
          {'NoGrow'}
        </Button>,
      );

      expect(await screen.findAllByTestId('btn_icon')).toHaveLength(1);
      expect(getButton().querySelector('[class*="iconOnHoverContainer"]')).toBeNull();
    });
  });

  describe('icon placement precedence', () => {
    it('icon wins over iconLeft/iconRight; iconRight wins over iconLeft', () => {
      render(
        <>
          <Button testId="a" icon={IconNames.save} iconPosition="right" iconLeft={IconNames.close}>
            {'A'}
          </Button>
          <Button testId="b" iconLeft={IconNames.save} iconRight={IconNames.close}>
            {'B'}
          </Button>
        </>,
      );

      expect(getButton('a').className).toMatch(/hasIconRight/);
      expect(getButton('b').className).toMatch(/hasIconRight/);
      expect(getButton('b').className).not.toMatch(/hasIconLeft/);
    });
  });

  describe('icon and label colours', () => {
    it.each([
      [ButtonTypes.default, 'var(--button-default-text-color)', 'var(--button-default-hover-text-color)'],
      [ButtonTypes.secondary, 'var(--button-secondary-text-color)', 'var(--button-secondary-hover-text-color)'],
      [ButtonTypes.primary, 'var(--button-primary-text-color)', 'var(--button-primary-hover-text-color)'],
      [ButtonTypes.shimmer, 'var(--button-shimmer-text-color)', 'var(--button-shimmer-hover-text-color)'],
      [ButtonTypes.muted, 'currentColor', 'currentColor'],
    ])('type %s: icon %s at rest, %s on hover', async (type, rest, hovered) => {
      render(
        <Button testId="btn" type={type as ButtonTypes.primary} icon={IconNames.save}>
          {'C'}
        </Button>,
      );

      expect(await iconColor()).toBe(rest);
      hover();
      await vi.waitFor(async () => expect(await iconColor()).toBe(hovered));
    });

    it.each([[ButtonTypes.primary], [ButtonTypes.shimmer]])('inverted %s: icon follows currentColor', async (type) => {
      render(
        <Button testId="btn" type={type as ButtonTypes.primary} inverted icon={IconNames.save} iconHoverColor="#fff">
          {'Inv'}
        </Button>,
      );

      expect(await iconColor()).toBe('currentColor');
      hover();
      await vi.waitFor(async () => expect(await iconColor()).toBe('currentColor'));
    });

    it('inverted primary without iconHoverColor: icon follows currentColor on hover', async () => {
      render(
        <Button testId="btn" inverted icon={IconNames.save}>
          {'Inv'}
        </Button>,
      );

      await findIconSvgs();
      hover();
      await vi.waitFor(async () => expect(await iconColor()).toBe('currentColor'));
    });

    it('an unknown type with an icon leaves the icon on the Icon default colour', async () => {
      render(
        <Button testId="btn" type={'unknown' as ButtonTypes.primary} icon={IconNames.save}>
          {'U'}
        </Button>,
      );

      expect(await iconColor()).toBe('var(--n900)');
    });

    it('an icon without testId gets no icon test id', async () => {
      render(<Button icon={IconNames.save}>{'NoId'}</Button>);

      const svg = await screen.findByRole('figure');
      expect(svg.getAttribute('data-testid')).toBe('');
    });

    it('deprecated color/hoverColor colour the label and icon, swapping on hover', async () => {
      render(
        <Button testId="btn" color="#ff0000" hoverColor="#00ff00" icon={IconNames.save}>
          {'Legacy'}
        </Button>,
      );

      const label = () => screen.getByText('Legacy');
      expect(label().style.color).toBe('rgb(255, 0, 0)');
      expect(await iconColor()).toBe('#ff0000');
      hover();
      await vi.waitFor(() => expect(label().style.color).toBe('rgb(0, 255, 0)'));
      expect(await iconColor()).toBe('#00ff00');
    });

    it('deprecated color without hoverColor keeps the label colour on hover', () => {
      render(
        <Button testId="btn" color="#ff0000">
          {'Legacy'}
        </Button>,
      );

      hover();
      expect(screen.getByText('Legacy').style.color).toBe('rgb(255, 0, 0)');
    });

    // The deprecated iconHoverColor is replaced by the type's colour (see _ButtonMuted.spec "ignores ...")
    it.each([
      [ButtonTypes.default, 'var(--button-default-hover-text-color)'],
      [ButtonTypes.secondary, 'var(--button-default-text-color)'],
      [ButtonTypes.primary, 'var(--button-primary-text-color)'],
      [ButtonTypes.shimmer, 'var(--button-shimmer-text-color)'],
    ])('type %s ignores iconHoverColor and hovers to %s', async (type, hovered) => {
      render(
        <Button testId="btn" type={type as ButtonTypes.primary} icon={IconNames.save} iconHoverColor="#abcdef">
          {'H'}
        </Button>,
      );

      await findIconSvgs();
      hover();
      await vi.waitFor(async () => expect(await iconColor()).toBe(hovered));
    });

    it('textColor (default type): icon follows currentColor unless iconColor is given; label colour from CSS', async () => {
      render(
        <>
          <Button
            testId="a"
            type={ButtonTypes.default}
            textColor={ButtonTextColors.ado}
            icon={IconNames.save}
            color="#f00"
          >
            {'Ado'}
          </Button>
          <Button
            testId="b"
            type={ButtonTypes.default}
            textColor={ButtonTextColors.ado}
            icon={IconNames.save}
            iconColor="#123456"
          >
            {'Ado2'}
          </Button>
        </>,
      );

      expect(await iconColor('a')).toBe('currentColor');
      expect(await iconColor('b')).toBe('#123456');
      expect(getButton('a').className).toMatch(/textColorAdo/);
      expect(screen.getByText('Ado').style.color).toBe('');
    });

    it('disabled: non-following icon falls back to Icon default; label colour dropped', async () => {
      render(
        <Button testId="btn" disabled color="#ff0000" icon={IconNames.save} iconHasCircle>
          {'Off'}
        </Button>,
      );

      expect(await iconColor()).toBe('var(--n900)');
      expect(screen.getByText('Off').style.color).toBe('');
      // iconHasCircle is suppressed while disabled
      expect(screen.getByTestId('btn_icon').style.borderRadius).toBe('');
    });

    it('disabled muted: icon keeps following the text colour', async () => {
      render(<Button testId="btn" type={ButtonTypes.muted} disabled icon={IconNames.save} ariaLabel="m" />);

      expect(await iconColor()).toBe('currentColor');
    });

    it('iconHasCircle draws a circle in the icon colour', async () => {
      render(
        <Button testId="btn" type={ButtonTypes.default} icon={IconNames.save} iconHasCircle>
          {'Circle'}
        </Button>,
      );

      await findIconSvgs();
      const style = screen.getByTestId('btn_icon').style;
      expect(style.borderRadius).toBe('50%');
      expect(style.border).toBe('2px solid var(--button-default-text-color)');
    });
  });
});
