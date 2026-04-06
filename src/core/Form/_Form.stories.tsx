import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { Form } from "@vanguard/Form/Form";
import { formStore } from "./stories/bootstrap/form.test.slice";
import { Story } from "./stories/_Form.default";
import { ArrayInputsChangeTracking as _ArrayInputsChangeTracking } from "./stories/ArrayInputsChangeTracking.story";
import { BasicChildren as _BasicChildren } from "./stories/BasicChildren.story";
import { BlurOnlyValidation as _BlurOnlyValidation } from "./stories/BlurOnlyValidation.story";
import { CheckBoxStoreIntegration as _CheckBoxStoreIntegration } from "./stories/CheckBoxStoreIntegration.story";
import { ChildRemovalValidationRecovery as _ChildRemovalValidationRecovery } from "./stories/ChildRemovalValidationRecovery.story";
import { ConfiglessChildRemovalSafety as _ConfiglessChildRemovalSafety } from "./stories/ConfiglessChildRemovalSafety.story";
import { DeveloperPassErrorHandling as _DeveloperPassErrorHandling } from "./stories/DeveloperPassErrorHandling.story";
import { FormConfigPropCompatibility as _FormConfigPropCompatibility } from "./stories/FormConfigPropCompatibility.story";
import { FormValidationColorPicker as _FormValidationColorPicker } from "./stories/FormValidationColorPicker.story";
import { FormValidationInput as _FormValidationInput } from "./stories/FormValidationInput.story";
import { MultiFieldStatusAggregation as _MultiFieldStatusAggregation } from "./stories/MultiFieldStatusAggregation.story";
import { NestedContainerFields as _NestedContainerFields } from "./stories/NestedContainerFields.story";
import { NestedFormContextForwarding as _NestedFormContextForwarding } from "./stories/NestedFormContextForwarding.story";
import { PhoneNumberStoreIntegration as _PhoneNumberStoreIntegration } from "./stories/PhoneNumberStoreIntegration.story";
import { ResetToInitialValueChangeDetection as _ResetToInitialValueChangeDetection } from "./stories/ResetToInitialValueChangeDetection.story";
import { SelectChangeDetection as _SelectChangeDetection } from "./stories/SelectChangeDetection.story";
import { TextareaStoreIntegration as _TextareaStoreIntegration } from "./stories/TextareaStoreIntegration.story";
import { WithClassName as _WithClassName } from "./stories/WithClassName.story";
import { WithOnChange as _WithOnChange } from "./stories/WithOnChange.story";
import { WithOnSubmit as _WithOnSubmit } from "./stories/WithOnSubmit.story";

export const BasicChildren: Story = { ..._BasicChildren };
export const WithClassName: Story = { ..._WithClassName };
export const WithOnSubmit: Story = { ..._WithOnSubmit };

export default {
  ...SbDecorator({
    title: "Vanguard/Form",
    component: Form,
    render: (args) => <Form {...args} />,
    opts: {
      customStore: formStore,
    },
  }),
};
