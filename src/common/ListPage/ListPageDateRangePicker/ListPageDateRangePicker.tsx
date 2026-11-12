import React, { Suspense, useEffect, useState } from 'react';
import styles from './ListPageDateRangePicker.module.scss';
import { ListPageDateRangeFilter } from '@common/ListPage/ListPageFilters/ListPageDateRangeFilter';
import { useAppDispatch } from '@custom-hooks/use-app-dispatch';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { formatForStore } from '@helpers/date-helpers';
import { useFilterDisabledState } from '@custom-hooks/useFilterDisabledState';
import { DateRangePicker, DateRangePickerProps } from '@vanguard/DateRangePicker';

export interface ListPageDateRangePickerProps {
  filter?: ListPageDateRangeFilter;
  reducer?: any;
  slice?: any;
}

export const ListPageDateRangePicker = (props: ListPageDateRangePickerProps) => {
  const { filter, reducer, slice } = props;

  const { setByPath } = slice;

  const [dateRangePickerProps, setRangePickerProps] = useState<DateRangePickerProps>();
  const reducerValue = useSelector(reducer) as any; // TODO fix reducer typings
  const { filters: stateFilters, created } = reducerValue;
  const dispatch = useAppDispatch();

  const isDisabled = useFilterDisabledState(
    filter?.disabled,
    reducerValue?.['filters'],
    reducerValue?.['itemsRequestLoading'],
  );

  // Update the handleDateRangeChange function to handle the new type parameter
  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    if (!filter) {
      return;
    }

    // Only dispatch if we have both dates selected
    if ((startDate && endDate) || (!startDate && !endDate)) {
      dispatch(
        setByPath({
          path: `filters.${filter?.queryParam}`,
          value: {
            from: startDate ? formatForStore(moment(startDate).local().startOf('day')) : null,
            to: endDate ? formatForStore(moment(endDate).local().endOf('day')) : null,
          },
        }),
      );
    }
  };

  useEffect(() => {
    setRangePickerProps({
      startDate: stateFilters.created ? moment(stateFilters.created?.from, 'YYYY-MM-DD').toDate() : undefined,
      endDate: stateFilters.created ? moment(stateFilters.created?.to, 'YYYY-MM-DD').toDate() : undefined,
      disabled: isDisabled,
    });
  }, [filter, isDisabled, stateFilters]);

  if (!filter) {
    return null;
  }

  if (filter.hidden) {
    return null;
  }

  return (
    <Suspense fallback={<span />}>
      <DateRangePicker
        {...dateRangePickerProps}
        onDateRangeSelected={handleDateRangeChange}
        ranges={filter.ranges}
        minDate={filter.min}
        maxDate={filter.max}
      />
    </Suspense>
  );
};
