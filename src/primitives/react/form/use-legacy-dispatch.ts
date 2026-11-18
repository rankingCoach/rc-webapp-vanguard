import { useAppDispatch } from '@custom-hooks/use-app-dispatch';
import { useCallback } from 'react';

/**
 * D9 single dispatch shim: the ONLY place in the input path that touches react-redux. Consumer form setters
 * (`formconfig.setStateValue`, `setStateValueArray`, ModalStepper `slice.setStep`) are called as plain functions;
 * whatever they return that is not `undefined` (action object or thunk) is dispatched, exactly as the inputs did
 * with `dispatch(setter(...))`. A setter that already dispatches itself and returns nothing is a no-op here.
 */
export const useLegacyDispatch = () => {
  const dispatch = useAppDispatch();
  return useCallback(
    (result: unknown) => {
      if (result !== undefined) dispatch(result as Parameters<typeof dispatch>[0]);
    },
    [dispatch],
  );
};
