import { useEffect, useRef, useState } from 'react';

const easeOutExpo = (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export interface UseAnimatedValueOptions {
  duration?: number;
  delay?: number;
  decimals?: number;
}

/**
 * Tweens from 0 to `target` with an ease-out-expo curve over `duration` ms.
 * When `active` is false the value stays at 0 (used for skeleton/loading).
 */
export const useAnimatedValue = (target: number, active: boolean, options: UseAnimatedValueOptions = {}): number => {
  const { duration = 600, delay = 40, decimals = 0 } = options;
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      setValue(0);
      return;
    }

    const timeout = setTimeout(() => {
      startRef.current = null;
      const step = (timestamp: number) => {
        if (startRef.current === null) startRef.current = timestamp;
        const elapsed = timestamp - startRef.current;
        const progress = Math.min(elapsed / duration, 1);
        setValue(parseFloat((easeOutExpo(progress) * target).toFixed(decimals)));
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          setValue(target);
        }
      };
      rafRef.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [active, target, duration, delay, decimals]);

  return value;
};
