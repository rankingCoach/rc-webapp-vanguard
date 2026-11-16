import { useEffect, useState } from 'react';
import { ListPageFilterType } from '@common/ListPage/ListPageFilters/ListPageFilter';
import { ListPageSwitchFilter } from '@common/ListPage/ListPageFilters/ListPageSwitchFilter';
import { useAppDispatch } from '@custom-hooks/use-app-dispatch';
import { convertStateFiltersToQueryParams } from '@custom-hooks/use-bind-query-param-to-redux-state.ts';

export const useHandleAutomaticFilterRequests = (
  filters: any,
  onShouldRefresh: () => any,
  reducerValue: Record<any, any>,
) => {
  const dispatch = useAppDispatch();
  // Track previous filters query to detect changes in specific filters
  const [prevFiltersQuery, setPrevFiltersQuery] = useState<string | null>(null);
  const filtersQuery = convertStateFiltersToQueryParams(filters.elements, reducerValue);

  useEffect(() => {
    if (filtersQuery === prevFiltersQuery) {
      setPrevFiltersQuery(filtersQuery);
      return;
    }

    // Find filters with automaticRequest set to true
    const autoRequestFilters = filters.elements.filter((filter: any) => filter.automaticRequest === true);

    if (autoRequestFilters.length === 0) {
      setPrevFiltersQuery(filtersQuery);
      return;
    }

    // Check if any of the auto-request filters changed
    let shouldRefresh = false;

    for (const filter of autoRequestFilters) {
      switch (filter.type) {
        case ListPageFilterType.Switch:
          // Special handling for switch filters
          const switchFilter = filter as ListPageSwitchFilter;

          if (switchFilter.querySerializationType === 'value') {
            // For value serialization type, check each option separately
            for (const option of switchFilter.options) {
              const optionRegex = new RegExp(`${option.name}\\s+eq\\s+(?:'${option.value}'|${option.value})`);

              // Check if the option exists in previous and current queries
              const prevHasOption = prevFiltersQuery ? optionRegex.test(prevFiltersQuery) : false;
              const currHasOption = filtersQuery ? optionRegex.test(filtersQuery) : false;
              // If the option's presence has changed, refresh
              if (prevHasOption !== currHasOption) {
                shouldRefresh = true;
                break;
              }
            }
          } else {
            // For boolean serialization type
            const filterRegex = new RegExp(`${filter.queryParam}\\s+eq\\s+'(true|false)'`);
            const prevMatch = prevFiltersQuery?.match(filterRegex);
            const currMatch = filtersQuery?.match(filterRegex);

            if (
              (!prevMatch && currMatch) ||
              (prevMatch && !currMatch) ||
              (prevMatch && currMatch && prevMatch[0] !== currMatch[0])
            ) {
              shouldRefresh = true;
            }
          }
          break;

        case ListPageFilterType.Checkbox:
          // For checkbox filters, check if any option changed
          if (filter.querySerializationType === 'boolean') {
            // Check for boolean checkbox values
            for (const option of filter.options) {
              const optionRegex = new RegExp(`${option.name}\\s+eq\\s+'[01]'`);
              const prevHasOption = prevFiltersQuery?.match(optionRegex);
              const currHasOption = filtersQuery?.match(optionRegex);

              if ((!prevHasOption && currHasOption) || (prevHasOption && !currHasOption)) {
                shouldRefresh = true;
                break;
              }
            }
          } else if (filter.querySerializationType === 'individual') {
            // Check for individual values
            const statusRegex = new RegExp(`${filter.queryParam}\\s+eq\\s+'[^']+'`);
            const prevMatches = prevFiltersQuery?.match(new RegExp(statusRegex, 'g')) || [];
            const currMatches = filtersQuery?.match(new RegExp(statusRegex, 'g')) || [];

            if (prevMatches.length !== currMatches.length) {
              shouldRefresh = true;
            } else {
              // Check if the values changed
              const prevValues = new Set(prevMatches);
              const currValues = new Set(currMatches);

              if (prevValues.size !== currValues.size) {
                shouldRefresh = true;
              } else {
                for (const value of prevValues) {
                  if (!currValues.has(value)) {
                    shouldRefresh = true;
                    break;
                  }
                }
              }
            }
          }
          break;

        case ListPageFilterType.Radio:
          // For radio buttons, check if the value changed
          const radioRegex = new RegExp(`${filter.queryParam}\\s+eq\\s+'[^']+'`);
          const prevRadioMatches = prevFiltersQuery?.match(new RegExp(radioRegex, 'g')) || [];
          const currRadioMatches = filtersQuery?.match(new RegExp(radioRegex, 'g')) || [];

          // Special case for radio values with OR conditions (values with |)
          const allPrevMatches = prevFiltersQuery?.includes(filter.queryParam);
          const allCurrMatches = filtersQuery?.includes(filter.queryParam);

          if (
            (!allPrevMatches && allCurrMatches) ||
            (allPrevMatches && !allCurrMatches) ||
            JSON.stringify(prevRadioMatches) !== JSON.stringify(currRadioMatches)
          ) {
            shouldRefresh = true;
          }
          break;

        case ListPageFilterType.DateRange:
        case ListPageFilterType.Range:
          // For date/range filters, check if any of the values changed
          const rangeRegex = new RegExp(`${filter.queryParam}\\s+(ge|le)\\s+'[^']+'`);
          const prevRangeMatches = prevFiltersQuery?.match(new RegExp(rangeRegex, 'g')) || [];
          const currRangeMatches = filtersQuery?.match(new RegExp(rangeRegex, 'g')) || [];

          if (JSON.stringify(prevRangeMatches) !== JSON.stringify(currRangeMatches)) {
            shouldRefresh = true;
          }
          break;

        case ListPageFilterType.Selector:
          // For selector filters, check if the value changed
          const selectorRegex = new RegExp(`${filter.queryParam}\\s+eq\\s+'[^']+'`);
          const prevSelectorMatch = prevFiltersQuery?.match(selectorRegex);
          const currSelectorMatch = filtersQuery?.match(selectorRegex);

          if (
            (!prevSelectorMatch && currSelectorMatch) ||
            (prevSelectorMatch && !currSelectorMatch) ||
            (prevSelectorMatch && currSelectorMatch && prevSelectorMatch[0] !== currSelectorMatch[0])
          ) {
            shouldRefresh = true;
          }
          break;

        default:
          // For any other filter type, check if it appears in the query
          if (filtersQuery?.includes(filter.queryParam) !== prevFiltersQuery?.includes(filter.queryParam)) {
            shouldRefresh = true;
          }
          break;
      }

      if (shouldRefresh) {
        break;
      }
    }

    if (shouldRefresh) {
      onShouldRefresh();
    }

    setPrevFiltersQuery(filtersQuery);
  }, [filtersQuery]);
};
