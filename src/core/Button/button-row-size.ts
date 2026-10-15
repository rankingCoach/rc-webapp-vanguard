import { ButtonSizes, ButtonTypes } from './Button';

type RowButtonTypeAndSize =
  | { type: ButtonTypes.muted; size: ButtonSizes }
  | { type: Exclude<ButtonTypes, ButtonTypes.muted>; size: Exclude<ButtonSizes, ButtonSizes.extraLarge> };

/**
 * Type and size for a button that sits in a row of action buttons (modal footers, action bar footers).
 * `medium` is 48px desktop / 40px mobile for every type except muted, where it is 32px / 40px; muted `extraLarge`
 * matches the others on both breakpoints, so every button in the row shares one height whatever its type.
 */
export const getRowButtonTypeAndSize = (type: ButtonTypes): RowButtonTypeAndSize =>
  type === ButtonTypes.muted
    ? { type: ButtonTypes.muted, size: ButtonSizes.extraLarge }
    : { type, size: ButtonSizes.medium };
