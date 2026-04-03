import React, { useState } from 'react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { Menu, MenuItemConfig, MenuProps } from '@vanguard/Menu/Menu';
import { MenuItem } from '@vanguard/MenuItem/MenuItem';
import { Button } from '@vanguard/Button/Button';
import { IconNames } from '@vanguard/Icon/IconNames';
import { TextTypes } from '@vanguard/Text/Text';
import { StoryObj } from '@storybook/react';

export default {
  ...SbDecorator({
    title: 'vanguard/Menu',
    component: Menu,
  }),
};

type Story = StoryObj<typeof Menu>;

const baseItems: MenuItemConfig[] = [
  { key: 'edit', children: 'Edit' },
  { key: 'duplicate', children: 'Duplicate' },
  { key: 'delete', children: 'Delete', disabled: true },
  { key: 'archive', children: 'Archive' },
];

const ControlledMenu = (props: Partial<MenuProps>) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <Button onClick={(e) => setAnchorEl(e.currentTarget)}>Open Menu</Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        items={baseItems}
        {...props}
      />
    </>
  );
};

// --- Base ---

export const WithItems: Story = {
  render: () => <ControlledMenu />,
};

export const WithChildren: Story = {
  render: () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    return (
      <>
        <Button onClick={(e) => setAnchorEl(e.currentTarget)}>Open Menu</Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem>Custom Item 1</MenuItem>
          <MenuItem selected>Custom Item 2 (selected)</MenuItem>
          <MenuItem disabled>Custom Item 3 (disabled)</MenuItem>
        </Menu>
      </>
    );
  },
};

export const WithDenseItems: Story = {
  render: () => (
    <ControlledMenu
      items={baseItems.map((item) => ({ ...item, dense: true }))}
      MenuListProps={{ dense: true }}
    />
  ),
};

// --- Icons before ---

export const WithIconsBefore: Story = {
  render: () => (
    <ControlledMenu
      items={[
        { key: 'edit', children: 'Edit', icon: IconNames.edit, iconPosition: 'before' },
        { key: 'duplicate', children: 'Duplicate', icon: IconNames.duplicate, iconPosition: 'before' },
        { key: 'share', children: 'Share', icon: IconNames.share, iconPosition: 'before' },
        { key: 'delete', children: 'Delete', icon: IconNames.trash, iconPosition: 'before', disabled: true },
      ]}
    />
  ),
};

// --- Icons after ---

export const WithIconsAfter: Story = {
  render: () => (
    <ControlledMenu
      items={[
        { key: 'edit', children: 'Edit', icon: IconNames.edit, iconPosition: 'after' },
        { key: 'duplicate', children: 'Duplicate', icon: IconNames.duplicate, iconPosition: 'after' },
        { key: 'share', children: 'Share', icon: IconNames.share, iconPosition: 'after' },
        { key: 'delete', children: 'Delete', icon: IconNames.trash, iconPosition: 'after', disabled: true },
      ]}
    />
  ),
};

// --- Mixed icon positions ---

export const MixedIcons: Story = {
  render: () => (
    <ControlledMenu
      items={[
        { key: 'user', children: 'Profile', icon: IconNames.user, iconPosition: 'before' },
        { key: 'settings', children: 'Settings', icon: IconNames.settings, iconPosition: 'before' },
        { key: 'notification', children: 'Notifications', icon: IconNames.notification, iconPosition: 'before' },
        { key: 'link', children: 'Open in new tab', icon: IconNames.newTab, iconPosition: 'after' },
        { key: 'lock', children: 'Lock account', icon: IconNames.lock, iconPosition: 'after', disabled: true },
      ]}
    />
  ),
};

// --- Text type variations ---

export const WithCaptionText: Story = {
  render: () => (
    <ControlledMenu
      items={baseItems.map((item) => ({ ...item, textType: TextTypes.textCaption }))}
    />
  ),
};

export const WithHeadingText: Story = {
  render: () => (
    <ControlledMenu
      items={baseItems.map((item) => ({ ...item, textType: TextTypes.heading4 }))}
    />
  ),
};

// --- Context menus ---

