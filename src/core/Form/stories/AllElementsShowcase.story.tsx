import React from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import { useFormConfig } from '@custom-hooks/useFormConfig';
import { CheckBox } from '@vanguard/CheckBox/CheckBox';
import { ColorPicker } from '@vanguard/ColorPicker/ColorPicker';
import { Form } from '@vanguard/Form/Form';
import { Input } from '@vanguard/Input/Input';
import { PhoneNumber } from '@vanguard/PhoneNumber';
import { Select } from '@vanguard/Select/Select';
import { Textarea } from '@vanguard/Textarea/Textarea';

import { ShowcaseRootState, ShowcaseSlice } from './bootstrap/showcase.test.slice';
import {
  Story,
  createMockColorPickerChange,
  createMockFormChange,
  createMockInputEmailChange,
  createMockInputNumberChange,
  createMockInputPasswordChange,
  createMockInputTextChange,
  createMockNotesChange,
  createMockPhoneNumberChange,
  createMockSelectChange,
  createMockTermsAcceptedChange,
  loadedInputValues,
  showcaseCmsOptions,
  showcasePhoneCountryCode,
  testColors,
  testInputValues,
  waitForFormUpdate,
} from './_FormShowcase.default';

const formChange = createMockFormChange();
const colorPickerChange = createMockColorPickerChange();
const inputTextChange = createMockInputTextChange();
const inputNumberChange = createMockInputNumberChange();
const inputEmailChange = createMockInputEmailChange();
const inputPasswordChange = createMockInputPasswordChange();
const notesChange = createMockNotesChange();
const selectChange = createMockSelectChange();
const termsAcceptedChange = createMockTermsAcceptedChange();
const phoneNumberChange = createMockPhoneNumberChange();

const clearShowcaseMocks = () => {
  formChange.mockClear();
  colorPickerChange.mockClear();
  inputTextChange.mockClear();
  inputNumberChange.mockClear();
  inputEmailChange.mockClear();
  inputPasswordChange.mockClear();
  notesChange.mockClear();
  selectChange.mockClear();
  termsAcceptedChange.mockClear();
  phoneNumberChange.mockClear();
};

const updateInputValue = (
  element: HTMLInputElement | HTMLTextAreaElement,
  nextValue: string,
) => {
  fireEvent.focus(element);
  fireEvent.input(element, { target: { value: nextValue } });
  fireEvent.change(element, { target: { value: nextValue } });
  fireEvent.blur(element);
};

type ShowcaseHarnessProps = {
  simulateApiLoad?: boolean;
};

