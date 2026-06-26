import { Story, testSizes } from './_Skeleton.default';

export const NoAnimation: Story = {
  args: {
    noAnimation: true,
    ...testSizes.box,
  },
};