export const FileContextMenu: Story = {
  render: () => (
    <ControlledMenu
      items={[
        { key: 'open', children: 'Open', icon: IconNames.document, iconPosition: 'before' },
        { key: 'download', children: 'Download', icon: IconNames.download, iconPosition: 'before' },
        { key: 'share', children: 'Share', icon: IconNames.share, iconPosition: 'before' },
        { key: 'rename', children: 'Rename', icon: IconNames.edit, iconPosition: 'before' },
        { key: 'delete', children: 'Delete', icon: IconNames.trash, iconPosition: 'before', disabled: true },
      ]}
    />
  ),
};

export const UserContextMenu: Story = {
  render: () => (
    <ControlledMenu
      items={[
        { key: 'profile', children: 'View profile', icon: IconNames.user, iconPosition: 'before' },
        { key: 'message', children: 'Send message', icon: IconNames.message, iconPosition: 'before' },
        { key: 'mail', children: 'Send email', icon: IconNames.mail, iconPosition: 'before' },
        { key: 'block', children: 'Block user', icon: IconNames.lock, iconPosition: 'before', disabled: true },
      ]}
    />
  ),
};

// --- Size variations ---

export const FixedWidth: Story = {
  render: () => <ControlledMenu width={300} />,
};

export const NarrowWidth: Story = {
  render: () => <ControlledMenu width={120} />,
};

export const FixedHeight: Story = {
  render: () => <ControlledMenu height={100} />,
};

export const MaxWidth: Story = {
  render: () => <ControlledMenu maxWidth={150} />,
};

export const MaxHeight: Story = {
  render: () => (
    <ControlledMenu
      maxHeight={80}
      items={[
        { key: 'a', children: 'Item A' },
        { key: 'b', children: 'Item B' },
        { key: 'c', children: 'Item C' },
        { key: 'd', children: 'Item D' },
        { key: 'e', children: 'Item E' },
        { key: 'f', children: 'Item F' },
      ]}
    />
  ),
};

export const FixedWidthAndHeight: Story = {
  render: () => <ControlledMenu width={600} height={400} items={[
    { key: 'edit', children: 'Edit project details', icon: IconNames.edit, iconPosition: 'before' },
    { key: 'share', children: 'Share with team', icon: IconNames.share, iconPosition: 'before' },
    { key: 'export', children: 'Export data', icon: IconNames.download, iconPosition: 'before' },
    { key: 'archive', children: 'Archive project', icon: IconNames.document, iconPosition: 'before' },
    { key: 'delete', children: 'Delete project', icon: IconNames.trash, iconPosition: 'after', disabled: true },
    { key: 'edit', children: 'Edit project details', icon: IconNames.edit, iconPosition: 'before' },
    { key: 'share', children: 'Share with team', icon: IconNames.share, iconPosition: 'before' },
    { key: 'export', children: 'Export data', icon: IconNames.download, iconPosition: 'before' },
    { key: 'archive', children: 'Archive project', icon: IconNames.document, iconPosition: 'before' },
    { key: 'delete', children: 'Delete project', icon: IconNames.trash, iconPosition: 'after', disabled: true },
    { key: 'edit', children: 'Edit project details', icon: IconNames.edit, iconPosition: 'before' },
    { key: 'share', children: 'Share with team', icon: IconNames.share, iconPosition: 'before' },
    { key: 'export', children: 'Export data', icon: IconNames.download, iconPosition: 'before' },
    { key: 'archive', children: 'Archive project', icon: IconNames.document, iconPosition: 'before' },
    { key: 'delete', children: 'Delete project', icon: IconNames.trash, iconPosition: 'after', disabled: true },
  ]} />,
};

export const WideWithIcons: Story = {
  render: () => (
    <ControlledMenu
      width={350}
      items={[
        { key: 'edit', children: 'Edit project details', icon: IconNames.edit, iconPosition: 'before' },
        { key: 'share', children: 'Share with team', icon: IconNames.share, iconPosition: 'before' },
        { key: 'export', children: 'Export data', icon: IconNames.download, iconPosition: 'before' },
        { key: 'archive', children: 'Archive project', icon: IconNames.document, iconPosition: 'before' },
        { key: 'delete', children: 'Delete project', icon: IconNames.trash, iconPosition: 'after', disabled: true },
      ]}
    />
  ),
};
