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
