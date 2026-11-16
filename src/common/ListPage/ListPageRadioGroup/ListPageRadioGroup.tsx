import React, {useEffect} from "react";
import styles from "./ListPageRadioGroup.module.scss";
import {useSelector} from "react-redux";
import {useAppDispatch} from "@custom-hooks/use-app-dispatch";
import {ListPageRadioFilter} from "@common/ListPage/ListPageFilters/ListPageRadioFilter";
import {mt2} from "@globalStyles";
import {classNames} from "@helpers/classNames";
import {useFilterDisabledState} from "@custom-hooks/useFilterDisabledState";
import {RadioData} from "@vanguard/RadioButton";
import {Render} from "@vanguard/Render";
import {RadioButtonGroup} from "@vanguard/RadioButtonGroup";

export interface ListPageRadioGroupProps<ValueType = string> {
  filter: ListPageRadioFilter<ValueType>;
  reducer?: any;
  slice?: any;
  skipSetFiltersModified?: boolean;
}

export const ListPageRadioGroup = <ValueType, >(props: ListPageRadioGroupProps<ValueType>) => {
  const {filter, reducer, slice, skipSetFiltersModified = false} = props;
  const {setByPath, setFiltersModified} = slice;
  const reducerValue = useSelector(reducer) as any;
  const filtersState = reducerValue?.["filters"];
  const isLoading = reducerValue?.["itemsRequestLoading"];
  const dispatch = useAppDispatch();

  const isDisabledInternal = useFilterDisabledState(filter.disabled, filtersState, isLoading);

  const handleFilterChange = (value: ValueType) => {
    // Determine the value to store based on serializeToQuery
    const valueToStore = typeof filter.serializeToQuery === "string" ? filter.serializeToQuery : value;

    // If serializeToQuery is not false, update the store
    if (filter.serializeToQuery !== false) {
      dispatch(setByPath({path: `filters.${filter.queryParam}`, value: valueToStore}));
    }

    // Set filters as modified when a radio option is selected
    if (setFiltersModified && !skipSetFiltersModified) {
      dispatch(setFiltersModified(true));
    }
  };

  // Apply initial selection when the component mounts
  useEffect(() => {
    // Only apply initial selection if:
    // 1. initialSelection is defined
    // 2. There's no existing value in the store
    // 3. serializeToQuery is not false
    if (
      filter.initialSelection !== undefined &&
      !reducerValue?.["filters"]?.[filter.queryParam] &&
      filter.serializeToQuery !== false
    ) {
      const valueToStore =
        typeof filter.serializeToQuery === "string" ? filter.serializeToQuery : filter.initialSelection;

      dispatch(setByPath({path: `filters.${filter.queryParam}`, value: valueToStore}));

      // Set filters as modified when initialSelection is applied
      if (setFiltersModified && !skipSetFiltersModified) {
        dispatch(setFiltersModified(true));
      }
    }
  }, [
    dispatch,
    filter.initialSelection,
    filter.queryParam,
    filter.serializeToQuery,
    reducerValue?.["filters"],
    setByPath,
    setFiltersModified,
    skipSetFiltersModified,
  ]);

  if (filter.hidden) {
    return null;
  }

  const radioOptions: Array<RadioData<ValueType>> = filter.options.map((option) => {
    const elemCount = option.elementsCount !== undefined ? ` (${option.elementsCount})` : "";

    return {
      value: option.value,
      labelText: option.labelText + elemCount,
      disabled: isDisabledInternal || option.elementsCount === 0 || option.disabled,
      replacements: option.replacements,
      infoText: option.infoText,
      children: option.children,
    };
  });

  const currentValue = reducerValue?.["filters"]?.[filter.queryParam] || filter.defaultValue;

  return (
    <Render if={!filter.hidden}>
      <div className={classNames(styles.radioGroupContainer, mt2)}>
        <RadioButtonGroup
          name={filter.queryParam}
          groupLabel={filter.name}
          options={radioOptions}
          value={currentValue}
          setRadioValueFn={handleFilterChange}
          direction="row"
        />
      </div>
    </Render>
  );
};
