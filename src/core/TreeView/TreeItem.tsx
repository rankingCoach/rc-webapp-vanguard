import { classNames } from '@helpers/classNames';
import React, { useContext } from 'react';

import { TreeItemDepthContext, useTreeViewContext } from './TreeView.context';
import styles from './TreeView.module.scss';

export interface TreeItemProps {
  /** Unique id of the node inside its TreeView. */
  nodeId: string;
  label: React.ReactNode;
  /** Nested TreeItems. A node with at least one child element is expandable. */
  children?: React.ReactNode;
  /** Overrides the TreeView's defaultExpandIcon for this node. */
  expandIcon?: React.ReactNode;
  /** Overrides the TreeView's defaultCollapseIcon for this node. */
  collapseIcon?: React.ReactNode;
  /** Icon shown in the icon slot regardless of state (leaf icon). Overrides defaultEndIcon. */
  icon?: React.ReactNode;
  /** Disabled nodes cannot be selected or toggled. */
  disabled?: boolean;
  className?: string;
  /** Class of the clickable row. */
  contentClassName?: string;
  /** Class of the label element (replacement for MUI `classes.label`). */
  labelClassName?: string;
  testId?: string;
}

const hasChildElements = (children: React.ReactNode) =>
  React.Children.toArray(children).some((child) => React.isValidElement(child));

export const TreeItem = (props: TreeItemProps) => {
  const {
    nodeId,
    label,
    children,
    expandIcon,
    collapseIcon,
    icon,
    disabled = false,
    className,
    contentClassName,
    labelClassName,
    testId = `tree-item-${nodeId}`,
  } = props;
  const tree = useTreeViewContext();
  const depth = useContext(TreeItemDepthContext);
  const expandable = hasChildElements(children);
  const expanded = expandable && tree.isExpanded(nodeId);
  const selected = tree.isSelected(nodeId);

  const stateIcon = expandable
    ? expanded
      ? (collapseIcon ?? tree.defaultCollapseIcon)
      : (expandIcon ?? tree.defaultExpandIcon)
    : (icon ?? tree.defaultEndIcon);

  const onContentClick = (event: React.MouseEvent) => {
    tree.focus(nodeId);
    if (disabled) return;
    if (expandable) tree.toggle(event, nodeId);
    tree.select(event, nodeId);
  };

  return (
    <li
      role="treeitem"
      data-node-id={nodeId}
      data-testid={testId}
      aria-expanded={expandable ? expanded : undefined}
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      aria-level={depth + 1}
      tabIndex={tree.isFocused(nodeId) ? 0 : -1}
      className={classNames(
        styles.item,
        selected ? styles.selected : undefined,
        disabled ? styles.disabled : undefined,
        'vanguard-tree-item',
        className,
      )}
      onFocus={(event) => {
        if (event.target === event.currentTarget) tree.focus(nodeId);
      }}
    >
      <div
        className={classNames(styles.content, 'vanguard-tree-item-content', contentClassName)}
        data-testid={`${testId}-content`}
        onClick={onContentClick}
      >
        <span className={classNames(styles.iconContainer, 'vanguard-tree-item-icon')} aria-hidden={true}>
          {stateIcon}
        </span>
        <div className={classNames(styles.label, 'vanguard-tree-item-label', labelClassName)}>{label}</div>
      </div>
      {expanded && (
        <TreeItemDepthContext.Provider value={depth + 1}>
          <ul role="group" className={classNames(styles.group, 'vanguard-tree-item-group')}>
            {children}
          </ul>
        </TreeItemDepthContext.Provider>
      )}
    </li>
  );
};
