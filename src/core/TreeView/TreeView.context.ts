import React, { createContext, useContext } from 'react';

export interface TreeViewContextValue {
  isExpanded: (nodeId: string) => boolean;
  isSelected: (nodeId: string) => boolean;
  isFocused: (nodeId: string) => boolean;
  toggle: (event: React.SyntheticEvent, nodeId: string) => void;
  expand: (event: React.SyntheticEvent, nodeId: string) => void;
  collapse: (event: React.SyntheticEvent, nodeId: string) => void;
  select: (event: React.SyntheticEvent, nodeId: string) => void;
  focus: (nodeId: string) => void;
  defaultExpandIcon?: React.ReactNode;
  defaultCollapseIcon?: React.ReactNode;
  defaultEndIcon?: React.ReactNode;
}

export const TreeViewContext = createContext<TreeViewContextValue | null>(null);

export const useTreeViewContext = (): TreeViewContextValue => {
  const context = useContext(TreeViewContext);
  if (!context) throw new Error('TreeItem must be rendered inside a TreeView');
  return context;
};

/** Depth of the current TreeItem (0 for root items). */
export const TreeItemDepthContext = createContext<number>(0);
