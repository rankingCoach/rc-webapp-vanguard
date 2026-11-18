import './PopoverPopper.scss';

import { Popper, PopperProps } from '@mui/material';
import React from 'react';
import { OwnPopper, OwnPopperProps } from '../../../primitives/react/Popper/Popper';
import { resolvePopperOptions } from '../../../primitives/react/Popper/popper-options';

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * | Popper wrapper - used by AutocompleteWithAnchor
 * ---------------------------------------------------------------------------------------------------------------------
 * Allows CSS customization using Portals (the popper is injected at the end of body).
 *
 * Group B: positioned by Vanguard's own Popper (popper.js-identical placement, plan §27/§28). Props the own core does
 * not model (custom popper.js modifiers, function-valued options, non-viewport boundaries) keep MUI's Popper.
 */
export const PopoverPopper = (props: PopperProps) => {
  const { className, ...restProps } = props;
  const merged = `vanguard-popover ${className || ''}`.trim();
  const supported = resolvePopperOptions({
    placement: restProps.placement,
    modifiers: restProps.modifiers as never,
    popperOptions: restProps.popperOptions as never,
    disablePortal: restProps.disablePortal,
  }).supported;
  if (!supported || restProps.slots || restProps.component) return <Popper {...restProps} className={merged} />;
  const { ownerState: _ownerState, ...ownProps } = restProps as PopperProps & { ownerState?: unknown };
  return <OwnPopper {...(ownProps as unknown as OwnPopperProps)} className={merged} />;
};
