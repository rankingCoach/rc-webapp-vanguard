import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Link } from '@vanguard/Link/Link';
import { Render } from '@vanguard/Render/Render';
import { FontWeights, LinkReplacements, Text, TextReplacements, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './IncentiveBox.module.scss';

export interface IncentiveBoxProps {
  icon: IconNames;
  text: string;
  buttonText?: string;
  hasButton: boolean;
  onClickBtn?: () => void;
  replacements?: TextReplacements;
  linkReplacements?: LinkReplacements;
}

export const IncentiveBox = (props: IncentiveBoxProps) => {
  const { icon, text, buttonText, hasButton, onClickBtn, replacements, linkReplacements } = props;
  return (
    <ComponentContainer data-slot={'incentive-box-container'}>
      <div data-slot={'incentive-box'} className={styles.incentiveContainer}>
        <div>
          <Icon className={styles.icon} hasCircle={true} fillColor={'--p100'} color={'--p500'} type={IconSize.small}>
            {icon}
          </Icon>
        </div>

        <div data-slot={'incentive-box-content'} className={styles.textAndCta}>
          <Text
            replacements={replacements}
            testId="text"
            type={TextTypes.textHelp}
            textTight={true}
            links={linkReplacements}
          >
            {text}
          </Text>

          <Render if={hasButton}>
            <Link
              iconName={IconNames.caretLeft}
              newTabIcon={true}
              onClick={onClickBtn}
              type={TextTypes.textHelp}
              fontWeight={FontWeights.medium}
            >
              {buttonText}
            </Link>
          </Render>
        </div>
      </div>
    </ComponentContainer>
  );
};
