import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, test } from 'vitest';

import { Popover } from './Popover';

describe('Popover component tests', () => {
  test('should render', async () => {
    render(
      <Popover message={'tooltip message'}>
        <button>{'trigger'}</button>
      </Popover>,
    );
  });
});
