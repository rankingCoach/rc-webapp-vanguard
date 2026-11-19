// Ported from @mui/material@9.5.0 TextareaAutosize/TextareaAutosize.js (MIT)
import React, { useCallback, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { autosizeHeight, styleNumber } from '../../core/autosize';

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyProps = Record<string, any>;

export interface TextareaAutosizeProps extends AnyProps {
  minRows?: number | string;
  maxRows?: number | string;
  ref?: React.Ref<HTMLTextAreaElement | null>;
}

/** MUI TextareaAutosize's hidden measuring twin. */
const SHADOW_STYLE: React.CSSProperties = {
  visibility: 'hidden',
  position: 'absolute',
  overflow: 'hidden',
  height: 0,
  top: 0,
  left: 0,
  transform: 'translateZ(0)',
};

const isEmptyResult = (r: { outerHeightStyle: number; overflowing: boolean }) =>
  r.outerHeightStyle === 0 && !r.overflowing;

const debounceFrame = (fn: () => void, wait = 166) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = () => {
    clearTimeout(timer);
    timer = setTimeout(fn, wait);
  };
  debounced.clear = () => clearTimeout(timer);
  return debounced;
};

/**
 * Port of MUI 9.5 TextareaAutosize: a textarea whose height follows its content between `minRows` and `maxRows`,
 * measured on a hidden shadow textarea (same class, same width), re-synced on every render, on window resize and when
 * a ResizeObserver sees the height drift. Maths in src/primitives/core/autosize.ts.
 */
export const TextareaAutosize = (props: TextareaAutosizeProps) => {
  const { onChange, maxRows, minRows = 1, style, value, ref, placeholder, className, ...other } = props;
  const isControlled = useRef(value != null).current;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const shadowRef = useRef<HTMLTextAreaElement | null>(null);
  const heightRef = useRef<number | null>(null);
  const frameRef = useRef(-1);
  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement, []);

  const measure = useCallback(() => {
    const textarea = textareaRef.current;
    const shadow = shadowRef.current;
    if (!textarea || !shadow) return undefined;
    const computed = (textarea.ownerDocument.defaultView ?? window).getComputedStyle(textarea);
    if (computed.width === '0px') return { outerHeightStyle: 0, overflowing: false };
    shadow.style.width = computed.width;
    shadow.value = textarea.value || placeholder || 'x';
    if (shadow.value.slice(-1) === '\n') shadow.value += ' ';
    const innerHeight = shadow.scrollHeight;
    shadow.value = 'x';
    const singleRowHeight = shadow.scrollHeight;
    return autosizeHeight({
      innerHeight,
      singleRowHeight,
      minRows,
      maxRows,
      boxSizing: computed.boxSizing,
      padding: styleNumber(computed.paddingBottom) + styleNumber(computed.paddingTop),
      border: styleNumber(computed.borderBottomWidth) + styleNumber(computed.borderTopWidth),
    });
  }, [maxRows, minRows, placeholder]);

  const syncHeight = useCallback(() => {
    const textarea = textareaRef.current;
    const result = measure();
    if (!textarea || !result || isEmptyResult(result)) return;
    if (heightRef.current !== result.outerHeightStyle) {
      heightRef.current = result.outerHeightStyle;
      textarea.style.height = `${result.outerHeightStyle}px`;
    }
    textarea.style.overflow = result.overflowing ? 'hidden' : '';
  }, [measure]);

  const didHeightChange = useRef<() => boolean>(() => false);
  didHeightChange.current = () => {
    const result = measure();
    if (!textareaRef.current || !result || isEmptyResult(result)) return false;
    return heightRef.current != null && heightRef.current !== result.outerHeightStyle;
  };

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return undefined;
    const win = textarea.ownerDocument.defaultView ?? window;
    const onResize = debounceFrame(syncHeight);
    win.addEventListener('resize', onResize);
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        if (!didHeightChange.current()) return;
        // Unobserve while writing the height (avoids the ResizeObserver loop error), re-observe next frame.
        observer?.unobserve(textarea);
        cancelAnimationFrame(frameRef.current);
        syncHeight();
        frameRef.current = requestAnimationFrame(() => observer?.observe(textarea));
      });
      observer.observe(textarea);
    }
    return () => {
      onResize.clear();
      cancelAnimationFrame(frameRef.current);
      win.removeEventListener('resize', onResize);
      observer?.disconnect();
    };
  }, [syncHeight]);

  // MUI re-syncs after every render (no dependency list).
  useLayoutEffect(() => {
    syncHeight();
  });

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) syncHeight();
    const textarea = event.target;
    const length = textarea.value.length;
    if (textarea.value.endsWith('\n') && textarea.selectionStart === length) {
      textarea.setSelectionRange(length, length);
    }
    onChange?.(event);
  };

  return (
    <>
      <textarea
        value={value}
        onChange={handleChange}
        ref={textareaRef}
        rows={Number(minRows)}
        style={style}
        placeholder={placeholder}
        className={className}
        {...other}
      />
      <textarea
        aria-hidden
        className={className}
        data-slot="text-field-control-shadow"
        data-vg-core=""
        readOnly
        ref={shadowRef}
        tabIndex={-1}
        style={{ ...SHADOW_STYLE, ...style, paddingTop: 0, paddingBottom: 0 }}
      />
    </>
  );
};
