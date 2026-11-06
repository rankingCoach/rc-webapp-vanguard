import { fireEvent } from '@testing-library/react';

// Scope queries to a DatePicker field or its mobile dialog, never ordinary inputs.
export const serializedDateInput = (root: ParentNode): HTMLInputElement => {
  const input = root.querySelector<HTMLInputElement>('input[aria-hidden="true"]');
  if (!input) throw new Error('DatePicker serialization input missing');
  return input;
};
export const dateSection = (input: HTMLInputElement, index = 0): HTMLElement => {
  let sections = input.parentElement!.querySelectorAll<HTMLElement>('[role="spinbutton"]');
  if (!sections.length) {
    // Select-all temporarily moves editing to the list root and removes section roles.
    // Return to the first real section through MUI's public ArrowLeft action.
    const root = input.parentElement!.querySelector<HTMLElement>('[contenteditable="true"]');
    if (root) fireEvent.keyDown(root, { key: 'ArrowLeft' });
    sections = input.parentElement!.querySelectorAll<HTMLElement>('[role="spinbutton"]');
  }
  if (!sections[index]) throw new Error('DatePicker section missing');
  return sections[index];
};
export const pasteDate = (input: HTMLInputElement, value: string): void => {
  const section = dateSection(input);
  fireEvent.focus(section);
  fireEvent.paste(section, { clipboardData: { getData: () => value } });
};
export const navigateSeparator = (input: HTMLInputElement, key: string): void => {
  // Separators are presentation spans in v9. Cross the month/day boundary without deleting digits.
  const section = dateSection(input, key === '{Backspace}' ? 1 : 0);
  fireEvent.focus(section);
  fireEvent.keyDown(section, { key: key === '{Backspace}' ? 'ArrowLeft' : 'ArrowRight' });
};
export const selectedDateSection = (): string | undefined => window.getSelection()?.toString();
export const typePartialDate = (input: HTMLInputElement, digits: string): void => {
  const section = dateSection(input);
  fireEvent.focus(section);
  for (const digit of digits) {
    section.textContent = digit;
    fireEvent.input(section, { inputType: 'insertText', data: digit });
  }
};

export const clearDate = (input: HTMLInputElement): void => {
  const section = dateSection(input);
  fireEvent.focus(section);
  fireEvent.keyDown(section, { key: 'a', ctrlKey: true });
  const root = input.parentElement!.querySelector('[contenteditable="true"]')!;
  fireEvent.keyDown(root, { key: 'Delete' });
  fireEvent.keyDown(root, { key: 'ArrowLeft' });
  fireEvent.blur(root);
};
export const editDateSection = (input: HTMLInputElement, index: number, value: string): void => {
  const section = dateSection(input, index);
  fireEvent.focus(section);
  section.textContent = value;
  fireEvent.input(section, { inputType: 'insertText', data: value });
};
