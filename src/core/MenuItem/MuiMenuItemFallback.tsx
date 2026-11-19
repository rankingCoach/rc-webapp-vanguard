import { MenuItem } from '@mui/material';

/**
 * The MUI MenuItem route of Vanguard's MenuItem: only outside an own-core option host (inside Menu's MUI route or a
 * standalone MenuItem). Loaded lazily (plan §36.2 B.3) so the eager graph of MenuItem stays free of @mui/*.
 */
export default MenuItem;
