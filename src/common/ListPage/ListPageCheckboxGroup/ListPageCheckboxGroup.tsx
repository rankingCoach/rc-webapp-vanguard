import React from 'react';
import styles from './ListPageCheckboxGroup.module.scss';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@custom-hooks/use-app-dispatch';
import { alignItemsCenter, dFlex, gap1_5, mr3, mt2 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import {
  ListPageCheckboxFilter,
  ListPageCheckboxFilterOption,
} from '@common/ListPage/ListPageFilters/ListPageCheckboxFilter';
import { useFilterDisabledState } from '@custom-hooks/useFilterDisabledState';
import { FontWeights, TextTypes, Text } from '@vanguard/Text';
import { CheckBox } from '@vanguard/CheckBox';
import { Render } from '@vanguard/Render';

export interface ListPageCheckboxGroupProps<T> {
  filter: ListPageCheckboxFilter<T>;
  reducer?: any;
  slice?: any;
  skipSetFiltersModified?: boolean;
}

export const ListPageCheckboxGroup = <T, >(props: ListPageCheckboxGroupProps<T>) => {
  const { filter, reducer, slice, skipSetFiltersModified = false } = props;
  const { setByPath, setFiltersModified } = slice;
  const reducerValue = useSelector(reducer) as any;
  const dispatch = useAppDispatch();
  const filtersState = reducerValue?.['filters'];
  const isLoading = reducerValue?.['itemsRequestLoading'];

  const isDisabledInternal = useFilterDisabledState(filter.disabled, filtersState, isLoading);

  const handleFilterChanges = (option: ListPageCheckboxFilterOption<T>, value: boolean) => {
    dispatch(setByPath({ path: `filters.${filter.queryParam}.${option.name}`, value }));

    // Set filters as modified when a checkbox is toggled
    if (setFiltersModified && !skipSetFiltersModified) {
      dispatch(setFiltersModified(true));
    }
  };

  if (filter.hidden) {
    return null;
  }

  return (
    <div className={classNames(styles.labelAndCheckboxes, mt2)}>
      <Text type={TextTypes.text} fontWeight={FontWeights.bold}>
        {filter.name}
      </Text>
      <div className={styles.checkboxes}>
        {filter.options.map((option, index: number) => {
          // Get the stored value from Redux state
          const stateValue = filtersState?.[filter.queryParam]?.[option.name];

          // Determine checked state: prioritize option.checked property if defined
          let isChecked = stateValue;

          // If option has a checked property, use it to determine the checked state
          if (option.checked !== undefined) {
            isChecked = typeof option.checked === 'boolean' ? option.checked : option.checked(filtersState);
          }

          // Check if the individual option is disabled
          const isOptionDisabled =
            typeof option.disabled === 'boolean' ? option.disabled : option.disabled && option.disabled(filtersState);

          const isDisabled = isDisabledInternal || isOptionDisabled || (option.elementsCount === 0 && !isChecked);
          const isHidden =
            typeof option.hidden === 'boolean' ? option.hidden : option.hidden && option.hidden(filtersState);

          if (isHidden) {
            return null;
          }

          return (
            <CheckBox
              disabled={isDisabled}
              key={index}
              className={mr3}
              checked={isChecked}
              onChange={(e) => {
                handleFilterChanges(option, e.currentTarget.checked);
              }}
              label={
                <div className={classNames(dFlex, alignItemsCenter, gap1_5)}>
                  <Text
                    color={'--n500'}
                    textTight={true}
                    replacements={option.replacements}
                    context={option.translationContext ?? 'one'}
                  >
                    {option.labelText}
                  </Text>
                  <Render if={option.elementsCount !== undefined}>
                    <Text color={'--n600'} type={TextTypes.textCaption} className={styles.checkbox} translate={false}>
                      {option.elementsCount}
                    </Text>
                  </Render>
                </div>
              }
            />
          );
        })}
      </div>
    </div>
  );
};
