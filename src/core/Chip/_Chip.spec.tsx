import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import { Chip } from './Chip';

describe('Chip', () => {
  test('renders a ReactNode label', () => {
    render(<Chip label={<strong>Purpose</strong>} size="small" />);
    expect(screen.getByTestId('chip')).toHaveTextContent('Purpose');
  });

  test('onDelete renders a delete icon and fires on click', () => {
    const onDelete = vi.fn();
    render(<Chip label="Tag" onDelete={onDelete} />);
    fireEvent.click(screen.getByTestId('CancelIcon'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  test('accepts an Autocomplete getItemProps spread', () => {
    const onDelete = vi.fn();
    const itemProps = { className: 'from-autocomplete', 'data-item-index': 0, tabIndex: -1, disabled: true, onDelete };
    render(<Chip {...itemProps} label="Bundle" testId="bundle-chip" />);
    const chip = screen.getByTestId('bundle-chip');
    expect(chip).toHaveClass('from-autocomplete');
    expect(chip).toHaveClass('Mui-disabled');
    expect(chip).toHaveAttribute('data-item-index', '0');
  });

  test('onClick makes the chip a button', () => {
    const onClick = vi.fn();
    render(<Chip label="Click" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Click' }));
    expect(onClick).toHaveBeenCalled();
  });
});
