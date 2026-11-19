// Ported from @mui/material@9.5.0 Slider/useSlider.js (MIT)
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

/**
 * MUI 9.5 useSlider for what Vanguard's Slider can reach: horizontal, left-to-right, identity scale, disableSwap
 * false, shiftStep 10, no name/tabIndex/aria-labelledby. Same value model (clamped, sorted, step rounding, marks),
 * pointer drag with pointer capture + document listeners, touch, keyboard (arrows, Page, Home/End), focus/open/active
 * state and the onChange event cloning. Component-local (offered to A for src/primitives).
 */
const INTENTIONAL_DRAG_COUNT_THRESHOLD = 2;
const SHIFT_STEP = 10;

export interface SliderMark {
  value: number;
  label?: React.ReactNode;
}
export type SliderValue = number | number[];
export type SliderChangeHandler = (event: Event, value: SliderValue, activeThumb: number) => void;
export type SliderCommitHandler = (event: React.SyntheticEvent | Event, value: SliderValue) => void;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const asc = (a: number, b: number) => a - b;
const getNewValue = (current: number, step: number, direction: 1 | -1, min: number, max: number) =>
  direction === 1 ? Math.min(current + step, max) : Math.max(current - step, min);
export const valueToPercent = (value: number, min: number, max: number) => ((value - min) * 100) / (max - min);
const percentToValue = (percent: number, min: number, max: number) => (max - min) * percent + min;
const getDecimalPrecision = (num: number) => {
  if (Math.abs(num) < 1) {
    const parts = num.toExponential().split('e-');
    const mantissaDecimalPart = parts[0].split('.')[1];
    return (mantissaDecimalPart ? mantissaDecimalPart.length : 0) + parseInt(parts[1], 10);
  }
  const decimalPart = num.toString().split('.')[1];
  return decimalPart ? decimalPart.length : 0;
};
const roundValueToStep = (value: number, step: number, min: number) => {
  const nearest = Math.round((value - min) / step) * step + min;
  return Number(nearest.toFixed(getDecimalPrecision(step)));
};
const setValueIndex = (values: number[], newValue: number, index: number) => {
  const output = values.slice();
  output[index] = newValue;
  return output.sort(asc);
};
const findClosest = (values: number[], currentValue: number, preferredIndex = -1) => {
  const closest = values.reduce<{ distance: number; index: number } | null>((acc, value, index) => {
    const distance = Math.abs(currentValue - value);
    return acc == null || distance <= acc.distance ? { distance, index } : acc;
  }, null);
  const closestIndex = closest?.index;
  if (closestIndex == null) return closestIndex as unknown as number;
  if (preferredIndex >= 0 && values[preferredIndex] === values[closestIndex]) return preferredIndex;
  return closestIndex;
};
const areValuesEqual = (a: SliderValue, b: SliderValue) => {
  if (typeof a === 'number' && typeof b === 'number') return a === b;
  if (typeof a === 'object' && typeof b === 'object') return a.length === b.length && a.every((v, i) => v === b[i]);
  return false;
};
type Finger = { x: number; y: number };
const trackFinger = (
  event: TouchEvent | PointerEvent | MouseEvent | React.PointerEvent,
  touchId: { current?: number },
): Finger | false => {
  if (touchId.current != null && (event as TouchEvent).changedTouches) {
    const touches = (event as TouchEvent).changedTouches;
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i];
      if (touch.identifier === touchId.current) return { x: touch.clientX, y: touch.clientY };
    }
    return false;
  }
  return { x: (event as MouseEvent).clientX, y: (event as MouseEvent).clientY };
};
const isFocusVisible = (el: Element) => {
  try {
    return el.matches(':focus-visible');
  } catch {
    return false;
  }
};
const focusThumb = (
  slider: React.RefObject<HTMLElement | null>,
  activeIndex: number,
  setActive?: (i: number) => void,
  focusVisible?: boolean,
) => {
  const doc = slider.current?.ownerDocument ?? document;
  const activeElement = doc.activeElement;
  if (!slider.current?.contains(activeElement) || Number(activeElement?.getAttribute('data-index')) !== activeIndex) {
    const input = slider.current?.querySelector<HTMLInputElement>(`[type="range"][data-index="${activeIndex}"]`);
    if (input != null)
      input.focus(
        focusVisible == null ? { preventScroll: true } : ({ preventScroll: true, focusVisible } as FocusOptions),
      );
  }
  if (setActive) setActive(activeIndex);
};

