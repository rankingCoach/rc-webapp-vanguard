import React from 'react';
import styles from './Header.module.scss';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { FontWeights, Text, TextReplacements, TextTypes } from '@vanguard/Text/Text';
import classNames from 'classnames';

export enum HeaderTypes {
  pageHeader = 'pageHeader',
  drawerHeader = 'drawerHeader',
  compactDrawerHeader = 'compactDrawerHeader',
  bamHeader = 'bamHeader',
  bamWithPreviewHeader = 'bamWithPreviewHeader',
  sectionHeader = 'sectionHeader',
  compactSectionHeader = 'compactSectionHeader'
}
export interface HeaderProps {
  title: string;
  description?: string;
  type: HeaderTypes;
  replacements?: TextReplacements;
  testId?: string;
}

export const Header = (props: HeaderProps) => {
  const { title, description, type, replacements, testId } = props;

  const getTitleTextType = (): TextTypes => {
    switch (type) {
      case 'pageHeader':
        return TextTypes.heading3;
      case 'drawerHeader':
        return TextTypes.heading3;
      case 'compactDrawerHeader':
        return TextTypes.textIntro;
      case 'bamHeader':
        return TextTypes.heading1;
      case 'bamWithPreviewHeader':
        return TextTypes.heading2;
      case 'sectionHeader':
        return TextTypes.heading4;
      case 'compactSectionHeader':
        return TextTypes.textIntro;
      default:
        return TextTypes.heading3;
    }
  };

  const getClassName = () => {
    switch (type) {
      case 'pageHeader':
        return styles.pageHeader;
      case 'drawerHeader':
        return styles.drawerHeader;
      case 'compactDrawerHeader':
        return styles.compactDrawerHeader;
      case 'bamHeader':
        return styles.bamHeader;
      case 'bamWithPreviewHeader':
        return styles.bamWithPreviewHeader;
      case 'sectionHeader':
        return styles.sectionHeader;
      case 'compactSectionHeader':
        return styles.compactSectionHeader;
      default:
        return styles.pageHeader;
    }
  };

  const getDescriptionTextType = () => {
    switch (type) {
      case 'bamHeader':
      case 'pageHeader':
      case 'sectionHeader':
        return TextTypes.text;
      default:
        return TextTypes.textHelp;
    }
  };

  return (
    <ComponentContainer data-slot="header" data-type={type} className={classNames(styles.header, getClassName())} testId={testId + "_Header"}>
      <Text type={getTitleTextType()} fontWeight={FontWeights.bold} replacements={replacements}>
        {title}
      </Text>
      {description ? <Text type={getDescriptionTextType()} replacements={replacements}>{description}</Text> : null}
    </ComponentContainer>
  );
};
