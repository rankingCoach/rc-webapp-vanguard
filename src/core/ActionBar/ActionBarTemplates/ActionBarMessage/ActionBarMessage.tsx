import { Button, ButtonProps, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Render } from '@vanguard/Render/Render';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './ActionBarMessage.module.scss';

export type ActionBarMessageProps = {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  description?: string;
  button?: {
    text: string;
    onClick: () => void;
    props?: ButtonProps;
  };
};

/**
 * Component
 */
export const ActionBarMessage = (props: ActionBarMessageProps) => {
  const { type, title, description, button } = props;
  return (
    <ComponentContainer testId={'ActionBarMessage_Container'} className={styles.container}>
      <div className={styles.infoBox}>
        <div>
          <ActionBarMessageIcon type={type} />
        </div>

        <div>
          <Render if={!!title}>
            <Text type={TextTypes.text} fontWeight={FontWeights.medium}>
              {title}
            </Text>
          </Render>

          <Render if={!!description}>
            <div className={styles.description}>
              <Text type={TextTypes.textHelp}>{description}</Text>
            </div>
          </Render>
        </div>
      </div>

      <Render if={!!button}>
        <Button
          iconRight={IconNames.arrowRight}
          size={button?.props?.type === ButtonTypes.muted ? ButtonSizes.medium : ButtonSizes.extraLarge}
          onClick={button?.onClick}
          {...button?.props}
        >
          {button?.text}
        </Button>
      </Render>
    </ComponentContainer>
  );
};

/**
 * Icon Component
 */
const ActionBarMessageIcon = (props: Pick<ActionBarMessageProps, 'type'>) => {
  const { type } = props;

  if (type === 'info') {
    return (
      <Icon type={IconSize.small} hasCircle={true} fillColor={'--p100'} color={'--p500'}>
        {IconNames.info}
      </Icon>
    );
  }

  if (type === 'success') {
    return (
      <Icon type={IconSize.small} hasCircle={true} fillColor={'--s100'} color={'--s500'}>
        {IconNames.check}
      </Icon>
    );
  }

  if (type === 'warning') {
    return (
      <Icon type={IconSize.large} hasCircle={false} fillColor={'--w100'} color={'--w500'}>
        {IconNames.warning}
      </Icon>
    );
  }

  if (type === 'error') {
    return (
      <Icon type={IconSize.small} hasCircle={true} fillColor={'--e100'} color={'--e500'}>
        {IconNames.exclamation}
      </Icon>
    );
  }

  console.error('ERROR | ActionBarMessageIcon | Unhandled type: ', type);
  return null;
};
