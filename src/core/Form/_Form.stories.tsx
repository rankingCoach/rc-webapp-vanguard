import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { Form } from "@vanguard/Form/Form";
import { FormSLice, formStore } from "./stories/bootstrap/form.test.slice";
import { Story } from "./stories/_Form.default";
import { ArrayInputsChangeTracking as _ArrayInputsChangeTracking } from "./stories/ArrayInputsChangeTracking.story";
import { ArrayIndexReassignment as _ArrayIndexReassignment } from "./stories/ArrayIndexReassignment.story";
import { BasicChildren as _BasicChildren } from "./stories/BasicChildren.story";
import { BlurOnlyValidation as _BlurOnlyValidation } from "./stories/BlurOnlyValidation.story";
import { CheckBoxStoreIntegration as _CheckBoxStoreIntegration } from "./stories/CheckBoxStoreIntegration.story";
import { ChildRemovalValidationRecovery as _ChildRemovalValidationRecovery } from "./stories/ChildRemovalValidationRecovery.story";
import { ConfiglessChildRemovalSafety as _ConfiglessChildRemovalSafety } from "./stories/ConfiglessChildRemovalSafety.story";
import { DeveloperPassErrorHandling as _DeveloperPassErrorHandling } from "./stories/DeveloperPassErrorHandling.story";
import { DirtyStateArrayLifecycle as _DirtyStateArrayLifecycle } from "./stories/DirtyStateArrayLifecycle.story";
import { DirtyStateInitialClean as _DirtyStateInitialClean } from "./stories/DirtyStateInitialClean.story";
import { DirtyStateMultiFieldRevert as _DirtyStateMultiFieldRevert } from "./stories/DirtyStateMultiFieldRevert.story";
import { DirtyStateSingleFieldLifecycle as _DirtyStateSingleFieldLifecycle } from "./stories/DirtyStateSingleFieldLifecycle.story";
import { FormMethodsLifecycle as _FormMethodsLifecycle } from "./stories/FormMethodsLifecycle.story";
import { FormConfigPropCompatibility as _FormConfigPropCompatibility } from "./stories/FormConfigPropCompatibility.story";
import { FormValidationColorPicker as _FormValidationColorPicker } from "./stories/FormValidationColorPicker.story";
import { FormValidationInput as _FormValidationInput } from "./stories/FormValidationInput.story";
import { InitialMountStatusContract as _InitialMountStatusContract } from "./stories/InitialMountStatusContract.story";
import { MixedConfigKeyNesting as _MixedConfigKeyNesting } from "./stories/MixedConfigKeyNesting.story";
import { MultiFieldStatusAggregation as _MultiFieldStatusAggregation } from "./stories/MultiFieldStatusAggregation.story";
import { NestedContainerFields as _NestedContainerFields } from "./stories/NestedContainerFields.story";
import { NestedFormContextForwarding as _NestedFormContextForwarding } from "./stories/NestedFormContextForwarding.story";
import { PhoneNumberStoreIntegration as _PhoneNumberStoreIntegration } from "./stories/PhoneNumberStoreIntegration.story";
import { ResetToInitialValueChangeDetection as _ResetToInitialValueChangeDetection } from "./stories/ResetToInitialValueChangeDetection.story";
import { SeparateNestedConfigIsolation as _SeparateNestedConfigIsolation } from "./stories/SeparateNestedConfigIsolation.story";
import { SelectChangeDetection as _SelectChangeDetection } from "./stories/SelectChangeDetection.story";
import { TextareaStoreIntegration as _TextareaStoreIntegration } from "./stories/TextareaStoreIntegration.story";
import { WithClassName as _WithClassName } from "./stories/WithClassName.story";
import { WithOnChange as _WithOnChange } from "./stories/WithOnChange.story";
import { WithOnSubmit as _WithOnSubmit } from "./stories/WithOnSubmit.story";

export const ArrayInputsChangeTracking: Story = { ..._ArrayInputsChangeTracking };
export const ArrayIndexReassignment: Story = { ..._ArrayIndexReassignment };
export const BasicChildren: Story = { ..._BasicChildren };
export const BlurOnlyValidation: Story = { ..._BlurOnlyValidation };
export const CheckBoxStoreIntegration: Story = { ..._CheckBoxStoreIntegration };
export const ChildRemovalValidationRecovery: Story = { ..._ChildRemovalValidationRecovery };
export const ConfiglessChildRemovalSafety: Story = { ..._ConfiglessChildRemovalSafety };
export const DeveloperPassErrorHandling: Story = { ..._DeveloperPassErrorHandling };
export const DirtyStateArrayLifecycle: Story = { ..._DirtyStateArrayLifecycle };
export const DirtyStateInitialClean: Story = { ..._DirtyStateInitialClean };
export const DirtyStateMultiFieldRevert: Story = { ..._DirtyStateMultiFieldRevert };
export const DirtyStateSingleFieldLifecycle: Story = { ..._DirtyStateSingleFieldLifecycle };
export const FormMethodsLifecycle: Story = { ..._FormMethodsLifecycle };
export const FormConfigPropCompatibility: Story = { ..._FormConfigPropCompatibility };
export const FormValidationColorPicker: Story = { ..._FormValidationColorPicker };
export const FormValidationInput: Story = { ..._FormValidationInput };
export const InitialMountStatusContract: Story = { ..._InitialMountStatusContract };
export const MixedConfigKeyNesting: Story = { ..._MixedConfigKeyNesting };
export const MultiFieldStatusAggregation: Story = { ..._MultiFieldStatusAggregation };
export const NestedContainerFields: Story = { ..._NestedContainerFields };
export const NestedFormContextForwarding: Story = { ..._NestedFormContextForwarding };
export const PhoneNumberStoreIntegration: Story = { ..._PhoneNumberStoreIntegration };
export const ResetToInitialValueChangeDetection: Story = { ..._ResetToInitialValueChangeDetection };
export const SeparateNestedConfigIsolation: Story = { ..._SeparateNestedConfigIsolation };
export const SelectChangeDetection: Story = { ..._SelectChangeDetection };
export const TextareaStoreIntegration: Story = { ..._TextareaStoreIntegration };
export const WithClassName: Story = { ..._WithClassName };
export const WithOnChange: Story = { ..._WithOnChange };
export const WithOnSubmit: Story = { ..._WithOnSubmit };

const meta = SbDecorator({
    title: "Vanguard/Form",
    component: Form,
    opts: {
      customStore: formStore,
    },
  });

export default {
  ...meta,
  decorators: [
    (Story: any) => {
      formStore.dispatch(FormSLice.resetState());
      return <Story />;
    },
    ...(meta.decorators ?? []),
  ],
};
