import { render } from '@test-utils/test-utils';
import React from 'react';

import { DragAndDropFile } from './DragAndDropFile';

import { describe, test } from 'vitest';
describe('DragAndDropFile component tests', () => {
  test('should render', async () => {
    render(<DragAndDropFile onFileDrop={() => {}} />);
  });
});
