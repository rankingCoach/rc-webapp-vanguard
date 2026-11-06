import { appScreen, render } from '@test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import { Button } from '@vanguard/Button/Button';
import React, { useEffect, useState } from 'react';

const LintRenderer33 = ({ onClick }: { onClick: any }) => {
      const [disabled, setDisabled] = useState(true);
      useEffect(() => {
        setDisabled(false);
      }, []);
      return (
        <div>
          <Button testId={'test-btn'} onClick={onClick} disabled={disabled}>
            TEST
          </Button>
        </div>
      );
    };

const LintRenderer8 = ({ onClick }: { onClick: any }) => {
      return (
        <div>
          <Button testId={'test-btn'} onClick={onClick}>
            TEST
          </Button>
        </div>
      );
    };


describe('Vanguard button functionality', () => {
  it('should be clickable ', async () => {
    const Renderer = LintRenderer8;
    let value = '';

    await render(
      <Renderer
        onClick={() => {
          value = '1';
        }}
      />,
    );

    const user = userEvent.setup();
    const btn = await appScreen.findByTestId('test-btn');
    await user.click(btn);
    expect(value).not.toBe('');
  });
  it('should be clickable after it was disabled', async () => {
    const Renderer = LintRenderer33;
    let value = '';

    await render(
      <Renderer
        onClick={() => {
          value = '1';
        }}
      />,
    );

    const user = userEvent.setup();
    const btn = await appScreen.findByTestId('test-btn');
    await user.click(btn);
    expect(value).not.toBe('');
  });
});
