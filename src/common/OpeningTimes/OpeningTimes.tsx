import { OpeningTimesItem } from '@common/OpeningTimes/OpeningTimesItem/OpeningTimesItem';
import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import React from 'react';

import styles from './OpeningTimes.module.scss';

/**
 * Types
 */
export type OpeningHoursDayIntervalType = {
  from: string;
  to: string;
};

export type OpeningHoursDayType = {
  dayOfWeek: string;
  openAllDay: boolean;
  open: boolean;
  intervals: OpeningHoursDayIntervalType[];
};

export type OpeningHoursType = {
  openingHoursNotes?: string;
  alwaysOpen: boolean;
  noHoursAvailable: boolean;
  openingHoursDays: OpeningHoursDayType[];
  showAmPm: boolean;
};

// Props
export type OpeningTimesProps = OpeningHoursType & {
  className?: string;
  testId?: string;
};

/**
 * Component
 */
export const OpeningTimes = (props: OpeningTimesProps) => {
  const {
    openingHoursDays,
    noHoursAvailable,
    className,
    testId = 'OpeningTimes_Container',
    alwaysOpen,
    showAmPm,
  } = props;

  return (
    <ComponentContainer data-slot={'opening-times'} className={classNames(className, styles.flex)} testId={testId}>
      {openingHoursDays.map((item) => {
        return (
          <OpeningTimesItem
            key={item.dayOfWeek}
            {...item}
            noHoursAvailable={noHoursAvailable}
            alwaysOpen={alwaysOpen}
            showAmPm={showAmPm}
          />
        );
      })}
    </ComponentContainer>
  );
};
