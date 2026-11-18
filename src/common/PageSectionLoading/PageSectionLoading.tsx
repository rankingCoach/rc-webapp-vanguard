import { useDynamicImport } from '@custom-hooks/use-dynamic-import/use-dynamic-import';
import { classNames } from '@helpers/classNames';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './PageSectionLoading.module.scss';
import { PageSection, PageSectionWithoutTitle } from '@vanguard/PageSection';

type PageSectionLayoutProps = Partial<Omit<PageSectionWithoutTitle, 'title' | 'description'>>;

export type PageSectionLoadingProps = {
  title: string;
  description: string;
  imgSize?: 'small' | 'medium' | 'large';
  titleType?: 'heading-3' | 'heading-4' | 'text-intro' | 'text';
} & PageSectionLayoutProps;

export const PageSectionLoading = (props: PageSectionLoadingProps) => {
  const {
    testId = 'PageSectionLoading_Container',
    title,
    description,
    imgSize = 'large',
    titleType = 'text',
    ...pageSectionProps
  } = props;
  const { SvgIcon, loading, error } = useDynamicImport('gifs/loading.gif');

  // Declare imgClass variable outside the switch statement
  let imgClass: string = styles.imgLarge; // default class
  switch (imgSize) {
    case 'small':
      imgClass = styles.imgSmall;
      break;
    case 'medium':
      imgClass = styles.imgMedium;
      break;
    case 'large':
      imgClass = styles.imgLarge;
      break;
  }

  let titleTypeString: TextTypes = TextTypes.text; // default type
  switch (titleType) {
    case 'heading-3':
      titleTypeString = TextTypes.heading3;
      break;
    case 'heading-4':
      titleTypeString = TextTypes.heading4;
      break;
    case 'text-intro':
      titleTypeString = TextTypes.textIntro;
      break;
  }

  return (
    <PageSection testId={testId} {...pageSectionProps}>
      <div data-slot={'page-section-loading-content'} className={styles.container}>
        <img data-slot={'page-section-loading-image'} data-size={imgSize} className={classNames(imgClass)} src={SvgIcon} alt="loading..." />
        <Text type={titleTypeString} fontWeight={FontWeights.bold}>
          {title}
        </Text>
        <Text>{description}</Text>
      </div>
    </PageSection>
  );
};
