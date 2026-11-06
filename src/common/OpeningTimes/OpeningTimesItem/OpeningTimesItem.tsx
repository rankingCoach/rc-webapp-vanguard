import { OpeningHoursDayType } from '@common/OpeningTimes/OpeningTimes';
import { dFlex, flexWrap, justifyContentBetween } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { formatHours } from '@helpers/format-utils';
import { parseDay } from '@helpers/parse-day';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Text, TextTypes } from '@vanguard/Text/Text';
import React, { useMemo } from 'react';

import styles from './OpeningTimesItem.module.scss';

const RenderOTRender = (noHoursAvailable: OpeningTimesItemProps['noHoursAvailable'], alwaysOpen: OpeningTimesItemProps['alwaysOpen'], openAllDay: OpeningTimesItemProps['openAllDay'], open: OpeningTimesItemProps['open'], intervalsCopy: OpeningTimesItemProps['intervals'], showAmPm: OpeningTimesItemProps['showAmPm'], dayOfWeek: OpeningTimesItemProps['dayOfWeek']) => {
    if (noHoursAvailable) {
      return <TextOT>No Hours</TextOT>;
    }

    if (alwaysOpen || openAllDay) {
      return <TextOT>Open 24h</TextOT>;
    }

    if (!open) {
      return <TextOT>closed</TextOT>;
    }

    if (intervalsCopy && intervalsCopy.length) {
      const formattedHours = intervalsCopy.map((item) => {
        return {
          from: formatHours(item.from, showAmPm),
          to: formatHours(item.to, showAmPm),
        };
      });

      return (
        <div>
          {formattedHours?.map((item) => {
            return (
              <TextOT
                translate={false}
                key={`${dayOfWeek}-${item.from}-${item.to}`}
              >{`${item.from} — ${item.to}`}</TextOT>
            );
          })}
        </div>
      );
    }

    return <TextOT>No Hours</TextOT>;
  };


export type OpeningTimesItemProps = OpeningHoursDayType & {
  alwaysOpen?: boolean;
  noHoursAvailable?: boolean;
  showAmPm: boolean;
};

export const OpeningTimesItem = (props: OpeningTimesItemProps) => {
  const { dayOfWeek, alwaysOpen, openAllDay, open, showAmPm, intervals, noHoursAvailable } = props;
  const parsedDOW = useMemo(() => parseDay(dayOfWeek ?? ''), [dayOfWeek]);
  const intervalsCopy = [...intervals];

  const RenderOT = RenderOTRender.bind(null, noHoursAvailable, alwaysOpen, openAllDay, open, intervalsCopy, showAmPm, dayOfWeek);

  return (
    <ComponentContainer className={classNames(dFlex, justifyContentBetween, flexWrap)}>
      <TextOT className={styles.openingTimeDay}>{parsedDOW}</TextOT>
      <RenderOT />
    </ComponentContainer>
  );
};

const TextOT = ({ children, className, translate }: { children: string; className?: string; translate?: boolean }) => {
  return (
    <div className={className}>
      <Text translate={translate} color={'--n700'} type={TextTypes.textHelp} textWrap={'no-wrap'}>
        {children}
      </Text>
    </div>
  );
};
