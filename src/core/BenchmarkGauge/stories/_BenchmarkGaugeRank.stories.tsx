import { SbDecorator } from '@test-utils/get-storybook-decorator';

import { BenchmarkGauge } from '../BenchmarkGauge';
import { Story } from './_BenchmarkGauge.default';
import { ColorByRankCustomPalette } from './ColorByRankCustomPalette.story';
import { ColorByRankDefault } from './ColorByRankDefault.story';
import { ColorByRankMixedPrecedence } from './ColorByRankMixedPrecedence.story';
import { ColorByRankTwoMarkersEndpoints } from './ColorByRankTwoMarkersEndpoints.story';
import { RankScenarioA } from './RankScenarioA.story';
import { RankScenarioB } from './RankScenarioB.story';
import { RankScenarioC } from './RankScenarioC.story';
import { RankWithContent } from './RankWithContent.story';
import { StaticColorRegression } from './StaticColorRegression.story';

export const StaticColor: Story = { ...StaticColorRegression };
export const ColorByRankD: Story = { ...ColorByRankDefault };
export const ColorByRankCustom: Story = { ...ColorByRankCustomPalette };
export const ColorByRankMixed: Story = { ...ColorByRankMixedPrecedence };
export const ColorByRankTwoMarkers: Story = { ...ColorByRankTwoMarkersEndpoints };
export const RankA: Story = { ...RankScenarioA };
export const RankB: Story = { ...RankScenarioB };
export const RankC: Story = { ...RankScenarioC };
export const RankContentBoxes: Story = { ...RankWithContent };

export default {
  ...SbDecorator({
    title: 'vanguard/BenchmarkGauge/Rank Coloring',
    component: BenchmarkGauge,
  }),
};