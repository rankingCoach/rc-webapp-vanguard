import { render, screen } from '@test-utils/test-utils';
import React from 'react';

import { RatingDistribution } from './RatingDistribution';

import { describe, test } from 'vitest';
describe('RatingDistribution component tests', () => {
  test('should render RatingDistribution component', async () => {
    const TestId = 'RatingDistribution_test1';
    render(
      <RatingDistribution
        ratingDistributionData={[
          { ratingsNumber: 46, starsNumber: 5, color: 'var(--s400)' },
          { ratingsNumber: 24, starsNumber: 4, color: 'var(--w400)' },
          { ratingsNumber: 10, starsNumber: 3, color: 'var(--e500)' },
          { ratingsNumber: 10, starsNumber: 2, color: 'var(--e500)' },
          { ratingsNumber: 2, starsNumber: 1, color: 'var(--e500)' },
        ]}
        showTotalNumberOfRatings={true}
        title={'Rating distribution'}
        testId={TestId}
      />,
    );
    screen.getByTestId(TestId);
  });

  test('should render totalNumberOfRatings', async () => {
    const TestId = 'RatingDistribution_test2';
    render(
      <RatingDistribution
        ratingDistributionData={[
          { ratingsNumber: 46, starsNumber: 5, color: 'var(--s400)' },
          { ratingsNumber: 24, starsNumber: 4, color: 'var(--w400)' },
          { ratingsNumber: 10, starsNumber: 3, color: 'var(--e500)' },
          { ratingsNumber: 10, starsNumber: 2, color: 'var(--e500)' },
          { ratingsNumber: 2, starsNumber: 1, color: 'var(--e500)' },
        ]}
        showTotalNumberOfRatings={true}
        testId={TestId}
      />,
    );
    await screen.findByTestId('TotalNumberOfRatings_testId');
  });

  test('should render RatingStarsAndProgressBar', async () => {
    const TestId = 'RatingDistribution_test3';
    render(
      <RatingDistribution
        ratingDistributionData={[{ ratingsNumber: 36, starsNumber: 4, color: 'var(--w400)' }]}
        testId={TestId}
      />,
    );
    await screen.findAllByTestId('RatingStarsAndProgressBar_testId');
  });
});
