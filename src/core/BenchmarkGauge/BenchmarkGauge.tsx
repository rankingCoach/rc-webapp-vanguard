import { classNames } from '@helpers/classNames';
import { Text, TextTypes } from '@vanguard/Text';
import React, { CSSProperties, useState } from 'react';

import styles from './BenchmarkGauge.module.scss';
import { BenchmarkGaugeMarker } from './BenchmarkGaugeMarker/BenchmarkGaugeMarker.tsx';
import { BenchmarkGaugeProps } from './types';
import { fillClipInset, resolveLabels, resolveMarkerColor, valueToPercent } from './utils';

export const BenchmarkGauge = (props: BenchmarkGaugeProps) => {
  const {
    min,
    max,
    markers,
    orientation = 'horizontal',
    showLabels,
    compactLabels,
    startLabel,
    endLabel,
    gradient,
    progressMarkerId,
    legendInteraction,
    growHighlightedMarker,
    colorByRank,
    rankColors,
    testId,
    className,
  } = props;

  const {
    hoverHighlights = true,
    dimsItems = true,
    dimsMarkers = true,
  } = legendInteraction ?? {};

  // highlightedId is purely internal — driven by legend item hover/focus, never controlled externally.
  const [highlightedId, setHighlightedId] = useState<string | undefined>(undefined);
  const isVertical = orientation === 'vertical';

  // Sorted ascending by value: rankIndex 0 = lowest value, last = highest.
  const rankCount = markers.length;
  const rankMap = new Map([...markers].sort((a, b) => a.value - b.value).map((m, i) => [m.id, i]));

  // progressPercent is non-null only when progressMarkerId resolves to a known marker.
  // null → full-track mode.
  const progressMarker = progressMarkerId ? markers.find((m) => m.id === progressMarkerId) : undefined;
  const progressPercent: number | null = progressMarker ? valueToPercent(progressMarker.value, min, max) : null;
  const isProgressMode = progressPercent !== null;
  // Vivid fill is suppressed when progressPercent is 0: only the ghost layer shows.
  const hasVisibleProgressFill = progressPercent !== null && progressPercent > 0;

  // gradient
  const gradientStyle: CSSProperties = gradient ? { background: gradient } : {};
  const trackBarStyle = isProgressMode ? undefined : gradientStyle;

  // clip path for progress fill
  const clipPath = isVertical
    ? `inset(${fillClipInset(progressPercent ?? 100)} 0 0 0 round var(--benchmark-gauge-track-radius, 90px))`
    : `inset(0 ${fillClipInset(progressPercent ?? 100)} 0 0 round var(--benchmark-gauge-track-radius, 90px))`;

  const { startLabel: effectiveStartLabel, endLabel: effectiveEndLabel } = resolveLabels({
    showLabels,
    startLabel,
    endLabel,
    min,
    max,
    compactLabels,
  });

  // Legend renders only when at least one marker provides renderLegend.
  // Placement: above the track (horizontal) or to the right (vertical).
  // Items are sorted ascending by value.
  const hasLegend = markers.some((m) => !!m.renderLegend);
  const legendMarkers = markers.filter((m) => !!m.renderLegend).sort((a, b) => a.value - b.value);

  /**
   * Return View
   */
  return (
    <div data-testid={testId} className={classNames(styles.root, isVertical && styles.rootVertical, className)}>
      {hasLegend && (
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
                style={{ '--legend-item-bg': marker.legendBackgroundColor ?? '#fff' } as React.CSSProperties}
                onMouseEnter={hoverHighlights ? () => setHighlightedId(marker.id) : undefined}
                onMouseLeave={hoverHighlights ? () => setHighlightedId(undefined) : undefined}
              >
                {marker.renderLegend!(ctx)}
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.trackWrapper}>
        <div className={classNames(isProgressMode && styles.trackBarProgress, styles.trackBar)} style={trackBarStyle}>
          {/* Ghost: full-track gradient at reduced opacity. Visible only in progress mode. */}
          <div
            className={styles.trackGhost}
            style={{ ...gradientStyle, ...(isProgressMode ? undefined : { opacity: 0 }) }}
          />

          {/* Fill: vivid gradient, clipped to the progress endpoint via clip-path.
              Suppressed when progressPercent is 0 — only the ghost layer shows.
              In normal mode: fill has no background, trackBar CSS gradient shows through. */}
          <div
            className={classNames(styles.trackFill, hasVisibleProgressFill && !gradient ? styles.trackGradient : '')}
            style={{ ...(hasVisibleProgressFill && gradient ? gradientStyle : {}), clipPath }}
          />

          {/* Labels — absolutely positioned inside trackBar */}
          {effectiveStartLabel && (
            <Text className={classNames(styles.label, styles.labelStart)} color={'--n000'} type={TextTypes.textCaption}>
              {effectiveStartLabel}
            </Text>
          )}
          {effectiveEndLabel && (
            <Text className={classNames(styles.label, styles.labelEnd)} color={'--n000'} type={TextTypes.textCaption}>
              {effectiveEndLabel}
            </Text>
          )}

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
