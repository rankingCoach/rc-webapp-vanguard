import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Render } from '@vanguard/Render/Render';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import { Textarea } from '@vanguard/Textarea/Textarea';
import React, { useMemo, useState } from 'react';

import styles from './TextEditDrawer.module.scss';

export interface TextEditDrawerProps {
  onSave: (value: string) => void;
  onClose: () => void;
  value: string;
  defaultValue?: string;
  title: string;
  description?: string;
  maxLength?: number;
  required?: boolean;
}

export const TextEditDrawer = (props: TextEditDrawerProps) => {
  const { title, description, defaultValue, value, maxLength, required = false, onClose, onSave } = props;

  const [innerValue, setInnerValue] = useState(value);

  const handleSave = () => {
    onSave(innerValue.trim());
    onClose();
  };

  const isSaveButtonDisabled = useMemo(() => {
    if (required && !innerValue.trim()) return true;
    if (maxLength !== undefined && innerValue.trim().length > maxLength) return true;
    if (innerValue === value) return true;
    return false;
  }, [value, innerValue, required, maxLength]);
  const isRestoreToDefaultButtonDisabled = useMemo(() => innerValue === defaultValue, [defaultValue, innerValue]);

  return (
    <div className={styles.textEditDrawerContainer}>
      <Text className={styles.textEditDrawerTitle} fontWeight={FontWeights.bold} type={TextTypes.heading2}>
        {title}
      </Text>
      <Render if={!!description}>
        <Text>{description}</Text>
      </Render>
      <div className={styles.textBoxContainer}>
        <Render if={!!defaultValue} className={styles.restoreButtonContainer}>
          <Button
            disabled={isRestoreToDefaultButtonDisabled}
            type={ButtonTypes.muted}
            size={ButtonSizes.medium}
            onClick={() => setInnerValue(defaultValue!)}
          >
            Restore to default
          </Button>
        </Render>
        <Textarea
          onChange={(e) => setInnerValue(e.target.value)}
          value={innerValue}
          maxLength={maxLength}
          required={required}
          allowBreakLines
        />
      </div>
      <div className={styles.textEditDrawerActionsContainer}>
        <Button onClick={handleSave} iconLeft={IconNames.save} disabled={isSaveButtonDisabled}>
          Save
        </Button>
        <Button type={ButtonTypes.default} onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
