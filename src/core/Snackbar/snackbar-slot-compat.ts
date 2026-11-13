import type { VanguardSnackbarProps as SnackbarProps } from '../_internal/mui-legacy-props';
import { mapLegacySlots } from '../_internal/mui-slot-compat';

/** MUI extracts legacy enter/exited before choosing the effective transition slot. */
export function snackbarSlotProps(props: SnackbarProps): SnackbarProps {
  const withoutComponent = { ...props };
  delete withoutComponent.TransitionComponent;
  const { onEnter, onExited, ...legacyTransition } = props.TransitionProps ?? {};
  const mapped = mapLegacySlots(withoutComponent, {
    ContentProps: 'content',
    ClickAwayListenerProps: 'clickAwayListener',
    TransitionProps: 'transition',
  });
  if (!('TransitionProps' in props) && !props.slotProps?.transition) return mapped;
  const explicit = props.slotProps?.transition;
  const effective = props.slotProps && 'transition' in props.slotProps ? explicit : legacyTransition;
  const compose = (resolved: any) => ({
    ...resolved,
    // S3 restored non-enter events from legacy props for a nullish slot.
    ...Object.fromEntries(
      Object.entries(resolved ?? props.TransitionProps ?? {}).filter(
        ([name, value]) =>
          /^on[A-Z]/.test(name) && typeof value === 'function' && name !== 'onEnter' && name !== 'onExited',
      ),
    ),
    ...(onEnter
      ? {
          onEnter: (...args: any[]) => {
            resolved?.onEnter?.(...args);
            (onEnter as (...values: any[]) => void)(...args);
          },
        }
      : {}),
    ...(onExited
      ? {
          onExited: (...args: any[]) => {
            resolved?.onExited?.(...args);
            (onExited as (...values: any[]) => void)(...args);
          },
        }
      : {}),
  });
  return {
    ...mapped,
    slotProps: {
      ...mapped.slotProps,
      transition: typeof effective === 'function' ? (ownerState) => compose(effective(ownerState)) : compose(effective),
    },
  };
}
