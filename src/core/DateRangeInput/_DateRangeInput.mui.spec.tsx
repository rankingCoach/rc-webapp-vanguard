/**
 * MUI upgrade contract tests for <DateRangeInput>.
 *
 * MUI surface: Vanguard InputBase (MUI TextField) + an MUI <InputAdornment position="end"> passed through
 * `textFieldProps.InputProps.endAdornment` (deprecated TextField prop in core v6+, slotProps.input in v9).
 * The range picker itself is react-date-range inside a Vanguard modal (not MUI); the modal hand-off is observed
 * through ModalService.open (spied, not mocked: the real implementation still runs).
 * Title tags: `[bug-lock]` = baseline characterization, not a promised contract. Untagged = contract.
 */
import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import { ModalService } from '@vanguard/Modal/ModalService';
import { DateRangeModal } from '@vanguard/StandardModals/DateRangeModal/DateRangeModal';
import moment from 'moment';
import React, { createRef } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { act, render, screen, waitFor } from '../../../test-utils/test-utils';
import { DateRangeInput } from './DateRangeInput';

const createFormConfig = (stateValue = '', extra: Record<string, unknown> = {}) => ({
  stateValue,
  setStateValue: vi.fn((value: string) => ({ type: 'test/setDateRange', payload: value })),
  _inputRef: createRef<HTMLInputElement>(),
  ...extra,
});

const getInput = (container: HTMLElement) => container.querySelector('input') as HTMLInputElement;
const getCalendarButton = () => screen.getByRole('button');

/** Click the calendar button and return the element + options handed to ModalService.open */
const openModal = async () => {
  const open = vi.spyOn(ModalService, 'open');
  await userEvent.click(getCalendarButton());
  expect(open).toHaveBeenCalledTimes(1);
  const [element, opts] = open.mock.calls[0];
  return { element: element as React.ReactElement<any>, opts };
};

const closeModalWith = async (element: React.ReactElement<any>, response: unknown) => {
  await act(() => {
    element.props.close(response);
  });
};

afterEach(async () => {
  await act(() => {
    ModalService.closeAllModals();
  });
  ModalService.__resetForTests();
  vi.restoreAllMocks();
});

