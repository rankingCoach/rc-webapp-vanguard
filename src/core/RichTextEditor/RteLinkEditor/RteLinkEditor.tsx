import { flexGrow1 } from '@globalStyles';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Input } from '@vanguard/Input/Input';
import { sanitizeUrl, useHyperlinkEditor, validateUrl } from 'lexical-toolkit';
import React, { Dispatch, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { getFloatingLinkEditorPosition } from './getLinkEditorPosition';
import styles from './RteLinkEditor.module.scss';

type RteLinkEditorProps = {
  anchorElem: HTMLElement;
  isLinkEditMode: boolean;
  setIsLinkEditMode: Dispatch<boolean>;
};

export const RteLinkEditor = (props: RteLinkEditorProps) => {
  const { anchorElem, isLinkEditMode, setIsLinkEditMode } = props;

  const [editor] = useLexicalComposerContext();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [editedLinkUrl, setEditedLinkUrl] = useState('');

  const { currentNodeIsLink, linkUrl, dispatchLinkSubmission, dispatchLinkRemoval, linkNodeRect } = useHyperlinkEditor({
    editor: editor,
    anchorElem: anchorElem,
  });

  useEffect(() => {
    if (isLinkEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLinkEditMode, currentNodeIsLink]);

  useEffect(() => {
    if (!currentNodeIsLink) {
      setEditedLinkUrl('');
      setIsLinkEditMode(false);
    }
  }, [currentNodeIsLink]);

  useEffect(() => {
    if (!editorRef.current) {
      console.error('RichTextEditorLink: no editor ref');
      return;
    }

    const editorElem = editorRef.current;
    if (currentNodeIsLink) {
      if (linkNodeRect) {
        const position = getFloatingLinkEditorPosition({
          linkNodeRect: linkNodeRect,
          anchorElem: anchorElem,
          floatingElem: editorElem,
        });
        editorElem.style.opacity = '1';
        editorElem.style.transform = `translate(${position.x}px, ${position.y}px)`;
      } else {
        console.error('RichTextEditorLink: no link node position');
      }
    } else {
      editorElem.style.opacity = '0';
      editorElem.style.transform = 'translate(-10000px, -10000px)';
    }
  }, [linkNodeRect, currentNodeIsLink]);

  const handleLinkSubmission = () => {
    const url = sanitizeUrl(editedLinkUrl);
    const urlIsValid = validateUrl(url);

    if (editedLinkUrl && urlIsValid) {
      dispatchLinkSubmission({ url: url });
    } else {
      // @todo Show Snackbar with error
      dispatchLinkRemoval();
    }
    setIsLinkEditMode(false);
  };

  /**
   * Return view
   * ---
   */
  return createPortal(
    <div ref={editorRef} className={styles.container}>
      {isLinkEditMode ? (
        <div className={styles.row}>
          <Input
            inputRef={inputRef}
            size={'small'}
            value={editedLinkUrl}
            className={flexGrow1}
            placeholder={'https://www.google.com/'}
            onChange={(event) => {
              setEditedLinkUrl(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleLinkSubmission();
              } else if (event.key === 'Escape') {
                event.preventDefault();
                setIsLinkEditMode(false);
              }
            }}
          />
          <div className={styles.row}>
            <Button
              size={ButtonSizes.medium}
              iconLeft={IconNames.check}
              type={ButtonTypes.default}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                handleLinkSubmission();
              }}
            />

            <Button
              size={ButtonSizes.medium}
              iconLeft={IconNames.close}
              type={ButtonTypes.default}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setIsLinkEditMode(false);
              }}
            />
          </div>
        </div>
      ) : (
        <div className={styles.row}>
          <div className={styles.link}>
            <a href={sanitizeUrl(linkUrl)} target="_blank" rel="noopener noreferrer" className={styles.a}>
              {linkUrl}
            </a>
          </div>
          <Button
            size={ButtonSizes.medium}
            iconLeft={IconNames.edit}
            type={ButtonTypes.default}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setEditedLinkUrl(linkUrl);
              setIsLinkEditMode(true);
            }}
          />
          <Button
            size={ButtonSizes.medium}
            iconLeft={IconNames.trash}
            type={ButtonTypes.default}
            onMouseDown={(event) => event.preventDefault()}
            onClick={dispatchLinkRemoval}
          />
        </div>
      )}
    </div>,
    anchorElem,
  );
};