/** MUI's visuallyHidden + the hidden range input's own style. */
export const HIDDEN_INPUT_STYLE: React.CSSProperties = {
  border: 0,
  clipPath: 'inset(50%)',
  height: '100%',
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '100%',
  direction: 'ltr',
};

export interface UseOwnSliderParams {
  value?: SliderValue;
  min: number;
  max: number;
  step?: number | null;
  marks?: SliderMark[] | boolean;
  disabled?: boolean;
  onChange?: SliderChangeHandler;
  onChangeCommitted?: SliderCommitHandler;
  rootRef?: React.Ref<HTMLElement>;
}

export const useOwnSlider = (params: UseOwnSliderParams) => {
  const {
    value: valueProp,
    min,
    max,
    step = 1,
    marks: marksProp = false,
    disabled = false,
    onChange,
    onChangeCommitted,
  } = params;
  const touchIdRef = useRef<number | undefined>(undefined);
  const focusFrameRef = useRef<number | null>(null);
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(-1);
  const [dragging, setDragging] = useState(false);
  const moveCountRef = useRef(0);
  const lastUsedThumbIndexRef = useRef(-1);
  const pointerDownHandledRef = useRef(false);
  const activePointerIdRef = useRef(-1);
  const lastChangedValueRef = useRef<SliderValue | null>(null);
  const previousIndexRef = useRef<number | undefined>(undefined);
  const sliderRef = useRef<HTMLElement | null>(null);
  const [focusedThumbIndex, setFocusedThumbIndex] = useState(-1);

  // useControlled: controlled when `value` is defined at mount (Vanguard always passes it).
  const isControlled = useRef(valueProp !== undefined).current;
  const [valueState, setValueStateInner] = useState<SliderValue>(min);
  const valueDerived = isControlled ? (valueProp as SliderValue) : valueState;
  const setValueState = (v: SliderValue) => {
    if (!isControlled) setValueStateInner(v);
  };

  // useEventCallback-style latest refs for the document listeners.
  const latest = useRef<Record<string, (...a: never[]) => void>>({});

  const handleChange = (event: Event | React.SyntheticEvent, value: SliderValue, thumbIndex: number) => {
    const nativeEvent = ('nativeEvent' in event ? event.nativeEvent : event) as Event;
    const Ctor = nativeEvent.constructor as new (type: string, init: Event) => Event;
    const clonedEvent = new Ctor(nativeEvent.type, nativeEvent);
    Object.defineProperty(clonedEvent, 'target', { writable: true, value: { value, name: undefined } });
    lastChangedValueRef.current = value;
    onChange?.(clonedEvent, value, thumbIndex);
  };

  const range = Array.isArray(valueDerived);
  const values = useMemo(() => {
    if (typeof valueDerived === 'number') return [clamp(valueDerived, min, max)];
    if (valueDerived == null) return [min];
    const sorted = (valueDerived as number[]).slice().sort(asc);
    for (let i = 0; i < sorted.length; i += 1) sorted[i] = sorted[i] == null ? min : clamp(sorted[i], min, max);
    return sorted;
  }, [valueDerived, min, max]);
  const marks = useMemo<SliderMark[]>(() => {
    if (marksProp === true && step != null)
      return Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => ({ value: min + step * i }));
    return Array.isArray(marksProp) ? marksProp : [];
  }, [marksProp, step, min, max]);
  const marksValues = useMemo(() => marks.map((m) => m.value), [marks]);

  const cancelFocusFrame = useCallback(() => {
    if (focusFrameRef.current != null) {
      cancelAnimationFrame(focusFrameRef.current);
      focusFrameRef.current = null;
    }
  }, []);

  const handleRef = useCallback(
    (node: HTMLElement | null) => {
      sliderRef.current = node;
      const r = params.rootRef;
      if (typeof r === 'function') r(node);
      else if (r) (r as React.MutableRefObject<HTMLElement | null>).current = node;
    },
    [params.rootRef],
  );

  const changeValue = (event: React.SyntheticEvent<HTMLInputElement>, valueInput: number) => {
    const index = Number(event.currentTarget.getAttribute('data-index'));
    const value = values[index];
    const marksIndex = marksValues.indexOf(value);
    let newValue: SliderValue = valueInput;
    if (marks && step == null) {
      const maxMarksValue = marksValues[marksValues.length - 1];
      if (newValue >= maxMarksValue) newValue = maxMarksValue;
      else if (newValue <= marksValues[0]) newValue = marksValues[0];
      else newValue = newValue < value ? marksValues[marksIndex - 1] : marksValues[marksIndex + 1];
    }
    newValue = clamp(newValue, min, max);
    if (range) {
      const previousValue = newValue;
      newValue = setValueIndex(values, newValue, index);
      focusThumb(sliderRef, newValue.indexOf(previousValue));
    }
    setValueState(newValue);
    setFocusedThumbIndex(index);
    if (onChange && !areValuesEqual(newValue, valueDerived)) handleChange(event, newValue, index);
    if (onChangeCommitted) onChangeCommitted(event, lastChangedValueRef.current ?? newValue);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key))
      return;
    event.preventDefault();
    const index = Number(event.currentTarget.getAttribute('data-index'));
    const value = values[index];
    let newValue: number | null = null;
    if (step != null) {
      const stepSize = event.shiftKey ? SHIFT_STEP : step;
      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowRight':
          newValue = getNewValue(value, stepSize, 1, min, max);
          break;
        case 'ArrowDown':
        case 'ArrowLeft':
          newValue = getNewValue(value, stepSize, -1, min, max);
          break;
        case 'PageUp':
          newValue = getNewValue(value, SHIFT_STEP, 1, min, max);
          break;
        case 'PageDown':
          newValue = getNewValue(value, SHIFT_STEP, -1, min, max);
          break;
        case 'Home':
          newValue = min;
          break;
        case 'End':
          newValue = max;
          break;
      }
    } else if (marks) {
      const currentMarkIndex = marksValues.indexOf(value);
      if (['ArrowLeft', 'ArrowDown', 'PageDown', 'Home'].includes(event.key))
        newValue = currentMarkIndex === 0 ? marksValues[0] : marksValues[currentMarkIndex - 1];
      else if (['ArrowRight', 'ArrowUp', 'PageUp', 'End'].includes(event.key))
        newValue =
          currentMarkIndex === marksValues.length - 1
            ? marksValues[marksValues.length - 1]
            : marksValues[currentMarkIndex + 1];
    }
    if (newValue != null) changeValue(event, newValue);
  };

  useLayoutEffect(() => {
    const doc = sliderRef.current?.ownerDocument ?? document;
    const activeElement = doc.activeElement;
    if (disabled && sliderRef.current?.contains(activeElement) && activeElement && 'blur' in activeElement)
      (activeElement as HTMLElement).blur();
  }, [disabled]);
  if (disabled && active !== -1) setActive(-1);
  if (disabled && focusedThumbIndex !== -1) setFocusedThumbIndex(-1);

  const getValueAtFinger = (finger: Finger) => {
    const slider = sliderRef.current;
    if (!slider) return null;
    const { width, left } = slider.getBoundingClientRect();
    const percent = (finger.x - left) / width;
    let newValue: number = percentToValue(percent, min, max);
    if (step) newValue = roundValueToStep(newValue, step, min);
    else newValue = marksValues[findClosest(marksValues, newValue)];
    newValue = clamp(newValue, min, max);
    let activeIndex = 0;
    let out: SliderValue = newValue;
    if (range) {
      const isDragging = previousIndexRef.current !== -1;
      activeIndex = isDragging
        ? (previousIndexRef.current as number)
        : findClosest(values, newValue, lastUsedThumbIndexRef.current);
      const previousValue = newValue;
      out = setValueIndex(values, newValue, activeIndex);
      activeIndex = out.indexOf(previousValue);
      previousIndexRef.current = activeIndex;
    }
    return { newValue: out, activeIndex };
  };

  const handleTouchMove = (nativeEvent: PointerEvent | TouchEvent) => {
    if ('pointerId' in nativeEvent && nativeEvent.pointerId !== activePointerIdRef.current) return;
    const finger = trackFinger(nativeEvent, touchIdRef);
    if (!finger) return;
    moveCountRef.current += 1;
    if (nativeEvent.type === 'pointermove' && (nativeEvent as PointerEvent).buttons === 0) {
      handleTouchEnd(nativeEvent);
      return;
    }
    const v = getValueAtFinger(finger);
    if (!v) return;
    focusThumb(sliderRef, v.activeIndex, setActive, false);
    lastUsedThumbIndexRef.current = v.activeIndex;
    setValueState(v.newValue);
    if (!dragging && moveCountRef.current > INTENTIONAL_DRAG_COUNT_THRESHOLD) setDragging(true);
    if (onChange && !areValuesEqual(v.newValue, valueDerived)) handleChange(nativeEvent, v.newValue, v.activeIndex);
  };
  const handleTouchEnd = (nativeEvent: PointerEvent | TouchEvent) => {
    if ('pointerId' in nativeEvent && nativeEvent.pointerId !== activePointerIdRef.current) return;
    const finger = trackFinger(nativeEvent, touchIdRef);
    setDragging(false);
    if (!finger) return;
    const v = getValueAtFinger(finger);
    setActive(-1);
    if (nativeEvent.type === 'touchend') setOpen(-1);
    if (v && onChangeCommitted) onChangeCommitted(nativeEvent, lastChangedValueRef.current ?? v.newValue);
    if ('pointerType' in nativeEvent && sliderRef.current?.hasPointerCapture(nativeEvent.pointerId))
      sliderRef.current.releasePointerCapture(nativeEvent.pointerId);
    touchIdRef.current = undefined;
    activePointerIdRef.current = -1;
    stopListening();
  };
  const handleTouchStart = (nativeEvent: TouchEvent) => {
    if (disabled) return;
    if (pointerDownHandledRef.current) {
      pointerDownHandledRef.current = false;
      const touch = nativeEvent.changedTouches[0];
      if (touch != null) touchIdRef.current = touch.identifier;
      return;
    }
    const touch = nativeEvent.changedTouches[0];
    if (touch != null) touchIdRef.current = touch.identifier;
    const finger = trackFinger(nativeEvent, touchIdRef);
    if (finger !== false) {
      previousIndexRef.current = -1;
      const v = getValueAtFinger(finger);
      if (v) {
        focusThumb(sliderRef, v.activeIndex, setActive, false);
        lastUsedThumbIndexRef.current = v.activeIndex;
        setValueState(v.newValue);
        if (onChange && !areValuesEqual(v.newValue, valueDerived)) handleChange(nativeEvent, v.newValue, v.activeIndex);
      }
    }
    moveCountRef.current = 0;
    const doc = sliderRef.current?.ownerDocument ?? document;
    doc.addEventListener('touchmove', stableMove, { passive: true });
    doc.addEventListener('touchend', stableEnd, { passive: true });
  };
  latest.current = { move: handleTouchMove as never, end: handleTouchEnd as never, start: handleTouchStart as never };

  // Stable identities (MUI useEventCallback) so add/removeEventListener pair up.
  const stableMove = useRef((e: Event) => (latest.current.move as (e: Event) => void)(e)).current;
  const stableEnd = useRef((e: Event) => (latest.current.end as (e: Event) => void)(e)).current;
  const stableStart = useRef((e: Event) => (latest.current.start as (e: Event) => void)(e)).current;
  const stopListening = useCallback(() => {
    const doc = sliderRef.current?.ownerDocument ?? document;
    doc.removeEventListener('pointermove', stableMove);
    doc.removeEventListener('pointerup', stableEnd);
    doc.removeEventListener('touchmove', stableMove);
    doc.removeEventListener('touchend', stableEnd);
  }, [stableMove, stableEnd]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return undefined;
    slider.addEventListener('touchstart', stableStart, { passive: true });
    return () => {
      slider.removeEventListener('touchstart', stableStart);
      cancelFocusFrame();
      stopListening();
    };
  }, [stopListening, stableStart, cancelFocusFrame]);
  useEffect(() => {
    if (disabled) {
      stopListening();
      cancelFocusFrame();
    }
  }, [disabled, stopListening, cancelFocusFrame]);

  const onRootPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch') pointerDownHandledRef.current = true;
    if (disabled || event.defaultPrevented || event.button !== 0) return;
    const finger = trackFinger(event, touchIdRef);
    if (finger !== false) {
      previousIndexRef.current = -1;
      const v = getValueAtFinger(finger);
      if (v) {
        const thumbInput = sliderRef.current?.querySelector(`input[type="range"][data-index="${v.activeIndex}"]`);
        const doc = sliderRef.current?.ownerDocument ?? document;
        const pressedOnFocusedThumb = thumbInput != null && thumbInput === doc.activeElement;
        setActive(v.activeIndex);
        lastUsedThumbIndexRef.current = v.activeIndex;
        if (pressedOnFocusedThumb) event.preventDefault();
        else {
          cancelFocusFrame();
          focusFrameRef.current = requestAnimationFrame(() => {
            focusFrameRef.current = null;
            focusThumb(sliderRef, v.activeIndex, undefined, false);
          });
        }
        setValueState(v.newValue);
        if (onChange && !areValuesEqual(v.newValue, valueDerived)) handleChange(event, v.newValue, v.activeIndex);
      }
    }
    moveCountRef.current = 0;
    activePointerIdRef.current = event.pointerId;
    const doc = sliderRef.current?.ownerDocument ?? document;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Invalid pointerId (synthetic events): the document listeners still track the drag.
    }
    doc.addEventListener('pointermove', stableMove, { passive: true });
    doc.addEventListener('pointerup', stableEnd);
  };

  const trackOffset = valueToPercent(range ? values[0] : min, min, max);
  const trackLeap = valueToPercent(values[values.length - 1], min, max) - trackOffset;

  const getThumbStyle = (index: number): React.CSSProperties => {
    let zIndex: number | undefined;
    if (range) {
      if (active === index) zIndex = 2;
      else if (lastUsedThumbIndexRef.current === index) zIndex = 1;
    } else if (active === index) zIndex = 1;
    return { pointerEvents: active !== -1 && active !== index ? 'none' : undefined, zIndex };
  };

  const inputHandlers = {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => changeValue(event, event.currentTarget.valueAsNumber),
    onFocus: (event: React.FocusEvent<HTMLInputElement>) => {
      const index = Number(event.currentTarget.getAttribute('data-index'));
      if (isFocusVisible(event.target)) setFocusedThumbIndex(index);
      setOpen(index);
    },
    onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
      if (!isFocusVisible(event.target)) setFocusedThumbIndex(-1);
      setOpen(-1);
    },
    onKeyDown: onInputKeyDown,
  };
  const thumbHandlers = {
    onMouseOver: (event: React.MouseEvent<HTMLElement>) =>
      setOpen(Number(event.currentTarget.getAttribute('data-index'))),
    onMouseLeave: () => setOpen(-1),
  };

  return {
    active,
    dragging,
    focusedThumbIndex,
    open,
    range,
    marks,
    values,
    trackOffset,
    trackLeap,
    rootRef: handleRef,
    onRootPointerDown,
    inputHandlers,
    thumbHandlers,
    getThumbStyle,
  };
};
