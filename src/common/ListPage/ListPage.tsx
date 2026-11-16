import React, {useEffect, useRef} from "react";
import {mb3, pt2, textAlignCenter} from "@globalStyles";
import InfiniteScroll from "react-infinite-scroll-component";
import {classNames} from "@helpers/classNames";
import {ListPageEmpty} from "@common/ListPage/ListPageEmpty/ListPageEmpty";
import {ListPageFilters} from "@common/ListPage/ListPageFilters/ListPageFilters";
import {ListPageHeaderWithActions} from "@common/ListPage/ListPageHeaderWithActions/ListPageHeaderWithActions";
import {useScrollToTop} from "@helpers/scroll-to-top";
import {useAppDispatch} from "@custom-hooks/use-app-dispatch";
import {FontWeights, TextReplacements, TextTypes, Text} from "@vanguard/Text";
import {IconNames} from "@vanguard/Icon";
import {ComponentContainer} from "@vanguard/ComponentContainer";
import {AssetPreloader} from "@vanguard/AssetPreloader";
import {Render} from "@vanguard/Render";
import {PageSection, PageSectionBackground, PageSectionRoundedEdges} from "@vanguard/PageSection";
import {ListLoader} from "@vanguard/ListLoader";

type InfiniteLoaderProps = {
  dataLength: number;
  hasMore: boolean;
  endMessage?: React.ReactNode;
  refreshFunction: () => void;
  nextFunction: () => void;
};

export type ListPageCheckbox = {
  name: string;
  queryParam?: string;
  labelText: string;
  /**
   * Count of filters this can be sent from BE
   * */
  value?: number;
  queryValue?: string | number;
  replacements?: TextReplacements;
};

export type ListPageCheckboxes = {
  title: string;
  items: ListPageCheckbox[];
  reducerKey: string;
  queryParam: string;
};

export type ListPageProps<ItemType> = {
  testId?: string;
  title: string;
  scrollToTopOnLoad?: boolean;
  replacements?: TextReplacements;
  subTitle: string;
  filters?: ListPageFilters;
  items?: ItemType[];
  reducer?: any;
  slice?: any;
  emptyState?: boolean;
  emptyTitle?: React.ReactNode;
  emptySubtitle?: React.ReactNode;
  emptySvgIcon?: string;
  Card: React.ComponentType<{ item: ItemType }>; // Define the expected prop structure for Card
  headerAdditionalInformation?: React.ReactNode; // If no action is provided, show this additional information
  headerCustomSection?: React.ReactNode;
  headerActionsCustomSection?: React.ReactNode;
  headerBottomSection?: React.ReactNode;
  action?: {
    text: string;
    cta: () => void;
    iconLeft: IconNames;
    disabled?: boolean;
    loading?: boolean;
  };
  slots?: {
    filterSlot?: React.ReactNode;
    aboveListSection?: React.ReactNode;
  };
  headerFiltersDisplayMode?: "button" | "checkbox";
  headerFiltersBackground?: PageSectionBackground;
  headerHideShadow?: boolean;
  headerShowBottomLine?: boolean;
  showEndMessage?: boolean;
} & InfiniteLoaderProps;

/**
 * Component
 */
export const ListPage = <T, >(props: ListPageProps<T>) => {
  const {
    headerBottomSection,
    Card,
    testId,
    items,
    emptyState = false,
    dataLength,
    hasMore,
    refreshFunction,
    nextFunction,
    showEndMessage = true,
    scrollToTopOnLoad,
    slots,
    slice,
    ...rest
  } = props;

  const dispatch = useAppDispatch();
  const scrollToTopFn = useScrollToTop();
  const ref = useRef(null);

  useEffect(() => {
    if (ref && scrollToTopOnLoad) {
      // @ts-ignore //TODOADI FIX ME
      scrollToTopFn(ref);
    }
  }, [ref, scrollToTopOnLoad]);

  // Clear filters when leaving the page
  useEffect(() => {
    return () => {
      if (slice?.setByPath) {
        dispatch(slice.setByPath({path: "filters", value: {}}));
        dispatch(slice.setFiltersModified(false));
      }
    };
  }, [slice, dispatch]);
  /**
   * No data
   */
  if (emptyState) {
    return <ListPageEmpty {...props} />;
  }

  /**
   * Return view
   * ---
   */
  return (
    <ComponentContainer testId={testId ?? "ListPage_Container"} innerRef={ref}>
      <AssetPreloader icons={[IconNames.filter, IconNames.close]}/>
      <ListPageHeaderWithActions {...props} />

      <Render if={slots?.aboveListSection !== undefined}>
        <PageSection testId={"ListPage_AboveListSection"} background={PageSectionBackground.frostedGlass}
                     noDefaultPadding={true}>
          {slots?.aboveListSection}
        </PageSection>
      </Render>

      <PageSection
        testId={"ListPage_InfiniteScroll"}
        roundedEdges={PageSectionRoundedEdges.bottom}
        background={PageSectionBackground.frostedGlass}
      >
        <InfiniteScroll
          dataLength={dataLength} //This is important field to render the next data
          next={nextFunction}
          hasMore={hasMore}
          scrollThreshold={0.7}
          loader={<ListLoader/>}
          initialScrollY={0}
          endMessage={showEndMessage ? <EndMessage {...props} /> : undefined}
          refreshFunction={refreshFunction}
          style={{overflow: "visible"}} // Prevent scroll container issues
        >
          {items?.map((item, index: number) => {
            // Generate stable key: try item.id, then item.item.id (for EngagementItem), fallback to index
            const itemKey = (item as any)?.id || (item as any)?.item?.id || `item-${index}`;
            return (
              <div key={itemKey} className={mb3}>
                <Card item={item} {...rest} />
              </div>
            );
          })}
        </InfiniteScroll>
      </PageSection>
    </ComponentContainer>
  );
};

const EndMessage = <T, >(props: ListPageProps<T>) => {
  const {testId, endMessage} = props;
  return (
    <ComponentContainer testId={testId + "_EndMessage"} className={classNames(textAlignCenter, pt2)}>
      <Text type={TextTypes.textHelp} fontWeight={FontWeights.bold}>
        You’ve reached the end of the list.
      </Text>
      <Text type={TextTypes.textHelp} fontWeight={FontWeights.bold}>
        {endMessage}
      </Text>
    </ComponentContainer>
  );
};
