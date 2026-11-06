import { InputLabel, InputLabelProps, TextField } from '@mui/material';
import { useThemeProps } from '@mui/material/styles';
import React from 'react';

import type { VanguardTextFieldProps } from '../mui-legacy-props';
import { mapLegacyComponentAliases, mapLegacyModalAliases, mapLegacySlots } from '../mui-slot-compat';

type CompatibleInputLabelProps = InputLabelProps & { vanguardComponent?: React.ElementType };

// TextField v9's slot component prop becomes `as`, which would bypass FormLabel.
// Forward the legacy component at InputLabel's public component boundary instead.
const CompatibleInputLabel = React.forwardRef<HTMLLabelElement, CompatibleInputLabelProps>(
  ({ vanguardComponent, ...props }, ref) => <InputLabel {...props} component={vanguardComponent} ref={ref} />,
);
CompatibleInputLabel.displayName = 'CompatibleInputLabel';

/** Resolve theme defaults before removing the legacy public TextField aliases. */
export const MuiTextField = (inProps: VanguardTextFieldProps) => {
  const props = useThemeProps({ props: inProps, name: 'MuiTextField' });
  const generatedId = React.useId();
  const id = props.id ?? generatedId;
  const mapped = mapLegacySlots(
    { ...props, id },
    {
      InputProps: 'input',
      inputProps: 'htmlInput',
      InputLabelProps: 'inputLabel',
      SelectProps: 'select',
      FormHelperTextProps: 'formHelperText',
    },
  );
  const select = mapped.slotProps?.select;
  const mapSelect = (resolved: Exclude<typeof select, (...args: never[]) => unknown>) => {
    const labelId =
      resolved?.labelId ??
      (mapped.label !== null && mapped.label !== undefined && mapped.label !== '' ? `${id}-label` : undefined);
    const displayId = resolved?.SelectDisplayProps?.id ?? resolved?.id ?? id;
    return {
      ...resolved,
      SelectDisplayProps: {
        'aria-labelledby': [labelId, displayId].filter(Boolean).join(' '),
        ...resolved?.SelectDisplayProps,
      },
      ...(resolved?.MenuProps
        ? {
            MenuProps: mapLegacySlots(
              mapLegacyModalAliases(resolved.MenuProps),
              { PaperProps: 'paper', MenuListProps: 'list', TransitionProps: 'transition', BackdropProps: 'backdrop' },
              { TransitionComponent: 'transition', BackdropComponent: 'backdrop' },
            ),
          }
        : {}),
    };
  };
  const input = mapped.slotProps?.input;
  const mapInput = (resolved: Exclude<typeof input, (...args: never[]) => unknown>) =>
    resolved ? mapLegacyComponentAliases(resolved) : resolved;
  const inputLabel = mapped.slotProps?.inputLabel;
  const useDefaultLabel = !mapped.slots?.inputLabel;
  const mapLabel = (resolved: Exclude<typeof inputLabel, (...args: never[]) => unknown>) => {
    const withDefaults = { ...(mapped.select ? { htmlFor: id } : {}), ...resolved };
    if (!useDefaultLabel) return withDefaults;
    const { component, ...labelProps } = withDefaults;
    return { ...labelProps, vanguardComponent: component };
  };
  return (
    <TextField
      {...mapped}
      slots={{ ...mapped.slots, inputLabel: mapped.slots?.inputLabel ?? CompatibleInputLabel }}
      slotProps={{
        ...mapped.slotProps,
        input: typeof input === 'function' ? (state) => mapInput(input(state)) : mapInput(input),
        inputLabel: typeof inputLabel === 'function' ? (state) => mapLabel(inputLabel(state)) : mapLabel(inputLabel),
        select: typeof select === 'function' ? (state) => mapSelect(select(state)) : mapSelect(select),
      }}
    />
  );
};
