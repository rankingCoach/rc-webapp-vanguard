import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { formStore } from "./stories/bootstrap/form.test.slice";
import { Form } from "@vanguard/Form/Form";
import { Story } from "./stories/_Form.default";
import { FormValidationColorPicker as _FormValidationColorPicker } from "./stories/FormValidationColorPicker.story";
import { FormValidationInput as _FormValidationInput } from "./stories/FormValidationInput.story";
import { WithClassName as _WithClassName } from "./stories/WithClassName.story";
import { WithOnSubmit as _WithOnSubmit } from "./stories/WithOnSubmit.story";
import { BasicChildren as _BasicChildren } from "./stories/BasicChildren.story";
import { WithOnChange as _WithOnChange } from "./stories/WithOnChange.story";
import { SelectChangeDetection as _SelectChangeDetection } from "./stories/SelectChangeDetection.story";

export default {
  ...SbDecorator({
    title: "Vanguard/Form",
    component: Form,
    opts: {
      customStore: formStore,
    },
  }),
};

export const FormValidationColorPicker: Story = { ..._FormValidationColorPicker };
export const FormValidationInput: Story = { ..._FormValidationInput };
export const WithClassName: Story = { ..._WithClassName };
export const WithOnSubmit: Story = { ..._WithOnSubmit };
export const BasicChildren: Story = { ..._BasicChildren };
export const WithOnChange: Story = { ..._WithOnChange };
export const SelectChangeDetection: Story = { ..._SelectChangeDetection };