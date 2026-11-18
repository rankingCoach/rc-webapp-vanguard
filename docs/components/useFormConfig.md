# useFormConfig

Hook that builds and manages form configuration objects for dynamic form rendering and validation.

- Kind: hook
- Import: `import { useFormConfig } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/custom-hooks/useFormConfig.ts`
- Keywords: form, hook, config, validation, dynamic, schema

## Parameters

`Options<T>`


| Prop | Type | Required | Description |
|---|---|---|---|
| `debugDisplayBeErrors` | `boolean` | no |  |
| `inputs` | `Partial<Partial<Record<keyof T, FormConfigElement<T>>>>` | yes |  |
| `reducer` | `(state: any) => any` | no |  |
| `slice` | `CaseReducerActions<any>` | no |  |
| `stateErrorsConfig` | `{ errorsStateFieldName: string; }` | no |  |
| `validateOn` | `"blur" \| "change"` | no |  |
