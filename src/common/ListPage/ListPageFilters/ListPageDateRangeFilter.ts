import { StaticRangeWithDefault } from '@vanguard/DateRangePicker/DateRangePicker.config';

import { ListPageFilterType } from './ListPageFilter';
import { ListPageRangeFilter } from './ListPageRangeFilter';

// ListPageDateRangeFilter is basically an extension to ListPageRangeFilter.
// You still need a min and max value, but also could have specific properties, like ranges
export class ListPageDateRangeFilter extends ListPageRangeFilter<Date> {
  // Date Range specific properties
  ranges?: StaticRangeWithDefault[];
  hidden: boolean;
  automaticRequest?: boolean;
  disabled?: boolean | ((filters: any) => boolean);
  // Callback when view state changes between calendar and static ranges
  // Filter type
  type = ListPageFilterType.DateRange;
  // Initial selection that should be applied on mount
  initialSelection?: { from: string; to: string };

  constructor(init?: Partial<ListPageDateRangeFilter>) {
    // Call the super constructor with the init parameter
    super(init);

    Object.assign(this, init);
  }
}
