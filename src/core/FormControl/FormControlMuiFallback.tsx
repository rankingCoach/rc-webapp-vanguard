import { FormControl } from '@mui/material';

/**
 * MUI's FormControl behind Vanguard's FormControl (unreachable per the reachability map: no runtime importer, migrated
 * last). Loaded lazily (plan §36.2 B.3) so FormControl's eager graph stays free of @mui/*.
 */
export default FormControl;