const ShowcaseHarness = ({ simulateApiLoad = false }: ShowcaseHarnessProps) => {
  const dispatch = useDispatch();
  const {
    colorValue,
    inputTextValue,
    inputNumberValue,
    inputEmailValue,
    inputPasswordValue,
    notesValue,
    phoneNumberValue,
    selectedCmsValue,
    termsAcceptedValue,
  } = useSelector((s: ShowcaseRootState) => s.showcase);
  const [isLoading, setIsLoading] = React.useState(simulateApiLoad);

  React.useEffect(() => {
    dispatch(ShowcaseSlice.resetState());
  }, [dispatch]);

  React.useEffect(() => {
    if (!simulateApiLoad) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch(ShowcaseSlice.setAll(loadedInputValues));
      setIsLoading(false);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [dispatch, simulateApiLoad]);

  const { formConfig } = useFormConfig({
    slice: ShowcaseSlice,
    reducer: ((s: ShowcaseRootState) => s.showcase) as any,
    inputs: {
      colorValue: {
        fieldType: 'ColorPicker',
        validation: {
          required: true,
        },
      },
      inputEmailValue: {
        validation: {
          required: true,
          validateEmail: true,
        },
      },
      inputNumberValue: {
        fieldType: 'InputNumber',
        validation: {
          required: true,
          gte: 1,
          lte: 1000,
        },
      },
      inputPasswordValue: {
        validation: {
          required: true,
          minLength: 8,
        },
      },
      inputTextValue: {
        validation: {
          required: true,
          minLength: 3,
        },
      },
      notesValue: {
        fieldType: 'Textarea',
        validation: {
          required: true,
          minLength: 10,
        },
      },
      phoneNumberValue: {
        validation: {
          required: true,
          validatePhone: true,
        },
      },
      selectedCmsValue: {
        fieldType: 'Select',
      },
      termsAcceptedValue: {
        fieldType: 'Checkbox',
      },
    },
  });

  return (
    <div
      className={classNames('form-showcase-container')}
      style={{ padding: '20px', maxWidth: '600px' }}
      data-testid="form-showcase"
    >
      <h2>Form Elements Showcase</h2>
      <p>All supported store-backed inputs rendered in one form.</p>
      <p data-testid="api-loading-state">{isLoading ? 'loading' : 'loaded'}</p>

      <Form config={formConfig} onChange={formChange}>
        <div className={classNames('form-section')} style={{ marginBottom: '24px' }}>
          <h3>Color Selection</h3>
          <ColorPicker
            label="Choose a color"
            color={colorValue}
            formconfig={formConfig.colorValue}
            onColorChange={colorPickerChange}
            maxWidth="300px"
            testId="color-picker-showcase"
          />
        </div>

        <div className={classNames('form-section')} style={{ marginBottom: '24px' }}>
          <h3>Text Inputs</h3>

          <div style={{ marginBottom: '16px' }}>
            <Input
              label="Text Input"
              value={inputTextValue}
              valueAsDefaultValue={false}
              formconfig={formConfig.inputTextValue}
              onChange={inputTextChange}
              testId="input-text-showcase"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Input
              label="Number Input"
              type="number"
              value={inputNumberValue}
              valueAsDefaultValue={false}
              formconfig={formConfig.inputNumberValue}
              onChange={inputNumberChange}
              testId="input-number-showcase"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Input
              label="Email Input"
              type="email"
              value={inputEmailValue}
              valueAsDefaultValue={false}
              formconfig={formConfig.inputEmailValue}
              onChange={inputEmailChange}
              testId="input-email-showcase"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Input
              label="Password Input"
              type="password"
              value={inputPasswordValue}
              valueAsDefaultValue={false}
              formconfig={formConfig.inputPasswordValue}
              onChange={inputPasswordChange}
              testId="input-password-showcase"
            />
          </div>
        </div>

        <div className={classNames('form-section')} style={{ marginBottom: '24px' }}>
          <h3>Textarea</h3>
          <Textarea
            label="Notes"
            value={notesValue}
            valueAsDefaultValue={false}
            formconfig={formConfig.notesValue}
            onChange={notesChange}
            testId="textarea-showcase"
          />
        </div>

        <div className={classNames('form-section')} style={{ marginBottom: '24px' }}>
          <h3>Selections</h3>

          <div style={{ marginBottom: '16px' }}>
            <Select
              label="CMS Platform"
              options={[...showcaseCmsOptions]}
              value={selectedCmsValue}
              valueAsDefaultValue={false}
              formconfig={formConfig.selectedCmsValue}
              onChange={selectChange}
              translateOptions={false}
              testId="cms-select-showcase"
            />
          </div>

          <CheckBox
            label="Accept terms"
            checked={termsAcceptedValue}
            formconfig={formConfig.termsAcceptedValue}
            onChange={termsAcceptedChange}
            testId="checkbox-showcase"
          />
        </div>

        <div className={classNames('form-section')} style={{ marginBottom: '24px' }}>
          <h3>Phone Number</h3>
          <div data-testid="phone-number-showcase">
            <PhoneNumber
              phoneNumberBase={phoneNumberValue}
              formConfig={formConfig.phoneNumberValue}
              countryCode={showcasePhoneCountryCode}
              id="phone-number-showcase-input"
              phoneNumberBaseInputEvents={{ onChange: phoneNumberChange }}
            />
          </div>
        </div>
      </Form>

      <div className="debug-section" data-testid="showcase-debug">
        <div data-testid="debug-colorValue">{colorValue}</div>
        <div data-testid="debug-inputTextValue">{inputTextValue}</div>
        <div data-testid="debug-inputNumberValue">{inputNumberValue}</div>
        <div data-testid="debug-inputEmailValue">{inputEmailValue}</div>
        <div data-testid="debug-inputPasswordValue">{inputPasswordValue}</div>
        <div data-testid="debug-notesValue">{notesValue}</div>
        <div data-testid="debug-phoneNumberValue">{phoneNumberValue}</div>
        <div data-testid="debug-selectedCmsValue">{selectedCmsValue}</div>
        <div data-testid="debug-termsAcceptedValue">{termsAcceptedValue ? 'true' : 'false'}</div>
      </div>
    </div>
  );
};

export const AllElementsShowcase: Story = {
  beforeEach: () => {
    clearShowcaseMocks();
  },
  render: () => <ShowcaseHarness />,
};

export const StoreFirstApiLoadReflectsInUi: Story = {
  beforeEach: () => {
    clearShowcaseMocks();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('api-loading-state')).toHaveTextContent('loading');
    await waitFor(() => expect(canvas.getByTestId('api-loading-state')).toHaveTextContent('loaded'));

    const textInputField = canvas.getByTestId('input-text-showcase').querySelector('input[type="text"]') as HTMLInputElement;
    const numberInputField =
      canvas.getByTestId('input-number-showcase').querySelector('input[type="number"]') as HTMLInputElement;
    const emailInputField =
      canvas.getByTestId('input-email-showcase').querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInputField =
      canvas.getByTestId('input-password-showcase').querySelector('input[type="password"]') as HTMLInputElement;
    const notesField = canvas.getByTestId('textarea-showcase').querySelector('textarea') as HTMLTextAreaElement;
    const checkbox = canvas.getByTestId('checkbox-showcase').querySelector('input[type="checkbox"]') as HTMLInputElement;
    const phoneInputs = canvas.getByTestId('phone-number-showcase').querySelectorAll('input');
    const phoneInputField = phoneInputs[phoneInputs.length - 1] as HTMLInputElement;
    const colorTextInput = canvas.getByTestId('color-picker-showcase-text').querySelector('input') as HTMLInputElement;
    const selectButton = canvas.getByRole('combobox');

    await expect(textInputField).toHaveDisplayValue(loadedInputValues.inputTextValue);
    await expect(numberInputField).toHaveDisplayValue(loadedInputValues.inputNumberValue.toString());
    await expect(emailInputField).toHaveDisplayValue(loadedInputValues.inputEmailValue);
    await expect(passwordInputField).toHaveDisplayValue(loadedInputValues.inputPasswordValue);
    await expect(notesField).toHaveValue(loadedInputValues.notesValue);
    await expect(checkbox).toBeChecked();
    await expect(phoneInputField.value.replace(/\D/g, '')).toContain(loadedInputValues.phoneNumberValue);
    await expect(colorTextInput).toHaveDisplayValue(loadedInputValues.colorValue);
    await expect(selectButton).toHaveTextContent(loadedInputValues.selectedCmsValue);

    await expect(canvas.getByTestId('debug-inputTextValue')).toHaveTextContent(loadedInputValues.inputTextValue);
    await expect(canvas.getByTestId('debug-inputNumberValue')).toHaveTextContent(
      loadedInputValues.inputNumberValue.toString(),
    );
    await expect(canvas.getByTestId('debug-inputEmailValue')).toHaveTextContent(loadedInputValues.inputEmailValue);
    await expect(canvas.getByTestId('debug-inputPasswordValue')).toHaveTextContent(loadedInputValues.inputPasswordValue);
    await expect(canvas.getByTestId('debug-notesValue')).toHaveTextContent(loadedInputValues.notesValue);
    await expect(canvas.getByTestId('debug-selectedCmsValue')).toHaveTextContent(loadedInputValues.selectedCmsValue);
    await expect(canvas.getByTestId('debug-termsAcceptedValue')).toHaveTextContent('true');
  },
  render: () => <ShowcaseHarness simulateApiLoad={true} />,
};

