import type { FormConfigElement } from '@custom-hooks/useFormConfig';
import { useMemo } from 'react';
import { useLegacyDispatch } from './use-legacy-dispatch';

/** Field-type specific last step for scalar writes: change the value, or skip the write (e.g. an invalid hex). */
export type ScalarTransform = (value: unknown) => { value?: unknown; skip?: boolean };

export interface FieldBinding {
  /** A formconfig is attached. */
  bound: boolean;
  /** The formconfig can store values (has `setStateValue`). */
  canWrite: boolean;
  /** Apply `valueMappers.toObject` (the stored shape), or return the value unchanged. */
  toStored: (raw: unknown) => unknown;
  /**
   * Store a value with today's semantics: an array field (`arrayPosition` + `setStateValueArray`) dispatches
   * `{ el, idx }` as-is; otherwise the scalar transform runs and `setStateValue(value)` is dispatched.
   */
  write: (stored: unknown, scalar?: ScalarTransform) => void;
  /** Tell the Form this field changed (`_onChange`). */
  notifyChange: () => void;
}

/**
 * F1 / D9 seam: the ONE place an input writes into its form binding. Today it is backed by the legacy
 * formconfig (consumer slice setters through the dispatch shim); F2–F4 swap the backend behind this interface
 * without touching the inputs.
 */
export const useFieldBinding = (formconfig: FormConfigElement | undefined): FieldBinding => {
  const dispatch = useLegacyDispatch();
  return useMemo<FieldBinding>(
    () => ({
      bound: Boolean(formconfig),
      canWrite: Boolean(formconfig?.setStateValue),
      toStored: (raw) => (formconfig?.valueMappers?.toObject ? formconfig.valueMappers.toObject(raw as never) : raw),
      write: (stored, scalar) => {
        if (!formconfig?.setStateValue) return;
        if (formconfig.arrayPosition !== undefined && formconfig.setStateValueArray) {
          dispatch(formconfig.setStateValueArray({ el: stored, idx: formconfig.arrayPosition }));
          return;
        }
        const out = scalar ? scalar(stored) : { value: stored };
        if (out.skip) return;
        dispatch(formconfig.setStateValue(out.value));
      },
      notifyChange: () => {
        formconfig?._onChange?.();
      },
    }),
    [formconfig, dispatch],
  );
};
