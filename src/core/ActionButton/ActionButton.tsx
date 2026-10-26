import { Button, ButtonProps, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { IconNames } from '@vanguard/Icon/IconNames';
import { FontWeights, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './ActionButton.module.scss';

export type ActionButtonProps = {
  icon?: IconNames;
} & ButtonProps;

export const ActionButton = (props: ActionButtonProps) => {
  const { testId, disabled, icon, ...rest } = props;

  return (
    <Button
      testId={`${testId}_Button`}
      className={styles.cta}
      iconLeft={icon ?? IconNames.add}
      iconLargeOnHover={true}
      iconColor={disabled ? '--n300' : '--p400'}
      iconFillColor={'--p100'}
      iconHasCircle={true}
      type={ButtonTypes.default}
      size={props.type === ButtonTypes.muted ? ButtonSizes.medium : ButtonSizes.extraLarge}
      textType={TextTypes.text}
      fontWeight={FontWeights.regular}
      textWrap={'no-wrap'}
      hoverColor={'--p400'}
      color={'--n700'}
      onClick={() => {}}
      disabled={disabled}
      {...rest}
    />
  );
};
