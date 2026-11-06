import { useAppDispatch } from '@custom-hooks/use-app-dispatch';
import { ReduxGenerator } from '@helpers/redux-common';
import { combineReducers, configureStore, createSlice } from '@reduxjs/toolkit';
import { getModalNegativeCta, getModalPositiveCta } from '@test-utils/button-test-utils';
import { appScreen, render, wait } from '@test-utils/test-utils';
import { MODAL_OPEN_TIMEOUT, STEPPER_TRANSITION_TIMEOUT } from '@test-utils/timings';
import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import styles from '../ModalStepper/ModalStepperSteps/ModalStepperStep/ModalStepperStep.module.scss';
import { ModalStepper, Step } from './ModalStepper';

interface TestSlice {
    state: 'clean' | 'dirty';
  }

  const initialState: TestSlice = {
    state: 'clean',
  };
  const G = new ReduxGenerator<TestSlice>();
  const slice = createSlice({
    name: 'testSlice',
    initialState,
    reducers: {
      ...G.genAll(initialState),
    },
  });
  const rootReducer = combineReducers({
    root: slice.reducer,
  });

  const store = configureStore({
    reducer: rootReducer,
  });

  type RootState = ReturnType<typeof rootReducer>;

  const useTestGaSetupStepperConfig = (): Step[] => {
    const { state } = useSelector((state: RootState) => state.root);
    const prepareStep = (step: Step): Step => {
      if (state === 'dirty') {
        if (step.footerOptions?.positive) {
          step.footerOptions.positive.text = 'Dirty positive cta';
        }
      }

      return step;
    };
    return [
      {
        name: 'hidden1',
        component: <ComponentContainer>Hidden1</ComponentContainer>,
        isHidden: true,
      },
      {
        name: 'visible1',
        component: <ComponentContainer>Visible1</ComponentContainer>,
      },
      {
        name: 'visible2',
        component: <ComponentContainer>Visible2</ComponentContainer>,
      },
      {
        name: 'hidden2',
        component: <ComponentContainer>Hidden2</ComponentContainer>,
        isHidden: true,
      },
      {
        name: 'visible3',
        component: <ComponentContainer>Visible3</ComponentContainer>,
      },
      {
        name: 'hidden3',
        component: <ComponentContainer>Hidden3</ComponentContainer>,
        isHidden: true,
      },
      {
        name: 'visible4',
        component: <ComponentContainer>Visible4</ComponentContainer>,
      },
      {
        name: 'visible5',
        component: <ComponentContainer>Visible5</ComponentContainer>,
      },
      {
        name: 'hidden4',
        component: <ComponentContainer>Hidden4</ComponentContainer>,
        isHidden: true,
      },
      {
        name: 'hidden5',
        component: <ComponentContainer>Hidden5</ComponentContainer>,
        isHidden: true,
      },
      prepareStep({
        name: 'hidden6',
        component: <ComponentContainer>Hidden6</ComponentContainer>,
        isHidden: true,
        footerOptions: {
          positive: {
            cta: () => {},
            text: 'Clean positive cta',
          },
          negative: {
            cta: () => {},
            text: 'Clean negative cta',
          },
        },
      }),
    ];
  };

const StepperWrapper = () => {
      const [activeStep, setActiveStep] = useState<string>();
      const steps: Step[] = useTestGaSetupStepperConfig();
      const dispatch = useAppDispatch();
      const { setState } = slice.actions;
      useEffect(() => {
        setActiveStep('hidden6');
        dispatch(setState('dirty'));
      }, []);

      return <ModalStepper steps={steps} activeStep={activeStep} />;
    };

const StepChangeCallbackHarness = (steps: Step[], onStepChange: (step: number) => void) => {
      const [step, setStep] = useState('step1');

      useEffect(() => {
        setStep('step3');
      }, []);

      return (
        <div>
          <ModalStepper onStepChange={onStepChange} activeStep={step} steps={steps} />
        </div>
      );
    };


const WithInitialStepChangedHarness171 = ({ steps }: { steps: Step[] }) => {
      const [step, setStep] = useState(3);
      return (
        <div>
          <ModalStepper activeStep={step} steps={steps} />
        </div>
      );
    };

const WithInitialStepChangedHarness198 = ({ steps }: { steps: Step[] }) => {
      const [step, setStep] = useState('step3');
      return (
        <div>
          <ModalStepper activeStep={step} steps={steps} />
        </div>
      );
    };

const WithStepChangedHarness225 = ({ steps }: { steps: Step[] }) => {
      const [step, setStep] = useState(1);

      useEffect(() => {
        setStep(3);
      }, []);

      return (
        <div>
          <ModalStepper activeStep={step} steps={steps} />
        </div>
      );
    };

