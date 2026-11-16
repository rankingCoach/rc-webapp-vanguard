import { StoryObj } from '@storybook/react';
import { disableControls, SbDecorator } from '@test-utils/get-storybook-decorator';
import { ListPageCheckboxGroup } from './ListPageCheckboxGroup';
import { ListPageCheckboxFilter } from '@common/ListPage/ListPageFilters/ListPageCheckboxFilter.ts';

export default SbDecorator({
  title: 'BuildingBlocks/ListPage/ListPageCheckboxGroup',
  component: ListPageCheckboxGroup,
  extra: {
    ...disableControls(['']),
  },
});

type Story = StoryObj<typeof ListPageCheckboxGroup>;

export const Default: Story = {
  args: {
    filter: new ListPageCheckboxFilter<string>({
      name: 'Content type',
      queryParam: 'type',
      querySerializationType: 'individual',
      options: [
        {
          name: 'EVENT',
          labelText: 'Events',
        },
        {
          name: 'POST',
          labelText: 'Posts',
        },
        {
          name: 'BOOSTS',
          labelText: 'Boosts',
        },
      ],
    }),
    skipSetFiltersModified: false,
  },
};
