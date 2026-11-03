import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Keyword } from '@models/swagger/App/Domain/Common/Entities/Keywords/Keyword';
import type { AIAssistantProps } from '@vanguard/AIAssistant/AIAssistant';
import { AIAssistantPanel } from '@vanguard/AIAssistant/AIAssistentPanel/AIAssistantPanel';
import { useAiAssistantAdjustAndGenerate } from '@vanguard/AIAssistant/useAiAssistant-GenerateAndAdjust';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { getFloatingElemPosition } from './getRteAiAssistantPosition';
import styles from './RteAiAssistant.module.scss';
import { useRteAiAssistantAi } from './useRteAiAssistant-ai';
import { useAiAssistantSelection } from './useRteAiAssistant-selection';

type RteAiAssistantProps = {
  anchorElem: HTMLElement;
  keywordsToInclude: Keyword[];
  /** The consumer's adjust request. Without it, the deprecated built-in request (see AIAssistant's `adjustCallback`). */
  adjustCallback?: AIAssistantProps['adjustCallback'];
};

export const RteAiAssistant = (props: RteAiAssistantProps) => {
  const { anchorElem, keywordsToInclude, adjustCallback } = props;

  const [editor] = useLexicalComposerContext();

  /**
   * Selection Logic (popover position, etc.)
   */
  const popoverRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<any>(null);

  const { isText, isLink, selection, updatePosition, setIsMouseOver, selectionRect } = useAiAssistantSelection({
    editor: editor,
    anchorElem: anchorElem,
  });

  const handlePositioning = useCallback(() => {
    const popoverEl = popoverRef.current;
    if (!popoverEl) {
      console.error('RteAiAssistant: popoverEl is null');
      return;
    }

    if (!selectionRect || isLink || !isText || selection.length < 40) {
      popoverEl.style.pointerEvents = 'none';
      popoverEl.style.opacity = '0';
      popoverEl.style.transform = 'translate(-10000px, -10000px)';
      return;
    }

    const position = getFloatingElemPosition(selectionRect, popoverEl, anchorElem);
    popoverEl.style.pointerEvents = 'auto';
    popoverEl.style.opacity = '1';
    popoverEl.style.transform = `translate(0px, ${position.y}px)`;
    debounceTimerRef.current = null;
  }, [selectionRect, selection, isText, isLink]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      handlePositioning();
    }, 100);

    return () => {
      clearTimeout(debounceTimerRef.current);
    };
  }, [selection]);

  /**
   * AI Assistant Logic
   */
  const [assistantValue, setAssistantValue] = useState(selection);
  const { panelStatus, setPanelStatus, generateError, onGenerateClick, onAdjustClick } =
    useAiAssistantAdjustAndGenerate({
      anchorElem: anchorElem,
      generateCallback: () => new Promise((resolve) => resolve(selection)),
      value: selection,
      setValue: setAssistantValue,
      useHtml: true,
      keywordsToInclude: keywordsToInclude,
      hasGenerateHashtagsAdjustOption: true,
      adjustCallback,
    });
  const { replaceSelection } = useRteAiAssistantAi({
    editor: editor,
  });

  useEffect(() => {
    if (assistantValue !== selection) {
      replaceSelection(assistantValue);
    }
  }, [assistantValue]);

  useEffect(() => {
    if (!isText) {
      setPanelStatus('closed');
      const popoverEl = popoverRef.current;
      if (popoverEl) {
        popoverEl.style.pointerEvents = 'none';
        popoverEl.style.opacity = '0';
        popoverEl.style.transform = 'translate(-10000px, -10000px)';
        return;
      }
      editor.getEditorState().read(() => {
        updatePosition();
      });
    } else {
      setPanelStatus('adjust');
      editor.getEditorState().read(() => {
        updatePosition();
      });
    }
  }, [isText]);

  /**
   * Return view
   * ---
   */
  return (
    <>
      {createPortal(
        <div id={'AiAssistantPlugin'} className={styles.container} ref={popoverRef}>
          <div
            className={styles.relative}
            onMouseEnter={() => setIsMouseOver(true)}
            onMouseLeave={() => setIsMouseOver(false)}
          >
            <AIAssistantPanel
              id={'AiAssistantPlugin_Assistant'}
              status={panelStatus}
              setStatus={setPanelStatus}
              useHtml={true}
              hasGenerateHashtagsAdjustOption={true}
              hasIncludeKeywordsAdjustOption={true}
              keywordsToInclude={keywordsToInclude}
              //
              generateCallback={() => new Promise((resolve) => resolve(selection))}
              onGenerateClick={onGenerateClick}
              generateError={generateError}
              onAdjustClick={onAdjustClick}
              //
              value={selection}
              setValue={setAssistantValue}
            />
          </div>
        </div>,
        anchorElem,
      )}
    </>
  );
};
