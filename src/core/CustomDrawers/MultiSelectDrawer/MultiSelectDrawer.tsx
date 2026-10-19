import { Button, ButtonTypes, ButtonSizes } from '@vanguard/Button/Button';
import { CheckBox } from '@vanguard/CheckBox/CheckBox';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Render } from '@vanguard/Render/Render';
import { StatusBadge, StatusBadgeProps } from '@vanguard/StatusBadge/StatusBadge';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React, { ReactNode, useMemo, useState } from 'react';

import styles from './MultiSelectDrawer.module.scss';

export type MultiSelectDrawerOption = {
  value: string;
  label: string;
  disabled?: boolean;
  status?: StatusBadgeProps;
  translate?: boolean;
};

export interface MultiSelectDrawerProps {
  onSave: (value: string[]) => void | Promise<void>;
  onClose: () => void;
  value: string[];
  options: MultiSelectDrawerOption[];
  title: string;
  minSelected?: number;
  description?: ReactNode;
}

export const MultiSelectDrawer = (props: MultiSelectDrawerProps) => {
  const { title, description, value, options, minSelected = 0, onSave, onClose } = props;

  const [innerValue, setInnerValue] = useState(
    options.reduce(
      (obj, option) => {
        obj[option.value] = value.includes(option.value);
        return obj;
      },
      {} as Record<string, boolean>,
    ),
  );
  const [isLoadingSave, setIsLoadingSave] = useState(false);

  const handleSave = async () => {
    const newValue = Object.entries(innerValue)
      .filter(([_, selected]) => selected)
      .map(([value]) => value);
    const s = onSave(newValue);
    if (typeof s === 'object') {
      setIsLoadingSave(true);
      await s;
      setIsLoadingSave(false);
      onClose();
    } else {
      onClose();
    }
  };

  const handleSelectionChange = (selectedValue: string, checked: boolean) => {
    setInnerValue((previousValue) => {
      const newValue = { ...previousValue };
      newValue[selectedValue] = checked;
      return newValue;
    });
  };

  const isSaveButtonDisabled = useMemo(
    () => Object.entries(innerValue).filter(([_, selected]) => selected).length < minSelected,
    [innerValue, minSelected],
  );

  return (
    <div className={styles.textEditDrawerContainer}>
      <Text className={styles.textEditDrawerTitle} fontWeight={FontWeights.bold} type={TextTypes.heading2}>
        {title}
      </Text>
      <Render if={!!description}>{description}</Render>
      <div className={styles.optionsContainer}>
        {options.map((option) => (
          <div className={styles.multiSelectDrawerOption} key={option.label}>
            <CheckBox
              label={option.label}
              checked={innerValue[option.value]}
              disabled={option.disabled}
              onChange={({ target }) => handleSelectionChange(option.value, target.checked)}
              translate={option.translate}
            />
            <Render if={!!option.status}>
              <StatusBadge {...option.status!} hideIcon={true} />
            </Render>
          </div>
        ))}
      </div>
      <div className={styles.textEditDrawerActionsContainer}>
        <Button
          size={ButtonSizes.extraLarge}
          onClick={handleSave}
          iconLeft={IconNames.save}
          isLoading={isLoadingSave}
          disabled={isSaveButtonDisabled}
        >
          Save
        </Button>
        <Button size={ButtonSizes.extraLarge} type={ButtonTypes.default} onClick={onClose} disabled={isLoadingSave}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
