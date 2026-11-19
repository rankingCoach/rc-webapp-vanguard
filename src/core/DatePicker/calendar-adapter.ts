// Calendar operations adapted from @mui/x-date-pickers@9.17.0 AdapterMoment (MIT).
import moment, { type Moment, type unitOfTime } from 'moment';

export const createCalendarAdapter = (locale: string) => {
  const localize = (value: Moment) => value.clone().locale(locale);
  const startOfWeek = (value: Moment) => localize(value).startOf('week');
  const endOfWeek = (value: Moment) => localize(value).endOf('week');
  const addDays = (value: Moment, amount: number) => value.clone().add(amount, 'days');
  const getWeekArray = (value: Moment) => {
    const end = endOfWeek(value.clone().endOf('month'));
    const weeks: Moment[][] = [];

    for (let day = startOfWeek(value.clone().startOf('month')); day.isBefore(end); ) {
      const week: Moment[] = [];
      for (let index = 0; index < 7; index++) {
        week.push(day);
        const next = addDays(day, 1);
        // A clock change at midnight can make the addition end on the same calendar day.
        day = next.date() === day.date() ? next.add(12, 'hours').startOf('day') : next;
      }
      weeks.push(week);
    }
    return weeks;
  };

  return {
    now: () => moment().locale(locale),
    localize,
    format: (value: Moment, pattern: string) => localize(value).format(pattern),
    start: (value: Moment, unit: unitOfTime.StartOf) => value.clone().startOf(unit),
    end: (value: Moment, unit: unitOfTime.StartOf) => value.clone().endOf(unit),
    setDayOfMonth: (value: Moment, day: number) => value.clone().date(day),
    setYear: (value: Moment, year: number) => value.clone().year(year),
    addDays,
    addMonths: (value: Moment, amount: number) => value.clone().add(amount, 'months'),
    addYears: (value: Moment, amount: number) => value.clone().add(amount, 'years'),
    startOfWeek,
    endOfWeek,
    getWeekArray,
    isSameDay: (value: Moment, other: Moment) => value.isSame(other, 'day'),
    mergeDateAndTime: (day: Moment, time: Moment) =>
      day.clone().hours(time.hours()).minutes(time.minutes()).seconds(time.seconds()).milliseconds(time.milliseconds()),
  };
};
