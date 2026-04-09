import React from 'react';

export interface MarkerRenderContext {
  /** The full marker data object. */
  marker: BenchmarkGaugeMarkerType;
  /** 0-based rank by value; 0 = lowest, `rankCount − 1` = highest. */
  rankIndex: number;
  /** Total number of markers. */
  rankCount: number;
  /** True when another marker's legend item is highlighted. */
  isDimmed: boolean;
  /** True when this marker's legend item is active (hovered or focused). */
  isHighlighted: boolean;
}

/** Controls which legend interaction behaviors are active. All fields default to `true`. */
export interface BenchmarkGaugeLegendInteraction {
  /**
   * Whether hovering a legend item highlights it and its corresponding marker.
   * @default true
   */
  hoverHighlights?: boolean;
  /**
   * Whether non-highlighted legend items are visually dimmed.
   * @default true
   */
  dimsItems?: boolean;
  /**
   * Whether non-highlighted track markers are visually dimmed.
   * @default true
   */
  dimsMarkers?: boolean;
}

export type BenchmarkGaugeMarkerType = {
  /** Stable unique key. Used for `progressMarkerId` matching and legend interaction. */
  id: string;
  /** Position on the scale. Values outside `[min, max]` are clamped. */
  value: number;
  /** Accessible label. Not rendered by the core — surface it in `renderPin`, `renderContent`, or `renderLegend`. */
  label: string;
  /** Background color of the default pin. Takes precedence over `colorByRank`. No effect when `renderPin` is provided. */
  color?: string;
  /** Background color of the legend item shell. Defaults to white. The highlight overlay renders on top of it. */
  legendBackgroundColor?: string;
  /** Custom pin renderer. Falls back to the default circle pin when omitted. */
  renderPin?: (ctx: MarkerRenderContext) => React.ReactNode;
  /**
   * Content rendered inside the default pin that animates in when the legend item is highlighted.
   * No effect when `renderPin` is provided — use `isHighlighted` from the render context instead.
   */
  renderHighlightedContent?: (ctx: MarkerRenderContext) => React.ReactNode;
  /** Anchored content (e.g. a card) rendered beside the pin. Omit to render no connector or shell. */
  renderContent?: (ctx: MarkerRenderContext) => React.ReactNode;
  /**
   * Inner content of this marker's legend item. The core renders the shell (tab stop, interaction wiring, highlight/dim).
   * Omit to exclude this marker from the legend. If no marker provides this, no legend renders.
   */
  renderLegend?: (ctx: MarkerRenderContext) => React.ReactNode;
  /**
   * Which side of the track the content anchors to.
   * `'auto'` places content below/right and flips to above/left when the marker is near the track end.
   * @default 'auto'
   */
  contentSide?: 'start' | 'end' | 'auto';
};

interface BenchmarkGaugeBaseProps {
  /** Lower bound of the scale. */
  min: number;
  /** Upper bound of the scale. Must be greater than `min`. */
  max: number;
  /** Markers to render on the scale. DOM and keyboard tab order follow the input array order. */
  markers: BenchmarkGaugeMarkerType[];
  /** @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  /** Full CSS gradient string. Overrides the default red-to-green track gradient. */
  gradient?: string;
  /**
   * ID of the marker that acts as the progress fill endpoint.
   * Enables a two-layer track: a ghost layer at full width and a fill layer clipped to this marker's position.
   */
  progressMarkerId?: string;
  /** Controls which legend interaction behaviors are active. */
  legendInteraction?: BenchmarkGaugeLegendInteraction;
  /**
   * Grows the default pin when its legend item is highlighted.
   * No effect when `renderPin` is provided — manage scaling inside `renderPin` instead.
   */
  growHighlightedMarker?: boolean;
  /** Sets `data-testid` on the root element. */
  testId?: string;
  className?: string;
}

/**
 * `compactLabels`, `startLabel`, and `endLabel` are only valid when `showLabels: true`.
 * Passing any of them without `showLabels: true` is a TypeScript error.
 */
type BenchmarkGaugeLabelProps =
  | {
      /** Labels disabled. `compactLabels`, `startLabel`, and `endLabel` are not accepted. */
      showLabels?: false;
      /** @internal Not valid when `showLabels` is absent or `false`. */
      compactLabels?: never;
      /** @internal Not valid when `showLabels` is absent or `false`. */
      startLabel?: never;
      /** @internal Not valid when `showLabels` is absent or `false`. */
      endLabel?: never;
    }
  | {
      /** Enables track-end labels. Missing sides fall back to `String(min)` / `String(max)`. */
      showLabels: true;
      /** Switches auto-generated labels to compact notation (1000 → "1K"). No effect on custom `startLabel` / `endLabel`. */
      compactLabels?: boolean;
      /** Custom start label. Falls back to `String(min)` when omitted. */
      startLabel?: React.ReactNode;
      /** Custom end label. Falls back to `String(max)` when omitted. */
      endLabel?: React.ReactNode;
    };

/**
 * `rankColors` is only valid when `colorByRank: true`.
 * Passing it without `colorByRank: true` is a TypeScript error.
 */
type BenchmarkGaugeRankColoring =
  | {
      /** Rank coloring disabled. `rankColors` is not accepted. */
      colorByRank?: false;
      /** @internal Not valid when `colorByRank` is absent or `false`. */
      rankColors?: never;
    }
  | {
      /**
       * Colors default pins by semantic rank (lowest → highest). No effect on markers with `renderPin`.
       * The default palette is `['var(--e500)', 'var(--a2900)', 'var(--s400)']` (red → amber → green).
       */
      colorByRank: true;
      /**
       * Custom palette ordered worst → best. Colors are distributed semantically: 2 markers on a 3-color palette
       * resolve to the endpoints, not indices 0 and 1. Defaults to the built-in 3-stop palette.
       */
      rankColors?: string[];
    };

export type BenchmarkGaugeProps = BenchmarkGaugeBaseProps & BenchmarkGaugeLabelProps & BenchmarkGaugeRankColoring;
