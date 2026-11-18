import { Accordion } from '@vanguard/Accordion/Accordion';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { IconSize } from '@vanguard/Icon/Icon';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

export interface ExpandableItemProps {
  summary?: string;
  details?: string | React.ReactNode;
  centerSummary?: boolean;
  centerDetails?: boolean;
}

export const ExpandableItem = (props: ExpandableItemProps) => {
  const { summary, details, centerSummary, centerDetails } = props;

  const summaryCustomStyle = centerSummary
    ? { justifyContent: 'center', gap: '8px' }
    : { justifyContent: 'flex-start', gap: '8px' };
  const detailsCustomStyle = centerDetails
    ? { marginLeft: '0px', marginBottom: '0px', textAlign: 'center' }
    : { marginLeft: '0px', marginBottom: '0px' };

  return (
    <ComponentContainer data-slot={'expandable-item'}>
      <Accordion
        variant={'outlined'}
        summaryCustomStyle={summaryCustomStyle}
        baseCustomStyle={{ borderBottom: 'none', marginBottom: '0px', maxWidth: '100%' }}
        detailsCustomStyle={detailsCustomStyle}
        accordionId={'expandable-item'}
        disableGutters={true}
        iconSize={IconSize.small}
        summaryChildren={
          <Text type={TextTypes.textHelp} fontWeight={FontWeights.medium}>
            {summary}
          </Text>
        }
        detailsChildren={
          typeof details === 'string' ? <Text type={TextTypes.textHelp}>{details}</Text> : <> {details} </>
        }
      />
    </ComponentContainer>
  );
};
