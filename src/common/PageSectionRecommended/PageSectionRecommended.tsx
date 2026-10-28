import { PageSection, PageSectionBackground, PageSectionWithoutTitle } from '@vanguard/PageSection';
import { justifyContentCenter, mb2, mr4, mt3, mt4, pb2 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { Button, ButtonTypes, ButtonSizes } from '@vanguard/Button/Button';
import { IconNames } from '@vanguard/Icon/IconNames';
import { LottieAnimationLoader, LottieAnimationType } from '@vanguard/LottieAnimationLoader/LottieAnimationLoader';
import { StyledSVG } from '@vanguard/StyledSVG/StyledSVG';
import { FontWeights, Text, TextReplacements, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './PageSectionRecommended.module.scss';
import { RecommendationBadge } from './RecommendationBadge/RecommendationBadge';

type PageSectionLayoutProps = Partial<Omit<PageSectionWithoutTitle, 'title' | 'description' | 'replacements'>>;

export type RecommendationCardProps = {
  title?: string | string[];
  description?: string | string[];
  imageUrl?: LottieAnimationType | string;
  hasBadge?: boolean;
  badgeText?: string;
  buttonText?: string;
  onClick?: () => void;
  replacements?: TextReplacements;
} & PageSectionLayoutProps;

export const PageSectionRecommended = (props: RecommendationCardProps) => {
  const {
    testId = 'PageSectionRecommended',
    onClick,
    hasBadge = true,
    badgeText = 'Recommendation',
    imageUrl,
    description,
    buttonText,
    title,
    replacements,
    children,
    ...pageSectionProps
  } = props;

  return (
    <PageSection testId={testId} background={PageSectionBackground.frostedGlass} {...pageSectionProps}>
      {hasBadge && <RecommendationBadge testId={`${testId}_Badge`} title={badgeText} />}

      <div className={classNames(styles.container, hasBadge ? mt4 : undefined)}>
        {imageUrl !== undefined && (
          <div className={classNames(justifyContentCenter, mr4)} style={{ maxWidth: 204, minWidth: 204 }}>
            {typeof imageUrl === 'string' ? <StyledSVG src={imageUrl} /> : <LottieAnimationLoader src={imageUrl} />}
          </div>
        )}

        <div>
          {title && (
            <div className={classNames(mb2)}>
              {Array.isArray(title) ? (
                title?.map((textElement: string, index: number) => {
                  return (
                    <Text
                      key={textElement + index}
                      type={TextTypes.textIntro}
                      fontWeight={FontWeights.bold}
                      replacements={replacements}
                    >
                      {textElement}
                    </Text>
                  );
                })
              ) : (
                <Text
                  className={classNames(mb2)}
                  type={TextTypes.textIntro}
                  fontWeight={FontWeights.bold}
                  replacements={replacements}
                >
                  {title}
                </Text>
              )}
            </div>
          )}

          {description && Array.isArray(description) ? (
            description?.map((textElement: string, index: number) => {
              return (
                <Text key={textElement + index} className={classNames(pb2)} replacements={replacements}>
                  {textElement}
                </Text>
              );
            })
          ) : (
            <Text className={classNames(pb2)} replacements={replacements}>
              {description}
            </Text>
          )}

          {buttonText && (
            <Button
              size={ButtonSizes.extraLarge}
              testId={`${testId}_Button`}
              type={ButtonTypes.primary}
              iconRight={IconNames.arrowRight}
              onClick={onClick}
              replacements={replacements}
            >
              {buttonText}
            </Button>
          )}

          {children && <div className={mt3}>{children}</div>}
        </div>
      </div>
    </PageSection>
  );
};
