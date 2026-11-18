import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { OpeningTimes } from './OpeningTimes';

describe('OpeningTimes data-slot contract', () => {
  it('slots owned elements and renders with valid opening hours', () => {
    const { container } = render(<OpeningTimes className={'mine'} alwaysOpen={false} noHoursAvailable={false} showAmPm={false} openingHoursDays={[{ dayOfWeek: 'monday', openAllDay: false, open: true, intervals: [{ from: '09:00', to: '17:00' }] }]} />);
    expect(container.querySelector('[data-slot="opening-times"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="opening-times"]')?.classList.contains('mine')).toBe(true);
  });
});
