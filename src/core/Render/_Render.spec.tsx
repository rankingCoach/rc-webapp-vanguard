import '@testing-library/jest-dom/vitest';
import { render, screen } from '@test-utils/test-utils';
import { Render } from '@vanguard/Render/Render';
import React from 'react';

import { describe, test, expect } from 'vitest';
describe('Render component tests', () => {
  test('should be empty', async () => {
    render(
      <div data-testid={'container'}>
        <Render if={false}>
          <div data-testid={'children'}>children</div>
        </Render>
      </div>,
    );

    const googlePartnerBadgeElement = await screen.findByTestId('container');
    expect(googlePartnerBadgeElement).toBeEmptyDOMElement();
  });

  test('should have children', async () => {
    render(
      <div data-testid={'container'}>
        <Render if={true}>
          <div data-testid={'children'}>children</div>
        </Render>
      </div>,
    );

    await screen.findByTestId('container');
    await screen.findByTestId('children');
  });
});
