import { alignItemsCenter, dFlex, justifyContentCenter } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { SlideTransition } from '@vanguard/SlideTransition/SlideTransition';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

export interface OnboardingWelcomeAnimationProps {
  texts: string[];
  waitBetweenTexts?: number;
  textsSlideAnimationDuration?: number;
  textsFadeAnimationDuration?: number;
}

export const OnboardingWelcomeAnimation: React.FC<OnboardingWelcomeAnimationProps> = (props) => {
  const { textsSlideAnimationDuration, textsFadeAnimationDuration = 150, waitBetweenTexts, texts } = props;
  return (
    <div data-slot={'onboarding-welcome-animation'} className={classNames(dFlex, alignItemsCenter, justifyContentCenter)}>
      <SlideTransition waitBetweenComponents={waitBetweenTexts} duration={textsSlideAnimationDuration}>
        {texts.map((txt) => {
          return (
            <Text
              key={txt}
              type={TextTypes.heading1}
              fontWeight={FontWeights.bold}
              // textWrap={"no-wrap"}
              textAlign={'center'}
              animateWords={{ animation: 'fade-up', duration: textsFadeAnimationDuration, delay: 0 }}
            >
              {txt}
            </Text>
          );
        })}
      </SlideTransition>
    </div>
  );
};
