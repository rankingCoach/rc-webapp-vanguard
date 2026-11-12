import '@testing-library/jest-dom/vitest';

import { render, screen } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, test } from 'vitest';

import { FocusTrap } from './FocusTrap';

const Dialog = (props: { isEnabled?: () => boolean }) => (
  <div>
    <button type="button">outside</button>
    <FocusTrap open isEnabled={props.isEnabled}>
      <div role="dialog" aria-label="trap" tabIndex={-1}>
        <button type="button">inside</button>
      </div>
    </FocusTrap>
  </div>
);

describe('FocusTrap', () => {
  test('moves focus into the trapped element when opened', () => {
    render(<Dialog />);
    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  test('pulls focus back when it escapes while enabled', async () => {
    render(<Dialog isEnabled={() => true} />);
    screen.getByRole('button', { name: 'outside' }).focus();
    // MUI re-checks on focusin and on an interval; the focusin path is synchronous.
    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
  });

  test('does not pull focus back while isEnabled returns false', () => {
    render(<Dialog isEnabled={() => false} />);
    const outside = screen.getByRole('button', { name: 'outside' });
    outside.focus();
    expect(outside).toHaveFocus();
  });
});
