import { appScreen, fireEvent, render } from '@test-utils/test-utils';
import { Button } from '@vanguard/Button/Button';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

const getButton = () => appScreen.getByTestId('html-type-btn_button') as HTMLButtonElement;

describe('Vanguard button htmlType', () => {
  it('sets the native type attribute from htmlType', async () => {
    await render(
      <Button testId={'html-type-btn'} htmlType="button">
        Go
      </Button>,
    );
    expect(getButton().getAttribute('type')).toBe('button');
  });

  it('renders no type attribute when htmlType is omitted', async () => {
    await render(<Button testId={'html-type-btn'}>Go</Button>);
    expect(getButton().hasAttribute('type')).toBe(false);
  });

  it('does not submit an enclosing form with htmlType="button"', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    await render(
      <form onSubmit={onSubmit}>
        <Button testId={'html-type-btn'} htmlType="button">
          Go
        </Button>
      </form>,
    );
    fireEvent.click(getButton());
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
