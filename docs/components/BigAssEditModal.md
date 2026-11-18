# BigAssEditModal

Large edit modal for complex or bulk editing tasks with advanced controls.

- Kind: component
- Import: `import { BigAssEditModal } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/CustomModals/BigAssEditModal/BigAssEditModal.tsx`
- Keywords: modal, edit, bulk, large, editor, dialog, form

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `bodyClassName` | `string` | no |  |
| `cancelCallback` | `() => void` | yes |  |
| `children` | `React.ReactNode` | yes |  |
| `close` | `(response?: ModalResponse<any>) => void` | yes |  |
| `closeOnSave` | `boolean` | no |  |
| `description` | `string` | yes |  |
| `savable` | `boolean` | yes |  |
| `saveCallback` | `() => void` | yes |  |
| `savingInProgress` | `boolean` | yes |  |
| `testId` | `string` | no |  |
| `title` | `string` | yes |  |
