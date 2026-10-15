import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { SectionMissing } from '@common/SectionMissing/SectionMissing';

export default {
  ...SbDecorator({
    title: 'common/SectionMissing',
    component: SectionMissing,
  }),
};

type Story = StoryObj<typeof SectionMissing>;

export const _SectionMissingDefault: Story = {
  args: {
    testId: 'section-missing-default',
    title: 'No opening hours yet',
    description: 'Add your opening hours so customers know when to visit.',
    buttonText: 'Add opening hours',
    buttonCallback: () => {
    },
  },
};
