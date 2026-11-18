import { appScreen, render } from '@test-utils/test-utils';
import React from 'react';

import { ImgLoader } from './ImgLoader';

import { describe, test, expect } from 'vitest';
describe('ImgLoader component tests', () => {
  test('should render title and descrption', async () => {
    render(<ImgLoader description={'This is description'} title={'This is title'} />);

    const description = 'This is description';
    const title = 'This is title';

    const descriptionEl = await appScreen.findByTestId('description');
    const titleEl = await appScreen.findByTestId('title');
    expect(descriptionEl.innerHTML).toBe(description);
    expect(titleEl.innerHTML).toBe(title);
  });
});
