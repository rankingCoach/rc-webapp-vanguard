import React from 'react';
import styles from './ListPageSwitchGroup.module.scss';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@custom-hooks/use-app-dispatch';
import { ListPageSwitchFilter, ListPageSwitchFilterOption } from '@common/ListPage/ListPageFilters/ListPageSwitchFilter';
import { alignItemsCenter, dFlex, gap1_5, mr3, mt2, pl1 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { FontWeights, TextTypes, Text } from '@vanguard/Text';
import { Switch } from '@vanguard/Switch';
import { Render } from '@vanguard/Render';

export interface ListPageSwitchGroupProps {
  filter: ListPageSwitchFilter;
  reducer?: any;
  slice?: any;
  skipSetFiltersModified?: boolean;
}

export const ListPageSwitchGroup = (props: ListPageSwitchGroupProps) => {
  const { filter, reducer, slice, skipSetFiltersModified = false } = props;
  const { setByPath, setFiltersModified } = slice;
  const reducerValue = useSelector(reducer) as any;
  const dispatch = useAppDispatch();

  const handleFilterChanges = (option: ListPageSwitchFilterOption, value: boolean) => {
    dispatch(setByPath({ path: `filters.${filter.queryParam}.${option.name}`, value }));

    // Set filters as modified when a switch is toggled
    if (setFiltersModified && !skipSetFiltersModified) {
      dispatch(setFiltersModified(true));
    }
  };

  if (filter.hidden) {
    return null;
  }

  const isDisabledInternal =
    typeof filter.disabled === 'boolean'
      ? filter.disabled
      : filter.disabled && filter.disabled(reducerValue?.['filters']);

  return (
    <div className={classNames(styles.labelAndCheckboxes, mt2)}>
      <Text type={TextTypes.text} fontWeight={FontWeights.bold}>
        {filter.name}
      </Text>
      <div className={styles.checkboxes}>
        {filter.options.map((option, index: number) => {
          const value = reducerValue?.['filters']?.[filter.queryParam]?.[option.name];
          const isDisabled =
            isDisabledInternal || (option.elementsCount === 0 && !value) || reducerValue?.['itemsRequestLoading'];

          return (
            <Switch
              disabled={isDisabled}
              key={index}
              className={mr3}
              value={value}
              onChange={(e) => {
                handleFilterChanges(option, e.currentTarget.checked);
              }}
            >
              <div className={classNames(dFlex, alignItemsCenter, gap1_5, pl1)}>
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
            </Switch>
          );
        })}
      </div>
    </div>
  );
};
