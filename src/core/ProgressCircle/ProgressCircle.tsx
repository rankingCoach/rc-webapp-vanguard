import { classNames } from '@helpers/classNames';
import { parseCssVariable } from '@helpers/css-variables-parser';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './ProgressCircle.module.scss';

export interface ProgressCircleProps {
  size: number;
  progress: number;
  color?: string;
  className?: string;
}

export const ProgressCircle = (props: ProgressCircleProps) => {
  const { progress, className } = props;
  let { size, color } = props;
  size = size > 100 ? 100 : size < 1 ? 1 : size;
  color = parseCssVariable(color ?? '--s400');
  const stroke = size * 0.1;
  const radius = (size - stroke) / 2;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const diameter = 2 * radius;

  return (
    <ComponentContainer
      data-slot={'progress-circle'}
      className={classNames(styles.progressCircleContainer, className)}
      style={{ width: diameter, height: diameter }}
    >
      <svg data-slot={'progress-circle-svg'} height={diameter} width={diameter} className={styles.progressCircleSvg}>
        <circle
          data-slot={'progress-circle-track'}
          fill={'transparent'}
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          stroke={'var(--n200)'}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          data-slot={'progress-circle-value'}
          className={styles.progressCircleValue}
          fill={'transparent'}
          strokeWidth={stroke}
          stroke={color}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div data-slot={'progress-circle-label'} className={styles.progress}>
        <Text type={TextTypes.textIntro} fontWeight={FontWeights.bold} translate={false}>
          {progress}
        </Text>
        <Text type={TextTypes.textHelp} fontSize={14} translate={false}>
          {'%'}
        </Text>
      </div>
    </ComponentContainer>
  );
};
