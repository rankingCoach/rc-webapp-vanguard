# useFormStore

- Kind: hook
- Import: `import { useFormStore } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/custom-hooks/use-form-store.ts`

## Parameters

`UseFormStoreOptions<T, R>`


| Prop | Type | Required | Description |
|---|---|---|---|
| `action` | `(values: T, previous: R) => R \| Promise<R>` | no | F5: React 19 action for `<Form action={form.formAction}>`. Receives the typed values (not FormData) and the previous result and runs inside a transition; its return value becomes `result` (`useActionState`). Pending is read with `useFormStatus` inside the form. Not started (the submit is prevented) while the form is invalid, unless `validateBeforeAction` is false. |
| `initialValues` | `T` | yes | The form's values; their keys are the form's fields. |
| `inputs` | `Partial<Partial<Record<keyof T, FormConfigElement<T>>>>` | no | Per-field config (fieldType, validation, valueMappers, errorMatching, ...), as in `useFormConfig`. |
| `serverErrors` | `ValidationResultWithInfo[]` | no | Server-side errors to match against each field's `errorMatching` (re-applied whenever this changes). |
| `validateBeforeAction` | `boolean` | no |  |
| `validateOn` | `"blur" \| "change"` | no |  |
