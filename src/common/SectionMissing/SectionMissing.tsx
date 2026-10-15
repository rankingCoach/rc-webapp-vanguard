import './SectionMissing.scss';

import { mb3, mt3 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { IconNames } from '@vanguard/Icon/IconNames';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

interface Props {
  title: string;
  description?: string | string[];
  buttonText: string;
  buttonCallback: () => void;
  className?: string;
  testId?: string;
}

export const SectionMissing = (props: Props) => {
  const { title, description, buttonText, buttonCallback, className, testId } = props;
  return (
    <ComponentContainer testId={testId} className={`BusinessProfileSectionMissing-container ${className}`}>
      <Text type={TextTypes.textIntro} color={'--w900'} fontWeight={FontWeights.medium} className={mb3}>
        {title}
      </Text>

      {description &&
        (Array.isArray(description) ? (
          description.map((text, index) => {
            return (
              <Text type={TextTypes.text} key={index}>
                {text}
              </Text>
            );
          })
        ) : (
          <Text type={TextTypes.text}>{description}</Text>
        ))}

      <Button
        className={classNames(mt3)}
        type={ButtonTypes.muted}
        size={ButtonSizes.medium}
        iconLeft={IconNames.add}
        onClick={buttonCallback}
      >
        {buttonText}
      </Button>
    </ComponentContainer>
  );
};
