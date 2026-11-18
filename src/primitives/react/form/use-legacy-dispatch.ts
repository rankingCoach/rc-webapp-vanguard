import { useCallback, useContext } from 'react';
import { ReactReduxContext } from 'react-redux';
import { isLocalFormAction } from './local-form-action';

const isDev = () => {
  try {
    return import.meta.env?.MODE !== 'production';
  } catch {
    return false;
  }
};

/**
 * D9 single dispatch shim: the ONLY place in the input path that touches react-redux. Consumer form setters
 * (`formconfig.setStateValue`, `setStateValueArray`, ModalStepper `slice.setStep`) are called as plain functions;
 * whatever they return that is not `undefined` (action object or thunk) is dispatched, exactly as the inputs did
 * with `dispatch(setter(...))`. A setter that already dispatches itself and returns nothing is a no-op here.
 * It reads the store from `ReactReduxContext` instead of `useDispatch`, so an input without a Provider above it
 * renders (as a plain input); a result produced there is dropped with a dev warning.
 */
export const useLegacyDispatch = () => {
  const ctx = useContext(ReactReduxContext);
  const dispatch = ctx?.store?.dispatch;
  return useCallback(
    (result: unknown) => {
      if (result === undefined) return;
      // F4 (useFormStore): the setter's result writes the form's own store; no Redux involved.
      if (isLocalFormAction(result)) {
        result();
        return;
      }
      if (dispatch) {
        dispatch(result as Parameters<typeof dispatch>[0]);
      } else if (isDev()) {
        console.warn(
          'Vanguard: a form setter returned an action but there is no react-redux Provider; it was dropped.',
        );
      }
    },
    [dispatch],
  );
};