describe('DateRangeInput contract: rendering', () => {
  test('renders one text input with the calendar button as end adornment inside the field', () => {
    const { container } = render(<DateRangeInput formconfig={createFormConfig()} />);

    const input = getInput(container);
    const button = getCalendarButton();
    expect(container.querySelectorAll('input')).toHaveLength(1);
    // end adornment: rendered inside the same input root, after the <input>
    expect(input.parentElement?.contains(button)).toBe(true);
    expect(input.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(button).toBeEnabled();
  });

  test('the calendar button shows the calendar icon', async () => {
    render(<DateRangeInput formconfig={createFormConfig()} />);
    await waitFor(() => expect(getCalendarButton().querySelector('svg')).not.toBeNull());
  });

  test('label is rendered with the "Optional" suffix', () => {
    render(<DateRangeInput formconfig={createFormConfig()} label={'Campaign period'} />);
    expect(document.querySelector('label')?.textContent).toBe('Campaign periodOptional');
  });

  test('disabled disables both the input and the calendar button', () => {
    const { container } = render(<DateRangeInput formconfig={createFormConfig()} disabled={true} />);

    expect(getInput(container)).toBeDisabled();
    expect(getCalendarButton()).toBeDisabled();
  });

  test('formconfig error message is rendered', () => {
    render(<DateRangeInput formconfig={createFormConfig('', { hasError: true, errors: ['Invalid range'] })} />);
    expect(screen.getByTestId('vanguard-input-error-text')).toHaveTextContent('Invalid range');
  });
});

describe('DateRangeInput contract: value', () => {
  test('formconfig.stateValue is shown in the input', async () => {
    const { container } = render(<DateRangeInput formconfig={createFormConfig('2023-01-01_2023-01-31')} />);
    await waitFor(() => expect(getInput(container)).toHaveValue('2023-01-01_2023-01-31'));
  });

  test('a new formconfig.stateValue replaces the shown value', async () => {
    const formconfig = createFormConfig('2023-01-01_2023-01-31');
    const { container, rerender } = render(<DateRangeInput formconfig={formconfig} />);
    await waitFor(() => expect(getInput(container)).toHaveValue('2023-01-01_2023-01-31'));

    rerender(<DateRangeInput formconfig={{ ...formconfig, stateValue: '2024-05-01_2024-05-31' }} />);

    await waitFor(() => expect(getInput(container)).toHaveValue('2024-05-01_2024-05-31'));
  });

  test('typing in the input dispatches formconfig.setStateValue with the raw text', async () => {
    const formconfig = createFormConfig();
    const { container } = render(<DateRangeInput formconfig={formconfig} />);

    await userEvent.type(getInput(container), 'ab');

    expect(formconfig.setStateValue).toHaveBeenLastCalledWith('ab');
  });

  test('works without formconfig (own ref)', async () => {
    const { container } = render(<DateRangeInput />);

    await userEvent.type(getInput(container), '2023-01-01_2023-01-31');
    const { element } = await openModal();

    expect(moment(element.props.initialValue.startDate).format('YYYY-MM-DD')).toBe('2023-01-01');
  });
});

describe('DateRangeInput contract: modal hand-off', () => {
  test('calendar button opens a 640px DateRangeModal with empty initial value when the input is empty', async () => {
    render(<DateRangeInput formconfig={createFormConfig()} />);

    const { element, opts } = await openModal();

    expect(element.type).toBe(DateRangeModal);
    expect(opts).toEqual({ width: '640px' });
    expect(element.props.initialValue).toEqual({ startDate: null, endDate: null });
  });

  test('current "YYYY-MM-DD_YYYY-MM-DD" value is parsed into moment start/end for the modal', async () => {
    const { container } = render(<DateRangeInput formconfig={createFormConfig('2023-01-01_2023-01-31')} />);
    await waitFor(() => expect(getInput(container)).toHaveValue('2023-01-01_2023-01-31'));

    const { element } = await openModal();

    const { startDate, endDate } = element.props.initialValue;
    expect(moment.isMoment(startDate)).toBe(true);
    expect(moment.isMoment(endDate)).toBe(true);
    expect(startDate.format('YYYY-MM-DD')).toBe('2023-01-01');
    expect(endDate.format('YYYY-MM-DD')).toBe('2023-01-31');
  });

  test('an unparsable value gives an empty initial value', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(<DateRangeInput formconfig={createFormConfig('not a range')} />);
    await waitFor(() => expect(getInput(container)).toHaveValue('not a range'));

    const { element } = await openModal();

    expect(element.props.initialValue).toEqual({ startDate: null, endDate: null });
    warn.mockRestore();
  });

  test('inputFormatter.reverseFormatFn is applied before parsing', async () => {
    const reverseFormatFn = vi.fn((val: string) => val.replace(' to ', '_'));
    const { container } = render(
      <DateRangeInput
        formconfig={createFormConfig('2023-01-01 to 2023-01-31')}
        inputFormatter={{ formatFn: (val) => val.replace('_', ' to '), reverseFormatFn }}
      />,
    );
    await waitFor(() => expect(getInput(container)).toHaveValue('2023-01-01 to 2023-01-31'));

    const { element } = await openModal();

    expect(reverseFormatFn).toHaveBeenCalledWith('2023-01-01 to 2023-01-31');
    expect(element.props.initialValue.startDate.format('YYYY-MM-DD')).toBe('2023-01-01');
    expect(element.props.initialValue.endDate.format('YYYY-MM-DD')).toBe('2023-01-31');
  });

  test('datePicker props are forwarded to the modal, inputFormatter/datePicker are not forwarded to the input', async () => {
    render(<DateRangeInput formconfig={createFormConfig()} datePicker={{ view: 'calendar' }} />);

    const { element } = await openModal();

    expect(element.props.view).toBe('calendar');
  });

  test('confirming a range writes "YYYY-MM-DD_YYYY-MM-DD" into the input and dispatches setStateValue', async () => {
    const formconfig = createFormConfig();
    const { container } = render(<DateRangeInput formconfig={formconfig} />);
    const { element } = await openModal();

    await closeModalWith(element, {
      isOk: true,
      data: { selection: { startDate: new Date(2024, 1, 1), endDate: new Date(2024, 1, 10, 23, 59) } },
    });

    expect(getInput(container)).toHaveValue('2024-02-01_2024-02-10');
    expect(formconfig.setStateValue).toHaveBeenCalledWith('2024-02-01_2024-02-10');
  });

  test('inputFormatter.formatFn formats the confirmed range', async () => {
    const formconfig = createFormConfig();
    const { container } = render(
      <DateRangeInput
        formconfig={formconfig}
        inputFormatter={{ formatFn: (val) => val.replace('_', ' to '), reverseFormatFn: (val) => val }}
      />,
    );
    const { element } = await openModal();

    await closeModalWith(element, {
      isOk: true,
      data: { selection: { startDate: new Date(2024, 1, 1), endDate: new Date(2024, 1, 10) } },
    });

    expect(getInput(container)).toHaveValue('2024-02-01 to 2024-02-10');
    expect(formconfig.setStateValue).toHaveBeenCalledWith('2024-02-01 to 2024-02-10');
  });

  test.each([
    ['cancel', { isOk: false }],
    ['ok without dates', { isOk: true, data: { selection: {} } }],
    ['ok with only a start date', { isOk: true, data: { selection: { startDate: new Date(2024, 1, 1) } } }],
  ])('%s leaves the input unchanged', async (_name, response) => {
    // Note: isOk is not checked; only the presence of both dates decides (see the [bug-lock] test below).
    const formconfig = createFormConfig('2023-01-01_2023-01-31');
    const { container } = render(<DateRangeInput formconfig={formconfig} />);
    await waitFor(() => expect(getInput(container)).toHaveValue('2023-01-01_2023-01-31'));
    const { element } = await openModal();

    await closeModalWith(element, response);

    expect(getInput(container)).toHaveValue('2023-01-01_2023-01-31');
    expect(formconfig.setStateValue).not.toHaveBeenCalled();
  });

  test('[bug-lock] a confirmed response with dates is applied even when isOk is false', async () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): onModalClose never checks isOk. DateRangeModal's Cancel sends no data,
    // so it is harmless today, but any caller passing data with isOk=false would still write it.
    const formconfig = createFormConfig();
    const { container } = render(<DateRangeInput formconfig={formconfig} />);
    const { element } = await openModal();

    await closeModalWith(element, {
      isOk: false,
      data: { selection: { startDate: new Date(2024, 1, 1), endDate: new Date(2024, 1, 2) } },
    });

    expect(getInput(container)).toHaveValue('2024-02-01_2024-02-02');
  });

  test('a modal confirmed after the input unmounted is ignored', async () => {
    const formconfig = createFormConfig();
    const { unmount } = render(<DateRangeInput formconfig={formconfig} />);
    const { element } = await openModal();
    unmount();

    await closeModalWith(element, {
      isOk: true,
      data: { selection: { startDate: new Date(2024, 1, 1), endDate: new Date(2024, 1, 10) } },
    });

    expect(formconfig.setStateValue).not.toHaveBeenCalled();
  });

  test('without formconfig a confirmed range is written into the input only', async () => {
    const { container } = render(<DateRangeInput />);
    const { element } = await openModal();

    await closeModalWith(element, {
      isOk: true,
      data: { selection: { startDate: new Date(2024, 1, 1), endDate: new Date(2024, 1, 10) } },
    });

    expect(getInput(container)).toHaveValue('2024-02-01_2024-02-10');
  });
});
