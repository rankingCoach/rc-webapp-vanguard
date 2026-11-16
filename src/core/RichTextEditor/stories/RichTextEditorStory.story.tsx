import React, { useState } from 'react';
import { SbJumpPageBackground } from '@test-utils/get-storybook-decorator';
import { PageSection, PageSectionRoundedEdges } from '@vanguard/PageSection';
import { RichTextEditor } from '../RichTextEditor';
import { Story, initialValue } from './_RichTextEditor.default';

/** Stands in for the consumer's adjust request: tags the selection so the replacement is visible. */
const storyAiAdjust = (text: string, option: string): Promise<string> =>
  new Promise((resolve) => setTimeout(() => resolve(`<p>[${option}] ${text}</p>`), 800));

export const RichTextEditorStory: Story = {
  args: {
    placeholder: 'Enter text',
    defaultValue: initialValue,
  },
  render: (props) => {
    const [content, setContent] = useState(props.defaultValue);

    return (
      <SbJumpPageBackground>
        <PageSection roundedEdges={PageSectionRoundedEdges.both} title={'Rich Text Editor'}>
          <RichTextEditor
            defaultValue={content}
            onChange={setContent}
            placeholder={props.placeholder}
            useAiAssistant={true}
            aiAdjustCallback={storyAiAdjust}
          />

          <div style={{ height: '350px', overflow: 'scroll' }}>
            <h3>HTML:</h3>
            <div>{content}</div>

            {/* <h3>Output:</h3>
            <div dangerouslySetInnerHTML={{ __html: content ?? "" }} /> */}
          </div>
        </PageSection>
      </SbJumpPageBackground>
    );
  },
};
