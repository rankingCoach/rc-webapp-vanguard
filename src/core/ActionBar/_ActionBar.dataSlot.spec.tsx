import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { ActionBar } from './ActionBar';
import { ActionBarFooter } from './ActionBarTemplates/ActionBarFooter/ActionBarFooter';
import { ActionBarMessage } from './ActionBarTemplates/ActionBarMessage/ActionBarMessage';

const slot = (container: HTMLElement, name: string) => container.querySelector(`[data-slot="${name}"]`) as HTMLElement;

describe('ActionBar data-slot contract', () => {
  it('slots the existing elements', () => {
    const { container } = render(<div className={'react-container'}><ActionBar show={false} /><ActionBarMessage type={'info'} title={'Title'} description={'Description'} /><ActionBarFooter buttons={[]} /></div>);
    expect(slot(container, 'action-bar').tagName).toBe('DIV');
    expect(slot(container, 'action-bar-message').tagName).toBe('DIV');
    expect(slot(container, 'action-bar-message-info').tagName).toBe('DIV');
    expect(slot(container, 'action-bar-message-description').tagName).toBe('DIV');
    expect(slot(container, 'action-bar-footer').tagName).toBe('DIV');
  });
});
