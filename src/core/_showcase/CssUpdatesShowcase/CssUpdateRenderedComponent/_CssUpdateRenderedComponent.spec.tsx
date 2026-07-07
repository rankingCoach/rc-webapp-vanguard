import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { cssUpdateRecords } from '../data';
import { CssUpdateRenderedComponent } from './CssUpdateRenderedComponent';

describe('CssUpdateRenderedComponent', () => {
  test('renders a preview surface for every CSS update record', () => {
    for (const record of cssUpdateRecords) {
      const { container, unmount } = render(<CssUpdateRenderedComponent record={record} />);

      try {
        expect(container.firstElementChild).toBeTruthy();

        if (record.storyId) {
          const iframe = screen.getByTestId('css-update-story-iframe');
          expect(iframe.getAttribute('src')).toBe(
            `iframe.html?id=${encodeURIComponent(record.storyId)}&viewMode=story&singleStory=true`,
          );
        } else {
          expect(screen.getByTestId('css-update-fallback').textContent).toContain(record.path);
        }
      } catch (error) {
        throw new Error(`Failed to render CSS update preview for ${record.path}: ${(error as Error).message}`);
      } finally {
        unmount();
      }
    }
  });

  test('uses the Select story iframe from Storybook', () => {
    const record = cssUpdateRecords.find(({ path }) => path === 'src/core/Select/Select.module.scss');

    expect(record?.storyId).toBe('select-select--select-story');

    render(<CssUpdateRenderedComponent record={record!} />);

    expect(screen.getByTestId('css-update-story-iframe').getAttribute('src')).toBe(
      'iframe.html?id=select-select--select-story&viewMode=story&singleStory=true',
    );
  });
});