const WithStepChangedHarness257 = ({ steps }: { steps: Step[] }) => {
      const [step, setStep] = useState('step1');

      useEffect(() => {
        setStep('step3');
      }, []);

      return (
        <div>
          <ModalStepper activeStep={step} steps={steps} />
        </div>
      );
    };


const LintWithCustomStep694 = () => {
      const [step, setStep] = useState('visible1');
      const steps: Step[] = [
        {
          name: 'visible1',
          component: <ComponentContainer>Visible1</ComponentContainer>,
          footerOptions: {
            positive: {
              cta: () => {
                setStep('hidden2');
              },
              text: 'Positive changed changed',
            },
          },
        },
        {
          name: 'visible2',
          component: <ComponentContainer>Visible2</ComponentContainer>,
        },
        {
          name: 'hidden1',
          component: <ComponentContainer>Hidden1</ComponentContainer>,
          isHidden: true,
        },
        {
          name: 'visible3',
          component: <ComponentContainer>Visible3</ComponentContainer>,
        },
        {
          name: 'hidden2',
          component: <ComponentContainer>Hidden2</ComponentContainer>,
          isHidden: true,
        },
      ];
      return (
        <div>
          <ModalStepper activeStep={step} steps={steps} />
        </div>
      );
    };

const LintWithCustomStep743 = () => {
      const [step, setStep] = useState('visible1');
      const steps: Step[] = [
        {
          name: 'visible1',
          component: <ComponentContainer>Visible1</ComponentContainer>,
          footerOptions: {
            positive: {
              cta: () => {
                setStep('hidden1');
              },
              text: 'Positive changed changed',
            },
          },
        },
        {
          name: 'visible2',
          component: <ComponentContainer>Visible2</ComponentContainer>,
        },
        {
          name: 'hidden1',
          component: <ComponentContainer>Hidden1</ComponentContainer>,
          isHidden: true,
        },
        {
          name: 'visible3',
          component: <ComponentContainer>Visible3</ComponentContainer>,
        },
      ];
      return (
        <div>
          <ModalStepper activeStep={step} steps={steps} />
        </div>
      );
    };

const LintTestComponent521 = () => {
      const [currentStep, setCurrentStep] = useState<string | undefined>(undefined);
      const steps: Step[] = [
        {
          name: 'visible1',
          component: <ComponentContainer>Visible1</ComponentContainer>,
          footerOptions: {
            positive: {
              cta: () => {
                setCurrentStep('hidden2');
              },
              text: 'Go to hidden 2',
            },
          },
        },
        {
          name: 'hidden1',
          component: <ComponentContainer>Hidden1</ComponentContainer>,
          isHidden: true,
        },
        {
          name: 'hidden2',
          component: <ComponentContainer>Hidden2</ComponentContainer>,
          isHidden: true,
        },
      ];
      return <ModalStepper activeStep={currentStep} steps={steps} />;
    };

const LintWithCustomStep1311 = () => {
      const [step, setStep] = useState('step1');

      const steps: Step[] = [
        {
          name: 'step1',
          component: <ComponentContainer>Step1</ComponentContainer>,
          footerOptions: {
            positive: {
              cta: () => {
                setStep('step2');
              },
              text: 'Positive changed',
            },
          },
        },
        {
          name: 'step2',
          component: <ComponentContainer>Step2</ComponentContainer>,
        },
        {
          name: 'step3',
          component: <ComponentContainer>Step3</ComponentContainer>,
        },
      ];
      return (
        <div>
          <ModalStepper activeStep={step} steps={steps} />
        </div>
      );
    };

const LintWithCustomStep1355 = () => {
      const [step, setStep] = useState('step2');

      const steps: Step[] = [
        {
          name: 'step1',
          component: <ComponentContainer>Step1</ComponentContainer>,
        },
        {
          name: 'step2',
          component: <ComponentContainer>Step2</ComponentContainer>,
          footerOptions: {
            negative: {
              cta: () => {
                setStep('step1');
              },
              text: 'Negative changed',
            },
          },
        },
        {
          name: 'step3',
          component: <ComponentContainer>Step3</ComponentContainer>,
        },
      ];
      return (
        <div>
          <ModalStepper activeStep={step} steps={steps} />
        </div>
      );
    };


