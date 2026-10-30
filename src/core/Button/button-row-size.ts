import { ButtonSizes, ButtonTypes } from './Button';

type RowButtonTypeAndSize =
  | { type: ButtonTypes.muted; size: ButtonSizes }
  | { type: Exclude<ButtonTypes, ButtonTypes.muted>; size: ButtonSizes };

/** Size of a button that sits in a row of action buttons (modal footers, action bar footers): 48px desktop / 40px mobile. */
export const ROW_BUTTON_SIZE = ButtonSizes.extraLarge;

/**
 * Type and size for a button that sits in a row of action buttons (modal footers, action bar footers).
 * Every type shares one size set, so every button in the row gets `extraLarge` and shares one height whatever its type.
 */
export const getRowButtonTypeAndSize = (type: ButtonTypes): RowButtonTypeAndSize =>
  ({ type, size: ROW_BUTTON_SIZE }) as RowButtonTypeAndSize;
