import {
  alignItemsCenter,
  dFlex,
  dFlexColumn,
  gap0_5,
  justifyContentBetween,
  justifyContentCenter,
} from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { translationService } from '@services/translation.service';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { IconNames } from '@vanguard/Icon/IconNames';
import { FontWeights, Text } from '@vanguard/Text/Text';
import moment from 'moment';
import React from 'react';
import { CalendarProps } from 'react-date-range';

export const DateRangePickerNavigator = (
  currFocusedDate: Date,
  changeShownDate: (value: Date | number | string, mode?: 'set' | 'setYear' | 'setMonth' | 'monthOffset') => void,
  props: CalendarProps,
) => {
  const { showMonthArrow, locale, minDate, maxDate, showMonthAndYearPickers } = props;
  const momentDate = moment(currFocusedDate);
  const month = momentDate.format('MMMM');
  const year = momentDate.year();

  const weekArray = translationService.translateArray(moment.weekdaysShort(true));

  const iconStyles = { padding: 20, alignItemsCenter, justifyContentCenter, height: 40 };
  const daysStyles = { padding: 8, alignItemsCenter, justifyContentCenter, height: 40 };
  return (
    <div className={dFlexColumn}>
      <div style={iconStyles} className={classNames(dFlex, justifyContentBetween, alignItemsCenter)}>
        <Button
          onClick={() => changeShownDate(-1, 'monthOffset')}
          iconColor={'--n700'}
          iconLeft={IconNames.arrowLeft}
          type={ButtonTypes.default}
          size={ButtonSizes.medium}
        />
        <div className={classNames(dFlex, gap0_5)}>
          <Text textTight={true} fontWeight={FontWeights.bold}>
            {month}
          </Text>
          <Text translate={false} textTight={true} fontWeight={FontWeights.bold}>
            {year}
          </Text>
        </div>
        <Button
          onClick={() => changeShownDate(1, 'monthOffset')}
          iconColor={'--n700'}
          iconLeft={IconNames.arrowRight}
          type={ButtonTypes.default}
          size={ButtonSizes.medium}
        />
      </div>
      <div style={daysStyles} className={classNames(dFlex, justifyContentBetween, alignItemsCenter)}>
        {weekArray.map((day) => {
          return (
            <div className={classNames(dFlex, alignItemsCenter, justifyContentCenter)} key={day} style={{ width: 44 }}>
              <Text textTight={true} fontWeight={FontWeights.bold}>
                {day}
              </Text>
            </div>
          );
        })}
      </div>
    </div>
  );
};
