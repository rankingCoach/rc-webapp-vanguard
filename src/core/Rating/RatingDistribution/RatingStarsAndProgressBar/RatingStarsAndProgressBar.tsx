import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { ProgressBar } from '@vanguard/ProgressBar/ProgressBar';
import { StarRating } from '@vanguard/StarRating/StarRating';
import { Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './RatingStarsAndProgressBar.module.scss';

export interface RatingStarsAndProgressBarProps {
  maxNumberOfStars: number;
  ratingsNumber: number;
  progressValueColor: string;
  totalRatingValues: number;
  testId?: string;
}

export const RatingStarsAndProgressBar = (props: RatingStarsAndProgressBarProps) => {
  const { maxNumberOfStars, ratingsNumber, progressValueColor, totalRatingValues, testId } = props;

  /**
   * Function | Calculate Progress Value
   * ---
   */
  const calculateProgressValue = (ratingsNumber: number) => {
    return (ratingsNumber * 100) / totalRatingValues;
  };

  return (
    <ComponentContainer data-slot={'rating-stars-and-progress-bar'} className={classNames(styles.starRatingRow)} testId={testId}>
      <div data-slot={'rating-stars-and-progress-bar-stars'} className={classNames(styles.starRating)}>
        <StarRating size={11} value={5} maxNumberOfStars={maxNumberOfStars} color={'--n300'} bgColor={'--n300'} />
      </div>

      <div data-slot={'rating-stars-and-progress-bar-progress'} className={classNames(styles.ratingDistributionProgressBar)}>
        <ProgressBar
          color={progressValueColor}
          progressValue={calculateProgressValue(ratingsNumber)}
          height={'8px'}
          width={'157px'}
          className={styles.progressBar}
        />
      </div>

      <Text
        type={TextTypes.textCaption}
        className={classNames(styles.ratingsNumber)}
        color={'--n600'}
        translate={false}
      >
        {ratingsNumber}
      </Text>
    </ComponentContainer>
  );
};
