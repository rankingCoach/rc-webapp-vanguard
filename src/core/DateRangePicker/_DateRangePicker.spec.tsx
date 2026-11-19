import { wait } from '@helpers/wait';
import { cleanupOverlaySpec } from '@test-utils/cleanup-overlay-spec';
import { appScreen, render } from '@test-utils/test-utils';
import { act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment/moment';
import React, { useState } from 'react';
import { afterEach, describe, expect, test } from 'vitest';

import { DateRangePicker, DateRangePickerProps, DateRangePickerReturn } from './DateRangePicker';

afterEach(cleanupOverlaySpec);

const DateRangeRenderHarness = (onChangeCb: (args: any) => void, props: DateRangePickerProps) => {
    const [, setData] = useState<DateRangePickerReturn | undefined>();
    return (
      <div>
        <DateRangePicker
          {...props}
          onChange={(data) => {
            typeof onChangeCb === 'function' && onChangeCb(data);
            setData(data);
          }}
        />
      </div>
    );
  };


const isElementVisible = (element: HTMLElement): boolean => {
  const style = getComputedStyle(element);
  return document.body.contains(element) && style.display !== 'none' && style.visibility !== 'hidden';
};

// Mirrors useDateRangePickerStaticRanges() in DateRangePicker.config.tsx.
const mockRangeSelectorLabels = ['Last 14 days', 'Last 30 days', 'Last 6 months', 'Last 12 months', 'Last 18 months', 'Full timeline'];

/**
 * Helper function
 * - return void, the callback is passed as argument, to have interaction
 * @param testId
 * @param dayNumber
 * @param cb
 */
const clickDatePickerCalendarDate = async (testId: string, dayNumber: number | null = null, cb: any | null = null) => {
  const user = userEvent.setup();
  const leftOnCLick = await appScreen.getByTestId(`${testId}-left-reference-container`);

  await user.click(leftOnCLick);

  const day = await waitFor(() => {
    const tooltip = appScreen.getByRole('tooltip');
    const days = tooltip.querySelectorAll<HTMLButtonElement>('button.rdrDay:not(.rdrDayPassive)');
    const matches = Array.from(days).filter((button) => button.textContent === String(dayNumber));
    expect(matches).toHaveLength(1);
    return matches[0];
  });
  await user.click(day);
  if (typeof cb === 'function') cb(day);
};

/**
 * Helper function
 * - return void, the callback is passed as argument, to have interaction
 * @param testId
 * @param itemNo
 * @param cb
 */
const clickRangeSelectorItem = async (testId: string, itemLabel: string | null = null, cb: any | null = null) => {
  const user = userEvent.setup();

  const rightOnClick = await appScreen.getByTestId(`${testId}-right-reference-container`);
  const rightInputRef = await appScreen.getByTestId(`${testId}-rangeselector-reference-input`);

  await user.click(rightOnClick);
  await user.click(rightInputRef);

  await act(async () => {
    const ranges: HTMLElement[] = [];
    await waitFor(async () => {
      // const tooltip = await appScreen.getByRole("tooltip");
      // const buttons = tooltip.querySelectorAll("button");
      // buttons.forEach((b) => {
      //   if (b.type === "button" && b.className?.indexOf("rdrStaticRange") !== -1) {
      //     ranges.push(b);
      //   }
      // });
      //
      // ranges.map((a: HTMLElement) => {
      //   if (a && itemLabel && a.textContent && a.textContent == itemLabel) {
      //     typeof cb == "function" && cb(a);
      //   }
      // });
    });
  });
};

/**
 * Helper function
 * - return the react component for render
 * @param testId
 * @param onChangeCb
 */
const useRenderer = (testId: string, onChangeCb: (args: any) => void | null) => {
  const DTRender = DateRangeRenderHarness.bind(null, onChangeCb);
  return {
    component: DTRender,
  };
};

describe('DateRangePicker component tests', () => {
  //
  test('datepicker with click on start & end date', async () => {
    const testId = 'daterangepicker-test-id';
    const { component: DTRender } = useRenderer(testId, (data: any) => {
      //console.log(data);
    });

    render(<DTRender testId={testId} />);

    let firstDayNr: number | null = null;
    let secondDayNr: number | null = null;
    await clickDatePickerCalendarDate(testId, 8, (btnObj: any) => {
      firstDayNr = parseInt(btnObj.textContent);
    });
    await clickDatePickerCalendarDate(testId, 15, (btnObj: any) => {
      secondDayNr = parseInt(btnObj.textContent);
    });

    expect(firstDayNr).toBe(8);
    expect(secondDayNr).toBe(15);
  });
  //
  test('check default value', async () => {
    const props = { minDate: undefined, maxDate: undefined };
    const min = props?.minDate || moment().subtract(2, 'day').toDate();
    const max = props?.maxDate || moment().subtract(-2, 'day').toDate();

    render(<DateRangePicker testId={'daterangepicker-test-id'} minDate={min} maxDate={max} />);

    await act(async () => {
      /**
       * Check if date range is visible and has default value
       */
      const rangeInputContainer = await appScreen.getByTestId('daterangepicker-test-id-rangeselector-reference-input');
      expect(isElementVisible(rangeInputContainer)).toBe(true);

      await wait(1000);
      /**
       * First value
       */
      const rangeInput = await appScreen.getByTestId('rangeselector-reference-input');
      // minDate (now - 2 days) filters out every dated preset whose startDate is earlier
      // (see DateRangePicker.tsx's minDate effect), leaving only the undated 'Full timeline' range.
      expect(rangeInput.getAttribute('value')).toBe('Full timeline');
    });
  });
  //
  test('should render with some checks', async () => {
    const props = { minDate: undefined, maxDate: undefined };
    const min = props?.minDate || moment().subtract(2, 'day').toDate();
    const max = props?.maxDate || moment().subtract(-2, 'day').toDate();
    render(<DateRangePicker testId={'daterangepicker-test-id'} minDate={min} maxDate={max} />);

    /**
     * Search by the most important points in the node structure
     */
    await appScreen.getByTestId('daterangepicker-test-id-container');
    await appScreen.getByTestId('daterangepicker-test-id-references');
    const leftOnCLick = await appScreen.getByTestId('daterangepicker-test-id-left-reference-container');
    const rightOnClick = await appScreen.getByTestId('daterangepicker-test-id-right-reference-container');
    //const leftInputRef = await appScreen.getByTestId("daterangepicker-test-id-datepicker-reference-input");
    //const rightInputRef = await appScreen.getByTestId("daterangepicker-test-id-rangeselector-reference-input");

    /**
     * Check click on left calendar
     */
    const user = userEvent.setup();
    await user.click(leftOnCLick);

    await waitFor(() => {
      appScreen.getByTestId('datepicker-reference');
      const tooltip = appScreen.getByRole('tooltip');
      const datePicker = tooltip.getElementsByClassName('date-range-picker-dropdown');
      expect(isElementVisible(tooltip)).toBe(true);
      expect(datePicker).toHaveLength(1);
    });

    /**
     * Check click on right calendar
     */
    await user.click(rightOnClick);

    await waitFor(() => {
      const tooltip = appScreen.getByRole('tooltip');
      const rangeSelector = tooltip.getElementsByClassName('date-range-picker-dropdown-predefined');
      expect(isElementVisible(tooltip)).toBe(true);
      expect(rangeSelector).toHaveLength(1);
    });
  });
  //
  test('datepicker has valid values in datePicker or rangeSelector', { timeout: 15_000 }, async ({ signal }) => {
    render(<DateRangePicker testId={'daterangepicker-test-id'} />);
    const user = userEvent.setup();

    const leftOnCLick = await appScreen.getByTestId('daterangepicker-test-id-left-reference-container');
    const leftInputRef = await appScreen.getByTestId('daterangepicker-test-id-datepicker-reference-input');

    await user.click(leftOnCLick);
    await user.click(leftInputRef);

    const rightOnClick = await appScreen.getByTestId('daterangepicker-test-id-right-reference-container');
    const rightInputRef = await appScreen.getByTestId('daterangepicker-test-id-rangeselector-reference-input');

    await user.click(rightOnClick);
    await user.click(rightInputRef);

    await waitFor(() => {
      const tooltip = appScreen.getByRole('tooltip');
      const ranges = Array.from(tooltip.querySelectorAll('button.rdrStaticRange'), (button) => String(button.textContent));
      mockRangeSelectorLabels.forEach((label) => {
        expect(ranges).toContain(label);
      });
    });

    signal.throwIfAborted();
    await user.click(leftOnCLick);

    await waitFor(() => {
      const tooltip = appScreen.getByRole('tooltip');
      const days = Array.from(tooltip.querySelectorAll('button.rdrDay:not(.rdrDayPassive)'), (button) =>
        parseInt(String(button.textContent)),
      );
      // presume that 1-27 are the month edge
      for (let a = 1; a <= 27; a++) {
        expect(days[a]).toBeTruthy();
      }
    });
  });
  //
  test('range selector with click on one of selector item', async () => {
    const testId = 'daterangepicker-test-id';
    const { component: DTRender } = useRenderer(testId, (data: any) => {
      console.log(data);
    });

    render(<DTRender testId={testId} />);

    await clickRangeSelectorItem(testId, mockRangeSelectorLabels[0], (rangeObj: HTMLElement) => {
      console.log(rangeObj.textContent);
    });
  });
});
