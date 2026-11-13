import { useAppDispatch } from '@custom-hooks/use-app-dispatch';
import { getQueryParam, setQueryParam } from '@helpers/url-params';
import {
  ListPageCheckboxFilter,
  ListPageCheckboxFilterOption,
} from '@common/ListPage/ListPageFilters/ListPageCheckboxFilter';
import { ListPageFilter, ListPageFilterType } from '@common/ListPage/ListPageFilters/ListPageFilter';
import { ListPageRadioFilter } from '@common/ListPage/ListPageFilters/ListPageRadioFilter';
import { ListPageRangeFilter } from '@common/ListPage/ListPageFilters/ListPageRangeFilter';
import { ListPageSelectorFilter } from '@common/ListPage/ListPageFilters/ListPageSelectorFilter';
import { ListPageSwitchFilter } from '@common/ListPage/ListPageFilters/ListPageSwitchFilter';
import { CaseReducerActions } from '@reduxjs/toolkit';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export type LinkBetweenQueryParamAndReduxState = {
  queryParam: string | null;
  queryValue?: number | string | null;
  reducerKey: string;
  items?: Array<ListPageFilter>;
};

export const useBindQueryParamsToReduxState = (reducer: any, slice: CaseReducerActions<any>) => {
  const reducerValue = useSelector(reducer) as any;
  const dispatch = useAppDispatch();

  const flattenObject = (obj: any, parentKey = ''): any =>
    Object.keys(obj).reduce((acc, key) => {
      const prefixedKey = parentKey ? `${parentKey}.${key}` : key;
      const value = obj[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return { ...acc, ...flattenObject(value, prefixedKey) };
      } else if (typeof value === 'boolean') {
        return { ...acc, [prefixedKey]: value ? 'true' : 'false' };
      } else if (typeof value === 'number') {
        return { ...acc, [prefixedKey]: value.toString() };
      } else {
        return { ...acc, [prefixedKey]: value };
      }
    }, {});

  useEffect(() => {
    const queryParamsFilters = getQueryParam('filters');

    // Parse the query string into a JavaScript object
    const params = new URLSearchParams(queryParamsFilters);
    const object = {};
    // @ts-ignore
    for (const [key, value] of params) {
      const keys = key.split('.');
      let nestedObject = object;
      for (let i = 0; i < keys.length - 1; i++) {
        //@ts-ignore
        nestedObject[keys[i]] = nestedObject[keys[i]] || {};
        //@ts-ignore
        nestedObject = nestedObject[keys[i]];
      }
      const parsedValue = /^\d+$/.test(value)
        ? parseInt(value, 10)
        : value === 'true'
          ? true
          : value === 'false'
            ? false
            : value === 'undefined'
              ? undefined
              : value === 'null'
                ? null
                : value;
      //@ts-ignore
      nestedObject[keys[keys.length - 1]] = parsedValue;
    }

    const setter: any = slice['setFilters'];
    if (setter) {
      if (Object.keys(object).length === 0) {
        // If URL param was blank, we need to initialize with default values from filters
        // This will be done by the setInitialDefaultValues action
        const initAction: any = slice['setInitialDefaultValues'];
        if (initAction) {
          dispatch(initAction());
        } else {
          dispatch(setter(object));
        }
      } else {
        dispatch(setter(object));
      }
    }
  }, []);

  useEffect(() => {
    const reducerFilters = reducerValue?.['filters'];

    const flattenedData = flattenObject(reducerFilters);
    const queryString = new URLSearchParams(flattenedData).toString();

    if (queryString) {
      setQueryParam('filters', queryString);
    }
  }, [reducerValue]);
};

const convertStateCheckboxFilterToQueryParams = (filter: ListPageCheckboxFilter<unknown>, reducerFilters: any) => {
  const value = reducerFilters[filter.queryParam];

  const selections = [];
  const isDisabled = (filterOption: ListPageCheckboxFilterOption<any>) =>
    typeof filterOption.disabled === 'boolean'
      ? filterOption.disabled
      : filterOption.disabled && filterOption.disabled(reducerFilters);

  for (const option of (filter as ListPageCheckboxFilter<unknown>).options) {
    if (isDisabled(option)) {
      continue;
    }
    if (value?.[option.name] || filter.serialize) {
      let realValue = option.value ?? option.name;

      if (filter.serialize) {
        const serializedValue = filter.serialize(reducerFilters);
        if (serializedValue !== undefined) {
          realValue = serializedValue;
        }
      }
      selections.push(realValue);
    }
  }

  if (selections.length) {
    switch (filter.querySerializationType) {
      case 'individual':
        const flattenedSelections = selections
          .map((element) => (typeof element === 'string' ? `'${element}'` : element))
          .join(` or ${filter.queryParam} eq `);
        return `(${filter.queryParam} eq ${flattenedSelections})`;
      case 'boolean':
        if (Array.isArray(selections) && selections.length > 0) {
          return `(${selections
            .filter((element) => typeof element === 'string')
            .map((element) => `${element} eq '1'`)
            .join(' or ')})`;
        }
        return `${filter.queryParam} eq false`;
      case 'array':
      default:
        const parsedSelections = selections
          .map((element) => (typeof element === 'string' ? `'${element}'` : element))
          .join(', ');
        return `${filter.queryParam} in [${parsedSelections}]`;
    }
  }

  return '';
};

