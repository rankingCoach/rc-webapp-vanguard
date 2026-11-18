import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { PageSectionLoading } from './PageSectionLoading';

vi.mock('@custom-hooks/use-dynamic-import/use-dynamic-import', () => ({
  useDynamicImport: () => ({ SvgIcon: 'loading.gif', loading: false, error: null }),
}));

describe('PageSectionLoading data-slot contract', () => {
  it('slots owned content and tracks the image size class on the image', () => {
    const props = {
      title: 'Your insights will arrive soon',
      description: 'They will show your visibility score, top-ranking keywords, and how your business performs compared to competitors.',
    };
    const { container, rerender } = render(<PageSectionLoading {...props} />);
    const content = container.querySelector('[data-slot="page-section-loading-content"]');
    const image = () => container.querySelector('[data-slot="page-section-loading-image"]');
    expect(content?.tagName).toBe('DIV');
    expect(content?.textContent).toContain(props.title);
    expect(content?.textContent).toContain(props.description);
    expect(image()?.tagName).toBe('IMG');
    expect(image()?.getAttribute('data-size')).toBe('large');
    rerender(<PageSectionLoading {...props} imgSize={'small'} />);
    expect(image()?.getAttribute('data-size')).toBe('small');
    rerender(<PageSectionLoading {...props} imgSize={'medium'} />);
    expect(image()?.getAttribute('data-size')).toBe('medium');
  });
});
