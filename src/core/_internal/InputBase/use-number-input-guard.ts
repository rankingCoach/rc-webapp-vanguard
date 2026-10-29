import { classifyNumericInsertion } from '@helpers/input-preventions/prevent-numeric-input';
import { MutableRefObject, useEffect } from 'react';

type PendingRestore = { value: string; onlyIfInvalid: boolean };

/**
 * Blocks invalid insertions into a number input and restores the last valid value when a block can't be cancelled
 */
export const useNumberInputGuard = (
  inputRef: MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null> | undefined,
  enabled: boolean,
): void => {
  useEffect(() => {
    const el = inputRef?.current;
    if (!enabled || !(el instanceof HTMLInputElement)) return;

    let lastValid = el.validity.badInput ? '' : el.value;
    let restoreOnInput: PendingRestore | null = null;
    let compositionStartValue: string | null = null;
    let revertOnCompositionEnd = false;
    let compositionEndTimer: ReturnType<typeof setTimeout> | undefined;

    // native setter bypasses React's value tracker, so a restore inside the input listener isn't an onChange
    const setNativeValue = (value: string): void => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(el, value);
    };
    const currentValid = (): string => (el.validity.badInput ? lastValid : el.value);

    // React's onBeforeInput is synthesized from other events and misses mobile/IME insertions
    const onBeforeInput = (e: InputEvent): void => {
      restoreOnInput = null;
      // programmatic value changes fire no input event
      if (!el.validity.badInput) lastValid = el.value;
      if (!e.inputType.startsWith('insert')) return;
      const data = e.data ?? e.dataTransfer?.getData('text/plain') ?? null;
      const verdict = classifyNumericInsertion(data, { value: el.value, badInput: el.validity.badInput });
      if (verdict === 'allow-verify') restoreOnInput = { value: el.value, onlyIfInvalid: true };
      if (verdict !== 'block') return;
      if (e.cancelable) {
        e.preventDefault();
      } else if (e.isComposing || compositionStartValue !== null) {
        // IME composition text can't be cancelled
        compositionStartValue ??= currentValid();
        revertOnCompositionEnd = true;
      } else {
        restoreOnInput = { value: currentValid(), onlyIfInvalid: false };
      }
    };
    const onNativeInput = (): void => {
      if (restoreOnInput && (!restoreOnInput.onlyIfInvalid || el.validity.badInput || el.value === '')) {
        setNativeValue(restoreOnInput.value);
      }
      restoreOnInput = null;
      if (!el.validity.badInput) lastValid = el.value;
    };
    const clearRestoreOnInput = (): void => {
      restoreOnInput = null;
    };
    const onCompositionStart = (): void => {
      compositionStartValue = currentValid();
    };
    const onCompositionEnd = (): void => {
      const restoreValue = revertOnCompositionEnd ? compositionStartValue : null;
      compositionStartValue = null;
      revertOnCompositionEnd = false;
      if (restoreValue === null) return;
      // the browser's commit input comes first; the dispatched input re-syncs React
      compositionEndTimer = setTimeout(() => {
        setNativeValue(restoreValue);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }, 0);
    };

    el.addEventListener('beforeinput', onBeforeInput);
    el.addEventListener('input', onNativeInput);
    el.addEventListener('keydown', clearRestoreOnInput);
    el.addEventListener('pointerdown', clearRestoreOnInput);
    el.addEventListener('compositionstart', onCompositionStart);
    el.addEventListener('compositionend', onCompositionEnd);
    return (): void => {
      clearTimeout(compositionEndTimer);
      el.removeEventListener('beforeinput', onBeforeInput);
      el.removeEventListener('input', onNativeInput);
      el.removeEventListener('keydown', clearRestoreOnInput);
      el.removeEventListener('pointerdown', clearRestoreOnInput);
      el.removeEventListener('compositionstart', onCompositionStart);
      el.removeEventListener('compositionend', onCompositionEnd);
    };
  }, [enabled, inputRef]);
};
