// Ported from @mui/material@9.5.0 Skeleton/Skeleton.js (MIT)
import React from 'react';

export interface SkeletonProps {
  /** CSS width (number = px), inline like MUI. */
  width?: number | string;
  /** CSS height (number = px), inline like MUI. */
  height?: number | string;
}

/**
 * MUI 9.5 Skeleton for Vanguard's only use (InputBase loading rows): variant `text`, animation `pulse`, inline
 * width/height. `span.MuiSkeleton-root.MuiSkeleton-text.MuiSkeleton-pulse`; styles and the pulse keyframes in
 * Skeleton.compat.scss (mui-compat.scss). The own marker sits in `data-vg-core`.
 */
export const Skeleton = ({ width, height }: SkeletonProps) => (
  <span
    className="MuiSkeleton-root MuiSkeleton-text MuiSkeleton-pulse"
    data-vg-core=""
    style={width === undefined && height === undefined ? undefined : { width, height }}
  />
);
