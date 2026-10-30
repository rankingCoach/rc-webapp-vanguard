import { alignItemsCenter, dFlex, pb1, pl1_5 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { IconNames } from '@vanguard/Icon/IconNames';
import { StyledSVG } from '@vanguard/StyledSVG/StyledSVG';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import Trigger from './images/trigger.svg';
import styles from './UpsellingTrigger.module.scss';

export interface UpsellingTriggerProps {
  productName: string;
  onclick: () => void;
}

export const UpsellingTrigger = (props: UpsellingTriggerProps) => {
  const { productName, onclick } = props;

  return (
    <ComponentContainer>
      <div className={classNames(dFlex, alignItemsCenter, styles.upsellingContainer)}>
        <div>
          <div className={classNames(pl1_5, pb1)}>
            <Text testId="title" type={TextTypes.text} fontWeight={FontWeights.bold}>
              Get more engagement and increase your budget
            </Text>
            <Text testId="description" replacements={{ productName: productName }} type={TextTypes.textHelp}>
              Increase your budget by upgrading to <b>%productName%</b>. With a higher budget, your ads will be
              displayed and clicked more often and you will get more visitors on your website.
            </Text>
          </div>
          <Button
            className={styles.upsellingButton}
            size={ButtonSizes.medium}
            type={ButtonTypes.default}
            iconRight={IconNames.caretLeft}
            onClick={onclick}
          >
            Learn more
          </Button>
        </div>
        <div>
          <StyledSVG width="128" height="128" src={Trigger} />
        </div>
      </div>
    </ComponentContainer>
  );
};
