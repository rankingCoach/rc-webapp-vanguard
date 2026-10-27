import React from 'react';
import styles from './ListPageEmpty.module.scss';
import { useDynamicImport } from '@custom-hooks/use-dynamic-import/use-dynamic-import';
import { ListPageProps } from '@common/ListPage/ListPage';
import { PageSection, PageSectionRoundedEdges } from '@vanguard/PageSection';
import { HeaderTypes } from '@vanguard/Header';
import { Button, ButtonSizes } from '@vanguard/Button';
import { Render } from '@vanguard/Render';
import { Text, FontWeights, TextTypes } from '@vanguard/Text';
import { classNames } from '@helpers/classNames';

export type ListPageEmptyProps<T> = ListPageProps<T>;

export const ListPageEmpty = <T, >(props: ListPageEmptyProps<T>) => {
  const { emptyTitle, emptySubtitle, testId, title, subTitle, action, emptySvgIcon } = props;
  const { SvgIcon } = useDynamicImport(`placeholders/ufo.svg`);

  /**
   * Validate props
   */
  if (!emptyTitle && !emptySubtitle) {
    console.error('EngagementListPageEmpty: emptyTitle or emptySubtitle is required');
    return null;
  }

  /**
   * Return view
   */
  return (
    <PageSection
      testId={testId + '_Empty'}
      className={styles.header}
      roundedEdges={PageSectionRoundedEdges.both}
      title={title}
      headerType={HeaderTypes.pageHeader}
      description={subTitle}
      headerActionArea={
        action && (
          <Button
            size={ButtonSizes.extraLarge}
            iconPosition={'left'}
            icon={action?.iconLeft}
            onClick={action?.cta}
            isLoading={action?.loading}
            disabled={action?.disabled}
          >
            {action?.text}
          </Button>
        )
      }
    >
      <div className={styles.container}>
        <img
          className={classNames(emptySvgIcon ? undefined : styles.img)}
          src={emptySvgIcon ? emptySvgIcon : SvgIcon}
          alt="loading..."
        />
        <Render if={typeof emptyTitle === 'string'}>
          <Text type={TextTypes.textIntro} fontWeight={FontWeights.bold}>
            {emptyTitle}
          </Text>
        </Render>
        <Render if={typeof emptyTitle !== 'string'}>{emptyTitle}</Render>
        <Render if={typeof emptySubtitle === 'string'}>
          <Text>{emptySubtitle}</Text>
        </Render>
        <Render if={typeof emptySubtitle !== 'string'}>{emptySubtitle}</Render>
      </div>
    </PageSection>
  );
};
