# ModalStepper

Stepper UI for multi-step modals, providing next/prev controls and step indicators.

- Kind: component
- Import: `import { ModalStepper } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Modal/ModalStepper/ModalStepper.tsx`
- Keywords: modal, stepper, wizard, steps, multi-step, navigation

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `activeStep` | `string \| number` | no |  |
| `bgColor` | `string` | no |  |
| `hidePagination` | `boolean` | no |  |
| `modalBodyMode` | `"fill"` | no |  |
| `onStepChange` | `(currentStep: number, name: string, step: Step<string>) => void` | no |  |
| `onStepChangeName` | `(currentStep: number, name: string, step: Step<string>) => void` | no |  |
| `padding` | `number` | no |  |
| `scrollToTop` | `boolean` | no |  |
| `slice` | `SetupSliceType<any>` | no |  |
| `stepperStepsPosition` | `StepperStepsPosition` | no |  |
| `steps` | `Step<string>[]` | no |  |
| `variant` | `"default" \| "bottom"` | no |  |

## Examples

From `src/core/Modal/ModalStepper/stories/ModalStepperBasicStory.story.tsx`:

```tsx
import React from "react";
import { ComponentContainer } from "@vanguard/ComponentContainer/ComponentContainer";
import { Story } from "./_ModalStepper.default";

const steps = [
  {
    name: "step1",
    component: <ComponentContainer testId={"step1"}>Step1</ComponentContainer>,
  },
  {
    name: "step2",
    component: <ComponentContainer testId={"step2"}>Step2</ComponentContainer>,
  },
  {
    name: "step3",
    component: <ComponentContainer testId={"step3"}>Step3</ComponentContainer>,
  },
];

export const ModalStepperBasicStory: Story = {
  args: {
    steps,
  },
};
```

From `src/core/Modal/ModalStepper/stories/ModalStepperStory.story.tsx`:

```tsx
import React from "react";
import { ModalStepper } from "../ModalStepper";
import { Story } from "./_ModalStepper.default";

export const ModalStepperStory: Story = {
  render: (args) => (
    <div>
      <ModalStepper {...args}>ImplementME</ModalStepper>
    </div>
  ),
};
```
