import { screen } from '@testing-library/react';
import { Avatar } from '@vanguard/Avatar/Avatar';
import React from 'react';

import { render } from '../../../test-utils/test-utils';

import { describe, test } from 'vitest';
describe('Avatar tests', () => {
  test('should render icon', async () => {
    render(<Avatar icon={'gmb'} />);

    await screen.findByTestId('avatar-icon-test-id');
  });

  test('should render image', async () => {
    render(
      <Avatar
        image={
          'https://st3.depositphotos.com/6672868/13701/v/600/depositphotos_137014128-stock-illustration-user-profile-icon.jpg'
        }
      />,
    );

    await screen.findByTestId('avatar-image-test-id');
  });

  test('should render name', async () => {
    render(<Avatar icon={null} image={''} name={'Test Name'} />);

    await screen.findByTestId('avatar-name-test-id');
  });

  test('should render notifications', async () => {
    render(<Avatar icon={'gmb'} hasNotifications={true} />);

    await screen.findByTestId('avatar-notifications-test-id');
  });
});
