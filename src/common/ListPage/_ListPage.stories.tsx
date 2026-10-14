import { ListPage } from '@common/ListPage/ListPage';
import { disableControls, SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { StoryObj } from '@storybook/react';
import { ListPageCheckboxFilter } from '@models/common/ListPageFilters/ListPageCheckboxFilter';
import { PostStatus, PostType } from '@models/swagger/App/Domain/Presence/Entities/Locations/Posts/Post';
import { ListPageSelectorFilter } from '@models/common/ListPageFilters/ListPageSelectorFilter';
import { classNames } from '@helpers/classNames';
import { dFlex } from '@globalStyles';
import { ListPageSwitchFilter } from '@models/common/ListPageFilters/ListPageSwitchFilter';
import { ListPageSwitchGroup } from '@common/ListPage/ListPageSwitchGroup/ListPageSwitchGroup';
import { ListPageDateRangeFilter } from '@models/common/ListPageFilters/ListPageDateRangeFilter';
import moment from 'moment/moment';
import { within } from 'storybook/test';
import { IconNames } from '@vanguard/Icon';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button';

const Card: React.FC<{ item: { id: number; name: string } }> = ({ item }) => {
  return <div style={{ padding: '8px', border: '1px dashed gray', marginBottom: '8px' }}>{item.name}</div>;
};

export default {
  ...SbDecorator({
    title: 'common/ListPage',
    component: ListPage,
    extra: {
      argTypes: {
        ...disableControls(['reducer', 'slice', 'endMessage', 'refreshFunction', 'nextFunction']),
      },
    },
    opts: {
      fullScreen: true,
    },
  }),
};

type Story = StoryObj<typeof ListPage>;

export const _ListPageDefault: Story = {
  args: {
    title: 'Planner',
    subTitle: 'Plan, schedule, and track your posts.',
    Card: () => null,
    dataLength: 0,
    hasMore: false,
    testId: 'default-list-page',
    nextFunction: () => {
    },
    refreshFunction: () => {
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
  },
};

export const _ListPageEmpty: Story = {
  args: {
    testId: 'empty-list-page',
    title: 'Empty List Page',
    subTitle: 'No items found',
    emptyState: true,
    emptyTitle: 'No items found',
    emptySubtitle: 'There are no items to display',
    dataLength: 0,
    hasMore: false,
    nextFunction: () => {
    },
    refreshFunction: () => {
    },
    Card: Card,
  },
};

export const _ListPageWithAction: Story = {
  args: {
    testId: 'list-page-with-action',
    title: 'List Page with Action',
    subTitle: 'Demonstrate the action button',
    dataLength: 2,
    hasMore: false,
    Card: Card,
    nextFunction: () => {
    },
    refreshFunction: () => {
    },
    action: {
      text: 'Click Me',
      cta: () => alert('Action clicked!'),
      iconLeft: IconNames.add,
    },
  },
};

export const _ListPageWithFilters: Story = {
  args: {
    testId: 'list-page-with-action',
    title: 'List Page with Action',
    subTitle: 'Demonstrate the action button',
    dataLength: 2,
    hasMore: false,
    Card: Card,
    nextFunction: () => {
    },
    refreshFunction: () => {
    },
    action: {
      text: 'Click Me',
      cta: () => alert('Action clicked!'),
      iconLeft: IconNames.add,
    },
    filters: {
      elements: [
        new ListPageCheckboxFilter<string>({
          name: 'Content type',
          queryParam: 'type',
          querySerializationType: 'array',
          options: [
            { name: PostType.POST, labelText: 'Posts' },
            { name: PostType.EVENT, labelText: 'Events' },
          ],
        }),
      ],
      automaticRequest: true,
    },
  },
};

export const _ListPageWithMultipleFilters: Story = {
  args: {
    testId: 'list-page-with-action',
    title: 'List Page with Action',
    subTitle: 'Demonstrate the action button',
    dataLength: 2,
    hasMore: false,
    Card: Card,
    nextFunction: () => {
    },
    refreshFunction: () => {
    },
    action: {
      text: 'Click Me',
      cta: () => alert('Action clicked!'),
      iconLeft: IconNames.add,
    },
    filters: {
      elements: [
        new ListPageCheckboxFilter<string>({
          name: 'Content type',
          queryParam: 'type',
          querySerializationType: 'array',
          options: [
            { name: PostType.POST, labelText: 'Posts' },
            { name: PostType.EVENT, labelText: 'Events' },
          ],
        }),
        new ListPageCheckboxFilter<string>({
          name: 'Post status',
          queryParam: 'status',
          querySerializationType: 'individual',
          options: [
            {
              name: PostStatus.PUBLISHING,
              labelText: 'Publishing',
            },
            {
              name: PostStatus.PUBLISHED,
              labelText: 'Published',
            },
            {
              name: PostStatus.NOT_APPROVED,
              labelText: 'Not approved',
            },
            {
              name: PostStatus.DRAFT,
              labelText: 'Draft',
            },
            {
              name: PostStatus.ERROR,
              labelText: 'Error while publishing',
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
      automaticRequest: false,
    },
  },
};

export const _ListPageWithHiddenInput: Story = {
  args: {
    testId: 'list-page-with-hidden-input',
    title: 'List Page with Hidden input',
    subTitle: 'Demonstrate the action button',
    dataLength: 2,
    hasMore: false,
    Card: Card,
    nextFunction: () => {
    },
    refreshFunction: () => {
    },
    action: {
      text: 'Click Me',
      cta: () => alert('Action clicked!'),
      iconLeft: IconNames.add,
    },
    filters: {
      elements: [
        new ListPageCheckboxFilter<string>({
          name: 'Content type',
          queryParam: 'contentType',
          querySerializationType: 'array',
          options: [
            { name: PostType.POST, labelText: 'Posts' },
            { name: PostType.EVENT, labelText: 'Events' },
          ],
        }),
        new ListPageSwitchFilter({
          name: 'Switch',
          disabled: (filters) => {
            return filters?.contentType?.[PostType.POST] === true;
          },
          hidden: true,
          queryParam: 'SHOW_POSTS_WITH_COMMENTS',
          options: [{ name: PostType.POST, labelText: 'Posts' }],
        }),
        new ListPageCheckboxFilter<string>({
          name: 'Post status',
          queryParam: 'status',
          querySerializationType: 'individual',
          options: [
            {
              name: PostStatus.PUBLISHING,
              labelText: 'Publishing',
            },
            {
              name: PostStatus.PUBLISHED,
              labelText: 'Published',
            },
            {
              name: PostStatus.NOT_APPROVED,
              labelText: 'Not approved',
            },
            {
              name: PostStatus.DRAFT,
              labelText: 'Draft',
            },
            {
              name: PostStatus.ERROR,
              labelText: 'Error while publishing',
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
      automaticRequest: false,
    },
  },
};

export const _ListPageWithHiddenInputAndCustomFilterSlot: Story = {
  args: {
    testId: 'list-page-with-hidden-input',
    title: 'List Page with Hidden input',
    subTitle: 'Demonstrate the action button',
    dataLength: 2,
    hasMore: false,
    slots: {
      filterSlot: (
        <ListPageSwitchGroup
          filter={
            new ListPageSwitchFilter({
              name: '',
              disabled: (filters) => {
                return filters?.contentType?.[PostType.POST] === true;
              },
              hidden: false,
              queryParam: 'SHOW_POSTS_WITH_COMMENTS',
              options: [{ name: 'SHOW_POSTS_WITH_COMMENTS', labelText: 'Show posts with comments' }],
            })
          }
        />
      ),
    },
    Card: Card,
    nextFunction: () => {
    },
    refreshFunction: () => {
    },
    action: {
      text: 'Click Me',
      cta: () => alert('Action clicked!'),
      iconLeft: IconNames.add,
    },
    filters: {
      elements: [
        new ListPageCheckboxFilter<string>({
          name: 'Content type',
          queryParam: 'contentType',
          querySerializationType: 'array',
          options: [
            { name: PostType.POST, labelText: 'Posts' },
            { name: PostType.EVENT, labelText: 'Events' },
          ],
        }),
        new ListPageCheckboxFilter<string>({
          name: 'Post status',
          queryParam: 'status',
          querySerializationType: 'individual',
          options: [
            {
              name: PostStatus.PUBLISHING,
              labelText: 'Publishing',
            },
            {
              name: PostStatus.PUBLISHED,
              labelText: 'Published',
            },
            {
              name: PostStatus.NOT_APPROVED,
              labelText: 'Not approved',
            },
            {
              name: PostStatus.DRAFT,
              labelText: 'Draft',
            },
            {
              name: PostStatus.ERROR,
              labelText: 'Error while publishing',
            },
          ],
        }),
      ],
      automaticRequest: false,
    },
  },
};

export const _ListPageWithCustomBottomSection: Story = {
  args: {
    testId: 'list-page-with-action',
    title: 'List Page with Action',
    subTitle: 'Demonstrate the action button',
    dataLength: 2,
    hasMore: false,
    Card: Card,
    nextFunction: () => {
    },
    refreshFunction: () => {
    },
    filters: {
      elements: [
        new ListPageCheckboxFilter<string>({
          name: 'Content type',
          queryParam: 'type',
          querySerializationType: 'array',
          options: [
            { name: PostType.POST, labelText: 'Posts' },
            { name: PostType.EVENT, labelText: 'Events' },
          ],
        }),
      ],
      automaticRequest: true,
    },
  },
};

export const _ListPageWithHeaderCustomSection2: Story = {
  args: {
    testId: 'list-page-with-action',
    title: 'List Page with Action',
    subTitle: 'Demonstrate the action button',
    dataLength: 2,
    hasMore: false,
    Card: Card,
    nextFunction: () => {
    },
    refreshFunction: () => {
    },
    action: {
      text: 'Click Me',
      cta: () => alert('Action clicked!'),
      iconLeft: IconNames.add,
    },
    filters: {
      elements: [
        new ListPageCheckboxFilter<string>({
          name: 'Content type',
          queryParam: 'type',
          querySerializationType: 'array',
          options: [
            { name: PostType.POST, labelText: 'Posts' },
            { name: PostType.EVENT, labelText: 'Events' },
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
      automaticRequest: true,
    },
    headerFiltersDisplayMode: 'checkbox',
    headerActionsCustomSection: (
      <div className={classNames(dFlex)}>
        <Button onClick={() => {
        }}>Create a series</Button>
        <Button onClick={() => {
        }} type={ButtonTypes.muted} size={ButtonSizes.extraLarge}>
          Show drafts
        </Button>
      </div>
    ),
  },
};
