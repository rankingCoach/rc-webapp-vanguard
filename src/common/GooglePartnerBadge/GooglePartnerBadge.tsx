import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import React from 'react';

interface Props {}

export const GooglePartnerBadge = (props: Props) => {
  const imageSrc = 'https://www.gstatic.com/partners/badge/images/2023/PartnerBadgeClickable.svg';
  const anchorLink = 'https://www.google.com/partners/agency?id=2194615496';

  return (
    <ComponentContainer data-slot={'google-partner-badge'} testId={'googlePartnerComponentContainer'}>
      <a data-slot={'google-partner-badge-link'} data-testid={'googlePartnerAnchor'} href={anchorLink} target={'_blank'} rel="noreferrer">
        <img data-slot={'google-partner-badge-image'} data-testid={'googlePartnerImage'} src={imageSrc} />
      </a>
    </ComponentContainer>
  );
};
