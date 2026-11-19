import './Divider.scss';

import { classNames } from '@helpers/classNames';
import React from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Divider = (props: Props) => {
  const { className = '', ...rest } = props;
  return <div data-slot={'divider'} className={classNames('rc-divider', className)} {...rest} />;
};
