import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Matcher for an Autocomplete option's label, robust to the highlight markup
 * (`autosuggest-highlight`) splitting the text across multiple child <span>s.
 */
export const autocompleteOption = (text: string) => (_content: string, element: Element | null) =>
  element?.textContent === text && Array.from(element.children).every((child) => child.textContent !== text);

const getInputElement = (testId: string): HTMLInputElement => {
  const container = screen.getByTestId(testId);
  const input = within(container).queryByRole('combobox') ?? container.querySelector('input');

  if (!input) {
    throw new Error(`Could not find input element within container with testId: ${testId}`);
  }

  return input as HTMLInputElement;
};

export const writeInAutocomplete = async (testId: string, text: string): Promise<void> => {
  const input = getInputElement(testId);
  const user = userEvent.setup();

  await user.clear(input);
  if (text.length > 0) {
    await user.type(input, text);
  }
};

export const getAutocompleteValue = async (testId: string): Promise<string> => {
  return getInputElement(testId).value;
};
