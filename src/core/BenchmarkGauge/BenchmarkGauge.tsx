import { classNames } from '@helpers/classNames';
import { Render } from '@vanguard/Render';
import { Text, TextTypes } from '@vanguard/Text';
import React, { useState } from 'react';

import styles from './BenchmarkGauge.module.scss';
import { BenchmarkGaugeMarker } from './BenchmarkGaugeMarker/BenchmarkGaugeMarker.tsx';
import { useBenchmarkGaugeRenderState } from './hooks/use-benchmark-gauge-render-state';
import { BenchmarkGaugeProps } from './types';
import { resolveMarkerColor } from './utils';

export const BenchmarkGauge = (props: BenchmarkGaugeProps) => {
  const {
    min,
    max,
    markers,
    orientation = 'horizontal',
    colorByRank,
    rankColors,
    growHighlightedMarker,
    testId,
    className,
  } = props;

  // highlightedId is purely internal — driven by legend item hover/focus, never controlled externally.
  const [highlightedId, setHighlightedId] = useState<string | undefined>(undefined);

  const {
    isVertical,
    rankCount,
    isProgressMode,
    hoverHighlights,
    dimsItems,
    dimsMarkers,
    rankMap,
    trackBarStyle,
    ghostStyle,
    shouldUseTrackGradient,
    fillStyle,
    effectiveStartLabel,
    effectiveEndLabel,
    hasLegend,
    legendMarkers,
  } = useBenchmarkGaugeRenderState(props);

  /**
   * Return View
   */
  return (
    <div data-testid={testId} className={classNames(styles.root, isVertical && styles.rootVertical, className)}>
      <Render if={hasLegend}>
        <div className={styles.legend}>
          {legendMarkers.map((marker) => {
            const isHighlighted = highlightedId === marker.id;
            const isDimmed = highlightedId !== undefined && highlightedId !== marker.id;
            const rankIndex = rankMap.get(marker.id) ?? 0;
            const ctx = { marker, orientation, rankIndex, rankCount, isHighlighted, isDimmed };

            return (
              <div
                key={marker.id}
                className={classNames(
                  styles.legendItem,
                  isHighlighted && styles.legendItemHighlighted,
                  isDimmed && dimsItems && styles.legendItemDimmed,
                )}
                style={{ '--legend-item-bg': marker.legendBackgroundColor ?? 'var(--n000)' } as React.CSSProperties}
                onMouseEnter={hoverHighlights ? () => setHighlightedId(marker.id) : undefined}
                onMouseLeave={hoverHighlights ? () => setHighlightedId(undefined) : undefined}
              >
                {marker.renderLegend!(ctx)}
              </div>
            );
          })}
        </div>
      </Render>

      <div className={styles.trackWrapper}>
        <div className={classNames(isProgressMode && styles.trackBarProgress, styles.trackBar)} style={trackBarStyle}>
          {/* Ghost: full-track gradient at reduced opacity. Visible only in progress mode. */}
          <div className={styles.trackGhost} style={ghostStyle} />

          {/* Fill: vivid gradient, clipped to the progress endpoint via clip-path.
              Suppressed when progressPercent is 0 — only the ghost layer shows.
              In normal mode: fill has no background, trackBar CSS gradient shows through. */}
          <div
            className={classNames(styles.trackFill, shouldUseTrackGradient && styles.trackGradient)}
            style={fillStyle}
          />

          {/* Labels — absolutely positioned inside trackBar */}
          <Render if={!!effectiveStartLabel}>
            <Text className={classNames(styles.label, styles.labelStart)} color={'--n000'} type={TextTypes.textCaption}>
              {effectiveStartLabel}
            </Text>
          </Render>

          <Render if={!!effectiveEndLabel}>
            <Text className={classNames(styles.label, styles.labelEnd)} color={'--n000'} type={TextTypes.textCaption}>
              {effectiveEndLabel}
            </Text>
          </Render>

          {markers.map((marker) => {
            const rankIndex = rankMap.get(marker.id) ?? 0;
            const isDimmed = highlightedId !== undefined && highlightedId !== marker.id && dimsMarkers;
            const isHighlighted = highlightedId === marker.id;
            const resolvedColor = resolveMarkerColor({
              markerColor: marker.color,
              rankIndex,
              rankCount,
              colorByRank,
              rankColors,
            });

            return (
              <BenchmarkGaugeMarker
                key={marker.id}
                marker={marker}
                min={min}
                max={max}
                orientation={orientation}
                rankIndex={rankIndex}
                rankCount={rankCount}
                isDimmed={isDimmed}
                isHighlighted={isHighlighted}
                growHighlightedMarker={growHighlightedMarker}
                resolvedColor={resolvedColor}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
