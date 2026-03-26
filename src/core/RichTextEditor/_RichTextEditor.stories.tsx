import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { RichTextEditor } from './RichTextEditor';
import { richTextEditorStore } from './stories/bootstrap/richtexteditor.test.slice';
import { Story } from './stories/_RichTextEditor.default';
import { RichTextEditorStory as _RichTextEditorStory } from './stories/RichTextEditorStory.story';
import { RichTextEditorWithXSSAttackStory as _RichTextEditorWithXSSAttackStory } from './stories/RichTextEditorWithXSSAttackStory.story';

export const RichTextEditorStory: Story = { ..._RichTextEditorStory };
export const RichTextEditorWithXSSAttackStory: Story = { ..._RichTextEditorWithXSSAttackStory };

export default {
  ...SbDecorator({
    title: 'Vanguard/RichTextEditor',
    component: RichTextEditor,
    opts: {
      customStore: richTextEditorStore,
    },
  }),
};
