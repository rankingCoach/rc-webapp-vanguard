import { TextIcon } from '@common/TextIcon/TextIcon';
import { dFlex, gap8, mb2, mt1 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { AnimatedConditional } from '@vanguard/AnimatedConditional/AnimatedConditional';
import { Button, ButtonSizes } from '@vanguard/Button/Button';
import { IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Render } from '@vanguard/Render/Render';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React, { useState } from 'react';

import styles from './RecommendationCard.module.scss';

export interface RecommendationCardProps {
  title: string;
  description: string;
  svgIcon?: any;
  details?: React.ReactNode;
  ctaIcon?: IconNames;
  ctaText?: string;
  ctaOnClick?: () => void;
}

export const RecommendationCard = (props: RecommendationCardProps) => {
  const { title, description, details, svgIcon, ctaText, ctaIcon, ctaOnClick } = props;

  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  return (
    <div className={classNames(styles.recommendationCard)}>
      {showDetails ? (
        details
      ) : (
        <div className={classNames(dFlex, gap8)}>
          <div>
            <div className={classNames(styles.recommendationBadge, mb2)}>
              <TextIcon
                iconSize={IconSize.small}
                icon={IconNames.rec}
                verticalAlign={'center'}
                textType={TextTypes.textHelp}
                fontWeight={FontWeights.medium}
                textTight={true}
                iconColor={'--a1-500'}
              >
                Recommended
              </TextIcon>
            </div>

            <Text type={TextTypes.textIntro} fontWeight={FontWeights.bold}>
              {title}
            </Text>
            <Text color={'--fn-fg-light'} className={classNames(mt1, mb2)}>
              {description}
            </Text>

            <AnimatedConditional condition={!!ctaText}>
              <Button size={ButtonSizes.extraLarge} onClick={ctaOnClick} iconRight={ctaIcon}>
                {ctaText}
              </Button>
            </AnimatedConditional>
          </div>

          <img src={svgIcon} className={classNames(styles.cardIllustration)} />
        </div>
      )}

      <Render if={!!details}>
        <div className={styles.learnMoreButton} onClick={toggleDetails}>
          <TextIcon
            icon={showDetails ? IconNames.visibilityOff : IconNames.visibility}
            textColor="--n000"
            iconColor="--n000"
          >
            {showDetails ? 'Close' : 'Learn more'}
          </TextIcon>
        </div>
      </Render>
    </div>
  );
};
