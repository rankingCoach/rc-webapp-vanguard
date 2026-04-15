import { SbDecorator } from '@test-utils/get-storybook-decorator';

import { BenchmarkGauge } from '../BenchmarkGauge';
import { Story } from './_BenchmarkGauge.default';
import { EdgePins } from './EdgePins.story';
import { HorizontalDefault } from './HorizontalDefault.story';
import { InvalidRangeGuard } from './InvalidRangeGuard.story';
import { NoMarkers } from './NoMarkers.story';
import { OverlappingMarkers } from './OverlappingMarkers.story';
import { VerticalDefault } from './VerticalDefault.story';

export const Horizontal: Story = { ...HorizontalDefault };
export const Vertical: Story = { ...VerticalDefault };
export const Overlapping: Story = { ...OverlappingMarkers };
export const Edges: Story = { ...EdgePins };
export const InvalidRange: Story = { ...InvalidRangeGuard };
export const NoMarkersH: Story = { ...NoMarkers };

export default {
  ...SbDecorator({
    title: 'vanguard/BenchmarkGauge',
    component: BenchmarkGauge,
  }),
};
