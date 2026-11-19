import { render } from '@test-utils/test-utils';
import { Text } from '@vanguard/Text/Text';
import React from 'react';

import { ElementsBeforeAfter } from './ElementsBeforeAfter';

import { describe, test } from 'vitest';
describe('ElementsBeforeAfter component tests', () => {
  test('should render', async () => {
    render(
      <ElementsBeforeAfter>
        {[
          <Text key={1}>1</Text>,
          <Text key={2}>2</Text>,
          <Text key={3}>3</Text>,
          <Text key={4}>4</Text>,
          <Text key={5}>5</Text>,
          <Text key={6}>6</Text>,
        ]}
      </ElementsBeforeAfter>,
    );
  });
});
