---
name: vanguard
description: Build UI with @rankingcoach/vanguard, rankingCoach's React 19 component library. Use when writing or changing React code that imports from @rankingcoach/vanguard (Text, Button, Input, Select, Modal, Form, useFormStore, ...), when styling or testing Vanguard components, or when building a form with Vanguard inputs.
---

# Vanguard

The package ships its own docs next to this file, matching the installed version:

1. `node_modules/@rankingcoach/vanguard/docs/llms.txt`: index of every export with a one-line summary. Read it first.
2. `node_modules/@rankingcoach/vanguard/docs/components/<Name>.md`: props, DOM contract (data-slot parts), WordPress availability and examples for one export.

## Imports

1. Named imports from the package root only: `import { Button, Text, Input } from '@rankingcoach/vanguard';`.
2. Load the stylesheet once per app: `import '@rankingcoach/vanguard/style.css';`.
3. Only these deep paths are supported: `@rankingcoach/vanguard/dist/*` (e.g. the OverlayStacking service file). Never import from `src/` or other internals.

## Stylesheet order

Vanguard's CSS wins or loses equal-specificity ties by position. Keep: app entry CSS, then `@rankingcoach/vanguard/style.css`, then lazy route CSS. A dynamic `import('@rankingcoach/vanguard/style.css')` right after the first render gives that order. Do not move it into a route chunk or bundle it ahead of the entry CSS.

## Text and copy

1. All user-facing copy goes through `<Text>`; it translates by default (`translate={false}` for literal text) and takes `type` (`TextTypes`), `fontWeight` (`FontWeights`), `color` (a `--fn-*` token name).
2. Highlighting search terms: `<Text highlightWords={['seo']} highlightMode="background">`. `TextHighlighted` is a deprecated wrapper of the same thing.
3. Colours, spacing and radii come from `--fn-*` CSS custom properties; do not hard-code hex values.

## Styling and testing: the DOM contract

1. Rebuilt components mark their elements with `data-slot` (kebab-case: `switch`, `switch-input`, `data-table-row`) and expose state on the same element: booleans present-empty or absent (`data-disabled`, `data-selected`, `data-checked`, `data-open`, `data-loading`), enums as values (`data-size`, `data-variant`, `data-type`).
2. Select with them: `[data-slot="status-badge"][data-variant="small"]`, `[data-slot="switch"][data-checked]`. In tests prefer roles and `testId` props; use data-slot for structure.
3. `Mui*` class names still present on some elements are a temporary compatibility alias. Do not write new selectors against them.
4. A component page that says "Internals pending rebuild" still renders MUI inside and has no final slots yet: style it through its props and `className`.

## Forms

New forms keep their values in a per-form store, no Redux slice or Provider:

```tsx
import { Form, Input, Select, useFormStore } from '@rankingcoach/vanguard';
import { useFormStatus } from 'react-dom';

type Values = { name: string; plan: string };

const SaveButton = () => {
  const { pending } = useFormStatus(); // must be a child of <Form action>
  return <button type="submit" disabled={pending}>Save</button>;
};

export const ProfileForm = () => {
  const form = useFormStore<Values, string>({
    initialValues: { name: '', plan: 'basic' },
    inputs: { name: { fieldType: 'Input', validation: { required: true } } },
    action: async (values) => {
      await save(values); // typed values, not FormData
      return 'Saved';
    },
  });
  return (
    <Form config={form.formConfig} action={form.formAction}>
      <Input label="Name" field="name" />
      <Select label="Plan" field="plan" options={plans} />
      <SaveButton />
    </Form>
  );
};
```

1. `field="<key>"` binds an input to the nearest `<Form config>` at any depth; `index` selects the element of an array field. An explicit `formconfig` prop wins over `field`.
2. An invalid form does not start the action; field errors are shown instead.
3. `form.values`, `form.setValue(key, value)`, `form.getData()`, `form.isValid()`, `form.resetForm()`, `form.getChangedData()`, `form.result` (the action's last return value).
4. Legacy path, still supported, not for new code: `useFormConfig` with a Redux slice, inputs receive `formconfig={...}`. The package still needs `react-redux` installed for it.

## Modals, drawers, snackbars

Open them imperatively through `ModalService`, `DrawerService` and `snackbarService`, or render `Modal` / `Drawer` directly; mount `ModalRoot` once near the app root. Details: `docs/components/ModalService.md`, `docs/components/Modal.md`.

## WordPress

WordPress hosts use the single bundle `dist-wordpress/index.js` with its own `vanguard.css`. Its export list is a curated subset: check "WordPress bundle: yes" on the component page before using a component there.
