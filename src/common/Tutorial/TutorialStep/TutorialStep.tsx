import {
  alignItemsCenter,
  dFlexColumn,
  dFlexColumnReverse,
  gap3,
  gap4,
  justifyContentCenter,
  pb8,
  pt3,
  pt4,
} from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { AnimatedConditional } from '@vanguard/AnimatedConditional/AnimatedConditional';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { FontWeights, LinkReplacements, Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

const PreviewSectionRender = (component: TutorialStepProps['component']) => {
    return (
      <div className={classNames(dFlexColumn, alignItemsCenter, justifyContentCenter, gap4)}>
        {component && <div className={classNames(pt4, pb8)}>{component}</div>}
      </div>
    );
  };

const DetailsSectionRender = (description: TutorialStepProps['description'], description2: TutorialStepProps['description2'], descriptionLinks: TutorialStepProps['descriptionLinks']) => {
    return (
      <div>
        <Text textAlign={'center'}>{description}</Text>
        <AnimatedConditional condition={!!description2}>
          <Text className={classNames(pt3)} textAlign={'center'} links={descriptionLinks}>
            {description2}
          </Text>
        </AnimatedConditional>
      </div>
    );
  };


export interface TutorialStepProps {
  title: string;
  description: string;
  description2?: string;
  descriptionOnTop?: boolean;
  descriptionLinks?: LinkReplacements;
  component?: React.ReactNode;
}

export const TutorialStep = (props: TutorialStepProps) => {
  const { title, description, description2, descriptionOnTop, descriptionLinks, component } = props;

  const DetailsSection = DetailsSectionRender.bind(null, description, description2, descriptionLinks);

  const PreviewSection = PreviewSectionRender.bind(null, component);

  return (
    <ComponentContainer className={classNames(dFlexColumn, alignItemsCenter, justifyContentCenter, gap3)}>
      <Text textAlign={'center'} type={TextTypes.heading4} fontWeight={FontWeights.bold}>
        {title}
      </Text>
      <div
        className={classNames(
          descriptionOnTop ? dFlexColumnReverse : dFlexColumn,
          alignItemsCenter,
          justifyContentCenter,
          gap3,
        )}
      >
        {<PreviewSection />}
        {<DetailsSection />}
      </div>
    </ComponentContainer>
  );
};
