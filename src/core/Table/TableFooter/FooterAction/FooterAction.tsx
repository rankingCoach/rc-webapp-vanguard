import { IconNames } from '@vanguard/Icon/IconNames';
import { CtaWithIcon, CtaWithIconProps } from '@vanguard/Table/common/CtaWithIcon/CtaWithIcon';
import { FontWeights, Text } from '@vanguard/Text/Text';
import React from 'react';

export interface FooterActionProps {
  label: string;
  icon: IconNames;
  position: CtaWithIconProps['position'];
  disabled?: boolean;
  onClick: () => void;
  /** The caller's own module classes, so every control keeps its existing class names. */
  className?: string;
}

/** Internal: the one renderer behind FooterPagination (Back / Next), FooterShowMore and FooterShowLess. */
export const FooterAction = ({ label, icon, position, disabled, onClick, className }: FooterActionProps) => (
  <CtaWithIcon disabled={disabled} onClick={onClick} className={className} icon={icon} position={position}>
    <Text fontWeight={FontWeights.medium} color={disabled ? 'var(--n300)' : 'var(--brand-color)'}>
      {label}
    </Text>
  </CtaWithIcon>
);
