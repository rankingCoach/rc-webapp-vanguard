import type { FormConfigElement } from '@custom-hooks/useFormConfig';

export interface DatePickerProps {
  value?: number;
  required?: boolean;
  label?: string;
  minDate?: number;
  maxDate?: number;
  disablePast?: boolean;
  formconfig?: FormConfigElement;
  /** F3: bind to the nearest <Form config>'s field of this name (no `formconfig` prop needed). */
  field?: string;
  /** F3: element index for array fields bound with `field`. */
  index?: number;
  closeOnCLickAway?: boolean;
  onChange?: (value: number | null | undefined) => void;
  locale: string;
}

export { DatePickerShell as DatePicker } from './DatePickerShell';
