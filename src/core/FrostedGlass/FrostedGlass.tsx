import { classNames } from '@helpers/classNames';
import { ComponentContainer, ComponentContainerProps } from '@vanguard/ComponentContainer/ComponentContainer';
import React from 'react';

import styles from './FrostedGlass.module.scss';

export type FrostedGlassProps = ComponentContainerProps;
export const FrostedGlass = (props: FrostedGlassProps) => {
  return <ComponentContainer data-slot={'frosted-glass'} {...props} className={classNames(styles.container, props.className)} />;
};
