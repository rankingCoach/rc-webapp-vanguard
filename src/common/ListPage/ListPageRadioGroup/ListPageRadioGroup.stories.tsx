import { ListPageRadioGroup } from './ListPageRadioGroup';
import React from 'react';
import { disableControls, SbDecorator } from '@test-utils/get-storybook-decorator';
import { StoryObj } from '@storybook/react';
import { fn, within } from 'storybook/test';
import { ListPageRadioFilter } from '@common/ListPage/ListPageFilters/ListPageRadioFilter';
import { ListPageFilterType } from '@common/ListPage/ListPageFilters/ListPageFilter';

export default {
  ...SbDecorator({
    title: 'BuildingBlocks/ListPage/ListPageRadioGroup',
    component: ListPageRadioGroup,
    extra: {
      ...disableControls(['']),
    },
  }),
};

/**
 * We create the story type referencing its component
 */
type Story = StoryObj<typeof ListPageRadioGroup>;

const mockFilter = new ListPageRadioFilter({
  name: 'Sort by',
  queryParam: 'sort',
  defaultValue: 'name',
  type: ListPageFilterType.Radio,
  options: [
    {
      name: 'name',
      value: 'name',
      labelText: 'Name',
      elementsCount: 15,
    },
    {
      name: 'date',
      value: 'date',
      labelText: 'Date',
      elementsCount: 25,
    },
    {
      name: 'price',
      value: 'price',
      labelText: 'Price',
      elementsCount: 10,
    },
    {
      name: 'disabled',
      value: 'disabled',
      labelText: 'Disabled Option',
      elementsCount: 0,
    },
  ],
});

// Mock reducer and slice for the story
const mockReducer = () => ({
  filters: {
    sort: 'name',
  },
});

const mockSlice = {
  setByPath: fn((params) => {
    console.log('setByPath called with', params);
    return { type: 'mock/setByPath', payload: params };
  }),
};

export const ListPageRadioGroupStory: Story = {
  args: {
    filter: mockFilter,
    reducer: mockReducer,
    slice: mockSlice,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // Add interactions here for testing
  },
};
