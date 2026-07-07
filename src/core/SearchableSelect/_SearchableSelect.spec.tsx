import { SelectOptionProp } from '@vanguard/Select/Select';
import { render } from '@test-utils/test-utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, test } from 'vitest';

import { SearchableSelect } from './SearchableSelect';

const makeOptions = (titles: string[]): SelectOptionProp[] =>
  titles.map((title, index) => ({ key: index, value: title, title }));

const openSelect = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('combobox'));
};

describe('SearchableSelect component tests', () => {
  test('shows the item count footer once options reach the display-count threshold', async () => {
    const options = makeOptions([
      'grenierbrasserie.com',
      'marvel.com',
      'vertigo-imprint.com',
      'image.com',
      'Option5',
      'Option6',
    ]);
    render(<SearchableSelect options={options} />);
    await openSelect();

    const footer = await screen.findByTestId('search-selector-footer-menu');
    expect(footer.textContent).toBe(`${options.length} elements`);
  });

  test('shows the in-menu search input once options reach the search-bar threshold', async () => {
    const options = makeOptions([
      'grenierbrasserie.com',
      'marvel.com',
      'vertigo-imprint.com',
      'image.com',
      'Option5',
      'Option6',
      'Option7',
      'Option8',
      'Option9',
      'Option10',
      'Option11',
    ]);
    render(<SearchableSelect options={options} />);
    await openSelect();

    await screen.findByTestId('search-select-input-search');
  });

  test('renders the selected option title as the closed value', async () => {
    const options = makeOptions(['grenierbrasserie.com', 'marvel.com', 'vertigo-imprint.com']);
    render(<SearchableSelect options={options} value={'marvel.com'} />);

    const ZERO_WIDTH_SPACE = String.fromCharCode(8203);
    const input = await screen.findByTestId('vanguard-searchable-select-input');
    expect(input.textContent?.split(ZERO_WIDTH_SPACE).join('').trim()).toBe('marvel.com');
  });
});