describe('ModalStepper uncontrolled component tests', () => {
  beforeEach(async () => {
    const steps: Step[] = [
      {
        name: 'step1',
        component: <ComponentContainer testId={'step1'}>Step1</ComponentContainer>,
      },
      {
        name: 'step2',
        component: <ComponentContainer testId={'step2'}>Step2</ComponentContainer>,
      },
      {
        name: 'step3',
        component: <ComponentContainer testId={'step3'}>Step3</ComponentContainer>,
      },
    ];

    return render(<ModalStepper steps={steps} />);
  });

  test('should render', async () => {
    render(<ModalStepper />);
  });

  test('should render first step as default', async () => {
    await appScreen.findByText('Step1');
  });

  test('should have positive text as next as default', async () => {
    await appScreen.findByText('Next');
  });

  test('should have positive text as cancel as default', async () => {
    await appScreen.findByText('Cancel');
  });

  test('should go to second step if next is clicked', async () => {
    const user = userEvent.setup();
    const cta = await getModalPositiveCta();
    user.click(cta);
    await wait(STEPPER_TRANSITION_TIMEOUT);
    await appScreen.findByText('Step2');
  });
  test('should stop at last step if clicked  over', async () => {
    const user = userEvent.setup();
    const cta = await getModalPositiveCta();
    user.click(cta);
    user.click(cta);
    user.click(cta);
    user.click(cta);
    user.click(cta);
    user.click(cta);
    user.click(cta);
    await wait(STEPPER_TRANSITION_TIMEOUT);
    await appScreen.findByText('Step3');
  });

  test('on second step cancel button becomes back', async () => {
    const user = userEvent.setup();
    const cta = await getModalPositiveCta();
    user.click(cta);
    await wait(STEPPER_TRANSITION_TIMEOUT);
    await appScreen.findByText('Back');
  });

  test('clicking back should go to step 1 ', async () => {
    const user = userEvent.setup();
    const cta = await getModalPositiveCta();
    user.click(cta);
    await wait(STEPPER_TRANSITION_TIMEOUT);
    const backCta = await getModalNegativeCta();
    user.click(backCta);
    await wait(STEPPER_TRANSITION_TIMEOUT);
    await appScreen.findByText('Step1');
  });

  test('last step should have finish as next button ', async () => {
    const user = userEvent.setup();
    const cta = await getModalPositiveCta();
    user.click(cta);
    await wait(STEPPER_TRANSITION_TIMEOUT);
    user.click(cta);
    await wait(STEPPER_TRANSITION_TIMEOUT);
    await appScreen.findByText('Step3');
    await appScreen.findByText('Finish');
  });
});
describe('BigAssModal step counter suite', () => {
  beforeEach(async () => {
    const steps: Step[] = [
      {
        name: 'step1',
        component: <ComponentContainer testId={'step1'}>Step1</ComponentContainer>,
      },
      {
        name: 'step2',
        component: <ComponentContainer testId={'step2'}>Step2</ComponentContainer>,
      },
      {
        name: 'step3',
        component: <ComponentContainer testId={'step3'}>Step3</ComponentContainer>,
      },
    ];

    return render(<ModalStepper steps={steps} />);
  });

  test('should render the steps counter', async () => {
    const steps = await appScreen.findAllByTestId('modal-stepper-step');
    expect(steps.length).toBe(3);
  });
  test('first step counter should be active as default ', async () => {
    const steps = await appScreen.findAllByTestId('modal-stepper-step');
    expect(steps[0].className).toContain(styles.active);
  });
  test('active step should change with next press ', async () => {
    const steps = await appScreen.findAllByTestId('modal-stepper-step');
    const user = userEvent.setup();
    const cta = await getModalPositiveCta();
    await user.click(cta);
    await wait(STEPPER_TRANSITION_TIMEOUT);
    expect(steps[1].className).toContain(styles.active);
  });

  test('active step should stay at last position even if we press many times  ', async () => {
    const steps = await appScreen.findAllByTestId('modal-stepper-step');
    const user = userEvent.setup();
    const cta = await getModalPositiveCta();
    await user.click(cta);
    await user.click(cta);
    await user.click(cta);
    await user.click(cta);
    await user.click(cta);
    await user.click(cta);
    await user.click(cta);
    await wait(STEPPER_TRANSITION_TIMEOUT);
    expect(steps[2].className).toContain(styles.active);
  });
});
describe('BigAssModal manual control', () => {
  test('should be able to init to any numbered step by index', async () => {
    const steps: Step[] = [
      {
        name: 'step1',
        component: <ComponentContainer>Step1</ComponentContainer>,
      },
      {
        name: 'step2',
        component: <ComponentContainer>Step2</ComponentContainer>,
      },
      {
        name: 'step3',
        component: <ComponentContainer>Step3</ComponentContainer>,
      },
    ];
    const WithInitialStepChanged = WithInitialStepChangedHarness171;

    await render(<WithInitialStepChanged steps={steps} />);
    await appScreen.findByText('Step3');
  });
  test('should be able to init to any text step by name', async () => {
    const steps: Step[] = [
      {
        name: 'step1',
        component: <ComponentContainer>Step1</ComponentContainer>,
      },
      {
        name: 'step2',
        component: <ComponentContainer>Step2</ComponentContainer>,
      },
      {
        name: 'step3',
        component: <ComponentContainer>Step3</ComponentContainer>,
      },
    ];
    const WithInitialStepChanged = WithInitialStepChangedHarness198;

    await render(<WithInitialStepChanged steps={steps} />);
    await appScreen.findByText('Step3');
  });
  test('should be able to change to any numbered step by index', async () => {
    const steps: Step[] = [
      {
        name: 'step1',
        component: <ComponentContainer>Step1</ComponentContainer>,
      },
      {
        name: 'step2',
        component: <ComponentContainer>Step2</ComponentContainer>,
      },
      {
        name: 'step3',
        component: <ComponentContainer>Step3</ComponentContainer>,
      },
    ];
    const WithStepChanged = WithStepChangedHarness225;

    await render(<WithStepChanged steps={steps} />);
    await appScreen.findByText('Step3');
  });
  test('should be able to change to any text step by name', async () => {
    const steps: Step[] = [
      {
        name: 'step1',
        component: <ComponentContainer>Step1</ComponentContainer>,
      },
      {
        name: 'step2',
        component: <ComponentContainer>Step2</ComponentContainer>,
      },
      {
        name: 'step3',
        component: <ComponentContainer>Step3</ComponentContainer>,
      },
    ];
    const WithStepChanged = WithStepChangedHarness257;

    await render(<WithStepChanged steps={steps} />);
    await appScreen.findByText('Step3');
  });

  test('should call step change callback', async () => {
    const steps: Step[] = [
      {
        name: 'step1',
        component: <ComponentContainer>Step1</ComponentContainer>,
      },
      {
        name: 'step2',
        component: <ComponentContainer>Step2</ComponentContainer>,
      },
      {
        name: 'step3',
        component: <ComponentContainer>Step3</ComponentContainer>,
      },
    ];
    let thisWillChange = null;
    const WithStepChanged = StepChangeCallbackHarness.bind(null, steps, (step) => (thisWillChange = step));

    await render(<WithStepChanged />);
    expect(thisWillChange).toBe(3);
  });
});
describe('ModalStepper custom footer', () => {
  test('with custom positive', async () => {
    const WithCustomStep1 = LintWithCustomStep1311;
    await render(<WithCustomStep1 />);

    await appScreen.findByText('Positive changed');
    const user = userEvent.setup();

    const positiveCTA = await getModalPositiveCta();

    await user.click(positiveCTA);
    await wait(STEPPER_TRANSITION_TIMEOUT);

    await appScreen.findByText('Step2');
  });
  test('with custom negative', async () => {
    const WithCustomStep1 = LintWithCustomStep1355;
    await render(<WithCustomStep1 />);

    await appScreen.findByText('Negative changed');
    const user = userEvent.setup();

    const negativeCTA = await getModalNegativeCta();

    await user.click(negativeCTA);
    await wait(STEPPER_TRANSITION_TIMEOUT);

    await appScreen.findByText('Step1');
  });
});
describe('BigAssModal with hidden steps', () => {
  let change: null | number = null;
  let changeName: null | string = null;
  beforeEach(async () => {
    const steps: Step[] = [
      {
        name: 'hidden1',
        component: <ComponentContainer>Hidden1</ComponentContainer>,
        isHidden: true,
      },
      {
        name: 'visible1',
        component: <ComponentContainer>Visible1</ComponentContainer>,
      },
      {
        name: 'visible2',
        component: <ComponentContainer>Visible2</ComponentContainer>,
      },
      {
        name: 'hidden2',
        component: <ComponentContainer>Hidden2</ComponentContainer>,
        isHidden: true,
      },
      {
        name: 'visible3',
        component: <ComponentContainer>Visible3</ComponentContainer>,
      },
      {
        name: 'hidden3',
        component: <ComponentContainer>Hidden3</ComponentContainer>,
        isHidden: true,
      },
      {
        name: 'visible4',
        component: <ComponentContainer>Visible4</ComponentContainer>,
      },
      {
        name: 'visible5',
        component: <ComponentContainer>Visible5</ComponentContainer>,
      },
      {
        name: 'hidden4',
        component: <ComponentContainer>Hidden4</ComponentContainer>,
        isHidden: true,
      },
      {
        name: 'hidden5',
        component: <ComponentContainer>Hidden5</ComponentContainer>,
        isHidden: true,
      },
      {
        name: 'hidden6',
        component: <ComponentContainer>Hidden6</ComponentContainer>,
        isHidden: true,
      },
    ];
    await render(
      <ModalStepper
        steps={steps}
        onStepChange={(value, name) => {
          change = value;
          changeName = name;
        }}
      />,
    );
  });
  test('stepper should call change if first was hidden', async () => {
    expect(change).toBe(2);
    expect(changeName).toBe('visible1');
  });
  test('stepper should ignore hidden components', async () => {
    const steps = await appScreen.findAllByTestId('modal-stepper-step');
    expect(steps.length).toBe(5);
  });
  test('stepper should ignore hidden components', async () => {
    const steps = await appScreen.findAllByTestId('modal-stepper-step');
    expect(steps.length).toBe(5);
  });
  test('if first one is hidden should render the first visible one', async () => {
    await appScreen.findByText('Visible1');
  });

  test('stepper pressing next and back should cycle only between visible components', async () => {
    const user = userEvent.setup();
    const positiveCta = await getModalPositiveCta();
    const negativeCta = await getModalNegativeCta();
    await appScreen.findByText('Visible1');
    await user.click(positiveCta);
    await wait(STEPPER_TRANSITION_TIMEOUT);
    await appScreen.findByText('Visible2');
    await user.click(positiveCta);
    await wait(STEPPER_TRANSITION_TIMEOUT);
    await appScreen.findByText('Visible3');
    await user.click(positiveCta);
    await wait(STEPPER_TRANSITION_TIMEOUT);
    await appScreen.findByText('Visible4');
    await user.click(positiveCta);
    await wait(STEPPER_TRANSITION_TIMEOUT);
    await appScreen.findByText('Visible5');

    //   Now we go back

    await user.click(negativeCta);
    await wait(STEPPER_TRANSITION_TIMEOUT);
    await appScreen.findByText('Visible4');

    await user.click(negativeCta);
    await wait(STEPPER_TRANSITION_TIMEOUT);
    await appScreen.findByText('Visible3');

    await user.click(negativeCta);
    await wait(STEPPER_TRANSITION_TIMEOUT);
    await appScreen.findByText('Visible2');

    await user.click(negativeCta);
    await wait(STEPPER_TRANSITION_TIMEOUT);
    await appScreen.findByText('Visible1');
  });
});

