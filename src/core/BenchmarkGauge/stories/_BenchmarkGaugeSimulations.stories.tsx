import { SbDecorator } from '@test-utils/get-storybook-decorator';

import { BenchmarkGauge } from '../BenchmarkGauge';
import { Story } from './_BenchmarkGauge.default';
import { AuditSimulation } from './AuditSimulation.story';
import { ListingsSimulation } from './ListingsSimulation.story';
import { ScoreSimulation } from './ScoreSimulation.story';

export const ScoreComparison: Story = { ...ScoreSimulation };
export const AuditComparison: Story = { ...AuditSimulation };
export const ListingsComparison: Story = { ...ListingsSimulation };

export default {
  ...SbDecorator({
    title: 'vanguard/BenchmarkGauge/Product Simulations',
    component: BenchmarkGauge,
  }),
};