# AIAssistant

Interactive AI assistant UI component for suggestions, prompts and conversational tasks.

- Kind: component
- Import: `import { AIAssistant } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/AIAssistant/AIAssistant.tsx`
- Keywords: ai, assistant, chat, suggestions, conversation, help

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `adjustCallback` | `AIAssistantAdjustCallback` | yes | REQUIRED: the adjust request, made by the consumer (see {@link AIAssistantAdjustCallback}). |
| `anchorElem` | `HTMLElement` | yes |  |
| `children` | `React.ReactElement<unknown, string \| React.JSXElementConstructor<any>>` | no |  |
| `className` | `string` | no |  |
| `disabled` | `boolean` | no |  |
| `forbiddenAjustOptions` | `AIAssistantAdjustOptions[]` | no |  |
| `generateBtnText` | `string` | no |  |
| `generateCallback` | `(command?: string, keepShort?: boolean) => Promise<string>` | yes |  |
| `hasGenerateHashtagsAdjustOption` | `boolean` | no |  |
| `hasIncludeKeywordsAdjustOption` | `boolean` | no |  |
| `id` | `string` | no |  |
| `keepShort` | `boolean` | no |  |
| `keywordsToInclude` | `AIAssistantKeyword[]` | no |  |
| `needsCommandOnGenerate` | `boolean` | no |  |
| `onCloseCallback` | `() => void` | no |  |
| `onKeepCallback` | `() => void` | no |  |
| `onPanelStatusChange` | `(newPanelStatus: AIAssistantStatus) => void` | no |  |
| `setValue` | `(value: string) => void` | yes |  |
| `useHtml` | `boolean` | no |  |
| `value` | `string` | yes |  |
