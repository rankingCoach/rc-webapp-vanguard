import { SkeletonTypes } from '../Skeleton';
import { Story, testSizes } from './_Skeleton.default';

export const Circle: Story = {
  args: {
    type: SkeletonTypes.circle,
    ...testSizes.avatar,
  },
};
