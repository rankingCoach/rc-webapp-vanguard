import '@testing-library/jest-dom/vitest';

import { render, screen } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, test } from 'vitest';

import { Fade } from './Fade';

describe('Fade', () => {
  test('visible child while in', () => {
    render(
      <Fade in timeout={0}>
        <div data-testid="child">content</div>
      </Fade>,
    );
    expect(screen.getByTestId('child')).toHaveStyle({ opacity: '1' });
  });

  test('keeps the child mounted but hidden while out (refs survive)', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Fade in={false} timeout={0}>
        <div ref={ref} data-testid="child">
          content
        </div>
      </Fade>,
    );
    expect(screen.getByTestId('child')).toHaveStyle({ opacity: '0', visibility: 'hidden' });
    expect(ref.current).toBe(screen.getByTestId('child'));
  });

  test('unmountOnExit removes the child while out', () => {
    render(
      <Fade in={false} unmountOnExit>
        <div data-testid="child">content</div>
      </Fade>,
    );
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });
});
