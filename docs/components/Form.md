# Form

Form wrapper managing validation, submission and error handling for controlled forms.

- Kind: component
- Import: `import { Form } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/Form/Form.tsx`
- Keywords: form, submission, validation, errors, fields, component, state

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `action` | `(formData: FormData) => void \| Promise<void>` | no | F5 (new forms, with `useFormStore`): pass `form.formAction`. The children are then wrapped in a real `<form>` whose React 19 action runs it, so `useFormStatus` works in them. Without it Form renders exactly as before. |
| `children` | `React.ReactNode` | yes |  |
| `className` | `string` | no |  |
| `config` | `any` | no |  |
| `onChange` | `(status: FormStatus<T>) => void` | no |  |
| `onSubmit` | `(data: T) => void` | no |  |

## Examples

From `src/core/Form/stories/BasicChildren.story.tsx`:

```tsx
import React from "react";
import { Form } from "@vanguard/Form/Form";
import { within, expect } from "storybook/test";
import { Story } from "./_Form.default";

export const BasicChildren: Story = {
  args: {
    children: (
      <div data-testid="basic-children">
        <h3>Basic Form Content</h3>
        <p>This form has no form elements, just basic children.</p>
        <button data-testid="regular-button">Regular Button</button>
      </div>
    ),
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify children are rendered correctly
    const childrenContainer = canvas.getByTestId("basic-children");
    await expect(childrenContainer).toBeInTheDocument();

    await expect(canvas.getByText("Basic Form Content")).toBeInTheDocument();
    await expect(canvas.getByText("This form has no form elements, just basic children.")).toBeInTheDocument();

    const button = canvas.getByTestId("regular-button");
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent("Regular Button");
  },
};
```

From `src/core/Form/stories/WithClassName.story.tsx`:

```tsx
import React from "react";
import { Form } from "@vanguard/Form/Form";
import { within, expect } from "storybook/test";
import { Story } from "./_Form.default";

export const WithClassName: Story = {
  args: {
    className: "custom-form-class",
    children: <div data-testid="form-content">Form content</div>,
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify the custom class is applied
    const formContainer = canvas.getByTestId("form-content").parentElement;
    await expect(formContainer).toHaveClass("Form-container");
    await expect(formContainer).toHaveClass("custom-form-class");

    // Verify children are rendered
    await expect(canvas.getByTestId("form-content")).toBeInTheDocument();
  },
};
```
