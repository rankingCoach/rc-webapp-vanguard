import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@test-utils/test-utils';
import React, { useState } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { TreeItem } from './TreeItem';
import { TreeView, TreeViewProps } from './TreeView';

const Tree = (props: Partial<TreeViewProps>) => (
  <TreeView aria-label="files" {...props}>
    <TreeItem nodeId="root" label="Root">
      <TreeItem nodeId="a" label="A">
        <TreeItem nodeId="a1" label="A1" />
      </TreeItem>
      <TreeItem nodeId="b" label="B" disabled />
    </TreeItem>
    <TreeItem nodeId="leaf" label="Leaf" icon={<span data-testid="leaf-icon" />} />
  </TreeView>
);

const Controlled = () => {
  const [expanded, setExpanded] = useState<string[]>([]);
  return <Tree expanded={expanded} onNodeToggle={(_event, nodeIds) => setExpanded(nodeIds)} />;
};

const item = (label: string) => screen.getByTestId(`tree-item-${label === 'Leaf' ? 'leaf' : label.toLowerCase()}`);

describe('TreeView', () => {
  test('renders a tree with only root items while collapsed', () => {
    render(<Tree />);
    expect(screen.getByRole('tree', { name: 'files' })).toBeInTheDocument();
    expect(screen.getAllByRole('treeitem')).toHaveLength(2);
    expect(item('Root')).toHaveAttribute('aria-expanded', 'false');
    expect(item('Leaf')).not.toHaveAttribute('aria-expanded');
    expect(screen.getByTestId('leaf-icon')).toBeInTheDocument();
  });

  test('defaultExpanded opens nested groups (uncontrolled) and clicking toggles them', () => {
    const onNodeToggle = vi.fn();
    render(<Tree defaultExpanded={['root']} onNodeToggle={onNodeToggle} />);
    expect(screen.getByRole('group')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('tree-item-a-content'));
    expect(onNodeToggle).toHaveBeenLastCalledWith(expect.anything(), ['a', 'root']);
    expect(screen.getByText('A1')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('tree-item-a-content'));
    expect(onNodeToggle).toHaveBeenLastCalledWith(expect.anything(), ['root']);
    expect(screen.queryByText('A1')).not.toBeInTheDocument();
  });

  test('controlled expanded only changes through onNodeToggle', () => {
    render(<Controlled />);
    fireEvent.click(screen.getByTestId('tree-item-root-content'));
    expect(item('Root')).toHaveAttribute('aria-expanded', 'true');

    render(<Tree expanded={[]} />);
    fireEvent.click(screen.getAllByTestId('tree-item-root-content')[1]);
    expect(screen.getAllByTestId('tree-item-root')[1]).toHaveAttribute('aria-expanded', 'false');
  });

  test('selection: controlled selected marks the node, clicks call onNodeSelect', () => {
    const onNodeSelect = vi.fn();
    render(<Tree selected="leaf" onNodeSelect={onNodeSelect} />);
    expect(item('Leaf')).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByTestId('tree-item-root-content'));
    expect(onNodeSelect).toHaveBeenCalledWith(expect.anything(), 'root');
    expect(item('Leaf')).toHaveAttribute('aria-selected', 'true');
  });

  test('disabled nodes neither select nor toggle', () => {
    const onNodeSelect = vi.fn();
    render(<Tree defaultExpanded={['root']} onNodeSelect={onNodeSelect} />);
    fireEvent.click(screen.getByTestId('tree-item-b-content'));
    expect(onNodeSelect).not.toHaveBeenCalled();
    expect(item('B')).toHaveAttribute('aria-disabled', 'true');
  });

  test('a label click handler that stops propagation does not toggle (UnitTestSideBar pattern)', () => {
    const onNodeToggle = vi.fn();
    render(
      <TreeView onNodeToggle={onNodeToggle}>
        <TreeItem
          nodeId="p"
          label={
            <span data-testid="stop" onClick={(event) => event.stopPropagation()}>
              P
            </span>
          }
        >
          <TreeItem nodeId="c" label="C" />
        </TreeItem>
      </TreeView>,
    );
    fireEvent.click(screen.getByTestId('stop'));
    expect(onNodeToggle).not.toHaveBeenCalled();
  });

  test('per-item expand/collapse icons and labelClassName', () => {
    render(
      <TreeView defaultExpanded={['p']}>
        <TreeItem
          nodeId="p"
          label="P"
          labelClassName="custom-label"
          expandIcon={<span data-testid="plus" />}
          collapseIcon={<span data-testid="minus" />}
        >
          <TreeItem nodeId="c" label="C" />
        </TreeItem>
      </TreeView>,
    );
    expect(screen.getByTestId('minus')).toBeInTheDocument();
    expect(screen.getByText('P')).toHaveClass('custom-label');
    fireEvent.click(screen.getByTestId('tree-item-p-content'));
    expect(screen.getByTestId('plus')).toBeInTheDocument();
  });

  test('keyboard: arrows move focus and expand/collapse, Enter selects and toggles', () => {
    const onNodeSelect = vi.fn();
    render(<Tree onNodeSelect={onNodeSelect} />);
    const tree = screen.getByRole('tree');
    fireEvent.focus(tree);
    expect(item('Root')).toHaveFocus();
    fireEvent.keyDown(item('Root'), { key: 'ArrowRight' });
    expect(item('Root')).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(item('Root'), { key: 'ArrowDown' });
    expect(item('A')).toHaveFocus();
    fireEvent.keyDown(item('A'), { key: 'Enter' });
    expect(onNodeSelect).toHaveBeenCalledWith(expect.anything(), 'a');
    expect(item('A')).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(item('A'), { key: 'ArrowLeft' });
    expect(item('A')).toHaveAttribute('aria-expanded', 'false');
    fireEvent.keyDown(item('A'), { key: 'ArrowLeft' });
    expect(item('Root')).toHaveFocus();
    fireEvent.keyDown(item('Root'), { key: 'End' });
    expect(item('Leaf')).toHaveFocus();
    expect(item('Leaf')).toHaveAttribute('tabindex', '0');
  });
});