export const UiFirstChangesReflectInStore: Story = {
  beforeEach: () => {
    clearShowcaseMocks();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    const textInputField = canvas.getByTestId('input-text-showcase').querySelector('input[type="text"]') as HTMLInputElement;
    updateInputValue(textInputField, testInputValues.text.updated);
    await expect(canvas.getByTestId('debug-inputTextValue')).toHaveTextContent(testInputValues.text.updated);

    const numberInputField =
      canvas.getByTestId('input-number-showcase').querySelector('input[type="number"]') as HTMLInputElement;
    updateInputValue(numberInputField, testInputValues.number.updated.toString());
    await expect(canvas.getByTestId('debug-inputNumberValue')).toHaveTextContent(testInputValues.number.updated.toString());

    const emailInputField =
      canvas.getByTestId('input-email-showcase').querySelector('input[type="email"]') as HTMLInputElement;
    updateInputValue(emailInputField, testInputValues.email.updated);
    await expect(canvas.getByTestId('debug-inputEmailValue')).toHaveTextContent(testInputValues.email.updated);

    const passwordInputField =
      canvas.getByTestId('input-password-showcase').querySelector('input[type="password"]') as HTMLInputElement;
    updateInputValue(passwordInputField, testInputValues.password.updated);
    await expect(canvas.getByTestId('debug-inputPasswordValue')).toHaveTextContent(testInputValues.password.updated);

    const notesField = canvas.getByTestId('textarea-showcase').querySelector('textarea') as HTMLTextAreaElement;
    updateInputValue(notesField, testInputValues.notes.updated);
    await expect(canvas.getByTestId('debug-notesValue')).toHaveTextContent(testInputValues.notes.updated);

    const checkbox = canvas.getByTestId('checkbox-showcase').querySelector('input[type="checkbox"]') as HTMLInputElement;
    await user.click(canvas.getByText('Accept terms'));
    await expect(canvas.getByTestId('debug-termsAcceptedValue')).toHaveTextContent('true');

    const colorTextInput = canvas.getByTestId('color-picker-showcase-text').querySelector('input') as HTMLInputElement;
    updateInputValue(colorTextInput, testColors.red);
    await waitForFormUpdate(150);
    await expect(canvas.getByTestId('debug-colorValue')).toHaveTextContent(testColors.red);

    const selectButton = canvas.getByRole('combobox');
    await user.click(selectButton);
    const listbox = await within(canvasElement.ownerDocument.body).findByRole('listbox');
    await user.click(within(listbox).getByText(testInputValues.selectedCms.updated));
    await expect(canvas.getByTestId('debug-selectedCmsValue')).toHaveTextContent(testInputValues.selectedCms.updated);

    const phoneInputs = canvas.getByTestId('phone-number-showcase').querySelectorAll('input');
    const phoneInputField = phoneInputs[phoneInputs.length - 1] as HTMLInputElement;
    updateInputValue(phoneInputField, testInputValues.phoneNumber.updated);
    await waitForFormUpdate(300);
    await expect(canvas.getByTestId('debug-phoneNumberValue').textContent?.replace(/\D/g, '')).toContain(
      testInputValues.phoneNumber.updated,
    );

    await expect(formChange).toHaveBeenCalled();
    await expect(inputTextChange).toHaveBeenCalled();
    await expect(inputNumberChange).toHaveBeenCalled();
    await expect(inputEmailChange).toHaveBeenCalled();
    await expect(inputPasswordChange).toHaveBeenCalled();
    await expect(notesChange).toHaveBeenCalled();
    await expect(selectChange).toHaveBeenCalled();
    await expect(termsAcceptedChange).toHaveBeenCalled();
    await expect(phoneNumberChange).toHaveBeenCalled();
    await expect(colorPickerChange).toHaveBeenCalled();
  },
  render: () => <ShowcaseHarness />,
};
