import { calculateMarginForReactContainer } from '@vanguard/ActionBar/ActionBar.helpers';
import { ActionBarTemplateType } from '@vanguard/ActionBar/ActionBarRoot/ActionBarRoot';
import { ActionBarFooter } from '@vanguard/ActionBar/ActionBarTemplates/ActionBarFooter/ActionBarFooter';
import { ActionBarMessage } from '@vanguard/ActionBar/ActionBarTemplates/ActionBarMessage/ActionBarMessage';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import styles from './ActionBar.module.scss';

const ChildrenRender = (templateProps: ActionBarProps['templateProps']) => {
    if (!templateProps) {
      return null;
    }

    const { template } = templateProps;

    if (template === 'message') {
      return <ActionBarMessage {...templateProps} />;
    }

    if (template === 'footer') {
      return <ActionBarFooter {...templateProps} />;
    }

    console.error('Error | ActionBar | Invalid template ', template, templateProps);
    return null;
  };


export type ActionBarProps = {
  show: boolean;
  templateProps?: ActionBarTemplateType;
};

export const ActionBar = (props: ActionBarProps) => {
  const { show, templateProps } = props;
  const actionBarRef = useRef<HTMLDivElement | null>(null);

  /**
   * Styles | Size & Position
   * ---
   * The "Unpublished Bar" positioning has to be aligned to the Business Profile Page
   * Due to Responsive Design, this can be achieved only with JS
   */
  const [pageDOMRect, setPageDOMRect] = useState<DOMRect>();

  function updateSize() {
    const reactContainer = document.getElementsByClassName('react-container')[0] as HTMLDivElement | undefined;
    if (reactContainer !== undefined) {
      setPageDOMRect(reactContainer.getBoundingClientRect());

      const actionBarHeight = actionBarRef?.current?.clientHeight ?? 0;
      reactContainer.style.marginBottom = calculateMarginForReactContainer(actionBarHeight);
    } else {
      console.error('ERROR | ActionBar | React container not found on the page');
    }
  }

  useLayoutEffect(() => {
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (show && actionBarRef && actionBarRef.current) {
      updateSize();
    }
  }, [actionBarRef, show]);

  const getPositionStyles = (): React.CSSProperties => {
    return { left: pageDOMRect?.left, width: pageDOMRect?.width };
  };

  /**
   * Get Children
   */
  const Children = ChildrenRender.bind(null, templateProps);

  /**
   * Return view
   * ---
   */
  return (
    <ComponentContainer
      innerRef={actionBarRef}
      testId={'ActionBar_Container'}
      className={styles.container}
      style={{
        transform: show ? 'translateY(0)' : 'translateY(100%)',
        ...getPositionStyles(),
      }}
    >
      {<Children />}
    </ComponentContainer>
  );
};
