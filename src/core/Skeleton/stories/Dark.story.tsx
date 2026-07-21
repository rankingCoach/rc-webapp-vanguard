import { Story, testSizes } from './_Skeleton.default';

export const Dark: Story = {
  args: {
    color: 'dark',
    ...testSizes.box,
  },
};
