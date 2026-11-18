import { dataFlag } from '@helpers/data-attributes';
import { classNames } from '@helpers/classNames';
import { Icon } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './ActionCardAction.module.scss';

export type ActionCardActionProps = {
  width?: number;
  label: string;
  cta: () => void;
  iconLeft?: IconNames;
  iconRight?: IconNames;
  disabled?: boolean;
  loading?: boolean;
  testId?: string;
  textWrap?: 'wrap' | 'no-wrap';
  type?: 'primary' | 'secondary'; // Primary actions will be displayed on the bottom of the AcionCard, while the secondary ones will be collapsed in a Dropdown menu in the top-right corner
};
const parseTestId = (testId?: string, addedTestId?: string) => {
  if (!testId && !addedTestId) {
    return '';
  }
  if (!testId) {
    return addedTestId;
  }
  if (!addedTestId) {
    return testId;
  }

  return `${testId}_${addedTestId}`;
};
const RenderIcon = (props: {
  name?: IconNames;
  shouldRender?: boolean;
  opts?: {
    spin?: boolean;
    testId: string;
    parentTestId?: string;
  };
}) => {
  const { opts, name, shouldRender = true } = props;
  if (!name) return null;
  if (!shouldRender) return null;
  return (
    <Icon testId={parseTestId(opts?.parentTestId, opts?.testId)} spin={opts?.spin ?? false}>
      {name}
    </Icon>
  );
};
export const ActionCardAction = (props: ActionCardActionProps) => {
  const { width = 100, label, iconLeft, iconRight, cta, disabled, testId, textWrap = 'wrap', loading } = props || {};

  // const renderIcon = (
  //   name?: IconNames,
  //   opts?: {
  //     spin?: boolean;
  //     testId: string;
  //   },
  // ) => {
  //   if (!name) return;
  //   return (
  //
  //   );
  // };
  return (
    <div
      data-slot={'action-card-action'}
      data-disabled={dataFlag(disabled)}
      data-loading={dataFlag(loading)}
      data-testid={testId}
      style={{ width: `${width}%` }}
      onClick={() => {
        if (cta && typeof cta === 'function') {
          cta();
        }
      }}
      className={classNames(styles.action, disabled ? styles.actionDisabled : '')}
    >
      <RenderIcon name={iconLeft} opts={{ testId: 'iconLeft', parentTestId: testId }} />
      <Text type={TextTypes.textHelp} textWrap={textWrap}>
        {label}
      </Text>
      <RenderIcon shouldRender={!loading} name={iconRight} opts={{ testId: 'iconRight', parentTestId: testId }} />
      {loading && (
        <div
          data-slot={'action-card-action-loader'}
          role={'spinbutton'}
          data-testid={parseTestId('loadingSpinner')}
          className={classNames(loading ? styles.loaderSpinner : '')}
        />
      )}
    </div>
  );
};
