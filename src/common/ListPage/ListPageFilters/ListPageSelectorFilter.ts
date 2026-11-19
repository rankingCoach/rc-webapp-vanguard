import { ListPageFilter, ListPageFilterType } from './ListPageFilter';

export type ListPageSelectorFilterOption<T> = {
  title: string;
  value: T;
};

export class ListPageSelectorFilter<T> implements ListPageFilter {
  // Common properties
  name: string;
  queryParam: string;

  // Selector filter specific properties
  options: ListPageSelectorFilterOption<T>[];

  // Filter type
  type = ListPageFilterType.Selector;

  constructor(init?: Partial<ListPageSelectorFilter<T>>) {
    Object.assign(this, init);
  }
}
