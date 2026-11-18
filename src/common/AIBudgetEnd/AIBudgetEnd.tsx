import { Modal } from '@vanguard/Modal/Modal';
import { ModalBody } from '@vanguard/Modal/ModalBody/ModalBody';
import { ModalFooter } from '@vanguard/Modal/ModalFooter/ModalFooter';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { StandardModalProps } from '@vanguard/Modal/ModalRoot/ModalRoot';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import style from './AIBudgetEnd.module.scss';

export type AIBudgetEndProps = {
  title?: string;
  firstParagraph?: string;
  secondParagraph?: string;
  positiveCtaText?: string;
} & StandardModalProps<null>;

export const AIBudgetEnd = (props: AIBudgetEndProps) => {
  const {
    close,
    positiveCtaText = 'Ok, I understand',
    firstParagraph = "Your subscription gives you a certain amount of AI usage each month, which is meant to meet the needs of most businesses. You've now hit your current AI usage cap.",
    secondParagraph = "Don't worry—this limit is reset every month, allowing you to continue using our AI features.",
    title = 'Monthly AI limit reached',
  } = props;

  return (
    <Modal maxWidth={'672px'} modalPosition={'center'}>
      <ModalHeader type="info" closeFn={close}>
        <Text fontWeight={FontWeights.bold} type={TextTypes.heading4}>
          {title}
        </Text>
      </ModalHeader>

      <ModalBody className={style.modalBody}>
        <div data-slot={'ai-budget-end-first-paragraph'}>
          <Text textAlign={'center'}>{firstParagraph}</Text>
        </div>
        <div data-slot={'ai-budget-end-second-paragraph'}>
          <Text textAlign={'center'}>{secondParagraph}</Text>
        </div>
      </ModalBody>

      <ModalFooter
        showTopBorder={true}
        buttonsPosition="center"
        positive={{
          cta: () => {
            close({
              isOk: true,
            });
          },
          text: positiveCtaText,
        }}
      />
    </Modal>
  );
};
