import './NotificationReview.scss';

import { dFlex, dFlexColumn, flexWrap, justifyContentCenter } from '@globalStyles';
import React from 'react';

import { classNames } from '../../../helpers/classNames';
import { StarRating } from '../../StarRating/StarRating';
import { FontWeights, Text, TextTypes } from '../../Text/Text';
import { QuoteContainer } from '../QuoteContainer/QuoteContainer';

interface Props {}

export const NotificationReview = (props: Props) => {
  return (
    <div data-slot={'notification-review'} className={'notification-review-body'}>
      <QuoteContainer>
        <div data-slot={'notification-review-text'} className={'review-text'}>
          <Text type={TextTypes.text}>
            <i>The burger was good, not the best I’ve had but for Timisoara is on top I think!!!!</i>
          </Text>
        </div>
        <div data-slot={'notification-review-stars'} className={'review-stars'}>
          <StarRating value={3.5} size={24} />
        </div>
        <div data-slot={'notification-review-author'} className={classNames('review-subtext', dFlex)}>
          <Text type={TextTypes.textCaption}>By</Text>
          &nbsp;
          <Text type={TextTypes.textCaption} fontWeight={FontWeights.medium}>
            Toni is traveling
          </Text>
        </div>
      </QuoteContainer>
      <div className={classNames(dFlexColumn, justifyContentCenter)}>
        {/*TODO flex-md-nowrap*/}
        <div className={classNames(dFlex, flexWrap)}>
          <Text textWrap={'no-wrap'}>Your average score is 4.7</Text>
          <StarRating value={4.7} size={16} />
          <Text textWrap={'no-wrap'}>Based on 5 Google Reviews</Text>
        </div>
        <Text>You score has decreased from 4.8</Text>
      </div>
    </div>
  );
};
