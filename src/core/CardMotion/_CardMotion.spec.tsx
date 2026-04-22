import React from 'react';
import { describe, expect, test } from 'vitest';

import { fireEvent, render, screen, waitFor } from '../../../test-utils/test-utils';
import { CardMotion } from './CardMotion';

describe('CardMotion component tests', () => {
  test('should render children', () => {
    render(
      <CardMotion delay={0}>
        <div>Default card</div>
      </CardMotion>,
    );

    expect(screen.getByText('Default card')).toBeTruthy();
  });

  test('should support the explicit glow-in entry preset', () => {
    render(
      <CardMotion delay={0} entryPreset={'glow-in'}>
        <div>Preset glow card</div>
      </CardMotion>,
    );

    const textNode = screen.getByText('Preset glow card');
    const glowShell = textNode.parentElement?.parentElement as HTMLElement;

    expect(glowShell.style.getPropertyValue('--card-motion-skew-x-from')).toBe('4deg');
    expect(glowShell.style.getPropertyValue('--card-motion-skew-y-from')).toBe('8deg');
  });

  test('should strip inline background from the animated card when glowIn is enabled', () => {
    render(
      <CardMotion delay={0} glowIn={true} style={{ background: 'rgb(255, 0, 0)', padding: 12 }}>
        <div>Glow card</div>
      </CardMotion>,
    );

    const textNode = screen.getByText('Glow card');
    const contentWrapper = textNode.parentElement as HTMLElement;
    const animatedCard = contentWrapper.parentElement as HTMLElement;

    expect(animatedCard.style.background).not.toContain('255, 0, 0');
    expect(animatedCard.style.padding).toBe('12px');
    expect(contentWrapper.className).toBeTruthy();
  });

  test('should apply the default glow skew and transform pre-state', () => {
    render(
      <CardMotion delay={0} glowIn={true}>
        <div>Skewed glow card</div>
      </CardMotion>,
    );

    const textNode = screen.getByText('Skewed glow card');
    const glowShell = textNode.parentElement?.parentElement as HTMLElement;

    expect(glowShell.style.getPropertyValue('--card-motion-y-from')).toBe('-8px');
    expect(glowShell.style.getPropertyValue('--card-motion-scale-from')).toBe('0.7');
    expect(glowShell.style.getPropertyValue('--card-motion-skew-x-from')).toBe('4deg');
    expect(glowShell.style.getPropertyValue('--card-motion-skew-y-from')).toBe('8deg');
  });

  test('should reduce glow skew based on the card index', () => {
    render(
      <CardMotion delay={0} glowIn={true} index={2}>
        <div>Indexed glow card</div>
      </CardMotion>,
    );

    const textNode = screen.getByText('Indexed glow card');
    const glowShell = textNode.parentElement?.parentElement as HTMLElement;

    expect(glowShell.style.getPropertyValue('--card-motion-skew-x-from')).toBe('4deg');
    expect(glowShell.style.getPropertyValue('--card-motion-skew-y-from')).toBe('6deg');
  });

  test('should update hover spring transform when hoverable', async () => {
    render(
      <CardMotion delay={0} hoverable={true}>
        <div>Hover card</div>
      </CardMotion>,
    );

    const hoverTarget = screen.getByText('Hover card').parentElement as HTMLElement;

    fireEvent.mouseEnter(hoverTarget);
    await waitFor(() => expect(hoverTarget.style.transform).toContain('-4px'));

    fireEvent.mouseLeave(hoverTarget);
    await waitFor(() => expect(hoverTarget.style.transform).toContain('0px'));
  });

  test('should support custom hover animation config', async () => {
    render(
      <CardMotion delay={0} hoverAnimation={{ y: -10, scale: 1.04 }}>
        <div>Custom hover card</div>
      </CardMotion>,
    );

    const hoverTarget = screen.getByText('Custom hover card').parentElement as HTMLElement;

    fireEvent.mouseEnter(hoverTarget);
    await waitFor(() => {
      expect(hoverTarget.style.transform).toContain('-10px');
      expect(hoverTarget.style.transform).toContain('scale(1.04)');
    });
  });

  test('should unmount after leave animation when visibility changes', async () => {
    const { rerender } = render(
      <CardMotion delay={0} isVisible={true} leaveAnimation={{ duration: 0.01 }}>
        <div>Leaving card</div>
      </CardMotion>,
    );

    expect(screen.getByText('Leaving card')).toBeTruthy();

    rerender(
      <CardMotion delay={0} isVisible={false} leaveAnimation={{ duration: 0.01 }}>
        <div>Leaving card</div>
      </CardMotion>,
    );

    await waitFor(() => expect(screen.queryByText('Leaving card')).toBe(null));
  });
});
