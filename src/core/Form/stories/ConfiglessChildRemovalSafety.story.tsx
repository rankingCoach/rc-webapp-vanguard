import React from "react";
import { Form } from "@vanguard/Form/Form";
import { within, expect, userEvent } from "storybook/test";
import { Story, waitForFormUpdate } from "./_Form.default";

const configlessFieldConfig = {
  stateFieldName: "configlessField",
  fieldType: "Input",
  getValue: () => "",
  getInitialValue: () => "",
  setIsDirty: () => undefined,
};

const ConfiglessField = ({ testId }: { testId: string; formconfig?: unknown }) => {
  return <div data-testid={testId}>configless child</div>;
};

export const ConfiglessChildRemovalSafety: Story = {
  render: () => {
    const [showChild, setShowChild] = React.useState(true);
    const [isValid, setIsValid] = React.useState(true);
    const [changeCount, setChangeCount] = React.useState(0);

    return (
      <div data-testid="configless-removal-story">
        <button type="button" data-testid="configless-toggle" onClick={() => setShowChild((prev) => !prev)}>
          toggle
        </button>
        <Form
          onChange={(status) => {
            setIsValid(status.isValid);
            setChangeCount((prev) => prev + 1);
          }}
        >
          {showChild ? <ConfiglessField testId="configless-child" formconfig={configlessFieldConfig as any} /> : null}
        </Form>
        <div data-testid="configless-removal-debug">
          <span data-testid="configless-valid">{isValid ? "true" : "false"}</span>
          <span data-testid="configless-change-count">{changeCount}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const initialCount = Number(canvas.getByTestId("configless-change-count").textContent || "0");

    await expect(canvas.getByTestId("configless-child")).toBeInTheDocument();
    await expect(canvas.getByTestId("configless-valid")).toHaveTextContent("true");

    await user.click(canvas.getByTestId("configless-toggle"));
    await waitForFormUpdate(200);

    await expect(canvas.queryByTestId("configless-child")).not.toBeInTheDocument();
    await expect(canvas.getByTestId("configless-valid")).toHaveTextContent("true");
    await expect(Number(canvas.getByTestId("configless-change-count").textContent || "0")).toBeGreaterThanOrEqual(initialCount);
  },
};
