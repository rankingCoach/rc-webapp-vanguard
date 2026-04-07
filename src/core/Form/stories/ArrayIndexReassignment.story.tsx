import React from "react";
import { Form } from "@vanguard/Form/Form";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

const ArrayPositionProbe = ({ testId, formconfig }: { testId: string; formconfig?: any }) => {
  return (
    <div data-testid={testId}>
      <span data-testid={`${testId}-position`}>{formconfig?.arrayPosition ?? "none"}</span>
      <span data-testid={`${testId}-value`}>{formconfig?.stateValue ?? "(empty)"}</span>
    </div>
  );
};

export const ArrayIndexReassignment: Story = {
  render: () => {
    const [reverseOrder, setReverseOrder] = React.useState(false);

    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        items: {
          fieldType: "Input",
          isArray: true,
        },
      },
    });

    return (
      <div data-testid="array-index-reassignment-story">
        <button type="button" data-testid="array-index-toggle" onClick={() => setReverseOrder((prev) => !prev)}>
          toggle
        </button>
        <Form config={formConfig}>
          {reverseOrder ? (
            <>
              <ArrayPositionProbe key="probe-b" testId="probe-b" formconfig={formConfig.items} />
              <ArrayPositionProbe key="probe-a" testId="probe-a" formconfig={formConfig.items} />
            </>
          ) : (
            <>
              <ArrayPositionProbe key="probe-a" testId="probe-a" formconfig={formConfig.items} />
              <ArrayPositionProbe key="probe-b" testId="probe-b" formconfig={formConfig.items} />
            </>
          )}
        </Form>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await waitForFormUpdate(100);

    await expect(canvas.getByTestId("probe-a-position")).toHaveTextContent("0");
    await expect(canvas.getByTestId("probe-a-value")).toHaveTextContent("first item");
    await expect(canvas.getByTestId("probe-b-position")).toHaveTextContent("1");
    await expect(canvas.getByTestId("probe-b-value")).toHaveTextContent("second item");

    await user.click(canvas.getByTestId("array-index-toggle"));
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("probe-a-position")).toHaveTextContent("1");
    await expect(canvas.getByTestId("probe-a-value")).toHaveTextContent("second item");
    await expect(canvas.getByTestId("probe-b-position")).toHaveTextContent("0");
    await expect(canvas.getByTestId("probe-b-value")).toHaveTextContent("first item");
  },
};
