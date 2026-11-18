# EditModal

Reusable modal tailored for editing a resource with form controls and actions.

- Kind: component
- Import: `import { EditModal } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/CustomModals/EditModal/EditModal.tsx`
- Keywords: modal, edit, form, update, dialog, save, cancel

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `cancelCallback` | `() => void` | yes |  |
| `children` | `React.ReactNode` | yes |  |
| `close` | `(response?: ModalResponse<any>) => void` | yes |  |
| `closeOnError` | `boolean` | no |  |
| `closeOnSave` | `boolean` | no |  |
| `positiveBtnText` | `string` | no |  |
| `requestGotError` | `boolean` | no |  |
| `savable` | `boolean` | yes |  |
| `saveCallback` | `() => void` | yes |  |
| `savingInProgress` | `boolean` | yes |  |
| `showFooterTopBorder` | `boolean` | no |  |
| `showPositiveBtnIcon` | `boolean` | no |  |
| `testId` | `string` | no |  |
| `title` | `string` | yes |  |
| `titleReplacements` | `TextReplacements` | no |  |
| `width` | `string` | no |  |
