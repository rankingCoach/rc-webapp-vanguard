import styles from './ModalStepper.module.scss';
import { SetupSliceType } from '@custom-hooks/use-stepper/helpers/types';
import { useStepper } from '@custom-hooks/use-stepper/use-stepper';
import { alignItemsCenter, dFlex, justifyContentBetween, mb2, mt6 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { parseCssVariable } from '@helpers/css-variables-parser';
import { useScrollToTop } from '@helpers/scroll-to-top';
import { capitalizeFirstLetter } from '@helpers/string-helpers';
import { AnimatedConditional } from '@vanguard/AnimatedConditional/AnimatedConditional';
import { ModalBody } from '@vanguard/Modal/ModalBody/ModalBody';
import { ModalFooter, ModalFooterProps } from '@vanguard/Modal/ModalFooter/ModalFooter';
import { Render } from '@vanguard/Render/Render';
import { Text } from '@vanguard/Text/Text';
import React, { useEffect, useRef } from 'react';
import { useLegacyDispatch } from '../../../primitives/react/form/use-legacy-dispatch';
import { ModalStepperSteps } from './ModalStepperSteps/ModalStepperSteps';

export type StepperStepsPosition = 'left' | ' right' | 'center';
type CommonStep<AvailableSteps extends string = string> = {
  name: AvailableSteps;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  previousLoading?: boolean;
  previousDisabled?: boolean;
  footerOptions?: ModalFooterProps;
  component: React.ReactNode;
  autoNext?: boolean;
  autoBack?: boolean;
  isHidden?: boolean;
  hidePagination?: boolean;
  isIndependent?: boolean;
  padded?: boolean;
  sideComponent?: React.ReactNode;
  isContracted?: boolean;
  noMarginTop?: boolean;
};
export type Step<AvailableSteps extends string = string> =
  | (CommonStep<AvailableSteps> & {
      sideComponent?: undefined;
      isContracted?: false;
    })
  | (CommonStep<AvailableSteps> & {
      sideComponent: React.ReactNode;
      isContracted: true;
    });

export interface ModalStepperProps {
  steps?: Step[];
  hidePagination?: boolean;
  activeStep?: string | number;
  padding?: number;
  /**
   * @deprecated This should not be use anymore since it triggers before an actual step change
   * Remained here to support rsa
   */
  onStepChange?: (currentStep: number, name: string, step: Step) => void;
  // A more restricted and co
  onStepChangeName?: (currentStep: number, name: string, step: Step) => void;
  variant?: 'default' | 'bottom';
  stepperStepsPosition?: StepperStepsPosition;
  bgColor?: string;
  slice?: SetupSliceType<any>;
  scrollToTop?: boolean;
  modalBodyMode?: 'fill';
}

export const ModalStepper = (props: ModalStepperProps) => {
  const {
    steps,
    activeStep,
    onStepChange,
    onStepChangeName,
    hidePagination = false,
    padding,
    variant = 'default',
    stepperStepsPosition = 'left',
    scrollToTop,
    modalBodyMode,
    slice,
  } = props;
  let { bgColor } = props;
  const { activeStepInStepper, currentStepOpts, innerVisibleSteps } = useStepper(
    steps,
    activeStep,
    onStepChange,
    onStepChangeName,
  );

  bgColor = parseCssVariable(bgColor);
  const scrollToTopFn = useScrollToTop();
  const ref = useRef<HTMLDivElement | null>(null);
  // D9: consumer setters go through the single dispatch shim (dispatches any non-undefined result).
  const dispatch = useLegacyDispatch();
  useEffect(() => {
    if (ref.current && scrollToTop) {
      setTimeout(() => {
        scrollToTopFn(ref);
      }, 100);
    }
  }, [ref.current, scrollToTop]);

  useEffect(() => {
    if (slice && slice.setStep && currentStepOpts) {
      dispatch(slice.setStep(currentStepOpts.name));
    }
  }, [currentStepOpts]);

  if (variant === 'bottom') {
    return (
      <div>
        <ModalBody innerRef={ref} padding={padding} mode={modalBodyMode}>
          {currentStepOpts?.component}
        </ModalBody>
        <div ref={ref} className={classNames(dFlex, justifyContentBetween, alignItemsCenter)}>
          <div style={{ padding: '16px 32px 32px 32px' }} className={styles.bottomStepperSteps}>
            <Text color={'--n400'} translate={false}>
              {activeStepInStepper}/{innerVisibleSteps.length}
            </Text>
          </div>
          <Render if={!!currentStepOpts?.footerOptions}>
            <ModalFooter
              buttonsPosition={'end'}
              {...currentStepOpts?.footerOptions}
              positive={currentStepOpts?.footerOptions?.positive}
              negative={currentStepOpts?.footerOptions?.negative}
              padding={'16px 32px 32px 32px'}
              buttonsShape={'round'}
            />
          </Render>
        </div>
      </div>
    );
  }

  return (
    <div
      style={
        modalBodyMode === 'fill'
          ? {
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              flex: 1,
            }
          : {}
      }
    >
      <ModalBody innerRef={ref} padding={padding} bgColor={bgColor} mode={modalBodyMode}>
        <Render if={!currentStepOpts?.hidePagination && !hidePagination}>
          <div
            className={classNames(
              dFlex,
              mb2,
              currentStepOpts?.noMarginTop ? undefined : mt6,
              currentStepOpts?.padded ? styles.padded : undefined,
              styles[`stepperPosition${capitalizeFirstLetter(stepperStepsPosition ?? '')}`],
            )}
          >
            <ModalStepperSteps activeIndex={activeStepInStepper} stepsCount={innerVisibleSteps.length} />
          </div>
        </Render>

        {currentStepOpts?.component}
      </ModalBody>

      <Render
        if={
          currentStepOpts?.footerOptions?.positive !== null ||
          currentStepOpts?.footerOptions?.negative !== null ||
          currentStepOpts?.footerOptions?.neutral !== null
        }
      >
        <ModalFooter
          buttonsPosition={'between'}
          {...currentStepOpts?.footerOptions}
          positive={currentStepOpts?.footerOptions?.positive}
          negative={currentStepOpts?.footerOptions?.negative}
          neutral={currentStepOpts?.footerOptions?.neutral}
        />
      </Render>
    </div>
  );
};
