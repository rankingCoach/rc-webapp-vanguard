import { sanitizeHtml } from '@helpers/sanitize-html';
import { $isCodeHighlightNode } from '@lexical/code';
import { $generateHtmlFromNodes } from '@lexical/html';
import { $isLinkNode } from '@lexical/link';
import { mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { getDOMRangeRect, getSelectedNode } from 'lexical-toolkit';
import { useCallback, useEffect, useState } from 'react';

type UseAiAssistantSelectionParams = { anchorElem: HTMLElement; editor: LexicalEditor };

export const useAiAssistantSelection = (params: UseAiAssistantSelectionParams) => {
  const { anchorElem, editor } = params;

  const [selectionRect, setSelectionRect] = useState<DOMRect | undefined>();
  const [selection, setSelection] = useState('');
  const [isText, setIsText] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);

  /**
   * Update Position (selection range bounding rect)
   */
  const updatePosition = useCallback(() => {
    const selection = $getSelection();
    const nativeSelection = window.getSelection();
    const rootElement = editor.getRootElement();

    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);
      setSelectionRect(rangeRect);
      return;
    }

    setSelectionRect(undefined);
  }, [editor, anchorElem, isLink]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;
    const update = () => {
      editor.getEditorState().read(() => {
        updatePosition();
      });
    };
    window.addEventListener('resize', update);
    if (scrollerElem) {
      scrollerElem.addEventListener('scroll', update);
    }
    return () => {
      window.removeEventListener('resize', update);
      if (scrollerElem) {
        scrollerElem.removeEventListener('scroll', update);
      }
    };
  }, [editor, updatePosition, anchorElem]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updatePosition();
    });
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updatePosition();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updatePosition();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updatePosition]);

  /**
   * Update Selection (selected text)
   */
  const updateSelection = useCallback(() => {
    editor.getEditorState().read(() => {
      // Should not to pop up the floating toolbar when using IME input
      if (editor.isComposing()) {
        return;
      }

      if (isMouseOver) {
        // if mouse is over the AI Assistant, do not update
        return;
      }

      const selection = $getSelection();
      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();

      if (
        nativeSelection !== null &&
        (!$isRangeSelection(selection) || rootElement === null || !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false);
        return;
      }

      if (!$isRangeSelection(selection)) {
        return;
      }

      const node = getSelectedNode(selection);

      // Update links
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (!$isCodeHighlightNode(selection.anchor.getNode()) && selection.getTextContent() !== '') {
        setIsText($isTextNode(node) || $isParagraphNode(node));
      } else {
        setIsText(false);
        return;
      }

      const rawTextContent = selection.getTextContent();
      if (!selection.isCollapsed() && rawTextContent === '') {
        setIsText(false);
      }
    });
  }, [editor, isMouseOver]);

  useEffect(() => {
    document.addEventListener('selectionchange', updateSelection);
    return () => {
      document.removeEventListener('selectionchange', updateSelection);
    };
  }, [updateSelection]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updateSelection();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      }),
      editor.registerUpdateListener(() =>
        editor.update(() => {
          const selection = $getSelection();
          const html = $generateHtmlFromNodes(editor, selection);
          const sanitizedHTML = sanitizeHtml(html);
          setSelection(sanitizedHTML);
        }),
      ),
    );
  }, [editor, updateSelection]);

  /**
   * Return data
   * ---
   */
  return {
    isMouseOver: isMouseOver,
    setIsMouseOver: setIsMouseOver,
    isLink: isLink,
    isText: isText,
    selection: selection,
    updatePosition: updatePosition,
    selectionRect: selectionRect,
  };
};
