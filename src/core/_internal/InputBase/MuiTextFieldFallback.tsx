import { InputLabel, InputLabelProps, TextField, TextFieldProps } from '@mui/material';
import React from 'react';

type CompatibleInputLabelProps = InputLabelProps & { vanguardComponent?: React.ElementType };

// TextField v9's slot component prop becomes `as`, which would bypass FormLabel.
// Forward the legacy component at InputLabel's public component boundary instead.
const CompatibleInputLabel = React.forwardRef<HTMLLabelElement, CompatibleInputLabelProps>(
  ({ vanguardComponent, ...props }, ref) => <InputLabel {...props} component={vanguardComponent} ref={ref} />,
);
CompatibleInputLabel.displayName = 'CompatibleInputLabel';

/**
 * The MUI TextField route of MuiTextField (props the own core does not model: non-outlined variants, native select,
 * MUI slots/classes). The route stays eager pending the separate reachability check. Receives the already mapped
 * props and slotProps.
 */
const MuiTextFieldFallback = (props: TextFieldProps) => (
  <TextField
    {...props}
    slots={{ ...props.slots, inputLabel: props.slots?.inputLabel ?? (CompatibleInputLabel as never) }}
  />
);

export default MuiTextFieldFallback;
