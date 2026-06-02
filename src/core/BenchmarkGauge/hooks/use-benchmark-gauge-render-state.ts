import { CSSProperties, useMemo } from 'react';

import { BenchmarkGaugeProps } from '../types';
import { fillClipInset, resolveLabels, valueToPercent } from '../utils';

export const useBenchmarkGaugeRenderState = (props: BenchmarkGaugeProps) => {
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
  } = props;

  // ─── Base flags ─────────────────────────────────────────────────────────────
  const isVertical = orientation === 'vertical';
  const rankCount = markers.length;
  const { hoverHighlights = true, dimsItems = true, dimsMarkers = true } = legendInteraction ?? {};

  // ─── Ranking ─────────────────────────────────────────────────────────────────
  // rankIndex 0 = lowest value, last index = highest.
  const rankMap = useMemo(
    () => new Map([...markers].sort((a, b) => a.value - b.value).map((m, i) => [m.id, i])),
    [markers],
  );

  // ─── Progress ────────────────────────────────────────────────────────────────
  // null progressPercent → full-track mode; non-null → progress mode.
  const progressMarker = useMemo(
    () => (progressMarkerId ? markers.find((m) => m.id === progressMarkerId) : undefined),
    [markers, progressMarkerId],
  );

  const progressPercent = progressMarker ? valueToPercent(progressMarker.value, min, max) : null;

  const isProgressMode = progressPercent !== null;
  // Vivid fill is suppressed when progressPercent is 0: only the ghost layer shows.
  const hasVisibleProgressFill = progressPercent !== null && progressPercent > 0;

  // ─── Track styles ────────────────────────────────────────────────────────────
  // gradientStyle is memoized: used as an object reference in ghostStyle and fillStyle.
  const gradientStyle = useMemo<CSSProperties>(() => (gradient ? { background: gradient } : {}), [gradient]);

  const clipPath = isVertical
    ? `inset(${fillClipInset(progressPercent ?? 100)} 0 0 0 round var(--benchmark-gauge-track-radius, 90px))`
    : `inset(0 ${fillClipInset(progressPercent ?? 100)} 0 0 round var(--benchmark-gauge-track-radius, 90px))`;

  const trackBarStyle = isProgressMode ? undefined : gradientStyle;

  const ghostStyle = useMemo<CSSProperties>(
    () => ({ ...gradientStyle, ...(isProgressMode ? undefined : { opacity: 0 }) }),
    [gradientStyle, isProgressMode],
  );

  const shouldUseTrackGradient = hasVisibleProgressFill && !gradient;
  const fillStyle = useMemo<CSSProperties>(
    () => ({ ...(hasVisibleProgressFill && gradient ? gradientStyle : {}), clipPath }),
    [hasVisibleProgressFill, gradient, gradientStyle, clipPath],
  );

  // ─── Labels ──────────────────────────────────────────────────────────────────
  const { startLabel: effectiveStartLabel, endLabel: effectiveEndLabel } = resolveLabels({
    showLabels,
    startLabel,
    endLabel,
    min,
    max,
    compactLabels,
  });

  // ─── Legend ──────────────────────────────────────────────────────────────────
  // Renders above the track (horizontal) or to the right (vertical).
  const hasLegend = markers.some((m) => !!m.renderLegend);
  const legendMarkers = useMemo(
    () => markers.filter((m) => !!m.renderLegend).sort((a, b) => a.value - b.value),
    [markers],
  );

  return {
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
  };
};
