import { SbDecorator } from '@test-utils/get-storybook-decorator';

import { BenchmarkGauge } from './BenchmarkGauge';
import { Story } from './stories/_BenchmarkGauge.default';
import { HorizontalDefault, VerticalDefault } from './stories/BasicLayouts.stories';
import { WithContentEnd, WithContentStart, WithContentAutoFlip } from './stories/WithContent.stories';
import { OverlappingMarkers, EdgePins, InvalidRangeGuard, NoMarkers } from './stories/EdgeCases.stories';
import { ScoreSimulation, AuditSimulation, ListingsSimulation } from './stories/ProductSimulations.stories';
import {
  ProgressHorizontal,
  ProgressVertical,
  ProgressAtMin,
  ProgressAtMax,
  ProgressInvalidId,
  FullTrackNoProgress,
  ProgressVerticalAtMin,
  ProgressWideTextPinVertical,
  ProgressWideTextPin
} from './stories/Progress.stories';
import {
  LegendHorizontal,
  LegendVertical,
  LegendPartial,
  LegendNone, LegendWithWrapperExtras, LegendWithCoreGrowEffect, LegendWithHighlightedIcons
} from './stories/Legend.stories';
import {
  RankScenarioA,
  RankScenarioB,
  RankScenarioC,
  RankWithContent,
} from './stories/RankBasedMarkers.stories';
import {
  InsideLabels,
  InsideLabelsWithOverlap,
  InsideLabelsWithProgress,
  InsideStartLabelOnly,
  InsideEndLabelOnly,
  InsideLabelsVertical,
} from './stories/InsideLabels.stories';
import {
  ColorByRankCustomPalette,
  ColorByRankDefault, ColorByRankMixedPrecedence, ColorByRankTwoMarkersEndpoints,
  StaticColorRegression,
} from '@vanguard/BenchmarkGauge/stories/RankColoring.stories.tsx';

export const Horizontal: Story = { ...HorizontalDefault };
export const Vertical: Story = { ...VerticalDefault };
export const ContentBelow: Story = { ...WithContentEnd };
export const ContentAbove: Story = { ...WithContentStart };
export const ContentAutoFlip: Story = { ...WithContentAutoFlip };
export const Overlapping: Story = { ...OverlappingMarkers };
export const Edges: Story = { ...EdgePins };
export const InvalidRange: Story = { ...InvalidRangeGuard };
export const NoMarkersH: Story = { ...NoMarkers };
export const ScoreComparison: Story = { ...ScoreSimulation };
export const AuditComparison: Story = { ...AuditSimulation };
export const ListingsComparison: Story = { ...ListingsSimulation };
export const ProgressH: Story = { ...ProgressHorizontal };
export const ProgressV: Story = { ...ProgressVertical };
export const ProgressMin: Story = { ...ProgressAtMin };
export const ProgressMax: Story = { ...ProgressAtMax };
export const ProgressFallback: Story = { ...ProgressInvalidId };
export const ProgressVMin: Story = { ...ProgressVerticalAtMin };
export const ProgressWideTextPinV: Story = { ...ProgressWideTextPinVertical };
export const ProgressWideTextPinH: Story = { ...ProgressWideTextPin };
export const FullTrack: Story = { ...FullTrackNoProgress };
export const LegendH: Story = { ...LegendHorizontal };
export const LegendV: Story = { ...LegendVertical };
export const LegendP: Story = { ...LegendPartial };
export const LegendOff: Story = { ...LegendNone };
export const LegendWithWrapperExtra: Story = { ...LegendWithWrapperExtras };
export const LegendWithGrowEffect: Story = { ...LegendWithCoreGrowEffect };
export const LegendHighlightedIcons: Story = { ...LegendWithHighlightedIcons };
export const RankA: Story = { ...RankScenarioA };
export const RankB: Story = { ...RankScenarioB };
export const RankC: Story = { ...RankScenarioC };
export const RankContentBoxes: Story = { ...RankWithContent };
export const LabelsInside: Story = { ...InsideLabels };
export const LabelsInsideOverlap: Story = { ...InsideLabelsWithOverlap };
export const LabelsInsideProgress: Story = { ...InsideLabelsWithProgress };
export const LabelsInsideStartOnly: Story = { ...InsideStartLabelOnly };
export const LabelsInsideEndOnly: Story = { ...InsideEndLabelOnly };
export const LabelsInsideVertical: Story = { ...InsideLabelsVertical };
export const StaticColor: Story = { ...StaticColorRegression };
export const ColorByRankD: Story = { ...ColorByRankDefault };
export const ColorByRankCustom: Story = { ...ColorByRankCustomPalette };
export const ColorByRankMixed: Story = { ...ColorByRankMixedPrecedence };
export const ColorByRankTwoMarkers: Story = { ...ColorByRankTwoMarkersEndpoints };

export default {
  ...SbDecorator({
    title: 'vanguard/BenchmarkGauge',
    component: BenchmarkGauge,
  }),
};
