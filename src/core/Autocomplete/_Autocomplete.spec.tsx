import { autocompleteOption, getAutocompleteValue, writeInAutocomplete } from '@test-utils/autocomplete-test-utils';
import { Autocomplete } from '@vanguard/Autocomplete/Autocomplete';
import React from 'react';
import { describe, expect, test } from 'vitest';

import { appScreen, render } from '../../../test-utils/test-utils';

describe('Autocomplete test suite', () => {
  test('should render', () => {
    render(<Autocomplete testId={'test-ac'} label={'test-ac'} options={[]} />);
    appScreen.getByTestId('test-ac-input');
  });

  test('should retain value', async () => {
    render(<Autocomplete testId={'test-ac'} label={'test-ac'} options={[]} />);
    await writeInAutocomplete('test-ac', 'test-value');
    const value = await getAutocompleteValue('test-ac');
    expect(value).toBe('test-value');
  });

  test('should render text options', async () => {
    render(<Autocomplete testId={'test-ac'} label={'test-ac'} options={['aaa', 'bbb', 'ccc']} />);
    await writeInAutocomplete('test-ac', 'a');
    appScreen.getByText(autocompleteOption('aaa'));
  });
});
