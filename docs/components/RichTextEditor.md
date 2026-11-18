# RichTextEditor

WYSIWYG rich text editor with formatting controls, media embedding and change handling.

- Kind: component
- Import: `import { RichTextEditor } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/RichTextEditor/RichTextEditor.tsx`
- Keywords: rich-text, editor, wysiwyg, formatting, content, media

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `aiAdjustCallback` | `AIAssistantAdjustCallback` | no | Unused without `useAiAssistant`. REQUIRED with `useAiAssistant`: the adjust request for the selected text (see `AIAssistantAdjustCallback`). |
| `defaultValue` | `string` | no |  |
| `id` | `string` | no |  |
| `keywords` | `string[]` | no |  |
| `keywordsToInclude` | `AIAssistantKeyword[]` | no | Handed to `aiAdjustCallback` for the `includeKeywords` option. |
| `onBlur` | `() => void` | no |  |
| `onChange` | `(html: string, plainText: string) => void` | no |  |
| `onFocus` | `() => void` | no |  |
| `placeholder` | `string` | no |  |
| `toolbarContainerClassName` | `string` | no |  |
| `toolbarPortalElem` | `HTMLElement` | no |  |
| `useAiAssistant` | `boolean` | no |  |
| `value` | `string` | no |  |

## Examples

From `src/core/RichTextEditor/stories/RichTextEditorWithXSSAttackStory.story.tsx`:

```tsx
import React, { useState } from 'react';
import { SbJumpPageBackground } from '@test-utils/get-storybook-decorator';
import { PageSection, PageSectionRoundedEdges } from '@vanguard/PageSection';
import { RichTextEditor } from '../RichTextEditor';
import { Story } from './_RichTextEditor.default';

export const RichTextEditorWithXSSAttackStory: Story = {
  args: {
    placeholder: 'Enter text',
    defaultValue: `<p><script>alert('danger!!!')<\/script><span>This content contains an XSS attack.</span></p>`,
  },
  render: (props) => {
    const [content, setContent] = useState(props.defaultValue);

    return (
      <SbJumpPageBackground>
        <PageSection roundedEdges={PageSectionRoundedEdges.both} title={'Rich Text Editor - XSS Attack'}>
          <RichTextEditor
            defaultValue={props.defaultValue}
            onChange={setContent}
            placeholder={props.placeholder}
          />

          <div style={{ height: '350px', overflow: 'scroll' }}>
            <h3>HTML:</h3>
            <div>{content}</div>
          </div>
        </PageSection>
      </SbJumpPageBackground>
    );
  },
};
```
