import './DateRangeInput.scss';

import { InputAdornment } from '@mui/material';
import { InputBase, rcInputBaseProps } from '@vanguard/_internal/InputBase/InputBase';
import { useResolvedFormConfig } from '@vanguard/Form/FormConfigContext';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';

import { Button, ButtonSizes, ButtonTypes } from '../Button/Button';
import { ComponentContainer } from '../ComponentContainer/ComponentContainer';
import { DateRangeInitialProps, DateRangePickerResp, RcDateRangePickerProps } from '../DateRange/DateRange';
import { IconSize } from '../Icon/Icon';
import { IconNames } from '../Icon/IconNames';
import { ModalResponseHandler } from '../Modal/ModalRoot/ModalRoot';
import { ModalService } from '../Modal/ModalService';
import { DateRangeModal } from '../StandardModals/DateRangeModal/DateRangeModal';

type Props = {
  datePicker?: RcDateRangePickerProps;
  inputFormatter?: {
    formatFn: (val: string) => string;
    reverseFormatFn: (val: string) => string;
  };
} & rcInputBaseProps;

export const DateRangeInput = (props: Props) => {
  const formconfig = useResolvedFormConfig(props.formconfig);
  const { inputFormatter } = props;
  const { formatFn, reverseFormatFn } = inputFormatter || {};
  let inputRef = formconfig?._inputRef;
  const [, updateState] = useState({});
  if (!inputRef) {
    inputRef = useRef(null);
  }

  useEffect(() => {
    setTimeout(() => {
      if (inputRef?.current?.value) {
        inputRef.current.value = formconfig?.stateValue;
        updateState({});
      }
    }, 0);
  }, [formconfig?.stateValue]);

  const onModalClose: ModalResponseHandler<DateRangePickerResp> = (e) => {
    if (inputRef?.current) {
      const startDate = e?.data?.selection?.startDate;
      const endDate = e?.data?.selection?.endDate;
      if (startDate && endDate) {
        const startDateFormatted = moment(startDate).format('YYYY-MM-DD');
        const endDateFormatted = moment(endDate).format('YYYY-MM-DD');
        let formattedValue = `${startDateFormatted}_${endDateFormatted}`;
        if (formatFn && typeof formatFn === 'function') {
          formattedValue = formatFn(formattedValue);
        }
        inputRef.current.value = formattedValue;
        props.onChange?.({
          target: { value: formattedValue },
          currentTarget: { value: formattedValue },
        } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>);
      }
    }
  };

  const openDateRangeModal = () => {
    // We need to parse the input value first case we have a string for ads
    // this is a special case that we will move outside but atm we need to parse it here
    // TODO have a parse object TO and FROM
    const initialValue: DateRangeInitialProps = {
      startDate: null,
      endDate: null,
    };

    if (inputRef?.current?.value) {
      let val = inputRef.current.value;
      if (reverseFormatFn) {
        val = reverseFormatFn(val);
      }
      const valSplit = val.split('_');
      const startDateMoment = moment(valSplit[0]);
      const endDateMoment = moment(valSplit[1]);

      if (startDateMoment.isValid() && endDateMoment.isValid()) {
        initialValue.startDate = startDateMoment;
        initialValue.endDate = endDateMoment;
      }
    }

    const modalId = ModalService.open(
      <DateRangeModal {...props.datePicker} initialValue={initialValue} close={onModalClose} />,
      {
        width: '640px',
      },
    );
  };

  const inputProps = { ...props };
  // we need to remove the datepicker opts from the input props
  delete inputProps.datePicker;
  delete inputProps.inputFormatter;

  return (
    <ComponentContainer className={'DateRangeInput-container'}>
      <InputBase
        inputRef={inputRef}
        textFieldProps={{
          InputProps: {
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  disabled={props.disabled}
                  size={ButtonSizes.small}
                  iconSize={IconSize.large}
                  iconLeft={IconNames.calendar}
                  type={ButtonTypes.default}
                  iconColor={'--n500'}
                  onClick={() => {
                    openDateRangeModal();
                  }}
                />
              </InputAdornment>
            ),
          },
        }}
        {...inputProps}
      />
    </ComponentContainer>
  );
};
