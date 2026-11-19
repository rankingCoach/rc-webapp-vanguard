// Ported from @mui/material@9.5.0 Snackbar/useSnackbar.js (MIT)
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';

export type SnackbarCloseReason = 'timeout' | 'clickaway' | 'escapeKeyDown';
export type SnackbarCloseHandler = (event: React.SyntheticEvent | Event | null, reason: SnackbarCloseReason) => void;

type RootProps = React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> };

export interface UseSnackbarParameters extends Pick<RootProps, 'onBlur' | 'onFocus' | 'onMouseEnter' | 'onMouseLeave'> {
  autoHideDuration?: number | null;
  disableWindowBlurListener?: boolean;
  onClose?: SnackbarCloseHandler;
  open?: boolean;
  resumeHideDuration?: number;
}

const useEnhancedEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// MUI useEventCallback keeps a stable identity and reads the latest committed callback.
function useEventCallback<Args extends unknown[]>(callback: (...args: Args) => void) {
  const ref = useRef(callback);
  useEnhancedEffect(() => {
    ref.current = callback;
  });
  return useCallback((...args: Args) => ref.current(...args), []);
}

function useTimeout() {
  const currentId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timer = useMemo(() => {
    const clear = () => {
      if (currentId.current !== null) {
        clearTimeout(currentId.current);
        currentId.current = null;
      }
    };
    return {
      clear,
      start(delay: number, callback: () => void) {
        clear();
        currentId.current = setTimeout(() => {
          currentId.current = null;
          callback();
        }, delay);
      },
    };
  }, []);
  useEffect(() => timer.clear, [timer]);
  return timer;
}

const extractEventHandlers = (props: object) =>
  Object.fromEntries(
    Object.entries(props).filter(([name, value]) => /^on[A-Z]/.test(name) && typeof value === 'function'),
  );

export function useSnackbar(parameters: UseSnackbarParameters = {}) {
  const { autoHideDuration = null, disableWindowBlurListener = false, onClose, open, resumeHideDuration } = parameters;
  const timerAutoHide = useTimeout();

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.defaultPrevented && event.key === 'Escape') onClose?.(event, 'escapeKeyDown');
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleClose = useEventCallback<Parameters<SnackbarCloseHandler>>((event, reason) => {
    onClose?.(event, reason);
  });
  const setAutoHideTimer = useEventCallback((duration: number | null) => {
    if (!onClose || duration == null) return;
    timerAutoHide.start(duration, () => handleClose(null, 'timeout'));
  });

  useEffect(() => {
    if (open) setAutoHideTimer(autoHideDuration);
    return timerAutoHide.clear;
  }, [open, autoHideDuration, setAutoHideTimer, timerAutoHide]);

  const onClickAway = (event: MouseEvent | TouchEvent) => onClose?.(event, 'clickaway');
  const handlePause = timerAutoHide.clear;
  const handleResume = useCallback(() => {
    if (autoHideDuration != null) setAutoHideTimer(resumeHideDuration ?? autoHideDuration * 0.5);
  }, [autoHideDuration, resumeHideDuration, setAutoHideTimer]);

  useEffect(() => {
    if (disableWindowBlurListener || !open) return undefined;
    window.addEventListener('focus', handleResume);
    window.addEventListener('blur', handlePause);
    return () => {
      window.removeEventListener('focus', handleResume);
      window.removeEventListener('blur', handlePause);
    };
  }, [disableWindowBlurListener, open, handleResume, handlePause]);

  const getRootProps = <ExternalProps extends RootProps>(externalProps: ExternalProps = {} as ExternalProps) => {
    const handlers = {
      ...extractEventHandlers(parameters),
      ...extractEventHandlers(externalProps),
    } as RootProps;
    return {
      role: 'presentation',
      ...externalProps,
      ...handlers,
      onBlur: (event: React.FocusEvent<HTMLDivElement>) => {
        handlers.onBlur?.(event);
        handleResume();
      },
      onFocus: (event: React.FocusEvent<HTMLDivElement>) => {
        handlers.onFocus?.(event);
        handlePause();
      },
      onMouseEnter: (event: React.MouseEvent<HTMLDivElement>) => {
        handlers.onMouseEnter?.(event);
        handlePause();
      },
      onMouseLeave: (event: React.MouseEvent<HTMLDivElement>) => {
        handlers.onMouseLeave?.(event);
        handleResume();
      },
    };
  };

  return { getRootProps, onClickAway };
}
