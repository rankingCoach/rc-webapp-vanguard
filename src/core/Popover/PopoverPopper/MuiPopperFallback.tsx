import { Popper } from '@mui/material';

/**
 * MUI's Popper for the props the own Popper does not model (custom popper.js modifiers, function-valued options,
 * non-viewport boundaries, slots, component). Shared by PopoverPopper and PopoverModal; loaded lazily (plan §36.2 B.3).
 */
export default Popper;
