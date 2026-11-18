import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { ModalBody } from './ModalBody/ModalBody';
import { ModalFooter } from './ModalFooter/ModalFooter';
import { ModalHeader } from './Modalheader/ModalHeader';

const slot = (c: HTMLElement, s: string) => c.querySelector(`[data-slot="${s}"]`) as HTMLElement | null;

describe('ModalHeader / ModalBody / ModalFooter data-slot contract', () => {
  it('ModalHeader: root with the consumer className + data-type, title and icon parts', () => {
    const { container, rerender } = render(<ModalHeader title={'T'} className={'mine'} type={'danger'} />);
    expect(slot(container, 'modal-header')?.classList.contains('mine')).toBe(true);
    expect(slot(container, 'modal-header')?.getAttribute('data-type')).toBe('danger');
    expect(slot(container, 'modal-header-title')?.classList.contains('modal-header-title-container')).toBe(true);
    expect(slot(container, 'modal-header-icon')?.classList.contains('modal-header-icon-container')).toBe(true);
    rerender(<ModalHeader title={'T'} />);
    expect(slot(container, 'modal-header')?.getAttribute('data-type')).toBe('default');
  });

  it('ModalBody: root with the consumer className, data-mode tracks mode', () => {
    const { container, rerender } = render(<ModalBody className={'mine'}>x</ModalBody>);
    expect(slot(container, 'modal-body')?.classList.contains('mine')).toBe(true);
    expect(slot(container, 'modal-body')?.hasAttribute('data-mode')).toBe(false);
    rerender(<ModalBody mode={'fill'}>x</ModalBody>);
    expect(slot(container, 'modal-body')?.getAttribute('data-mode')).toBe('fill');
  });

  it('ModalFooter: root with the consumer className, buttons part with data-position', () => {
    const { container, rerender } = render(
      <ModalFooter className={'mine'} positive={{ text: 'OK', cta: () => {} }} buttonsPosition={'center'} />,
    );
    expect(slot(container, 'modal-footer')?.classList.contains('mine')).toBe(true);
    expect(slot(container, 'modal-footer-buttons')?.getAttribute('data-position')).toBe('center');
    rerender(<ModalFooter positive={{ text: 'OK', cta: () => {} }} />);
    expect(slot(container, 'modal-footer-buttons')?.getAttribute('data-position')).toBe('end');
    rerender(<ModalFooter>custom</ModalFooter>);
    expect(slot(container, 'modal-footer-buttons')).toBeNull();
  });
});
