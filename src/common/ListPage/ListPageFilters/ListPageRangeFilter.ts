import { ListPageFilter, ListPageFilterType } from './ListPageFilter';

export class ListPageRangeFilter<T> implements ListPageFilter {
  // Common properties
  name: string;
  queryParam: string;

  // Range filter specific properties
  min?: T;
  max?: T;

  // Filter type
  type = ListPageFilterType.Range;

  constructor(init?: Partial<ListPageRangeFilter<T>>) {
    Object.assign(this, init);
  }
}
