import './TagList.scss';

import { gap0_5, gap1 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import React from 'react';

import { ComponentContainer } from '../ComponentContainer/ComponentContainer';
import { Tag, TagProps, TagVariant } from './Tag/Tag';

interface Props {
  tags?: TagProps[];
  className?: string;
  /** `chip-filled`: the small filled chip (24px, muted fill, 12px medium text, not uppercase). */
  variant?: TagVariant;
}

export const TagList = (props: Props) => {
  const { tags, className, variant = 'tag' } = props;

  return (
    <ComponentContainer
      className={classNames(`TagList-container ${className ?? ''} ${variant === 'tag' ? gap1 : gap0_5}`)}
    >
      {tags &&
        tags.length &&
        tags.map((tag) => {
          return <Tag {...tag} variant={variant} key={tag.id} />;
        })}
    </ComponentContainer>
  );
};
