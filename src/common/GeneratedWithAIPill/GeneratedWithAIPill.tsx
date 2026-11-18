import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Icon } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './GeneratedWithAIPill.module.scss';

export type GeneratedWithAIPillProps = {
  text?: string;
  testId?: string;
};

export const GeneratedWithAIPill = (props: GeneratedWithAIPillProps) => {
  const { text, testId } = props;

  return (
    <ComponentContainer data-slot={'generated-with-ai-pill'} testId={testId} className={styles.aiPill}>
      <Icon color="var(--a1-500)">{IconNames.ai}</Icon>
      <Text type={TextTypes.textHelp} color="var(--a1-500)">
        {text ?? 'Found by us'}
      </Text>
    </ComponentContainer>
  );
};
