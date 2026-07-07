import { Icon } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';
import { a, SpringValue } from 'react-spring';

import type { ModalSplitViewCollapseToggle } from './ModalSplitView';

interface SplitViewCollapseFabProps {
  collapseToggle: ModalSplitViewCollapseToggle;
  /** Right panel open? Drives only the chevron direction. */
  isOpen: boolean;
  /**
   * Animated `left`, taken straight from the SAME panel spring that drives the slide/fade — NOT a second spring.
   * Because it's the same `SpringValue` instance (one clock), the FAB can never get ahead of or lag the panel,
   * even when a toggle interrupts an in-flight animation.
   */
  animatedLeft: SpringValue<string>;
}

/**
 * Shared round divider FAB for both ModalSplitView overlay variants. It rides the right panel's left edge: ON the
 * divider when open, at the right screen edge (half-visible via the CSS centring translate) when collapsed. The
 * variant owns `isOpen` + the animated `left`; the consumer owns the action via `collapseToggle`.
 */
export const SplitViewCollapseFab = (props: SplitViewCollapseFabProps) => {
  const { collapseToggle, isOpen, animatedLeft } = props;

  // Vertical placement is consumer-controllable (% of the split height); defaults to centered. `left` stays the
  // shared panel spring; `top` is a static override of the scss default.
  const top = `${collapseToggle.verticalPositionPercent ?? 50}%`;

  return (
    <a.button
      type="button"
      className="SplitView-collapse-fab"
      style={{ left: animatedLeft, top }}
      onClick={collapseToggle.onToggle}
      aria-label={collapseToggle.ariaLabel ?? (isOpen ? 'Collapse panel' : 'Expand panel')}
    >
      <Icon color="var(--fn-fg)" forceSize={24}>
        {isOpen
          ? collapseToggle.collapseIcon ?? IconNames.caretLeft
          : collapseToggle.expandIcon ?? IconNames.caretRight}
      </Icon>
    </a.button>
  );
};
