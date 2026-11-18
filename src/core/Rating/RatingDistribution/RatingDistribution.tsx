import { mr1_5 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Rating } from '@vanguard/Rating/Rating';
import { RatingStarsAndProgressBar } from '@vanguard/Rating/RatingDistribution/RatingStarsAndProgressBar/RatingStarsAndProgressBar';
import { Render } from '@vanguard/Render/Render';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React, { useMemo } from 'react';

import styles from './RatingDistribution.module.scss';

type ratingDistributionDataType = {
  ratingsNumber: number;
  starsNumber: number;
  color: string;
};

export interface RatingDistributionProps {
  ratingDistributionData: ratingDistributionDataType[];
  averageRating?: number;
  title?: string;
  showTotalNumberOfRatings?: boolean;
  testId?: string;
}

export const RatingDistribution = (props: RatingDistributionProps) => {
  const { ratingDistributionData, showTotalNumberOfRatings, title, testId, averageRating } = props;

  const totalRatingValues = useMemo(() => {
    let totalNumberOfRatings = 0;
    let ratingAverage = 0;

    ratingDistributionData.forEach((item) => {
      totalNumberOfRatings += item.ratingsNumber;
      ratingAverage += item.starsNumber * item.ratingsNumber;
    });
    ratingAverage = ratingAverage / totalNumberOfRatings;

    return {
      ratingAverage: ratingAverage,
      totalNumberOfRatings: totalNumberOfRatings,
    };
  }, [ratingDistributionData]);

  /**
   * Return view
   * ---
   */
  return (
    <ComponentContainer data-slot={'rating-distribution'} className={styles.container} testId={testId}>
      <div data-slot={'rating-distribution-title'} className={styles.ratingTitle}>
        <Text fontWeight={FontWeights.bold} className={mr1_5} testId={'title_testId'}>
          {title ? title : 'Rating distribution'}
        </Text>

        <Render if={showTotalNumberOfRatings}>
          <Text
            type={TextTypes.textHelp}
            color={'--n400'}
            testId={'TotalNumberOfRatings_testId'}
            replacements={{ total_number_of_ratings: totalRatingValues.totalNumberOfRatings }}
          >
            %total_number_of_ratings% total ratings
          </Text>
        </Render>
      </div>

      <div data-slot={'rating-distribution-content'} className={styles.ratingStars}>
        <Rating
          className={classNames(styles.rating)}
          valueAlign={'top'}
          type={'stars'}
          valueColor={'--n700'}
          size={24}
          value={averageRating ?? totalRatingValues.ratingAverage}
          color={'--a2900'}
        />

        <div data-slot={'rating-distribution-bars'} className={styles.progressBarRating}>
          {ratingDistributionData.map((item, key) => {
            return (
              <RatingStarsAndProgressBar
                key={key}
                maxNumberOfStars={item.starsNumber}
                ratingsNumber={item.ratingsNumber}
                progressValueColor={item.color}
                totalRatingValues={totalRatingValues.totalNumberOfRatings}
                testId={'RatingStarsAndProgressBar_testId'}
              />
            );
          })}
        </div>
      </div>
    </ComponentContainer>
  );
};
