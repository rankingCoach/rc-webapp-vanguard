import { DataAttributes, pickDataAttributes } from '@helpers/data-attributes';
import React, { MouseEventHandler, MutableRefObject } from 'react';

export interface ComponentContainerProps extends DataAttributes {
  children: React.ReactNode;
  className?: string;
  innerRef?: MutableRefObject<HTMLDivElement | null> | ((node?: Element | null | undefined) => void);
  onClick?: MouseEventHandler<Element>;
  style?: React.CSSProperties;
  testId?: string;
  id?: string;
  // TODO Add more roles here as needed!
  role?: 'article';
}

export const ComponentContainer = (props: ComponentContainerProps) => {
  const { children, className, onClick, innerRef, style, testId, id } = props;
  return (
    <div
      role={props.role}
      id={id}
      data-testid={testId}
      ref={innerRef}
      style={style}
      onClick={onClick}
      className={className}
      {...pickDataAttributes(props)}
    >
      {children}
    </div>
  );
};
