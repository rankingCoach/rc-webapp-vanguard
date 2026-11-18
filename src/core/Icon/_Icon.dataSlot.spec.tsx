import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Icon, IconSize } from './Icon';
import { IconNames } from './IconNames';

describe('Icon data-slot contract', () => {
  it('slots the span with the icon name and size', async () => {
    const { container, findByTestId, rerender } = render(<Icon testId={'ic'}>{IconNames.info}</Icon>);
    const span = await findByTestId('ic');
    expect(span.getAttribute('data-slot')).toBe('icon');
    expect(span.getAttribute('data-icon')).toBe(IconNames.info);
    expect(span.getAttribute('data-size')).toBe('small');
    rerender(
      <Icon testId={'ic'} type={IconSize.large}>
        {IconNames.info}
      </Icon>,
    );
    expect((await findByTestId('ic')).getAttribute('data-size')).toBe('large');
    expect(container.querySelectorAll('[data-slot="icon"]')).toHaveLength(1);
  });
});