describe('BigAssModal with hidden steps with ending on hidden step', () => {
  beforeEach(async () => {
    const TestComponent = LintTestComponent521;

    await render(<TestComponent />);
  });

  test('stepper pressing next and back should cycle only between visible components', async () => {
    const user = userEvent.setup();
    const positiveCta = await getModalPositiveCta();

    await user.click(positiveCta);
    await wait(STEPPER_TRANSITION_TIMEOUT);
    const negativeCta = await getModalNegativeCta();
    await user.click(negativeCta);
    await wait(STEPPER_TRANSITION_TIMEOUT);
    await appScreen.findByText('Visible1');
  });
});
describe('BigAssModal with hidden steps and custom footer', () => {


  beforeEach(async () => {

    await render(<StepperWrapper />, undefined, store);
  });

  test('stepper changes footer options when state changes', async () => {
    const user = userEvent.setup();
    await wait(MODAL_OPEN_TIMEOUT);
    await appScreen.findByText('Hidden6');
    const positiveCta = await getModalPositiveCta();
    const negativeCta = await getModalNegativeCta();

    await within(positiveCta).findByText('Dirty positive cta');
  });
});
describe('navigation to hidden component by name', () => {
  test('can navigate to hidden component by name', async () => {
    const WithCustomStep = LintWithCustomStep694;
    await render(<WithCustomStep />);
    const user = userEvent.setup();
    const positiveCTA = await getModalPositiveCta();
    await user.click(positiveCTA);
    await wait(STEPPER_TRANSITION_TIMEOUT);

    await appScreen.findByText('Hidden2');
  });
  test('when on a hidden component stepper should remain on last step', async () => {
    const WithCustomStep = LintWithCustomStep743;
    await render(<WithCustomStep />);
    const user = userEvent.setup();
    const positiveCTA = await getModalPositiveCta();
    await user.click(positiveCTA);
    await wait(STEPPER_TRANSITION_TIMEOUT);
    const steps = await appScreen.findAllByTestId('modal-stepper-step');
    expect(steps[steps.length - 1].className).toContain(styles.active);
  });
});
