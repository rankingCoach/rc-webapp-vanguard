import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { IconNames } from '../Icon/IconNames';
import { NotificationAction as Nested } from '../Notification/NotificationAction/NotificationAction';
import { NotificationAction as Standalone } from './NotificationAction';

/** Audit item 1: src/core/NotificationAction was a byte-identical copy; it now re-exports the root-exported one. */
describe('NotificationAction standalone path', () => {
  it('is the same component as the nested, root-exported one', () => {
    expect(Standalone).toBe(Nested);
  });

  it.each([
    [{ label: 'Reply', cb: () => {} }],
    [{ label: 'Open', cb: () => {}, width: 50 }],
    [{ label: 'Share', cb: () => {}, iconLeft: IconNames.newTab }],
    [{ label: 'Next', cb: () => {}, iconRight: IconNames.newTab, width: 33 }],
  ])('renders the same markup for %o', (props) => {
    expect(renderToStaticMarkup(<Standalone {...props} />)).toBe(renderToStaticMarkup(<Nested {...props} />));
  });
});
