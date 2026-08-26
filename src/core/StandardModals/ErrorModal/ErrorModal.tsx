import './ErrorModal.scss';

import { useDynamicImport } from '@custom-hooks/use-dynamic-import/use-dynamic-import';
import { alignItemsCenter, dFlexColumn, mb3, mt2, mt5 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { supportService } from '@services/support.service';
import { IconNames } from '@vanguard/Icon/IconNames';
import { ModalFooter } from '@vanguard/Modal/ModalFooter/ModalFooter';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { generateErrorBoundaryData } from '@vanguard/RcErrorBoundry/generate-error-boundary-data';
import React, { useEffect } from 'react';

import { Modal } from '../../Modal/Modal';
import { ModalBody } from '../../Modal/ModalBody/ModalBody';
import { StandardModalProps } from '../../Modal/ModalRoot/ModalRoot';
import { FontWeights, Text, TextReplacements, TextTypes } from '../../Text/Text';

type Props = StandardModalProps<null> & {
  err?: any;
  source: string;
  /** Replacements for `title` and `message`, so a translated sentence can name what was rejected */
  replacements?: TextReplacements;
  /**
   * The error codes the caller received, shown verbatim under the message so the user can quote them
   * to support. Never translated — they are identifiers (e.g. INVALID_CATEGORY), not copy. `err` stays
   * the log payload and is still not rendered.
   */
  errorCodes?: string[];
};

export const ErrorModal = (props: Props) => {
  const {
    close,
    title = 'Oh snap! Something went wrong!',
    message = 'The application has encountered an unknown error. Please contact customer support for further help.',
    ctaPosition = 'center',
    ctaPositive = {
      text: 'contact our support',
      cta: () => {
        supportService.show();
      },
      icon: IconNames.arrowRight,
    },
    err,
    ctaNegative,
    source,
    replacements,
    errorCodes,
  } = props;

  const { SvgIcon } = useDynamicImport('gifs/error.gif');

  useEffect(() => {
    generateErrorBoundaryData('error_modal_logs', undefined, err, undefined, source);
  }, [err]);

  return (
    <Modal width={'600px'} {...props}>
      <ModalHeader type={'danger'} closeFn={close}>
        <Text type={TextTypes.heading3} fontWeight={FontWeights.bold} replacements={replacements}>
          {title}
        </Text>
      </ModalHeader>

      <ModalBody>
        <div className={classNames(dFlexColumn, alignItemsCenter)}>
          <img className={classNames(mb3, mt5)} src={SvgIcon} alt="" />
          <Text
            type={TextTypes.textIntro}
            textAlign={'center'}
            fontWeight={FontWeights.medium}
            replacements={replacements}
          >
            {message}
          </Text>
          {!!errorCodes?.length && (
            <Text
              className={classNames(mt2)}
              type={TextTypes.textCaption}
              textAlign={'center'}
              color={'--n400'}
              translate={false}
            >
              {errorCodes.join(', ')}
            </Text>
          )}
        </div>
      </ModalBody>

      <ModalFooter buttonsPosition={ctaPosition} positive={ctaPositive} negative={ctaNegative} />
    </Modal>
  );
};
