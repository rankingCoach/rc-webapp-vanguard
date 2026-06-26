import { parseCssVariable } from '@helpers/css-variables-parser';
import React from 'react';

import styles from './SegmentBar.module.scss';

export interface SegmentBarSegment {
  /** Relative weight of this segment; widths are computed as a share of the total. */
  value: number;
  /** Segment fill — CSS variable (`--s400`) or hex. */
  color: string;
}

export interface SegmentBarProps {
  segments: SegmentBarSegment[];
  /** Bar height in px. */
  height?: number;
  /** Render an evenly-split neutral placeholder. */
  loading?: boolean;
  className?: string;
}

/**
 * A single horizontal bar split into proportional colored segments
 * (e.g. positive / neutral / negative sentiment). Segments grow to their
 * share of the summed values. Renders nothing when empty and not loading.
 */
export const SegmentBar = (props: SegmentBarProps) => {
  const { segments, height = 6, loading = false, className } = props;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  if (total === 0 && !loading) return null;

  const placeholderColor = parseCssVariable('--n200');

  return (
    <div className={[styles.bar, className].filter(Boolean).join(' ')} style={{ height }}>
      {segments.map((segment, index) => (
        <div
          key={index}
          className={styles.segment}
          style={{
            flexGrow: loading ? 1 : segment.value,
            background: loading ? placeholderColor : parseCssVariable(segment.color),
          }}
        />
      ))}
    </div>
  );
};
