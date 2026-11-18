import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './InvoiceAddress.module.scss';

export interface InvoiceAddressProps {
  invoiceCompanyName: string;
  formattedAddress: string;
  className?: string;
}

export const InvoiceAddress = (props: InvoiceAddressProps) => {
  const { invoiceCompanyName, formattedAddress, className } = props;

  return (
    <ComponentContainer data-slot={'invoice-address'} className={classNames(className, styles.invoiceAddress)}>
      <Text
        className={styles.name}
        testId={'name'}
        type={TextTypes.textHelp}
        fontWeight={FontWeights.bold}
        translate={false}
      >
        {invoiceCompanyName}
      </Text>
      <Text
        className={styles.address}
        testId={'address'}
        type={TextTypes.textHelp}
        fontWeight={FontWeights.regular}
        translate={false}
      >
        {formattedAddress}
      </Text>
    </ComponentContainer>
  );
};
