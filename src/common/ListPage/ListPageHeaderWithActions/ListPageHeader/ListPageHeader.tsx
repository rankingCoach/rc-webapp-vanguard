import React from 'react';
import styles from '../ListPageHeaderWithActions.module.scss';
import { ListPageProps } from '@common/ListPage/ListPage';
import { classNames } from '@helpers/classNames';
import { mb3 } from '@globalStyles';
import { useSelector } from 'react-redux';
import { PageSection, PageSectionRoundedEdges, PageSectionBackground } from '@vanguard/PageSection';
import { HeaderTypes } from '@vanguard/Header';
import { Button, ButtonSizes } from '@vanguard/Button';
import { Render } from '@vanguard/Render';
import { AnimatedConditional } from '@vanguard/AnimatedConditional';

export type ListPageHeaderProps<T> = ListPageProps<T> & {
  testId?: string;
};

export const ListPageHeader = <T, >(props: ListPageHeaderProps<T>) => {
  const {
    testId,
    title,
    subTitle,
    action,
    reducer,
    headerAdditionalInformation,
    headerCustomSection,
    headerHideShadow = false,
    headerFiltersBackground,
    replacements,
  } = props;

  const reducerValue = useSelector(reducer) as any;
  const initialLoad = !!(reducerValue?.initialLoad ?? false);

  /**
   * No Title
   */
  if (!title) {
    return null;
  }

  /**
   * Return view
   * ---
   */
  return (
    <PageSection
      testId={testId ?? 'ListPage_Header'}
      className={classNames(
        styles.container,
        headerHideShadow || headerFiltersBackground === PageSectionBackground.functionalBg ? undefined : styles.shadow,
      )}
      noDefaultPadding={true}
      roundedEdges={PageSectionRoundedEdges.top}
      title={title}
      headerType={HeaderTypes.pageHeader}
      replacements={replacements}
      description={subTitle}
      headerActionArea={
        action ? (
          <Button
            size={ButtonSizes.extraLarge}
            icon={action?.iconLeft}
            iconPosition={'left'}
            onClick={action?.cta}
            isLoading={action?.loading}
            disabled={action?.disabled}
          >
            {action?.text}
          </Button>
        ) : (
          headerAdditionalInformation
        )
      }
    >
      <Render if={!initialLoad}>
        <AnimatedConditional condition={!!headerCustomSection}>
          <div className={classNames(mb3)}>{headerCustomSection}</div>
        </AnimatedConditional>
      </Render>
    </PageSection>
  );
};
