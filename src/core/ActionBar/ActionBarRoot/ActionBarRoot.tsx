import { PUB_SUB_EVENTS, pubSubService } from '@helpers/pub-sub';
import { ActionBar } from '@vanguard/ActionBar/ActionBar';
import { ActionBarFooterProps } from '@vanguard/ActionBar/ActionBarTemplates/ActionBarFooter/ActionBarFooter';
import { ActionBarMessageProps } from '@vanguard/ActionBar/ActionBarTemplates/ActionBarMessage/ActionBarMessage';
import React, { useEffect, useState } from 'react';

export type ActionBarTemplateType =
  | ({ template: 'message' } & ActionBarMessageProps)
  | ({ template: 'footer' } & ActionBarFooterProps);
type ActionBarStackValue = { priority: number; active: boolean; actionBarProps: ActionBarTemplateType };
type ActionBarStack = Record<string, ActionBarStackValue>;
export const ActionBarRoot = () => {
  const [stack, setStack] = useState<ActionBarStack>({});

  const [show, setShow] = useState(false);
  const [top, setTop] = useState<ActionBarStackValue>();

  /**
   * Events
   */
  useEffect(() => {
    const addMessageSubscription = pubSubService.$sub(PUB_SUB_EVENTS.reactActionBarAddMessage, ({ id, priority, props }) => {
      const newStack = { ...stack };
      newStack[id as string] = {
        priority: priority as number,
        active: true,
        actionBarProps: { template: 'message', ...(props as ActionBarMessageProps) },
      };
      setStack(newStack);
    });

    const removeMessageSubscription = pubSubService.$sub(PUB_SUB_EVENTS.reactActionBarRemoveMessage, ({ id }) => {
      const item = stack[id];
      if (item !== undefined) {
        const newStack = stack;
        newStack[id] = {
          ...newStack[id],
          active: false,
        };
        setStack(newStack);
      } else {
        console.warn('WARNING | ActionBarRoot | Trying to remove non existent Action Bar: ', id, stack);
      }
    });

    const setFooterSubscription = pubSubService.$sub(PUB_SUB_EVENTS.reactActionBarSetFooter, ({ actionBarProps, priority }) => {
      const newStack = { ...stack };
      newStack['ACTION_BAR_FOOTER'] = {
        priority: priority || 100,
        active: true,
        actionBarProps: { template: 'footer', ...(actionBarProps as ActionBarFooterProps) },
      };
      setStack(newStack);
    });

    const hideFooterSubscription = pubSubService.$sub(PUB_SUB_EVENTS.reactActionBarHideFooter, () => {
      const newStack = { ...stack };
      delete newStack['ACTION_BAR_FOOTER'];
      setStack(newStack);
    });

    return () => {
      addMessageSubscription.unsubscribe();
      removeMessageSubscription.unsubscribe();
      setFooterSubscription.unsubscribe();
      hideFooterSubscription.unsubscribe();
    };
  }, []);

  /**
   * Stack State
   */
  useEffect(() => {
    if (stack) {
      let showActionBar = false;
      let topItem: ActionBarStackValue | undefined = undefined;
      for (const key in stack) {
        const item = stack[key];
        if (item !== undefined && item.active) {
          showActionBar = true;
          if (topItem === undefined || item.priority <= topItem.priority) {
            topItem = item;
          }
        }
      }
      setTop(topItem);
      if (showActionBar) {
        setShow(true);
      } else {
        setShow(false);
      }
    }
  }, [stack]);

  /**
   * Return view
   * ---
   */
  return <ActionBar show={show} templateProps={top?.actionBarProps} />;
};
