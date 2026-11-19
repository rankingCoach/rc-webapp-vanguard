import { AppBar } from '@mui/material';
import type { AppBarProps } from '@mui/material/AppBar';
import React from 'react';

/**
 * The MUI AppBar route of Vanguard's AppBar (sx, component, classes, elevation, ...). Loaded lazily (plan §36.2 B.3)
 * so AppBar's eager graph stays free of @mui/*. Same sx handling as before: colour inherit adds `color: inherit`.
 */
const AppBarMuiFallback = (props: AppBarProps) => (
  <AppBar
    {...props}
    sx={[
      ...(props.color === 'inherit' ? [{ color: 'inherit' }] : []),
      ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
    ]}
  />
);

export default AppBarMuiFallback;
