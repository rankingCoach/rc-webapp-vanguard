import { ListPageFilter } from './ListPageFilter';

export interface ListPageFilters {
  elements: ListPageFilter[];
  automaticRequest: boolean;
  clearFiltersBtn?: boolean;
}
