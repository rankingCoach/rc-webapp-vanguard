import { StoryObj } from '@storybook/react';
import React from 'react';

import { GlobalStateComponent } from '../GlobalStateComponent';

export type Story = StoryObj<typeof GlobalStateComponent>;

export const demoTestId = 'GlobalStateComponent';

// The border radius is set on the wrapper itself: the state layers inherit it
export const demoCardStyle: React.CSSProperties = {
  width: 320,
  padding: 24,
  borderRadius: 8,
  backgroundColor: 'var(--fn-bg-surface)',
};

export const demoCardContent = (
  <>
    <strong>Business hours</strong>
    <p>Mon–Fri, 09:00–17:00</p>
    <button type="button">Edit</button>
  </>
);

/** Returns the element the browser hit-tests at the center of the given element. */
export const getTopElementAtCenterOf = (element: HTMLElement): Element | null => {
  const rect = element.getBoundingClientRect();
  return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
};
