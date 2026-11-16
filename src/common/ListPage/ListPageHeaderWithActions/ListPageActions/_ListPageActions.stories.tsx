import { StoryObj } from '@storybook/react';
import { disableControls, SbDecorator } from '@test-utils/get-storybook-decorator';
import { ListPageCheckboxFilter } from '@common/ListPage/ListPageFilters/ListPageCheckboxFilter';
import { ListPageSelectorFilter } from '@common/ListPage/ListPageFilters/ListPageSelectorFilter';
import { ListPageActions } from '@common/ListPage/ListPageHeaderWithActions/ListPageActions/ListPageActions';

export default {
  ...SbDecorator({
    title: 'common/ListPage/ListPageHeaderWithActions/ListPageActions',
    component: ListPageActions,
    extra: {
      ...disableControls(['']),
    },
  }),
};

/**
 * 3) The `Story` type
 */
type Story = StoryObj<typeof ListPageActions>;

export const _ListPageActionsDefault: Story = {
  args: {
    testId: 'list-page-actions-default',
    filters: {
      automaticRequest: true,
      elements: [
        new ListPageCheckboxFilter<string>({
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
        new ListPageSelectorFilter({
          name: 'Sort by',
          queryParam: 'sort',
          options: [
            {
              value: 'DATE_ASC',
              title: 'Creation date ascending',
            },
            {
              value: 'DATE_DESC',
              title: 'Creation date descending',
            },
            {
              value: 'REACH_ASC',
              title: 'Reach ascending',
            },
            {
              value: 'REACH_DESC',
              title: 'Reach descending',
            },
          ],
        }),
      ],
    },
    refreshFunction: () => {
    },
    nextFunction: () => {
    },
    headerFiltersDisplayMode: 'checkbox',
  },
};

/**
 * 5) A story with no filters => the component will return `null`
 *    (because no filters.elements.length).
 */
export const _ListPageActionsNoFilters: Story = {
  args: {
    testId: 'list-page-actions-no-filters',
    filters: {
      elements: [], // no filter elements
      automaticRequest: true,
    },
    refreshFunction: () => {
    },
  },
};

/**
 * 6) An example with `headerFiltersDisplayMode = "checkbox"`
 *    to illustrate the checkbox approach.
 */
export const _ListPageActionsCheckboxMode: Story = {
  args: {
    testId: 'list-page-actions-checkbox-mode',
    filters: {
      elements: [],
      automaticRequest: true,
    },
    headerFiltersDisplayMode: 'checkbox',
    refreshFunction: () => {
    },
  },
};
