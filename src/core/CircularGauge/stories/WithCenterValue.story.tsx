import React from 'react';

import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';

import { Story, testColors, testValues } from './_CircularGauge.default';

export const WithCenterValue: Story = {
  args: {
    value: testValues.rating,
    max: 5,
    color: testColors.amber,
    children: (
      <Text type={TextTypes.heading3} fontWeight={FontWeights.bold} translate={false}>
        {'4.6'}
      </Text>
    ),
  },
};
