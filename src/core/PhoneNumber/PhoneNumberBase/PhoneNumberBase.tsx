import { FormConfigElement } from '@custom-hooks/useFormConfig.ts';
import { PhoneMask, phoneMasks } from '@helpers/phone-utils/phone-masks';
import {
  InputBase,
  InputCounterProps,
  InputEventsProps,
  InputFormConfigProps,
  InputLabelProps,
  InputValueProps,
} from '@vanguard/_internal/InputBase/InputBase';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { CountryCode } from 'libphonenumber-js';
import React, { useEffect, useState } from 'react';

import { PhoneNumberIMask } from '../PhoneNumberIMask/PhoneNumberIMask';

export type PhoneNumberBaseProps = {
  className?: string;
  testId?: string;
  type?: 'text' | 'number' | 'email';
  countryCode?: CountryCode;
  formConfig?: FormConfigElement;
} & InputValueProps &
  InputCounterProps &
  InputLabelProps &
  InputEventsProps &
  InputFormConfigProps;

export const PhoneNumberBase = (props: PhoneNumberBaseProps) => {
  const { className, type = 'text', testId, formConfig, countryCode } = props;

  const [phoneConfig, setPhoneConfig] = useState<PhoneMask>();
  const [phoneMask, setPhoneMask] = useState<string>();

  useEffect(() => {
    const config = phoneMasks.find((m) => m.iso === countryCode);

    if (!config) {
      setPhoneConfig(undefined);
      setPhoneMask(undefined);

      return;
    }

    setPhoneConfig(config);
    setPhoneMask(config.mask.replaceAll('#', '0'));
  }, [countryCode]);

  return (
    <ComponentContainer className={className}>
      <InputBase
        fieldConfig={formConfig}
        testId={testId}
        type={type}
        {...props}
        textFieldProps={{
          InputProps: {
            inputComponent: PhoneNumberIMask as any,
          },
          inputProps: {
            phoneMask,
          },
        }}
        className={undefined}
      />
    </ComponentContainer>
  );
};
