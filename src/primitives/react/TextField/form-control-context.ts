import { createContext, useContext } from 'react';

/**
 * The own TextFieldFrame's form-control state, read by own-core children the way MUI components read FormControl
 * context (InputAdornment: variant/size classes). `null` outside a frame, like `useFormControl()` returning undefined.
 */
export interface OwnFormControlState {
  variant: 'outlined';
  size: 'small' | 'medium';
  hiddenLabel?: boolean;
}

export const OwnFormControlContext = createContext<OwnFormControlState | null>(null);
export const useOwnFormControl = () => useContext(OwnFormControlContext);
