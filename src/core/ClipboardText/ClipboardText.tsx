import { Icon } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { snackbarService } from '@vanguard/SnackbarRoot/SnackBarService';
import { FontWeights, Text } from '@vanguard/Text/Text';
import React from 'react';

import styles from './ClipboardText.module.scss';

export interface ClipboardTextProps {
  label: string;
  value: string;
}

export const ClipboardText = (props: ClipboardTextProps) => {
  const { label, value } = props;
  return (
    <div data-slot="clipboard-text" className={styles.copyGroup}>
      <div
        data-slot="clipboard-text-copy"
        className={styles.copy}
        onClick={() => {
          navigator.clipboard.writeText(props.value);
          snackbarService.openSuccessSnackbar('Copied to clipboard');
        }}
      >
        <Icon color={'--n700'}>{IconNames.duplicate}</Icon>
      </div>
      <div data-slot="clipboard-text-content">
        <Text textTight={true} color={'--n400'}>
          {props.label}
        </Text>
        <Text textTight={true} fontWeight={FontWeights.medium} translate={false}>
          {props.value ?? ' '}
        </Text>
      </div>
    </div>
  );
};
