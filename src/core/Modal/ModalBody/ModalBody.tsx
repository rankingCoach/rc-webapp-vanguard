import './ModalBody.scss';

import { classNames } from '@helpers/classNames';
import React, { MutableRefObject } from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  padding?: number | string;
  bgColor?: string;
  mode?: 'fill';
  innerRef?: MutableRefObject<HTMLDivElement | null>;
}

export const ModalBody = (props: Props) => {
  const { padding, className, bgColor, innerRef, mode } = props;
  let extraProps = {};

  if (mode === 'fill') {
    extraProps = {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      flex: 1,
    };
  }

  return (
    <div
      ref={innerRef}
      data-slot={'modal-body'}
      data-mode={mode}
      className={classNames('modal-body', className)}
      style={{
        padding: padding !== undefined ? padding : '',
        backgroundColor: bgColor ?? '',
        ...extraProps,
      }}
    >
      {props.children}
    </div>
  );
};
