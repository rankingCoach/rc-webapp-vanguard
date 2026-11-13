import { classNames } from '@helpers/classNames';
import { Icon } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { TreeViewContext, TreeViewContextValue } from './TreeView.context';
import styles from './TreeView.module.scss';

export interface TreeViewProps {
  children?: React.ReactNode;
  /** Controlled expanded node ids. */
  expanded?: string[];
  /** Initially expanded node ids (uncontrolled). */
  defaultExpanded?: string[];
  /** Called with the full next list of expanded ids whenever a node is expanded or collapsed. */
  onNodeToggle?: (event: React.SyntheticEvent, nodeIds: string[]) => void;
  /** Controlled selected node id ('' or null = nothing selected). */
  selected?: string | null;
  /** Initially selected node id (uncontrolled). */
  defaultSelected?: string | null;
  /** Called when a node is selected by click, Enter or Space. */
  onNodeSelect?: (event: React.SyntheticEvent, nodeId: string) => void;
  /** Icon of a collapsed parent node. Default: caret-right. */
  defaultExpandIcon?: React.ReactNode;
  /** Icon of an expanded parent node. Default: caret-down. */
  defaultCollapseIcon?: React.ReactNode;
  /** Icon of a leaf node. Default: none. */
  defaultEndIcon?: React.ReactNode;
  /** Draws a vertical guide line next to every nested group. */
  showIndentGuide?: boolean;
  /** Tighter rows (24px). */
  dense?: boolean;
  className?: string;
  style?: React.CSSProperties;
  testId?: string;
  'aria-label'?: string;
}

const TREE_ITEM_SELECTOR = '[role="treeitem"]';

export const TreeView = (props: TreeViewProps) => {
  const {
    children,
    expanded: expandedProp,
    defaultExpanded = [],
    onNodeToggle,
    selected: selectedProp,
    defaultSelected = null,
    onNodeSelect,
    defaultExpandIcon = <Icon>{IconNames.caretRight}</Icon>,
    defaultCollapseIcon = <Icon>{IconNames.caretDown}</Icon>,
    defaultEndIcon,
    showIndentGuide = false,
    dense = false,
    className,
    style,
    testId = 'tree-view',
    'aria-label': ariaLabel,
  } = props;

  const rootRef = useRef<HTMLUListElement>(null);
  const [expandedState, setExpandedState] = useState<string[]>(defaultExpanded);
  const [selectedState, setSelectedState] = useState<string | null>(defaultSelected);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const expanded = expandedProp ?? expandedState;
  const selected = selectedProp !== undefined ? selectedProp : selectedState;

  const setExpanded = useCallback(
    (event: React.SyntheticEvent, next: string[]) => {
      if (expandedProp === undefined) setExpandedState(next);
      onNodeToggle?.(event, next);
    },
    [expandedProp, onNodeToggle],
  );

  const focusNode = useCallback((nodeId: string) => {
    setFocusedId(nodeId);
    const element = rootRef.current?.querySelector<HTMLElement>(`[data-node-id="${CSS.escape(nodeId)}"]`);
    element?.focus();
  }, []);

  const context = useMemo<TreeViewContextValue>(
    () => ({
      isExpanded: (nodeId) => expanded.includes(nodeId),
      isSelected: (nodeId) => !!selected && selected === nodeId,
      isFocused: (nodeId) => focusedId === nodeId,
      toggle: (event, nodeId) =>
        setExpanded(
          event,
          expanded.includes(nodeId) ? expanded.filter((id) => id !== nodeId) : [nodeId, ...expanded],
        ),
      expand: (event, nodeId) => {
        if (!expanded.includes(nodeId)) setExpanded(event, [nodeId, ...expanded]);
      },
      collapse: (event, nodeId) => {
        if (expanded.includes(nodeId)) setExpanded(event, expanded.filter((id) => id !== nodeId));
      },
      select: (event, nodeId) => {
        if (selectedProp === undefined) setSelectedState(nodeId);
        onNodeSelect?.(event, nodeId);
      },
      focus: focusNode,
      defaultExpandIcon,
      defaultCollapseIcon,
      defaultEndIcon,
    }),
    [
      expanded,
      selected,
      focusedId,
      setExpanded,
      selectedProp,
      onNodeSelect,
      focusNode,
      defaultExpandIcon,
      defaultCollapseIcon,
      defaultEndIcon,
    ],
  );

  const visibleItems = (): HTMLElement[] =>
    Array.from(rootRef.current?.querySelectorAll<HTMLElement>(TREE_ITEM_SELECTOR) ?? []);

  const moveFocus = (current: HTMLElement, offset: number | 'first' | 'last') => {
    const items = visibleItems();
    let target: HTMLElement | undefined;
    if (offset === 'first') target = items[0];
    else if (offset === 'last') target = items[items.length - 1];
    else target = items[items.indexOf(current) + offset];
    const nodeId = target?.dataset.nodeId;
    if (nodeId) focusNode(nodeId);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    const item = (event.target as HTMLElement).closest<HTMLElement>(TREE_ITEM_SELECTOR);
    const nodeId = item?.dataset.nodeId;
    if (!item || !nodeId || item !== event.target) return;
    const isExpandable = item.getAttribute('aria-expanded') !== null;
    const isOpen = item.getAttribute('aria-expanded') === 'true';
    const isDisabled = item.getAttribute('aria-disabled') === 'true';
    switch (event.key) {
      case 'ArrowDown':
        moveFocus(item, 1);
        break;
      case 'ArrowUp':
        moveFocus(item, -1);
        break;
      case 'Home':
        moveFocus(item, 'first');
        break;
      case 'End':
        moveFocus(item, 'last');
        break;
      case 'ArrowRight':
        if (isExpandable && !isOpen && !isDisabled) context.expand(event, nodeId);
        else if (isOpen) moveFocus(item, 1);
        else return;
        break;
      case 'ArrowLeft': {
        if (isOpen && !isDisabled) {
          context.collapse(event, nodeId);
          break;
        }
        const parentId = item.parentElement?.closest<HTMLElement>(TREE_ITEM_SELECTOR)?.dataset.nodeId;
        if (!parentId) return;
        focusNode(parentId);
        break;
      }
      case 'Enter':
        if (isDisabled) return;
        context.select(event, nodeId);
        if (isExpandable) context.toggle(event, nodeId);
        break;
      case ' ':
        if (isDisabled) return;
        context.select(event, nodeId);
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
  };

  const onRootFocus = (event: React.FocusEvent<HTMLUListElement>) => {
    if (event.target !== rootRef.current) return;
    const items = visibleItems();
    const target = items.find((element) => element.dataset.nodeId === selected) ?? items[0];
    const nodeId = target?.dataset.nodeId;
    if (nodeId) focusNode(nodeId);
  };

  return (
    <TreeViewContext.Provider value={context}>
      <ul
        ref={rootRef}
        role="tree"
        aria-label={ariaLabel}
        data-testid={testId}
        tabIndex={focusedId ? -1 : 0}
        className={classNames(
          styles.tree,
          showIndentGuide ? styles.indentGuide : undefined,
          dense ? styles.dense : undefined,
          'vanguard-tree-view',
          className,
        )}
        style={style}
        onKeyDown={onKeyDown}
        onFocus={onRootFocus}
      >
        {children}
      </ul>
    </TreeViewContext.Provider>
  );
};
