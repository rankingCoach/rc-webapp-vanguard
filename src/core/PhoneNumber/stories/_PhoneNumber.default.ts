import { StoryObj } from '@storybook/react';
import { CountryCode } from 'libphonenumber-js';

import { PhoneNumber } from '../PhoneNumber';

export type Story = StoryObj<typeof PhoneNumber>;

export const testPhoneNumbers = {
  romanian: '0724336642',
  american: '5551234567',
  british: '07123456789',
  indian: '9876543210',
  nigerian: '8021234567',
  japanese: '0312345678',
  israeli: '501234567',
} as const;

export const testCountryCodes = {
  RO: 'RO' as CountryCode,
  US: 'US' as CountryCode,
  GB: 'GB' as CountryCode,
  IN: 'IN' as CountryCode,
  NG: 'NG' as CountryCode,
  JP: 'JP' as CountryCode,
  IL: 'IL' as CountryCode,
} as const;
