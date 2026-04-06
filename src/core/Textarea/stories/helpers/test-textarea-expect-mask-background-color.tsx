import { expectElementValueToBeCssVar } from '@test-utils/expect-element-style-to-be-ccs-var';
import { within } from 'storybook/test';

export const testTextareaExpectMaskBackgroundColor = async (canvasElement: HTMLElement, color: string, url: string) => {
  const urlElement = await within(canvasElement).findByText(url);
  await expectElementValueToBeCssVar(urlElement, 'background-color', color);
};
