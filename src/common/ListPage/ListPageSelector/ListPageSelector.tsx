import React, { useEffect, useState } from 'react';
import styles from './ListPageSelector.module.scss';
import { useAppDispatch } from '@custom-hooks/use-app-dispatch';
import { useSelector } from 'react-redux';
import { ListPageSelectorFilter } from '@common/ListPage/ListPageFilters/ListPageSelectorFilter';
import { Select, SelectOnChange, SelectOptionProp } from '@vanguard/Select';

export interface ListPageSelectorProps {
  filter?: ListPageSelectorFilter<any>;
  reducer?: any;
  slice?: any;
}

export const ListPageSelector = (props: ListPageSelectorProps) => {
  const { filter, reducer, slice } = props;
  const { setByPath } = slice;
  const dispatch = useAppDispatch();
  const reducerValue = useSelector(reducer) as any;

  const [value, setValue] = useState<string>('');

  const handleSelectorChange: SelectOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!filter) return;
    const newVal = event.target.value;
    setValue(newVal);
    dispatch(
      setByPath({
        path: `filters.${filter.queryParam}`,
        value: newVal,
      }),
    );
  };

  useEffect(() => {
    if (!filter) return;

    const storeValue = reducerValue.filters?.[filter.queryParam] ?? '';
    if (!storeValue && filter.options.length > 0) {
      const defaultVal = filter.options[0].value;
      setValue(defaultVal);
      dispatch(
        setByPath({
          path: `filters.${filter.queryParam}`,
          value: defaultVal,
        }),
      );
    } else {
      setValue(storeValue);
    }
  }, [filter, reducerValue.filters]);

  if (!filter) {
    return null;
  }

  const mappedOptions: SelectOptionProp[] = filter.options.map((opt, i) => ({
    key: i,
    title: opt.title,
    value: opt.value,
  }));

  return (
    <div className={styles.selector} key={value}>
      <Select
        onChange={handleSelectorChange}
        options={mappedOptions}
        value={value}
        required={true}
        label={filter?.name}
        labelType={'outer'}
        disabled={reducerValue?.['itemsRequestLoading']}
      />
    </div>
  );
};
