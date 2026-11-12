import './LexicalTheme/LexicalJumpReset.scss';

import { classNames } from '@helpers/classNames';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { Keyword } from '@models/swagger/App/Domain/Common/Entities/Keywords/Keyword';
import { translationService } from '@services/translation.service';
import type { AIAssistantProps } from '@vanguard/AIAssistant/AIAssistant';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import {
  ControlledValuePlugin,
  DefaultValuePlugin,
  HyperlinkPlugin,
  KeywordPlugin,
  OnChangeContentPlugin,
  OnFocusOnBlurPlugin,
} from 'lexical-toolkit';
import React, { useEffect, useState } from 'react';

import { RTE_INITIAL_CONFIG } from './RichTextEditor.config';
import styles from './RichTextEditor.module.scss';
import { RteAiAssistant } from './RteAiAssistant/RteAiAssistant';
import { RteLinkEditor } from './RteLinkEditor/RteLinkEditor';
import { RteToolbar } from './RteToolbar/RteToolbar';

export type RichTextEditorProps = {
  id?: string;
  defaultValue?: string; // Initial value, must be HTML content
  value?: string; // Controlled state value, must be HTML content | Use to change content from outside of RTE | DO NOT USE UNLESS YOU KNOW WHAT YOU ARE DOING
  placeholder?: string;
  toolbarPortalElem?: HTMLElement;
  toolbarContainerClassName?: string;
  useAiAssistant?: boolean;
  /**
   * With `useAiAssistant`: the consumer's adjust request for the selected text (as AIAssistant's `adjustCallback`).
   * Recommended. Without it, the AI assistant adjusts through Vanguard's own built-in request. That usage is deprecated,
   * and editors show it struck through: see {@link RichTextEditor}. The built-in request will be removed in the next
   * major version (VAN-64).
   */
  aiAdjustCallback?: AIAssistantProps['adjustCallback'];
  keywords?: string[];
  keywordsToInclude?: Keyword[];
  onChange?: (html: string, plainText: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

/**
 * RichTextEditor's call signatures (VAN-64). Without the AI assistant, or with it and `aiAdjustCallback`, it matches a
 * recommended one. With the AI assistant and no `aiAdjustCallback`, the last, which is deprecated: editors show that
 * usage struck through, while it still works as before.
 */
export type RichTextEditorComponent = {
  /** A rich text editor, without the AI assistant. */
  (props: RichTextEditorProps & { useAiAssistant?: false }): React.JSX.Element;
  /** A rich text editor whose AI assistant adjusts the selection through `aiAdjustCallback`, with your own SDK. */
  (
    props: RichTextEditorProps & { aiAdjustCallback: NonNullable<RichTextEditorProps['aiAdjustCallback']> },
  ): React.JSX.Element;
  /**
   * @deprecated With `useAiAssistant`, pass `aiAdjustCallback` and make the adjust request with your own SDK. Without it,
   * the AI assistant adjusts through Vanguard's built-in request (its own SDK, with a hardcoded empty base URL: the
   * page's origin), which will be removed in the next major version (VAN-64).
   */
  (props: RichTextEditorProps): React.JSX.Element;
};

export const RichTextEditor: RichTextEditorComponent = (props: RichTextEditorProps) => {
  const {
    id = 'RichTextEditor',
    defaultValue,
    value,
    onChange,
    onFocus,
    onBlur,
    placeholder,
    toolbarPortalElem: toolbarPortalElemProp,
    toolbarContainerClassName,
    useAiAssistant = false,
    keywords,
    keywordsToInclude,
    aiAdjustCallback,
  } = props;

  const [floatingAnchor, setFloatingAnchor] = useState<HTMLElement | undefined>();
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);

  const [toolbarPortalElem, setToolbarPortalElem] = useState<HTMLElement | undefined>(toolbarPortalElemProp);
  useEffect(() => setToolbarPortalElem(toolbarPortalElemProp), [toolbarPortalElemProp]);

  /**
   * Return view
   * ---
   */
  return (
    <LexicalComposer initialConfig={RTE_INITIAL_CONFIG}>
      <ComponentContainer
        className={classNames(styles.container, 'vanguard-rich-text-editor-jump-reset notranslate')}
        testId={id}
        id={id}
      >
        <div className={styles.toolbar} ref={(el) => !toolbarPortalElem && el && setToolbarPortalElem(el)}>
          {/** Default Portal position of <RichTextEditorToolbar />, if no "toolbarPortalElem" prop */}
        </div>

        <div className={styles.editorWrapper} ref={(el) => !floatingAnchor && el && setFloatingAnchor(el)}>
          <RichTextPlugin
            ErrorBoundary={LexicalErrorBoundary as any}
            contentEditable={
              <div className={styles.scroller}>
                <div className={styles.editor}>
                  <ContentEditable className={styles.contentEditable} id="yourContentEditableElementId" />
                </div>
              </div>
            }
            placeholder={
              placeholder ? <p className={styles.placeholder}>{translationService.get(placeholder).value}</p> : null
            }
          />

          <RteToolbar
            className={toolbarContainerClassName}
            toolbarPortalElem={toolbarPortalElem ?? null}
            isLinkEditMode={isLinkEditMode}
            setIsLinkEditMode={setIsLinkEditMode}
          />

          {defaultValue ? <DefaultValuePlugin defaultValue={defaultValue} /> : <></>}
          {value ? <ControlledValuePlugin value={value} /> : <></>}
          {useAiAssistant && floatingAnchor ? (
            <RteAiAssistant
              anchorElem={floatingAnchor}
              keywordsToInclude={keywordsToInclude ?? []}
              adjustCallback={aiAdjustCallback}
            />
          ) : (
            <></>
          )}

          <HyperlinkPlugin />
          {floatingAnchor ? (
            <RteLinkEditor
              anchorElem={floatingAnchor}
              isLinkEditMode={isLinkEditMode}
              setIsLinkEditMode={setIsLinkEditMode}
            />
          ) : (
            <></>
          )}

          <OnFocusOnBlurPlugin onFocus={onFocus} onBlur={onBlur} />
          <OnChangeContentPlugin
            onHtmlChange={(html, plainText) => {
              onChange && onChange(html, plainText);
            }}
          />

          <KeywordPlugin phrases={keywords} />
          <TabIndentationPlugin />
          <HistoryPlugin />
          <ListPlugin />
          <TablePlugin />
          <HashtagPlugin />
          <AutoFocusPlugin />
        </div>
      </ComponentContainer>
    </LexicalComposer>
  );
};