const convertStateRangeFilterToQueryParams = (filter: ListPageRangeFilter<unknown>, reducerFilters: any) => {
  let queryParam = '';

  const value = reducerFilters[filter.queryParam];

  if (value?.['from']) {
    queryParam += `${filter.queryParam} ge '${value['from']}'`;
  }

  if (value?.['to']) {
    const lt = `${filter.queryParam} le '${value['to']}'`;

    if (!!queryParam) {
      queryParam = `(${queryParam} and ${lt})`;
    } else {
      queryParam = lt;
    }
  }

  return queryParam;
};

const convertStateSelectorFilterToQueryParams = (filter: ListPageSelectorFilter<unknown>, reducerFilters: any) => {
  let queryParam = '';

  const value = reducerFilters[filter.queryParam];
  if (value) {
    queryParam += `${filter.queryParam} eq '${value}'`;
  }

  return queryParam;
};

const convertStateRadioFilterToQueryParams = (filter: ListPageRadioFilter<unknown>, reducerFilters: any) => {
  let queryParam = '';

  const value = reducerFilters[filter.queryParam] || filter.defaultValue;
  if (value) {
    if (filter.querySerializationType === 'boolean') {
      // For boolean serialization, set the selected option to true
      const selectedOption = filter.options.find((option) => option.value === value);
      if (selectedOption) {
        queryParam += `${selectedOption.name} eq 'true'`;
      }
    } else {
      /**
       * Add a special separator that we can include in QP
       * */
      if (value.includes('|')) {
        const values: string[] = value.split('|').map((val: string) => `${filter.queryParam} eq '${val}'`);
        queryParam += `${values.join(' or ')}`;
      } else {
        queryParam += `${filter.queryParam} eq '${value}'`;
      }
    }
  }

  return queryParam ? `(${queryParam})` : '';
};

const convertStateSwitchFilterToQueryParams = (filter: ListPageSwitchFilter, reducerFilters: any) => {
  const value = reducerFilters[filter.queryParam];
  const selections = [];

  for (const option of filter.options) {
    if (value?.[option.name]) {
      selections.push(option);
    }
  }

  if (selections.length) {
    switch (filter.querySerializationType) {
      case 'value':
        // For value serialization, use the option's value or name
        return `(${selections
          .map((option) => {
            const optionValue = option.value !== undefined ? option.value : option.name;
            return `${option.name} eq ${typeof optionValue === 'string' ? `'${optionValue}'` : optionValue}`;
          })
          .join(' or ')})`;
      case 'boolean':
      default:
        // Default "boolean" serialization (existing behavior)
        return `(${selections.map((option) => `${option.name} eq 'true'`).join(' or ')})`;
    }
  }

  return '';
};

export const convertStateFiltersToQueryParams = (filters: ListPageFilter[], reducerObject: any) => {
  const reducerFilters = reducerObject?.['filters'];

  if (!reducerFilters) {
    return '';
  }

  let filtersQueryString = '';

  for (const filter of filters) {
    // Check if filter is disabled
    const isDisabled =
      typeof filter.disabled === 'boolean' ? filter.disabled : filter.disabled && filter.disabled(reducerFilters);

    // Skip disabled filters
    if (isDisabled) {
      continue;
    }

    // Check if serializeToQuery is defined
    const shouldSerialize =
      typeof filter.serializeToQuery === 'function'
        ? filter.serializeToQuery(reducerFilters)
        : filter.serializeToQuery !== false;

    // Skip filters that should not be serialized to query
    if (!shouldSerialize) {
      continue;
    }

    let filterQueryString = '';

    switch (filter.type) {
      case ListPageFilterType.Checkbox:
        filterQueryString = convertStateCheckboxFilterToQueryParams(
          filter as ListPageCheckboxFilter<unknown>,
          reducerFilters,
        );
        break;

      case ListPageFilterType.Range:
      case ListPageFilterType.DateRange:
        filterQueryString = convertStateRangeFilterToQueryParams(filter, reducerFilters);
        break;

      case ListPageFilterType.Selector:
        filterQueryString = convertStateSelectorFilterToQueryParams(
          filter as ListPageSelectorFilter<unknown>,
          reducerFilters,
        );
        break;

      case ListPageFilterType.Radio:
        filterQueryString = convertStateRadioFilterToQueryParams(
          filter as ListPageRadioFilter<unknown>,
          reducerFilters,
        );
        break;

      case ListPageFilterType.Switch:
        filterQueryString = convertStateSwitchFilterToQueryParams(filter as ListPageSwitchFilter, reducerFilters);
        break;

      default:
        break;
    }

    if (filterQueryString) {
      if (filtersQueryString) {
        filtersQueryString += ' and ';
      }

      filtersQueryString += filterQueryString;
    }
  }

  return filtersQueryString;
};
