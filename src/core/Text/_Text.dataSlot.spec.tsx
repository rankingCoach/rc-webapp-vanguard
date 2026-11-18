import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Text, TextTypes } from './Text';

describe('Text data-slot contract', () => {
  it.each([
    [TextTypes.text, 'SPAN'],
    [TextTypes.textCaption, 'SPAN'],
    [TextTypes.heading2, 'H2'],
    [TextTypes.display1, 'H1'],
  ])('type %s renders %s with data-slot="text" and data-type', (type, tag) => {
    const { getByTestId } = render(
      <Text type={type} testId={'t'} translate={false}>
        Hello
      </Text>,
    );
    const el = getByTestId('t');
    expect(el.tagName).toBe(tag);
    expect(el.getAttribute('data-slot')).toBe('text');
    expect(el.getAttribute('data-type')).toBe(type);
  });

  it('defaults data-type to text and tracks the type prop', () => {
    const { getByTestId, rerender } = render(
      <Text testId={'t'} translate={false}>
        x
      </Text>,
    );
    expect(getByTestId('t').getAttribute('data-type')).toBe('text');
    rerender(
      <Text testId={'t'} type={TextTypes.textHelp} translate={false}>
        x
      </Text>,
    );
    expect(getByTestId('t').getAttribute('data-type')).toBe('text-help');
  });

  it('caller-supplied data-slot and data-type win', () => {
    const { getByTestId } = render(
      <Text testId={'t'} translate={false} data-slot={'card-title'} data-type={'custom'}>
        x
      </Text>,
    );
    expect(getByTestId('t').getAttribute('data-slot')).toBe('card-title');
    expect(getByTestId('t').getAttribute('data-type')).toBe('custom');
  });
});
