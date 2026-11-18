import { render } from '@test-utils/test-utils';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ComponentContainer, ComponentContainerProps } from './ComponentContainer';

describe('ComponentContainer data-* pass-through', () => {
  it('forwards data-slot and other data-* attributes to the div', () => {
    const { container } = render(
      <ComponentContainer className={'x'} data-slot={'alert-container'} data-variant={'info'} data-open={''}>
        child
      </ComponentContainer>,
    );
    const div = container.querySelector('div.x') as HTMLDivElement;
    expect(div.getAttribute('data-slot')).toBe('alert-container');
    expect(div.getAttribute('data-variant')).toBe('info');
    expect(div.hasAttribute('data-open')).toBe(true);
  });

  it('omits undefined data-* values', () => {
    const { container } = render(
      <ComponentContainer className={'x'} data-disabled={undefined}>
        child
      </ComponentContainer>,
    );
    expect((container.querySelector('div.x') as HTMLDivElement).hasAttribute('data-disabled')).toBe(false);
  });

  it('forwards nothing that is not data-*', () => {
    const props = {
      className: 'x',
      title: 'nope',
      'aria-hidden': true,
      tabIndex: 3,
    } as unknown as ComponentContainerProps;
    const { container } = render(<ComponentContainer {...props}>child</ComponentContainer>);
    const div = container.querySelector('div.x') as HTMLDivElement;
    expect(div.hasAttribute('title')).toBe(false);
    expect(div.hasAttribute('aria-hidden')).toBe(false);
    expect(div.hasAttribute('tabindex')).toBe(false);
  });

  it('ignores a directly passed data-testid, as before (testId owns it)', () => {
    const html = renderToStaticMarkup(
      <ComponentContainer className={'c'} data-testid={'direct'}>
        child
      </ComponentContainer>,
    );
    expect(html).toBe('<div class="c">child</div>');
    const withTestId = renderToStaticMarkup(
      <ComponentContainer className={'c'} testId={'own'} data-testid={'direct'}>
        child
      </ComponentContainer>,
    );
    expect(withTestId).toBe('<div data-testid="own" class="c">child</div>');
    const camel = renderToStaticMarkup(
      <ComponentContainer className={'c'} data-testId={'direct'}>
        child
      </ComponentContainer>,
    );
    expect(camel).toBe('<div class="c">child</div>');
  });

  it('maps boolean data-* values to the present-empty / absent contract', () => {
    const html = renderToStaticMarkup(
      <ComponentContainer className={'c'} data-open={true} data-disabled={false}>
        child
      </ComponentContainer>,
    );
    expect(html).toBe('<div class="c" data-open="">child</div>');
  });

  it('emits no default data-slot and renders the same markup as before for existing callers', () => {
    const html = renderToStaticMarkup(
      <ComponentContainer className={'c'} testId={'t'} id={'i'} role={'article'} style={{ color: 'red' }}>
        child
      </ComponentContainer>,
    );
    expect(html).toBe('<div role="article" id="i" data-testid="t" style="color:red" class="c">child</div>');
  });
});
