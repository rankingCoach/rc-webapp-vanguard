import { useDynamicImport } from '@custom-hooks/use-dynamic-import/use-dynamic-import';
import { alignItemsCenter, alignItemsStart, dFlex, justifyContentBetween } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Icon } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Render } from '@vanguard/Render/Render';
import { Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './OpportunityCard.module.scss';

export interface OpportunityCardProps {
  svg: 'directories' | 'notifications' | 'reports' | 'seo';
  title: string;
  subtitle: string | string[];
  onClick: () => void;
}

export const OpportunityCard = (props: OpportunityCardProps) => {
  const { svg, subtitle, title, onClick } = props;
  const { SvgIcon } = useDynamicImport(`seo/domainFlow/${svg}.svg`);

  return (
    <ComponentContainer data-slot={'opportunity-card'} className={styles.container} onClick={onClick}>
      <img data-slot={'opportunity-card-image'} src={SvgIcon} height={175} width={300} alt={''} />

      <div data-slot={'opportunity-card-content'} className={styles.textBox}>
        <div data-slot={'opportunity-card-header'} className={classNames(dFlex, alignItemsCenter, justifyContentBetween)}>
          <Text>{title}</Text>
          <Icon className={styles.arrow}>{IconNames.arrowRight}</Icon>
        </div>
        <Render if={!!subtitle}>
          {Array.isArray(subtitle) ? (
            subtitle.map((text, index) => (
              <div data-slot={'opportunity-card-subtitle'} key={index} className={classNames(dFlex, alignItemsStart, justifyContentBetween)}>
                <Text type={TextTypes.textHelp}>{text}</Text>
                <Icon>{IconNames.arrowRight}</Icon>
              </div>
            ))
          ) : (
            <Text type={TextTypes.textHelp}>{subtitle}</Text>
          )}
        </Render>
      </div>
    </ComponentContainer>
  );
};
