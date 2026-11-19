import type {
  BackdropProps,
  ClickAwayListenerProps,
  FilledInputProps,
  FormHelperTextProps,
  InputBaseProps,
  InputLabelProps,
  InputProps,
  MenuListProps,
  MenuProps,
  ModalProps,
  OutlinedInputProps,
  PaperProps,
  SelectProps,
  SnackbarContentProps,
  SnackbarProps,
  TextFieldProps,
  TextFieldVariants,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import type React from 'react';

/** Vanguard-owned compatibility aliases for props removed from MUI in v9. */
export interface VanguardLegacyPopoverProps {
  /** @deprecated Use slots.backdrop. */
  BackdropComponent?: React.ElementType<BackdropProps>;
  /** @deprecated Use slotProps.backdrop. */
  BackdropProps?: Partial<BackdropProps>;
  /** @deprecated Use slotProps.paper. */
  PaperProps?: Partial<PaperProps<React.ElementType>>;
  /** @deprecated Use slots.transition. */
  TransitionComponent?: React.JSXElementConstructor<TransitionProps & { children: React.ReactElement<unknown, any> }>;
  /** @deprecated Use slotProps.transition. */
  TransitionProps?: TransitionProps;
}

export interface VanguardLegacyMenuProps extends VanguardLegacyPopoverProps {
  /** @deprecated Use slots.root/backdrop. */
  components?: { Root?: React.ElementType; Backdrop?: React.ElementType };
  /** @deprecated Use slotProps.root/backdrop. */
  componentsProps?: Pick<NonNullable<ModalProps['slotProps']>, 'root' | 'backdrop'>;
  /** @deprecated Filter escapeKeyDown in onClose. */
  disableEscapeKeyDown?: boolean;
  /** @deprecated Use slotProps.list. */
  MenuListProps?: Partial<MenuListProps>;
}

export type VanguardSelectProps = Omit<SelectProps, 'MenuProps'> & {
  MenuProps?: Partial<MenuProps & VanguardLegacyMenuProps>;
};

interface VanguardLegacyTextFieldProps {
  /** @deprecated Use slotProps.htmlInput. */
  inputProps?: InputBaseProps['inputProps'];
  /** @deprecated Use slotProps.inputLabel. */
  InputLabelProps?: Partial<InputLabelProps>;
  /** @deprecated Use slotProps.select. */
  SelectProps?: Partial<VanguardSelectProps>;
  /** @deprecated Use slotProps.formHelperText. */
  FormHelperTextProps?: Partial<FormHelperTextProps>;
}

export interface VanguardLegacyInputComponentProps {
  /** @deprecated Use slots.root/input. */
  components?: { Root?: React.ElementType; Input?: React.ElementType };
  /** @deprecated Use slotProps.root/input. */
  componentsProps?: {
    root?: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>;
    input?: React.InputHTMLAttributes<HTMLInputElement> & Record<string, unknown>;
  };
}

type LegacyTextFieldInputProps<Variant extends TextFieldVariants> = Variant extends 'filled'
  ? Partial<FilledInputProps & VanguardLegacyInputComponentProps>
  : Variant extends 'standard'
    ? Partial<InputProps & VanguardLegacyInputComponentProps>
    : Partial<OutlinedInputProps & VanguardLegacyInputComponentProps>;

export type VanguardTextFieldProps<Variant extends TextFieldVariants = TextFieldVariants> =
  Variant extends TextFieldVariants
    ? TextFieldProps<Variant> &
        VanguardLegacyTextFieldProps & {
          /** @deprecated Use slotProps.input. */
          InputProps?: LegacyTextFieldInputProps<Variant>;
        }
    : never;

export interface VanguardLegacySnackbarProps {
  /** @deprecated Use slotProps.clickAwayListener. */
  ClickAwayListenerProps?: Partial<ClickAwayListenerProps>;
  /** @deprecated Use slotProps.content. */
  ContentProps?: Partial<SnackbarContentProps>;
  /** @deprecated Use slots.transition. */
  TransitionComponent?: React.JSXElementConstructor<TransitionProps & { children: React.ReactElement<unknown, any> }>;
  /** @deprecated Use slotProps.transition. */
  TransitionProps?: TransitionProps;
}

export type VanguardSnackbarProps = SnackbarProps & VanguardLegacySnackbarProps;

export interface VanguardLegacyAccordionProps {
  /** @deprecated Vanguard has historically ignored this prop; prefer its supported expansion API. */
  TransitionComponent?: React.JSXElementConstructor<TransitionProps & { children?: React.ReactElement<unknown, any> }>;
  /** @deprecated Vanguard has historically ignored this prop; prefer its supported expansion API. */
  TransitionProps?: TransitionProps;
}
