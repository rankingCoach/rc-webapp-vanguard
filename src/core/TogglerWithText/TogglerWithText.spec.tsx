import { alignItemsCenter, dFlex, gap1 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { render, screen } from '@test-utils/test-utils';
import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import { TogglerWithText } from './TogglerWithText';

const LintLeft13 = () => {
      return (
        <div className={classNames(dFlex, alignItemsCenter, gap1)}>
          <Text>Annual</Text>
          <Text color={'--a3500'} type={TextTypes.textHelp} fontWeight={FontWeights.bold}>
            Save 33%
          </Text>
        </div>
      );
    };

const LintLeft40 = () => {
      return (
        <div className={classNames(dFlex, alignItemsCenter, gap1)}>
          <Text>Annual</Text>
          <Text color={'--a3500'} type={TextTypes.textHelp} fontWeight={FontWeights.bold}>
            Save 33%
          </Text>
        </div>
      );
    };

const LintLeft67 = () => {
      return (
        <div className={classNames(dFlex, alignItemsCenter, gap1)}>
          <Text>Annual</Text>
          <Text color={'--a3500'} type={TextTypes.textHelp} fontWeight={FontWeights.bold}>
            Save 33%
          </Text>
        </div>
      );
    };


describe('TogglerWithText component tests', () => {
  test('should render', async () => {
    const Left = LintLeft13;

    render(
      <TogglerWithText
        left={{ component: Left(), value: 'Annual' }}
        right={'Monthly'}
        testId={'toggler'}
        togglerState={'left'}
      />,
    );

    const component = screen.getByTestId('toggler');
    await within(component).findByText('Annual');
    await within(component).findByText('Save 33%');
    await within(component).findByText('Monthly');
  });

  test('should render click left option', async () => {
    const Left = LintLeft40;

    render(
      <TogglerWithText
        left={{ component: Left(), value: 'Annual' }}
        right={'Monthly'}
        testId={'toggler'}
        togglerState={'left'}
      />,
    );

    const user = userEvent.setup();
    const leftOption = await screen.findByTestId('left');
    await user.click(leftOption);
    expect(leftOption.className).toContain('active');
  });

  test('should render click right option', async () => {
    const Left = LintLeft67;

    render(
      <TogglerWithText
        left={{ component: Left(), value: 'Annual' }}
        right={'Monthly'}
        testId={'toggler'}
        togglerState={'left'}
      />,
    );

    const user = userEvent.setup();
    const rightOption = await screen.findByTestId('right');
    await user.click(rightOption);
    expect(rightOption.className).toContain('active');
  });
});
