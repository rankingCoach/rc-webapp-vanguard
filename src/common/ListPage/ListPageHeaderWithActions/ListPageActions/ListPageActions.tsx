import React, { useEffect, useState } from 'react';
import styles from '../ListPageHeaderWithActions.module.scss';
import { ListPageProps } from '@common/ListPage/ListPage';
import { ListPageCheckboxGroup } from '@common/ListPage/ListPageCheckboxGroup/ListPageCheckboxGroup';
import { ListPageFilterType } from '@models/common/ListPageFilters/ListPageFilter';
import { ListPageCheckboxFilter } from '@models/common/ListPageFilters/ListPageCheckboxFilter';
import { useSelector } from 'react-redux';
import { ListPageSelectorFilter } from '@models/common/ListPageFilters/ListPageSelectorFilter';
import { ListPageSelector } from '@common/ListPage/ListPageSelector/ListPageSelector';
import { mt2 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { ListPageDateRangePicker } from '@common/ListPage/ListPageDateRangePicker/ListPageDateRangePicker';
import { useBindQueryParamToState } from '@custom-hooks/use-bind-query-param-to-state';
import { ListPageDateRangeFilter } from '@models/common/ListPageFilters/ListPageDateRangeFilter';
import { useAppDispatch } from '@custom-hooks/use-app-dispatch';
import { ListPageSwitchGroup } from '@common/ListPage/ListPageSwitchGroup/ListPageSwitchGroup';
import { ListPageSwitchFilter } from '@models/common/ListPageFilters/ListPageSwitchFilter';
import { ListPageRadioGroup } from '@common/ListPage/ListPageRadioGroup/ListPageRadioGroup';
import { ListPageRadioFilter } from '@models/common/ListPageFilters/ListPageRadioFilter';
import {
  useHandleAutomaticFilterRequests,
} from '@common/ListPage/ListPageHeaderWithActions/ListPageActions/custom-hooks/use-handle-automatic-filter-requests';
import { useDelayedLoading } from '@custom-hooks/useDelayedLoading';
import { convertStateFiltersToQueryParams } from '@custom-hooks/use-bind-query-param-to-redux-state.ts';
import { PageSection, PageSectionBackground } from '@vanguard/PageSection';
import { Render } from '@vanguard/Render';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button';
import { IconNames } from '@vanguard/Icon';
import { Collapse } from '@vanguard/Collapse';


export type ListPageActionsProps<T> = ListPageProps<T> & {
  testId?: string;
  skipSetFiltersModified?: boolean;
};

export const ListPageActions = <T, >(props: ListPageActionsProps<T>) => {
  const dispatch = useAppDispatch();
  const {
    testId,
    filters = { elements: [], automaticRequest: false },
    refreshFunction,
    reducer,
    slice,
    headerFiltersDisplayMode = 'button',
    headerFiltersBackground = PageSectionBackground.functionalBg,
    headerActionsCustomSection,
    headerBottomSection,
    headerHideShadow = false,
    title,
    headerShowBottomLine = false,
    skipSetFiltersModified = false,
  } = props;

  const [selectorFilter, setSelectorFilter] = useState<ListPageSelectorFilter<any>>();
  const [dateRangeFilter, setDateRangeFilter] = useState<ListPageDateRangeFilter>();

  const [showFilters, setShowFilters] = useBindQueryParamToState<boolean>('showFilters', false);

  const reducerValue = useSelector(reducer) as any;

  useHandleAutomaticFilterRequests(
    filters,
    () => {
      refreshFunction();
    },
    reducerValue,
  );

  const initialLoad = !!(reducerValue?.initialLoad ?? false);
  const filtersQuery = convertStateFiltersToQueryParams(filters.elements, reducerValue);
  const { setFiltersModified, setFilters } = slice;

  // Add the delayed loading state
  const isLoading = reducerValue?.itemsRequestLoading ?? false;
  const showLoading = useDelayedLoading(isLoading, 250);

  useEffect(() => {
    //selector

    const selectorFilter = filters.elements.find(
      ({ type }) => type === ListPageFilterType.Selector,
    ) as ListPageSelectorFilter<any>;

    if (selectorFilter) {
      setSelectorFilter(selectorFilter);
    }

    //date range
    const dateFilter = filters.elements.find(
      ({ type }) => type === ListPageFilterType.DateRange,
    ) as ListPageDateRangeFilter;

    if (dateFilter) {
      setDateRangeFilter(dateFilter);
    }
  }, [filters]);

  useEffect(() => {
    // If automatic request for data is off, the on page load, trigger an initial load.
    if (!filters.automaticRequest) {
      refreshFunction();
    }
  }, []);

  // Use the extracted hook for handling automatic filter requests

  useEffect(() => {
    if (filters.automaticRequest || initialLoad) {
      refreshFunction();
    } else {
      if (setFiltersModified) {
        dispatch(setFiltersModified(true));
      }
    }
  }, [filtersQuery]);

  const onApplyFilters = async () => {
    await refreshFunction();
    if (setFiltersModified) {
      dispatch(setFiltersModified(false));
    }
  };

  const onClearFilters = async () => {
    //TODO check how it behaves on different filters other than BOOLEAN
    const clonedFilters = JSON.parse(JSON.stringify(reducerValue.filters));

    Object.keys(clonedFilters).forEach((key) => {
      if (typeof clonedFilters[key] === 'object') {
        Object.keys(clonedFilters[key]).forEach((subKey) => {
          clonedFilters[key][subKey] = false;
        });
      } else {
        clonedFilters[key] = false;
      }
    });

    // Dispatch the updated filters to Redux
    dispatch(setFilters(clonedFilters));

    // Optionally reset filtersModified flag
    if (setFiltersModified) {
      dispatch(setFiltersModified(false));
    }

    // Optionally call a refresh function
    // await refreshFunction();
  };

  const filtersCheckboxGroup = () => {
    return filters.elements.map((filter, index: number) => {
      switch (filter.type) {
        case ListPageFilterType.Checkbox:
          return (
            <ListPageCheckboxGroup
              key={index}
              filter={filter as ListPageCheckboxFilter<unknown>}
              reducer={reducer}
              slice={slice}
              skipSetFiltersModified={skipSetFiltersModified}
            />
          );
        case ListPageFilterType.Switch:
          return (
            <ListPageSwitchGroup
              key={index}
              filter={filter as ListPageSwitchFilter}
              reducer={reducer}
              slice={slice}
              skipSetFiltersModified={skipSetFiltersModified}
            />
          );
        case ListPageFilterType.Radio:
          return (
            <ListPageRadioGroup
              key={index}
              filter={filter as ListPageRadioFilter}
              reducer={reducer}
              slice={slice}
              skipSetFiltersModified={skipSetFiltersModified}
            />
          );
        default:
          // TODOOOO throw error
          break;
      }
    });
  };

  /**
   * No Filters
   */
  if (!filters.elements.length || initialLoad) {
    return null;
  }

  /**
   * Return view
   * ---
   */
  return (
    <PageSection
      testId={testId ?? 'ListPage_Actions'}
      className={classNames(
        styles.container,
        title ? styles.noPaddingTop : undefined,
        headerHideShadow && headerShowBottomLine ? styles.line : undefined,
        headerHideShadow || headerFiltersBackground === PageSectionBackground.frostedGlass ? undefined : styles.shadow,
      )}
      background={headerFiltersBackground}
      noDefaultPadding={true}
    >
      <div className={styles.headerBottom}>
        <Render if={headerFiltersDisplayMode === 'checkbox'}>
          <div className={styles.checkboxesContainer}>{filtersCheckboxGroup()}</div>
        </Render>
        <div className={styles.filterSlot}>
          <Render if={headerFiltersDisplayMode === 'button'}>
            <Button
              type={ButtonTypes.muted}
              size={ButtonSizes.extraLarge}
              className={styles.showFilters}
              iconLeft={showFilters ? IconNames.close : IconNames.filter}
              onClick={() => {
                setShowFilters(!showFilters);
              }}
            >
              {showFilters ? 'Close filters' : 'Open filters'}
            </Button>
          </Render>
          <Render if={!!props?.slots?.filterSlot}>{props.slots?.filterSlot}</Render>
        </div>
        <Render if={!headerActionsCustomSection}>
          <ListPageDateRangePicker filter={dateRangeFilter} {...props} />
          <ListPageSelector filter={selectorFilter} {...props} />
        </Render>
        <Render if={!!headerActionsCustomSection}>{headerActionsCustomSection}</Render>
      </div>

      <Collapse isOpen={showFilters ?? false} className={styles.collapsedContainer}>
        <div className={classNames(styles.checkboxesContainer, styles.line)}>
          {filtersCheckboxGroup()}
          <div className={styles.actionBtns}>
            <Render if={!filters.automaticRequest}>
              <Button
                className={classNames(mt2)}
                onClick={onApplyFilters}
                isLoading={showLoading}
                disabled={!(reducerValue['filtersModified'] ?? false) || isLoading}
              >
                {'Apply filters'}
              </Button>
              <Render if={filters.clearFiltersBtn}>
                <Button
                  type={ButtonTypes.muted}
                  size={ButtonSizes.extraLarge}
                  className={classNames(mt2)}
                  iconLeft={IconNames.filter}
                  onClick={onClearFilters}
                >
                  {'Clear filters'}
                </Button>
              </Render>
            </Render>
          </div>
        </div>
      </Collapse>
      {headerBottomSection}
    </PageSection>
  );
};
