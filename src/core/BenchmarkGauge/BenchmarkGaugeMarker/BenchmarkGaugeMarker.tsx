import { classNames } from '@helpers/classNames';
import React, { CSSProperties } from 'react';

import { BenchmarkGaugeMarkerType, MarkerRenderContext } from '../types';
import { markerPosition, valueToPercent } from '../utils';
import styles from './BenchmarkGaugeMarker.module.scss';

interface BenchmarkGaugeMarkerProps {
  marker: BenchmarkGaugeMarkerType;
  min: number;
  max: number;
  orientation: 'horizontal' | 'vertical';
  rankIndex: number;
  rankCount: number;
  isDimmed: boolean;
  isHighlighted: boolean;
  growHighlightedMarker?: boolean;
  /** Resolved pin background color. Computed by the parent from marker.color, colorByRank, and the default fallback. */
  resolvedColor: string;
}

export const BenchmarkGaugeMarker = (props: BenchmarkGaugeMarkerProps) => {
  const {
    marker,
    min,
    max,
    orientation,
    rankIndex,
    rankCount,
    isDimmed,
    isHighlighted,
    growHighlightedMarker,
    resolvedColor,
  } = props;
  const isVertical = orientation === 'vertical';
  const percent = valueToPercent(marker.value, min, max);

  const resolvedSide = (contentSide?: 'start' | 'end' | 'auto'): 'start' | 'end' => {
    const side = contentSide ?? 'auto';
    if (side !== 'auto') return side;
    return percent >= 85 ? 'start' : 'end';
  };

  const ctx: MarkerRenderContext = {
    marker,
    rankIndex,
    rankCount,
    isDimmed,
    isHighlighted,
  };

  const positionStyle: CSSProperties = isVertical
    ? { bottom: markerPosition(percent) }
    : { left: markerPosition(percent) };

  // marker
  const pinEl = (
    <div className={classNames(styles.pinWrapper)}>
      {marker.renderPin ? (
        marker.renderPin(ctx)
      ) : (
        <div
          className={classNames(styles.defaultPin, growHighlightedMarker && isHighlighted && styles.defaultPinGrown)}
          style={{ background: resolvedColor }}
        >
          {marker.renderHighlightedContent && (
            <div className={classNames(styles.highlightedContent, isHighlighted && styles.highlightedContentVisible)}>
              {marker.renderHighlightedContent(ctx)}
            </div>
          )}
        </div>
      )}
    </div>
  );

  /**
   * Return View
   */
  return (
    <div
      className={classNames(styles.marker, isVertical && styles.vertical, isDimmed && styles.dimmed)}
      style={positionStyle}
    >
      {pinEl}

      {marker.renderContent && (
        <div className={classNames(styles.contentAnchor, styles[`contentAnchor--${resolvedSide(marker.contentSide)}`])}>
          <div className={styles.contentShell}>{marker.renderContent(ctx)}</div>
        </div>
      )}
    </div>
  );
};
