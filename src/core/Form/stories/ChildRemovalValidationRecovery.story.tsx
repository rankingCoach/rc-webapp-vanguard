import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { within, expect, userEvent } from "storybook/test";
import { Story, waitForFormUpdate } from "./_Form.default";

type ChildRemovalConfig = {
  textValue: any;
  _internalInputs: React.MutableRefObject<Record<string, { config: any }>>;
  _addInternalInput: (element: any) => void;
  _removeInternalInput: (element: any) => void;
};

const createManualFormConfig = (): ChildRemovalConfig => {
  const internalInputs = { current: {} as Record<string, { config: any }> };
  return {
    textValue: {
      fieldType: "Input",
      stateFieldName: "textValue",
      validation: {
        required: true,
      },
      getValue: () => "",
      getInitialValue: () => "",
      setIsDirty: () => undefined,
    },
    _internalInputs: internalInputs,
    _addInternalInput: (element) => {
      internalInputs.current[element.stateFieldName] = { config: element };
    },
    _removeInternalInput: (element) => {
      delete internalInputs.current[element.stateFieldName];
    },
  };
};

export const ChildRemovalValidationRecovery: Story = {
  render: () => {
    const [showInvalidChild, setShowInvalidChild] = React.useState(true);
    const [isValid, setIsValid] = React.useState(true);
    const formConfig = React.useMemo(() => createManualFormConfig(), []);

    return (
      <div data-testid="child-removal-story">
        <button type="button" data-testid="toggle-invalid-child" onClick={() => setShowInvalidChild((prev) => !prev)}>
          toggle
        </button>
        <Form
          config={formConfig as any}
          onChange={(status) => {
            setIsValid(status.isValid);
          }}
        >
          {showInvalidChild ? (
            <Input label="Transient invalid input" type="text" testId="removable-invalid-input" formconfig={formConfig.textValue} />
          ) : (
            <div data-testid="removed-placeholder">removed</div>
          )}
        </Form>
        <div data-testid="child-removal-debug">
          <span data-testid="child-removal-valid">{isValid ? "true" : "false"}</span>
          <span data-testid="child-removal-count">{Object.keys(formConfig._internalInputs.current).length}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await expect(canvas.getByTestId("child-removal-count")).toHaveTextContent("1");
    await user.click(canvas.getByTestId("toggle-invalid-child"));
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("removed-placeholder")).toBeInTheDocument();
    await expect(canvas.getByTestId("child-removal-count")).toHaveTextContent("0");
    await expect(canvas.getByTestId("child-removal-valid")).toHaveTextContent("true");

    await user.click(canvas.getByTestId("toggle-invalid-child"));
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("removable-invalid-input")).toBeInTheDocument();
    await expect(canvas.getByTestId("child-removal-count")).toHaveTextContent("1");
  },
};
