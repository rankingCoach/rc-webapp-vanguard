# rc-webapp: what the own-core Vanguard expects from its consumer

## Stylesheet order (D15)

Vanguard's MUI-ported CSS no longer comes from emotion at runtime. It is the last block of
`@rankingcoach/vanguard/style.css` and decides equal-specificity ties by position, exactly as emotion did in the
built app. That only holds while the head order stays:

1. entry-chunk CSS (`<link>` in `app-build/index.html`),
2. `@rankingcoach/vanguard/style.css`,
3. route-chunk CSS (lazy routes, appended by Vite's preload helper on navigation).

Today `html/react/src/app/main.tsx:25` guarantees step 2: `import("@rankingcoach/vanguard/style.css")` runs after
`createRoot(...).render(...)` (line 17) and its `<link>` is appended to `<head>` during that call, after the static
entry link and before any route chunk loads. Keep that line (or an equivalent that loads the Vanguard CSS after the
entry CSS and before route CSS). Moving the import into a route chunk, or turning it into a static import that Vite
bundles into the entry CSS ahead of app modules, changes which side wins ties.

Rules that tie today are listed in `tmp/research/vanguard-ui-sdk-visual-baseline/consumer-overrides.md`
("Built CSS: entry vs lazy"). Entry-chunk rules lose ties to Vanguard; route-chunk rules win them.

Storybook dev (`.storybook/preview.tsx` imports `style.css` statically, CSS modules follow) has a different order,
so colour/border-only differences on entry-rule ties in rc-webapp stories are dev-order artefacts; Vanguard's
production-order fixtures (`src/test-utils/consumer-css.tsx`) are the reference.

## Writing a new form (F4 + F5): no Redux slice, no Provider

Existing forms (`useFormConfig` + a Redux slice) keep working unchanged. For a new form, keep the values in the
form's own store and submit with a React 19 action:

```tsx
import { Form, Input, Select, useFormStore } from '@rankingcoach/vanguard';
import { useFormStatus } from 'react-dom';

type Values = { name: string; plan: string };

const SaveButton = () => {
  const { pending } = useFormStatus(); // pending is read in a CHILD of <Form action>
  return <button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>;
};

export const ProfileForm = () => {
  const form = useFormStore<Values, string>({
    initialValues: { name: '', plan: 'basic' },
    inputs: { name: { fieldType: 'Input', validation: { required: true, minLength: 2 } } },
    action: async (values) => {
      await api.saveProfile(values); // typed values, not FormData
      return 'Saved';
    },
  });
  return (
    <Form config={form.formConfig} action={form.formAction}>
      <Section>
        <Input label="Name" field="name" />   {/* bound by name at any depth, no prop drilling */}
        <Select label="Plan" field="plan" options={plans} />
      </Section>
      <SaveButton />
      {form.result && <Text>{form.result}</Text>}
    </Form>
  );
};
```

1. `form.values` re-renders the owner on every change; `form.getData()` returns the typed values;
   `form.setValue(key, value)`, `form.resetForm()`, `form.isValid()`, `form.getChangedData()` as in useFormConfig.
2. An invalid form does not submit: the action is not started and the field errors are shown.
3. Without `action` the Form renders exactly as before (a `<div>`); with it, a real `<form>` inside the same
   container.
4. The package still needs `react-redux` installed (Vanguard's legacy form path imports it), but this path needs no
   Provider and no store.
