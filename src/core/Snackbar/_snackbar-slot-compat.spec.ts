import { expect, test, vi } from 'vitest';

import { snackbarSlotProps } from './snackbar-slot-compat';

test('removes legacy content and clickaway aliases, keeping explicit slot precedence', () => {
  const content = { className: 'legacy' };
  const clickAway = { mouseEvent: 'onMouseDown' as const };
  const props = { ContentProps: content, ClickAwayListenerProps: clickAway };
  expect(snackbarSlotProps(props)).toEqual({ slotProps: { content, clickAwayListener: clickAway } });
  expect(snackbarSlotProps({ ...props, slotProps: { content: undefined } }).slotProps).toEqual({
    content: undefined,
    clickAwayListener: clickAway,
  });
  expect(props.ContentProps).toBe(content);
});

test('moves transition props and composes legacy enter/exited before preserving explicit callbacks', () => {
  const legacyEnter = vi.fn();
  const explicitEnter = vi.fn();
  const legacyExited = vi.fn();
  const explicitExited = vi.fn();
  const result = snackbarSlotProps({
    TransitionProps: { timeout: 1000, onEnter: legacyEnter, onExited: legacyExited },
    slotProps: { transition: { timeout: 0, onEnter: explicitEnter, onExited: explicitExited } },
  });
  expect(result).not.toHaveProperty('TransitionProps');
  const transition = result.slotProps!.transition as any;
  expect(transition.timeout).toBe(0);
  transition.onEnter('node', true);
  transition.onExited('node');
  expect(explicitEnter).toHaveBeenCalledExactlyOnceWith('node', true);
  expect(legacyEnter).toHaveBeenCalledExactlyOnceWith('node', true);
  expect(explicitExited).toHaveBeenCalledExactlyOnceWith('node');
  expect(legacyExited).toHaveBeenCalledExactlyOnceWith('node');
});
