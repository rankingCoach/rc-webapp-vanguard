import React from 'react';

import { OwnCollapse } from './own-collapse';

type Props = {
  isOpen: boolean;
  orientation?: 'vertical' | 'horizontal';
  children: React.ReactNode;
  className?: string;
};

export const Collapse = (props: Props) => {
  const { isOpen, children, className, orientation } = props;

  return (
    <OwnCollapse in={isOpen} className={className} orientation={orientation}>
      {children}
    </OwnCollapse>
  );
};
